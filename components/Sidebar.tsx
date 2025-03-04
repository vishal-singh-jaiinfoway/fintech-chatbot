import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setSelectedTab,
  setPersona,
  setFoundationModel,
  setFmTemperature,
  setFmMaxTokens,
  setContext
} from "@/store/sidebarSlice";
import { tabClasses } from "@mui/material";
import { personas } from "@/public/data";
import { BiMenu } from "react-icons/bi";

const Sidebar = ({ isChatOpen, setIsChatOpen }: any) => {
  const dispatch = useDispatch();
  const selectedTab = useSelector((state: any) => state.sidebar.selectedTab);
  const persona = useSelector((state: any) => state.sidebar.persona);
  const foundationModel = useSelector((state: any) => state.sidebar.foundationModel);
  const fmTemperature = useSelector((state: any) => state.sidebar.fmTemperature);
  const fmMaxTokens = useSelector((state: any) => state.sidebar.fmMaxTokens);
  const context = useSelector((state: any) => state.sidebar.context);

  const handleTabClick = (tab: any) => {
    dispatch(setSelectedTab(tab));
  };

  const handlePersonaChange = (e: any) => {
    dispatch(setPersona(e.target.value));
  };

  const handleFoundationModelChange = (e: any) => {
    dispatch(setFoundationModel(e.target.value));
  };

  const handleFmTemperatureChange = (e: any) => {
    dispatch(setFmTemperature(parseFloat(e.target.value)));
  };

  const handleFmMaxTokensChange = (e: any) => {
    dispatch(setFmMaxTokens(parseInt(e.target.value)));
  };

  const handleContextChange = (e: any) => {
    dispatch(setContext(e.target.value));
  };

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };
  const [isOpen, setIsOpen] = useState(false);

  return (
    // <div className="w-1/5 h-screen bg-white px-4 pt-4 shadow-xl overflow-y-auto border border-gray-200">
    //   {/* Sidebar Tabs */}
    //   <div className="mb-2">
    //     <h2 className="text-md font-bold mb-2 text-gray-700">Tabs</h2>
    //     <ul className="space-y-2">
    //       {["Business Insights", "Aggregate"].map((tab) => (
    //         <li
    //           key={tab}
    //           className={`cursor-pointer px-3 py-2 rounded-lg transition-all duration-300 ease-in-out text-gray-700 font-bold text-center shadow-md ${selectedTab === tab ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white" : "bg-gray-100 hover:bg-blue-200"}`}
    //           onClick={() => handleTabClick(tab)}
    //         >
    //           {tab}
    //         </li>
    //       ))}
    //     </ul>
    //   </div>

    //   {/* Configuration */}
    //   <div>
    //     <button
    //       className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 rounded-lg shadow-lg hover:scale-105 transform transition-all duration-300 font-bold"
    //       onClick={toggleChat}
    //     >
    //       Fetch & Upload
    //     </button>

    //     <h2 className="text-md font-bold my-2 mt-6 text-gray-700">Configuration</h2>

    //     <div className="mb-4 text-sm">
    //       <label className="block mb-2 font-md text-gray-600">Persona</label>
    //       <select
    //         className="w-full p-2 rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
    //         value={persona}
    //         onChange={handlePersonaChange}
    //       >
    //         {personas.map((persona, index) => (
    //           <option key={index} value={persona}>{persona}</option>
    //         ))}
    //       </select>
    //     </div>

    //     <div className="mb-4 text-sm">
    //       <label className="block mb-2 font-md text-gray-600">Foundation Model</label>
    //       <select
    //         className="w-full p-2 rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
    //         value={foundationModel}
    //         onChange={handleFoundationModelChange}
    //       >
    //         <option value="anthropic.claude-3-5-sonnet-20240620-v1:0">Claude 3.5 Sonnet v1</option>
    //         <option value="anthropic.claude-3-5-sonnet-v2">Claude 3.5 Sonnet v2</option>
    //         <option value="anthropic.claude-3-haiku-20240307-v1:0">Claude 3.5 Haiku</option>
    //       </select>
    //     </div>

    //     <div className="mb-4 text-sm">
    //       <label className="block mb-2 font-semibold text-gray-700">FM Temperatures</label>
    //       <div className="relative">
    //         <input
    //           type="range"
    //           min="0"
    //           max="1"
    //           step="0.01"
    //           className="form-range w-full rounded-lg appearance-none bg-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
    //           value={fmTemperature}
    //           onChange={handleFmTemperatureChange}
    //         />
    //       </div>
    //       <div className="flex justify-between text-sm text-gray-600 mt-1">
    //         <span>0</span>
    //         <div className="text-center text-md font-bold text-blue-600">{fmTemperature}</div>
    //         <span>1</span>
    //       </div>
    //     </div>
    //     <div className="mb-4 text-sm">
    //       <label className="block mb-2 font-semibold text-gray-700">FM Max Tokens</label>
    //       <div className="relative">
    //         <input
    //           type="range"
    //           min="300"
    //           max="4000"
    //           step="1"
    //           className="form-range w-full rounded-lg appearance-none bg-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
    //           value={fmMaxTokens}
    //           onChange={handleFmMaxTokensChange}
    //         />
    //       </div>
    //       <div className="flex justify-between text-sm text-gray-600 mt-1">
    //         <span>300</span>
    //         <div className="text-center text-md font-bold text-blue-600">{fmMaxTokens}</div>
    //         <span>4000</span>
    //       </div>
    //     </div>

    //     <div className="mb-4">
    //       <label className="block mb-2 font-semibold text-gray-600">Context</label>
    //       <textarea
    //         className="w-full p-3 rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
    //         rows={3}
    //         value={context}
    //         onChange={handleContextChange}
    //       />
    //     </div>
    //   </div>
    // </div>
    <>
      {/* Hamburger Menu - Only Visible on Medium Screens and Smaller */}
      {!isOpen && (
        <button
          className="md:hidden fixed top-4 left-4 z-50 bg-gray-900 text-white p-2 rounded-full shadow-lg"
          onClick={() => setIsOpen(true)}
        >
          <BiMenu size={24} />
        </button>
      )}

      {/* Overlay - Only visible when sidebar is open on small screens */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div className={`fixed md:relative transition-all duration-300 ease-in-out bg-white shadow-xl border-r border-gray-200 h-screen overflow-hidden z-50
          ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0 md:w-1/5"} w-3/4 md:w-1/5`}>

        {/* Close Button (Only visible on md and smaller when open) */}
        {isOpen && (
          <button
            className="md:hidden absolute top-4 right-4 bg-gray-900 text-white p-2 rounded-full"
            onClick={() => setIsOpen(false)}
          >
            ✕
          </button>
        )}

        {/* Sidebar Content */}
        <div className="flex flex-col h-full p-4">
          {/* Tabs Section */}
          <h2 className="text-lg font-bold text-gray-700 mb-4">Tabs</h2>
          <ul className="space-y-2">
            {["Business Insights", "Aggregate"].map((tab) => (
              <li
                key={tab}
                className={`cursor-pointer px-3 py-2 rounded-lg transition-all duration-300 ease-in-out text-gray-700 font-bold text-center shadow-md
                  ${selectedTab === tab ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white" : "bg-gray-100 hover:bg-blue-200"}`}
                onClick={() => handleTabClick(tab)}
              >
                {tab}
              </li>
            ))}
            <li className="!mt-4">
              <button
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 rounded-lg shadow-lg hover:scale-105 transform transition-all duration-300 font-bold"
                onClick={toggleChat}
              >
                Fetch & Upload
              </button>
            </li>
          </ul>

          {/* Centered Section */}
          <div className="flex-1 flex flex-col justify-center">

            <h2 className="text-md font-bold my-4 text-gray-700">Configuration</h2>

            {/* Persona Selection */}
            <div className="mb-4 text-sm">
              <label className="block mb-2 font-md text-gray-600">Persona</label>
              <select
                className="w-full p-2 rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                value={persona}
                onChange={handlePersonaChange}
              >
                {personas.map((persona, index) => (
                  <option key={index} value={persona}>{persona}</option>
                ))}
              </select>
            </div>

            {/* Foundation Model Selection */}
            <div className="mb-4 text-sm">
              <label className="block mb-2 font-md text-gray-600">Foundation Model</label>
              <select
                className="w-full p-2 rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                value={foundationModel}
                onChange={handleFoundationModelChange}
              >
                <option value="anthropic.claude-3-5-sonnet-20240620-v1:0">Claude 3.5 Sonnet v1</option>
                <option value="anthropic.claude-3-5-sonnet-v2">Claude 3.5 Sonnet v2</option>
                <option value="anthropic.claude-3-haiku-20240307-v1:0">Claude 3.5 Haiku</option>
              </select>
            </div>
          </div>

          {/* Context Section - Fixed at Bottom */}
          <div className="border-t border-gray-300 pt-4">
            <label className="block mb-2 font-semibold text-gray-600">Context</label>
            <textarea
              className="w-full p-3 rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
              rows={3}
              value={context}
              onChange={handleContextChange}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
