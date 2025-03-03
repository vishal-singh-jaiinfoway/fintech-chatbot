"use client";

import React, { useState, useEffect, useRef } from "react";
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
import { ArrowUp, SendHorizonalIcon, X } from "lucide-react";
import { Button } from "@mui/material";

export default function Dashboard({
  isChatOpen,
  setIsChatOpen,
  chats,
  setChats,
}) {
  const foundationModel = useSelector((state) => state.sidebar.foundationModel);
  const fmTemperature = useSelector((state) => state.sidebar.fmTemperature);
  const fmMaxTokens = useSelector((state) => state.sidebar.fmMaxTokens);
  const context = useSelector((state) => state.sidebar.context);
  const persona = useSelector((state) => state.sidebar.persona);
  const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/business-insights-api`;
  const [selectedCompany, setSelectedCompany] = useState(companies[0]);
  const [inputValue, setInputValue] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(
    Object.keys(suggestedQuestions)[0],
  );
  const [selectedQuestion, setSelectedQuestion] = useState(null);

  const [selectedYear, setSelectedYear] = useState(years[0]);
  const [selectedQuarter, setSelectedQuarter] = useState(quarters[0]);
  const [isLoading, setLoading] = useState(false);
  const [isSentimentsLoading, setIsSentimentsLoading] = useState(false);

  const startRef = useRef(null);

  const messagesEndRef = useRef(null);
  const [inputText, setInputText] = useState("");
  const [checked, setChecked] = useState(false);
  const [fetchUploadChats, setFetchUploadChats] = useState([]);
  const [content, setContent] = useState("");
  const apiUrlSentiments = `${process.env.NEXT_PUBLIC_API_URL}/sentiment-analysis`;

  const [filters, setFilters] = useState([
    selectedCompany.name,
    selectedYear,
    selectedQuarter,
  ]);

  const removeFilter = (filterToRemove) => {
    setFilters(filters.filter((filter) => filter !== filterToRemove));
  };

  useEffect(() => {
    if (checked) {
      getSentimentAnalysis();
    }
  }, [checked, selectedCompany?.name, selectedQuarter, selectedYear]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chats]);

  const getAgentResponse = async () => {
    try {
      setLoading(true);
      setInputText("");
      setInputValue("");
      let length = chats.length;
      setChats((prev) => {
        let temp = [
          ...prev,
          {
            role: "user",
            content: inputValue,
          },
        ];

        return temp;
      });

      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inputText: inputText,
          inputValue,
          selectedCompany,
          selectedQuarter,
          selectedYear,
          context,
          persona,
          foundationModel,
          fmTemperature,
          fmMaxTokens,
        }),
      });

      const reader = res.body?.getReader();
      if (!reader) return;

      const decoder = new TextDecoder();
      let resultText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          setLoading(false);
          break;
        }
        resultText += decoder.decode(value, { stream: true });
        const sanitizedMarkdown = DOMPurify.sanitize(resultText);
        setChats((prev) => {
          let temp = [...prev];
          temp[length + 1] = {
            role: "assistant",
            content: sanitizedMarkdown,
          };
          return temp;
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getSentimentAnalysis = async () => {
    setIsSentimentsLoading(true);
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

      const reader = res.body?.getReader();
      if (!reader) return;

      const decoder = new TextDecoder();
      let resultText = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          setIsSentimentsLoading(false);
          break;
        }
        resultText += decoder.decode(value, { stream: true });

        const sanitizedMarkdown = DOMPurify.sanitize(resultText);
        setContent(sanitizedMarkdown);
      }
    } catch (error) {
      console.log(error);
      setContent(
        `<p style="color:red;">Error: ${"Sorry,something went wrong"}</p>`,
      );
    }
  };

  const handleCompanyChange = (event) => {
    const selectedTicker = event.target.value;
    const selectedCompanyObj = companies.find(
      (company) => company.ticker === selectedTicker,
    );
    setSelectedCompany(selectedCompanyObj); // Now setting the full object
  };

  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
  };

  const handleYearChange = (event) => {
    setSelectedYear(event.target.value);
  };

  const handleQuarterChange = (event) => {
    setSelectedQuarter(event.target.value);
  };

  const handleInputChangeWithCompany = (event) => {
    setInputValue(event.target.value);
    setInputText(
      `${event.target.value} ${
        selectedCompany.name ? "for " + selectedCompany.name : ""
      } ${selectedQuarter ? "for the " + selectedQuarter + " quarter" : ""} ${
        selectedYear ? "of " + selectedYear : ""
      }`,
    );
  };

  const handleButtonClick = (question) => {
    const formattedQuestion = `${question} ${
      selectedCompany.name ? "for " + selectedCompany.name : ""
    } ${selectedQuarter ? "for the " + selectedQuarter + " quarter" : ""} ${
      selectedYear ? "of " + selectedYear : ""
    }`;
    setInputValue(question);
    setInputText(formattedQuestion);
    scrollToBottom();
    setSelectedQuestion(question);
  };

  const scrollToTop = () => {
    if (startRef.current) {
      startRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <Head>
        <title>Business Insights</title>
      </Head>

      {/* Header */}
      <header className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-5 px-6 shadow-lg">
        <div className="container mx-auto text-center">
          <h1 className="text-3xl font-extrabold tracking-wide">
            Business Insights
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto flex-grow p-6 overflow-y-auto">
        <div className="bg-white p-6 w-full rounded-lg shadow-xl flex flex-col space-y-4 h-full">
          {/* Filters */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            <div>
              <label className="block text-md font-bold text-gray-700">
                Company
              </label>
              <select
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring focus:ring-blue-400"
                value={selectedCompany.ticker}
                onChange={handleCompanyChange}
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
                <label className="block text-md font-bold text-gray-700">
                  Category
                </label>
                <select
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring focus:ring-blue-400"
                  value={selectedCategory}
                  onChange={handleCategoryChange}
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
              <label className="block text-md font-bold text-gray-700">
                Year
              </label>
              <select
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring focus:ring-blue-400"
                value={selectedYear}
                onChange={handleYearChange}
              >
                {years.map((year, index) => (
                  <option key={index} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-md font-bold text-gray-700">
                Quarter
              </label>
              <select
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring focus:ring-blue-400"
                value={selectedQuarter}
                onChange={handleQuarterChange}
              >
                {quarters.map((quarter, index) => (
                  <option key={index} value={quarter}>
                    {quarter}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Checkbox */}
          <CustomCheckbox checked={checked} setChecked={setChecked} />

          {/* Sentiment Analysis or Questions */}
          {checked ? (
            <SentimentAnalysisComponent
              isSentimentsLoading={isSentimentsLoading}
              content={content}
            />
          ) : (
            <>
              <div>
                <h3 className="font-bold text-lg text-gray-700 mb-2">
                  Suggested Questions:
                </h3>
                <div className="text-sm flex flex-wrap gap-2 h-[100px] md:h-[150px] lg:h-[180px] xl:h-[200px] min-h-0 overflow-y-auto">
                  {suggestedQuestions[selectedCategory]["Common Questions"].map(
                    (question, index) => (
                      <button
                        key={index}
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-600 transition"
                        onClick={() => handleButtonClick(question)}
                      >
                        {question}
                      </button>
                    ),
                  )}
                </div>
              </div>

              {/* Chatbox */}
              <div className="flex-grow h-[400px] min-h-0 overflow-y-auto bg-gray-100 rounded-lg p-4 space-y-4">
                {chats.map((m, index) => (
                  <div
                    key={index}
                    className={`p-2 rounded-lg ${
                      m.role === "user"
                        ? "bg-blue-100 text-blue-900"
                        : "bg-gray-200 text-gray-900"
                    }`}
                  >
                    <span
                      className={`font-semibold ${
                        m.role === "user" ? "text-blue-600" : "text-green-600"
                      }`}
                    >
                      {m.role === "user" ? "User: " : "AI: "}
                    </span>
                    <div className="prose ml-6 custom-markdown">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeRaw]}
                      >
                        {m.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                ))}
                <ScrollToTop scrollToTop={scrollToTop} />
                {/* Loading Indicator */}
                {isLoading && (
                  <div className="loading-container">
                    <div className="spinner"></div>
                    <p className="loading-text">Generating response...</p>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  getAgentResponse();
                }}
                className="flex"
              >
                <input
                  className="flex-grow p-2 border border-gray-300 rounded-l"
                  value={inputValue}
                  placeholder="Ask your question..."
                  onChange={handleInputChangeWithCompany}
                />
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600"
                >
                  Send
                </button>
              </form>
            </>
          )}
        </div>

        {isChatOpen && (
          <FetchUploadPopUp
            isOpen={isChatOpen}
            setIsOpen={setIsChatOpen}
            chats={fetchUploadChats}
            setChats={setFetchUploadChats}
          />
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
            ? "bg-blue-500 border-blue-500 text-white"
            : "border-gray-500 bg-gray-200" // Ensure bg-white so border is visible
        }`}
      >
        {checked ? (
          <span className="text-white text-lg">✔</span>
        ) : (
          <span className="text-white text-lg">✔</span>
        )}
      </div>
      <span className="text-gray-700">Sentiment Analysis</span>
    </label>
  );
};

