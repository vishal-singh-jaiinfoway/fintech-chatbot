import React, { useState, useEffect, useRef } from "react";
import Head from "next/head";
import { useChat } from '@ai-sdk/react';
import { useSelector } from "react-redux";

const Chat = () => {
  const foundationModel = useSelector((state) => state.sidebar.foundationModel);
  const fmTemperature = useSelector((state) => state.sidebar.fmTemperature);
  const fmMaxTokens = useSelector((state) => state.sidebar.fmMaxTokens);
  const context  = useSelector((state) => state.sidebar.context);

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
    "Can you provide details about SoFi Technologies Inc.?",
    "What are the latest interactions with Morgan Stanley?",
    "What follow-ups or reminders are set for JPMorgan Chase & Co.?",
  ];

  const handleButtonClick = (question) => {
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
    } 

    const mockFormEvent = {
      preventDefault: () => {},
      stopPropagation: () => {},
      target: {
        value: question,
        acceptCharset: "",
        action: "",
        elements: [] ,
        encoding: "",
        enctype: "",
        length: 0,
        method: "",
        name: "",
        noValidate: false,
        reset: () => {},
        submit: () => {},
      },
      currentTarget: {} ,
      bubbles: true,
      cancelable: true,
      defaultPrevented: false,
      eventPhase: 3,
      isTrusted: true,
      timeStamp: Date.now(),
      type: "submit",
      nativeEvent: new Event("submit"),
    } ;

    handleInputChange(mockInputEvent);
    handleSubmit(mockFormEvent);
  };

  const scrollToBottom = () => {
    const element = messagesEndRef.current;
    if (element !== null) {
      (element ).scrollIntoView({ behavior: "smooth" });
    }
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex flex-col w-full h-full bg-white shadow-lg rounded-lg p-6">
      <div className="flex-grow overflow-y-auto">
        {messages.map((m) => (
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
  const [data, setData] = useState(null);
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
                  data?.records?.map((record) => (
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
                        {record.Contacts.map((contact) => (
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
                  data?.communicationHistory?.map((entry) =>
                    entry.Interactions.map((interaction) => (
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
                  data?.followUpsAndReminders?.map((entry) => (
                    <tr
                      key={entry.CustomerId}
                      className="odd:bg-white even:bg-gray-50"
                    >
                      <td className="border px-6 py-3">{entry.CustomerId}</td>
                      {entry.FollowUps.map((followUp) => (
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
                        entry.Reminders.map((reminder) => (
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
                {data?.taskManagement?.map((entry) =>
                  entry.Tasks.map((task) => (
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
                {data?.customerProfileAccessNotifications?.map((entry) =>
                  entry.Notifications.map((notification) => (
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
        <title>Earnings Calls Summary</title>
      </Head>
      <main className="h-screen flex flex-col container mx-auto px-4 py-4 relative overflow-hidden">
        <section className="w-full flex-grow overflow-y-auto">
          <h1 className="text-3xl font-bold mb-6">Earnings Calls Summary</h1>
          <nav className="flex space-x-4 mb-6">
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
