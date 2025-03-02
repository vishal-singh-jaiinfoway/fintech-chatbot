import { BedrockRuntimeClient, InvokeModelCommand, InvokeModelWithResponseStreamCommand } from "@aws-sdk/client-bedrock-runtime";
import axios from "axios";
const { S3 } = require("aws-sdk");

const earningsTranscriptsAPI = process.env.EARNINGS_CALLS_TRANSCRIPTS_API;
const earningsTranscriptsAPIKey = process.env.EARNINGS_CALLS_TRANSCRIPTS_API_KEY;
const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;

// AWS Configurations
const s3Client = new S3({
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




const extractJson = (text) => {
    const match = text.match(/\{[\s\S]*\}/); // Extract JSON part
    return match ? match[0] : null;
};

const extractJSON2 = (text) => {
    const match = text.match(/```json\n([\s\S]*?)\n```/);
    return match ? match[1] : "No valid JSON found";
};



// **POST API Handler**
export async function POST(req) {
    try {
        const body = await req.json();
        const { inputText } = body;
        const stream =  fetchAndUploadTranscript(inputText);

        return new Response(new ReadableStream({
            async start(controller) {
                for await (const chunk of stream) {
                    controller.enqueue(new TextEncoder().encode(chunk));
                }
                controller.close();
            }
        }), {
            headers: {
                "Content-Type": "text/plain; charset=utf-8",
                "Cache-Control": "no-cache",
            }
        });
    } catch (error) {
        console.error("POST Error:", error);
        return new Response("Error occurred", { status: 500 });
    }
}

// Function to get query parameters from Claude model
const getQueryParams = async (prompt) => {
    try {
        const modelCommand = new InvokeModelCommand({
            modelId: "anthropic.claude-3-5-sonnet-20240620-v1:0",
            contentType: "application/json",
            accept: "application/json",
            body: JSON.stringify({
                anthropic_version: "bedrock-2023-05-31",
                messages: [
                    {
                        role: "user",
                        content: `From the following prompt, infer the required company ticker, quarters, and year for which transcripts should be fetched.If you 4 for quarters,it means transcripts should be fetched for four quarters.Transcripts are only available for the year 2024.
        
        Return your response in JSON format:
        \`\`\`json
        [
            { "ticker": "<company_ticker>", "quarters": "<number of quarters>", "year": "<year>" }
        ]
        \`\`\`

        ### Prompt:
        ${prompt}`
                    }
                ],
                max_tokens: 500
            })
        });

        const response = await bedrockClient.send(modelCommand);
        const responseData = JSON.parse(Buffer.from(response.body).toString("utf-8"));
        const responseText = responseData?.content?.map(item => item.text).join("\n") || "No response received";
        const extractedJSON = extractJSON2(responseText);
        return JSON.parse(extractedJSON);
    } catch (error) {
        console.error("Unexpected error:", error);
    }
};
/**
 * [
  { ticker: 'SOFI', quarters: '4', year: '2024' },
  { ticker: 'JPM', quarters: '4', year: '2024' },
  { ticker: 'MS', quarters: '4', year: '2024' }
]
 * 
 */


// Function to fetch earnings call transcript
const fetchEarningsCallsTranscript = async (ticker, year, quarter) => {
    const apiUrl = `${earningsTranscriptsAPI}?ticker=${ticker}&year=${year}&quarter=${quarter}`;
    try {
        const response = await axios.get(apiUrl, {
            headers: { 'x-api-key': earningsTranscriptsAPIKey }
        });
        return response.data.transcript || "No transcript found";
    } catch (error) {
        console.error(`Error fetching transcript for ${ticker} Q${quarter} ${year}:`, error);
        return null;
    }
};


// Function to parse transcript
function parseTranscript(rawText) {
    if (typeof rawText === "object") return rawText;

    try {
        return JSON.parse(rawText);
    } catch (e) { }

    const transcriptArray = [];
    const lines = rawText.split("\n");

    let currentSpeaker = null, currentText = "";
    lines.forEach((line) => {
        const speakerMatch = line.match(/^(.+?):\s/);
        if (speakerMatch) {
            if (currentSpeaker) transcriptArray.push({ speaker: currentSpeaker, text: currentText.trim() });
            currentSpeaker = speakerMatch[1];
            currentText = line.replace(speakerMatch[0], "");
        } else {
            currentText += " " + line;
        }
    });

    if (currentSpeaker) transcriptArray.push({ speaker: currentSpeaker, text: currentText.trim() });
    return { transcript: transcriptArray };
}

// Function to upload JSON to S3
const uploadToS3 = async (ticker, year, quarter, content, folder, extension) => {
    const fileName = `${folder}/${ticker}/${year}/Q${quarter}.${extension}`;

    const params = {
        Bucket: BUCKET_NAME,
        Key: fileName,
        Body: extension === "json" ? JSON.stringify(content, null, 2) : content,
        ContentType: extension === "json" ? "application/json" : "text/plain; charset=utf-8",
    };

    try {
        await s3Client.upload(params).promise();
        console.log(`Successfully uploaded ${fileName} to S3`);
        return `s3://${BUCKET_NAME}/${fileName}`;
    } catch (error) {
        console.error("Error uploading to S3:", error);
        return null;
    }
};

// // Function to extract JSON from model response
// const extractJSON = (responseText) => {
//     const match = responseText.match(/\{[\s\S]*\}/);
//     return match ? JSON.parse(match[0]) : {};
// };

const structure = `{
   "id": "company_name_Quarter_Year_Earnings_Call",
   "company_name": "company_name",
   "event": "Quarter Year Earnings Call",
   "year": "Year",
   "participants": [],
   "topics": [],
    
}`
// Function to invoke Bedrock AI model
const invokeModel = async (transcript) => {
    const prompt = `You are a financial analyst. You are given a transcript of an earnings call. Analyze the transcript and provide information in this structure.\n\nStructure: ${structure}.\n\nThe given structure is just an example of the format.Use data from transcript only to use for "id","company_name","event","year","participants",and "topics".Do not use data given in the structure directly as it is just an example.\n\nThe transcript is as follows:\n\n${JSON.stringify(transcript, null, 2)}`;
    try {
         const modelCommand = new InvokeModelCommand({
            modelId: "anthropic.claude-3-5-sonnet-20240620-v1:0",
            contentType: "application/json",
            accept: "application/json",
            body: JSON.stringify({
                anthropic_version: "bedrock-2023-05-31",
                messages: [
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                max_tokens: 1000
            })
        });

        const response = await bedrockClient.send(modelCommand);
        const responseData = JSON.parse(Buffer.from(response.body).toString("utf-8"));
        const responseText = responseData?.content?.map(item => item.text).join("\n") || "No response received";
        const extractedJSON = extractJson(responseText);
        return JSON.parse(JSON.stringify(extractedJSON));
    } catch (error) {
        console.error("Error invoking model:", error);
        return {};
    }
};


const fetchAndUploadTranscript = async function* (prompt) {
    try {
        const queryParamsArray = await getQueryParams(prompt);

        for (const company of queryParamsArray) {
            for (let quarter = 1; quarter <= parseInt(company.quarters); quarter++) {
                const s3Uri = await handler({ 
                    ticker: company.ticker, 
                    year: parseInt(company.year), 
                    quarter 
                });

                yield `Uploaded ${company.ticker} Q${quarter} to: ${s3Uri}\n`;
            }
        }
    } catch (error) {
        console.error("Error fetching and uploading transcript:", error);
        yield "Error occurred while processing transcripts.\n";
    }
};


const handler = async ({ ticker, year, quarter }) => {
    try {
        const transcript = await fetchEarningsCallsTranscript(ticker, year, quarter);
        const parsedTranscript = parseTranscript(transcript);
        const structuredTranscript = await invokeModel(parsedTranscript);
        const mergedData = { ...JSON.parse(structuredTranscript), transcript: parsedTranscript.transcript };
        const s3Uri = await uploadToS3(ticker, year, quarter, mergedData, "transcripts/json", "json");
        return s3Uri;
    } catch (error) {
        console.error("Error in handler:", error);
        throw new Error("Error occurred while processing transcripts.\n");
    }

}