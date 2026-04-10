import re

def normalize_article_content(raw_text):
    """
    Chuẩn hóa content của Điều:
    - Gộp các dòng bị xuống dòng do HTML
    - Giữ xuống dòng đúng phần pháp lý: 1., a), -, •
    """
    if not raw_text:
        return raw_text

    lines = [line.strip() for line in raw_text.split("\n") if line.strip()]
    cleaned = []
    buffer = ""

    def is_new_section(line):
        return (
            re.match(r"^\d+[\.\)]", line) or
            re.match(r"^[a-zA-Z][\.\)]", line) or
            line.startswith("- ") or
            line.startswith("•")
        )

    for line in lines:
        if is_new_section(line):
            if buffer:
                cleaned.append(buffer.strip())
            buffer = line
        else:
            buffer += " " + line

    if buffer:
        cleaned.append(buffer.strip())

    return "\n".join(cleaned)
