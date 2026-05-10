"use client";

import { useState, useRef } from "react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { X } from "lucide-react";

export default function MultiSelectFilter({
  label,
  options,
  values,
  onChange,
  className = "",
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
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger ref={triggerRef} className="w-full">
          <div
            className="w-full border rounded-full p-2 flex flex-wrap gap-2 items-center justify-start cursor-pointer bg-green-600/20 border-emerald-700 text-emerald-700 text-sm px-6 min-w-32"
            onClick={() => setOpen(true)}
          >
            {label}
          </div>
        </PopoverTrigger>

        <PopoverContent className="w-[180px] p-1 space-y-0.5 ml-5" dir="rtl">
          {options.map((opt) => (
            <div
              key={opt.value}
              onClick={() => toggle(opt.value)}
              className={`p-2 rounded-md cursor-pointer text-sm  
              ${
                values.includes(opt.value)
                  ? "bg-green-600/20 text-black border-emerald-700"
                  : "border-slate-300 "
              }`}
            >
              {opt.label}
            </div>
          ))}
        </PopoverContent>
      </Popover>
    </div>
  );
}
