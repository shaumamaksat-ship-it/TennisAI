def analyze_momentum(point_data, players):

    print("\n🔥 MOMENTUM ANALYSIS")
    print("====================")


    if not point_data:

        print("Нет данных")
        return



    games = point_data[-10:]


    first_wins = 0
    second_wins = 0


    breaks_first = 0
    breaks_second = 0



    for game in games:


        winner = game.get(
            "serve_winner"
        )


        loser = game.get(
            "serve_lost"
        )


        if winner == "First Player":

            first_wins += 1


        elif winner == "Second Player":

            second_wins += 1



        if loser == "First Player":

            breaks_second += 1


        elif loser == "Second Player":

            breaks_first += 1




    print(
        "Последние геймы:"
    )


    print(
        players[0],
        ":",
        first_wins
    )


    print(
        players[1],
        ":",
        second_wins
    )



    print(
        "\nБрейки:"
    )


    print(
        players[0],
        "сделал:",
        breaks_first
    )


    print(
        players[1],
        "сделал:",
        breaks_second
    )



    print(
        "\nВывод:"
    )


    if first_wins > second_wins:

        print(
            "🔥 Моментум у",
            players[0]
        )


    elif second_wins > first_wins:

        print(
            "🔥 Моментум у",
            players[1]
        )


    else:

        print(
            "⚖️ Равная борьба"
        )
