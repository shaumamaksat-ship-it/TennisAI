import sqlite3

DB = "data/tennis.db"


def add_player(name):
    conn = sqlite3.connect(DB)
    cur = conn.cursor()

    cur.execute("""
        INSERT OR IGNORE INTO players(name)
        VALUES (?)
    """, (name,))

    conn.commit()
    conn.close()


def get_player(name):
    conn = sqlite3.connect(DB)
    cur = conn.cursor()

    cur.execute("""
        SELECT *
        FROM players
        WHERE name=?
    """, (name,))

    player = cur.fetchone()

    conn.close()

    return player


def all_players():
    conn = sqlite3.connect(DB)
    cur = conn.cursor()

    cur.execute("""
        SELECT id, name, atp_rank, country
        FROM players
        ORDER BY name
    """)

    rows = cur.fetchall()

    conn.close()

    return rows


if __name__ == "__main__":
    for player in all_players():
        print(player)
