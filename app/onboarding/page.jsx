"use client";

import CollectPreferences from "@/components/pages/CollectPreferences";
import CreateAccount from "@/components/pages/CreatAccount";
import OnboardingQuestions from "@/components/pages/OnboardingQuestions";
import OnboardingStart from "@/components/pages/OnboardingStart";
import { useRouter } from "next/navigation";
import { useState } from "react";

const Onboarding = () => {
  const router = useRouter();

  const [stage, setStage] = useState("start");
  const [formAnswers, setFormAnswers] = useState(null);

  const handleFormComplete = (answers) => {
    setFormAnswers(answers);
    setStage("collecting");
  };

  const handleGoToAuth = () => {
    router.push("/auth");
  };

  return (
    <section className="min-h-screen w-full grid">
      {stage === "start" && (
        <OnboardingStart onStart={() => setStage("questions")} />
      )}

      {stage === "questions" && (
        <OnboardingQuestions onComplete={handleFormComplete} />
      )}

      {stage === "collecting" && (
        <CollectPreferences onComplete={() => setStage("account")} />
      )}

      {stage === "account" && <CreateAccount onContinue={handleGoToAuth} />}
    </section>
  );
};

export default Onboarding;
