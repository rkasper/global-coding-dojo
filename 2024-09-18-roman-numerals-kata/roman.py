import re

SINGLE_DIGIT_ROMANS: dict[str, int] = {"I": 1, "V": 5, "X": 10, "L": 50, "C": 100, "D": 500, "M": 1000}

def convert(roman: str) -> int:

    if not is_valid_roman(roman):
        return -1
    else:
        total: int = 0
        prev_value: int = 0

        char: str
        for char in reversed(roman):
            current_value: int = SINGLE_DIGIT_ROMANS[char]
            if current_value >= prev_value:
                total += current_value
            else:
                total -= current_value
            prev_value = current_value
        return total

def is_valid_roman(roman: str) -> bool:

    pattern: re.Pattern = re.compile(r"""   
                                ^M{0,3}
                                (CM|CD|D?C{0,3})?
                                (XC|XL|L?X{0,3})?
                                (IX|IV|V?I{0,3})?$
            """, re.VERBOSE)

    return roman != "" and re.match(pattern, roman)