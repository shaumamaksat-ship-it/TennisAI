import csv

players = []

with open("players.csv", encoding="utf-8") as f:
    reader = csv.DictReader(f)

    for row in reader:
        players.append(row["english"])


def find_player(name):

    name = name.lower().strip()

    found = []

    for player in players:
        if name in player.lower():
            found.append(player)

    return found


if __name__ == "__main__":

    while True:

        text = input("Игрок: ")

        if text == "":
            break

        result = find_player(text)

        if len(result) == 0:
            print("❌ Игрок не найден")

        elif len(result) == 1:
            print("✅", result[0])

        else:
            print("\nНайдено", len(result), "игроков:\n")

            for i, player in enumerate(result, 1):
                print(f"{i}. {player}")

            choice = input("\nВыберите номер: ")

            try:
                choice = int(choice)
                print("\nВыбран:", result[choice - 1])
            except:
                print("Неверный выбор")
