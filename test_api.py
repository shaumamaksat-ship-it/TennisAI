
import requests

try:
    r = requests.get("https://api.github.com", timeout=10)
    print("Статус:", r.status_code)
    print(r.text[:200])
except Exception as e:
    print("Ошибка:", e)
