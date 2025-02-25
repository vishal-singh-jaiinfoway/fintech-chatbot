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

const analysis = `# Margin Discussion – Question by Casey Whitman (Piper Sandler)  
### Executive Response (Nicole Stokes)  

#### Sentiment Analysis:  
- **Tone:** Cautious and measured. Nicole uses guarded language (e.g., “I don’t want to oversell”) and explains the factors affecting the margin (beta catch-up, deposit mix changes, asset sensitivity).  
- **Confidence:** The response is factual and balanced—highlighting both positive trends (lower basis point compression) and uncertainties (the impact of future deposit cost changes).  

#### Suggestions for Improvement:  
- **Clarity:** Provide clearer, quantifiable forward guidance or a range for expected margin trends.  
- **Visualization:** Consider using charts or tables in follow-up materials to break down the contributions of each factor (e.g., beta catch-up, deposit mix, asset sensitivity).  
- **Comparative Context:** Briefly compare current figures with historical benchmarks or peer performance for added context.  

---

# Mortgage Discussion – Question by Will Jones (KBW)  
### Executive Response (Nicole Stokes and Palmer Proctor)  

#### Sentiment Analysis:  
- **Tone:** Optimistic yet pragmatic. Nicole outlines controlled expense growth despite increased production, and Palmer reinforces confidence in the mortgage pipeline and underlying production trends.  
- **Confidence:** Both executives express confidence in cost containment and the capacity to handle increased volume, noting advantages like technology and talent.  

#### Suggestions for Improvement:  
- **Detail on Costs:** Include more specifics on how cost containment measures will evolve as production ramps up (e.g., specific targets for efficiency ratios over time).  
- **Forward Outlook:** Provide a more detailed view of revenue growth projections or benchmarks to help investors understand the margin between revenue gains and expense growth.  
- **Risk Discussion:** Acknowledge any potential risks or market conditions that might impact mortgage margins, even briefly, to reinforce credibility.  

---

# Loan Repricing and Reserve Build – Question by Russell Gunther (Stephens)  
### Executive Response (Nicole Stokes)  

#### Sentiment Analysis:  
- **Tone:** Factual and data-driven. Nicole offers specific percentages (e.g., 36–37% of loans repricing, fixed vs. variable dynamics) to explain the current state.  
- **Confidence:** The answer is grounded in portfolio details, showing control over the credit environment.  

#### Suggestions for Improvement:  
- **Simplification:** Streamline the explanation by breaking down complex points (like the impact of fixed versus variable loan behaviors) into more digestible components.  
- **Impact Emphasis:** Elaborate a bit more on the expected effect on overall margins or credit quality as these repricing events occur, to better tie it to the bottom line.  

---

# Net Interest Margin and PPNR ROA Outlook – Question by Christopher Marinac (Janney Montgomery Scott)  
### Executive Response (Nicole Stokes)  

#### Sentiment Analysis:  
- **Tone:** Cautiously optimistic. Nicole stresses that maintaining a margin around 3.50% is a victory and indicates a slight compression may occur in the short term.  
- **Confidence:** The response conveys confidence in the bank’s positioning without being overcommitted about a “bottom” in the cycle.  

#### Suggestions for Improvement:  
- **Precision:** Offer more precise ranges or scenarios to illustrate how margin fluctuations might impact overall profitability metrics such as PPNR ROA.  
- **Scenario Analysis:** Consider discussing “if-then” scenarios based on different rate movements, which can help investors better understand potential outcomes.  
- **Consistency:** Maintain consistency in messaging by reaffirming how tactical decisions (like short-term CD maturities) support long-term goals.  

---

# SBA and Credit Quality – Follow-Up by Christopher Marinac  
### Executive Response (Doug Strange and Palmer Proctor)  

#### Sentiment Analysis:  
- **Tone:** Measured and reassuring. Doug emphasizes that the SBA portfolio is a small part of the overall book and that the current stress is manageable. Palmer adds a forward-looking note on potential SBA program adjustments.  
- **Confidence:** Both executives communicate that they are well-prepared for potential challenges, balancing caution with optimism.  

#### Suggestions for Improvement:  
- **Detail on Mitigation:** Provide more insight into specific measures being taken to manage the stress in the SBA portfolio.  
- **Program Updates:** Outline any planned monitoring or communication strategies regarding potential SBA program changes, to keep investors informed in real time.  
- **Contextual Data:** Include a brief mention of historical performance or industry benchmarks for SBA portfolios to provide context on why the current stress is viewed as manageable.  

---

# Balance Sheet Management and Capital Priorities – Question by David Feaster (Raymond James)  
### Executive Response (Nicole Stokes, Palmer Proctor, Doug Strange)  

#### Sentiment Analysis:  
- **Tone:** Confident and proactive. Nicole and Palmer describe active management of deposit maturities, bond portfolio adjustments, and capital preservation strategies with clear examples and numbers.  
- **Confidence:** The executives’ tone is assertive, stressing flexibility and readiness for rate uncertainty.  

#### Suggestions for Improvement:  
- **Forward Strategy:** Provide more detailed, forward-looking strategies for how the balance sheet might be adjusted if interest rate environments change significantly.  
- **Capital Deployment:** Clarify potential future capital deployment plans (e.g., buybacks, reinvestment opportunities) with concrete benchmarks or triggers.  
- **Risk Consideration:** Acknowledge any potential downside scenarios in the balance sheet management plan to further build trust and transparency.  

---

# General Recommendations Across All Executive Q&A  

- **Enhanced Data Visualization:** Supplement verbal answers with visual aids (charts, graphs) in investor presentations or supplemental documents to convey complex data clearly.  
- **Consistency in Messaging:** Ensure that all responses consistently tie back to key strategic themes (e.g., deposit growth, margin stability, risk management) to reinforce a cohesive narrative.  
- **Proactive Communication:** When discussing uncertainties (such as rate movements or economic cycles), proactively outline contingency plans or risk mitigation strategies.  
- **Investor Education:** Consider adding a brief contextual note on how specific metrics (like beta catch-up or asset sensitivity) impact overall performance, to educate less technical investors.  
`;

