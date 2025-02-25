// components/MainContent.tsx

import React, { useState } from "react";
import { useSelector } from "react-redux";
import BusinessInsights from "@/components/BusinessInsights/FanancialDashboard";



const MainContent = () => {
  const selectedTab = useSelector((state: any) => state.sidebar.selectedTab);
  const [chats, setChats] = useState([]);
  const [fetchUploadChats, setFetchUploadChats] = useState([]);

  const renderTabContent = () => {
    switch (selectedTab) {

      case "Business Insights":
        return <BusinessInsights />;

      default:
        return <BusinessInsights />;
    }
  };

  return <div className="flex-grow bg-gray-100 h-screen w-screen">{renderTabContent()}</div>;
};

export default MainContent;
