"use client";

import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import Head from "next/head";
import { useSelector } from "react-redux";
import DOMPurify from "dompurify";
import dynamic from "next/dynamic";
const ReactMarkdown = dynamic(() => import("react-markdown"), { ssr: false });
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
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
  const apiUrlSentiments = `${process.env.NEXT_PUBLIC_API_URL}/sentiment-analysis`;

  const [selectedCompany, setSelectedCompany] = useState(companies[0]);
  const [inputValue, setInputValue] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(
    Object.keys(suggestedQuestions)[0]
  );
  const [selectedYear, setSelectedYear] = useState(years[0]);
  const [selectedQuarter, setSelectedQuarter] = useState(quarters[0]);
  const [chats, setChats] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const [content, setContent] = useState("");
  const [inputText, setInputText] = useState("");
  const [checked, setChecked] = useState(false);
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);
  const [abortController, setAbortController] = useState(null);

  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Run sentiment analysis if enabled
  useEffect(() => {
    if (checked) {
      getSentimentAnalysis();
    }
  }, [checked, selectedCompany?.name, selectedQuarter, selectedYear]);

  // Auto-scroll when chats update (if enabled)
  useLayoutEffect(() => {
    if (autoScrollEnabled) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chats, autoScrollEnabled]);

  // Disable auto-scroll if the user scrolls up
  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const isAtBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight < 50;
      setAutoScrollEnabled(isAtBottom);
    };
    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  const getAgentResponse = async () => {
    setLoading(true);
    setInputText("");
    setInputValue("");
    setContent(""); // clear sentiment content if any
    setAbortController(null);

    try {
      const controller = new AbortController();
      setAbortController(controller);

      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          inputText: inputText,
          checked,
          selectedCompany,
          selectedYear,
          selectedQuarter,
        }),
      });
      if (!res.ok) throw new Error("Failed to fetch response. Please try again.");

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response reader available.");

      const decoder = new TextDecoder();
      let resultText = "";
      const currentChatLength = chats.length;

      // Append user message and a placeholder for AI response
      setChats((prev) => [
        ...prev,
        { id: currentChatLength + 1, text: inputText, sender: "user" },
        { id: currentChatLength + 2, text: "", sender: "ai" },
      ]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        resultText += decoder.decode(value, { stream: true });
        setChats((prev) => {
          const updatedChats = [...prev];
          updatedChats[updatedChats.length - 1] = {
            ...updatedChats[updatedChats.length - 1],
            text: resultText,
          };
          return updatedChats;
        });
      }
    } catch (err) {
      if (err.name === "AbortError") {
        // If generation is stopped by user
        setChats((prev) => [
          ...prev,
          { id: prev.length + 1, text: "Generation stopped by user.", sender: "ai" },
        ]);
      } else {
        console.error(err);
        setChats((prev) => [
          ...prev,
          {
            id: prev.length + 1,
            text: "An error occurred while generating response.",
            sender: "ai",
          },
        ]);
      }
    } finally {
      setLoading(false);
      setAbortController(null);
    }
  };

  const stopGeneration = () => {
    if (abortController) {
      abortController.abort();
      setLoading(false);
      setAbortController(null);
    }
  };

  const getSentimentAnalysis = async () => {
    try {
      const res = await fetch(apiUrlSentiments, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          checked,
          selectedCompany,
          selectedYear,
          selectedQuarter,
        }),
      });
      if (!res.ok)
        throw new Error("Failed to fetch sentiment analysis. Please try again.");

      const reader = res.body?.getReader();
      if (!reader)
        throw new Error("No response reader available for sentiment analysis.");

      const decoder = new TextDecoder();
      let resultText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        resultText += decoder.decode(value, { stream: true });
        const sanitizedMarkdown = DOMPurify.sanitize(resultText);
        setContent(sanitizedMarkdown);
      }
    } catch (error) {
      console.error(error);
      setContent(`<p style="color:red;">Error: Sorry, something went wrong.</p>`);
    }
  };

  const handleCompanyChange = (event) => {
    const selectedTicker = event.target.value;
    const selectedCompanyObj = companies.find(
      (company) => company.ticker === selectedTicker
    );
    setSelectedCompany(selectedCompanyObj);
  };

  const handleCategoryChange = (event) => setSelectedCategory(event.target.value);
  const handleYearChange = (event) => setSelectedYear(event.target.value);
  const handleQuarterChange = (event) => setSelectedQuarter(event.target.value);

  const handleInputChangeWithCompany = (event) => {
    setInputValue(event.target.value);
    setInputText(
      `${event.target.value} for ${selectedCompany.name} in ${selectedCategory} category ${selectedQuarter} quarter of ${selectedYear}`
    );
  };

  const handleButtonClick = (question) => {
    const formattedQuestion = `${question} for ${selectedCompany.name} in ${selectedCategory} category for ${selectedQuarter} quarter of ${selectedYear}`;
    setInputValue(formattedQuestion);
    setInputText(formattedQuestion);
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Head>
        <title>Business Insights</title>
      </Head>

      {/* Header */}
      <header className="bg-blue-600 text-white py-4 px-6 shadow flex-none">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold">Business Insights</h1>
        </div>
      </header>

      {/* Top Controls */}
      <div className="bg-white p-4 shadow flex-none">
        <div className="container mx-auto flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-1">
              Company:
            </label>
            <select
              value={selectedCompany.ticker}
              onChange={handleCompanyChange}
              className="p-2 border border-gray-300 rounded focus:outline-none"
            >
              {companies.map((company, index) => (
                <option key={index} value={company.ticker}>
                  {company.name}
                </option>
              ))}
            </select>
          </div>

          {!checked && (
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-1">
                Category:
              </label>
              <select
                value={selectedCategory}
                onChange={handleCategoryChange}
                className="p-2 border border-gray-300 rounded focus:outline-none"
              >
                {Object.keys(suggestedQuestions).map((category, index) => (
                  <option key={index} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-lg font-medium text-gray-700 mb-1">
              Year:
            </label>
            <select
              value={selectedYear}
              onChange={handleYearChange}
              className="p-2 border border-gray-300 rounded focus:outline-none"
            >
              {years.map((year, index) => (
                <option key={index} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-lg font-medium text-gray-700 mb-1">
              Quarter:
            </label>
            <select
              value={selectedQuarter}
              onChange={handleQuarterChange}
              className="p-2 border border-gray-300 rounded focus:outline-none"
            >
              {quarters.map((quarter, index) => (
                <option key={index} value={quarter}>
                  {quarter}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center">
            <CustomCheckbox checked={checked} setChecked={setChecked} />
          </div>

          {/* Stop Generation button (visible during streaming) */}
          {isLoading && (
            <div>
              <button
                onClick={stopGeneration}
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
              >
                Stop Generation
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content: Use flex-col so we can pin input to the bottom */}
      <main className="flex-grow flex flex-col overflow-hidden">
        {checked ? (
          /* If "Sentiment Analysis" is checked, show this area only */
          <div className="flex-grow overflow-y-auto p-4">
            <div className="space-y-4">
              <div className="border-b-2 border-gray-300 pb-2">
                <h2 className="text-2xl font-bold text-gray-800">
                  Sentiment Analysis
                </h2>
              </div>
              <SentimentAnalysisComponent content={content} />
            </div>
          </div>
        ) : (
          /* Otherwise show the Chat + Suggested Questions + Input */
          <>
            {/* Chat Window */}
            <div
              ref={chatContainerRef}
              className="flex-grow overflow-y-auto bg-gray-100 rounded-lg p-4"
            >
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
                      m.sender === "user"
                        ? "text-blue-600"
                        : "text-green-600"
                    } font-semibold`}
                  >
                    {m.sender === "user" ? "User: " : "AI: "}
                  </span>
                  <div className="prose ml-6">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeRaw]}
                    >
                      {m.text}
                    </ReactMarkdown>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex flex-col items-center py-4">
                  <div className="spinner border-t-4 border-blue-500 rounded-full w-8 h-8 animate-spin"></div>
                  <p className="text-gray-700 mt-2">Generating response...</p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggested Questions (above input) */}
            <div className="bg-white px-4 py-2 shadow flex-none">
              <h3 className="font-bold text-gray-700 mb-2">Suggested Questions:</h3>
              <div className="flex flex-wrap gap-2">
                {suggestedQuestions[selectedCategory]["Common Questions"].map(
                  (question, index) => (
                    <button
                      key={index}
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                      onClick={() => handleButtonClick(question)}
                    >
                      {question}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Chat Input at the bottom */}
            <div className="bg-white p-4 shadow flex-none">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  getAgentResponse();
                }}
                className="flex"
              >
                <input
                  className="flex-grow p-2 border border-gray-300 rounded-l focus:outline-none"
                  value={inputValue}
                  placeholder="Ask your question..."
                  onChange={handleInputChangeWithCompany}
                />
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600 focus:outline-none"
                >
                  Send
                </button>
              </form>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

const CustomCheckbox = ({ checked, setChecked }) => {
  return (
    <label className="flex items-center space-x-2 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={() => setChecked(!checked)}
        className="hidden"
      />
      <div
        className={`w-6 h-6 border-2 rounded-md flex items-center justify-center transition-all ${
          checked
            ? "bg-blue-500 border-blue-500"
            : "bg-gray-200 border-gray-500"
        }`}
      >
        <span className="text-white text-lg">✔</span>
      </div>
      <span className="text-gray-700">Sentiment Analysis</span>
    </label>
  );
};

const SentimentAnalysisComponent = ({ content }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
      <div className="prose">
        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
};
