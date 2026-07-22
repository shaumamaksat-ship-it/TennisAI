import sqlite3

DB = "data/tennis.db"


def update_ranking(name, ranking):
    conn = sqlite3.connect(DB)
    cur = conn.cursor()

    cur.execute("""
        UPDATE players
        SET ranking=?
        WHERE name=?
    """, (ranking, name))

    conn.commit()
    conn.close()


def show_rankings():
    conn = sqlite3.connect(DB)
    cur = conn.cursor()

    cur.execute("""
        SELECT name, ranking
        FROM players
        ORDER BY ranking ASC
    """)

    for row in cur.fetchall():
        print(row)

    conn.close()


if __name__ == "__main__":
    update_ranking("Potter E.", 520)
    update_ranking("Savkin I.", 810)

    show_rankings()
