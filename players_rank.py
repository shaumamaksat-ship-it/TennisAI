date = row[0]
player_id = row[2]

if player_id not in rankings or date > rankings[player_id]["date"]:
    rankings[player_id] = {
        "rank": row[1],
        "points": row[3],
        "date": date
    }
