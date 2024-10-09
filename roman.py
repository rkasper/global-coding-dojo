def convert(roman):
    rdict_char = {"I":1, "V":5, "X":10, "L":50, "C":100, "D":500, "M":1000}

    es_resta = len(roman) == 2 and rdict_char[roman[0]] < rdict_char[roman[1]]
    if es_resta:
        return rdict_char[roman[1]] - rdict_char[roman[0]]

    total = 0
    for index, c in enumerate(roman):
        total += rdict_char[c]
    return total
