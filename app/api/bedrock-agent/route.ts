
  import { selectedTab } from "@/store/sidebarSlice";
import { InvokeAgentCommand,BedrockAgentRuntimeClient } from "@aws-sdk/client-bedrock-agent-runtime";
import { StreamingTextResponse, streamToResponse } from "ai";
  const text = "Amazon Bedrock helps developers build AI applications.";
  import { NextResponse } from "next/server";

  function estimateClaudeTokens(text: string) {
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
  
  export async function POST(req: Request) {
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
  
  const invokeAgent = async (prompt:any,selectedTab:any) => {
    console.log("selectedTab",selectedTab)
  
    const agentId = "DMDSLKJ1BD"; // Replace with your Agent IDJQT1NOKYF7
    const aliasId = "IY0S6QV0QT"; // Replace with your Alias ID
    const sessionId = "session-004";
    try {
      const command: any = new InvokeAgentCommand({
        agentId,
        agentAliasId: aliasId,
        sessionId,
        inputText:`${prompt}.Provide response with proper markdown`,
      });
  
      const response: any = await bedrockAgentClient.send(command);
      console.log("response",response)
       const eventStream = response.completion;
       let finalAnswer = "";
   
       for await (const event of eventStream) {
  
         if (event.chunk?.bytes) {
           const chunkData = new TextDecoder("utf-8").decode(event.chunk.bytes);
           finalAnswer += chunkData; // Append all chunks properly
         } 
        //  else if (event.trace) {
        //    console.log("Trace Data:", JSON.stringify(event.trace, null, 2));
        //  } else {
        //    console.warn("Unexpected event:", JSON.stringify(event));
        //  }
       }
  
      
        return finalAnswer;


        // Create a readable stream for streaming response
    // const stream = new ReadableStream({
    //     async start(controller) {
    //       try {
    //         for await (const event of eventStream) {
    //           if (event.chunk?.bytes) {
    //             const chunkData = new TextDecoder("utf-8").decode(event.chunk.bytes);
    //             controller.enqueue(chunkData);
    //           }
    //         }
    //         controller.close();
    //       } catch (error) {
    //         controller.error(error);
    //       }
    //     }
    //   });
  
    //   return new Response(stream, {
    //     headers: {
    //       "Content-Type": "text/plain; charset=utf-8",
    //       "Cache-Control": "no-cache",
    //     }
    //   });

      } catch (error) {
      console.error("Unexpected error:", error);
    }
   
  };
  
  