import { InvokeAgentCommand, BedrockAgentRuntimeClient } from "@aws-sdk/client-bedrock-agent-runtime";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { BedrockRuntimeClient, InvokeModelWithResponseStreamCommand } from "@aws-sdk/client-bedrock-runtime";

// Ensure AWS credentials are available
if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    throw new Error("Missing AWS credentials. Please set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY.");
}

// AWS Clients
const s3Client = new S3Client({
    region: process.env.AWS_REGION ?? "us-east-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

const bedrockClient = new BedrockRuntimeClient({
    region: process.env.AWS_REGION ?? "us-east-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

const quarters = { "1st": 1, "2nd": 2, "3rd": 3, "4th": 4 };

// Function to estimate Claude tokens (approximation)
function estimateClaudeTokens(text) {
    const words = text.split(/\s+/).length;
    return Math.round(words * 1.3);
}

// Express-style API handler for Next.js
export async function POST(req) {
    try {
        // Parse the request body
        const body = await req.json();
        const { checked, selectedCompany, selectedYear, selectedQuarter } = body;

        console.log("Request Received:", { checked, selectedCompany, selectedYear, selectedQuarter });

        // Ensure required fields are present
        if (!selectedCompany || !selectedCompany.ticker || !selectedYear || !selectedQuarter) {
            return new Response("Missing required fields", { status: 400 });
        }

        // Invoke Model with proper parameter order
        const result = await invokeModel(selectedCompany, selectedQuarter, selectedYear);

        return new Response(result, {
            headers: {
                "Content-Type": "text/plain; charset=utf-8",
                "Cache-Control": "no-cache",
            }
        });
    } catch (error) {
        console.error("Error in POST handler:", error);
        return new Response("Internal Server Error", { status: 500 });
    }
}

// Function to invoke model using S3 data
const invokeModel = async (selectedCompany, selectedQuarter, selectedYear) => {
    try {
        const ticker = selectedCompany.ticker;
        const quarter = quarters[selectedQuarter];

        if (!ticker || !quarter || !selectedYear) {
            throw new Error("Invalid parameters provided to invokeModel.");
        }

        console.log(`Fetching S3 data for ${ticker}, Q${quarter} ${selectedYear}`);
        // s3://earnings-calls-transcripts/sentiment_analysis/SOFI/2024/
        // Construct S3 URI
        const s3Uri = `s3://earnings-calls-transcripts/sentiment_analysis/${ticker}/${selectedYear}/Q${quarter}.txt`;
        const { bucketName, objectKey } = parseS3Uri(s3Uri);

        // Fetch transcript from S3
        return await invokeModelWithS3Prompt(bucketName, objectKey);
    } catch (error) {
        console.error("Error in invokeModel:", error);
        return "Error fetching model data";
    }
};

// Convert S3 data stream to string
const streamToString = async (stream) => {
    return new Promise((resolve, reject) => {
        let data = "";
        stream.on("data", (chunk) => (data += chunk));
        stream.on("end", () => resolve(data));
        stream.on("error", reject);
    });
};

// Fetch data from S3
const fetchS3Data = async (bucketName, objectKey) => {
    try {
        const command = new GetObjectCommand({ Bucket: bucketName, Key: objectKey });
        const { Body } = await s3Client.send(command);
        if (!Body) throw new Error(`S3 object ${objectKey} is empty or not found`);
        return await streamToString(Body);
    } catch (error) {
        console.error("Error fetching S3 object:", error);
        return `Error: Unable to retrieve S3 data for ${bucketName}/${objectKey}`;
    }
};

// Invoke Bedrock Model with Stream (for future model integration)
const invokeModelWithS3Prompt = async (bucketName, objectKey) => {
    try {
        // Fetch transcript from S3
        const transcript = await fetchS3Data(bucketName, objectKey);
        if (!transcript) throw new Error("Transcript is empty");

        console.log("Successfully retrieved transcript:", transcript.slice(0, 100), "...");

        return transcript; // Returning the transcript for now
    } catch (error) {
        console.error("Error invoking model:", error);
        return "Error processing model request";
    }
};

// Parse S3 URI to get bucket name and object key
const parseS3Uri = (s3Uri) => {
    const parts = s3Uri.replace("s3://", "").split("/");
    return {
        bucketName: parts.shift(), // First part is the bucket name
        objectKey: parts.join("/"), // Remaining parts form the object key
    };
};
