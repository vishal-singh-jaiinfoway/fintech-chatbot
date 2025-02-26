import { InvokeAgentCommand, BedrockAgentRuntimeClient } from "@aws-sdk/client-bedrock-agent-runtime";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";

// AWS Configurations
const s3Client = new S3Client({
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

export async function POST(req) {
    // Extract the prompt from the body of the request
    let body = await req.json();
    let { messages = [], inputText, checked, selectedCompany, selectedQuarter, selectedYear } = body;

    console.log("inputText==========", inputText);
    console.log("checked==========", checked);
    console.log("selectedCompany", selectedCompany);
    console.log("selectedQuarter", selectedQuarter);
    console.log("selectedYear", selectedYear);

    // Construct S3 URI for the transcript with corrected quarter format
    const formattedQuarter = selectedQuarter.replace(/st|nd|rd|th/g, ""); // Remove suffix like 'st', 'nd', 'rd', 'th'
    const s3Uri = `s3://earnings-calls-transcripts/transcripts/json/${selectedCompany?.ticker}/${selectedYear}/Q${formattedQuarter}.json`;
    console.log("S3 URI:", s3Uri);

    // Fetch the transcript from S3
    const transcript = await fetchS3Data(s3Uri);
    if (!transcript) {
        return new Response("Error fetching transcript", { status: 500 });
    }

    const result = await invokeAgent(inputText, transcript, checked, selectedCompany);
    console.log("invokeAgent", result);

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

const invokeAgent = async (prompt, transcript, checked, selectedCompany) => {
    const agentId = "VV53ICXKOQ"; // Replace with your Agent ID
    const aliasId = "V40L6XYC9A"; // Replace with your Alias ID
    const sessionId = "session-001";

    const combinedPrompt = `
        Here is the context from the earnings call transcript of SoFi for Q1 2024:
        Company: ${selectedCompany?.name}
        Event: Q1 2024 Earnings Call
        Year: 2024
        Transcript:
        ${transcript}

        User Input: ${prompt}

        Please generate an analysis or response based on the provided context and user input.
    `;

    console.log("combinedPrompt", combinedPrompt);

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
        console.log("response", response);

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
