"use client";

import CollectPreferences from "@/components/pages/CollectPreferences";
import CreateAccount from "@/components/pages/CreatAccount";
import OnboardingQuestions from "@/components/pages/OnboardingQuestions";
import OnboardingStart from "@/components/pages/OnboardingStart";
// import { useAuth } from "@/hooks/useAuth";
import { useAuthClient } from "@/hooks/useAuthClient";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

const Onboarding = () => {
  const { user, setUser } = useAuthClient();
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
    const dataToPass = { ...formAnswers };

    const jsonString = JSON.stringify(dataToPass);
    const params = new URLSearchParams();
    params.set("data", jsonString);

    if (mode === "edit") {
      const baseURL = "/api";
      const userId = user?.id;
      const newPostData = { ...formAnswers };
      // Use a template literal to construct the complete URL
      const url = `${baseURL}/recommendation/${userId}`;
      const userUpdateUrl = `${baseURL}/user/${userId}`;

      // Update both recommendations and user profile categories
      Promise.all([
        axios.post(url, newPostData),
        axios.patch(userUpdateUrl, { categories: formAnswers.categories }),
      ])
        .then(([recommendationRes, userRes]) => {
          // Update local user context with new categories
          if (setUser && userRes.data) {
            setUser({ ...user, ...userRes.data });
          }
          // In edit mode, do not go to auth. Return to home instead after recommendations updated.
          router.push("/home?page=recommendations");
        })
        .catch((error) => {
          console.error("There was an error updating user preferences:", error);
          // Still push to home if one fails? Or maybe show error.
          router.push("/home");
        });

      return;
    }

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
          buttonLabel={mode === "edit" ? "بازگشت به خانه" : undefined}
        />
      )}
    </section>
  );
};

export default Onboarding;
