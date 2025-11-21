import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const LoadingTexts = ({ onComplete }) => {
  const texts = [
    "ما در حال انتخاب بهترین کتاب‌ها برای شما هستیم، لطفاً چند لحظه منتظر بمانید",
    "در حال بررسی سلیقهٔ مطالعاتی شما",
    "در حال تحلیل پاسخ‌های شما برای یافتن مناسب‌ترین کتاب‌ها",
    "کتاب‌هایی که احتمالاً دوست خواهید داشت در راه هستند",
  ];

  const [index, setIndex] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % texts.length);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (index === texts.length - 1) {
      console.log("end of the array reached");
      onComplete();
      return;
    }
  }, [index, onComplete, texts.length]);

  return (
    <div className="relative  flex items-center justify-center ">
      <AnimatePresence mode="wait">
        <motion.p
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="text-center text-xl md:text-2xl text-green-900"
        >
          {texts[index]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
};

export default LoadingTexts;
