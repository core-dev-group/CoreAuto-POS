"use client";

import { useConfirm } from "@/components/ConfirmModalProvider";
import { useFormStatus } from "react-dom";
import React from "react";

interface ConfirmSubmitButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  confirmTitle: string;
  confirmMessage: string;
  confirmDanger?: boolean;
}

export function ConfirmSubmitButton({ 
  confirmTitle, 
  confirmMessage, 
  confirmDanger, 
  children,
  onClick,
  ...props 
}: ConfirmSubmitButtonProps) {
  const { pending } = useFormStatus();
  const { confirm } = useConfirm();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const form = e.currentTarget.closest("form");
    
    if (onClick) {
      onClick(e);
    }
    
    confirm({
      title: confirmTitle,
      message: confirmMessage,
      danger: confirmDanger,
      onConfirm: () => {
        if (form) {
          form.requestSubmit();
        }
      }
    });
  };

  return (
    <button 
      type="submit" 
      onClick={handleClick} 
      disabled={pending || props.disabled} 
      {...props}
    >
      {pending ? "Memproses..." : children}
    </button>
  );
}
