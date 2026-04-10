import re
from datetime import datetime
from bs4 import BeautifulSoup
from .content_cleaner import normalize_article_content

def safe_date(date_str):
    if not date_str:
        return None
    s = str(date_str).strip()
    if s.lower() in ("n/a", "-", "none", ""):
        return None

    fmts = ("%d/%m/%Y", "%Y-%m-%d", "%d-%m-%Y", "%Y/%m/%d", "%d.%m.%Y")
    for fmt in fmts:
        try:
            return datetime.strptime(s, fmt).strftime("%Y-%m-%d")
        except ValueError:
            continue

    m = re.search(r"(\d{1,2})[/-\.](\d{1,2})[/-\.](\d{4})", s)
    if m:
        d, mo, y = int(m.group(1)), int(m.group(2)), int(m.group(3))
        return f"{y:04d}-{mo:02d}-{d:02d}"

    return None


def extract_metadata(soup):
    """Lấy metadata theo đúng logic V4."""
    meta_info = {}
    info_table = soup.select_one("table.table-info, div#ctl00_Content_ThongTinVB_divThongTin")

    if info_table:
        for r in info_table.select("tr"):
            tds = r.select("td")
            if len(tds) == 2:
                meta_info[tds[0].get_text(strip=True)] = tds[1].get_text(strip=True)

    title_tag = soup.select_one("h1")
    title = title_tag.get_text(strip=True) if title_tag else meta_info.get("Tên văn bản", "Không rõ")

    if title and "số" in title.lower():
        title = re.split(r"\s*số\s*[\d/]+/qh\d+", title, flags=re.IGNORECASE)[0].strip()

    code = meta_info.get("Số hiệu", "Không rõ")
    law_type = meta_info.get("Loại văn bản", "")
    issued_date = safe_date(meta_info.get("Ngày ban hành", ""))
    effective_date = safe_date(meta_info.get("Ngày có hiệu lực", ""))

    # fallback mã số hiệu từ tiêu đề
    if code in ["", "Không rõ", None] and title_tag:
        h1_text = title_tag.get_text(" ", strip=True).lower()
        match_code = re.search(r"(?:số|so)\s*([\d/]+/qh\d+)", h1_text)
        if match_code:
            code = match_code.group(1).upper()

    # fallback ngày ban hành
    if not issued_date:
        issued_tag = soup.find("i", string=re.compile(
            r"ngày\s+\d{1,2}\s+tháng\s+\d{1,2}\s+năm\s+\d{4}", re.IGNORECASE))
        if issued_tag:
            m = re.search(r"ngày\s+(\d{1,2})\s+tháng\s+(\d{1,2})\s+năm\s+(\d{4})",
                          issued_tag.get_text())
            if m:
                issued_date = f"{int(m.group(3)):04d}-{int(m.group(2)):02d}-{int(m.group(1)):02d}"

    # fallback ngày hiệu lực
    if not effective_date:
        eff_str = soup.find(
            string=re.compile(r"hiệu lực thi hành từ ngày", re.IGNORECASE))
        if eff_str:
            m = re.search(r"ngày\s+(\d{1,2})\s+tháng\s+(\d{1,2})\s+năm\s+(\d{4})",
                          eff_str)
            if m:
                effective_date = f"{int(m.group(3)):04d}-{int(m.group(2)):02d}-{int(m.group(1)):02d}"

    return title, code, law_type, issued_date, effective_date
