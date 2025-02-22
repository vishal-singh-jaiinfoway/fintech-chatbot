// require("dotenv").config();
// import {
//     BedrockRuntimeClient,
//     InvokeModelWithResponseStreamCommand,
//     InvokeModelCommand
// } from '@aws-sdk/client-bedrock-runtime';
// const { S3 } = require("aws-sdk");
// import { AWSBedrockAnthropicStream, StreamingTextResponse } from 'ai';
// import { experimental_buildAnthropicPrompt } from 'ai/prompts';
// import { BedrockAgentRuntimeClient, RetrieveCommand } from "@aws-sdk/client-bedrock-agent-runtime";

// const bedrockAgentClient = new BedrockAgentRuntimeClient({
//     region: process.env.AWS_REGION,
//     accessKeyId: process.env.AWS_ACCESS_KEY,
//     secretAccessKey: process.env.AWS_SECRET_KEY,
// });

// const bedrockClient = new BedrockRuntimeClient({
//     region: process.env.AWS_REGION,
//     accessKeyId: process.env.AWS_ACCESS_KEY,
//     secretAccessKey: process.env.AWS_SECRET_KEY,
// });

// // Configure AWS S3
// const s3 = new S3({
//     region: process.env.AWS_REGION,
//     accessKeyId: process.env.AWS_ACCESS_KEY,
//     secretAccessKey: process.env.AWS_SECRET_KEY,
// });
// //experimental_buildAnthropicPrompt
// export async function POST(req) {
//     let { messages, modelId = "anthropic.claude-v2:1", temperature = 0.7, maxTokens = 300, inputText } = await req.json();
//     console.log("inputText:", inputText);
//     const result = await main(inputText);
//     return result;
// }

// const parseS3Uri = (s3Uri) => {
//     if (!s3Uri.startsWith("s3://")) throw new Error("Invalid S3 URI format");
//     const uriParts = s3Uri.replace("s3://", "").split("/");
//     return { bucket: uriParts.shift(), key: uriParts.join("/") };
// };

// const fetchEarningsCallsTranscript = async (fileUrls) => {
//     try {
//         if (!Array.isArray(fileUrls)) throw new Error("Expected fileUrls to be an array");
//         const results = await Promise.all(fileUrls.map(async (fileUrl) => {
//             const { bucket, key } = parseS3Uri(fileUrl);
//             try {
//                 const params = { Bucket: bucket, Key: key };
//                 const data = await s3.getObject(params).promise();
//                 return data.Body.toString("utf-8");
//             } catch (error) {
//                 console.error(`Error fetching data from S3: ${error.message}`);
//                 return null;
//             }
//         }));
//         return results.filter(Boolean);
//     } catch (error) {
//         console.error("Error fetching transcripts:", error.message);
//         throw error;
//     }
// };

// const getAnswer = async (transcripts, query) => {
//     try {
//         const requestBody = {
//             prompt: experimental_buildAnthropicPrompt([
//                 { role: "user", content: `Based on these transcripts, ${transcripts}, answer this question: ${query}.Provide the response in proper markdown.` }
//             ]),
//             // prompt: `\n\nHuman: Based on these transcripts, ${transcripts}, answer this question: ${query}\n\nAssistant:`,
//             max_tokens_to_sample: 2000,
//             temperature: 0,
//             top_p: 0.9
//         };
       

//         const bedrockResponse = await bedrockClient.send(
//             new InvokeModelWithResponseStreamCommand({
//                 modelId: "anthropic.claude-v2",
//                 contentType: "application/json",
//                 accept: "application/json",
//                 body: JSON.stringify(requestBody)
//             }),
//         );

//         // Convert the response into a friendly text-stream
//         const stream = AWSBedrockAnthropicStream(bedrockResponse);
//         const result=new StreamingTextResponse(stream);
//         // Respond with the stream
//         return result;
//     } catch (error) {
//         console.error("Error in KB retrieval:", error);
//         throw error;
//     }
// };



// const extractJSON = (text) => {
//     const match = text.match(/\{[\s\S]*\}/);
//     return match ? match[0] : null;
// };

// const kb = async (user_query, retrieval_results) => {
//     try {
//         const prompt = `You are an AI assistant that selects relevant results from search results.
//         Your only task is to extract and return relevant URIs based on the user query and retrieved results.
//         Do not answer the user query.
        
//         ### User Query:
//         ${user_query}
        
//         ### Retrieved Results:
//         ${JSON.stringify(retrieval_results)}
        
//         ### Important Instructions:
//         - Only return a JSON object in the exact format below.
//         - Do NOT provide any explanation or extra text.
//         - If no results are relevant, return: {"uri": []}
        
//         ### Response Format:
//         {"uri": ["uri_1", "uri_2"]}
//         Now, generate the response strictly in this format:`;
        
