"use client";
import DOMPurify from "dompurify";
import dynamic from "next/dynamic";
const ReactMarkdown = dynamic(() => import("react-markdown"), { ssr: false });
import React, { useEffect, useRef, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Bar } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import { MessageCircle, SendHorizonalIcon, StepBackIcon, X } from "lucide-react";
import { Button } from "@mui/material";
import axios from "axios";
// import MarkdownRenderer from './Utility/Markdown/MarkdownRenderer'
import { motion } from "framer-motion";
import Image from 'next/image';
import { discussion } from '../public/example-data/discussion'
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import {
  suggestedQuestions,
  companies,
  years,
  quarters,
} from "../public/data";


Chart.register(...registerables);

// const suggestedQuestions = {
//   "Financial Performance & Guidance": {
//     "Common Questions": [
//       "What were the most common financial questions analysts asked in SoFi Technologies Inc. 3rd quarter,2024 earnings call?",
//       "What concerns did analysts raise about revenue, EPS, net income, margins, and loan growth in JPMorgan Chase & Co 1st quarter,2024 earnings call?",

//       "How did competitors respond to concerns about loan demand and deposit pricing pressure in Morgan Stanley 3rd quarter,2024 earnings call?",
//       "Were there any discussions around inflation and economic outlook in Wells Fargo & Company 4rth quarter,2024 earnings call?",

//       "What strategies did competitors highlight for digital banking growth in SoFi Technologies Inc. 4rth quarter,2024 earnings call?",
//     ],
//   },


// };

const Dashboard = ({chats,setChats}:any) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<any>(1);
  const [selectedCompany, setSelectedCompany] = useState(companies[0].name);

  return (
    <div className="w-full h-screen overflow-auto p-4 bg-gray-100">
      {/* <h1 className="text-3xl font-bold mb-6 text-center">Dashboard</h1> */}
      <ChatPopup isOpen={isChatOpen} setIsOpen={setIsChatOpen} chats={chats} setChats={setChats}></ChatPopup>
      {
        selectedCard ? <CommonComponent selectedCard={selectedCard} setSelectedCard={setSelectedCard}></CommonComponent> : <div className="mb-8" >
          {/* <h2 className="text-2xl font-bold mb-4">Company Profile</h2> */}

          <div style={{ height: 100, width: 200 }}>
            <h2>Select a Company</h2>
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              style={{ padding: "8px", marginBottom: "20px" }}
            >
              <option value="">-- Choose a company --</option>
              {companies.map((company, index) => (
                <option key={index} value={company.name}>{company.name}</option>
              ))}
            </select>
          </div>
          <CardGrid setSelectedCard={setSelectedCard}></CardGrid>
        </div>
      }
    </div>
  );
};



