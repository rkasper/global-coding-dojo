def convert(roman):
    if roman == "IV":
        return 4
    elif roman == "IX":
        return 9
    elif roman == "XC":
        return 90

    rdict_char = {"I":1, "V":5, "X":10, "L":50, "C":100, "D":500, "M":1000}
    total = 0
    for c in roman:
        total += rdict_char[c]
    return total
