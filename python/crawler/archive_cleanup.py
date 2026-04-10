def archive_other_laws(cur, law_id):
    # 1) Archive laws khác
    cur.execute("""
        UPDATE laws SET status='archived'
        WHERE law_id != %s AND status = 'active'
    """, (law_id,))

    # 2) Archive chapters/sections/articles thuộc các laws đã archived
    cur.execute("""
        UPDATE chapters SET status='archived'
        WHERE law_id IN (SELECT law_id FROM laws WHERE status='archived')
    """)

    cur.execute("""
        UPDATE sections SET status='archived'
        WHERE chapter_id IN (
            SELECT chapter_id FROM chapters WHERE law_id IN (
                SELECT law_id FROM laws WHERE status='archived'
            )
        )
    """)

    cur.execute("""
        UPDATE articles SET status='archived'
        WHERE law_id IN (SELECT law_id FROM laws WHERE status='archived')
    """)

    # 3) Archive simplified_articles theo articles của laws archived
    cur.execute("""
        UPDATE simplified_articles SET status='archived'
        WHERE article_id IN (
            SELECT article_id FROM articles
            WHERE law_id IN (SELECT law_id FROM laws WHERE status='archived')
        )
    """)


def archive_old_data(cur, law_id):
    """
    Archive data phiên bản cũ của LUẬT HIỆN TẠI (soft).
    Lưu ý: phần này đang archive theo status='active' (không phân biệt version).
    Nếu bạn muốn archive theo version_number cụ thể, mình sẽ chỉnh theo schema của bạn.
    """
    cur.execute("""
        UPDATE articles SET status='archived'
        WHERE law_id=%s AND status='active'
    """, (law_id,))

    cur.execute("""
        UPDATE sections SET status='archived'
        WHERE chapter_id IN (
            SELECT chapter_id FROM chapters WHERE law_id=%s AND status='active'
        )
    """, (law_id,))

    cur.execute("""
        UPDATE chapters SET status='archived'
        WHERE law_id=%s AND status='active'
    """, (law_id,))

    cur.execute("""
        UPDATE simplified_articles SET status='archived'
        WHERE article_id IN (
            SELECT article_id FROM articles WHERE law_id=%s
        )
    """, (law_id,))


def cleanup_versions(cur, keep_last=5):
    """
    Giữ lại keep_last bản ghi MỚI NHẤT trong law_versions (theo crawled_at DESC),
    còn lại xóa cứng:
      - feedback (FK -> articles)
      - simplified_articles (FK -> articles)
      - articles
      - sections
      - chapters
      - law_versions
    """

    # 1) Lấy các (law_id, version_number) mới nhất cần GIỮ
    try:
        cur.execute(f"""
            SELECT law_id, version_number
            FROM law_versions
            ORDER BY crawled_at DESC
            LIMIT {int(keep_last)}
        """)
    except Exception:
        cur.execute(f"""
            SELECT law_id, version_number
            FROM law_versions
            ORDER BY created_at DESC
            LIMIT {int(keep_last)}
        """)
    recent_pairs = [(r["law_id"], r["version_number"]) for r in cur.fetchall()]

    # Nếu chưa có đủ dữ liệu thì không cần cleanup
    if not recent_pairs:
        return {
            "feedback": 0,
            "simplified_articles": 0,
            "articles": 0,
            "sections": 0,
            "chapters": 0,
            "law_versions": 0,
        }

    # 2) Temp table recent_versions
    cur.execute("DROP TEMPORARY TABLE IF EXISTS recent_versions")
    cur.execute("CREATE TEMPORARY TABLE recent_versions (law_id INT, version_number INT)")

    cur.executemany("""
        INSERT INTO recent_versions (law_id, version_number)
        VALUES (%s, %s)
    """, recent_pairs)

    def delete_and_count(query):
        cur.execute(query)
        return cur.rowcount or 0

    # 3) Xóa theo thứ tự an toàn (để không vướng FK)

    counts = {}

    # 3.1) FEEDBACK (phụ thuộc articles) -> xóa trước
    # Nếu feedback có FK theo article_id như log của bạn:
    counts["feedback"] = delete_and_count("""
        DELETE f FROM feedback f
        JOIN articles a ON f.article_id = a.article_id
        LEFT JOIN recent_versions rv
            ON a.law_id = rv.law_id AND a.version_number = rv.version_number
        WHERE rv.law_id IS NULL
    """)

    # 3.2) SIMPLIFIED_ARTICLES (phụ thuộc articles) -> xóa trước articles
    counts["simplified_articles"] = delete_and_count("""
        DELETE sa FROM simplified_articles sa
        JOIN articles a ON sa.article_id = a.article_id
        LEFT JOIN recent_versions rv
            ON a.law_id = rv.law_id AND a.version_number = rv.version_number
        WHERE rv.law_id IS NULL
    """)

    # 3.3) ARTICLES
    counts["articles"] = delete_and_count("""
        DELETE a FROM articles a
        LEFT JOIN recent_versions rv
            ON a.law_id = rv.law_id AND a.version_number = rv.version_number
        WHERE rv.law_id IS NULL
    """)

    # 3.4) SECTIONS (nếu sections có law_id + version_number thì xóa trực tiếp sẽ nhanh hơn;
    # nhưng code bạn đang join qua chapters => giữ nguyên style của bạn)
    counts["sections"] = delete_and_count("""
        DELETE s FROM sections s
        JOIN chapters c ON s.chapter_id = c.chapter_id
        LEFT JOIN recent_versions rv
            ON c.law_id = rv.law_id AND c.version_number = rv.version_number
        WHERE rv.law_id IS NULL
    """)

    # 3.5) CHAPTERS
    counts["chapters"] = delete_and_count("""
        DELETE c FROM chapters c
        LEFT JOIN recent_versions rv
            ON c.law_id = rv.law_id AND c.version_number = rv.version_number
        WHERE rv.law_id IS NULL
    """)

    # 3.6) LAW_VERSIONS
    counts["law_versions"] = delete_and_count("""
        DELETE lv FROM law_versions lv
        LEFT JOIN recent_versions rv
            ON lv.law_id = rv.law_id AND lv.version_number = rv.version_number
        WHERE rv.law_id IS NULL
    """)

    # 4) Drop temp
    cur.execute("DROP TEMPORARY TABLE recent_versions")

    return counts