function ChatPopup({ isOpen, setIsOpen, chats, setChats }: any) {
  const [inputText, setInput] = useState("");
  const [isLoading, setLoading] = useState(false);
  const scrollViewRef = useRef<any>(null)
  const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/bedrock-agent`;

  const [selectedCategory, setSelectedCategory] = useState<string>(
    Object.keys(suggestedQuestions)[0],
  );

  const categoryKey = "Financial Performance & Guidance"; // or any dynamic string
  const commonQuestions = suggestedQuestions[categoryKey as keyof typeof suggestedQuestions]["Common Questions"];


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
  const handleCategoryChange = (event: { target: { value: React.SetStateAction<string>; }; }) =>
    setSelectedCategory(event.target.value);
  const handleButtonClick = (question: any) => {
    const formattedQuestion = `${question} for in ${selectedCategory} category`;
    setInput(formattedQuestion);
    // handleInputChange({ target: { value: formattedQuestion } });
  };

  return (
    <div className="fixed bottom-6 right-6 flex flex-col items-end z-[100]">
      {isOpen && (
        <div style={{ boxShadow: "4px 4px 10px rgba(0, 0, 0, 0.5)" }} className="bg-white shadow-2xl rounded-2xl p-4 m-4 h-[500px] w-[800px] flex flex-col">
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

            <div className="mb-4">
              <h3 className="font-bold mb-2 text-gray-700">
                Suggested Questions:
              </h3>
              {/* <div className="flex flex-wrap mb-[50px]">
                {commonQuestions.map(
                  (question: string | number | bigint | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<React.AwaitedReactNode> | null | undefined, index: React.Key | null | undefined) => (
                    <button
                      key={index}
                      className="bg-blue-500 text-white text-sm px-3 py-1 rounded mr-2 mb-2 hover:bg-blue-600"
                      onClick={() => handleButtonClick(question)}
                    >
                      {question}
                    </button>
                  ),
                )}
              </div> */}
              <CommonQuestionsList commonQuestions={commonQuestions} handleButtonClick={handleButtonClick}></CommonQuestionsList>

            </div>
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto">
              {chats.map((msg: any, index: number) => (
                <section style={{ marginBottom: msg.id % 2 === 0 ? '60px' : '30px' }} key={index} className={`flex-1 overflow-y-auto p-[10px] rounded text-sm-200 ${msg.sender === "user" ? "bg-gray-200 text-black text-sm self-end" : "bg-gray-400 text-black self-start"}`}>
                  {/* <MarkdownRenderer content={msg.text} /> */}
                </section>

              ))}
            </div>
            {/* Loading Indicator */}
            {isLoading && (
              <div className="loading-container">
                <div className="spinner"></div>
                <p className="loading-text">Generating Response...</p>
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


const CommonQuestionsList = ({ commonQuestions, handleButtonClick }: { commonQuestions: (string | number)[], handleButtonClick: any }) => {
  // const [visibleQuestions, setVisibleQuestions] = useState<(string | number)[]>([]);
  // const [currentIndex, setCurrentIndex] = useState(0);

  // useEffect(() => {
  //   if (currentIndex < commonQuestions.length) {
  //     const timeout = setTimeout(() => {
  //       setVisibleQuestions((prev) => [...prev, commonQuestions[currentIndex]]);
  //       setCurrentIndex((prevIndex) => prevIndex + 1);
  //     }, 500); // Adjust delay time here (e.g., 500ms per question)

  //     return () => clearTimeout(timeout);
  //   }
  // }, [currentIndex, commonQuestions]);

  return (
    <div className="flex flex-wrap mb-[50px]">
      {commonQuestions.map((question, index) => (
        <button
          key={index}
          className="bg-blue-500 text-white text-sm px-3 py-1 rounded mr-2 mb-2 hover:bg-blue-600"
          onClick={() => handleButtonClick(question)}
        >
          {question}
        </button>
      ))}
    </div>
  );
};


const Card = ({ id, title, description, image, setSelectedCard }: any) => {

  return (

    <motion.div onClick={() => {
      console.log("card", id + 1)
      setSelectedCard(id + 1)
    }}
      className="bg-white p-4 rounded-2xl shadow-md border w-full cursor-pointer h-[300px]"
      whileHover={{ scale: 1.05 }}
    >


      <Image src={`/images/${image}`} alt={title} width={300} height={200} className="rounded-lg mb-2 object-cover" />

      <h3 className="rounded-lg text-md bg-blue-500 text-white text-center font-semibold mb-2">{title}</h3>

      <p className="text-gray-600 text-sm text-center">{description}</p>
    </motion.div>
  );
};

const CardGrid = ({ setSelectedCard }: any) => {
  const cards = [
    { title: "Discussion", description: "Discussion of financial results, including revenue, earnings, and expenses.", image: "discussion.jpg" },
    { title: "Insights", description: "Insights into factors influencing the company's performance", image: "insights_2.jpg" },
    { title: "Outlook and Guidance", description: "Outlook and guidance for future performance", image: "outlook.jpg" },
    { title: "Opportunity", description: "Opportunity for analysts and investors to ask questions", image: "investment.jpg" },
    { title: "Common Questions", description: "What are the most common questions asked during the Q&A portion of earnings calls", image: "questions.webp" },
    { title: "Sentiments", description: "Sentiments Analysis", image: "sentiments.jpg" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
      {cards.map((card, index) => (
        <Card id={index + 1} setSelectedCard={setSelectedCard} key={index} title={card.title} description={card.description} image={card.image} />
      ))}
    </div>
  );
};

const CommonComponent = ({ selectedCard, setSelectedCard }: any) => {
  const [content, setContent] = useState("");
  const discussion = `

  # SoFi Technologies Q4 and Full Year 2024 Financial Results
  
  ## Revenue
  
  - Q4 2024 adjusted net revenue: **$739 million** (↑24% YoY)
  - Full year 2024 adjusted net revenue: **$2.6 billion** (↑26% YoY)
  - Financial Services and Technology Platform segments: **$1.2 billion** (↑54% YoY)
  
  ## Earnings
  
  - Q4 2024 adjusted EBITDA: **$198 million** (27% margin)
  - Full year 2024 adjusted EBITDA: **>$665 million**
  - Q4 2024 adjusted net income: **$61 million** (excluding tax benefits)
  - Full year 2024 GAAP net income: **$499 million** ($227 million excluding tax benefits)
  - Q4 2024 adjusted EPS: **$0.05**
  - Full year 2024 EPS: **$0.39** ($0.15 excluding tax benefits)
  
  ## Expenses
  
  - Planning 30% incremental EBITDA margin in 2025 for reinvestment
  - Seasonal payroll taxes: ~**$10 million** additional operating expenses in Q1 and Q2
  
  ## Segment Performance (Q4)
  
  | Segment | Revenue | YoY Growth |
  |---------|---------|------------|
  | Financial Services | $257 million | ↑84% |
  | Technology Platform | $103 million | ↑6% |
  | Lending | $423 million | ↑22% |
  
  ## 2025 Guidance
  
  - Adjusted net revenue: **$3.20-$3.275 billion** (23-26% growth)
  - Adjusted EBITDA: **$845-$865 million**
  - Adjusted GAAP net income: **$285-$305 million**
  - Adjusted GAAP EPS: **$0.25-$0.27** per share
  
  *Note: The company emphasized strong growth across segments, improved profitability, and plans for continued investment to drive future growth.*`;



  useEffect(() => {
    const sanitizedMarkdown = DOMPurify.sanitize(discussion);

    setContent(sanitizedMarkdown)
  }, [selectedCard])

  return (
    <div className="flex flex-1">
      <div className="bg-white">
        <StepBackIcon className="fixed" size={40} color="blue" onClick={() => setSelectedCard(0)}></StepBackIcon>
      </div>
      <div className="prose overflow-auto ml-20 mb-10">
        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
          {content}
        </ReactMarkdown>
      </div>
    </div>
  )

}





export default Dashboard;
