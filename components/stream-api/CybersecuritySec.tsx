
"use client"

// import { primaryColors } from "@/themes/_muiPalette";
// import UpArrowIcon from "@/ui/Icons/UpArrowIcon";
import SubmitButton from "./SubmitButton";
// import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { CybersecuritySecWrapper } from "@/components/stream-api/CybersecuritySecWrapper";
import { Tooltip } from "@mui/material";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { BoxProps } from "@mui/system";
import Image from "next/image";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import user from "./user.png";
import aiicon from './aiicon.png'
import banner_gif from './banner_gif.gif'

interface securityProps extends BoxProps {
  title: string;
  subTitle: string;
}


const CybersecuritySec: React.FC<securityProps & BoxProps> = ({
  title,
  subTitle,
  ...props
}) => {
  const videoRef = useRef<any>(null);
  const triggerSecref = useRef<any>(null);
  const containerRef: any = useRef(null);

  const [sessionId, setSessionId] = useState<string>("");
  const [video, setVideo] = useState<boolean>(true);
  const [isStream, setIsStream] = useState<boolean>(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [currentRes, setCurrentRes] = useState<any>();
  const [related, setRelated] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [backgroundIndex, setBackgroundIndex] = useState<any>(null);
  const [atBottom, setAtBottom] = useState(true);
  const [list, setList] = useState<string[]>([]);

  const [reader, setReader] = useState<any>();

  const handleUserInput = async (
    message: string,
    withSource: boolean,
    message_id: string
  ) => {

    if (withSource) {
      setMessages((prevMessages) => {
        const messageIndex = prevMessages.findIndex(
          (msg) => msg.id === message_id
        );

        if (messageIndex !== -1) {
          const updatedMessages = [...prevMessages];
          updatedMessages[messageIndex] = {
            ...updatedMessages[messageIndex],
            isUser: false,
            sourceLoading: false,
            withSource: true
          };
          return updatedMessages;
        }
        return prevMessages;
      });

      const res = {
        id: message_id,
        prompt: message,
        withSource: true
      };

      setCurrentRes(res);
    } else {
      setMessages((prevMessages) => {
        const messageIndex = prevMessages.findIndex(
          (msg) => msg.id === message_id
        );

        if (messageIndex !== -1) {
          const updatedMessages = [...prevMessages];
          updatedMessages[messageIndex] = {
            ...updatedMessages[messageIndex],
            sources: [],
            isUser: false,
            sourceLoading: false,
            withSource: false
          };
          return updatedMessages;
        }
        return prevMessages;
      });

      const res = {
        id: message_id,
        sources: [],
        prompt: JSON.stringify(message),
        withSource: false
      };

      setCurrentRes(res);
    }
  };

  const handleCategoryCheck = async (message: string) => {
    const message_id = uuidv4();

    setMessages((prevMessages) => [
      ...prevMessages,
      {
        id: message_id,
        prompt: message,
        message,
        isUser: true,
        completed: false,
        sourceLoading: true
      }
    ]);

    handleUserInput(message, true, message_id);
  };

  useEffect(() => {
    if (currentRes) {
      // eslint-disable-next-line no-use-before-define
      getStreamData();
    }
  }, [currentRes]);

  useEffect(() => {
    const onScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;

      setAtBottom(scrollTop + clientHeight >= scrollHeight - 20);
    };

    containerRef.current.addEventListener("scroll", onScroll);

    return () => containerRef?.current?.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (atBottom) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages, atBottom]);

  
  const handleVideoEnd = useCallback(() => {
    // setVideo(false);
  }, []);

  type ItextData = {
    text: string;
  };

  const [textList, setTextList] = useState<ItextData[]>([]);
  const [value, setValue] = useState<string>("");

  const handleKeyPress = (event: any) => {
    if (event.key === "Enter") {
      if (!event.shiftKey && !window.matchMedia("(max-width: 768px)").matches) {
        // If Enter key is pressed without Shift, submit the prompt
        event.preventDefault(); // Prevent default behavior of Enter key (form submission)
        setTextList([...textList, { text: JSON.stringify(value) }]);

        handleCategoryCheck(JSON.stringify(value));
        setValue("");
      }
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", handleKeyPress);
    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, [value]);

  const submitPromptHandler = (event: any) => {
    setValue(event.target.value);
  };

  const setPromptFromList = (prompt: string) => {
    if (prompt) {
      setTextList([{ text: prompt }]);
      handleCategoryCheck(prompt);
      setValue("");
    }
  };

  const handleUpArrowClick = () => {
    if (value) {
      setTextList([...textList, { text: value }]);
      handleCategoryCheck(value);
      setValue("");
    }
  };

  const handlePausedStream = () => {
    setIsStream(false);

    if (reader) {
      reader.cancel();
    }
  };

  const getStreamData = async () => {
    setIsLoading(true);
    setIsStream(true);
    setList([]);

    let session_id = sessionId;
    if (!session_id) {
      session_id = uuidv4();
      setSessionId(session_id);
    }

    const controller = new AbortController();
    const { signal } = controller;

    try {
      const response: any = await fetch(
        "https://sq7ingiwvqrreoyncqglewsaqi0xwkat.lambda-url.us-east-1.on.aws/api/stream",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            message: currentRes?.prompt,
            session_id,
            withSource: currentRes?.withSource
          }),
          signal
        }
      );

      const reader = response.body.getReader();
      setReader(reader);
      const decoder = new TextDecoder();

      while (true) {
        // eslint-disable-next-line no-await-in-loop
        const { done, value } = await reader.read();
        if (done) {
          setIsStream(false);
          break;
        }

        const text = decoder.decode(value);

        setMessages((prevMessages) => {
          const messageIndex = prevMessages.findIndex(
            (msg) => msg.id === currentRes?.id
          );

          if (messageIndex !== -1) {
            const updatedMessages = [...prevMessages];

            const stream = updatedMessages[messageIndex]?.stream
              ? `${updatedMessages[messageIndex].stream}${text}`
              : text;

            if (stream) {
              const anticipatedQuestions = stream
                ?.match(
                  /<AnticipatedQuestions>\[(.*?)\]<\/AnticipatedQuestions>/
                )?.[1]
                ?.split(",");
              if (anticipatedQuestions) {
                setList(anticipatedQuestions);
              }
            }

            setIsLoading(false);
            updatedMessages[messageIndex] = {
              ...updatedMessages[messageIndex],
              stream
            };
            return updatedMessages;
          }
          return prevMessages;
        });
      }
    } catch (error) {
      console.log("error", error);
      setIsStream(false);
      setMessages((prevMessages) => {
        const messageIndex = prevMessages.findIndex(
          (msg) => msg.id === currentRes?.id
        );

        if (messageIndex !== -1) {
          const updatedMessages = [...prevMessages];
          updatedMessages[messageIndex] = {
            ...updatedMessages[messageIndex],
            stream: "I am not able to give me the answers, can you ask again?"
          };
          return updatedMessages;
        }
        return prevMessages;
      });
    }
  };

  const getRelatedData = async () => {
    try {
      const response: any = await fetch(
        "https://sq7ingiwvqrreoyncqglewsaqi0xwkat.lambda-url.us-east-1.on.aws/api/related",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          }
        }
      );

      const data = await response.json();
      setRelated(data?.related);
    } catch (error) {
      console.log("error", error);
    }
  };

  function insertBrTags(text: string) {
    const lines = text.split("\n");
    const formattedLines = [];

    let lastLinkIndex = -1;

    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.includes("https://")) {
        const linkStartIndex = line.indexOf("https://");
        const linkEndIndex = line.indexOf(" ", linkStartIndex);
        const link = line.slice(
          linkStartIndex,
          linkEndIndex !== -1 ? linkEndIndex : undefined
        );
        const textBeforeLink = line.slice(0, linkStartIndex);

        if (linkStartIndex > lastLinkIndex) {
          const textBeforeLinkReplaced = textBeforeLink.replace(
            "More Information:",
            `<strong style="font-weight: bold; color: blue;">More Information:</strong>`
          );
          const formattedLine = (
            <React.Fragment key={i}>
              <div
                dangerouslySetInnerHTML={{ __html: textBeforeLinkReplaced }}
              />
              <a href={link} target="_blank" rel="noopener noreferrer">
                {link}
              </a>
              <br />
            </React.Fragment>
          );
          formattedLines.push(formattedLine);

          lastLinkIndex = linkStartIndex + link.length;
        }
      } else {
        const formattedLine = (
          <React.Fragment key={i}>
            {line}
            <br />
          </React.Fragment>
        );
        formattedLines.push(formattedLine);
      }
    }

    return formattedLines;
  }

  function processText(text: string) {
    const anticipatedQuestionsMatch = text?.match(
      /<AnticipatedQuestions>[\s\S]*?<\/AnticipatedQuestions>/
    );
    if (anticipatedQuestionsMatch) {
      text = text.replace(anticipatedQuestionsMatch[0], "");
    }
    return text;
  }

  useEffect(() => {
    getRelatedData();
  }, []);

  useEffect(() => {
    if (isLoading) {
      videoRef?.current?.play();
      setVideo(true);
    } else {
      setVideo(true);
      videoRef?.current?.pause();
    }
  }, [isLoading]);

  const relatedQuery = related;

  function removeSingleQuotes(str: string) {
    return str.replace(/'/g, "");
  }

  return (
    <CybersecuritySecWrapper isVideo={false}>
      <Container fixed>
        <Box className="breach_title">
          <Typography variant="h3">{title}</Typography>
          {/* <Typography>{subTitle}</Typography> */}
        </Box>
      </Container>
      <Box className="cybr_btm" ref={triggerSecref}>
        <video
          ref={videoRef}
          width="100%"
          height="100%"
          controls={false}
          autoPlay={isLoading}
          loop={isLoading}
          muted
          playsInline
          onEnded={handleVideoEnd}
        >
          {/* <source src={assest?.tileVideo} type="video/mp4" />
          <source src={assest?.tileVideo} type="video/ogg" /> */}
        </video>
        <Box className="chat_upr">
          <Container fixed>
            <Box className="chat_sec">
              <Box className="chat_texts" ref={containerRef}>
                {messages?.length === 0 && (
                  <div>
                    {relatedQuery.map(
                      (
                        { query, heading }: { query: string; heading: string },
                        index
                      ) => (
                        <div
                          key={index}
                          style={{
                            border: "1px solid #ddd",
                            borderRadius: "5px",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "10px",
                            position: "relative"
                          }}
                          onMouseEnter={() => setBackgroundIndex(index)}
                          onMouseLeave={() => setBackgroundIndex(null)}
                        >
                          <Typography
                            style={{
                              cursor: "pointer",
                              width: "100%",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              padding: "10px",
                              fontSize: "15px",
                              backgroundColor:
                                backgroundIndex === index
                                  ? "#f0f0f0"
                                  : "transparent"
                            }}
                            onClick={() => setPromptFromList(query)}
                          >
                            <strong>{heading}</strong>
                            <br />
                            {query}
                            {backgroundIndex === index && (
                              <Tooltip title="Click to send">
                                <div
                                  style={{
                                    position: "absolute",
                                    right: "5px", // Adjust as needed
                                    top: "50%",
                                    transform: "translateY(-50%)"
                                  }}
                                >
                                  {/* <UpArrowIcon
                                    IconColor={primaryColors?.primary}
                                    IconWidth="16"
                                    IconHeight="16"
                                  /> */}
                                  i
                                </div>
                              </Tooltip>
                            )}
                          </Typography>
                        </div>
                      )
                    )}
                  </div>
                )}

                {messages?.map((data, index, arr) => (
                  <Box
                    className="cha_message"
                    key={index}
                    style={
                      {
                        // display: "flex",
                        // flexDirection: "row",
                        // alignItems: "center"
                      }
                    }
                  >
                    {/* User Message */}
                    <div style={{ textAlign: "left" }}>
                      <Typography
                        key={index}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-start"
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <Image src={user} alt="User" width={24} height={24} />
                          {/*  */}
                          {/* <AccountCircleIcon width={24} height={24} /> */}
                          <b style={{ marginLeft: "5px" }}>You</b>
                        </div>
                        <strong style={{ marginLeft: "25px" }}>
                          {data?.prompt}
                        </strong>
                      </Typography>

                      <Typography
                        variant="body2"
                        style={{
                          fontSize: "smaller"
                          // display: "flex",
                          // alignItems: "center"
                        }}
                      >
                        <p>
                          <Image src={aiicon} alt="Logo" width={24} height={24} />
                          <b>GenAI</b>
                        </p>

                        {!data?.stream && (
                          <>
                            <Image
                              src={banner_gif}
                              alt="Logo"
                              width={16} // required
                              height={16} // required
                            />
                          </>
                        )}
                        {data?.stream && (
                          <p style={{ marginLeft: "10px" }}>
                            {insertBrTags(processText(data?.stream))}
                            {isStream && index == arr.length - 1 && (
                              <Image
                                src={banner_gif}
                                alt="Logo"
                                width={16} // required
                                height={16} // required
                              />
                            )}
                          </p>
                        )}
                      </Typography>
                    </div>
                  </Box>
                ))}

                {list?.length > 0 && (
                  <div>
                    {list.map((query, index) => (
                      <div
                        key={index}
                        style={{
                          border: "1px solid #ddd",
                          borderRadius: "5px",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "10px",
                          position: "relative"
                        }}
                        onMouseEnter={() => setBackgroundIndex(index)}
                        onMouseLeave={() => setBackgroundIndex(null)}
                      >
                        <Typography
                          style={{
                            cursor: "pointer",
                            width: "100%",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            padding: "10px",
                            fontSize: "15px",
                            backgroundColor:
                              backgroundIndex === index
                                ? "#f0f0f0"
                                : "transparent"
                          }}
                          onClick={() =>
                            setPromptFromList(removeSingleQuotes(query))
                          }
                        >
                          <b>{removeSingleQuotes(query)}</b>
                          {backgroundIndex === index && (
                            <Tooltip title="Click to send">
                              <div
                                style={{
                                  position: "absolute",
                                  right: "5px", // Adjust as needed
                                  top: "50%",
                                  transform: "translateY(-50%)"
                                }}
                              >
                                {/* <UpArrowIcon
                                  IconColor={primaryColors?.primary}
                                  IconWidth="16"
                                  IconHeight="16"
                                /> */}
                                i
                              </div>
                            </Tooltip>
                          )}
                        </Typography>
                      </div>
                    ))}
                  </div>
                )}
              </Box>

              <SubmitButton
                placeholder="Type your questions here…"
                disabled={isStream}
                value={value}
                onChange={(event: any) => submitPromptHandler(event)}
                activeButton={!!value}
                handleUpArrowClick={handleUpArrowClick}
                handlePausedStream={handlePausedStream}
                isStream={isStream}
                multiline
              />
            </Box>
          </Container>
        </Box>
      </Box>
    </CybersecuritySecWrapper>
  );
};

export default CybersecuritySec;