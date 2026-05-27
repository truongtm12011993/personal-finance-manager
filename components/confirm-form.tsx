"use client";

import type { ReactNode } from "react";

type ConfirmFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  confirmMessage: string;
  className?: string;
  children: ReactNode;
};

export function ConfirmForm({ action, confirmMessage, className, children }: ConfirmFormProps) {
  return (
    <form
      action={action}
      className={className}
      onSubmit={(event) => {
        if (!confirm(confirmMessage)) {
          event.preventDefault();
        }
      }}
    >
      {children}
    </form>
  );
}

