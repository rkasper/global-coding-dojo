import pytest
from roman import convert

@pytest.mark.parametrize("roman, expected", [
    ("I", 1),
    ("V", 5),
    ("X", 10),
    ("L", 50),
    ("C", 100),
    ("D", 500),
    ("M", 1000),
])
def test_singulares(roman, expected):
    assert convert(roman) == expected

@pytest.mark.parametrize("roman, expected", [
    ("II", 2),
    ("III", 3),
    ("VI", 6),
    ("MDCCCLXXXII", 1882)
])
def test_sumacion(roman, expected):
    assert convert(roman) == expected

@pytest.mark.parametrize("roman, expected", [
    ("IV", 4),
    ("IX", 9 ),
    ("XC", 90)
])
def test_resta(roman, expected):
    assert convert(roman) == expected

@pytest.mark.parametrize("roman, expected", [
    ("XIV", 14),
    ("XCI", 91),
    ("MDCCCLXXXIV", 1884),
    ("MMXXIV", 2024),
])
def test_adicion_y_resta_mixta(roman, expected):
    assert convert(roman) == expected

@pytest.mark.parametrize("roman", [
    "A",
    "B",
    "",
    "IIX",
    "IIIIVX",
    "VM",
])
def test_entradas_invalidas(roman):
    assert convert(roman) == -1