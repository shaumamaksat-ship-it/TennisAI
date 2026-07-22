import csv
from collections import defaultdict

file = "data/tennis_atp/atp_matches_2018.csv"

players = defaultdict(lambda: {
    "wins": 0,
    "losses": 0
})

with open(file, "r", encoding="latin-1") as f:
    reader = csv.DictReader(f)

    for row in reader:
        winner = row["winner_name"]
        loser = row["loser_name"]

        players[winner]["wins"] += 1
        players[loser]["losses"] += 1


rating = []

for name, stats in players.items():
    total = stats["wins"] + stats["losses"]

    if total >= 10:
        winrate = stats["wins"] / total * 100

        rating.append(
            (name, total, round(winrate, 2))
        )


rating.sort(key=lambda x: x[2], reverse=True)


print("ТОП игроков по проценту побед:")
print("--------------------------------")

for player in rating[:20]:
    print(
        player[0],
        "Матчи:",
        player[1],
        "Победы:",
        player[2],
        "%"
    )
