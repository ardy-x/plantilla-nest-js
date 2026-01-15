export function traducirMensaje(mensaje: string, _campo: string): string {
  let translated = mensaje;
  const traducciones: Record<string, string> = {
    'must be a UUID': 'debe ser un UUID válido',
    'Validation failed (uuid is expected)': 'Validación falló (se esperaba un UUID válido)',
    'should not be empty': 'no debe estar vacío',
    'must be a string': 'debe ser un texto',
    'must be a number': 'debe ser un número',
    'must be an email': 'debe ser un email válido',
    'must be a URL address': 'debe ser una URL válida',
    'must be an integer': 'debe ser un número entero',
    'must be a boolean': 'debe ser verdadero o falso',
    'must be a valid ISO 8601 date string': 'debe ser una fecha válida en formato ISO 8601',
    'must be longer than or equal to': 'debe tener al menos',
    'must be shorter than or equal to': 'debe tener como máximo',
    'must match': 'debe coincidir con',
    'must be a valid enum value': 'debe ser un valor válido de la lista',
    'must be positive': 'debe ser un número positivo',
    'must be negative': 'debe ser un número negativo',
    'must not be greater than': 'no debe ser mayor que',
    'must not be less than': 'no debe ser menor que',
  };

  for (const [ingles, traduccion] of Object.entries(traducciones)) {
    if (translated.includes(ingles)) {
      translated = translated.replace(ingles, traduccion);
    }
  }

  return translated;
}
