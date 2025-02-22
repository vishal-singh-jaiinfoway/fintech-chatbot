import React, { useState, useEffect, useRef } from "react";
import Head from "next/head";
import { useChat } from '@ai-sdk/react';
import { useSelector } from "react-redux";

const Chat = () => {
  const foundationModel = useSelector((state: any) => state.sidebar.foundationModel);
  const fmTemperature = useSelector((state: any) => state.sidebar.fmTemperature);
  const fmMaxTokens = useSelector((state: any) => state.sidebar.fmMaxTokens);
  const context  = useSelector((state: any) => state.sidebar.context);

  const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/gopher`;
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: apiUrl,
    body: {
      modelId: foundationModel,
      temperature: parseFloat(fmTemperature),
      max_tokens: parseInt(fmMaxTokens, 10),
      context: context
    }
  });
  const messagesEndRef = useRef(null);

  const suggestedQuestions = [
    "Is Gopher available in my area?",
    "How can I see my previous orders?",
    "What does 'Make Me An Offer' mean?",
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
  const [selectedTab, setSelectedTab] = useState("records");
  const [data, setData] = useState<any>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  const fetchData = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/gopher_data`
      );
      const data = await response.json();
      setData(data?.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  useEffect(() => {

    fetchData();
  }, []);

  const tabs = [
    // { key: "records", label: "Records" },
    // { key: "communicationHistory", label: "Communication History" },
    // { key: "followUpsAndReminders", label: "Follow Ups & Reminders" },
    // { key: "taskManagement", label: "Task Management" },
    // {
    //   key: "customerProfileAccessNotifications",
    //   label: "Profile Access Notifications",
    // },
    {}
  ];

  const renderContent = () => {
   return (<>
   
   <div className="overflow-x-auto">
            <table className="table-auto w-full border-collapse text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-6 py-3 text-left">Category</th>
                  <th className="border px-6 py-3 text-left">Question</th>
                  <th className="border px-6 py-3 text-left">Answer</th>
                  
                </tr>
              </thead>
              <tbody>
                {data?.length > 0 &&
                  data?.map((record: any,i:any) => (
                    <tr
                      key={i}
                      className="odd:bg-white even:bg-gray-50"
                    >
                      <td className="border px-6 py-3">{record.category}</td>
                      <td className="border px-6 py-3">{record.question}</td>
                      <td className="border px-6 py-3">
                        {record.answer}
                      </td>
                      
                    
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
   </>)
  };

  return (
    <>
      <Head>
        <title>GOPHER</title>
      </Head>
      <main className="h-screen flex flex-col container mx-auto px-4 py-4 relative overflow-hidden">
        <section className="w-full flex-grow overflow-y-auto">
          <h1 className="text-3xl font-bold mb-6">GOPHER</h1>
          <nav className="flex space-x-4 mb-6">
            {/* {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setSelectedTab(tab.key)}
                className={`px-4 py-2 rounded ${
                  selectedTab === tab.key
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {tab?.label}
              </button>
            ))} */}
          </nav>
          {renderContent()}
        </section>
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
    </>
  );
}
