import csv


PATH = "data/TML-Database/"

FILES = [
    "2026.csv",
    "2025.csv",
    "2024.csv",
    "2023.csv",
    "2022.csv",
    "2021.csv",
    "2020.csv"
]


def get_h2h_score(player1, player2, surface=None):

    p1 = 50
    p2 = 50

    weight = {
        "2026.csv": 5,
        "2025.csv": 4,
        "2024.csv": 3,
        "2023.csv": 2,
        "2022.csv": 1,
        "2021.csv": 1,
        "2020.csv": 1
    }


    for file in FILES:

        with open(PATH + file, "r", encoding="utf-8") as f:

            reader = csv.DictReader(f)

            for row in reader:

                if surface and row["surface"] != surface:
                    continue

                winner = row["winner_name"]
                loser = row["loser_name"]

                if winner == player1 and loser == player2:
                    p1 += weight[file]
                    p2 -= weight[file]


                elif winner == player2 and loser == player1:
                    p2 += weight[file]
                    p1 -= weight[file]


    p1 = max(0, min(100, p1))
    p2 = max(0, min(100, p2))

    return round(p1,2), round(p2,2)
