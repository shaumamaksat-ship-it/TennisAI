import requests
import json

url = "https://sportscore.com/api/widget/matches/tennis/match/millen-hurrion-vs-kaylan-bigun/"

r = requests.get(url, timeout=10)

print(r.status_code)
print(r.text[:1000])
