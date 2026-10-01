"use client";

import { Label, ListBox, Select } from "@heroui/react";
import { cn } from "@/lib/utils";

interface ResearchSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  disabled?: boolean;
  className?: string;
}

export function ResearchSelect({ label, value, onChange, options, disabled, className }: ResearchSelectProps) {
  return (
    <Select value={value} onChange={(key) => { if (key !== null) onChange(String(key)); }} isDisabled={disabled} className={cn("w-full sm:w-60", className)}>
      <Label>{label}</Label>
      <Select.Trigger>
        <Select.Value />
        <Select.Indicator />
      </Select.Trigger>
      <Select.Popover>
        <ListBox>
          {options.map((option) => (
            <ListBox.Item key={option.value} id={option.value} textValue={option.label}>
              {option.label}
              <ListBox.ItemIndicator />
            </ListBox.Item>
          ))}
        </ListBox>
      </Select.Popover>
    </Select>
  );
}
