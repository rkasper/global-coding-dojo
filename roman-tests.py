import pytest
from roman import convert

@pytest.mark.parametrize("input, expected", [
    ("I", 1),
    ("V", 5),
    ("X", 10),
    ("L", 50),
    ("C", 100),
    ("D", 500),
    ("M", 1000),
])
def test_singulares(input, expected):
    assert convert(input) == expected

@pytest.mark.parametrize("input, expected", [
    ("II", 2),
    ("III", 3),
    ("VI", 6),
    ("MDCCCLXXXII", 1882)
])
def test_sumacion(input, expected):
    assert convert(input) == expected

@pytest.mark.parametrize("input, expected", [
    ("IV", 4),
    ("IX", 9 ),
    ("XC", 90)
])
def test_resta(input, expected):
    assert convert(input) == expected

