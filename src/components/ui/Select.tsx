"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type MouseEvent } from "react";
import { Check, ChevronDown } from "lucide-react";

export type SelectOption = {
  value: string;
  label: string;
};

export function Select({
  name,
  options,
  defaultValue,
  placeholder = "নির্বাচন করুন",
  className,
}: {
  name: string;
  options: SelectOption[];
  defaultValue?: string;
  placeholder?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(defaultValue ?? "");
  const [activeIndex, setActiveIndex] = useState(() =>
    Math.max(0, options.findIndex((o) => o.value === defaultValue)),
  );

  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const selected = options.find((o) => o.value === value);

  function close() {
    setOpen(false);
  }

  function openMenu() {
    setActiveIndex(Math.max(0, options.findIndex((o) => o.value === value)));
    setOpen(true);
  }

  function toggle() {
    if (open) {
      close();
    } else {
      openMenu();
    }
  }

  function selectOption(next: string) {
    setValue(next);
    close();
    buttonRef.current?.focus();
  }

  // Close on outside click and on Escape, wherever focus is.
  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        close();
      }
    }
    function onKeyDown(e: globalThis.KeyboardEvent) {
      if (e.key === "Escape") {
        close();
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  function handleButtonKeyDown(e: KeyboardEvent<HTMLButtonElement>) {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) {
        openMenu();
        return;
      }
      if (e.key === "ArrowDown") {
        setActiveIndex((i) => Math.min(i + 1, options.length - 1));
      } else {
        setActiveIndex((i) => Math.max(i - 1, 0));
      }
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (!open) {
        openMenu();
        return;
      }
      const option = options[activeIndex];
      if (option) {
        selectOption(option.value);
      }
    }
  }

  // Clicking anywhere on the control (including a wrapping label) opens the
  // menu; the trigger button and options stop propagation to handle their own.
  function handleRootClick(e: MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget || (e.target as HTMLElement).closest("label")) {
      if (!open) {
        openMenu();
      }
    }
  }

  return (
    <div ref={rootRef} onClick={handleRootClick} className={`relative ${className ?? ""}`}>
      <input type="hidden" name={name} value={value} />

      <button
        ref={buttonRef}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          toggle();
        }}
        onKeyDown={handleButtonKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="input flex items-center justify-between gap-2 text-left"
      >
        <span className={selected ? "text-ink-900" : "text-ink-300"}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-ink-500 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label={name}
          className="absolute z-30 mt-1.5 max-h-56 w-full overflow-y-auto rounded-xl border border-cream-300 bg-white py-1.5 shadow-xl shadow-navy-950/10"
        >
          {options.map((option, index) => {
            const isSelected = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                tabIndex={-1}
                onClick={(e) => {
                  e.stopPropagation();
                  selectOption(option.value);
                }}
                onMouseEnter={() => setActiveIndex(index)}
                className={`flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm transition ${
                  index === activeIndex ? "bg-cream-100 text-ink-900" : "text-ink-700"
                }`}
              >
                <span className={isSelected ? "font-medium text-brand-700" : ""}>
                  {option.label}
                </span>
                {isSelected && (
                  <Check className="h-4 w-4 shrink-0 text-brand-500" strokeWidth={2.5} />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
