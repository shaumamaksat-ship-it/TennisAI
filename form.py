import csv
import glob
from collections import defaultdict, deque

matches = []

files = [
    "data/tennis_atp/atp_matches_2015.csv",
    "data/tennis_atp/atp_matches_2016.csv",
    "data/tennis_atp/atp_matches_2017.csv",
    "data/tennis_atp/atp_matches_2018.csv"
]

for file in files:
    with open(file, "r", encoding="latin-1") as f:
        reader = csv.DictReader(f)

        for row in reader:
            matches.append(row)

players = defaultdict(lambda: deque(maxlen=10))

for match in matches:
    winner = match["winner_name"]
    loser = match["loser_name"]

    players[winner].append(1)
    players[loser].append(0)

rating = []

for name, results in players.items():
    if len(results) >= 5:
        form = sum(results) / len(results) * 100
        rating.append((name, len(results), round(form, 1)))

rating.sort(key=lambda x: x[2], reverse=True)

print("ФОРМА ИГРОКОВ (последние матчи)")
print("-------------------------------")

for player in rating[:20]:
    print(
        player[0],
        "| матчей:",
        player[1],
        "| форма:",
        player[2],
        "%"
    )
