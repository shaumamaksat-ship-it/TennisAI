import csv
from collections import defaultdict, deque

files = [
    "data/tennis_atp/atp_matches_2015.csv",
    "data/tennis_atp/atp_matches_2016.csv",
    "data/tennis_atp/atp_matches_2017.csv",
    "data/tennis_atp/atp_matches_2018.csv"
]

players = defaultdict(lambda: {
    "results": deque(maxlen=20),
    "surface": defaultdict(lambda: {"w":0,"l":0})
})

for file in files:
    with open(file, "r", encoding="latin-1") as f:
        reader = csv.DictReader(f)

        for row in reader:
            w = row["winner_name"]
            l = row["loser_name"]
            s = row["surface"]

            players[w]["results"].append(1)
            players[l]["results"].append(0)

            players[w]["surface"][s]["w"] += 1
            players[l]["surface"][s]["l"] += 1


def score(name, surface):

    if name not in players:
        return None

    data = players[name]

    # форма
    form = sum(data["results"]) / len(data["results"]) * 100

    # покрытие
    st = data["surface"][surface]

    total = st["w"] + st["l"]

    if total:
        surface_score = st["w"] / total * 100
    else:
        surface_score = 50


    # итоговый рейтинг
    ai = (
        form * 0.6 +
        surface_score * 0.4
    )

    return round(ai,2)



if __name__ == "__main__":

    import sys

    player = " ".join(sys.argv[1:-1])
    surface = sys.argv[-1]

    result = score(player, surface)

    print(
        player,
        "AI Score:",
        result,
        "на",
        surface
    )
