export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export function validateString(value: unknown, fieldName: string): string {
  if (typeof value !== 'string') {
    throw new ValidationError(`${fieldName} must be a string`);
  }
  return value;
}

export function validateNumber(value: unknown, fieldName: string): number {
  if (typeof value !== 'number' || isNaN(value)) {
    throw new ValidationError(`${fieldName} must be a valid number`);
  }
  return value;
}

export function validateBoolean(value: unknown, fieldName: string): boolean {
  if (typeof value !== 'boolean') {
    throw new ValidationError(`${fieldName} must be a boolean`);
  }
  return value;
}

export function validateArray<T>(
  value: unknown,
  fieldName: string,
  itemValidator?: (item: unknown, index: number) => T
): T[] {
  if (!Array.isArray(value)) {
    throw new ValidationError(`${fieldName} must be an array`);
  }
  
  if (itemValidator) {
    return value.map((item, index) => itemValidator(item, index));
  }
  
  return value as T[];
}

export function validateObject<T extends object>(
  value: unknown,
  fieldName: string,
  schema: { [K in keyof T]: (value: unknown) => T[K] }
): T {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new ValidationError(`${fieldName} must be an object`);
  }
  
  const result = {} as T;
  const obj = value as Record<string, unknown>;
  
  for (const key in schema) {
    result[key] = schema[key](obj[key]);
  }
  
  return result;
}

export function validateOptional<T>(
  value: unknown,
  validator: (value: unknown) => T
): T | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }
  return validator(value);
}

export function validateEnum<T extends string>(
  value: unknown,
  fieldName: string,
  allowedValues: readonly T[]
): T {
  const str = validateString(value, fieldName);
  if (!allowedValues.includes(str as T)) {
    throw new ValidationError(
      `${fieldName} must be one of: ${allowedValues.join(', ')}`
    );
  }
  return str as T;
}

export function validateDate(value: unknown, fieldName: string): Date {
  if (value instanceof Date) {
    if (isNaN(value.getTime())) {
      throw new ValidationError(`${fieldName} is an invalid date`);
    }
    return value;
  }
  
  if (typeof value === 'string' || typeof value === 'number') {
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      throw new ValidationError(`${fieldName} is an invalid date`);
    }
    return date;
  }
  
  throw new ValidationError(`${fieldName} must be a valid date`);
}

export function validateEmail(value: unknown, fieldName: string): string {
  const str = validateString(value, fieldName);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(str)) {
    throw new ValidationError(`${fieldName} must be a valid email address`);
  }
  return str;
}

export function validateUrl(value: unknown, fieldName: string): string {
  const str = validateString(value, fieldName);
  try {
    new URL(str);
    return str;
  } catch {
    throw new ValidationError(`${fieldName} must be a valid URL`);
  }
}

export function validatePositiveNumber(value: unknown, fieldName: string): number {
  const num = validateNumber(value, fieldName);
  if (num <= 0) {
    throw new ValidationError(`${fieldName} must be a positive number`);
  }
  return num;
}

export function validateNonNegativeNumber(value: unknown, fieldName: string): number {
  const num = validateNumber(value, fieldName);
  if (num < 0) {
    throw new ValidationError(`${fieldName} must be a non-negative number`);
  }
  return num;
}

export function validateStringLength(
  value: unknown,
  fieldName: string,
  min?: number,
  max?: number
): string {
  const str = validateString(value, fieldName);
  
  if (min !== undefined && str.length < min) {
    throw new ValidationError(`${fieldName} must be at least ${min} characters`);
  }
  
  if (max !== undefined && str.length > max) {
    throw new ValidationError(`${fieldName} must be at most ${max} characters`);
  }
  
  return str;
}
