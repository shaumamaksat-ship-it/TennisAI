class TennisAnalyzer:

    def __init__(self):
        print("🧠 Модуль анализа загружен")

    def analyze(self, player1, player2):
        print(f"\nМатч:")
        print(f"{player1} 🆚 {player2}")
        print("\nАнализ пока находится в разработке.")
        print("Скоро здесь появится оценка вероятности победы.")

if __name__ == "__main__":
    ai = TennisAnalyzer()
    ai.analyze("Carlos Alcaraz", "Jannik Sinner")
