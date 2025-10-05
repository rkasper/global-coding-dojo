import re

def __contiene_letra_mayúscula(contraseña):
    return bool(re.search(r'[A-Z]', contraseña))


def __contiene_letra_minúscula(contraseña):
    return bool(re.search(r'[a-z]', contraseña))


def es_la_contraseña_valida(contraseña):
    return len(contraseña) >= 8 and __contiene_letra_mayúscula(contraseña) and __contiene_letra_minúscula(contraseña)