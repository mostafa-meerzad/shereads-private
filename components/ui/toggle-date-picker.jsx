"use client";

import { useState, useMemo } from "react";
import { Calendar } from "../ui/persian-calendar";
import { Button } from "@/components/ui/button";
import { getDateLib } from "react-day-picker/persian";

export default function ToggleDatePicker({ value, onChange }) {
  const [open, setOpen] = useState(false);

  // value is expected to be an ISO datetime string or a Date
  const dateObj = useMemo(() => {
    if (!value) return null;
    if (typeof value === "string") {
      const d = new Date(value);
      return isNaN(d.getTime()) ? null : d;
    }
    return value instanceof Date ? value : null;
  }, [value]);

  // Format the displayed date using Persian calendar formatting
  const dateLib = getDateLib();
  const display = useMemo(() => {
    if (!dateObj) return null;
    try {
      // Use Intl to produce Persian calendar year/month/day
      const formatter = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
      return formatter.format(dateObj);
    } catch {
      // Fallback: try dateLib to produce components
      try {
        const y = dateLib.getYear(dateObj);
        const m = String(dateLib.getMonth(dateObj) + 1).padStart(2, "0");
        const d = String(dateLib.getDate(dateObj)).padStart(2, "0");
        return `${y}/${m}/${d}`;
      } catch {
        return null;
      }
    }
  }, [dateObj, dateLib]);

  return (
    <div className="space-y-2 relative">
      <label className="block text-sm text-slate-600">تاریخ انتشار</label>

      <Button
        type="button"
        className="rounded-full bg-emerald-700 hover:bg-emerald-800 text-white text-sm"
        onClick={() => setOpen(!open)}
      >
        {display ? `تاریخ: ${display}` : "انتخاب تاریخ"}
      </Button>

      {open && (
        <div className="border rounded-xl p-2 absolute bg-white drop-shadow-2xl">
          <Calendar
            mode="single"
            selected={dateObj}
            onSelect={(d) => {
              // Calendar returns a Date object — convert to ISO string for the parent
              if (!d) {
                onChange(null);
              } else if (d instanceof Date && !isNaN(d.getTime())) {
                onChange(d.toISOString());
              } else {
                onChange(d);
              }
              setOpen(false);
            }}
          />
        </div>
      )}
    </div>
  );
}