const SentimentAnalysisComponent = ({ content, isSentimentsLoading }) => {
  return (
    <div className="prose overflow-auto ml-20 mb-10 custom-markdown">
      {isSentimentsLoading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p className="loading-text">Loading...</p>
        </div>
      ) : (
        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
          {content}
        </ReactMarkdown>
      )}
    </div>
  );
};

const ScrollToTop = ({ scrollToTop }) => {
  const [isVisible, setIsVisible] = useState(true);

  // useEffect(() => {
  //   const toggleVisibility = () => {
  //     console.log("toggleVisibility", window.scrollY);
  //     setIsVisible(window.scrollY > 300);
  //   };

  //   window.addEventListener("scroll", toggleVisibility);
  //   return () => window.removeEventListener("scroll", toggleVisibility);
  // }, []);

  const comeIntoView = () => {
    scrollToTop();
  };

  return (
    <button
      onClick={comeIntoView}
      className={`fixed bottom-2 right-0 p-3 bg-blue-600 text-white rounded-full shadow-lg transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      <ArrowUp size={20}></ArrowUp>
    </button>
  );
};

function FetchUploadPopUp({ isOpen, setIsOpen, chats, setChats }) {
  const [inputText, setInput] = useState("");
  const [isLoading, setLoading] = useState(false);
  const scrollViewRef = useRef(null);
  const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/fetch-upload`;

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [scrollViewRef.current]);

  const getAgentResponse = async () => {
    try {
      setLoading(true);
      setInput("");
      let length = chats.length;
      setChats((prev) => {
        let temp = [
          ...prev,
          {
            id: length + 1,
            text: inputText,
            sender: "user",
          },
        ];

        return temp;
      });
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inputText: inputText,
        }),
      });

      const reader = res.body?.getReader();
      if (!reader) return;

      const decoder = new TextDecoder();
      let resultText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          setLoading(false);
          break;
        }
        resultText += decoder.decode(value, { stream: true });

        setChats((prev) => {
          let temp = [...prev];
          temp[length + 1] = { ...temp[length + 1], text: resultText };
          return temp;
        });
      }
    } catch (error) {
      setChats((prev) => {
        prev.pop();
        return prev;
      });
    }
  };
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Prevent default form submission (if inside a form)
      getAgentResponse();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 flex flex-col items-end">
      <div
        style={{
          boxShadow: "4px 4px 10px rgba(0, 0, 0, 0.5)",
          border: 2,
          borderColor: "blue",
        }}
        className="bg-white shadow-2xl rounded-2xl p-4 m-4 mb-8 h-[500px] w-[800px] flex flex-col"
      >
        <div className="flex justify-center items-center border-b pb-2">
          <Button
            onClick={() => {
              setIsOpen(false);
              setLoading(false);
              setInput("");
            }}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
        <div className="p-4 bg-white rounded-lg shadow-md">
          <h3 className="text-lg font-medium text-gray-700">
            Upload Earnings Calls Transcripts To Get Insights
          </h3>
          <section className="mt-3 p-4 text-gray-600 border border-gray-300 rounded-lg bg-gray-50">
            <p className="text-sm">
              <span className="font-semibold">Prompt type 1:&nbsp;</span>
              Ticker=<span className="text-blue-600">SOFI</span>, Year=
              <span className="text-blue-600">2024</span>, Quarters=
              <span className="text-blue-600">4</span>
            </p>
            <p className="text-sm mt-2">
              <span className="font-semibold">Prompt type 2:&nbsp;</span>
              Ticker=<span className="text-blue-600">[SOFI, JPM, MS]</span>,
              Year=<span className="text-blue-600">2024</span>, Quarters=
              <span className="text-blue-600">4</span>
            </p>
          </section>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          <div className="flex-1 overflow-y-auto">
            {chats.map((msg, index) => (
              <section
                style={{ marginBottom: msg.id % 2 === 0 ? "60px" : "30px" }}
                key={index}
                className={`flex-1 overflow-y-auto p-[20px] rounded text-sm-200 ${
                  msg.sender === "user"
                    ? "bg-blue-100 text-white self-end"
                    : "bg-gray-200 text-black self-start"
                }`}
              >
                <div className="prose ml-6 custom-markdown">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw]}
                  >
                    {msg.text}
                  </ReactMarkdown>
                </div>
              </section>
            ))}
          </div>

          {isLoading && (
            <div className="loading-container">
              <div className="spinner"></div>
              <p className="loading-text">Uploading transcripts...</p>
            </div>
          )}

          <div ref={scrollViewRef}></div>
        </div>
        <div className="border-t pt-2 flex items-center">
          <input
            type="text"
            placeholder="Type a message..."
            className="flex-1 border-none outline-none px-3 py-2 rounded-lg bg-gray-200"
            onChange={(e) => setInput(e.target.value)}
            value={inputText}
            onKeyDown={handleKeyDown}
          />
          <SendHorizonalIcon
            onClick={getAgentResponse}
            className="w-5 h-5 ml-2"
            color="blue"
          />
        </div>
      </div>
    </div>
  );
}


