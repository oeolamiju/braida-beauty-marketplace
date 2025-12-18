export interface APIErrorDetails {
  field?: string;
  message?: string;
  [key: string]: unknown;
}

export interface APIErrorResponse {
  code: string;
  message: string;
  details?: APIErrorDetails | { errors?: Array<{ field: string; message: string }> };
}

export class APIClientError extends Error {
  public readonly code: string;
  public readonly details?: APIErrorDetails | { errors?: Array<{ field: string; message: string }> };
  public readonly statusCode?: number;

  constructor(message: string, code: string, details?: APIErrorDetails | { errors?: Array<{ field: string; message: string }> }, statusCode?: number) {
    super(message);
    this.name = 'APIClientError';
    this.code = code;
    this.details = details;
    this.statusCode = statusCode;
  }

  static fromResponse(error: unknown): APIClientError {
    if (error && typeof error === 'object') {
      const apiError = error as Partial<APIErrorResponse>;
      
      if (apiError.code && apiError.message) {
        const statusCode = (error as { status?: number }).status;
        return new APIClientError(
          apiError.message,
          apiError.code,
          apiError.details,
          statusCode
        );
      }
    }

    return new APIClientError(
      'An unexpected error occurred',
      'unknown_error',
      undefined,
      500
    );
  }

  getUserFriendlyMessage(): string {
    if (this.details && 'errors' in this.details && Array.isArray(this.details.errors)) {
      const fieldErrors = this.details.errors.map(e => `${e.field}: ${e.message}`).join(', ');
      return `Validation error: ${fieldErrors}`;
    }

    const codeMessages: Record<string, string> = {
      not_found: 'The requested resource was not found',
      already_exists: 'This resource already exists',
      permission_denied: 'You do not have permission to perform this action',
      unauthenticated: 'Please sign in to continue',
      invalid_argument: this.message,
      resource_exhausted: 'Too many requests. Please try again later',
      failed_precondition: 'The operation cannot be completed at this time',
      internal: 'An internal error occurred. Please try again',
      unavailable: 'The service is temporarily unavailable',
      unknown_error: 'An unexpected error occurred',
    };

    return codeMessages[this.code] || this.message;
  }
}

export function handleAPIError(error: unknown): never {
  const apiError = APIClientError.fromResponse(error);
  console.error('API Error:', {
    code: apiError.code,
    message: apiError.message,
    details: apiError.details,
    statusCode: apiError.statusCode,
  });
  throw apiError;
}
