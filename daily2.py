from ai_live_score import ai_score
from confidence import confidence
from match_engine import get_matches

print("\n🎾 TennisAI МАТЧИ ДНЯ")
print("----------------------")

matches = get_matches()

count = 0

for row in matches:

    status = row["status"].lower()

    if status == "finished":
        continue

    p1 = row["player1"]
    p2 = row["player2"]

    # Пока API не отдаёт покрытие, используем Hard.
    # Позже заменим на реальные данные.
    surface = "Hard"

    s1 = ai_score(p1, surface)
    s2 = ai_score(p2, surface)

    diff = s1 - s2

    prob1 = 50 + diff * 1.2
    prob1 = max(35, min(65, prob1))
    prob2 = 100 - prob1

    count += 1

    print("\n🎾", p1, "vs", p2)
    print("Статус:", row["status"])

    print(
        p1,
        ":",
        round(s1, 2),
        "|",
        round(prob1, 1),
        "%"
    )

    print(
        p2,
        ":",
        round(s2, 2),
        "|",
        round(prob2, 1),
        "%"
    )

    if s1 > s2:
        winner = p1
    else:
        winner = p2

    print("➡️ Преимущество:", winner)
    print("Уверенность:", confidence(s1, s2))

print("\nВсего активных матчей:", count)
