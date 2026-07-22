def analyze(stats):
    facts = []

    for s in stats:

        name = s.get("stat_name", "")
        value = s.get("stat_value", "")

        if name == "1st serve %" and value:
            facts.append(f"Первая подача: {value}")

        elif name == "Aces":
            facts.append(f"Эйсы: {value}")

        elif name == "Double Faults":
            facts.append(f"Двойные ошибки: {value}")

        elif name == "Break Points Converted":
            facts.append(f"Брейк-пойнты: {value}")

        elif name == "Return Points Won":
            facts.append(f"Выиграно очков на приеме: {value}")

        elif name == "Total Points Won":
            facts.append(f"Всего выиграно очков: {value}")

    print("\n====== АНАЛИЗ ИИ ======\n")

    for f in facts:
        print("•", f)

    print("\nВывод:")

    if len(facts) > 5:
        print("ИИ получил достаточно данных для анализа.")
    else:
        print("Недостаточно статистики.")
