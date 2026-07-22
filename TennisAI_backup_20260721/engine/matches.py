import sqlite3

DB = "data/tennis.db"


def save_match(match_time, player1, player2, tournament="Unknown"):
    conn = sqlite3.connect(DB)
    cur = conn.cursor()

    cur.execute("""
    INSERT INTO matches
    (match_time, player1, player2, tournament)
    VALUES (?, ?, ?, ?)
    """, (match_time, player1, player2, tournament))

    conn.commit()
    conn.close()


def show_matches():
    conn = sqlite3.connect(DB)
    cur = conn.cursor()

    cur.execute("SELECT * FROM matches")
    rows = cur.fetchall()

    conn.close()
    return rows


if __name__ == "__main__":
    for match in show_matches():
        print(match)
