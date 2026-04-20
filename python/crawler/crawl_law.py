#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import re
from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright

from .db import get_db_connection
from .content_cleaner import normalize_article_content
from .metadata_extractor import extract_metadata
from .db_inserts import insert_chapter, insert_section, insert_article
from .archive_cleanup import (
    archive_other_laws,
    archive_old_data,
    cleanup_versions
)
from .log_utils import log_step


def crawl_law_page(url: str):
    # BẮT ĐẦU
    log_step("Bắt đầu crawl luật")
    log_step(f"URL: {url}")

    # TẢI HTML
    log_step("Đang tải HTML")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto(url)
        page.wait_for_timeout(4000)
        html = page.content()
        browser.close()
    log_step("Tải HTML xong")

    soup = BeautifulSoup(html, "lxml")

    # METADATA
    log_step("Đang lấy metadata")
    title, code, law_type, issued_date, effective_date = extract_metadata(soup)
    log_step(f"Metadata: tiêu đề={title} | mã={code}")

    # NỘI DUNG
    all_p = soup.select("div#ctl00_Content_ThongTinVB_pnlDocContent p")
    log_step(f"Tìm thấy {len(all_p)} đoạn nội dung")

    # DATABASE
    conn = get_db_connection()

    try:
        with conn.cursor() as cur:
            # LƯU THÔNG TIN LUẬT + TẠO VERSION
            log_step("Đang lưu thông tin luật")

            normalized_code = re.sub(r"\s+", "", (code or "")).strip().upper()
            safe_code = normalized_code or (code or "").strip()

            # Không phụ thuộc unique index để tăng version.
            cur.execute(
                "SELECT law_id, version_number FROM laws WHERE code=%s ORDER BY law_id ASC LIMIT 1",
                (safe_code,)
            )
            row = cur.fetchone()

            if row:
                law_id = row["law_id"]
                version_number = int(row.get("version_number") or 0) + 1

                cur.execute(
                    """
                    UPDATE laws
                    SET
                        title = %s,
                        code = %s,
                        law_type = %s,
                        issued_date = %s,
                        effective_date = %s,
                        source_url = %s,
                        last_crawled_at = NOW(),
                        version_number = %s,
                        status = 'active'
                    WHERE law_id = %s
                    """,
                    (
                        title,
                        safe_code,
                        law_type,
                        issued_date,
                        effective_date,
                        url,
                        version_number,
                        law_id,
                    ),
                )
            else:
                version_number = 1
                cur.execute(
                    """
                    INSERT INTO laws
                        (title, code, law_type, issued_date, effective_date, source_url, status, version_number)
                    VALUES
                        (%s,%s,%s,%s,%s,%s,'active',%s)
                    """,
                    (title, safe_code, law_type, issued_date, effective_date, url, version_number),
                )
                law_id = cur.lastrowid

            log_step(f"Luật ID={law_id} | Phiên bản={version_number}")

            # ARCHIVE
            log_step("Đang archive các luật khác")
            # ĐÃ ĐÓNG TÍNH NĂNG NÀY ĐỂ TRÁNH LỖI VÔ HIỆU HÓA LUẬT KHÁC
            # archive_other_laws(cur, law_id)

            log_step("Đang archive dữ liệu cũ của luật")
            archive_old_data(cur, law_id)

            inserted = False

            # Newer schema requires title + created_at in law_versions.
            try:
                cur.execute(
                    """
                    INSERT INTO law_versions (
                        law_id, version_number, title, law_type,
                        issued_date, effective_date, source_url,
                        status, created_at
                    )
                    VALUES (%s,%s,%s,%s,%s,%s,%s,'active',NOW())
                    """,
                    (law_id, version_number, title, law_type, issued_date, effective_date, url)
                )
                inserted = True
            except Exception:
                pass

            if not inserted:
                try:
                    cur.execute(
                        """
                        INSERT INTO law_versions (
                            law_id, version_number, title, law_type,
                            issued_date, effective_date, source_url, status
                        )
                        VALUES (%s,%s,%s,%s,%s,%s,%s,'active')
                        """,
                        (law_id, version_number, title, law_type, issued_date, effective_date, url)
                    )
                    inserted = True
                except Exception:
                    pass

            if not inserted:
                cur.execute(
                    "INSERT INTO law_versions (law_id, version_number) VALUES (%s,%s)",
                    (law_id, version_number)
                )

            conn.commit()
            log_step("Lưu phiên bản mới xong")

            # CRAWL CHƯƠNG / MỤC / ĐIỀU
            log_step("Bắt đầu xử lý Chương - Mục - Điều")

            current_chapter_id = None
            current_section_id = None

            stats = {
                "chapters": 0,
                "sections": 0,
                "articles": 0
            }

            for i, p in enumerate(all_p):
                a = p.find("a", attrs={"name": True})
                if not a:
                    continue

                name = a["name"]

                # ------------------ CHƯƠNG ------------------
                if name.startswith("chuong_") and not name.endswith("_name"):
                    chap_num = name.replace("chuong_", "")
                    chap_text = p.get_text(" ", strip=True)

                    m = re.search(r"Chương\s+([IVXLC\d]+)", chap_text)
                    chapter_number = m.group(1) if m else chap_text

                    nxt = p.find_next_sibling("p")
                    if nxt and nxt.find("a", attrs={"name": f"chuong_{chap_num}_name"}):
                        chap_title = nxt.get_text(" ", strip=True)
                    else:
                        chap_title = re.sub(
                            r"^Chương\s+[IVXLC\d]+[.:]?\s*",
                            "",
                            chap_text
                        ).strip()

                    current_chapter_id = insert_chapter(
                        cur,
                        law_id,
                        chapter_number,
                        chap_title,
                        version_number
                    )

                    stats["chapters"] += 1
                    current_section_id = None

                    log_step(f"Đang xử lý Chương {chapter_number}: {chap_title}")

                # ------------------ MỤC ------------------
                elif name.startswith("muc_") and not name.endswith("_name"):
                    sec_text = p.get_text(" ", strip=True)

                    m = re.search(r"Mục\s+([IVXLC\d]+)", sec_text)
                    sec_num = m.group(1) if m else None

                    sec_title = re.sub(
                        r"^Mục\s+[IVXLC\d]+[.:]?\s*",
                        "",
                        sec_text
                    ).strip()

                    if current_chapter_id:
                        current_section_id = insert_section(
                            cur,
                            current_chapter_id,
                            sec_num,
                            sec_title,
                            version_number
                        )
                        stats["sections"] += 1

                # ------------------ ĐIỀU ------------------
                elif name.startswith("dieu_"):
                    art_title = p.get_text(" ", strip=True)
                    m = re.match(r"Điều\s+(\d+)", art_title)
                    art_num = m.group(1) if m else None

                    content_parts = []
                    j = i + 1
                    while j < len(all_p):
                        a2 = all_p[j].find("a", attrs={"name": True})
                        if a2 and a2["name"].startswith(
                            ("chuong_", "muc_", "dieu_")
                        ):
                            break

                        txt = all_p[j].get_text(" ", strip=True)
                        if txt:
                            content_parts.append(txt)
                        j += 1

                    raw = "\n".join(content_parts).strip()
                    art_content = normalize_article_content(raw)

                    insert_article(
                        cur,
                        law_id,
                        current_chapter_id,
                        current_section_id,
                        art_num,
                        art_title,
                        art_content,
                        version_number
                    )

                    stats["articles"] += 1

            conn.commit()

            log_step(
                f"Đã lưu xong: {stats['chapters']} chương, "
                f"{stats['sections']} mục, {stats['articles']} điều"
            )

            # CLEANUP (AN TOÀN)
            log_step("Đang dọn các phiên bản cũ")
            try:
                counts = cleanup_versions(cur)
                conn.commit()
                log_step(f"Dọn xong: {counts}")
            except Exception as e:
                conn.rollback()
                log_step(f"Cảnh báo: dọn phiên bản cũ bị lỗi (bỏ qua): {e}")

    except Exception as e:
        conn.rollback()
        log_step(f"Lỗi khi crawl luật: {e}")
        raise

    finally:
        conn.close()

    # KẾT THÚC
    log_step("Hoàn tất crawl luật")