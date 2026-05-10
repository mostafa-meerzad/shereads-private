"use client";

import { useState, useRef } from "react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { X } from "lucide-react";

export default function MultiSelectWithTags({
  className,
  label,
  options,
  values,
  onChange,
}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef(null);

  const toggle = (val) => {
    if (values.includes(val)) {
      onChange(values.filter((v) => v !== val));
    } else {
      onChange([...values, val]);
    }
  };

  const removeTag = (val) => {
    onChange(values.filter((v) => v !== val));
  };

  return (
    <div className={`space-y-1 ${className}`}>
      <label className="block text-sm text-slate-600">{label}</label>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger ref={triggerRef} className="w-full">
          <div
            className="w-full min-h-[44px] border rounded-xl p-2 flex flex-wrap gap-2 items-center justify-start cursor-pointer"
            onClick={() => setOpen(true)}
          >
            {values.length === 0 && (
              <span className="text-slate-400 text-sm">انتخاب...</span>
            )}

            {values.map((v) => (
              <span
                key={v}
                className="flex items-center gap-1 bg-emerald-600 text-white px-2 py-1 rounded-full text-xs"
              >
                {v}
                <X
                  className="size-3 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeTag(v);
                  }}
                />
              </span>
            ))}
          </div>
        </PopoverTrigger>

        <PopoverContent className="w-[250px] p-2 space-y-1" dir="rtl">
          {options.map((option) => (
            <div
              key={option}
              onClick={() => toggle(option)}
              className={`p-2 rounded-md cursor-pointer text-sm border 
              ${
                values.includes(option)
                  ? "bg-emerald-600 text-white border-emerald-700"
                  : "border-slate-300"
              }`}
            >
              {option}
            </div>
          ))}
        </PopoverContent>
      </Popover>
    </div>
  );
}
