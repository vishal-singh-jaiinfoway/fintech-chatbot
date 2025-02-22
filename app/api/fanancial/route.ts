import {
  BedrockRuntimeClient,
  InvokeModelWithResponseStreamCommand,
} from "@aws-sdk/client-bedrock-runtime";
import { AWSBedrockAnthropicStream, StreamingTextResponse } from "ai";
import { experimental_buildAnthropicPrompt } from "ai/prompts";
import path from "path";
import { promises as fs } from "fs";
import { InvokeAgentCommand,BedrockAgentRuntimeClient } from "@aws-sdk/client-bedrock-agent-runtime";
import { NextResponse } from "next/server";
const text = "Amazon Bedrock helps developers build AI applications.";

function estimateClaudeTokens(text: string) {
  const words = text.split(/\s+/).length;
  return Math.round(words * 1.3); // Approximation for Claude models
}

console.log("Estimated Token Count:", estimateClaudeTokens(text));

const bedrockClient = new BedrockRuntimeClient({
  region: process.env.AWS_REGION ?? "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
  },
});

const bedrockAgentClient = new BedrockAgentRuntimeClient({
  region: process.env.AWS_REGION ?? "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
  },
});

export async function POST(req: Request) {
  // Extract the `prompt` from the body of the request
  let { messages, modelId, temperature, maxTokens, context } = await req.json();

  if (!modelId) {
    modelId = "anthropic.claude-v2:1";
  }

  if (temperature == null) {
    temperature = 0.7;
  }

  if (maxTokens == null) {
    maxTokens = 300;
  }

  const jsonDirectory = path.join(process.cwd(), "public");
  const fileContents = await fs.readFile(
    path.join(jsonDirectory, "financial.json"),
    "utf8",
  );

  const lastMessage = messages[messages.length - 1];
  const query = lastMessage.content;

  let templateString = context;
  let full_prompt = templateString.replace("{query}", query);
  full_prompt = full_prompt.replace("{fileContents}", fileContents);
  estimateClaudeTokens(full_prompt);
  messages[messages.length - 1] = { role: "user", content: full_prompt };

  //console.log("messages", messages);

  // Ask Claude for a streaming chat completion given the prompt
  const bedrockResponse = await bedrockClient.send(
    new InvokeModelWithResponseStreamCommand({
      modelId: modelId,
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify({
        prompt: experimental_buildAnthropicPrompt(messages),
        max_tokens_to_sample: maxTokens,
        temperature: temperature,
      }),
    }),
  );

  // Convert the response into a friendly text-stream
  const stream = AWSBedrockAnthropicStream(bedrockResponse);

  // const result = await invokeAgent(experimental_buildAnthropicPrompt(messages));

  //  console.log("result", result);
//  return NextResponse.json({ result })

  return new StreamingTextResponse(stream);
}

const invokeAgent = async (prompt:any) => {
  const agentId ="JQT1NOKYF7";// "VV53ICXKOQ"; // Replace with your Agent IDJQT1NOKYF7
  const aliasId ="VOL7QFVPCT"; //"FCYAR5EMS3"; // Replace with your Alias ID
  const sessionId = "session-123456";
  //const prompt = "Where is taj";

  try {
    const command: any = new InvokeAgentCommand({
      agentId,
      agentAliasId: aliasId,
      sessionId,
      inputText:prompt
    });
    console.log("hello world:");

    const response: any = await bedrockAgentClient.send(command);
     console.log("Response:", response);
    
     const eventStream = response.completion;
     let finalAnswer = "";
 
     for await (const event of eventStream) {

       if (event.chunk?.bytes) {
         const chunkData = new TextDecoder("utf-8").decode(event.chunk.bytes);
         finalAnswer += chunkData; // Append all chunks properly
       } else if (event.trace) {
         console.log("Trace Data:", JSON.stringify(event.trace, null, 2));
       } else {
         console.warn("Unexpected event:", JSON.stringify(event));
       }
     }

     console.log("Final Answer:\n", finalAnswer);
     return finalAnswer;
  } catch (error) {
    console.error("Unexpected error:", error);
  }
};

