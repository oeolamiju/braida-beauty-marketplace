import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

// Skip to main content link for keyboard navigation
export function SkipToMain() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:top-4 focus:left-4 focus:px-4 focus:py-2 focus:bg-orange-600 focus:text-white focus:rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
    >
      Skip to main content
    </a>
  );
}

// Visually hidden text for screen readers
export function VisuallyHidden({ children }: { children: React.ReactNode }) {
  return <span className="sr-only">{children}</span>;
}

// Loading spinner with accessible label
interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  label?: string;
  className?: string;
}

export function LoadingSpinner({
  size = "md",
  label = "Loading",
  className,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  return (
    <div role="status" aria-live="polite" className={cn("flex items-center justify-center", className)}>
      <svg
        className={cn("animate-spin text-orange-600", sizeClasses[size])}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      <span className="sr-only">{label}</span>
    </div>
  );
}

// Empty state with call to action
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 px-4 text-center",
        className
      )}
      role="status"
      aria-label={title}
    >
      {icon && (
        <div className="mb-4 text-gray-300" aria-hidden="true">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-4">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

// Skeleton loader for async content
interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular";
  width?: string | number;
  height?: string | number;
}

export function Skeleton({
  className,
  variant = "rectangular",
  width,
  height,
}: SkeletonProps) {
  const variantClasses = {
    text: "rounded",
    circular: "rounded-full",
    rectangular: "rounded-md",
  };

  return (
    <div
      className={cn(
        "animate-pulse bg-gray-200",
        variantClasses[variant],
        className
      )}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
}

// Card skeleton for loading states
export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("bg-white rounded-lg border p-4 space-y-3", className)}
      aria-hidden="true"
    >
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <div className="flex gap-2">
        <Skeleton className="h-8 w-8" variant="circular" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      </div>
    </div>
  );
}

// Tooltip with proper accessibility
interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
}

export function AccessibleTooltip({
  content,
  children,
  position = "top",
}: TooltipProps) {
  const [visible, setVisible] = React.useState(false);
  const id = React.useId();

  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      <div aria-describedby={id}>{children}</div>
      {visible && (
        <div
          id={id}
          role="tooltip"
          className={cn(
            "absolute z-50 px-2 py-1 text-xs text-white bg-gray-900 rounded shadow-lg whitespace-nowrap",
            positionClasses[position]
          )}
        >
          {content}
        </div>
      )}
    </div>
  );
}

// Focus trap for modals
export function useFocusTrap(isActive: boolean) {
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const focusableElements = containerRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement?.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement?.focus();
          e.preventDefault();
        }
      }
    };

    containerRef.current.addEventListener("keydown", handleKeyDown);
    firstElement?.focus();

    return () => {
      containerRef.current?.removeEventListener("keydown", handleKeyDown);
    };
  }, [isActive]);

  return containerRef;
}

// Announce to screen readers
export function useAnnounce() {
  const announce = React.useCallback((message: string, priority: "polite" | "assertive" = "polite") => {
    const announcement = document.createElement("div");
    announcement.setAttribute("role", "status");
    announcement.setAttribute("aria-live", priority);
    announcement.setAttribute("aria-atomic", "true");
    announcement.className = "sr-only";
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }, []);

  return announce;
}

// High contrast mode detection
export function useHighContrast() {
  const [isHighContrast, setIsHighContrast] = React.useState(false);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-contrast: more)");
    setIsHighContrast(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setIsHighContrast(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  return isHighContrast;
}

// Reduced motion detection
export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  return prefersReducedMotion;
}