//         const requestBody = { prompt: `\n\nHuman: ${prompt}\n\nAssistant:`, max_tokens_to_sample: 500, temperature: 0, top_p: 0.9 };
//         const command = new InvokeModelCommand({
//             modelId: "anthropic.claude-v2",
//             contentType: "application/json",
//             accept: "application/json",
//             body: JSON.stringify(requestBody)
//         });
//         const response = await bedrockClient.send(command);
//         const responseBody = new TextDecoder().decode(response.body);

//         const jsonString = extractJSON(JSON.parse(responseBody).completion);
//         return jsonString ? JSON.parse(jsonString).uri : [];
//     } catch (error) {
//         console.error("Error in KB retrieval:", error);
//         throw error;
//     }
// };

// async function queryKnowledgeBase(queryText) {
//     try {
//         const command = new RetrieveCommand({
//             knowledgeBaseId: "06BQQX922Q",  // Replace with actual KB ID
//             retrievalConfiguration: { vectorSearchConfiguration: { numberOfResults: 5 } },
//             retrievalQuery: { text: queryText }
//         });
//         return (await bedrockAgentClient.send(command)).retrievalResults;
//     } catch (error) {
//         console.error("Error querying Knowledge Base:", error);
//         throw error;
//     }
// }

// const main = async (queryText) => {
//     const retrievalResults = await queryKnowledgeBase(queryText);
//     const uriArray = await kb(queryText, retrievalResults);
//     console.log("uriArray:", uriArray);
//     const transcripts = await fetchEarningsCallsTranscript(uriArray);
//     const answer = await getAnswer(transcripts, queryText);
//     return answer;
// };



  import { selectedTab } from "@/store/sidebarSlice";
import { InvokeAgentCommand,BedrockAgentRuntimeClient } from "@aws-sdk/client-bedrock-agent-runtime";
import { StreamingTextResponse, streamToResponse } from "ai";
  const text = "Amazon Bedrock helps developers build AI applications.";
  import { NextResponse } from "next/server";

  function estimateClaudeTokens(text) {
    const words = text.split(/\s+/).length;
    return Math.round(words * 1.3); // Approximation for Claude models
  }
  
//   console.log("Estimated Token Count:", estimateClaudeTokens(text));
  
 
  const bedrockAgentClient = new BedrockAgentRuntimeClient({
    region: process.env.AWS_REGION ?? "us-east-1",
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
    },
  });
  
  export async function POST(req) {
    // // Extract the `prompt` from the body of the request
     let body = await req.json();
     let { messages=[], inputText } = body;
     console.log("inputText",inputText)
     console.log("messages",messages)
    // if (!modelId) {
    //   modelId = "anthropic.claude-v2:1";
    // }
  
    // if (temperature == null) {
    //   temperature = 0.7;
    // }
  
    // if (maxTokens == null) {
    //   maxTokens = 300;
    // }
  
 
  
  
   
    const result = await invokeAgent(inputText,selectedTab);
  
   
  
       return new Response(result, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-cache",
        }
      });
        }
  
  const invokeAgent = async (prompt,selectedTab) => {
    console.log("selectedTab",selectedTab)
  
    const agentId = "DMDSLKJ1BD"; // Replace with your Agent IDJQT1NOKYF7
    const aliasId = "IY0S6QV0QT"; // Replace with your Alias ID
    const sessionId = "session-004";
    try {
      const command = new InvokeAgentCommand({
        agentId,
        agentAliasId: aliasId,
        sessionId,
        inputText:`${prompt}.Provide response with proper markdown`,
      });
  
      const response = await bedrockAgentClient.send(command);
      console.log("response",response)
       const eventStream = response.completion;
    //    let finalAnswer = "";
   
    //    for await (const event of eventStream) {
  
    //      if (event.chunk?.bytes) {
    //        const chunkData = new TextDecoder("utf-8").decode(event.chunk.bytes);
    //        finalAnswer += chunkData; // Append all chunks properly
    //      } 
    //     //  else if (event.trace) {
    //     //    console.log("Trace Data:", JSON.stringify(event.trace, null, 2));
    //     //  } else {
    //     //    console.warn("Unexpected event:", JSON.stringify(event));
    //     //  }
    //    }
  
      
    //     return finalAnswer;


        // Create a readable stream for streaming response
    const stream = new ReadableStream({
        async start(controller) {
          try {
            for await (const event of eventStream) {
              if (event.chunk?.bytes) {
                const chunkData = new TextDecoder("utf-8").decode(event.chunk.bytes);
                controller.enqueue(chunkData);
              }
            }
            controller.close();
          } catch (error) {
            controller.error(error);
          }
        }
      });
  
      return stream;

      } catch (error) {
      console.error("Unexpected error:", error);
    }
   
  };
  
  