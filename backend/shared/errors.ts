import { APIError } from "encore.dev/api";

export class ErrorHandler {
  static notFound(resource: string, id?: string | number): never {
    const message = id 
      ? `${resource} with id '${id}' not found`
      : `${resource} not found`;
    throw APIError.notFound(message);
  }

  static alreadyExists(resource: string, field?: string): never {
    const message = field
      ? `${resource} with this ${field} already exists`
      : `${resource} already exists`;
    throw APIError.alreadyExists(message);
  }

  static invalidArgument(message: string, details?: Record<string, unknown>): never {
    if (details) {
      throw APIError.invalidArgument(message).withDetails(details);
    }
    throw APIError.invalidArgument(message);
  }

  static permissionDenied(message: string = "Permission denied"): never {
    throw APIError.permissionDenied(message);
  }

  static unauthenticated(message: string = "Authentication required"): never {
    throw APIError.unauthenticated(message);
  }

  static internal(message: string = "Internal server error"): never {
    throw APIError.internal(message);
  }

  static fromDatabase(error: unknown, resource: string): never {
    if (error && typeof error === 'object' && 'code' in error) {
      const pgError = error as { code: string; detail?: string };
      
      if (pgError.code === '23505') {
        const apiError = APIError.alreadyExists(`${resource} already exists`);
        if (pgError.detail) {
          throw apiError.withDetails({ detail: pgError.detail });
        }
        throw apiError;
      }
      if (pgError.code === '23503') {
        const apiError = APIError.invalidArgument("Referenced resource does not exist");
        if (pgError.detail) {
          throw apiError.withDetails({ detail: pgError.detail });
        }
        throw apiError;
      }
    }
    
    throw APIError.internal(`Failed to process ${resource}`);
  }
}
