class TennisBrain:

    def __init__(self):
        self.features = {}

    def add(self, name, value):
        self.features[name] = value

    def get(self):
        return self.features

    def show(self):
        print("\n========== AI FEATURES ==========\n")

        for key, value in self.features.items():
            print(f"{key:<30} {value}")

        print("\n=================================\n")


if __name__ == "__main__":

    brain = TennisBrain()

    brain.add("ATP Rank", 4)
    brain.add("Wins Last 10", 8)
    brain.add("Loss Last 10", 2)
    brain.add("1st Serve %", 69)
    brain.add("1st Serve Won %", 78)
    brain.add("2nd Serve Won %", 58)
    brain.add("Break Points Saved %", 71)
    brain.add("Break Points Converted %", 46)
    brain.add("Return Points Won %", 42)
    brain.add("Double Faults", 1)
    brain.add("Aces", 9)

    brain.show()
