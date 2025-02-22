import React, { useState, useEffect, useRef } from "react";
import Head from "next/head";
import { useChat } from "@ai-sdk/react";
import { useSelector } from "react-redux";


const Chat = () => {
  const foundationModel = useSelector((state: any) => state.sidebar.foundationModel);
  const fmTemperature = useSelector((state: any) => state.sidebar.fmTemperature);
  const fmMaxTokens = useSelector((state: any) => state.sidebar.fmMaxTokens);

  const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/fanancial`;
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: apiUrl,
    body: {
      modelId: foundationModel,
      temperature: parseFloat(fmTemperature),
      max_tokens: parseInt(fmMaxTokens, 10),
    }
  });

  
  const messagesEndRef = useRef(null);

  const suggestedQuestions = [
    "What are the most common transaction types for credit card transactions?",
    "What is the total balance for all business transactions?",
    "Show me all transactions for Acme Corporation in June 2023",
  ];

  const handleButtonClick = (question: string) => {
    const mockInputEvent = {
      target: {
        value: question,
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
        value: question,
      },
      bubbles: true,
      cancelable: true,
      defaultPrevented: false,
      eventPhase: 3,
      isTrusted: true,
      timeStamp: Date.now(),
      type: "input",
    } as unknown as React.ChangeEvent<HTMLInputElement>;

    const mockFormEvent = {
      preventDefault: () => {},
      stopPropagation: () => {},
      target: {
        value: question,
        acceptCharset: "",
        action: "",
        elements: [] as unknown as HTMLFormControlsCollection,
        encoding: "",
        enctype: "",
        length: 0,
        method: "",
        name: "",
        noValidate: false,
        reset: () => {},
        submit: () => {},
      },
      currentTarget: {} as EventTarget & HTMLFormElement,
      bubbles: true,
      cancelable: true,
      defaultPrevented: false,
      eventPhase: 3,
      isTrusted: true,
      timeStamp: Date.now(),
      type: "submit",
      nativeEvent: new Event("submit"),
    } as unknown as React.FormEvent<HTMLFormElement>;

    handleInputChange(mockInputEvent);
    handleSubmit(mockFormEvent);
  };

  const scrollToBottom = () => {
    const element = messagesEndRef.current;
    if (element !== null) {
      (element as HTMLElement).scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex flex-col w-full h-full bg-white shadow-lg rounded-lg p-6">
      <div className="flex-grow overflow-y-auto">
        {messages.map((m: any) => (
          <div
            key={m.id}
            className={`whitespace-pre-wrap p-3 rounded-lg mb-2 ${
              m.role === "user" ? "bg-blue-100 text-blue-900 self-end" : "bg-gray-100 text-gray-900 self-start"
            }`}
          >
            <span className="font-semibold">{m.role === "user" ? "User" : "AI"}: </span>
            {m.content}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="mt-4">
        <h3 className="font-bold text-lg mb-3">Suggested Questions:</h3>
        <div className="flex flex-wrap">
          {suggestedQuestions.map((question, index) => (
            <button
              key={index}
              className="bg-blue-500 text-white px-4 py-2 rounded-full mr-2 mb-2 hover:bg-blue-600 transition duration-200"
              onClick={() => handleButtonClick(question)}
            >
              {question}
            </button>
          ))}
        </div>
      </div>
      <form onSubmit={handleSubmit} className="mt-4">
        <div className="flex">
          <input
            className="flex-grow p-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={input}
            placeholder="Say something..."
            onChange={handleInputChange}
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-r-lg hover:bg-blue-600 transition duration-200"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default function Dashboard() {
  const [selectedTab, setSelectedTab] = useState("credit_card_transactions");
  const [data, setData] = useState<any>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/fanancial-data`
        );
        const data = await response.json();
        setData(data?.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const tabs = [
    { key: "credit_card_transactions", label: "Credit card transactions" },
    { key: "closing_house_transactions", label: "Closing house transactions" },
    { key: "business_transactions", label: "Business transactions" },
  ];

  const renderContent = () => {
    switch (selectedTab) {
      case "credit_card_transactions":
        return (
          <div className="overflow-x-auto">
            <table className="table-auto w-full border-collapse text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-6 py-3 text-left">Bank Name</th>
                  <th className="border px-6 py-3 text-left">Company Name</th>
                  <th className="border px-6 py-3 text-left">Card Type</th>
                  <th className="border px-6 py-3 text-left">Balance</th>
                  <th className="border px-6 py-3 text-left">Transaction Type</th>
                  <th className="border px-6 py-3 text-left">Amount</th>
                  <th className="border px-6 py-3 text-left">Date</th>
                  <th className="border px-6 py-3 text-left">Company Id</th>
                </tr>
              </thead>
              <tbody>
                {data?.credit_card_transactions.length > 0 &&
                  data?.credit_card_transactions?.map((item: any) => (
                    <tr key={item.CustomerId} className="odd:bg-white even:bg-gray-50">
                      <td className="border px-6 py-3">{item["Bank Name"]}</td>
                      <td className="border px-6 py-3">{item.Name}</td>
                      <td className="border px-6 py-3">{item["Card Type"]}</td>
                      <td className="border px-6 py-3">{item.Balance}</td>
                      <td className="border px-6 py-3">{item["Transaction Type"]}</td>
                      <td className="border px-6 py-3">{item.Amount}</td>
                      <td className="border px-6 py-3">{new Date(item.Date).toLocaleDateString()}</td>
                      <td className="border px-6 py-3">{item.CustomerId}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        );
  
      case "closing_house_transactions":
        return (
          <div className="overflow-x-auto">
            <table className="table-auto w-full border-collapse text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-6 py-3 text-left">Bank Name</th>
                  <th className="border px-6 py-3 text-left">Company Name</th>
                  <th className="border px-6 py-3 text-left">Account Name</th>
                  <th className="border px-6 py-3 text-left">Balance</th>
                  <th className="border px-6 py-3 text-left">Transaction Type</th>
                  <th className="border px-6 py-3 text-left">Amount</th>
                  <th className="border px-6 py-3 text-left">Date</th>
                  <th className="border px-6 py-3 text-left">Company Id</th>
                </tr>
              </thead>
              <tbody>
                {data?.closing_house_transactions.length > 0 &&
                  data?.closing_house_transactions?.map((item: any) => (
                    <tr key={item.CustomerId} className="odd:bg-white even:bg-gray-50">
                      <td className="border px-6 py-3">{item["Bank Name"]}</td>
                      <td className="border px-6 py-3">{item.Name}</td>
                      <td className="border px-6 py-3">{item["Account Name"]}</td>
                      <td className="border px-6 py-3">{item.Balance}</td>
                      <td className="border px-6 py-3">{item["Transaction Type"]}</td>
                      <td className="border px-6 py-3">{item.Amount}</td>
                      <td className="border px-6 py-3">{new Date(item.Date).toLocaleDateString()}</td>
                      <td className="border px-6 py-3">{item.CustomerId}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        );
  
      case "business_transactions":
        return (
          <div className="overflow-x-auto">
            <table className="table-auto w-full border-collapse text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-6 py-3 text-left">Bank Name</th>
                  <th className="border px-6 py-3 text-left">Company Name</th>
                  <th className="border px-6 py-3 text-left">Account Name</th>
                  <th className="border px-6 py-3 text-left">Balance</th>
                  <th className="border px-6 py-3 text-left">Transaction Type</th>
                  <th className="border px-6 py-3 text-left">Amount</th>
                  <th className="border px-6 py-3 text-left">Date</th>
                  <th className="border px-6 py-3 text-left">Company Id</th>
                </tr>
              </thead>
              <tbody>
                {data?.business_transactions.length > 0 &&
                  data?.business_transactions?.map((item: any) => (
                    <tr key={item.CustomerId} className="odd:bg-white even:bg-gray-50">
                      <td className="border px-6 py-3">{item["Bank Name"]}</td>
                      <td className="border px-6 py-3">{item.Name}</td>
                      <td className="border px-6 py-3">{item["Account Name"]}</td>
                      <td className="border px-6 py-3">{item.Balance}</td>
                      <td className="border px-6 py-3">{item["Transaction Type"]}</td>
                      <td className="border px-6 py-3">{item.Amount}</td>
                      <td className="border px-6 py-3">{new Date(item.Date).toLocaleDateString()}</td>
                      <td className="border px-6 py-3">{item.CustomerId}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        );
  
      default:
        return null;
    }
  };
  

  return (
    <div className="h-screen flex flex-col">
      <Head>
        <title>Financial Data</title>
      </Head>
      <main className="container mx-auto px-4 py-6 flex-grow relative overflow-hidden">
        <div className="w-full h-full flex flex-col overflow-y-auto">
          <h1 className="text-3xl font-bold mb-6">Financial Data</h1>
          <div className="flex space-x-4 mb-6">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setSelectedTab(tab.key)}
                className={`px-4 py-2 rounded ${
                  selectedTab === tab.key
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="flex-grow overflow-y-auto">
            {renderContent()}
          </div>
        </div>
        <button
          className="fixed bottom-4 right-4 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700"
          style={{ zIndex: 1000 }}
          onClick={toggleChat}
        >
          Chat
        </button>
        {isChatOpen && (
          <div className="fixed bottom-0 right-4 h-screen w-full max-w-md bg-white rounded shadow-lg overflow-hidden z-50">
            <Chat />
          </div>
        )}
      </main>
    </div>
  );
}
