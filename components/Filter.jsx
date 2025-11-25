"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";

// Predefined values (easy to modify)
const genres = [
  "داستان",
  "ادبیات",
  "رمانتیک",
  "تخیلی",
  "تاریخی",
  "توسعه_فردی",
  "بیوگرافی",
  "فانتزی",
  "آموزش_مهارت",
];

const Filters = ({ setFilters }) => {
  const handleChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <motion.div
      dir="rtl"
      className=""
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Genre Dropdown */}
      <motion.div whileHover={{ scale: 1.03 }} className="">
        <Select onValueChange={(value) => handleChange("genre", value)}>
          <SelectTrigger
            dir="rtl"
            className="rounded-full w-full border-2 border-emerald-700 text-emerald-700 text-md py-3 px-7 "
          >
            <SelectValue placeholder="ژانر" />
          </SelectTrigger>
          <SelectContent dir="rtl">
            {genres.map((g) => (
              <SelectItem key={g} value={g}>
                {g}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </motion.div>
    </motion.div>
  );
};

export default Filters;
