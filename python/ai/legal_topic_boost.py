# ai/legal_topic_boost.py
print("🔥 legal_topic_boost.py LOADED")

LABOR_KEYWORDS = [
    "người lao động", "người sử dụng lao động", "hợp đồng", "lao động",
    "thử việc", "nghỉ việc", "báo trước", "tăng ca", "lương", "mức lương",
    "phép năm", "nghỉ lễ", "nghỉ ốm", "bhxh", "bảo hiểm", "kỷ luật",
    "sa thải", "làm việc", "doanh nghiệp", "công ty"
]

def is_labor_question(q: str) -> bool:
    q = q.lower()
    return any(k in q for k in LABOR_KEYWORDS)


def get_legal_topics():
    return {
        "nghi_viec": [
            "nghỉ việc", "đơn phương", "chấm dứt", "báo trước",
            "hợp đồng lao động", "đơn xin nghỉ việc", "nghỉ trước hạn"
        ],

        "nghi_le": [
            "ngày lễ", "nghỉ lễ", "tết", "tết dương lịch", "tết âm lịch",
            "giỗ tổ", "quốc khánh", "30 tháng 4", "1 tháng 5", "lễ tết"
        ],

        "nghi_nam": [
            "nghỉ hằng năm", "nghỉ phép", "phép năm", "nghỉ năm"
        ],

        "ngung_viec": [
            "ngừng việc", "lương ngừng việc", "trả lương ngừng việc"
        ],

        "luong": [
            "tiền lương", "trả lương", "mức lương", "lương tối thiểu"
        ],

        "hop_dong": [
            "hợp đồng lao động", "ký hợp đồng", "gia hạn hợp đồng"
        ],
    }


def topic_boost(query_l: str, text_l: str) -> float:
    print("🔥 topic_boost FUNCTION ACTIVE:", query_l[:50], "->", is_labor_question(query_l))

    """
    Nếu câu hỏi *không thuộc lĩnh vực lao động* → boost âm mạnh → tránh match nhầm.
    """

    # NEW RULE: Không phải câu hỏi lao động → đẩy kết quả xuống
    if not is_labor_question(query_l):
        print("🔥 RETURNING NEGATIVE BOOST: -1.2")
        return -1.2


    score = 0.0
    topics = get_legal_topics()

    for topic_name, keywords in topics.items():

        if any(k in query_l for k in keywords):

            if any(k in text_l for k in keywords):
                score += 0.40     # match tốt

            elif any(k.split()[0] in text_l for k in keywords):
                score += 0.15     # match nhẹ
    print("🔥 topic_boost SCORE =", score, "| query =", query_l[:40])
    return score
