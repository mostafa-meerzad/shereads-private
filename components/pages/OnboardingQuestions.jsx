// OnboardingQuestions.jsx
"use client";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import usePaginatedAuthors from "@/hooks/usePaginatedAuthors"; // adjust path if needed
import { useAuthClient } from "@/hooks/useAuthClient";

// Image imports placeholder (user will replace)
import img2 from "@/assets/onboarding-img-2.jpg";
import img3 from "@/assets/onboarding-img-3.jpg";
import img4 from "@/assets/onboarding-img-4.jpg";
import img5 from "@/assets/onboarding-img-5.jpg";
import img6 from "@/assets/onboarding-img-6.jpg";
import img8 from "@/assets/onboarding-img-8.png";
import { Button } from "../ui/button";
import CategoryCard from "./CategoryCard";

const formData = [
  {
    question: " کدام دسته‌بندی‌ها را بیشتر دوست دارید ؟",
    answers: [
      {
        id: "educational",
        label: "کتاب‌های تعلیمی (درسی)",
      },
      {
        id: "language",
        label: "کتاب‌های زبان‌آموزی",
      },
      {
        id: "life_skills",
        label: "کتاب‌های مهارت‌های زندگی و فنی",
      },
      {
        id: "self_growth",
        label: "کتاب‌های رشد فردی و روان‌شناسی",
      },
      {
        id: "literature",
        label: "کتاب‌های ادبیات و فرهنگ",
      },
    ],
    img: img6,
  },
  {
    question: " حالت مورد نظرتان برای خواندن چیست؟",
    answers: [
      "آرام",
      "الهام_بخش",
      "احساسی",
      "معلوماتی",
      "پرهیجان",
      "احساس_خوب",
    ],
    img: img2,
  },
  {
    question: "در کدام گروه سنی قرار دارید؟",
    answers: ["۱۲–۱۷", "۱۸–۲۵", "۲۶–۳۵", "۳۶–۵۰", "۵۰+"],
    img: img3,
  },
  {
    question: "طول کتاب مورد علاقه تان چیست؟",
    answers: ["کوتاه", "متوسط", "بلند"],
    img: img4,
  },
  {
    question: "هدف شما از کتاب خوانی چیست؟",
    answers: ["سرگرمی", "یادگیری", "رشد_فردی", "بهبود_مهارت_ها"],
    img: img5,
  },
  // NEW: authors step (answers will be fetched from backend)
  {
    question: "نویسندگانی که دوست دارید را انتخاب کنید",
    answers: [], // populated by hook at runtime
    img: img6, // choose an appropriate image; you can replace with a different one
    isAuthorsStep: true,
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

const backendKeys = {
  0: "categories",
  1: "mood",
  2: "Age",
  3: "book_length",
  4: "Motivation",
  5: "author",
};

const OnboardingQuestions = ({ onComplete }) => {
  const { user } = useAuthClient();
  const totalQuestions = formData.length; // now includes authors
  const finalStepIndex = totalQuestions; // final screen after all questions
  const { control, handleSubmit, reset } = useForm({
    defaultValues: { answers: {} },
  });
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (user) {
      const initialAnswers = {};

      Object.keys(backendKeys).forEach((stepIndex) => {
        const key = backendKeys[stepIndex];
        let val = user[key];

        if (val) {
          // If it's a string that looks like JSON, parse it (categories, author, etc. might be stored as strings in some DB setups)
          if (
            typeof val === "string" &&
            (val.startsWith("[") || val.startsWith("{"))
          ) {
            try {
              val = JSON.parse(val);
            } catch {}
          }

          if (Array.isArray(val)) {
            initialAnswers[stepIndex] = val;
          } else {
            // Single select values (mood, Age) should be wrapped in an array for the form
            initialAnswers[stepIndex] = [val];
          }
        }
      });

      if (Object.keys(initialAnswers).length > 0) {
        reset((prev) => ({
          ...prev,
          answers: {
            ...prev.answers,
            ...initialAnswers,
          },
        }));
      }
    }
  }, [user, reset]);

  // useWatch for currently selected answers on current step
  const selected =
    useWatch({ control, name: `answers.${step}`, defaultValue: [] }) || [];

  // Hook for authors step (pageable)
  const {
    data: authorsData = [],
    page: authorsPage,
    setPage: setAuthorsPage,
    pages: authorsPages,
    isLoading: authorsLoading,
    isFetching: authorsFetching,
    nextPage: authorsNextPage,
    prevPage: authorsPrevPage,
    refetch: refetchAuthors,
  } = usePaginatedAuthors({ initialPage: 1, limit: 8 });

  const onSubmit = (data) => {
    const transformed = {};

    Object.keys(data.answers).forEach((key) => {
      const backendKey = backendKeys[key];
      const value = data.answers[key];

      // but also keep categories for user profile update
      if (backendKey === "categories") {
        transformed["categories"] = value || [];
      } else if (backendKey === "Age" || backendKey === "mood") {
        // age & mood are SINGLE SELECT, so send as string
        transformed[backendKey] = value && value.length > 0 ? value[0] : null;
      } else {
        // everything else MULTI SELECT (including Authors)
        transformed[backendKey] = value || [];
      }
    });

    // move to final and call onComplete
    setStep(finalStepIndex);
    onComplete(transformed);
  };

  // FINAL STEP UI
  if (step === finalStepIndex) {
    return (
      <div className=" w-full  bg-white shadow p-10 grid  md:grid-cols-2 gap-10 max-md:gap-0 items-center ">
        {/* Image animation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.6,
            type: "spring",
            stiffness: 110,
            damping: 20,
          }}
          className="relative w-full h-120 md:h-full max-md:order-1"
        >
          <Image
            src={img8}
            alt="Final"
            width={500}
            height={500}
            className="object-contain size-full "
          />
        </motion.div>

        {/* Right side */}
        <div className="flex flex-col items-center md:items-end gap-10 md:gap-16 lg:gap-20 text-right  h-full max-md:pb-10 py-32 max-md:order-0 ">
          {/* Progress bullets animation (staggered) */}
          <motion.div
            className="relative flex justify-center gap-6 sm:gap-8 md:gap-8 w-full  lg:justify-between"
            initial="hidden"
            animate="visible"
            variants={{
              visible: {
                transition: { staggerChildren: 0.15 },
              },
            }}
          >
            {Array(totalQuestions + 1) // questions + final
              .fill(undefined)
              .map((_, i) => (
                <motion.div
                  key={i}
                  variants={{
                    hidden: { opacity: 0, scale: 0.5, y: 10 },
                    visible: {
                      opacity: 1,
                      scale: 1,
                      y: 0,
                      transition: {
                        type: "spring",
                        stiffness: 200,
                        damping: 15,
                      },
                    },
                  }}
                  className={`relative size-8 sm:size-10 md:size-9 lg:size-10 rounded-full  flex items-center justify-center text-sm bg-green-700 text-white border-green-700`}
                >
                  {i + 1}
                  {i < totalQuestions && (
                    <div
                      className={`absolute w-10 lg:w-16 xl:w-24  h-0.5 left-full bg-green-700`}
                    ></div>
                  )}
                </motion.div>
              ))}
          </motion.div>

          {/* Text */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-lg text-center max-md:px-5 md:text-xl lg:text-2xl lg:text-end font-medium text-gray-800  leading-loose"
          >
            ما پاسخ‌های شما را دریافت کردیم و آماده‌ایم که بهترین کتاب‌ها را
            برایتان پیدا کنیم
          </motion.h2>

          {/* Button */}
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <Button
              className="bg-green-700 hover:text-gray-200 hover:scale-105 hover:bg-green-900 text-white px-8 py-5 rounded-full transition-all lg:text-lg lg:py-6 lg:px-13"
              type="submit"
            >
              پیدا کردن کتاب‌های من
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  // helper: is current step the authors step?
  const isAuthorsStep = formData[step]?.isAuthorsStep === true;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="grid w-full  max-md:max-w-4xl bg-white p-10  md:grid-cols-[1fr_1fr] gap-20 lg:gap-40 md:items-center md:p-0 md:pr-8 "
    >
      {/* Left image */}
      <div className="hidden col-start-1 md:block relative h-full min-h-screen">
        <AnimatePresence mode="wait">
          <motion.div
            key={formData[step].img.src + String(step)} // ensure unique key when authors step updates
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="absolute inset-0"
          >
            <Image
              src={formData[step].img}
              alt="Step"
              fill
              className="object-cover"
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Right section */}
      <div className="md:col-start-2 flex flex-col w-full md:px-5 justify-between  py-16 md:max-w-xl h-fit lg:justify-start lg:gap-16   justify-self-start">
        {/* Step indicator */}
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative flex justify-center gap-6 sm:gap-8 md:gap-8 w-full  lg:justify-between mb-20 lg:mb-0"
        >
          {Array(totalQuestions + 1) // questions + final
            .fill(undefined)
            .map((_, i) => (
              <motion.div
                key={i}
                animate={{ scale: i === step ? 1.03 : 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className={`relative size-7 md:size-8 lg:size-10 rounded-full border-2 flex items-center justify-center text-sm ${
                  i === step
                    ? "bg-green-700 text-white border-green-700"
                    : i < step
                      ? "bg-green-100 text-green-700 border-green-600"
                      : "bg-white text-gray-400 border-gray-300"
                }`}
              >
                {i + 1}
                {i < totalQuestions && (
                  <div
                    className={`absolute w-10 lg:w-16 xl:w-16  h-0.5 left-full transition-all duration-500 ${
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

        {/* Question + answers */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={step}
            variants={containerVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className=" relative top-0 mx-auto md:max-w-full  md:mx-0 "
          >
            <motion.h2 className="text-2xl text-center font-medium text-gray-800 mb-6 md:text-right">
              {formData[step].question}
            </motion.h2>

            <Controller
              control={control}
              name={`answers.${step}`}
              rules={{ required: !isAuthorsStep }}
              render={({ field }) => {
                const values = field.value || [];

                // step 1 = mood, step 2 = age
                const isSingleSelect = step === 1 || step === 2;

                const handleSelect = (answerValue) => {
                  if (isSingleSelect) {
                    // Always replace with a single selected value
                    field.onChange([answerValue]);
                  } else {
                    // Multi-select as usual
                    if (values.includes(answerValue)) {
                      field.onChange(values.filter((v) => v !== answerValue));
                    } else {
                      field.onChange([...values, answerValue]);
                    }
                  }
                };

                // If we're on the authors step, render the paginated authors list
                if (isAuthorsStep) {
                  return (
                    <div dir="rtl" className="flex flex-col gap-6">
                      <div className="grid md:grid-cols-2 gap-4">
                        {authorsLoading ? (
                          <div className="col-span-2 text-center py-8">
                            در حال بارگیری نویسندگان...
                          </div>
                        ) : (
                          authorsData.map((author) => {
                            const isSelected = values.includes(author.id);
                            return (
                              <button
                                key={author.id}
                                type="button"
                                onClick={() => {
                                  // toggle author.id
                                  handleSelect(author.id);
                                }}
                                className={`lg:w-4/5 border rounded-full py-2 px-6 text-right flex items-center justify-between transition-all duration-300 hover:scale-105  ${
                                  isSelected
                                    ? "bg-green-700 text-white border-green-700"
                                    : "border-green-700 text-green-700 bg-white hover:bg-green-50"
                                }`}
                              >
                                <div className="flex flex-col items-end">
                                  <span className="text-sm font-medium">
                                    {author.name}
                                  </span>
                                  {author.bioShort && (
                                    <span className="text-xs text-gray-500">
                                      {author.bioShort}
                                    </span>
                                  )}
                                </div>
                              </button>
                            );
                          })
                        )}
                      </div>

                      {/* Pagination controls */}
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              if (authorsPage > 1) {
                                setAuthorsPage(authorsPage - 1);
                              }
                            }}
                            disabled={authorsPage <= 1}
                            className="px-5 py-1 text-sm rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                          >
                            صفحه قبلی
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              if (authorsPage < (authorsPages || 1)) {
                                setAuthorsPage(authorsPage + 1);
                              }
                            }}
                            disabled={authorsPage >= (authorsPages || 1)}
                            className="px-4 py-1 text-sm rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                          >
                            صفحه بعدی
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                }

                // Default (non-author) rendering
                return (
                  <div
                    dir="rtl"
                    className={`grid px-8 md:px-0 items-end md:ml-auto gap-4 mb-0 mt-10 ${
                      step === 0 ? "grid-cols-1" : "md:grid-cols-2"
                    }`}
                  >
                    {formData[step].answers.map((answer, idx) => {
                      const isObj =
                        typeof answer === "object" && answer !== null;
                      const answerValue = isObj ? answer.id : answer;
                      const answerLabel = isObj ? answer.label : answer;
                      const isSelected = values.includes(answerValue);

                      if (step === 0) {
                        return (
                          <CategoryCard
                            key={idx}
                            title={answerLabel}
                            description={answer.description}
                            selected={isSelected}
                            onToggle={() => handleSelect(answerValue)}
                          />
                        );
                      }

                      return (
                        <motion.button
                          key={idx}
                          type="button"
                          onClick={() => handleSelect(answerValue)}
                          variants={answerVariants}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`lg:w-4/5 border rounded-full py-2 text-sm px-6 text-right transition ${
                            isSelected
                              ? "bg-green-700 text-white border-green-700"
                              : "border-green-700 text-green-700 bg-white hover:bg-green-50"
                          }`}
                        >
                          {answerLabel}
                        </motion.button>
                      );
                    })}
                  </div>
                );
              }}
            />

            {/* Navigation */}
            <div className="flex justify-between mt-12 md:mt-18 lg:pl-12">
              {step > 0 ? (
                <motion.button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  whileHover={{ y: -2 }}
                  className="px-6 py-1 tex-xs rounded-full border border-gray-400 text-gray-600 hover:bg-gray-100"
                >
                  قبلی
                </motion.button>
              ) : (
                <div />
              )}

              {step < totalQuestions - 1 ? (
                <motion.button
                  type="button"
                  onClick={() =>
                    (isAuthorsStep || (selected && selected.length > 0)) &&
                    setStep(step + 1)
                  }
                  disabled={!isAuthorsStep && selected.length === 0}
                  whileHover={
                    isAuthorsStep || selected.length > 0 ? { y: -2 } : {}
                  }
                  className={`px-6 py-1 tex-xs rounded-full border ${
                    isAuthorsStep || selected.length > 0
                      ? "bg-green-700 text-white border-green-700"
                      : "bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed"
                  }`}
                >
                  بعدی
                </motion.button>
              ) : (
                <motion.button
                  type="submit"
                  disabled={!isAuthorsStep && selected.length === 0}
                  whileHover={
                    isAuthorsStep || selected.length > 0 ? { y: -2 } : {}
                  }
                  className={`px-6 py-1 tex-xs rounded-full border ${
                    isAuthorsStep || selected.length > 0
                      ? "bg-green-700 text-white border-green-700"
                      : "bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed"
                  }`}
                >
                  تایید
                </motion.button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </form>
  );
};

export default OnboardingQuestions;
