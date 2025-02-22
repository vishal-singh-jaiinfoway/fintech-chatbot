import React, { useState, useEffect, useRef } from "react";
import Head from "next/head";
import { useChat } from "@ai-sdk/react";
import { useSelector } from "react-redux";
import MarkdownRenderer from "../Utility/Markdown/MarkdownRenderer";

const suggestedQuestions = {
  "Financial Performance & Guidance": {
    "Common Questions": [
      "What were the most common financial questions analysts asked?",
      "What concerns did analysts raise about revenue, EPS, net income, margins, and loan growth?",
      "Did analysts ask about guidance for the next quarter/year? What was the management’s response?",
      "Were there any unexpected financial concerns analysts highlighted?",
      "How did competitors justify misses or beats on financial expectations?",
    ],
  },
  "Interest Rate & Macro Impact": {
    "Common Questions": [
      "What did analysts ask about the impact of Fed rate changes on net interest margin (NIM)?",
      "How did competitors respond to concerns about loan demand and deposit pricing pressure?",
      "Were there any discussions around inflation and economic outlook?",
    ],
  },
  "Loan Portfolio & Credit Risk": {
    "Common Questions": [
      "What questions did analysts ask regarding loan portfolio quality, delinquency rates, and charge-offs?",
      "How did competitors address concerns about credit risk and exposure to specific industries (e.g., CRE, C&I loans)?",
      "Did analysts probe into loan loss provisions and reserve levels?",
      "Were there any regulatory concerns about stress tests or liquidity management?",
    ],
  },
  "Deposit Trends & Liquidity": {
    "Common Questions": [
      "What concerns did analysts raise about deposit outflows and cost of deposits?",
      "How did competitors explain liquidity management strategies?",
      "Were there any discussions around CDs, money market accounts, and client behavior shifts?",
    ],
  },
  "Technology & Digital Banking": {
    "Common Questions": [
      "Did analysts question digital transformation, fintech partnerships, or investment in AI/automation?",
      "What strategies did competitors highlight for digital banking growth?",
      "Were there concerns about operational risks, cybersecurity, or compliance issues?",
    ],
  },
  "Capital Allocation & Shareholder Returns": {
    "Common Questions": [
      "What did analysts ask about dividends, stock buybacks, and capital deployment?",
      "How did competitors justify capital decisions in light of regulatory requirements and growth plans?",
      "Were there discussions around M&A activity or expansion plans?",
    ],
  },
  "Regulatory & Compliance Risks": {
    "Common Questions": [
      "Did analysts ask about compliance with Basel III, stress tests, or new banking regulations?",
      "Were there any concerns raised about government scrutiny, lawsuits, or regulatory penalties?",
    ],
  },
  "Competitive Landscape & Market Positioning": {
    "Common Questions": [
      "How did analysts probe into competitive threats (regional banks, fintech, big banks)?",
      "What differentiation strategies did competitors highlight?",
      "Were there any discussions on customer retention, product offerings, or geographic expansion?",
    ],
  },
  "Cost Management & Operational Efficiency": {
    "Common Questions": [
      "What did analysts ask about cost-cutting measures, efficiency ratio, and expense control?",
      "How did competitors address questions around branch optimization and workforce restructuring?",
    ],
  },
  "Strategic Initiatives & Long-Term Vision": {
    "Common Questions": [
      "What future growth initiatives were analysts most interested in?",
      "Were there any concerns about leadership changes, succession planning, or cultural shifts?",
    ],
  },
};

const years=[2024];
const quarters=["1st","2nd","3rd","4rth"];

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
  const [selectedYear, setSelectedYear] = useState(
    years[0]
  );
  const [selectedQuarter, setSelectedQuarter] = useState(
    quarters[0]
  );
  const companies = [
    "SoFi Technologies Inc.",
    "Morgan Stanley",
    "JPMorgan Chase & Co",
    "Microsoft Corp",
  ];
  const messagesEndRef = useRef(null);
  const [inputText, setInputText] = useState("");
  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat({
      api: apiUrl,
      body: {
        modelId: foundationModel,
        temperature: parseFloat(fmTemperature),
        max_tokens: parseInt(fmMaxTokens, 10),
        context: context,
        inputText: inputValue,
      },
    });

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleCompanyChange = (event) => setSelectedCompany(event.target.value);
  const handleCategoryChange = (event) =>
    setSelectedCategory(event.target.value);

  const handleYearChange = (event) =>
    setSelectedYear(event.target.value);

  const handleQuarterChange = (event) =>
    setSelectedQuarter(event.target.value);

  const handleInputChangeWithCompany = (event) => {
    setInputValue(event.target.value);
    setInputText(
      `${event.target.value} for ${selectedCompany} in ${selectedCategory} category  ${selectedQuarter} quarter of ${selectedYear}`,
    );
    handleInputChange({
      ...event,
      target: {
        ...event.target,
        value: `${event.target.value} for ${selectedCompany} in ${selectedCategory} category  ${selectedQuarter} quarter of ${selectedYear}`,
      },
    });
  };

  const handleButtonClick = (question) => {
    const formattedQuestion = `${question} for ${selectedCompany} in ${selectedCategory} category for ${selectedQuarter} quarter of ${selectedYear}`;
    setInputValue(formattedQuestion);
    handleInputChange({ target: { value: formattedQuestion } });
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
                <option key={index} value={company}>
                  {company}
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
            {messages.map((m, index) => (
              <div
                key={index}
                className={`p-2 mb-2 rounded-lg ${
                  m.role === "user"
                    ? "bg-blue-100 text-blue-900"
                    : "bg-gray-200 text-gray-900"
                }`}
              >
                <span
                  className={`${
                    m.role === "user" ? "text-blue-600" : "text-green-600"
                  } font-semibold`}
                >
                  {m.role === "user" ? "User: " : "AI: "}
                </span>
                <MarkdownRenderer content={m.content} />
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
              handleSubmit(e);
              setInputValue("");
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
      {/* Styles */}
      <style jsx>{`
        .chat-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
          max-width: 500px;
          margin: auto;
        }

        .chat-box {
          width: 100%;
          min-height: 200px;
          max-height: 300px;
          overflow-y: auto;
          border: 1px solid #ddd;
          padding: 10px;
          border-radius: 5px;
          background: #f9f9f9;
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          margin-top: 15px;
        }

        .spinner {
          width: 30px;
          height: 30px;
          border: 3px solid rgba(0, 0, 0, 0.1);
          border-top-color: #007bff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .loading-text {
          margin-top: 8px;
          font-size: 14px;
          font-weight: bold;
          color: #555;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
