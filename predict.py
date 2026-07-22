from ai_score import score
import sys

if len(sys.argv) < 4:
    print('Пример: python predict.py "Rafael Nadal" "Roger Federer" Clay')
    exit()


p1 = sys.argv[1]
p2 = sys.argv[2]
surface = sys.argv[3]


s1 = score(p1, surface)
s2 = score(p2, surface)


print("\n🎾 TennisAI прогноз")
print("------------------")

print(p1, ":", s1)
print(p2, ":", s2)


total = s1 + s2

prob1 = round(s1 / total * 100, 1)
prob2 = round(s2 / total * 100, 1)


print("\nВероятность:")
print(p1, prob1, "%")
print(p2, prob2, "%")


if s1 > s2:
    print("\nПреимущество:", p1)
else:
    print("\nПреимущество:", p2)
