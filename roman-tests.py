import pytest
from roman import convert

@pytest.mark.parametrize("input, expected", [
    ("I", 1),
    ("V", 5),
    ("X", 10),
    ("L", 50),
    ("C", 100),
    ("D", 500),
    ("M", 1000)
])
def test_many(input, expected):
    assert convert(input) == expected

