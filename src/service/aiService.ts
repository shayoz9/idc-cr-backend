import {
  BedrockRuntimeClient,
  InvokeModelCommand,
  InvokeModelCommandInput,
  InvokeModelCommandOutput,
} from "@aws-sdk/client-bedrock-runtime";

interface TaskData {
  title: string;
  description: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  dueDate: string | null;
  status: "TODO" | "IN_PROGRESS" | "DONE";
}

interface BedrockMessage {
  role: "user" | "assistant";
  content: string;
}

interface BedrockRequestPayload {
  anthropic_version?: string;
  max_tokens: number;
  messages: BedrockMessage[];
  temperature?: number;
}

interface BedrockResponseContent {
  type: "text";
  text: string;
}

interface BedrockResponse {
  id?: string;
  type?: string;
  role?: string;
  content?: BedrockResponseContent[];
  model?: string;
  stop_reason?: string;
  usage?: {
    input_tokens: number;
    output_tokens: number;
  };
  // OpenAI format fields
  choices?: Array<{
    finish_reason: string;
    index: number;
    message?: {
      content: string;
      role: string;
    };
    text?: string;
  }>;
}

class BedrockService {
  private client: BedrockRuntimeClient;
  private modelId: string;

  constructor() {
    this.client = new BedrockRuntimeClient({
      region: process.env.AWS_REGION || "eu-north-1",
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
      },
    });

    this.modelId = process.env.BEDROCK_MODEL_ID || "openai.gpt-oss-120b-1:0";
  }

  async parseNaturalLanguageTask(userInput: string): Promise<TaskData> {
    const prompt = this.buildPrompt(userInput);
    const payload = this.buildPayload(prompt);

    try {
      console.log(
        "Invoking Bedrock with payload:",
        JSON.stringify(payload, null, 4),
      );
      const response = await this.invokeBedrock(payload);
      console.log("Raw Bedrock response:", JSON.stringify(response, null, 4));
      const taskData = this.parseResponse(response);
      return taskData;
    } catch (error) {
      console.error("Error calling Bedrock:", error);
      throw new Error("Failed to parse task with AI");
    }
  }

  private buildPrompt(userInput: string): string {
    const currentDate = new Date().toISOString().split("T")[0];

    return `You are a task extraction assistant. Extract task information from the following natural language input and return ONLY a JSON object.

Current date: ${currentDate}

Input: "${userInput}"

Return a JSON object with these exact fields:
- title: A concise task title (string, max 100 characters)
- description: A brief description (string, can be empty string if not enough info)
- priority: One of "LOW", "MEDIUM", or "HIGH" based on urgency indicators
- dueDate: ISO date string (YYYY-MM-DD) or null if no date mentioned
- status: Always "TODO"

Priority detection rules:
- HIGH: Contains words like "urgent", "ASAP", "critical", "important", "immediately", "emergency"
- MEDIUM: Contains words like "soon", "this week", "normal", or default when no indicators
- LOW: Contains words like "whenever", "eventually", "someday", "low priority", "not urgent"

Date parsing rules:
- "tomorrow" = ${this.getRelativeDate(1)}
- "next week" = ${this.getRelativeDate(7)}
- "next Monday/Tuesday/etc" = calculate the next occurrence
- "in X days/weeks" = calculate accordingly
- If no date mentioned, set to null
- Always return dates in YYYY-MM-DD format

Return ONLY the JSON object with no markdown formatting, no code blocks, no explanatory text.`;
  }

  private buildPayload(prompt: string): BedrockRequestPayload {
    const payload: BedrockRequestPayload = {
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3, // Lower temperature for more consistent output
    };

    // Add anthropic_version only for Anthropic models
    if (this.modelId.includes("anthropic")) {
      payload.anthropic_version = "bedrock-2024-06-03";
    }

    return payload;
  }

  private async invokeBedrock(
    payload: BedrockRequestPayload,
  ): Promise<BedrockResponse> {
    const input: InvokeModelCommandInput = {
      modelId: this.modelId,
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify(payload),
    };

    const command = new InvokeModelCommand(input);
    const response: InvokeModelCommandOutput = await this.client.send(command);
    console.log("Bedrock API response:", response);
    if (!response.body) {
      throw new Error("Empty response from Bedrock");
    }

    const responseBody = JSON.parse(
      new TextDecoder().decode(response.body),
    ) as BedrockResponse;

    return responseBody;
  }

  private parseResponse(response: BedrockResponse): TaskData {
    // Handle OpenAI response format (different structure)
    console.log("Parsing Bedrock response for task data...");
    console.log("Response content:", response.content);
    if (response.choices) {
      const choice = response.choices[0];
      const content = choice.message?.content || choice.text || "";
      return this.parseContent(content);
    }

    // Handle Anthropic response format
    if (!response.content || response.content.length === 0) {
      throw new Error("No content in Bedrock response");
    }

    const content = response.content[0].text;
    return this.parseContent(content);
  }

  private parseContent(content: string): TaskData {
    // Remove any markdown code blocks if present
    const cleanedContent = content
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .replace(/<reasoning>.*?<\/reasoning>/gs, "") // Remove reasoning tags
      .trim();

    try {
      const taskData = JSON.parse(cleanedContent) as TaskData;

      // Validate the response
      this.validateTaskData(taskData);

      return taskData;
    } catch (error) {
      console.error("Error parsing AI response:", error);
      console.error("Raw content:", content);
      throw new Error("Failed to parse AI response into valid task data");
    }
  }

  private validateTaskData(data: any): asserts data is TaskData {
    if (!data.title || typeof data.title !== "string") {
      throw new Error("Invalid task title");
    }

    if (typeof data.description !== "string") {
      throw new Error("Invalid task description");
    }

    const validPriorities = ["LOW", "MEDIUM", "HIGH"];
    if (!validPriorities.includes(data.priority)) {
      throw new Error("Invalid task priority");
    }

    const validStatuses = ["TODO", "IN_PROGRESS", "DONE"];
    if (!validStatuses.includes(data.status)) {
      throw new Error("Invalid task status");
    }

    if (data.dueDate !== null && typeof data.dueDate !== "string") {
      throw new Error("Invalid task due date");
    }

    // Validate date format if present
    if (data.dueDate && !this.isValidDateString(data.dueDate)) {
      throw new Error("Invalid date format");
    }
  }

  private isValidDateString(dateString: string): boolean {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) return false;

    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
  }

  private getRelativeDate(daysFromNow: number): string {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    return date.toISOString().split("T")[0];
  }

  // Alternative method using streaming for better performance
  async parseNaturalLanguageTaskStreaming(
    userInput: string,
    onProgress?: (chunk: string) => void,
  ): Promise<TaskData> {
    // This is a placeholder for streaming implementation
    // AWS Bedrock supports streaming responses for real-time feedback
    return this.parseNaturalLanguageTask(userInput);
  }
}

export default new BedrockService();
