import csv
import sys
from collections import defaultdict, deque

files = [
    "data/tennis_atp/atp_matches_2015.csv",
    "data/tennis_atp/atp_matches_2016.csv",
    "data/tennis_atp/2017.csv",
    "data/tennis_atp/atp_matches_2018.csv"
]

players = defaultdict(lambda: {
    "results": deque(maxlen=20),
    "surfaces": defaultdict(lambda: {"wins": 0, "losses": 0})
})

for file in files:
    try:
        with open(file, "r", encoding="latin-1") as f:
            reader = csv.DictReader(f)

            for row in reader:
                winner = row["winner_name"]
                loser = row["loser_name"]
                surface = row["surface"]

                players[winner]["results"].append(1)
                players[loser]["results"].append(0)

                players[winner]["surfaces"][surface]["wins"] += 1
                players[loser]["surfaces"][surface]["losses"] += 1

    except FileNotFoundError:
        continue


def profile(name):
    if name not in players:
        print("Игрок не найден")
        return

    data = players[name]

    form = sum(data["results"]) / len(data["results"]) * 100

    print("\n🎾", name)
    print("----------------")
    print("Последние матчей:", len(data["results"]))
    print("Форма:", round(form, 1), "%")

    print("\nПокрытия:")

    for surface, stats in data["surfaces"].items():
        total = stats["wins"] + stats["losses"]

        if total > 0:
            percent = stats["wins"] / total * 100
            print(
                surface,
                "-",
                round(percent, 1),
                "%",
                "(",
                total,
                "матчей)"
            )


if len(sys.argv) < 2:
    print('Пример: python player.py "Rafael Nadal"')
else:
    profile(" ".join(sys.argv[1:]))
