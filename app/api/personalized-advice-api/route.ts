import {
  BedrockRuntimeClient,
  InvokeModelWithResponseStreamCommand,
} from '@aws-sdk/client-bedrock-runtime';
import { AWSBedrockAnthropicStream, StreamingTextResponse } from 'ai';
import { experimental_buildAnthropicPrompt } from 'ai/prompts';
import path from 'path';
import { promises as fs } from 'fs';

const bedrockClient = new BedrockRuntimeClient({
  region: process.env.AWS_REGION ?? 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? '',
  },
});

export async function POST(req: Request) {
  // Extract the `prompt` from the body of the request
  let { messages, modelId, temperature, maxTokens, context } = await req.json();

  if (!modelId) {
    modelId = "anthropic.claude-v2:1"
  }
  
  if (temperature == null) {
    temperature = 0.7
  }

  if (maxTokens == null) {
    maxTokens = 300
  }

    const jsonDirectory = path.join(process.cwd(), 'public');
    const fileContents = await fs.readFile(path.join(jsonDirectory, 'financial.json'), 'utf8');

    const crmContents = await fs.readFile(path.join(jsonDirectory, 'crm.json'), 'utf8');

  const lastMessage = messages[messages.length - 1];
  const query = lastMessage.content;

  let templateString = context;
  let full_prompt = templateString.replace("{query}", query);
  full_prompt = templateString.replace("{fileContents}", fileContents);
  full_prompt = templateString.replace("{crmContents}", crmContents);
  // 

  messages[messages.length - 1] = { role: 'user', content: full_prompt }


  // Ask Claude for a streaming chat completion given the prompt
  const bedrockResponse = await bedrockClient.send(
    new InvokeModelWithResponseStreamCommand({
      modelId: modelId,
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify({
        prompt: experimental_buildAnthropicPrompt(messages),
        max_tokens_to_sample: maxTokens,
        temperature: temperature,
      }),
    }),
  );

  // Convert the response into a friendly text-stream
  const stream = AWSBedrockAnthropicStream(bedrockResponse);

  // Respond with the stream
  return new StreamingTextResponse(stream);
}