import csv
import sys


PATH = "data/TML-Database/"


def ai_score(player, surface):

    matches = 0
    wins = 0

    surface_matches = 0
    surface_wins = 0


    with open(PATH + "2026.csv", "r", encoding="utf-8") as f:

        reader = csv.DictReader(f)

        for row in reader:

            winner = row["winner_name"]
            loser = row["loser_name"]

            if winner == player or loser == player:

                matches += 1

                if winner == player:
                    wins += 1


                if row["surface"] == surface:

                    surface_matches += 1

                    if winner == player:
                        surface_wins += 1



    if matches > 0:
        form = wins / matches * 100
    else:
        form = 50


    if surface_matches > 0:
        surface_score = surface_wins / surface_matches * 100
    else:
        surface_score = 50



    # базовый AI Score
    score = (
        form * 0.45 +
        surface_score * 0.35 +
        50 * 0.20
    )


    return round(score,2)



if __name__ == "__main__":

    player = sys.argv[1]
    surface = sys.argv[2]

    print("🎾", player)
    print("Покрытие:", surface)
    print("AI Score:", ai_score(player, surface))
