"use client";

import * as React from "react";
import { createPortal } from "react-dom";

// simple className joiner
function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

// Context to share open state across Dialog subcomponents
type DialogContextValue = { open: boolean; setOpen: (next: boolean) => void };
const DialogCtx = React.createContext<DialogContextValue | null>(null);

function useDialogCtx() {
  const ctx = React.useContext(DialogCtx);
  if (!ctx) throw new Error("Dialog components must be used within <Dialog>");
  return ctx;
}

// Root
export function Dialog({
  open: openProp,
  onOpenChange,
  children,
}: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const isControlled = typeof openProp === "boolean";
  const open = isControlled ? (openProp as boolean) : internalOpen;
  const setOpen = (next: boolean) => {
    if (!isControlled) setInternalOpen(next);
    onOpenChange?.(next);
  };
  return (
    <DialogCtx.Provider value={{ open, setOpen }}>{children}</DialogCtx.Provider>
  );
}

// Trigger: clones its single child and wires onClick to open
type ClickHandler = (e: React.MouseEvent<HTMLElement>) => void;
interface ClickableProps { onClick?: ClickHandler }
type ClickableElement = React.ReactElement<ClickableProps>;

export function DialogTrigger({ children }: { children: ClickableElement }) {
  const { setOpen } = useDialogCtx();
  const child = React.Children.only(children) as ClickableElement;
  const handleClick: ClickHandler = (e) => {
    child.props.onClick?.(e);
    setOpen(true);
  };
  return React.cloneElement(child, { onClick: handleClick });
}

// Portal (for compatibility) - just renders children; real portal is in Content
export function DialogPortal({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

// Close: clones child or renders a default button
export function DialogClose({ children }: { children?: ClickableElement | string }) {
  const { setOpen } = useDialogCtx();
  if (children && React.isValidElement(children)) {
    const el = children as ClickableElement;
    const handleClick: ClickHandler = (e) => {
      el.props.onClick?.(e);
      setOpen(false);
    };
    return React.cloneElement(el, { onClick: handleClick });
  }
  return (
    <button type="button" onClick={() => setOpen(false)} aria-label="Close">
      {children ?? "✕"}
    </button>
  );
}

// Overlay
export function DialogOverlay({ className }: { className?: string }) {
  const { open, setOpen } = useDialogCtx();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  if (!mounted || !open) return null;
  return createPortal(
    <div
      onClick={() => setOpen(false)}
      className={cx(
        "fixed inset-0 z-50 bg-black/50",
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        className
      )}
    />,
    document.body
  );
}

// Content
export function DialogContent({
  className,
  children,
  showCloseButton = true,
}: {
  className?: string;
  children?: React.ReactNode;
  showCloseButton?: boolean;
}) {
  const { open, setOpen } = useDialogCtx();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  if (!mounted || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 grid place-items-center">
      {/* click-through blocker */}
      <div className="absolute inset-0" onClick={() => setOpen(false)} />
      <div
        role="dialog"
        aria-modal="true"
        className={cx(
          "relative z-50 w-full max-w-[calc(100%-2rem)] rounded-lg border bg-white p-6 shadow-lg sm:max-w-lg",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          className
        )}
      >
        {showCloseButton && (
          <button
            type="button"
            aria-label="Close"
            onClick={() => setOpen(false)}
            className="absolute right-4 top-4 rounded p-1 opacity-70 transition-opacity hover:opacity-100"
          >
            <span aria-hidden>×</span>
          </button>
        )}
        {children}
      </div>
    </div>,
    document.body
  );
}

// Simple wrappers for structure/typography
export function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cx("flex flex-col gap-2 text-center sm:text-left", className)} {...props} />;
}

export function DialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cx("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)} {...props} />;
}

export function DialogTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cx("text-lg font-semibold leading-none", className)} {...props} />;
}

export function DialogDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cx("text-sm text-gray-600", className)} {...props} />;
}
