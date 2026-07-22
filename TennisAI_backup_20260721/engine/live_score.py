import requests


API_KEY = "99969bf38c505cb69d9901bada9049e431b7b22a6e71907a732c7c228efe6fcc"


def get_live_score(event_key):

    url = "https://api.api-tennis.com/tennis/"


    params = {
        "method": "get_livescore",
        "APIkey": API_KEY
    }


    r = requests.get(
        url,
        params=params,
        timeout=30
    )


    data = r.json()


    for match in data.get("result", []):


        if str(match.get("event_key")) == str(event_key):


            game = match.get(
                "event_game_result"
            )


            # если пусто - ищем в pointbypoint

            if not game:

                points = match.get(
                    "pointbypoint"
                )


                if points:

                    try:

                        last = points[-1]

                        game = last.get(
                            "score"
                        )


                    except:

                        pass



            return {

                "players":
                (
                    match.get("event_first_player"),
                    match.get("event_second_player")
                ),


                "status":
                match.get("event_status"),


                "sets":
                match.get("scores"),


                "game":
                game or "Unknown",


                "serve":
                match.get("event_serve"),


                "points":
                match.get("pointbypoint"),


                "statistics":
                match.get("statistics")

            }


    return None
