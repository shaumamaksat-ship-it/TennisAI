from h2h_score import get_h2h_score
import csv
import sys
from collections import defaultdict
from strength import opponent_strength
file = "data/TML-Database/2026.csv"


def player_data(name):

    wins = 0
    losses = 0
    ranks = []
    surfaces = defaultdict(lambda: [0,0])
    serve_points = []

    with open(file, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)

        for row in reader:

            surface = row["surface"]

            if row["winner_name"] == name:

                wins += 1

                if row["winner_rank"]:
                    ranks.append(int(row["winner_rank"]))

                surfaces[surface][0] += 1

                if row["w_ace"]:
                    serve_points.append(int(row["w_ace"]))


            elif row["loser_name"] == name:

                losses += 1

                if row["loser_rank"]:
                    ranks.append(int(row["loser_rank"]))

                surfaces[surface][1] += 1

                if row["l_ace"]:
                    serve_points.append(int(row["l_ace"]))


    return wins, losses, ranks, surfaces, serve_points



def ai_score(name, surface):

    wins, losses, ranks, surfaces, serves = player_data(name)


    total = wins + losses

    if total == 0:
        return None


    # Форма
    form = wins / total * 100


    # Рейтинг
    avg_rank = sum(ranks) / len(ranks) if ranks else 100

    rank_score = max(0, 100 - avg_rank/3)


    # Покрытие
    s_win, s_loss = surfaces[surface]

    if s_win+s_loss:
        surface_score = s_win/(s_win+s_loss)*100
    else:
        surface_score = 50


    # Подача
    serve_score = min(100, sum(serves)/len(serves)*10) if serves else 50


    strength = opponent_strength(name)

    score = (
    form*0.35 +
    rank_score*0.25 +
    surface_score*0.20 +
    strength*0.15 +
    serve_score*0.05


    score = (
    form*0.30 +
    rank_score*0.25 +
    surface_score*0.20 +
    strength*0.15 +
    serve_score*0.05 +
    h2h*0.05
)
    # коэффициент уверенности по количеству матчей
    confidence = min(1, 0.5 + total / 40)
    score = score * confidence + 50 * (1-confidence)

    return round(score,2)



if __name__ == "__main__":

    if len(sys.argv) < 3:
        print('Пример: python ai_live_score.py "Daniil Medvedev" Hard')
        exit()

    player = sys.argv[1]
    surface = sys.argv[2]

    result = ai_score(player, surface)

    print("\n🎾 TennisAI LIVE SCORE")
    print("---------------------")
    print(player)
    print("Покрытие:", surface)
    print("AI Score:", result)
