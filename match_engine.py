from live_api import get_live_matches

def get_matches():
    """
    Возвращает список матчей для анализа.
    Пока использует live_api,
    позже сюда можно добавить ATP, WTA, ITF и другие источники.
    """
    return get_live_matches()


if __name__ == "__main__":
    matches = get_matches()

    print("🎾 Найдено матчей:", len(matches))

    for i, m in enumerate(matches, 1):
        print(f"{i}. {m['player1']} vs {m['player2']} ({m['status']})")
