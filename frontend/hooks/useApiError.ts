import { useToast } from "@/components/ui/use-toast";
import { APIClientError } from "@/lib/errors";

export function useApiError() {
  const { toast } = useToast();

  const showError = (error: unknown) => {
    const apiError = error instanceof APIClientError 
      ? error 
      : APIClientError.fromResponse(error);

    console.error('API Error:', {
      code: apiError.code,
      message: apiError.message,
      details: apiError.details,
    });

    const toastInstance = toast({
      variant: "destructive",
      title: "Error",
      description: apiError.getUserFriendlyMessage(),
    });

    setTimeout(() => {
      toastInstance.dismiss();
    }, 5000);
  };

  const showSuccess = (message: string) => {
    toast({
      title: "Success",
      description: message,
    });
  };

  return { showError, showSuccess };
}
