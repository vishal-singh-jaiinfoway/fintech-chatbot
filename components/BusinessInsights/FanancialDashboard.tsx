import React, { useState, useEffect, useRef } from "react";
import Head from "next/head";
import { useChat } from '@ai-sdk/react';
import { useSelector } from "react-redux";

export default function Dashboard() {
  const foundationModel = useSelector((state: any) => state.sidebar.foundationModel);
  const fmTemperature = useSelector((state: any) => state.sidebar.fmTemperature);
  const fmMaxTokens = useSelector((state: any) => state.sidebar.fmMaxTokens);
  const context  = useSelector((state: any) => state.sidebar.context);

  const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/business-insights-api`;
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: apiUrl,
    body: {
      modelId: foundationModel,
      temperature: parseFloat(fmTemperature),
      max_tokens: parseInt(fmMaxTokens, 10),
      context: context
    }
  });

  const suggestedQuestions = [
    "What are the interest rate exposure and hedging strategies in 2021?",
    "How did the credit rating. change from 2019 to 2023, and what actions were taken to improve it?",
    "What was the net cash flow in 2020, and what were the contributing factors?",
  ];

  const persona = useSelector((state: any) => state.sidebar.persona);

  const [selectedCompany, setSelectedCompany] = useState("SoFi Technologies Inc: SOFI");
  const [inputValue, setInputValue] = useState("");
  const companies = ["SoFi Technologies Inc: SOFI", "Morgan Stanley", "JPMorgan Chase & Co", "Microsoft Corp"];
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleCompanyChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCompany(event.target.value);
  };

  const handleInputChangeWithCompany = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
    handleInputChange({
      ...event,
      target: {
        ...event.target,
        value: `${event.target.value} for this company ${selectedCompany} and persona is ${persona}`,
      },
    });
  };

  const handleButtonClick = (question: string) => {
    const questionWithCompany = `${question} for this company ${selectedCompany} and persona is ${persona}`;
    setInputValue(questionWithCompany);
    handleInputChange({
      target: {
        value: questionWithCompany,
        addEventListener: () => {},
        dispatchEvent: () => false,
        removeEventListener: () => {},
        name: "",
        id: "",
        type: "text",
        checked: false,
        files: null,
        form: null,
        list: null,
        size: 0,
        maxLength: 0,
        selectionStart: 0,
        selectionEnd: 0,
        selectionDirection: "none",
        willValidate: false,
        validity: {
          badInput: false,
          customError: false,
          patternMismatch: false,
          rangeOverflow: false,
          rangeUnderflow: false,
          stepMismatch: false,
          tooLong: false,
          tooShort: false,
          typeMismatch: false,
          valid: true,
          valueMissing: false,
        },
        validationMessage: "",
        labels: null,
        autofocus: false,
        defaultChecked: false,
        defaultValue: "",
        disabled: false,
        indeterminate: false,
        multiple: false,
        readOnly: false,
        required: false,
      },
      preventDefault: () => {},
      stopPropagation: () => {},
      nativeEvent: new Event("input"),
      currentTarget: {
        value: questionWithCompany,
      },
      bubbles: true,
      cancelable: true,
      defaultPrevented: false,
      eventPhase: 3,
      isTrusted: true,
      timeStamp: Date.now(),
      type: "input",
    } as unknown as React.ChangeEvent<HTMLInputElement>);
  };

  const handleSubmitWithCompany = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleSubmit(event);
    setInputValue(""); // Clear the input after submitting
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
      <main className="container mx-auto flex-grow py-4 px-4 overflow-hidden">
        <div className="bg-white p-6 w-full h-full rounded-lg shadow-lg flex flex-col">
          <div className="mb-4">
            <label htmlFor="companySelect" className="block text-lg font-medium mb-2 text-gray-700">
              Select Company:
            </label>
            <select
              id="companySelect"
              value={selectedCompany}
              onChange={handleCompanyChange}
              className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {companies.map((company, index) => (
                <option key={index} value={company}>
                  {company}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-grow overflow-y-auto mb-4 custom-scrollbar p-4 bg-gray-100 rounded-lg">
            {messages.map((m) => (
              <div key={m.id} className={`whitespace-pre-wrap p-2 mb-2 rounded-lg ${m.role === "user" ? "bg-blue-100 text-blue-900 self-end" : "bg-gray-200 text-gray-900 self-start"}`}>
                <span className={`${m.role === "user" ? "text-blue-600" : "text-green-600"} font-semibold`}>
                  {m.role === "user" ? "User: " : "AI: "}
                </span>
                <span>{m.content}</span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className="mb-4">
            <h3 className="font-bold mb-2 text-gray-700">Suggested Questions:</h3>
            <div className="flex flex-wrap">
              {suggestedQuestions.map((question, index) => (
                <button
                  key={index}
                  className="bg-blue-500 text-white px-3 py-1 rounded mr-2 mb-2 hover:bg-blue-600 transition duration-200"
                  onClick={() => handleButtonClick(question)}
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
          <form onSubmit={handleSubmitWithCompany} className="flex">
            <input
              className="flex-grow p-2 border border-gray-300 rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={inputValue}
              placeholder="Say something..."
              onChange={handleInputChangeWithCompany}
            />
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600 transition duration-200">
              Send
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
