import { InvokeAgentCommand, BedrockAgentRuntimeClient } from "@aws-sdk/client-bedrock-agent-runtime";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { BedrockRuntimeClient, InvokeModelWithResponseStreamCommand } from "@aws-sdk/client-bedrock-runtime";

// AWS Configurations
const s3Client = new S3Client({
    region: process.env.AWS_REGION ?? "us-east-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
    },
});
const bedrockClient = new BedrockRuntimeClient({
    region: process.env.AWS_REGION ?? "us-east-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
    },
});

const quarters = { "1st": 1, "2nd": 2, "3rd": 3, "4th": 4 }

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
    let { messages = [], inputText, checked } = body;
    console.log("inputText==========", inputText)

    console.log("checked==========", checked)



    const result = await invokeAgent(inputText, checked);



    return new Response(result, {
        headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "no-cache",
        }
    });
}

const invokeAgent = async (prompt) => {



    const agentId = "VV53ICXKOQ"; // Replace with your Agent IDJQT1NOKYF7
    const aliasId = "U0EYU3LOOJ"; // Replace with your Alias ID
    const sessionId = "session-008";
    try {
        const command = new InvokeAgentCommand({
            agentId,
            agentAliasId: aliasId,
            sessionId,
            inputText: `${prompt}.Provide response with proper markdown`,
            streamingConfigurations: {
                streamFinalResponse: true
            }
        });

        const response = await bedrockAgentClient.send(command);
        console.log("response", response)
        const eventStream = response.completion;
        // let finalAnswer = "";

        // for await (const event of eventStream) {

        //     if (event.chunk?.bytes) {
        //         const chunkData = new TextDecoder("utf-8").decode(event.chunk.bytes);
        //         finalAnswer += chunkData; // Append all chunks properly
        //     }
        //     else if (event.trace) {
        //         console.log("Trace Data:", JSON.stringify(event.trace, null, 2));
        //     } else {
        //         console.warn("Unexpected event:", JSON.stringify(event));
        //     }
        // }


        // return finalAnswer;


        //Create a readable stream for streaming response
        const stream = new ReadableStream({
            async start(controller) {
                try {
                    for await (const event of eventStream) {
                        if (event.chunk?.bytes) {
                            const chunkData = new TextDecoder("utf-8").decode(event.chunk.bytes);
                            console.log("chunkData", chunkData)
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

// const invokeModel = async (selectedCompany, selectedQuarter, selectedYear) => {
//     try {
//         const ticker = selectedCompany.ticker;
//         const quarter = quarters[selectedQuarter];
//         const s3Uri = `s3://earnings-calls-transcript/transcripts/${ticker}/${selectedYear}/Q${quarter}.txt`;
//         const { bucketName, objectKey } = parseS3Uri(s3Uri);
//         await invokeModelWithS3Prompt(bucketName, objectKey);

//     } catch (error) {
//         console.log(error)
//     }
// }


// Function to convert S3 stream to string
// const streamToString = async (stream) => {
//     return new Promise((resolve, reject) => {
//         let data = "";
//         stream.on("data", (chunk) => (data += chunk));
//         stream.on("end", () => resolve(data));
//         stream.on("error", reject);
//     });
// };

// // Fetch Data from S3
// const fetchS3Data = async (bucketName, objectKey) => {
//     try {
//         const command = new GetObjectCommand({ Bucket: bucketName, Key: objectKey });
//         const { Body } = await s3Client.send(command);
//         return await streamToString(Body);
//     } catch (error) {
//         console.error("Error fetching S3 object:", error);
//     }
// };

// // Invoke Bedrock Model with Stream
// const invokeModelWithS3Prompt = async (bucketName, objectKey) => {
//     try {
//         // Fetch prompt from S3
//         const transcript = await fetchS3Data(bucketName, objectKey);
//         console.log("Using Prompt from S3:", promptData);



//         const messages = [
//             {
//                 role: "user",
//                 content: `Here is transcript:${transcript}\n\n.Create sentiment analysis of the questions asked,and suggestions for sentiments improvements.`
//             },
//         ];

//         const command = new InvokeModelWithResponseStreamCommand({
//             modelId: "anthropic.claude-v2:1",
//             body: JSON.stringify({
//                 anthropic_version: "bedrock-2023-05-31",
//                 messages,
//                 max_tokens: 8000,
//                 temperature: 0.1,
//                 top_p: 0.9,
//             }),
//             contentType: "application/json",
//             accept: "application/json",
//         });

//         console.log("Sending request to Bedrock...");
//         const response = await bedrockClient.send(command);
//         console.log("Full Response Object:", response);

//         if (!response.body) {
//             console.error("Response body is empty");
//             return;
//         }

//         console.log("Streaming Response...");

//         let completeMessage = "";

//         // Decode and process the response stream
//         for await (const item of response.body) {

//             const chunk = JSON.parse(new TextDecoder().decode(item.chunk.bytes));
//             const chunk_type = chunk.type;

//             if (chunk_type === "content_block_delta") {
//                 const text = chunk.delta.text;
//                 console.log("Received chunk:", text);
//                 completeMessage = completeMessage + text;

//             }
//         }
//         console.log("completeMessage", completeMessage)
//         // Return the final response
//         return completeMessage;
//     } catch (error) {
//         console.error("Error invoking model:", error);
//     }
// };

const parseS3Uri = (s3Uri) => {
    const parts = s3Uri.replace("s3://", "").split("/");
    return {
        bucketName: parts.shift(), // First part is the bucket name
        objectKey: parts.join("/"), // Remaining parts form the object key
    };
};