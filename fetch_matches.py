import requests

url = "https://api.github.com/zen"

try:
    r = requests.get(url, timeout=10)
    print("Статус:", r.status_code)
except Exception as e:
    print("Ошибка:", e)
