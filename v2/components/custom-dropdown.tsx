"use client";

import { useEffect, useId, useRef, useState, type CSSProperties, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown } from "lucide-react";

export type DropdownOption = { value: string; label: string; description?: string };

export function CustomDropdown({
  value,
  options,
  onChange,
  ariaLabel,
  className = "",
  size = "md",
}: {
  value: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
  ariaLabel: string;
  className?: string;
  size?: "sm" | "md";
}) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(Math.max(0, options.findIndex((option) => option.value === value)));
  const [menuStyle, setMenuStyle] = useState<CSSProperties>({ position: "fixed", top: 8, left: 8, width: 190, zIndex: 9999 });
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const id = useId();
  const selected = options.find((option) => option.value === value) ?? options[0];

  useEffect(() => {
    setActiveIndex(Math.max(0, options.findIndex((option) => option.value === value)));
  }, [value, options]);

  useEffect(() => {
    if (!open) return;
    const placeMenu = () => {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const width = Math.min(Math.max(rect.width, 190), window.innerWidth - 16);
      const height = Math.min(260, Math.max(48, options.length * 44 + 10));
      const above = rect.bottom + height + 8 > window.innerHeight && rect.top > height;
      setMenuStyle({ position: "fixed", top: above ? Math.max(8, rect.top - height - 6) : Math.max(8, Math.min(rect.bottom + 6, window.innerHeight - height - 8)), left: Math.max(8, Math.min(rect.left, window.innerWidth - width - 8)), width, zIndex: 9999 });
    };
    const handlePointer = (event: PointerEvent) => {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target) && !listRef.current?.contains(event.target)) setOpen(false);
    };
    const handleKey = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    placeMenu();
    document.addEventListener("pointerdown", handlePointer);
    document.addEventListener("keydown", handleKey);
    window.addEventListener("resize", placeMenu);
    window.addEventListener("scroll", placeMenu, true);
    return () => {
      document.removeEventListener("pointerdown", handlePointer);
      document.removeEventListener("keydown", handleKey);
      window.removeEventListener("resize", placeMenu);
      window.removeEventListener("scroll", placeMenu, true);
    };
  }, [open, options.length]);

  useEffect(() => {
    if (open) listRef.current?.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`)?.scrollIntoView({ block: "nearest" });
  }, [open, activeIndex]);

  if (!selected) return null;

  function handleTriggerKey(event: ReactKeyboardEvent<HTMLButtonElement>) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) setOpen(true);
      setActiveIndex((current) => event.key === "ArrowDown" ? (current + 1) % options.length : (current - 1 + options.length) % options.length);
    } else if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      setOpen(true);
      setActiveIndex(event.key === "Home" ? 0 : options.length - 1);
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (open) {
        const option = options[activeIndex];
        if (option) onChange(option.value);
        setOpen(false);
      } else setOpen(true);
    }
  }

  return (
    <div ref={rootRef} className={`custom-dropdown relative min-w-0 ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        className={`custom-dropdown-trigger ${size === "sm" ? "custom-dropdown-trigger-sm" : ""}`}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-list`}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={handleTriggerKey}
      >
        <span className="min-w-0 truncate">{selected.label}</span>
        <ChevronDown size={size === "sm" ? 14 : 16} className={`shrink-0 text-neutral-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && typeof document !== "undefined" && createPortal(
        <div ref={listRef} id={`${id}-list`} role="listbox" aria-label={ariaLabel} style={menuStyle} className="custom-dropdown-menu custom-dropdown-menu-portal">
          {options.map((option, index) => {
            const isSelected = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                data-index={index}
                className={`custom-dropdown-option ${isSelected ? "is-selected" : ""} ${index === activeIndex ? "is-active" : ""}`}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => { onChange(option.value); setOpen(false); triggerRef.current?.focus(); }}
                onKeyDown={(event) => {
                  if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                    event.preventDefault();
                    setActiveIndex((current) => event.key === "ArrowDown" ? (current + 1) % options.length : (current - 1 + options.length) % options.length);
                    listRef.current?.querySelector<HTMLElement>(`[data-index="${event.key === "ArrowDown" ? (index + 1) % options.length : (index - 1 + options.length) % options.length}"]`)?.focus();
                  }
                  if (event.key === "Enter") { event.preventDefault(); onChange(option.value); setOpen(false); triggerRef.current?.focus(); }
                }}
              >
                <span className="min-w-0 flex-1 text-left">
                  <span className="block truncate">{option.label}</span>
                  {option.description && <span className="mt-0.5 block text-[11px] font-normal text-neutral-400">{option.description}</span>}
                </span>
                {isSelected && <Check size={15} className="shrink-0 text-[#F05A28]" />}
              </button>
            );
          })}
        </div>,
        document.body
      )}
    </div>
  );
}
