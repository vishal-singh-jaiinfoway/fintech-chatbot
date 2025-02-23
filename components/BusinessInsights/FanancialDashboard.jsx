import React, { useState, useEffect, useRef } from "react";
import Head from "next/head";
import { useChat } from "@ai-sdk/react";
import { useSelector } from "react-redux";
import MarkdownRenderer from "../Utility/Markdown/MarkdownRenderer";
import axios from "axios";
import {
  suggestedQuestions,
  companies,
  years,
  quarters,
} from "../../public/data";

export default function Dashboard() {
  const foundationModel = useSelector((state) => state.sidebar.foundationModel);
  const fmTemperature = useSelector((state) => state.sidebar.fmTemperature);
  const fmMaxTokens = useSelector((state) => state.sidebar.fmMaxTokens);
  const context = useSelector((state) => state.sidebar.context);
  const persona = useSelector((state) => state.sidebar.persona);
  const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/business-insights-api`;
  const [selectedCompany, setSelectedCompany] = useState(
    "SoFi Technologies Inc.",
  );
  const [inputValue, setInputValue] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(
    Object.keys(suggestedQuestions)[0],
  );
  const [selectedYear, setSelectedYear] = useState(years[0]);
  const [selectedQuarter, setSelectedQuarter] = useState(quarters[0]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chats, setChats] = useState([]);
  const [isLoading, setLoading] = useState(false);

  const messagesEndRef = useRef(null);
  const [inputText, setInputText] = useState("");
  // const { messages, input, handleInputChange, handleSubmit, isLoading } =
  //   useChat({
  //     api: apiUrl,
  //     body: {
  //       modelId: foundationModel,
  //       temperature: parseFloat(fmTemperature),
  //       max_tokens: parseInt(fmMaxTokens, 10),
  //       context: context,
  //       inputText: inputValue,
  //     },
  //   });

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chats]);

  const getAgentResponse = async () => {
    try {
      setLoading(true);
      //setInputText("");
      setChats([
        ...chats,
        {
          id: chats.length + 1,
          text: inputText,
          sender: "user",
        },
      ]);
      setTimeout(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
      }, 50);
      const response = await axios.post(
        `http://localhost:3000/api/business-insights-api`,
        { inputText: inputText },
      );
      console.log("response", response.data);

      setChats([
        ...chats,
        {
          id: chats.length + 1,
          text: inputText,
          sender: "user",
        },
        {
          id: chats.length + 2,
          text: response.data,
          sender: "bot",
        },
      ]);

      setInputText("");
      setLoading(false);
      setTimeout(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    } catch (error) {
      setChats((prev) => {
        prev.pop();
        return prev;
      });
    }
  };

  const handleCompanyChange = (event) => setSelectedCompany(event.target.value);
  const handleCategoryChange = (event) =>
    setSelectedCategory(event.target.value);

  const handleYearChange = (event) => setSelectedYear(event.target.value);

  const handleQuarterChange = (event) => setSelectedQuarter(event.target.value);

  const handleInputChangeWithCompany = (event) => {
    setInputValue(event.target.value);
    setInputText(
      `${event.target.value} for ${selectedCompany} in ${selectedCategory} category  ${selectedQuarter} quarter of ${selectedYear}`,
    );
    // handleInputChange({
    //   ...event,
    //   target: {
    //     ...event.target,
    //     value: `${event.target.value} for ${selectedCompany} in ${selectedCategory} category  ${selectedQuarter} quarter of ${selectedYear}`,
    //   },
    // });
  };

  const handleButtonClick = (question) => {
    const formattedQuestion = `${question} for ${selectedCompany} in ${selectedCategory} category for ${selectedQuarter} quarter of ${selectedYear}`;
    setInputValue(formattedQuestion);
    setInputText(formattedQuestion);
    // handleInputChange({ target: { value: formattedQuestion } });
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Head>
        <title>Business Insights</title>
      </Head>
      <header className="bg-blue-600 text-white py-4 px-6 shadow-md">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold">Business Insights</h1>
        </div>
      </header>
      <main className="container mx-auto flex-grow py-4 px-4">
        <div className="bg-white p-6 w-full h-full rounded-lg shadow-lg flex flex-col">
          <div className="flex flex-row items-center gap-4">
            <div className="mb-4">
              <label className="block text-lg font-medium mb-2 text-gray-700">
                Select Company:
              </label>
              <select
                value={selectedCompany}
                onChange={handleCompanyChange}
                className="p-2 border border-gray-300 rounded"
              >
                {companies.map((company, index) => (
                  <option key={index} value={company.name}>
                    {company.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-lg font-medium mb-2 text-gray-700">
                Select Category:
              </label>
              <select
                value={selectedCategory}
                onChange={handleCategoryChange}
                className="p-2 border border-gray-300 rounded"
              >
                {Object.keys(suggestedQuestions).map((category, index) => (
                  <option key={index} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex flex-row items-center gap-4">
            <div className="mb-4">
              <label className="block text-lg font-medium mb-2 text-gray-700">
                Select Year:
              </label>
              <select
                value={selectedYear}
                onChange={handleYearChange}
                className="p-2 border border-gray-300 rounded"
              >
                {years.map((year, index) => (
                  <option key={index} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-lg font-medium mb-2 text-gray-700">
                Select Quarter:
              </label>
              <select
                value={selectedQuarter}
                onChange={handleQuarterChange}
                className="p-2 border border-gray-300 rounded"
              >
                {quarters.map((quarter, index) => (
                  <option key={index} value={quarter}>
                    {quarter}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mb-4">
            <h3 className="font-bold mb-2 text-gray-700">
              Suggested Questions:
            </h3>
            <div className="flex flex-wrap">
              {suggestedQuestions[selectedCategory]["Common Questions"].map(
                (question, index) => (
                  <button
                    key={index}
                    className="bg-blue-500 text-white px-3 py-1 rounded mr-2 mb-2 hover:bg-blue-600"
                    onClick={() => handleButtonClick(question)}
                  >
                    {question}
                  </button>
                ),
              )}
            </div>
          </div>
          <div className="flex-grow overflow-y-auto mb-4 bg-gray-100 rounded-lg p-4">
            {chats.map((m, index) => (
              <div
                key={index}
                className={`p-2 mb-2 rounded-lg ${
                  m.sender === "user"
                    ? "bg-blue-100 text-blue-900"
                    : "bg-gray-200 text-gray-900"
                }`}
              >
                <span
                  className={`${
                    m.sender === "user" ? "text-blue-600" : "text-green-600"
                  } font-semibold`}
                >
                  {m.sender === "user" ? "User: " : "AI: "}
                </span>
                <MarkdownRenderer content={m.text} />
              </div>
            ))}
            {/* Loading Indicator */}
            {isLoading && (
              <div className="loading-container">
                <div className="spinner"></div>
                <p className="loading-text">Generating response...</p>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              // handleSubmit(e);
              // setInputValue("");
              console.log("hello");
              getAgentResponse();
            }}
            className="flex"
          >
            <input
              className="flex-grow p-2 border border-gray-300 rounded-l"
              value={inputValue}
              placeholder="Say something..."
              onChange={handleInputChangeWithCompany}
            />
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600"
            >
              Send
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
