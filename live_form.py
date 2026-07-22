import csv
from collections import defaultdict
import os

file = "data/TML-Database/2026.csv"

players = defaultdict(list)

with open(file, "r", encoding="utf-8") as f:
    reader = csv.DictReader(f)

    for row in reader:
        winner = row["winner_name"]
        loser = row["loser_name"]

        players[winner].append(1)
        players[loser].append(0)


print("🎾 ФОРМА ИГРОКОВ 2026")
print("--------------------")

result = []

for player, matches in players.items():

    if len(matches) >= 5:
        last = matches[-10:]

        form = sum(last) / len(last) * 100

        result.append(
            (form, player, len(last))
        )


result.sort(reverse=True)

for form, player, games in result[:20]:
    print(
        f"{player} | матчей: {games} | форма: {round(form,1)}%"
    )
