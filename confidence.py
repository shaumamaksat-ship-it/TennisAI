def confidence(score1, score2):

    diff = abs(score1 - score2)

    if diff < 5:
        return "🟡 Равный матч"

    elif diff < 10:
        return "🟢 Небольшое преимущество"

    elif diff < 20:
        return "🔵 Хорошее преимущество"

    else:
        return "🔥 Большое преимущество"
