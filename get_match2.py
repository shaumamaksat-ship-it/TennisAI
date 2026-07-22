import requests

url = "https://sportscore.com/api/widget/match/"

params = {
    "slug": "millen-hurrion-vs-kaylan-bigun"
}

r = requests.get(url, params=params, timeout=10)

print("STATUS:", r.status_code)
print(r.text[:2000])
