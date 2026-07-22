import sqlite3
import os

DB_DIR = "data"
DB_PATH = os.path.join(DB_DIR, "tennis.db")


def create_database():
    os.makedirs(DB_DIR, exist_ok=True)

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Игроки
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS players (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        country TEXT,
        age INTEGER,
        height INTEGER,
        weight INTEGER,
        hand TEXT,
        backhand TEXT,
        atp_rank INTEGER,
        utr REAL,
        points INTEGER,
        favorite_surface TEXT,
        matches INTEGER DEFAULT 0,
        wins INTEGER DEFAULT 0,
        losses INTEGER DEFAULT 0,
        win_rate REAL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # Матчи
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS matches (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tournament TEXT,
        round TEXT,
        surface TEXT,
        category TEXT,
        match_date TEXT,
        match_time TEXT,
        player1 TEXT,
        player2 TEXT,
        score TEXT,
        winner TEXT,
        status TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # Личные встречи
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS h2h (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        player1 TEXT,
        player2 TEXT,
        winner TEXT,
        score TEXT,
        tournament TEXT,
        surface TEXT,
        match_date TEXT
    )
    """)

    # История прогнозов
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS predictions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        player1 TEXT,
        player2 TEXT,
        predicted_winner TEXT,
        probability REAL,
        actual_winner TEXT,
        result TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    conn.commit()
    conn.close()

    print("✅ TennisAI Database Ready")


if __name__ == "__main__":
    create_database()
