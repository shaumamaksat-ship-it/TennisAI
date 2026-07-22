import re
import requests
from bs4 import BeautifulSoup

from players import add_player
from matches import save_match

HEADERS = {
    "User-Agent": "Mozilla/5.0"
}

URL = "https://www.tennisexplorer.com/matches/"


def is_real_player(name):
    if not name:
        return False

    bad_words = [
        "UTR Pro Tennis Series",
        "UTR",
        "Series",
        "Court",
        "Qualification",
        "Qualifying"
    ]

    for word in bad_words:
        if word.lower() in name.lower():
            return False

    return True


def get_today_matches():
    r = requests.get(URL, headers=HEADERS, timeout=20)
    r.raise_for_status()

    soup = BeautifulSoup(r.text, "html.parser")

    table = soup.find("table", class_="result")

    if table is None:
        return []

    matches = []
    rows = table.find_all("tr")

    i = 0

    while i < len(rows):

        first = rows[i].find("td", class_="t-name")

        if first is None:
            i += 1
            continue

        if i + 1 >= len(rows):
            break

        second = rows[i + 1].find("td", class_="t-name")

        if second is None:
            i += 1
            continue

        time = ""
        time_cell = rows[i].find("td", class_="time")

        if time_cell:
            time = time_cell.get_text(strip=True)

        player1 = first.get_text(strip=True)
        player2 = second.get_text(strip=True)

        if not is_real_player(player1):
            i += 2
            continue

        if not is_real_player(player2):
            i += 2
            continue

        add_player(player1)
        add_player(player2)

        save_match(
            time,
            player1,
            player2,
            tournament="Unknown"
        )

        matches.append({
            "time": time,
            "player1": player1,
            "player2": player2
        })

        i += 2

    return matches


if __name__ == "__main__":

    matches = get_today_matches()

    print(f"Найдено матчей: {len(matches)}\n")

    for n, m in enumerate(matches, start=1):
        print(
            f"{n}. {m['time']} | {m['player1']} vs {m['player2']}"
        )
