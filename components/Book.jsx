import { motion } from "framer-motion";
import { BookOpen, Heart } from "lucide-react";
import { Button } from "./ui/button";

const Book = ({ book, favIds, onToggleFav }) => {
  return (
    <motion.div
      layout
      whileHover={{ y: -6 }}
      className="bg-white dark:bg-slate-800 rounded-md shadow-md p-4 flex flex-col items-center"
    >
      <div className="w-full h-80 bg-linear-to-b from-gray-500/20 to-gray-200 rounded-md mb-3 flex justify-center items-center">
        <BookOpen className="size-20 text-gray-500" />
      </div>

      <div className="flex flex-col items-start gap-2 w-full mt-2 mb-4">
        <h4 className="font-semibold text-sm text-emerald-700">{book.title}</h4>

        <p className="text-xs text-gray-800">
          <span className="text-gray-500">نویسنده:</span>{" "}
          <span>{book.author?.name}</span>
        </p>
      </div>

      <div className="flex gap-2 w-full justify-start">
        <Button className="border-emerald-400 rounded-full text-white bg-green-700 hover:bg-green-900 h-10">
          مطالعه
        </Button>

        <motion.button
          whileTap={{ scale: 0.8 }}
          onClick={() => onToggleFav(book.id, favIds.has(book.id))}
          className={`flex justify-center items-center rounded-full size-10 border ${
            favIds.has(book.id)
              ? "bg-green-700 text-white"
              : "bg-white text-green-700 border-gray-300"
          }`}
        >
          <Heart className="size-[.9rem]" />
        </motion.button>
      </div>
    </motion.div>
  );
};

export default Book;
