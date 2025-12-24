import { z } from "zod";
import { APIError } from "encore.dev/api";

export function validateSchema<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  
  if (!result.success) {
    const errors = result.error.errors.map((err: z.ZodIssue) => ({
      field: err.path.join('.'),
      message: err.message
    }));
    
    throw APIError.invalidArgument("Validation failed").withDetails({ errors });
  }
  
  return result.data;
}

export function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): T {
  return validateSchema(schema, data);
}

export function validateResponse<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  
  if (!result.success) {
    console.error("Response validation failed:", {
      errors: result.error.errors,
      data,
    });
    throw new Error(`Response validation failed: ${result.error.message}`);
  }
  
  return result.data;
}

export const commonValidations = {
  email: z.string().email("Invalid email address"),
  positiveInt: z.number().int().positive("Must be a positive integer"),
  nonEmptyString: z.string().min(1, "Cannot be empty"),
  url: z.string().url("Invalid URL"),
  date: z.date(),
  uuid: z.string().uuid("Invalid UUID"),
};
