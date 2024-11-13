def convert(roman: str) -> int:
    single_digit_romans: dict[str, int] = {"I": 1, "V": 5, "X": 10, "L": 50, "C": 100, "D": 500, "M": 1000}

    total: int = 0
    prev_value: int = 0
    
    char: str
    for char in reversed(roman):
        current_value: int = single_digit_romans[char]
        if current_value >= prev_value:
            total += current_value
        else:
            total -= current_value
        prev_value = current_value
    return total