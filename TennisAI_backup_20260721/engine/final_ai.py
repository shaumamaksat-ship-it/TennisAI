from live_score import get_live_score
from live_analyzer import get_match
from predictor import split_players, analyze
from comeback import analyze_comeback
from momentum import analyze_momentum


EVENT_KEY = 12148246



def calculate_probability(scores):

    adjusted = {}


    for player, score in scores.items():

        # базовый уровень, чтобы не было 0%

        adjusted[player] = score + 20


        if adjusted[player] < 5:

            adjusted[player] = 5



    total = sum(
        adjusted.values()
    )


    result = {}


    for player, value in adjusted.items():

        percent = round(
            value / total * 100
        )


        # ограничение реализма

        if percent > 95:

            percent = 95


        if percent < 5:

            percent = 5


        result[player] = percent



    return result





def final_report(event_key):


    live = get_live_score(event_key)

    match = get_match(event_key)


    if not live or not match:

        print("Матч не найден")
        return



    p1 = live["players"][0]
    p2 = live["players"][1]



    print("\n🎾 TENNIS AI FINAL REPORT")
    print("========================")


    print(
        p1,
        "vs",
        p2
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
        live.get("game")
    )


    print(
        "Подаёт:",
        live.get("serve")
    )



    players_stats = split_players(match)



    print("\n🧠 PLAYER ANALYSIS")
    print("========================")



    ai_score = {}



    for player, stats in players_stats.items():


        score, good, bad = analyze(stats)


        ai_score[player] = score



        print(
            "\n🎾",
            player
        )


        print("Плюсы:")


        for x in good[:3]:

            print(
                "✅",
                x
            )



        print("Минусы:")


        for x in bad[:3]:

            print(
                "⚠️",
                x
            )




    print("\n🔥 MOMENTUM")


    point_data = live.get(
        "points"
    )


    analyze_momentum(
        point_data,
        [
            p1,
            p2
        ]
    )



    print("\n🔥 COMEBACK")


    analyze_comeback(
        live,
        players_stats
    )



    # ===== ИТОГОВЫЙ РАСЧЁТ =====


    final_score = {}


    for p in ai_score:

        final_score[p] = ai_score[p]



    # анализ сетов

    p1_sets = 0
    p2_sets = 0


    for s in live["sets"]:


        if int(s["score_first"]) > int(s["score_second"]):

            p1_sets += 1


        elif int(s["score_second"]) > int(s["score_first"]):

            p2_sets += 1



    if p1_sets > p2_sets:

        final_score[p1] += 15


    elif p2_sets > p1_sets:

        final_score[p2] += 15




    # моментум по последним геймам

    if point_data:


        games = point_data[-10:]


        p1_momentum = 0
        p2_momentum = 0



        for g in games:


            winner = g.get(
                "serve_winner"
            )


            if winner == "First Player":

                p1_momentum += 1


            elif winner == "Second Player":

                p2_momentum += 1



        if p1_momentum > p2_momentum:

            final_score[p1] += 20


        elif p2_momentum > p1_momentum:

            final_score[p2] += 20





    print("\n========================")

    print(
        "📈 AI SCORE"
    )


    for p,v in final_score.items():

        print(
            p,
            ":",
            v
        )



    probability = calculate_probability(
        final_score
    )



    print("\n========================")

    print(
        "🧠 AI WIN PROBABILITY"
    )


    for p,v in probability.items():

        print(
            p,
            ":",
            str(v) + "%"
        )



    winner = max(
        probability,
        key=probability.get
    )


    print(
        "\n🔥 AI ПРЕИМУЩЕСТВО:",
        winner
    )


    print(
        "\nПричины:"
    )

    print(
        "✅ Статистика"
    )

    print(
        "✅ Счёт по сетам"
    )

    print(
        "✅ Momentum"
    )

    print(
        "✅ Live ситуация"
    )




if __name__ == "__main__":

    final_report(EVENT_KEY)
