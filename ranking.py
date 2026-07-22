import csv

file = "data/tennis_atp/atp_rankings_10s.csv"

rankings = {}

with open(file, "r", encoding="latin-1") as f:
    reader = csv.reader(f)

    for row in reader:
        if len(row) >= 4:
            ranking_date = row[0]
            rank = row[1]
            player_id = row[2]
            points = row[3]

            rankings[player_id] = {
                "rank": rank,
                "points": points,
                "date": ranking_date
            }

print("База рейтингов загружена:", len(rankings), "игроков")

# пример
for player_id, data in list(rankings.items())[:5]:
    print(
        player_id,
        "место:",
        data["rank"],
        "очки:",
        data["points"]
    )
