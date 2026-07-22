import sys
from ai_live_score import ai_score
from h2h_score import get_h2h_score
from live_api import get_live_matches


def live_adjust(prob1, prob2, live):

    if not live:
        return prob1, prob2

    sets = live["sets"]
    score = live["score"]

    sets1, sets2 = map(int, sets.split("-"))
    games1, games2 = map(int, score.split("-"))

    advantage = 0

    # преимущество по сетам
    advantage += (sets1 - sets2) * 12

    # преимущество по геймам
    advantage += (games1 - games2) * 3


    prob1 += advantage
    prob2 -= advantage


    prob1 = max(5, min(95, prob1))
    prob2 = 100 - prob1

    return prob1, prob2



def predict(player1, player2, surface):

    score1 = ai_score(player1, surface)
    score2 = ai_score(player2, surface)


    h2h1, h2h2 = get_h2h_score(
        player1,
        player2,
        surface
    )


    final1 = score1 * 0.95 + h2h1 * 0.05
    final2 = score2 * 0.95 + h2h2 * 0.05


    difference = abs(final1 - final2)


    if final1 > final2:
        prob1 = 50 + difference * 1.2
        winner = player1
    else:
        prob1 = 50 - difference * 1.2
        winner = player2


    prob1 = max(5, min(95, prob1))
    prob2 = 100 - prob1


    # LIVE проверка
    live_match = None

    matches = get_live_matches()

    for match in matches:

        if (
            player1.lower() in match["player1"].lower()
            and
            player2.lower() in match["player2"].lower()
        ):
            live_match = match


    prob1, prob2 = live_adjust(
        prob1,
        prob2,
        live_match
    )


    if prob1 > prob2:
        winner = player1
    else:
        winner = player2


    return f"""
🎾 TennisAI LIVE прогноз
-----------------------

LIVE Счёт:
Сет: {live_match["sets"] if live_match else "Нет данных"}
Гейм: {live_match["score"] if live_match else "Нет данных"}

{player1}: {final1:.2f}
{player2}: {final2:.2f}

Вероятность:

{player1}: {prob1:.1f}%
{player2}: {prob2:.1f}%

➡️ Преимущество: {winner}
"""


if __name__ == "__main__":

    p1 = sys.argv[1]
    p2 = sys.argv[2]
    surface = sys.argv[3]

    print(
        predict(
            p1,
            p2,
            surface
        )
    )
