# Generador de Contraseñas Kata

## Objetivo

Crear una función que genere contraseñas aleatorias seguras. Vamos a construirla paso a paso usando TDD (Test-Driven Development).

---

## Nivel 1 - Contraseña Simple

Crea una función `generatePassword(length)` que genere una contraseña de `length` caracteres usando solo letras minúsculas (a-z).

### Casos de prueba

```typescript
generatePassword(5)  // Ejemplo: "abcde" (5 letras minúsculas)
generatePassword(8)  // Ejemplo: "hqpzxmft" (8 letras minúsculas)
generatePassword(1)  // Ejemplo: "k" (1 letra minúscula)
```

### Verificaciones

- La longitud debe ser exactamente `length` - X 
- Solo debe contener letras minúsculas (a-z) -X 
- Debe ser aleatoria (dos llamadas deben dar resultados diferentes... ¡casi siempre!) 

---

## Nivel 2 - Agregar Mayúsculas

Modifica la función para que también incluya letras mayúsculas (A-Z).

```typescript
generatePassword(8)  // Ejemplo: "HqPzXmFt" (mezcla de mayúsculas y minúsculas)
```

### Verificaciones

- Debe contener al menos una mayúscula y una minúscula (para longitud >= 2)

---

## Nivel 3 - Agregar Números

Ahora la contraseña también debe incluir números (0-9).

```typescript
generatePassword(10)  // Ejemplo: "Hq7PzX2mFt"
```

### Verificaciones

- Debe contener letras y números mezclados

---

## Nivel 4 - Agregar Símbolos

Agrega caracteres especiales: `!@#$%^&*()_+-=[]{}|;:,.<>?`

```typescript
generatePassword(12)  // Ejemplo: "Hq7!PzX@2mFt"
```

---

## Nivel 5 - Configuración de Opciones

Permite al usuario elegir qué tipos de caracteres incluir:

```typescript
const options = {
  length: 12,
  lowercase: true,    // a-z
  uppercase: true,    // A-Z
  numbers: true,      // 0-9
  symbols: true       // !@#$%...
};

generatePassword(options)  // Ejemplo: "Hq7!PzX@2mFt"
```

### Casos de prueba

```typescript
// Solo números (como un PIN)
generatePassword({ length: 4, numbers: true })  // Ejemplo: "7294"

// Solo letras (sin números ni símbolos)
generatePassword({ length: 8, lowercase: true, uppercase: true })  // Ejemplo: "AbCdEfGh"

// Súper segura
generatePassword({ length: 16, lowercase: true, uppercase: true, numbers: true, symbols: true })
```

---

## Nivel 6 - Garantizar Requisitos

Asegura que la contraseña generada contenga **al menos uno** de cada tipo solicitado.

Por ejemplo, si pides mayúsculas, minúsculas y números con longitud 4:
- "abc1" - Inválido (no tiene mayúsculas)
- "ABC1" - Inválido (no tiene minúsculas)
- "AbC1" - Válido

### Pista para TDD

¿Cómo puedes probar que "siempre" hay al menos uno de cada tipo? Genera muchas contraseñas y verifica todas.

---

## Nivel 7 - Extensiones Opcionales

### 7a. Excluir caracteres confusos

Algunos caracteres se confunden fácilmente: `0O` (cero y O), `1lI` (uno, ele, i mayúscula)

```typescript
generatePassword({ length: 8, excludeAmbiguous: true })
```

### 7b. Contraseña pronunciable

Genera contraseñas que se puedan "leer" alternando consonantes y vocales:

```typescript
generatePassword({ length: 8, pronounceable: true })  // Ejemplo: "bokumepi"
```

### 7c. Frase de contraseña (passphrase)

Genera frases usando palabras aleatorias:

```typescript
generatePassphrase(4)  // Ejemplo: "gato-luna-verde-saltar"
```

---

## Tips para TDD

1. **Empieza simple**: Primero haz que genere UNA letra. Luego `length` letras.
2. **Un test a la vez**: No escribas todos los tests de una vez.
3. **Refactoriza**: Después de que pase el test, mejora el código.
4. **Pequeños pasos**: Es mejor avanzar poco a poco que quedarse atorado.

## Comandos útiles

```bash
# Ejecutar tests
deno test

# Ejecutar tests en modo watch (se re-ejecutan al guardar)
deno test --watch
```

---

## Para el Facilitador

- **Rotación**: 5-7 minutos por persona
- **Nivel sugerido para empezar**: Nivel 1 (todos pueden participar)
- **Si hay grupos mixtos**: Los más experimentados pueden ayudar a los principiantes
- **Meta realista para 2 horas**: Niveles 1-4, quizás 5
