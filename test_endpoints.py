import requests

urls = [
"https://sportscore.com/api/widget/matches/",
"https://sportscore.com/api/widget/match/",
"https://sportscore.com/api/widget/match/millen-hurrion-vs-kaylan-bigun/",
"https://sportscore.com/api/widget/matches/millen-hurrion-vs-kaylan-bigun/"
]

for u in urls:
    try:
        r = requests.get(u, timeout=10)
        print("\nURL:", u)
        print("STATUS:", r.status_code)
        print(r.text[:100])
    except Exception as e:
        print(e)
