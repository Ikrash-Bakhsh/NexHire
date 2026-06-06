import pymysql
import os
from dotenv import load_dotenv

load_dotenv()

def get_connection():
    return pymysql.connect(
        host=os.getenv("DB_HOST", "localhost"),
        port=int(os.getenv("DB_PORT", 3306)),
        user=os.getenv("DB_USER", "root"),
        password=os.getenv("DB_PASSWORD", ""),
        database=os.getenv("DB_NAME", "nexhire"),
        charset="utf8mb4",
        cursorclass=pymysql.cursors.DictCursor
    )

def test_connection():
    try:
        conn = get_connection()
        conn.close()
        return True
    except Exception as e:
        print(f"DB Error: {e}")
        return False
