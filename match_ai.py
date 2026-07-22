import json

def analyze_match(data):

    print("\n🎾 ===== TENNIS AI ANALYSIS =====\n")

    matches = data.get("matches", [])

    for m in matches[:5]:

        home = m.get("home")
        away = m.get("away")
        score = f'{m.get("home_score")} - {m.get("away_score")}'
        status = m.get("status_text")

        print(f"Матч: {home} vs {away}")
        print(f"Счёт: {score}")
        print(f"Статус: {status}")

        print("Факты:")
        
        if m.get("home_score") and m.get("away_score"):
            print("• Есть данные по счёту")

        if "Ended" in str(status):
            print("• Матч завершён")

        print("----------------------------")


with open("live_stats.json") as f:
    data = json.load(f)

analyze_match(data)
