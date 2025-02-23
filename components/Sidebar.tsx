import React from "react";
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

const Sidebar = () => {
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

  return (
    <div className="flex-none w-1/5 bg-gray-100 p-6 rounded-lg shadow-md">
      <div className="mb-6">
        {/* Sidebar Tabs */}
        <h2 className="text-xl font-bold mb-4">Tabs</h2>
        <ul className="space-y-2">
          {/* Personalized Advice */}
          {["Dashboard", "Earning Calls Summary", "Financial Data", "Business Insights"].map((tab) => (
            <li
              key={tab}
              className={`cursor-pointer rounded-md px-3 py-2 ${selectedTab === tab ? "bg-blue-500 text-white" : "bg-gray-200 hover:bg-gray-300"}`}
              onClick={() => handleTabClick(tab)}
            >
              {tab}
            </li>
          ))}
        </ul>
      </div>
      <div>
        {/* Configuration */}
        <h2 className="text-xl font-bold mb-4">Configuration</h2>
        <div className="mb-4">
          <label className="block mb-1 font-semibold">Persona</label>
          <select
            className="form-select w-full rounded-md shadow-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            value={persona}
            onChange={handlePersonaChange}
          >
            <option value="relationship-manager">CFO</option>
            <option value="banker">Banker</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-semibold">Foundation Model</label>
          <select
            className="form-select w-full rounded-md shadow-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            value={foundationModel}
            onChange={handleFoundationModelChange}
          >
            <option value="anthropic.claude-v2:1">Claude</option>
            {/* <option value="anthropic.claude-3-sonnet-20240229-v1:0">Claude 3 Sonnet</option>
            <option value="meta.llama3-8b-instruct-v1:0">Llama 3 8b Instruct</option>
            <option value="ai21.j2-mid-v1">AI21 Labs</option> */}
          </select>
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-semibold">FM Temperatures</label>
          <div className="relative">
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              className="form-range w-full rounded-md shadow-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              value={fmTemperature}
              onChange={handleFmTemperatureChange}
            />
            <div className="tooltip">{fmTemperature}</div>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>0</span>
            <span>1</span>
          </div>
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-semibold">FM Max Tokens</label>
          <div className="relative">
            <input
              type="range"
              min="300"
              max="4000"
              step="1"
              className="form-range w-full rounded-md shadow-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              value={fmMaxTokens}
              onChange={handleFmMaxTokensChange}
            />
            <div className="tooltip">{fmMaxTokens}</div>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>0</span>
            <span>4000</span>
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-semibold">Context</label>
            <textarea 
              className="form-textarea w-full rounded-md shadow-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500" 
              rows={6} 
              value={context}
              onChange={handleContextChange}
              />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
