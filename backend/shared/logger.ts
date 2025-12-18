interface LogContext {
  [key: string]: any;
}

export enum LogLevel {
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR",
}

export function log(
  level: LogLevel,
  message: string,
  context?: LogContext
): void {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    message,
    ...context,
  };
  
  console.log(JSON.stringify(logEntry));
}

export function logBookingEvent(
  action: string,
  bookingId: number,
  context?: LogContext
): void {
  log(LogLevel.INFO, `Booking ${action}`, {
    event: "booking",
    action,
    bookingId,
    ...context,
  });
}

export function logPaymentEvent(
  action: string,
  paymentId: string | number,
  context?: LogContext
): void {
  log(LogLevel.INFO, `Payment ${action}`, {
    event: "payment",
    action,
    paymentId,
    ...context,
  });
}

export function logVerificationEvent(
  action: string,
  freelancerId: string,
  context?: LogContext
): void {
  log(LogLevel.INFO, `Verification ${action}`, {
    event: "verification",
    action,
    freelancerId,
    ...context,
  });
}

export function logError(
  message: string,
  error: Error,
  context?: LogContext
): void {
  log(LogLevel.ERROR, message, {
    error: error.message,
    stack: error.stack,
    ...context,
  });
}
