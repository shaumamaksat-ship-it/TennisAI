import csv
import sys
from collections import defaultdict, deque

files = [
    "data/tennis_atp/atp_matches_2015.csv",
    "data/tennis_atp/atp_matches_2016.csv",
    "data/tennis_atp/atp_matches_2017.csv",
    "data/tennis_atp/atp_matches_2018.csv"
]

players = defaultdict(lambda: {
    "matches": deque(maxlen=20),
    "wins": 0,
    "losses": 0
})

for file in files:
    with open(file, "r", encoding="latin-1") as f:
        reader = csv.DictReader(f)

        for row in reader:
            winner = row["winner_name"]
            loser = row["loser_name"]

            players[winner]["matches"].append(1)
            players[loser]["matches"].append(0)


def analyze(name):
    if name not in players:
        return None

    results = players[name]["matches"]

    if len(results) == 0:
        return None

    form = sum(results) / len(results) * 100

    return {
        "name": name,
        "matches": len(results),
        "form": round(form, 1)
    }


if len(sys.argv) < 3:
    print("Пример: python compare.py Nadal Federer")
    exit()


p1 = sys.argv[1]
p2 = sys.argv[2]


a = analyze(p1)
b = analyze(p2)


print("\n🎾 TennisAI сравнение\n")

for player in [a, b]:
    if player:
        print(
            player["name"],
            "| матчей:",
            player["matches"],
            "| форма:",
            player["form"],
            "%"
        )
    else:
        print("Игрок не найден")


if a and b:
    diff = a["form"] - b["form"]

    print("\nПрогноз по форме:")

    if diff > 0:
        print(a["name"], "имеет преимущество")
    elif diff < 0:
        print(b["name"], "имеет преимущество")
    else:
        print("Равные шансы")
