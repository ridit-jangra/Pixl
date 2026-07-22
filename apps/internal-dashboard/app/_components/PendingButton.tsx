"use client";

import { useFormStatus } from "react-dom";
import type { ComponentProps, ReactNode } from "react";
import { Button } from "@/components/ui/button";

export function PendingButton({
  children,
  pendingText = "Working…",
  confirm,
  onClick,
  ...props
}: ComponentProps<typeof Button> & {
  children: ReactNode;
  pendingText?: string;
  confirm?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <Button
      disabled={pending}
      onClick={(e) => {
        if (confirm && !window.confirm(confirm)) {
          e.preventDefault();
          return;
        }
        onClick?.(e);
      }}
      {...props}
    >
      {pending ? pendingText : children}
    </Button>
  );
}
