from pathlib import Path
import sys

# Thêm đường dẫn cha để import db_core.py
sys.path.append(str(Path(__file__).resolve().parents[1]))

from db_core import get_connection, execute_query

# Giữ nguyên tên hàm cũ để backward compatible
def get_db_connection():
    return get_connection()
