// import { BedrockRuntimeClient, InvokeModelCommand, InvokeModelWithResponseStreamCommand } from "@aws-sdk/client-bedrock-runtime";

// const { S3 } = require("aws-sdk");

// // AWS Configurations
// const s3Client = new S3({
//     region: process.env.AWS_REGION ?? "us-east-1",
//     credentials: {
//         accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
//         secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
//     },
// });

// const bedrockClient = new BedrockRuntimeClient({
//     region: process.env.AWS_REGION ?? "us-east-1",
//     credentials: {
//         accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
//         secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
//     },
// });



// // Quarter Mapping
// const quarterMapping = {
//     "1st": 1, "2nd": 2, "3rd": 3, "4rth": 4, "4th": 4, "Q1": 1, "Q2": 2, "Q3": 3, "Q4": 4,
//     "first": 1, "second": 2, "third": 3, "fourth": 4
// };

// /**
//  * Generates an S3 URI from the given object.
//  */
// const generateS3Uri = (obj) => {
//     if (!obj.ticker || !obj.year || !obj.quarter) {
//         throw new Error("Missing required fields: ticker, year, or quarter.");
//     }

//     const quarterNumber = quarterMapping[obj.quarter];
//     if (!quarterNumber) {
//         throw new Error(`Invalid quarter value: ${obj.quarter}`);
//     }

//     return `s3://earnings-calls-transcripts/transcripts/json/${obj.ticker}/${obj.year}/Q${quarterNumber}.json`;
// };

// // Function to fetch JSON from S3
// async function fetchJsonFromS3(fileUrl) {
//     try {
//         const { bucket, key } = parseS3Uri(fileUrl);
//         const params = { Bucket: bucket, Key: key };

//         const data = await s3Client.getObject(params).promise();
//         return JSON.parse(data.Body.toString("utf-8"));
//     } catch (error) {
//         console.error("Error fetching JSON:", error);
//         return null;
//     }
// }

// // Function to extract bucket name and key from S3 URI
// const parseS3Uri = (s3Uri) => {
//     const match = s3Uri.match(/^s3:\/\/([^/]+)\/(.+)$/);
//     if (!match) {
//         throw new Error("Invalid S3 URI format.");
//     }
//     return { bucket: match[1], key: match[2] };
// };

// // Function to extract JSON from text
// const extractJSON = (text) => {
//     const match = text.match(/```json\n([\s\S]*?)\n```/);
//     return match ? match[1] : "No valid JSON found";
// };

// // Function to get query parameters from Claude model
// const getQueryParams = async (prompt) => {
//     try {
//         const modelCommand = new InvokeModelCommand({
//             modelId: "anthropic.claude-3-5-sonnet-20240620-v1:0",
//             contentType: "application/json",
//             accept: "application/json",
//             body: JSON.stringify({
//                 anthropic_version: "bedrock-2023-05-31",
//                 messages: [
//                     {
//                         role: "user",
//                         content: `From the following prompt, infer the required company ticker(s), quarter(s), and year(s) for which transcripts are needed.If you infer that you need for all the quarters,then insert four values.Transcripts are only available for the year 2024.

//         Return your response in JSON format:
//         \`\`\`json
//         [
//             { "ticker": "<company_ticker>", "quarter": "<quarter>", "year": "<year>" }
//         ]
//         \`\`\`

//         ### Prompt:
//         ${prompt}`
//                     }
//                 ],
//                 max_tokens: 500
//             })
//         });

//         const response = await bedrockClient.send(modelCommand);
//         const responseData = JSON.parse(Buffer.from(response.body).toString("utf-8"));
//         const responseText = responseData?.content?.map(item => item.text).join("\n") || "No response received";

//         const extractedJSON = extractJSON(responseText);
//         return JSON.parse(extractedJSON);
//     } catch (error) {
//         console.error("Unexpected error:", error);
//     }
// };

