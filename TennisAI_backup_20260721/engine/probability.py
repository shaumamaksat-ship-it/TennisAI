def calculate_probability(scores):

    positive = {}

    for player, score in scores.items():

        if score < 0:
            score = 0

        positive[player] = score


    total = sum(
        positive.values()
    )


    result = {}


    if total == 0:

        for p in positive:

            result[p] = 50

        return result



    for p,v in positive.items():

        result[p] = round(
            v / total * 100
        )


    return result
