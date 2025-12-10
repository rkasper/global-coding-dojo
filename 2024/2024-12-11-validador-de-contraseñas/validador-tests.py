import unittest
from validador import es_la_contraseña_valida

class TestValidador(unittest.TestCase):
    def test_prueba_funciona(self):
        """Prueba que verifica que la marca de pruebas funciona correctamente."""
        self.assertTrue(True, "Esta prueba siempre debe pasar")

    def test_contraseño_es_valido(self):
        self.assertTrue(es_la_contraseña_valida("1234567Xy"))

    def test_debe_tener_al_menos_8_caracteres(self):
        """Debe tener al menos 8 caracteres"""
        self.assertFalse(es_la_contraseña_valida("12345"))

    def test_debe_tener_al_menos_una_letra_mayúscula(self):
        """Debe contener al menos: Una letra mayúscula"""
        self.assertFalse(es_la_contraseña_valida("1234567xy"))

    def test_debe_tener_al_menos_una_letra_minúscula(self):
        """Debe contener al menos: Una letra minúscula"""
        self.assertFalse(es_la_contraseña_valida("1234567XY"))

if __name__ == '__main__':
    unittest.main()