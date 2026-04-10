def insert_chapter(cur, law_id, number, title, version_number):
    try:
        cur.execute("""
            INSERT INTO chapters (law_id, chapter_number, chapter_title,
                                  version_number, status)
            VALUES (%s,%s,%s,%s,'active')
        """, (law_id, number, title, version_number))
    except Exception as exc:
        # Some DBs require created_at without default when inserting via crawler.
        if "created_at" not in str(exc).lower():
            raise
        cur.execute("""
            INSERT INTO chapters (law_id, chapter_number, chapter_title,
                                  version_number, status, created_at)
            VALUES (%s,%s,%s,%s,'active',NOW())
        """, (law_id, number, title, version_number))
    return cur.lastrowid


def insert_section(cur, chapter_id, number, title, version_number):
    try:
        cur.execute("""
            INSERT INTO sections (chapter_id, section_number, section_title,
                                  version_number, status)
            VALUES (%s,%s,%s,%s,'active')
        """, (chapter_id, number, title, version_number))
    except Exception as exc:
        if "created_at" not in str(exc).lower():
            raise
        cur.execute("""
            INSERT INTO sections (chapter_id, section_number, section_title,
                                  version_number, status, created_at)
            VALUES (%s,%s,%s,%s,'active',NOW())
        """, (chapter_id, number, title, version_number))
    return cur.lastrowid


def insert_article(cur, law_id, chapter_id, section_id,
                   number, title, content, version_number):
    try:
        cur.execute("""
            INSERT INTO articles (
                law_id, chapter_id, section_id,
                article_number, article_title, content,
                version_number, status
            )
            VALUES (%s,%s,%s,%s,%s,%s,%s,'active')
        """, (
            law_id, chapter_id, section_id,
            number, title, content, version_number
        ))
    except Exception as exc:
        if "created_at" not in str(exc).lower():
            raise
        cur.execute("""
            INSERT INTO articles (
                law_id, chapter_id, section_id,
                article_number, article_title, content,
                version_number, status, created_at
            )
            VALUES (%s,%s,%s,%s,%s,%s,%s,'active',NOW())
        """, (
            law_id, chapter_id, section_id,
            number, title, content, version_number
        ))
