import time


def get_live_match(player1, player2):

    # временно данные вручную
    match = {
        "player1": player1,
        "player2": player2,
        "sets1": 0,
        "sets2": 1,
        "game1": 2,
        "game2": 4,
        "server": player2
    }

    return match


def show_live(match):

    print("🎾 LIVE MATCH")
    print("----------------")
    print(match["player1"], match["sets1"], "-", match["sets2"], match["player2"])
    print("Счёт:", match["game1"], "-", match["game2"])
    print("Подаёт:", match["server"])
