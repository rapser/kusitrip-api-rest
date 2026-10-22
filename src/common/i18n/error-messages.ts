export type SupportedLanguage = 'es' | 'en';

export const DEFAULT_LANGUAGE: SupportedLanguage = 'es';

/**
 * Message dictionary keyed by stable error `code`. `code` and every other
 * field in the error envelope stays in English (REST convention); only the
 * human-readable `message` is localized.
 */
export const ERROR_MESSAGES: Record<
  string,
  Record<SupportedLanguage, string>
> = {
  VALIDATION_ERROR: {
    es: 'Los datos enviados no son válidos.',
    en: 'The submitted data is invalid.',
  },
  EMAIL_ALREADY_IN_USE: {
    es: 'Ya existe una cuenta con este correo.',
    en: 'An account with this email already exists.',
  },
  INVALID_CREDENTIALS: {
    es: 'Email o contraseña incorrectos. Por favor, inténtalo de nuevo.',
    en: 'Incorrect email or password. Please try again.',
  },
  UNAUTHORIZED: {
    es: 'No autenticado. Inicia sesión para continuar.',
    en: 'Not authenticated. Please log in to continue.',
  },
  INVALID_REFRESH_TOKEN: {
    es: 'La sesión expiró o no es válida. Inicia sesión de nuevo.',
    en: 'The session expired or is invalid. Please log in again.',
  },
  FORBIDDEN: {
    es: 'No tienes permiso para realizar esta acción.',
    en: 'You do not have permission to perform this action.',
  },
  NOT_FOUND: {
    es: 'El recurso solicitado no existe.',
    en: 'The requested resource was not found.',
  },
  DESTINATION_NOT_FOUND: {
    es: 'El destino no existe.',
    en: 'The destination was not found.',
  },
  ACTIVITY_NOT_FOUND: {
    es: 'Actividad no encontrada.',
    en: 'The activity was not found.',
  },
  FAVORITE_NOT_FOUND: {
    es: 'La actividad no está en tu lista de deseos.',
    en: 'The activity is not in your wishlist.',
  },
  BOOKING_NOT_FOUND: {
    es: 'La reserva no existe.',
    en: 'The booking was not found.',
  },
  BOOKING_DATE_IN_PAST: {
    es: 'La fecha de la actividad debe ser posterior a hoy.',
    en: 'The activity date must be in the future.',
  },
  BOOKING_ALREADY_CANCELLED: {
    es: 'La reserva ya fue cancelada.',
    en: 'The booking was already cancelled.',
  },
  RATE_LIMIT_EXCEEDED: {
    es: 'Demasiadas solicitudes. Intenta de nuevo en unos segundos.',
    en: 'Too many requests. Please try again in a few seconds.',
  },
  INTERNAL_ERROR: {
    es: 'Ocurrió un error inesperado. Intenta de nuevo más tarde.',
    en: 'An unexpected error occurred. Please try again later.',
  },
};

export function resolveLanguage(acceptLanguage?: string): SupportedLanguage {
  if (!acceptLanguage) return DEFAULT_LANGUAGE;
  const normalized = acceptLanguage.toLowerCase();
  if (normalized.startsWith('en')) return 'en';
  if (normalized.includes('es')) return 'es';
  return DEFAULT_LANGUAGE;
}

export function getErrorMessage(
  code: string,
  language: SupportedLanguage,
): string {
  const entry = ERROR_MESSAGES[code];
  if (!entry) return ERROR_MESSAGES.INTERNAL_ERROR[language];
  return entry[language];
}
