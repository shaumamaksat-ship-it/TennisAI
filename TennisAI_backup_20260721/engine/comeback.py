def analyze_comeback(live, players_stats):

    print("\n🔥 COMEBACK ANALYSIS")
    print("====================")

    reasons = []
    risks = []

    sets = live.get("sets", [])

    player1 = live["players"][0]
    player2 = live["players"][1]


    loser = None


    if sets:

        first = int(sets[0]["score_first"])
        second = int(sets[0]["score_second"])

        if first < second:
            loser = player1

        elif second < first:
            loser = player2


    if loser:

        print(
            "Проигрывает по сетам:",
            loser
        )


    game = live.get("game","Unknown")
    serve = live.get("serve","")


    print(
        "Текущий гейм:",
        game
    )

    print(
        "Подаёт:",
        serve
    )


    # анализ счёта гейма

    if game in [
        "30 - 40",
        "40 - 30",
        "40 - A"
    ]:

        reasons.append(
            "Критический момент гейма"
        )


    if game == "30 - 40":

        if serve == "First Player":

            risks.append(
                f"{player1} под угрозой брейка"
            )

        else:

            reasons.append(
                "Есть шанс сделать брейк"
            )



    if game == "40 - 30":

        if serve == "Second Player":

            risks.append(
                "Соперник близок к удержанию подачи"
            )

        else:

            reasons.append(
                "Можно вернуть брейк"
            )



    # статистика

    for player, stats in players_stats.items():


        second_return = stats.get(
            "2nd return points won"
        )


        if second_return:

            try:

                value = int(
                    second_return.replace("%","")
                )


                if value >= 70 and player == loser:

                    reasons.append(
                        f"{player} сильно играет на приёме второй подачи"
                    )


            except:

                pass



        last = stats.get(
            "Last 10 balls"
        )


        if last:

            try:

                value = int(last)

                if value >= 6 and player == loser:

                    reasons.append(
                        f"{player} забирает последние розыгрыши"
                    )

            except:

                pass



    print("\nПоложительные факторы:")

    if reasons:

        for r in reasons:
            print("✅", r)

    else:

        print("Нет сильных факторов")



    print("\nРиски:")

    if risks:

        for r in risks:
            print("⚠️", r)

    else:

        print("Нет серьёзных рисков")



    print("\nВывод:")


    score = len(reasons) - len(risks)


    if score >= 3:

        print("🔥 Возможен камбек")

    elif score >= 1:

        print("🟡 Камбек возможен, ситуация равная")

    else:

        print("🔴 Мало признаков для камбека")
