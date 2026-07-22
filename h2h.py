import csv
import sys


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


def h2h(player1, player2, surface=None):

    p1 = 0
    p2 = 0
    total = 0

    for file in FILES:

        with open(PATH + file, "r", encoding="utf-8") as f:

            reader = csv.DictReader(f)

            for row in reader:

                if surface and row["surface"] != surface:
                    continue

                winner = row["winner_name"]
                loser = row["loser_name"]


                if winner == player1 and loser == player2:
                    p1 += 1
                    total += 1


                elif winner == player2 and loser == player1:
                    p2 += 1
                    total += 1


    print("\n🎾 H2H анализ")
    print("----------------")

    print(player1, "победы:", p1)
    print(player2, "победы:", p2)
    print("Всего матчей:", total)


    if p1 > p2:
        print("Преимущество:", player1)

    elif p2 > p1:
        print("Преимущество:", player2)

    else:
        print("Равный H2H")



if __name__ == "__main__":

    player1 = sys.argv[1]
    player2 = sys.argv[2]

    surface = None

    if len(sys.argv) > 3:
        surface = sys.argv[3]

    h2h(player1, player2, surface)
