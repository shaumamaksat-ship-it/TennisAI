from confidence import confidence
import csv
from ai_live_score import ai_score


file = "matches_today.csv"


print("\n🎾 TennisAI МАТЧИ ДНЯ")
print("----------------------")


with open(file, "r", encoding="utf-8") as f:

    reader = csv.DictReader(f)

    for row in reader:

        p1 = row["player1"]
        p2 = row["player2"]
        surface = row["surface"]


        s1 = ai_score(p1, surface)
        s2 = ai_score(p2, surface)


        diff = s1 - s2


        prob1 = 50 + diff * 1.2
        prob1 = max(35, min(65, prob1))
        prob2 = 100 - prob1


        print("\n🎾", p1, "vs", p2)
        print("Покрытие:", surface)

        print(
            p1,
            ":",
            s1,
            "|",
            round(prob1,1),
            "%"
        )

        print(
            p2,
            ":",
            s2,
            "|",
            round(prob2,1),
            "%"
        )


        if s1 > s2:
            winner = p1
        else:
            winner = p2

        print("➡️ Преимущество:", winner)

        print(
            "Уверенность:",
            confidence(s1, s2)
        )
