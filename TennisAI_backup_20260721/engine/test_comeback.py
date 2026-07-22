from live_score import get_live_score
from live_analyzer import get_match
from predictor import split_players
from comeback import analyze_comeback


event = 12148246


live = get_live_score(event)

match = get_match(event)

stats = split_players(match)


analyze_comeback(
    live,
    stats
)