// const getAnswerForPrompt = async function* (source, prompt) {
//     try {
//         console.log("source", source)
//         // Check if the prompt is missing or unclear
//         if (!prompt || prompt.trim().length === 0) {
//             yield "⚠️ **Error:** The question is unclear. Please provide more details.";
//             return;
//         }

//         // Check if the source data is missing
//         if (!source || source.trim().length === 0) {
//             yield "⚠️ **Note:** No reference data available. Providing a general response:";
//         }

//         const modelCommand = new InvokeModelWithResponseStreamCommand({
//             modelId: "anthropic.claude-3-5-sonnet-20240620-v1:0",
//             contentType: "application/json",
//             accept: "application/json",
//             body: JSON.stringify({
//                 anthropic_version: "bedrock-2023-05-31",
//                 messages: [
//                     {
//                         role: "user",
//                         content: `Answer the following question concisely and informatively.

// ### **Instructions:**
// - Format your response in **proper Markdown**.
// - If the question is unclear, politely ask for clarification.
// - Do **not** mention that you are using a transcript as a source.
// - Do **not** state that you are providing a Markdown-formatted response.

// ### **Question:**
// ${prompt}

// ### **Reference Data:**
// ${source || "No reference data available."}`
//                     }
//                 ],
//                 max_tokens: 2000,
//                 temperature: 1,
//                 top_p: 0.999,
//                 top_k: 250,
//                 stop_sequences: ["Human:", "Assistant:"]
//             })
//         });

//         const response = await bedrockClient.send(modelCommand);
//         for await (const event of response.body) {
//             if (event.chunk?.bytes) {
//                 const chunkData = new TextDecoder("utf-8").decode(event.chunk.bytes);
//                 const parsedData = JSON.parse(chunkData);

//                 if (parsedData?.delta?.text) {
//                     yield parsedData.delta.text;
//                 }
//             }
//         }
//     } catch (error) {
//         console.error("Unexpected error:", error);
//         yield "❌ **Error:** Unable to process your request at the moment. Please try again later.";
//     }
// };

// // Function to generate response from Claude
// const generateResponse = async (prompt) => {
//     try {
//         const queryParamsArray = await getQueryParams(prompt);
//         if (!queryParamsArray || queryParamsArray.length === 0 || queryParamsArray[0].ticker === "ALL") {
//             return "⚠️ **Error:** The request could not be processed. Please refine your query and try again.";
//         }
//         const s3urls = queryParamsArray.map(generateS3Uri);
//         const jsonFiles = await Promise.all(s3urls.map(fetchJsonFromS3));

//         const transformedData = jsonFiles.map(item => ({
//             id: item.id,
//             company_name: item.company_name,
//             event: item.event,
//             year: item.year,
//             transcript: item.transcript.map(t => t.text).join(" ") // Join all transcript texts
//         }));

//         return getAnswerForPrompt(JSON.stringify(transformedData), prompt);
//     } catch (error) {
//         console.error("Error:", error);
//     }
// };

// // **POST API Handler**
// export async function POST(req) {
//     try {
//         const body = await req.json();
//         const { inputText } = body;
//         const stream = await generateResponse(inputText);

//         return new Response(new ReadableStream({
//             async start(controller) {
//                 for await (const chunk of stream) {
//                     controller.enqueue(new TextEncoder().encode(chunk));
//                 }
//                 controller.close();
//             }
//         }), {
//             headers: {
//                 "Content-Type": "text/plain; charset=utf-8",
//                 "Cache-Control": "no-cache",
//             }
//         });
//     } catch (error) {
//         console.error("POST Error:", error);
//         return new Response("Error occurred", { status: 500 });
//     }
// }





import { InvokeAgentCommand, BedrockAgentRuntimeClient } from "@aws-sdk/client-bedrock-agent-runtime";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";

// AWS Configurations
const s3Client = new S3Client({
    region: process.env.AWS_REGION ?? "us-east-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_KEY,
    },
});

