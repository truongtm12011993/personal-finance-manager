"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import type { CSSProperties } from "react";

type MoneyInputProps = {
  name: string;
  value?: string | number | null;
  defaultValue?: string | number | null;
  placeholder?: string;
  required?: boolean;
  className?: string;
  style?: CSSProperties;
  inputMode?: "decimal" | "numeric";
  allowDecimal?: boolean;
  maxDecimals?: number;
  onValueChange?: (value: number | null) => void;
  onBlur?: () => void;
  autoFocus?: boolean;
};

/**
 * Format string digits with dot separators for thousands.
 */
function groupDigits(digits: string) {
  if (!digits) return "";
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/**
 * Modern format logic focusing on Vietnamese standard (comma for decimal).
 */
function formatMoneyInput(value: string, allowDecimal: boolean, maxDecimals: number) {
  // 1. Keep only digits and decimal comma
  const cleaned = value.replace(/[^\d,]/g, "");

  if (allowDecimal) {
    const parts = cleaned.split(",");
    const intPart = parts[0].replace(/\D/g, "");
    const grouped = groupDigits(intPart || (parts.length > 1 ? "0" : ""));
    
    if (parts.length > 1) {
      const decPart = parts[1].replace(/\D/g, "").slice(0, maxDecimals);
      return `${grouped},${decPart}`;
    }
    return grouped;
  }

  const digits = cleaned.replace(/\D/g, "");
  return groupDigits(digits);
}

/**
 * Parse the formatted string back to a numeric value.
 */
function parseMoneyInput(value: string) {
  if (!value) return null;
  const raw = value.replace(/\./g, "").replace(/,/g, "."); // Convert to standard JS decimal
  const parsed = parseFloat(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

function formatInitial(input: string | number | null | undefined, allowDecimal: boolean, maxDecimals: number) {
  if (input === null || input === undefined || input === "") return "";
  if (typeof input === "number") {
    // Standardize to VN format for initial display
    const parts = input.toString().split(".");
    const intPart = groupDigits(parts[0]);
    if (allowDecimal && parts[1]) {
      return `${intPart},${parts[1].slice(0, maxDecimals)}`;
    }
    return intPart;
  }
  return formatMoneyInput(input.toString(), allowDecimal, maxDecimals);
}

export function MoneyInput({
  name,
  value,
  defaultValue,
  placeholder,
  required,
  className,
  style,
  inputMode = "decimal",
  allowDecimal = false,
  maxDecimals = 2,
  onValueChange,
  onBlur,
  autoFocus,
}: MoneyInputProps) {
  const isControlled = value !== undefined;
  const initialValue = useMemo(() => {
    const source = isControlled ? value : defaultValue;
    return formatInitial(source, allowDecimal, maxDecimals);
  }, [isControlled, value, defaultValue, allowDecimal, maxDecimals]);

  const [innerValue, setInnerValue] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isControlled) {
      const formatted = formatInitial(value, allowDecimal, maxDecimals);
      if (formatted !== innerValue) {
        setInnerValue(formatted);
      }
    }
  }, [isControlled, value, allowDecimal, maxDecimals, innerValue]);

  return (
    <input
      ref={inputRef}
      type="text"
      inputMode={inputMode}
      name={name}
      className={className}
      style={style}
      placeholder={placeholder}
      required={required}
      value={innerValue}
      autoFocus={autoFocus}
      onChange={(event) => {
        const input = event.target;
        const rawValue = input.value;
        // 1. Format the new value
        const next = formatMoneyInput(rawValue, allowDecimal, maxDecimals);
        
        // 2. Set the value
        setInnerValue(next);

        // 3. Inform parent
        if (onValueChange) {
          onValueChange(parseMoneyInput(next));
        }

        // 4. Cursor position stabilization
        // (Simple version: cursor usually stays at end on format change in text inputs, 
        // but for high-precision we could calculate diff)
      }}
      onBlur={onBlur}
    />
  );
}
