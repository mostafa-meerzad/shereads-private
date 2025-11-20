"use client";
import img2 from "@/assets/onboarding-img-2.png";
import img3 from "@/assets/onboarding-img-3.png";
import img4 from "@/assets/onboarding-img-4.png";
import img5 from "@/assets/onboarding-img-5.png";
import img6 from "@/assets/onboarding-img-6.png";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";

const formData = [
  {
    question: " کدام ژانرها را بیشتر دوست دارید ؟",
    answers: [
      "داستان",
      "ادبیات",
      "رمانتیک",
      "تخیلی",
      "تاریخی",
      "توسعه فردی",
      "بیوگرافی",
      "فانتزی",
      "آموزش مهارت",
    ],
    img: img6,
  },
  {
    question: " حالت مورد نظرتان برای خواندن چیست؟",
    answers: [
      "آرام",
      "الهام بخش",
      "احساسی",
      "معلوماتی",
      "پرهیجان",
      "احساس خوب",
    ],
    img: img2,
  },
  {
    question: "در کدام گروه سنی قرار دارید؟",
    answers: ["۱۷-۱۲", "۲۵-۱۸", "۳۵-۲۶", "۵۰-۳۶", "۵۰+"],
    img: img3,
  },
  {
    question: "طول کتاب مورد علاقه تان چیست؟",
    answers: [
      "کوتاه کمتر از ۲۰۰ صفحه",
      "متوسط ۲۰۰ تا ۴۰۰ صفحه",
      "بلند ۴۰۰ صفحه به بالا",
    ],
    img: img4,
  },
  {
    question: "هدف شما از کتاب خوانی چیست؟",
    answers: ["سرگرمی", "یادگیری", "رشد فردی", "بهبود مهارت ها"],
    img: img5,
  },
];

const containerVariants = {
  enter: { opacity: 0, x: 20 },
  center: {
    opacity: 1,
    x: 0,
    transition: { when: "beforeChildren", staggerChildren: 0.06 },
  },
  exit: { opacity: 0, x: -20 },
};

const answerVariants = {
  enter: { opacity: 0, y: 8 },
  center: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 22 },
  },
  exit: { opacity: 0, y: 8 },
};

export default function MultiStepForm() {
  const { control, handleSubmit, watch } = useForm({
    defaultValues: { answers: {} },
  });
  const [step, setStep] = useState(0);
  const selected = watch(`answers.${step}`);

  const onSubmit = (data) => {
    // Replace with your API call or logic
    console.log("Final submitted data", data);
    alert("Form submitted! check console for data");
  };

  return (
    <section className="min-h-screen md:h-[45rem] lg:h-[50rem] flex items-center justify-center  bg-gray-50 px-6 max-md:py-12 md:p-0">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full h-full inset-0 max-w-4xl bg-white rounded-3xl shadow p-10 grid grid-cols-1 md:grid-cols-2 gap-10 md:items-center md:p-0 md:pr-8 md:min-w-screen md:items-start "
      >
        <div className="hidden md:block md:min-h-screen lg:max-w-[40rem]  w-full relative overflow-hidden md:h-[45rem] h-[50rem]">
          <AnimatePresence mode="wait">
            <motion.div
              key={formData[step].img.src} // important for animation change
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="absolute inset-0"
            >
              <Image
                src={formData[step].img}
                alt="Step illustration"
                fill
                className="object-cover w-full h-full"
                priority
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right Form */}
        <div className="flex h-fit w-full sm:px-10 md:px-5 flex-col lg:w-4/5  justify-between  justify-self-center md:mt-20 lg:mt-20">
          {/* Step indicator */}
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="relative flex justify-center gap-6 sm:gap-8 md:gap-8 md:mb-16 w-full mb-16 lg:mb-32 lg:justify-between"
          >
            {formData.map((_, i) => (
              <motion.div
                key={i}
                animate={{ scale: i === step ? 1.03 : 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className={`relative size-10 md:size-8 lg:size-10 rounded-full border-2 flex items-center justify-center text-sm ${
                  i === step
                    ? "bg-green-700 text-white border-green-700"
                    : i < step
                    ? "bg-green-100 text-green-700 border-green-600"
                    : "bg-white text-gray-400 border-gray-300"
                }`}
              >
                {i + 1}
                {i < formData.length - 1 && (
                  <div
                    className={`absolute w-10 lg:w-16 xl:w-24  h-0.5 left-full transition-all duration-500 ${
                      i === step
                        ? "bg-green-700 text-white border-green-700"
                        : i < step
                        ? "bg-green-600 text-green-700 border-green-600"
                        : "bg-gray-300 text-gray-400 border-gray-300"
                    }`}
                  ></div>
                )}
              </motion.div>
            ))}
          </motion.div>

          {/* Question + Answers with animated step transitions */}
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={step}
              variants={containerVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className=""
            >
              <motion.h2
                className="text-xl max-md:text-center font-medium text-gray-800 mb-6 text-right"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
              >
                {formData[step].question}
              </motion.h2>

              <Controller
                control={control}
                name={`answers.${step}`}
                rules={{ required: true }}
                render={({ field }) => (
                  <div className="flex flex-col items-end gap-4 mb-8 md:max-h-[18rem] lg:max-h-[25rem] md:overflow-y-scroll md:overflow-x-hidden p-2">
                    {formData[step].answers.map((answer, idx) => {
                      const isSelected = field.value === answer;
                      return (
                        <motion.button
                          key={idx}
                          type="button"
                          onClick={() => field.onChange(answer)}
                          variants={answerVariants}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`w-full border rounded-full py-3 transition text-right px-6 focus:outline-none max-md:text-center md:max-w-4/5 ${
                            isSelected
                              ? "bg-green-700 text-white border-green-700"
                              : "border-green-700 text-green-700 bg-white hover:bg-green-50"
                          }`}
                        >
                          {answer}
                        </motion.button>
                      );
                    })}
                  </div>
                )}
              />

              {/* Navigation */}
              <motion.div className="flex justify-between items-center mt-4">
                {step > 0 ? (
                  <motion.button
                    type="button"
                    onClick={() => setStep(step - 1)}
                    whileHover={{ y: -2 }}
                    className="px-6 py-2 rounded-full border border-gray-400 text-gray-600 hover:bg-gray-100"
                  >
                    قبلی
                  </motion.button>
                ) : (
                  <div />
                )}

                {step < formData.length - 1 ? (
                  <motion.button
                    type="button"
                    disabled={!selected}
                    onClick={() => selected && setStep(step + 1)}
                    whileHover={selected ? { y: -2 } : {}}
                    className={`px-6 py-2 rounded-full border ${
                      selected
                        ? "bg-green-700 text-white border-green-700"
                        : "bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed"
                    }`}
                  >
                    بعدی
                  </motion.button>
                ) : (
                  <motion.button
                    type="submit"
                    disabled={!selected}
                    whileHover={selected ? { y: -2 } : {}}
                    className={`px-6 py-2 rounded-full border ${
                      selected
                        ? "bg-green-700 text-white border-green-700"
                        : "bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed"
                    }`}
                  >
                    تایید
                  </motion.button>
                )}
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </form>
    </section>
  );
}
