import React, { useEffect, useRef, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Bar } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import { MessageCircle, SendHorizonalIcon, SendIcon, X } from "lucide-react";
import { Button } from "@mui/material";
import axios from "axios";
import { useChat } from "ai/react";
import { Urbanist } from "next/font/google";
import MarkdownRenderer from './Utility/Markdown/MarkdownRenderer'
import { selectedTab } from "@/store/sidebarSlice";
import { useSelector } from "react-redux";

const urbanist = Urbanist({
  subsets: ["latin"],
  display: "swap",
  weight: ["500", "600", "700"],
});
Chart.register(...registerables);

const Dashboard = ({chats,setChats}:any) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [fetchUploadChats, setFetchUploadChats] = useState([]);
  const [crmData, setCrmData] = useState<any>(null);
  const [financialData, setFinancialData] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any>(
    [
    {
      "id": 1,
      "title": "Revenue and Growth Forecasts",
      "description": "Insights into expected revenue, sales growth, and key performance indicators (KPIs) for upcoming quarters or the fiscal year. Includes market demand, new product launches, and expansion plans.",
      "priority": "High"
    },
    {
      "id": 2,
      "title": "Margins and Profitability Outlook",
      "description": "Discussion on cost structures, expected operating margins, and profitability trends. Covers factors such as raw material costs, labor expenses, and efficiency improvements.",
      "priority": "High"
    },
    {
      "id": 3,
      "title": "Macroeconomic and Industry Trends",
      "description": "Analysis of external factors like interest rates, inflation, supply chain issues, and regulatory changes affecting business performance. Also includes competitive positioning within the industry.",
      "priority": "Medium"
    }
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const crmResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/call-llms`);
        const crmResult = await crmResponse.json();
        setCrmData(crmResult.data);

        const financialResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/fanancial-data`);
        const financialResult = await financialResponse.json();
        setFinancialData(financialResult.data);
      } catch (error) {
        console.error("Error fetching data", error);
      }
    };

    fetchData();

    //return () => setChats([])
  }, []);

  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(recommendations);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setRecommendations(items);
  };

  if (!crmData || !financialData) {
    return <div>Loading...</div>;
  }

  const revenueData = {
    labels: crmData?.records?.map((record: any) => record.Name),
    datasets: [
      {
        label: 'Annual Revenue',
        data: crmData?.records?.map((record: any) => record.AnnualRevenue),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
      },
    ],
  };

  const transactionsData = {
    labels: financialData?.credit_card_transactions?.map((tx: any) => new Date(tx.Date).toLocaleDateString()),
    datasets: [
      {
        label: 'Transactions',
        data: financialData.credit_card_transactions.map((tx: any) => tx.Amount),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
    ],
  };


  return (
    <div className="w-full h-screen overflow-auto p-4 bg-gray-100">
      <h1 className="text-3xl font-bold mb-6 text-center">Dashboard</h1>
     <ChatPopup isOpen={isChatOpen} setIsOpen={setIsChatOpen} chats={chats} setChats={setChats}></ChatPopup>

      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Company Profiles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {crmData.records.map((record: any) => (
            <div key={record.Id} className="bg-white shadow-md rounded-lg p-4 overflow-hidden">
              <h3 className="text-xl font-semibold mb-2">{record.Name}</h3>
              <p className="text-gray-600">Industry: {record.Industry}</p>
              <p className="text-gray-600">Annual Revenue: ${record.AnnualRevenue.toLocaleString()}</p>
              <p className="text-gray-600">Phone: {record.Phone}</p>
              <p className="text-gray-600">Website: {record.Website}</p>
              <p className="text-gray-600">
                Address: {record.BillingAddress.street}, {record.BillingAddress.city}, {record.BillingAddress.state} {record.BillingAddress.postalCode}, {record.BillingAddress.country}
              </p>
              {/* <p className="text-gray-600">Last Activity Date: {record.LastActivityDate}</p> */}
              <h4 className="font-semibold mt-4">Contacts</h4>
              {record.Contacts.map((contact: any) => (
                <div key={contact.Email} className="ml-4">
                  <p className="text-gray-600">{contact.FirstName} {contact.LastName} - {contact.Title}</p>
                  <p className="text-gray-600">Email: {contact.Email}</p>
                  <p className="text-gray-600">Phone: {contact.Phone}</p>
                </div>
              ))}
              {/* <h4 className="font-semibold mt-4">Notes</h4> */}
              {/* {record.Notes.map((note: any, index: number) => (
                <div key={index} className="ml-4">
                  <p className="text-gray-600">{note.CreatedDate}: {note.Content}</p>
                </div>
              ))} */}
            </div>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Financial Data Summary</h2>
        <div className="flex flex-wrap justify-between">
          <div className="w-full lg:w-1/2 p-2">
            <div className="h-96 bg-white shadow-md rounded-lg p-4">
              <Bar data={revenueData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </div>
          <div className="w-full lg:w-1/2 p-2">
            <div className="h-96 bg-white shadow-md rounded-lg p-4">
              <Bar data={transactionsData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4 text-center">Guidance & Outlook</h2>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="recommendations">
            {(provided) => (
              <div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {recommendations.map((recommendation: any, index: number) => (
                  <Draggable key={recommendation.id} draggableId={recommendation.id} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="bg-white shadow-md rounded-lg overflow-hidden"
                      >
                        <div className={`p-4 ${recommendation.priority === "High" ? "bg-red-100" : recommendation.priority === "Medium" ? "bg-yellow-100" : "bg-green-100"}`}>
                          <h3 className="text-xl font-semibold mb-2">{recommendation.title}</h3>
                          <p className="text-gray-600">{recommendation.description}</p>
                        </div>
                        <div className="p-4 bg-gray-50">
                          <p className={`text-${recommendation.priority === "High" ? "red" : recommendation.priority === "Medium" ? "yellow" : "green"}-600 font-semibold`}>
                            Priority: {recommendation.priority}
                          </p>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </div>
  );
};



function ChatPopup({ isOpen, setIsOpen, chats, setChats }: any) {
  const [inputText, setInput] = useState("");
  const [isLoading, setLoading] = useState(false);
  const scrollViewRef = useRef<any>(null)
  const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/bedrock-agent`;

  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: apiUrl,

  });
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
      const response = await axios.post(`http://localhost:3000/api/bedrock-agent`, { inputText: inputText });
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

function FetchUploadPopUp({ isOpen, setIsOpen, chats, setChats }: any) {
  const [inputText, setInput] = useState("");
  const [isLoading, setLoading] = useState(false);
  const scrollViewRef = useRef<any>(null)
  const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/bedrock-agent`;



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
      const response = await axios.post(`http://localhost:3000/api/bedrock-agent`, { inputText: inputText, selectedTab });
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
export default Dashboard;
