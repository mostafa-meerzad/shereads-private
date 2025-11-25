"use client";

import CollectPreferences from "@/components/pages/CollectPreferences";
import CreateAccount from "@/components/pages/CreatAccount";
import OnboardingQuestions from "@/components/pages/OnboardingQuestions";
import OnboardingStart from "@/components/pages/OnboardingStart";
// import { useAuth } from "@/hooks/useAuth";
import { useAuthClient } from "@/hooks/useAuthClient";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

const Onboarding = () => {
  const {user} = useAuthClient()
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = useMemo(() => searchParams?.get("mode") || "", [searchParams]);
  const [stage, setStage] = useState("start");
  const [formAnswers, setFormAnswers] = useState(null);

  const handleFormComplete = (answers) => {
    setFormAnswers(answers);
    setStage("collecting");
  };

  const handleGoToAuth = () => {
    if (mode === "edit") {
      // In edit mode, do not go to auth. Return to dashboard instead.
      router.push("/dashboard");
      return;
    }
    const jsonString = JSON.stringify(formAnswers);
    const params = new URLSearchParams();
    params.set("data", jsonString);
    router.push(`/register?${params.toString()}`);
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

      {stage === "account" && (
        <CreateAccount
          onContinue={handleGoToAuth}
          buttonLabel={mode === "edit" ? "بازگشت به داشبورد" : undefined}
        />
      )}
    </section>
  );
};

export default Onboarding;
