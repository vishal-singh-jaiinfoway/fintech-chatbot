import React, { useState, useEffect, useRef } from "react";
import Head from "next/head";
import { useChat } from '@ai-sdk/react';
import { useSelector } from "react-redux";

import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Bar } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import { MessageCircle, SendHorizonalIcon, SendIcon, X } from "lucide-react";
import { Button } from "@mui/material";
import axios from "axios";
import { Urbanist } from "next/font/google";
import MarkdownRenderer from '../Utility/Markdown/MarkdownRenderer'
import { selectedTab } from "@/store/sidebarSlice";

const Chat = () => {
  const foundationModel = useSelector((state: any) => state.sidebar.foundationModel);
  const fmTemperature = useSelector((state: any) => state.sidebar.fmTemperature);
  const fmMaxTokens = useSelector((state: any) => state.sidebar.fmMaxTokens);
  const context  = useSelector((state: any) => state.sidebar.context);

  const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/crm`;
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
    "Can you provide details about Acme Corporation?",
    "What are the latest interactions with Globex Inc.?",
    "What follow-ups or reminders are set for Umbrella Corporation?",
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

export default function FetchUpload({fetchUploadChats,setFetchUploadChats}:any) {
  const [selectedTab, setSelectedTab] = useState("records");
  const [data, setData] = useState<any>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/call-llms`
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
    { key: "records", label: "Records" },
    { key: "communicationHistory", label: "Communication History" },
    { key: "followUpsAndReminders", label: "Follow Ups & Reminders" },
    { key: "taskManagement", label: "Task Management" },
    {
      key: "customerProfileAccessNotifications",
      label: "Profile Access Notifications",
    },
  ];

  const renderContent = () => {
    switch (selectedTab) {
      case "records":
        return (
          <div className="overflow-x-auto">
            <table className="table-auto w-full border-collapse text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-6 py-3 text-left">Name</th>
                  <th className="border px-6 py-3 text-left">Industry</th>
                  <th className="border px-6 py-3 text-left">Annual Revenue</th>
                  <th className="border px-6 py-3 text-left">Phone</th>
                  <th className="border px-6 py-3 text-left">Website</th>
                  <th className="border px-6 py-3 text-left">
                    Billing Address
                  </th>
                  <th className="border px-6 py-3 text-left">Contacts</th>
                  <th className="border px-6 py-3 text-left">Notes</th>
                </tr>
              </thead>
              <tbody>
                {data?.records.length > 0 &&
                  data?.records?.map((record: any) => (
                    <tr
                      key={record.Id}
                      className="odd:bg-white even:bg-gray-50"
                    >
                      <td className="border px-6 py-3">{record.Name}</td>
                      <td className="border px-6 py-3">{record.Industry}</td>
                      <td className="border px-6 py-3">
                        {record.AnnualRevenue}
                      </td>
                      <td className="border px-6 py-3">{record.Phone}</td>
                      <td className="border px-6 py-3">
                        <a
                          href={record.Website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline"
                        >
                          {record.Website}
                        </a>
                      </td>
                      <td className="border px-6 py-3">{`${record.BillingAddress.street}, ${record.BillingAddress.city}, ${record.BillingAddress.state} ${record.BillingAddress.postalCode}, ${record.BillingAddress.country}`}</td>
                      <td className="border px-6 py-3">
                        {record.Contacts.map((contact: any) => (
                          <div key={contact.Email} className="mb-2">
                            <p>
                              Name: {contact.FirstName} {contact.LastName}
                            </p>
                            <p>Email: {contact.Email}</p>
                            <p>Phone: {contact.Phone}</p>
                            <p>Title: {contact.Title}</p>
                          </div>
                        ))}
                      </td>
                      {/* <td className="border px-6 py-3">
                        {record.Notes.map((note: any) => (
                          <div key={note.CreatedDate} className="mb-2">
                            <p>Date: {note.CreatedDate}</p>
                            <p>Content: {note.Content}</p>
                          </div>
                        ))}
                      </td> */}
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        );

      case "communicationHistory":
        return (
          <div className="overflow-x-auto">
            <table className="table-auto w-full border-collapse text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-6 py-3 text-left">Customer ID</th>
                  <th className="border px-6 py-3 text-left">Interaction ID</th>
                  <th className="border px-6 py-3 text-left">Type</th>
                  <th className="border px-6 py-3 text-left">Date</th>
                  <th className="border px-6 py-3 text-left">Summary</th>
                  <th className="border px-6 py-3 text-left">Details</th>
                </tr>
              </thead>
              <tbody>
                {data?.communicationHistory.length > 0 &&
                  data?.communicationHistory?.map((entry: any) =>
                    entry.Interactions.map((interaction: any) => (
                      <tr
                        key={interaction.InteractionId}
                        className="odd:bg-white even:bg-gray-50"
                      >
                        <td className="border px-6 py-3">{entry.CustomerId}</td>
                        <td className="border px-6 py-3">
                          {interaction.InteractionId}
                        </td>
                        <td className="border px-6 py-3">{interaction.Type}</td>
                        <td className="border px-6 py-3">{interaction.Date}</td>
                        <td className="border px-6 py-3">
                          {interaction.Summary}
                        </td>
                        <td className="border px-6 py-3">
                          {interaction.Details}
                        </td>
                      </tr>
                    ))
                  )}
              </tbody>
            </table>
          </div>
        );

      case "followUpsAndReminders":
        return (
          <div className="overflow-x-auto">
            <table className="table-auto w-full border-collapse text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-6 py-3 text-left">Customer ID</th>
                  <th className="border px-6 py-3 text-left">Follow Up ID</th>
                  <th className="border px-6 py-3 text-left">Follow Up Date</th>
                  <th className="border px-6 py-3 text-left">Follow Up Task</th>
                  <th className="border px-6 py-3 text-left">
                    Follow Up Details
                  </th>
                  <th className="border px-6 py-3 text-left">Reminder ID</th>
                  <th className="border px-6 py-3 text-left">Reminder Date</th>
                  <th className="border px-6 py-3 text-left">Reminder Task</th>
                  <th className="border px-6 py-3 text-left">
                    Reminder Details
                  </th>
                </tr>
              </thead>
              <tbody>
                {data?.followUpsAndReminders.length > 0 &&
                  data?.followUpsAndReminders?.map((entry: any) => (
                    <tr
                      key={entry.CustomerId}
                      className="odd:bg-white even:bg-gray-50"
                    >
                      <td className="border px-6 py-3">{entry.CustomerId}</td>
                      {entry.FollowUps.map((followUp: any) => (
                        <React.Fragment key={followUp.FollowUpId}>
                          <td className="border px-6 py-3">
                            {followUp.FollowUpId}
                          </td>
                          <td className="border px-6 py-3">{followUp.Date}</td>
                          <td className="border px-6 py-3">{followUp.Task}</td>
                          <td className="border px-6 py-3">
                            {followUp.Details}
                          </td>
                        </React.Fragment>
                      ))}
                      {entry.Reminders.length > 0 &&
                        entry.Reminders.map((reminder: any) => (
                          <React.Fragment key={reminder.ReminderId}>
                            <td className="border px-6 py-3">
                              {reminder.ReminderId}
                            </td>
                            <td className="border px-6 py-3">
                              {reminder.Date}
                            </td>
                            <td className="border px-6 py-3">
                              {reminder.Task}
                            </td>
                            <td className="border px-6 py-3">
                              {reminder.Details}
                            </td>
                          </React.Fragment>
                        ))}
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        );

      case "taskManagement":
        return (
          <div className="overflow-x-auto">
            <table className="table-auto w-full border-collapse text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-6 py-3 text-left">Customer ID</th>
                  <th className="border px-6 py-3 text-left">Task ID</th>
                  <th className="border px-6 py-3 text-left">Date</th>
                  <th className="border px-6 py-3 text-left">Assigned To</th>
                  <th className="border px-6 py-3 text-left">Task</th>
                  <th className="border px-6 py-3 text-left">Details</th>
                </tr>
              </thead>
              <tbody>
                {data?.taskManagement?.map((entry: any) =>
                  entry.Tasks.map((task: any) => (
                    <tr
                      key={task.TaskId}
                      className="odd:bg-white even:bg-gray-50"
                    >
                      <td className="border px-6 py-3">{entry.CustomerId}</td>
                      <td className="border px-6 py-3">{task.TaskId}</td>
                      <td className="border px-6 py-3">{task.Date}</td>
                      <td className="border px-6 py-3">{task.AssignedTo}</td>
                      <td className="border px-6 py-3">{task.Task}</td>
                      <td className="border px-6 py-3">{task.Details}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        );

      case "customerProfileAccessNotifications":
        return (
          <div className="overflow-x-auto">
            <table className="table-auto w-full border-collapse text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-6 py-3 text-left">Customer ID</th>
                  <th className="border px-6 py-3 text-left">
                    Notification ID
                  </th>
                  <th className="border px-6 py-3 text-left">Date</th>
                  <th className="border px-6 py-3 text-left">Message</th>
                </tr>
              </thead>
              <tbody>
                {data?.customerProfileAccessNotifications?.map((entry: any) =>
                  entry.Notifications.map((notification: any) => (
                    <tr
                      key={notification.NotificationId}
                      className="odd:bg-white even:bg-gray-50"
                    >
                      <td className="border px-6 py-3">{entry.CustomerId}</td>
                      <td className="border px-6 py-3">
                        {notification.NotificationId}
                      </td>
                      <td className="border px-6 py-3">{notification.Date}</td>
                      <td className="border px-6 py-3">
                        {notification.Message}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Head>
        <title>Fetch & Upload</title>
      </Head>
      <main className="h-screen flex flex-col container mx-auto px-4 py-4 relative overflow-hidden">
        <section className="w-full flex-grow overflow-y-auto">
          <h1 className="text-3xl font-bold mb-6">Fetch & Upload</h1>
         
          {renderContent()}
        </section>
        <button
          className="fixed bottom-4 right-4 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700"
          style={{ zIndex: 1000 }}
          onClick={toggleChat}
        >
          Fetch
        </button>
        {isChatOpen && (
          <div className="fixed bottom-0 right-4 h-screen w-full max-w-md bg-white rounded shadow-lg overflow-hidden z-50">
           {<FetchUploadPopUp isOpen={isChatOpen} setIsOpen={setIsChatOpen} chats={fetchUploadChats} setChats={setFetchUploadChats}></FetchUploadPopUp>}
          </div>
        )}
      </main>
    </>
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
        const response = await axios.post(`http://localhost:3000/api/bedrock-upload-agent`, { inputText: inputText, selectedTab:"Fetch_Upload" });
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
          <div style={{ boxShadow: "4px 4px 10px rgba(0, 0, 0, 0.5)" }} className="bg-white shadow-2xl rounded-2xl p-4 w-80 h-[500px] w-[800px] flex flex-col">
            <div className="flex justify-center items-center border-b pb-2" >
              {/* <h3 className="text-lg font-semibold">Chat</h3> */}
              <Button onClick={() => {
                setIsOpen(false);
                setLoading(false)
                setInput("")
              }}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-2">{/* Chat messages will go here */}
  
              {isLoading && <div style={{ alignSelf: 'center', top: 250, left: 380 }} className="absolute z-[20] spinner"></div>}
  
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto">
                {chats.map((msg: any, index: number) => (
                  <section style={{ marginBottom: msg.id % 2 === 0 ? '60px' : '30px' }} key={index} className={`flex-1 overflow-y-auto p-[20px] rounded text-sm-200 ${msg.sender === "user" ? "bg-blue-500 text-white self-end" : "bg-gray-200 text-black self-start"}`}>
                    <MarkdownRenderer content={msg.text} />
                  </section>
  
                ))}
              </div>
  
  
  
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