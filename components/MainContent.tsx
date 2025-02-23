// components/MainContent.tsx

import React, { useState } from "react";
import Dashboard from "@/components/Dashboard"; // Import other tab components as needed
import { useSelector } from "react-redux";
import CRMDashboard from "@/components/crm/CRMDashboard.jsx";
import FanancialDashboard from "@/components/fanancial-chat/FanancialDashboard";
import BusinessInsights from "@/components/BusinessInsights/FanancialDashboard";
import PersonalizedAdviceDashboard from "@/components/PersonalizedAdvice/PersonalizedAdviceDashboard";
import FetchUpload from "./FetchUpload/fetch_upload";

// 

const MainContent = () => {
  const selectedTab = useSelector((state: any) => state.sidebar.selectedTab);
  const [chats, setChats] = useState([]);
  const [fetchUploadChats, setFetchUploadChats] = useState([]);

  const renderTabContent = () => {
    switch (selectedTab) {
      case "Dashboard":
        return <Dashboard chats={chats} setChats={setChats}/>;
      case "Earning Calls Summary":
        return (
          <>
            <CRMDashboard />
          </>
        );
      // case "Fetch & Upload":
      //   return (
      //     <>
      //       <FetchUpload fetchUploadChats={fetchUploadChats} setFetchUploadChats={setFetchUploadChats}/>
      //     </>
      //   );
      case "Financial Data":
        return <FanancialDashboard />;
      case "Business Insights":
        return <BusinessInsights />;
      case "Personalized Advice":
        return <PersonalizedAdviceDashboard />;
      // case "Know Your Customer":
      //   return <KnowYourCustomer />;
      // case "Gopher":
      //   return <GOPHER />;
      // case "Alerts & Notifications":
      //   return <><h2>Alerts & Notifications</h2><p>Alerts & Notifications Content</p></>
      // case "Collaborative Tools":
      //   return <><h2>Collaborative Tools</h2><p>Collaborative Tools Content</p></>
      // case "Third-Party Integrations":
      //   return <><h2>Third-Party Integrations</h2><p>Third-Party Integrations Content</p></>
      // case "Infrastructure":
      //   return <><h2>Infrastructure</h2><p>Infrastructure Content</p></>
      case "Continuous Learning":
        return (
          <>
            <h2>Continuous Learning</h2>
            <p>Continuous Learning Content</p>
          </>
        );
      // case "Accessibility":
      //   return <><h2>Accessibility</h2><p>Accessibility Content</p></>
      default:
        return <Dashboard chats={chats} setChats={setChats}/>;
    }
  };

  return <div className="flex-grow p-4 bg-gray-100">{renderTabContent()}</div>;
};

export default MainContent;
