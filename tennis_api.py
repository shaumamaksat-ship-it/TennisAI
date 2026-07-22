import requests

url = "https://api.github.com/zen"

try:
    r = requests.get(url, timeout=10)

    if r.status_code == 200:
        print("🎾 Tennis AI")
        print("Связь с интернетом работает.")
        print("Ответ сервера:")
        print(r.text)
    else:
        print("Ошибка:", r.status_code)

except Exception as e:
    print("Ошибка:", e)
