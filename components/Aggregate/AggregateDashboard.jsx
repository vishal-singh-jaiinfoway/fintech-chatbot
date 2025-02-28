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

export default function AggregateDashboard({ isChatOpen, setIsChatOpen }) {
  const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/aggregate-insights-api`;
  const [selectedCompanies, setSelectedCompanies] = useState([]);

  const [inputValue, setInputValue] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(
    Object.keys(suggestedQuestions)[0],
  );
  const [selectedQuestion, setSelectedQuestion] = useState(null);

  const [selectedYear, setSelectedYear] = useState(years[0]);
  const [selectedQuarter, setSelectedQuarter] = useState(quarters[0]);
  const [chats, setChats] = useState([]);
  const [isLoading, setLoading] = useState(false);

  const startRef = useRef(null);

  const messagesEndRef = useRef(null);
  const [inputText, setInputText] = useState("");
  const [fetchUploadChats, setFetchUploadChats] = useState([]);

  const [filters, setFilters] = useState([
    ...selectedCompanies,
    selectedYear,
    selectedQuarter,
  ]);

  const removeFilter = (filterToRemove) => {
    setFilters(filters.filter((filter) => filter !== filterToRemove));
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chats]);

  useEffect(() => {
    setInputText(
      `${selectedQuestion} ${
        selectedCompanies.length ? "for " + selectedCompanies.join(",") : ""
      } ${
        filters.includes(selectedQuarter)
          ? "for the " + selectedQuarter + " quarter"
          : ""
      } ${filters.includes(selectedYear) ? "of " + selectedYear : ""}`,
    );
  }, [filters]);

  useEffect(() => {
    setInputText(
      `${inputValue} ${
        selectedCompanies.length ? "for " + selectedCompanies.join(",") : ""
      } ${
        filters.includes(selectedQuarter)
          ? "for the " + selectedQuarter + " quarter"
          : ""
      } ${filters.includes(selectedYear) ? "of " + selectedYear : ""}`,
    );
  }, [
    inputValue,
    selectedCompanies,
    selectedCategory,
    selectedQuarter,
    selectedYear,
  ]);

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
            id: length + 1,
            text: inputValue,
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
          inputValue,
          chats: chats,
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
        console.log("resultText", resultText);
        const sanitizedMarkdown = DOMPurify.sanitize(resultText);
        setChats((prev) => {
          let temp = [...prev];
          temp[length + 1] = { ...temp[length + 1], text: sanitizedMarkdown };
          return temp;
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleCategoryChange = (event) =>
    setSelectedCategory(event.target.value);

  const handleYearChange = (event) => setSelectedYear(event.target.value);

  const handleQuarterChange = (event) => setSelectedQuarter(event.target.value);

  const handleInputChangeWithCompany = (event) => {
    setInputValue(event.target.value);
    setInputText(
      `${event.target.value} ${
        selectedCompanies.length ? "for " + selectedCompanies.join(",") : ""
      } ${
        filters.includes(selectedQuarter)
          ? "for the " + selectedQuarter + " quarter"
          : ""
      } ${filters.includes(selectedYear) ? "of " + selectedYear : ""}`,
    );
  };
  const handleButtonClick = (question) => {
    // const formattedQuestion = `${question} ${
    //   selectedCompanies.length ? "for " + selectedCompanies.join(",") : ""
    // } ${
    //   filters.includes(selectedQuarter)
    //     ? "for the " + selectedQuarter + " quarter"
    //     : ""
    // } ${filters.includes(selectedYear) ? "of " + selectedYear : ""}`;
    setInputValue(question);
    scrollToBottom();
    setSelectedQuestion(question);
  };

  useEffect(() => {
    console.log("startRef", startRef.current);
  }, [startRef.current]);

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
    <div className="h-screen flex flex-col bg-gray-50 overflow-y-auto mr-2">
      <Head>
        <title>Aggregate Business Insights</title>
      </Head>
      <header className="bg-blue-600 text-white py-4 px-6 shadow-md">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold">Aggregate Business Insights</h1>
        </div>
      </header>
      <main className="container mx-auto flex-grow">
        <div className="bg-white p-6 w-full h-full rounded-lg shadow-lg flex flex-col">
          <div className="flex flex-row items-center gap-4">
            <div className="mb-4">
              <label className="block text-lg font-medium mb-2 text-gray-700">
                Company
              </label>
              <MultiSelect
                selectedCompanies={selectedCompanies}
                setSelectedCompanies={setSelectedCompanies}
              ></MultiSelect>
              {/* <CustomMultiSelect></CustomMultiSelect> */}
            </div>

            <div className="mb-4">
              <label className="block text-lg font-medium mb-2 text-gray-700">
                Category
              </label>
              <select
                style={{ outlineWidth: 0 }}
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

            <div className="mb-4 p-2 border border-gray-300 rounded">
              {selectedCompanies && selectedCompanies.length ? (
                <>
                  <label className="block text-lg font-medium mb-2 text-gray-700">
                    Selected
                  </label>
                  <div className="w-[300px] overflow-x-auto">
                    <b>{selectedCompanies.join(",")}</b>
                  </div>
                </>
              ) : null}
            </div>
          </div>
          <div className="flex flex-row items-center gap-4">
            <div className="mb-4" ref={startRef}>
              <label className="block text-lg font-medium mb-2 text-gray-700">
                Year
              </label>
              <select
                style={{ outlineWidth: 0 }}
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
                Quarter
              </label>
              <select
                style={{ outlineWidth: 0 }}
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

          <>
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
                  className={`p-2 rounded-lg ${
                    index % 2 != 0 ? "mb-[30px]" : "mb-[15px]"
                  } ${
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

                  <div className="prose ml-6 custom-markdown">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeRaw]}
                    >
                      {m.text}
                    </ReactMarkdown>
                  </div>
                </div>
              ))}
              <ScrollToTop scrollToTop={scrollToTop}></ScrollToTop>
              {/* Loading Indicator */}
              {isLoading && (
                <div className="loading-container">
                  <div className="spinner"></div>
                  <p className="loading-text">Generating response...</p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            {/* <div className="flex flex-wrap gap-2 mb-3">
              {filters.map((filter, index) => (
                <span
                  key={index}
                  className="bg-blue-500 text-white px-3 py-1 rounded-full flex items-center"
                >
                  {filter?.name ? filter.name : filter}

                  <X
                    className="ml-2 text-white hover:text-red-500"
                    onClick={() => removeFilter(filter)}
                  ></X>
                </span>
              ))}
            </div> */}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!selectedCompanies.length) {
                  return alert("Please select atleast one company");
                }
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
        </div>

        {isChatOpen && (
          <FetchUploadPopUp
            isOpen={isChatOpen}
            setIsOpen={setIsChatOpen}
            chats={fetchUploadChats}
            setChats={setFetchUploadChats}
          ></FetchUploadPopUp>
        )}
      </main>
    </div>
  );
}

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
      className={`fixed bottom-6 right-6 p-3 bg-blue-600 text-white rounded-full shadow-lg transition-opacity duration-300 ${
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
        const sanitizedMarkdown = DOMPurify.sanitize(resultText);

        setChats((prev) => {
          let temp = [...prev];
          temp[length + 1] = { ...temp[length + 1], text: sanitizedMarkdown };
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

function MultiSelect({ selectedCompanies, setSelectedCompanies }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleSelect = (ticker) => {
    setSelectedCompanies(
      (prev) =>
        prev.includes(ticker)
          ? prev.filter((item) => item !== ticker) // Remove if already selected
          : [...prev, ticker], // Add if not selected
    );
  };
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  return (
    <div className="relative inline-block w-[250px]" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="border px-4 py-2 bg-white w-full text-left rounded border border-gray-300"
      >
        Select Companies
      </button>

      {isOpen && (
        <div className="absolute border bg-white mt-1 shadow-md w-full max-h-[150px] overflow-y-auto rounded">
          {companies.map((company) => (
            <label
              key={company.ticker}
              className="flex items-center p-2 cursor-pointer hover:bg-gray-100"
            >
              <input
                type="checkbox"
                checked={selectedCompanies.includes(company.ticker)}
                onChange={() => handleSelect(company.ticker)}
                className="mr-2"
              />
              {company.name}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

// function CustomMultiSelect() {

//     const [selectedOptions, setSelectedOptions] = useState([]);
//     const [isOpen, setIsOpen] = useState(false);

//     const toggleOption = (value) => {
//         setSelectedOptions((prev) =>
//             prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
//         );
//     };

//     return (
//         <div className="relative inline-block w-[250px] z-[50]">
//             <button
//                 onClick={() => setIsOpen(!isOpen)}
//                 className="border px-4 py-2 bg-white w-full text-left"
//             >
//                 {selectedOptions.length > 0 ? selectedOptions.join(", ") : "Select Options"}
//             </button>

//             {isOpen && (
//                 <div className="absolute border bg-white mt-1 shadow-md w-full max-h-[150px] overflow-y-auto rounded">
//                     {companies.map((option) => (
//                         <label key={option.ticker} className="flex items-center p-2 cursor-pointer hover:bg-gray-100">
//                             <input
//                                 type="checkbox"
//                                 checked={selectedOptions.includes(option.ticker)}
//                                 onChange={() => toggleOption(option.ticker)}
//                                 className="mr-2 h-[20px] w-[20px] overflow-auto-x"
//                             />
//                             {option.name}
//                         </label>
//                     ))}
//                 </div>
//             )}
//         </div>
//     );
// }