const bedrockAgentClient = new BedrockAgentRuntimeClient({
    region: process.env.AWS_REGION ?? "us-east-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_KEY,
    },
});

export async function POST(req) {
    // Extract the prompt from the body of the request
    let body = await req.json();
    let { inputText, checked, selectedCompany, selectedQuarter, selectedYear,
        persona,
        foundationModel,
        fmTemperature,
        fmMaxTokens,
        context,
    } = body;



    // Construct S3 URI for the transcript with corrected quarter format
    const formattedQuarter = selectedQuarter.replace(/st|nd|rd|th/g, ""); // Remove suffix like 'st', 'nd', 'rd', 'th'
    const s3Uri = `s3://earnings-calls-transcripts/transcripts/json/${selectedCompany?.ticker}/${selectedYear}/Q${formattedQuarter}.json`;
    console.log("S3 URI:", s3Uri);

    // Fetch the transcript from S3
    const transcript = await fetchS3Data(s3Uri);
    if (!transcript) {
        return new Response("Error fetching transcript", { status: 500 });
    }

    const result = await invokeAgent(inputText, transcript, checked, selectedCompany, persona,
        foundationModel,
        fmTemperature,
        fmMaxTokens,
        context);

    return new Response(result, {
        headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "no-cache",
        },
    });
}

const fetchS3Data = async (s3Uri) => {
    const { bucketName, objectKey } = parseS3Uri(s3Uri);

    try {
        const command = new GetObjectCommand({ Bucket: bucketName, Key: objectKey });
        const { Body } = await s3Client.send(command);
        const stream = await streamToString(Body);
        return stream;
    } catch (error) {
        console.error("Error fetching S3 object:", error);
        return null;
    }
};

const streamToString = async (stream) => {
    return new Promise((resolve, reject) => {
        let data = "";
        stream.on("data", (chunk) => (data += chunk));
        stream.on("end", () => resolve(data));
        stream.on("error", reject);
    });
};

const parseS3Uri = (s3Uri) => {
    const parts = s3Uri.replace("s3://", "").split("/");
    return {
        bucketName: parts.shift(), // First part is the bucket name
        objectKey: parts.join("/"), // Remaining parts form the object key
    };
};

const invokeAgent = async (prompt, transcript, checked, selectedCompany, persona,
    foundationModel,
    fmTemperature,
    fmMaxTokens,
    context,) => {
    const agentId = "50SABV0OZD"; // Replace with your Agent ID
    const aliasId = "SQTYNYI0DL"; // Replace with your Alias ID
    const sessionId = "session-002";

    // const agentId = "VV53ICXKOQ"; // Replace with your Agent ID
    // const aliasId = "V40L6XYC9A"; // Replace with your Alias ID
    // const sessionId = "session-001";

    const combinedPrompt = `
       Here is the context from the earnings call transcript of ${selectedCompany?.name}:

Transcript:
${transcript}

User Input: ${prompt}

Please generate an analysis or response based on the provided context and user input, considering someone who is ${persona}. If relevant, incorporate the following additional context: ${context}.

Formatting Instructions:

Provide your response in Markdown format only.
Limit the response to ${fmMaxTokens} tokens.
Use a foundation model temperature of ${fmTemperature}.
Do not mention or disclose your source of information and that using your markdown to format your response.
Ensure the response is well-structured and insightful.
    `;


    try {
        const command = new InvokeAgentCommand({
            agentId,
            agentAliasId: aliasId,
            sessionId,
            inputText: combinedPrompt,
            streamingConfigurations: {
                streamFinalResponse: true
            }
        });

        const response = await bedrockAgentClient.send(command);

        const eventStream = response.completion;

        // Create a readable stream for streaming response
        const stream = new ReadableStream({
            async start(controller) {
                try {
                    for await (const event of eventStream) {
                        if (event.chunk?.bytes) {
                            const chunkData = new TextDecoder("utf-8").decode(event.chunk.bytes);
                            console.log("chunkData", chunkData);
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
