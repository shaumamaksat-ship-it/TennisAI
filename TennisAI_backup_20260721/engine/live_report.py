from live_score import get_live_score
from predictor import split_players, analyze
from live_analyzer import get_match


def report(event_key):

    match = get_match(event_key)
    live = get_live_score(event_key)


    if not match or not live:
        print("Нет данных")
        return


    print("\n🎾 TENNIS AI LIVE REPORT")
    print("========================")


    print(
        live["players"][0],
        "vs",
        live["players"][1]
    )


    print("\n📊 Счёт:")

    for s in live["sets"]:
        print(
            "Сет",
            s["score_set"],
            ":",
            s["score_first"],
            "-",
            s["score_second"]
        )


    print(
        "\n🎯 Текущий гейм:",
        live["game"]
    )


    print(
        "Подаёт:",
        live["serve"]
    )


    players = split_players(match)


    power = {}


    print("\n🧠 Анализ:")


    for player, stats in players.items():

        p, good, bad = analyze(stats)

        power[player] = p

        print("\n", player)

        for x in good[:3]:
            print("✅", x)


        for x in bad[:3]:
            print("⚠️", x)



    print("\n========================")


    winner = max(
        power,
        key=power.get
    )


    print(
        "AI преимущество:",
        winner
    )


    print(
        "\nКонтекст:",
        "игроки, счёт, подача и статистика учтены"
    )



if __name__ == "__main__":

    report(12148246)
