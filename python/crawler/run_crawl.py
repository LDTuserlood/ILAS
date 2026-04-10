#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import re
from .crawl_law import crawl_law_page

def main():
    print("📘 HỆ THỐNG CRAWLER ILAS — Crawl luật từ Thư viện pháp luật")
    print("Nhập URL văn bản luật cần tải (ví dụ: Bộ luật Lao động 2019)")
    url = input("➡️ URL: ").strip()

    if not url:
        print("⚠️ URL không được để trống!")
        return

    if not re.match(r"^https://thuvienphapluat\.vn/van-ban/.+", url):
        print("⚠️ URL không hợp lệ! Hãy nhập URL từ thuvienphapluat.vn")
        return

    print(f"🚀 Đang tiến hành crawl dữ liệu từ:\n{url}")

    try:
        crawl_law_page(url)
        print("\n✅ Crawl hoàn tất và đã lưu dữ liệu vào cơ sở dữ liệu ILAS.")
    except Exception as e:
        print(f"❌ Lỗi khi crawl: {e}")


if __name__ == "__main__":
    main()

