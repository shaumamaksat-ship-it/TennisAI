import requests
from bs4 import BeautifulSoup

url = "https://www.tennisexplorer.com/matches/"

r = requests.get(
    url,
    headers={"User-Agent": "Mozilla/5.0"},
    timeout=20
)

soup = BeautifulSoup(r.text, "html.parser")

table = soup.find("table", class_="result")

rows = table.find_all("tr")

print(rows[1].prettify())