export default function Dashboard() {
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
  const [selectedYear, setSelectedYear] = useState(years[0]);
  const [selectedQuarter, setSelectedQuarter] = useState(quarters[0]);
  const [chats, setChats] = useState([]);
  const [isLoading, setLoading] = useState(false);

  const messagesEndRef = useRef(null);
  const [inputText, setInputText] = useState("");
  const [checked, setChecked] = useState(false);

  const [content, setContent] = useState("");
  const apiUrlSentiments = `${process.env.NEXT_PUBLIC_API_URL}/sentiment-analysis`;
const [ticker, setTicker] = useState("");
useEffect(() => {
  console.log("selectedQuarter", selectedQuarter);
  if (checked) {
    getSentimentAnalysis();
  }
}, [checked, selectedCompany, selectedQuarter, selectedYear]);

useEffect(() => {
  if (messagesEndRef.current) {
    messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
  }
}, [chats]);

const getAgentResponse = async () => {
  setLoading(true);
  setInputText("");
  setInputValue("");
  const res = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      inputText: inputText,
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
  let length = chats.length;

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      setLoading(false);
      break;
    }
    resultText += decoder.decode(value, { stream: true });

    setChats((prev) => {
      let temp = [...prev];
      (temp[length] = {
        id: length + 1,
        text: inputText,
        sender: "user",
      }),
        (temp[length + 1] = { ...temp[length + 1], text: resultText });
      return temp;
    });
  }
};

const getSentimentAnalysis = async () => {
  // setLoading(true);
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
      // setLoading(false);
      break;
    }
    resultText += decoder.decode(value, { stream: true });

    const sanitizedMarkdown = DOMPurify.sanitize(resultText);
    setContent(sanitizedMarkdown);
  }
};

const handleCompanyChange = (event) => {
  const selectedTicker = event.target.value;
  const selectedCompanyObj = companies.find(
    (company) => company.ticker === selectedTicker,
  );
  console.log("handleCompanyChange", selectedCompanyObj);
  setSelectedCompany(selectedCompanyObj); // Now setting the full object
};
const handleCategoryChange = (event) => setSelectedCategory(event.target.value);

const handleYearChange = (event) => setSelectedYear(event.target.value);

const handleQuarterChange = (event) => setSelectedQuarter(event.target.value);

const handleInputChangeWithCompany = (event) => {
  setInputValue(event.target.value);
  setInputText(
    `${event.target.value} for ${selectedCompany.name} in ${selectedCategory} category  ${selectedQuarter} quarter of ${selectedYear}`,
  );
};

const handleButtonClick = (question) => {
  const formattedQuestion = `${question} for ${selectedCompany.name} in ${selectedCategory} category for ${selectedQuarter} quarter of ${selectedYear}`;
  setInputValue(formattedQuestion);
  setInputText(formattedQuestion);
};

return (
  <div className="h-screen flex flex-col bg-gray-50 overflow-y-auto mr-2">
    <Head>
      <title>Business Insights</title>
    </Head>
    <header className="bg-blue-600 text-white py-4 px-6 shadow-md">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold">Business Insights</h1>
      </div>
    </header>
    <main className="container mx-auto flex-grow ">
      <div className="bg-white p-6 w-full h-full rounded-lg shadow-lg flex flex-col">
        <div className="flex flex-row items-center gap-4">
          <div className="mb-4">
            <label className="block text-lg font-medium mb-2 text-gray-700">
              Select Company:
            </label>
            <select
              style={{ outlineWidth: 0 }}
              value={selectedCompany.ticker} // Use ticker instead of object
              onChange={handleCompanyChange}
              className="p-2 border border-gray-300 rounded"
            >
              {companies.map((company, index) => (
                <option key={index} value={company.ticker}>
                  {company.name}
                </option>
              ))}
            </select>
          </div>
          {checked ? null : (
            <div className="mb-4">
              <label className="block text-lg font-medium mb-2 text-gray-700">
                Select Category:
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
          )}
        </div>
        <div className="flex flex-row items-center gap-4">
          <div className="mb-4">
            <label className="block text-lg font-medium mb-2 text-gray-700">
              Select Year:
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
              Select Quarter:
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
        <div className="mb-4">
          <CustomCheckbox
            checked={checked}
            setChecked={setChecked}
          ></CustomCheckbox>
        </div>
        {checked ? (
          <SentimentAnalysisComponent
            content={content}
          ></SentimentAnalysisComponent>
        ) : (
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

const SentimentAnalysisComponent = ({ content }) => {
  return (
    <div className="prose overflow-auto ml-20 mb-10 custom-markdown">
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
        {content}
      </ReactMarkdown>
    </div>
  );
};
