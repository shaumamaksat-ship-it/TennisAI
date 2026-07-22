import sys
from ai_live_score import ai_score
from h2h_score import get_h2h_score


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
        prob2 = 100 - prob1
        winner = player1
    else:
        prob2 = 50 + difference * 1.2
        prob1 = 100 - prob2
        winner = player2


    prob1 = max(5, min(95, prob1))
    prob2 = max(5, min(95, prob2))


    result = f"""
🎾 TennisAI LIVE прогноз
-----------------------

{player1}: {final1:.2f}
{player2}: {final2:.2f}

Вероятность:

{player1}: {prob1:.1f}%
{player2}: {prob2:.1f}%

➡️ Преимущество: {winner}
"""

    return result



if __name__ == "__main__":

    p1 = sys.argv[1]
    p2 = sys.argv[2]
    surface = sys.argv[3]

    print(predict(p1,p2,surface))
