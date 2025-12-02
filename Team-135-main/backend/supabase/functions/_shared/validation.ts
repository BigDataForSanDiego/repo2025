// Shared validation utilities for Edge Functions
// Provides consistent validation helpers for required fields, data types, and value ranges

/**
 * Validate that a value is not null or undefined
 */
export function isRequired(value: any): boolean {
  return value !== null && value !== undefined;
}

/**
 * Validate UUID format
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Validate latitude bounds (-90 to 90)
 */
export function isValidLatitude(lat: number): boolean {
  return typeof lat === "number" && !isNaN(lat) && lat >= -90 && lat <= 90;
}

/**
 * Validate longitude bounds (-180 to 180)
 */
export function isValidLongitude(lng: number): boolean {
  return typeof lng === "number" && !isNaN(lng) && lng >= -180 && lng <= 180;
}

/**
 * Validate boolean type
 */
export function isBoolean(value: any): boolean {
  return typeof value === "boolean";
}

/**
 * Validate string type and optional length constraints
 */
export function isValidString(
  value: any,
  minLength?: number,
  maxLength?: number
): boolean {
  if (typeof value !== "string") return false;
  if (minLength !== undefined && value.length < minLength) return false;
  if (maxLength !== undefined && value.length > maxLength) return false;
  return true;
}

/**
 * Validate number type and optional range constraints
 */
export function isValidNumber(
  value: any,
  min?: number,
  max?: number
): boolean {
  if (typeof value !== "number" || isNaN(value)) return false;
  if (min !== undefined && value < min) return false;
  if (max !== undefined && value > max) return false;
  return true;
}

/**
 * Validate that a value is one of the allowed options
 */
export function isOneOf<T>(value: T, allowedValues: T[]): boolean {
  return allowedValues.includes(value);
}

/**
 * Validate ISO 639-1 language code (2-letter code)
 */
export function isValidLanguageCode(code: string): boolean {
  return typeof code === "string" && code.length === 2 && /^[a-z]{2}$/i.test(code);
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number format (basic validation)
 */
export function isValidPhone(phone: string): boolean {
  // Basic validation: at least 10 digits
  const digitsOnly = phone.replace(/\D/g, "");
  return digitsOnly.length >= 10;
}

/**
 * Validation error builder
 */
export interface ValidationError {
  field: string;
  message: string;
}

export class ValidationResult {
  private errors: ValidationError[] = [];

  addError(field: string, message: string): void {
    this.errors.push({ field, message });
  }

  isValid(): boolean {
    return this.errors.length === 0;
  }

  getErrors(): ValidationError[] {
    return this.errors;
  }

  getErrorMessage(): string {
    return this.errors.map((e) => `${e.field}: ${e.message}`).join("; ");
  }
}
