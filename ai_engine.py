from ai_live_score import ai_score
from h2h_score import get_h2h_score


def predict_match(player1, player2, surface):

    score1 = ai_score(player1, surface)
    score2 = ai_score(player2, surface)

    h2h1, h2h2 = get_h2h_score(player1, player2, surface)

    score1 += h2h1 * 0.05
    score2 += h2h2 * 0.05

    total = score1 + score2

    if total == 0:
        return None

    prob1 = round(score1 / total * 100, 1)
    prob2 = round(score2 / total * 100, 1)

    if prob1 > prob2:
        winner = player1
    else:
        winner = player2

    return {
        "player1": player1,
        "player2": player2,
        "score1": round(score1, 2),
        "score2": round(score2, 2),
        "prob1": prob1,
        "prob2": prob2,
        "winner": winner
    }
