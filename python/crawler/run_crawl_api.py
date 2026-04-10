#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import sys
import re

# Ép UTF-8 + flush
sys.stdout.reconfigure(encoding="utf-8")
sys.stderr.reconfigure(encoding="utf-8")

from .crawl_law import crawl_law_page
from .log_utils import log_step


def main():
    if len(sys.argv) < 2:
        log_step("ERROR: Missing url argument")
        sys.exit(2)

    url = sys.argv[1].strip()

    if not url:
        log_step("ERROR: URL khong duoc de trong")
        sys.exit(2)

    if not re.match(r"^https://thuvienphapluat\.vn/van-ban/.+", url):
        log_step("ERROR: URL khong hop le (chi chap nhan thuvienphapluat.vn)")
        sys.exit(2)

    log_step(f"START crawl: {url}")

    try:
        crawl_law_page(url)
        log_step("DONE: Crawl hoan tat")
    except Exception as e:
        log_step(f"ERROR: Crawl that bai - {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
