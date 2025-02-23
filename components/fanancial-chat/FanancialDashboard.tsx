import React, { useState, useEffect, useRef } from "react";
import Head from "next/head";
import { useChat } from '@ai-sdk/react';
import { useSelector } from "react-redux";
import { MessageCircle, SendHorizonalIcon, X } from "lucide-react";
import Button from "@mui/material/Button";
import axios from "axios";
import MarkdownRenderer from "../Utility/Markdown/MarkdownRenderer";



const Chat = () => {
  const foundationModel = useSelector((state: any) => state.sidebar.foundationModel);
  const fmTemperature = useSelector((state: any) => state.sidebar.fmTemperature);
  const fmMaxTokens = useSelector((state: any) => state.sidebar.fmMaxTokens);
  const context  = useSelector((state: any) => state.sidebar.context);


  const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/fanancial`;
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: apiUrl,
    body: {
      modelId: foundationModel,
      temperature: parseFloat(fmTemperature),
      max_tokens: parseInt(fmMaxTokens, 10),
      context: context
    }
  });

  console.log("messages",messages)
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
  const [isFetchUploadChatOpen, setIsFetchUploadChatOpen] = useState(false);
  const [fetchUploadChats, setFetchUploadChats] = useState([]);

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  const toggleFetchUpload = () => {
    setIsFetchUploadChatOpen(!isFetchUploadChatOpen);
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
          className="fixed bottom-4 right-[150px] bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700"
          style={{ zIndex: 1000 }}
          onClick={toggleFetchUpload}
        >
          Fetch & Upload
        </button>
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
        {isFetchUploadChatOpen && (
          <div className="fixed bottom-0 right-4 h-screen w-full max-w-md bg-white rounded shadow-lg overflow-hidden z-50">
            {<FetchUploadPopUp isOpen={isFetchUploadChatOpen} setIsOpen={setIsFetchUploadChatOpen} chats={fetchUploadChats} setChats={setFetchUploadChats}></FetchUploadPopUp>}
          </div>
        )}
      </main>
    </div>
  );
}

function FetchUploadPopUp({ isOpen, setIsOpen, chats, setChats }: any) {
  const [inputText, setInput] = useState("");
  const [isLoading, setLoading] = useState(false);
  const scrollViewRef = useRef<any>(null)
  const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/bedrock-upload-agent`;



  const selectedTab = useSelector((state: any) => state.sidebar.selectedTab);

  useEffect(() => {
    console.log("selectedTab", selectedTab)
  }, [selectedTab])

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollIntoView({ behavior: 'smooth' });

    }
  }, [scrollViewRef.current])

  const getAgentResponse = async () => {

    try {
      setLoading(true);
      setInput("");
      setChats([...chats, {
        id: chats.length + 1,
        text: inputText,
        sender: "user"
      }]);
      setTimeout(() => {
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollIntoView({ behavior: 'smooth' });

        }
      }, 50);
      const response = await axios.post(`http://localhost:3000/api/bedrock-upload-agent`, { inputText: inputText, selectedTab: "Fetch_Upload" });
      console.log("response", response.data);

      setChats([...chats, {
        id: chats.length + 1,
        text: inputText,
        sender: "user"
      }, {
        id: chats.length + 2,
        text: response.data,
        sender: "bot"
      }]);

      setInput("");
      setLoading(false)
      setTimeout(() => {
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollIntoView({ behavior: 'smooth' });

        }
      }, 100);
    } catch (error) {
      setChats((prev: any[]) => {
        prev.pop();
        return prev
      });

    }
  }
  const handleKeyDown = (e: { key: string; preventDefault: () => void; }) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Prevent default form submission (if inside a form)
      getAgentResponse()
    }
  };

  return (
    <div className="fixed bottom-6 right-6 flex flex-col items-end">
      {isOpen && (
        <div style={{ boxShadow: "4px 4px 10px rgba(0, 0, 0, 0.5)" }} className="bg-white shadow-2xl rounded-2xl p-4 m-4 mb-8 h-[500px] w-[800px] flex flex-col">
          <div className="flex justify-center items-center border-b pb-2" >
            {/* <h3 className="text-lg font-semibold">Fetch & Upload Earnings Calls Transcripts</h3> */}
            <Button onClick={() => {
              setIsOpen(false);
              setLoading(false)
              setInput("")
            }}>
              <X className="w-5 h-5" />
            </Button>
          </div>
          <div className="p-4 bg-white rounded-lg shadow-md">
            <p className="text-lg font-medium text-gray-700">
              Upload earnings call transcripts to get insights
            </p>
            <section className="mt-3 p-4 text-gray-600 border border-gray-300 rounded-lg bg-gray-50">
              <p className="text-sm">
                <span className="font-semibold">Prompt type 1:</span>
                Ticker=<span className="text-blue-600">SOFI</span>, Year=<span className="text-blue-600">2024</span>, Quarters=<span className="text-blue-600">4</span>
              </p>
              <p className="text-sm mt-2">
                <span className="font-semibold">Prompt type 2:</span>
                Ticker=<span className="text-blue-600">[SOFI, JPM, MS]</span>, Year=<span className="text-blue-600">2024</span>, Quarters=<span className="text-blue-600">4</span>
              </p>
            </section>
          </div>

          <div className="flex-1 overflow-y-auto p-2">{/* Chat messages will go here */}


            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto">
              {chats.map((msg: any, index: number) => (
                <section style={{ marginBottom: msg.id % 2 === 0 ? '60px' : '30px' }} key={index} className={`flex-1 overflow-y-auto p-[20px] rounded text-sm-200 ${msg.sender === "user" ? "bg-blue-500 text-white self-end" : "bg-gray-200 text-black self-start"}`}>
                  <MarkdownRenderer content={msg.text} />
                </section>

              ))}
            </div>

            {/* Loading Indicator */}
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
            <SendHorizonalIcon onClick={getAgentResponse} className="w-5 h-5 ml-2" color="blue" />
          </div>
        </div>
      )}

      <Button style={{ backgroundColor: 'rgb(59 130 246)' }}
        className="rounded-full p-3 shadow-lg hover:bg-blue-600 text-white"
        onClick={() => setIsOpen(!isOpen)}
      >
        <MessageCircle className="w-6 h-6" style={{ color: 'white' }} />
      </Button>


    </div>
  );
}