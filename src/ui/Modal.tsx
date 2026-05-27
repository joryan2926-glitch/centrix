"use client";

import { X } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/ui/Button";
import { Card } from "@/ui/Card";

type ModalProps = {
  title: string;
  open: boolean;
  children: ReactNode;
  onClose: () => void;
};

export function Modal({ title, open, children, onClose }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-md">
      <Card className="w-full max-w-xl p-5 animate-fade-in">
        <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <Button aria-label="Fermer" className="h-9 w-9 px-0" onClick={onClose} variant="ghost">
            <X size={18} />
          </Button>
        </div>
        <div className="pt-5">{children}</div>
      </Card>
    </div>
  );
}
