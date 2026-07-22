import csv
import glob

files = glob.glob("data/tennis_atp/atp_matches_*.csv")

total = 0

for file in files:
    print("Читаю:", file)

    with open(file, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)

        for row in reader:
            total += 1

print("Всего матчей:", total)
