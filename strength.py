import csv

file = "data/TML-Database/2026.csv"


def opponent_strength(name):

    points = 0
    matches = 0

    with open(file, "r", encoding="utf-8") as f:

        reader = csv.DictReader(f)

        for row in reader:

            # игрок победил
            if row["winner_name"] == name:

                try:
                    rank = int(row["loser_rank"])
                except:
                    continue

                matches += 1

                if rank <= 10:
                    points += 10
                elif rank <= 50:
                    points += 7
                elif rank <= 100:
                    points += 5
                else:
                    points += 2


            # игрок проиграл
            elif row["loser_name"] == name:

                try:
                    rank = int(row["winner_rank"])
                except:
                    continue

                matches += 1

                # поражение сильному игроку тоже учитываем
                if rank <= 10:
                    points += 5
                elif rank <= 50:
                    points += 3
                else:
                    points += 1


    if matches == 0:
        return 50


    score = 50 + (points / matches) * 5

    return round(min(score,100),2)



if __name__ == "__main__":

    import sys

    player = sys.argv[1]

    print(
        player,
        "Opponent Strength:",
        opponent_strength(player)
    )
