import requests

API_KEY = "99969bf38c505cb69d9901bada9049e431b7b22a6e71907a732c7c228efe6fcc"

BASE_URL = "https://api.api-tennis.com/tennis/"


def get_player(player_key):
    params = {
        "method": "get_players",
        "APIkey": API_KEY,
        "player_key": player_key
    }

    r = requests.get(BASE_URL, params=params, timeout=30)
    r.raise_for_status()

    data = r.json()

    if data.get("success") != 1:
        print("Ошибка API")
        return

    player = data["result"][0]

    print("=" * 40)
    print("Игрок:", player["player_name"])
    print("Страна:", player["player_country"])
    print("Дата рождения:", player["player_bday"])
    print("=" * 40)

    print("\nСтатистика по сезонам:\n")

    for season in player["stats"]:
        print(
            f"{season['season']} | "
            f"Рейтинг: {season['rank']} | "
            f"Побед: {season['matches_won']} | "
            f"Поражений: {season['matches_lost']}"
        )


if __name__ == "__main__":
    get_player(1905)   # Novak Djokovic
