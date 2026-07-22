from live_analyzer import get_match


IGNORE_ZERO = [
    "Aces",
    "Double Faults",
    "Match points saved"
]


def to_percent(value):
    try:
        return int(str(value).replace("%", ""))
    except:
        return None


def to_number(value):
    try:
        return int(str(value).split()[0])
    except:
        return None



def split_players(match):

    players = {
        match["event_first_player"]: {},
        match["event_second_player"]: {}
    }

    keys = []

    for stat in match.get("statistics", []):

        if stat["player_key"] not in keys:
            keys.append(stat["player_key"])


    for stat in match.get("statistics", []):

        player = None

        if len(keys) > 0 and stat["player_key"] == keys[0]:
            player = match["event_first_player"]

        elif len(keys) > 1 and stat["player_key"] == keys[1]:
            player = match["event_second_player"]


        if player:
            players[player][stat["stat_name"]] = stat["stat_value"]


    return players



def analyze(stats):

    good = []
    bad = []

    power = 0


    for name, value in stats.items():

        p = to_percent(value)


        if name == "Last 10 balls":

            n = to_number(value)

            if n and n >= 5:
                good.append(
                    f"Последние розыгрыши: {value}"
                )
                power += 1

            continue


        if p is None:
            continue


        if p == 0 and name in IGNORE_ZERO:
            continue


        if p >= 60:

            good.append(
                f"{name}: {value}"
            )

            power += 1


        elif p <= 40:

            bad.append(
                f"{name}: {value}"
            )

            power -= 1


    return power, good, bad



def comeback_analysis(match, powers):

    print("\n🔥 Анализ камбека:")

    score = match.get("event_final_result", "")

    if score:

        print(
            "Текущий счёт:",
            score
        )


    best = max(
        powers,
        key=powers.get
    )


    print(
        "По статистике сейчас сильнее:",
        best
    )


    if score and "-" in score:

        sets = score.split("-")

        try:

            a = int(sets[0])
            b = int(sets[1])


            if abs(a-b) >= 1:

                print(
                    "⚠️ Игрок проигрывает по счёту, но статистика может дать шанс на камбек"
                )

        except:
            pass



def predict(event_key):

    match = get_match(event_key)

    if not match:

        print("Матч не найден")
        return


    print("\n🧠 TENNIS AI REPORT")
    print("====================")


    print(
        "🎾",
        match["event_first_player"],
        "vs",
        match["event_second_player"]
    )


    print("\n📊 Состояние:")

    print(
        "Счёт:",
        match.get("event_final_result", "нет данных")
    )


    print(
        "Статус:",
        match.get("event_status", "нет данных")
    )


    players = split_players(match)

    powers = {}


    for player, stats in players.items():

        power, good, bad = analyze(stats)

        powers[player] = power


        print("\n🎾", player)

        print("Сильные стороны:")

        for x in good[:5]:
            print("✅", x)


        print("Проблемы:")

        for x in bad[:5]:
            print("⚠️", x)



    print("\n====================")


    winner = max(
        powers,
        key=powers.get
    )


    print(
        "🧠 AI преимущество:",
        winner
    )


    comeback_analysis(
        match,
        powers
    )



if __name__ == "__main__":

    predict(12148246)
