"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SubmitButtonProps {
  children: React.ReactNode;
  pendingText?: string;
  className?: string;
}

/** Full-width primary submit that shows a spinner while its <form> action runs. */
function SubmitButton({ children, pendingText = "Working…", className }: SubmitButtonProps) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      size="lg"
      isLoading={pending}
      loadingText={pendingText}
      className={cn("w-full", className)}
    >
      {children}
    </Button>
  );
}

export { SubmitButton };
