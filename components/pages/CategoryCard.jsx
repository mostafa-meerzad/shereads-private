import React from "react";

const CategoryCard = ({ title, description, selected, onToggle }) => {
  return (
    <div
      dir="rtl"
      onClick={onToggle}
      className={`cursor-pointer select-none rounded-lg border border-green-800/30 p-5 transition-shadow hover:shadow-md flex flex-col justify-between min-h-[120px] ${
        selected ? "border-green-700 bg-green-50" : "border-gray-200 bg-white"
      }`}
    >
      <div>
        <h3 className={`text-right text-base font-medium ${selected ? "text-green-800" : "text-gray-800"}`}>
          {title}
        </h3>
        <p className="mt-2 text-right text-sm text-gray-600">{description}</p>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className={`text-sm ${selected ? "text-green-700" : "text-gray-500"}`}>
          {selected ? "انتخاب شده" : "انتخاب کنید"}
        </div>
        <div
          className={`h-5 w-5 rounded-full border flex items-center justify-center ${
            selected ? "bg-green-700 border-green-700 text-white" : "bg-white border-gray-300"
          }`}
        >
          {selected ? "✓" : ""}
        </div>
      </div>
    </div>
  );
};

export default CategoryCard;
