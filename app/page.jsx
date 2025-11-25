import React from "react";
import Welcome from "../components/pages/Welcome";
import OnBoardingForm from "./onboarding/page";
import DashboardApp from "./dashboard/page";
import Sidebar from "./reading/page";

const page = () => {
  return (
    <div>
      <Welcome />
      {/* <DashboardApp/> */}
      {/* <Sidebar/> */}
      {/* <OnBoardingForm/> */}
    </div>
  );
  
};

export default page