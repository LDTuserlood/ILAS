import os
import time
import queue
import logging
from contextlib import contextmanager
from pathlib import Path

import pymysql
from pymysql.cursors import DictCursor
from dotenv import load_dotenv

# ---------------------------
# Load .env (đặt tại python/.env)
# ---------------------------
ENV_PATH = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=ENV_PATH)

# ---------------------------
# Config DB & Pool
# ---------------------------
DB_HOST = "localhost"
DB_PORT = 3306
DB_USER = "root"
DB_PASS = "1292004"        # Gõ thẳng pass của bạn vào đây
DB_NAME = "ilas_db"
DB_CHARSET = "utf8mb4"

# Pool size có thể chỉnh qua .env
POOL_SIZE = int(os.getenv("DB_POOL_SIZE", 5))
POOL_GET_TIMEOUT = int(os.getenv("DB_POOL_TIMEOUT", 10))  # giây

# ---------------------------
# Logging tối giản
# ---------------------------
logging.basicConfig(
    filename="db_core.log",
    format="%(asctime)s %(levelname)s %(message)s",
    level=logging.INFO,
)
logger = logging.getLogger(__name__)

# ---------------------------
# Core: tạo/kểm tra connection
# ---------------------------
def _create_connection(autocommit=False):
    """Tạo một kết nối MySQL mới."""
    conn = pymysql.connect(
        host=DB_HOST,
        port=DB_PORT,
        user=DB_USER,
        password=DB_PASS,
        database=DB_NAME,
        charset=DB_CHARSET,
        cursorclass=DictCursor,
        autocommit=autocommit,
    )
    return conn

def _is_conn_alive(conn) -> bool:
    """Kiểm tra connection còn sống không ( tránh dùng lại conn chết )."""
    try:
        conn.ping(reconnect=False)
        return True
    except Exception:
        return False

# ---------------------------
# Pool đơn giản bằng queue.Queue
# ---------------------------
class _SimplePool:
    def __init__(self, size: int):
        self._pool = queue.Queue(maxsize=size)
        for _ in range(size):
            self._pool.put(_create_connection(autocommit=False))

    def get(self, timeout=POOL_GET_TIMEOUT):
        conn = self._pool.get(timeout=timeout)
        if not _is_conn_alive(conn):
            # Recreate if dead
            try:
                conn.close()
            except Exception:
                pass
            conn = _create_connection(autocommit=False)
        return conn

    def put(self, conn):
        try:
            if _is_conn_alive(conn):
                self._pool.put(conn, block=False)
            else:
                # drop & replace
                self._pool.put(_create_connection(autocommit=False), block=False)
        except queue.Full:
            # pool đã đầy -> đóng bớt
            try:
                conn.close()
            except Exception:
                pass

    def close_all(self):
        while not self._pool.empty():
            conn = self._pool.get_nowait()
            try:
                conn.close()
            except Exception:
                pass

# Khởi tạo pool ngay khi import
_pool = None

def _get_pool():
    global _pool
    if _pool is None:
        _pool = _SimplePool(size=max(1, POOL_SIZE))
    return _pool
def get_connection():
    return _get_pool().get()

def release_connection(conn):
    _get_pool().put(conn)
    
def execute_query(
    query: str,
    params=None,
    *,
    fetchone: bool = False,
    fetchall: bool = False,
    commit: bool = False,
):
    """
    Thực thi truy vấn an toàn.
    - SELECT: dùng fetchone/fetchall
    - INSERT/UPDATE/DELETE: đặt commit=True
    Trả về:
      * fetchall=True  -> list ([] nếu lỗi)
      * fetchone=True  -> dict ({} nếu lỗi/không có)
      * mặc định       -> None
    """
    conn = None
    t0 = time.time()
    try:
        conn = get_connection()
        with conn.cursor() as cur:
            cur.execute(query, params)
            if fetchall:
                result = cur.fetchall() or []
            elif fetchone:
                result = cur.fetchone() or {}
            else:
                result = None

            if commit:
                conn.commit()

            return result
    except Exception as e:
        if conn:
            try:
                conn.rollback()
            except Exception:
                pass
        logger.exception("DB query error: %s | params=%s", e, params)
        # Trả kiểu “an toàn” để tránh NoneType
        if fetchall:
            return []
        if fetchone:
            return {}
        return None
    finally:
        if conn:
            release_connection(conn)
        logger.info("SQL done in %.3fs", time.time() - t0)

def ping() -> bool:
    conn = None
    try:
        conn = get_connection()
        with conn.cursor() as cur:
            cur.execute("SELECT 1 AS ok;")
            row = cur.fetchone()
            return bool(row and row.get("ok") == 1)
    except Exception:
        return False
    finally:
        if conn:
            release_connection(conn)

def close_all_connections():
    if _pool:
        _pool.close_all()