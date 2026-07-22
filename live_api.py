import requests

API_KEY = "99969bf38c505cb69d9901bada9049e431b7b22a6e71907a732c7c228efe6fcc"

URL = "https://api.api-tennis.com/tennis/"


def get_live_matches():
    params = {
        "method": "get_livescore",
        "APIkey": API_KEY
    }

    try:
        r = requests.get(URL, params=params, timeout=20)
        r.raise_for_status()
        data = r.json()
        print(data)

        print("✅ API работает")
        return data.get("result", [])

    except Exception as e:
        print("Ошибка:", e)
        return []


if __name__ == "__main__":
    matches = get_live_matches()

    for match in matches:
        print(
            f"{match.get('event_first_player')} vs "
            f"{match.get('event_second_player')} | "
            f"{match.get('event_status')}"
        )
