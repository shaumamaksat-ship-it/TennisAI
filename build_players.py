import csv
import os

PATH = "data/TML-Database"

players = set()

for file in os.listdir(PATH):

    if not file.endswith(".csv"):
        continue

    if file == "ATP_Database.csv":
        continue

    if file == "ongoing_tourneys.csv":
        continue

    with open(os.path.join(PATH, file), encoding="utf-8") as f:

        reader = csv.DictReader(f)

        for row in reader:

            if "winner_name" in row:
                players.add(row["winner_name"])

            if "loser_name" in row:
                players.add(row["loser_name"])

players = sorted(players)

with open("players.csv", "w", newline="", encoding="utf-8") as f:

    writer = csv.writer(f)

    writer.writerow(["english"])

    for p in players:
        writer.writerow([p])

print("Игроков найдено:", len(players))
print("Файл players.csv создан.")
