/**
 * Letta Client - Singleton instance for Letta SDK access
 */
import { LettaClient } from "@letta-ai/letta-client";

/**
 * Custom error class for Letta API errors
 */
export class LettaError extends Error {
  status: number;
  responseText: string;

  constructor(status: number, responseText: string) {
    super(`Status code: ${status}\nBody: ${responseText}`);
    this.name = "LettaError";
    this.status = status;
    this.responseText = responseText;
  }
}

// Default to localhost:8283 for development
const LETTA_URL = process.env.NEXT_PUBLIC_LETTA_URL || "http://localhost:8283";

// Create a mock client that won't be used
/*
export const lettaClient = {
  agents: {
    create: async () => ({ id: "mock-agent-id" }),
    messages: {
      create: async () => ({ messages: [] }),
      list: async () => [],
    },
    resetMessages: async () => {},
  },
};
*/

// Real Letta client implementation
export const lettaClient = new LettaClient({
  baseUrl: LETTA_URL,
  // Add token if using Letta Cloud with auth
  // token: process.env.NEXT_PUBLIC_LETTA_API_KEY,
});

/**
 * Check if the Letta server is available
 */
export const checkServerStatus = async (): Promise<boolean> => {
  try {
    const LETTA_URL =
      process.env.NEXT_PUBLIC_LETTA_URL || "http://localhost:8283";
    const response = await fetch(`${LETTA_URL}/v1/health`, {
      method: "GET",
    });

    return response.ok;
  } catch (error) {
    console.error("Error checking server status:", error);
    return false;
  }
};

// API configuration
const LETTA_API_KEY = process.env.NEXT_PUBLIC_LETTA_API_KEY;
const LETTA_API_URL =
  process.env.NEXT_PUBLIC_LETTA_API_URL || "https://api.letta.xyz";

// Fallback local URL for development
const LOCAL_API_URL = "http://localhost:8283";

// Manual override for agent ID
// This is temporary to fix the agent ID issue
const MANUAL_AGENT_ID = "agent-aa463f48-8358-4ca8-8158-9a91e75362c4";

/**
 * Send a message to the Letta agent using the SDK
 */
export async function sendMessageWithSDK(
  agentId: string,
  message: string
): Promise<any> {
  try {
    // Log the effective agent ID being used - use the passed agentId, not the manual override
    console.log("Using agent ID:", agentId);

    // First try the query parameter format with cloud API
    if (LETTA_API_KEY) {
      try {
        console.log("Trying cloud API with query parameter format...");
        const queryParamUrl = `${LETTA_API_URL}/v1/message?api_key=${LETTA_API_KEY}&agent_id=${agentId}`;
        const queryParamResponse = await fetch(queryParamUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: message,
          }),
        });

        if (!queryParamResponse.ok) {
          const errorText = await queryParamResponse.text();
          console.error(
            "Cloud API query parameter format failed:",
            queryParamResponse.status,
            errorText
          );
          throw new LettaError(queryParamResponse.status, errorText);
        }

        const queryParamData = await queryParamResponse.json();
        console.log(
          "Success with cloud API query parameter format:",
          queryParamData
        );
        return formatResponse(queryParamData);
      } catch (cloudError) {
        console.error(
          "Cloud API failed, falling back to local server:",
          cloudError
        );
        // Continue to local fallback
      }
    } else {
      console.log(
        "No API key provided, skipping cloud API and using local server..."
      );
    }

    // Fallback to local server
    console.log("Trying local server...");
    const localUrl = `${LOCAL_API_URL}/v1/agents/${agentId}/messages`;
    const localResponse = await fetch(localUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [
          {
            role: "user",
            content: message,
          },
        ],
      }),
    });

    if (!localResponse.ok) {
      const errorText = await localResponse.text();
      console.error("Local server failed:", localResponse.status, errorText);
      throw new LettaError(localResponse.status, errorText);
    }

    const localData = await localResponse.json();
    console.log("Success with local server:", localData);
    return formatResponse(localData);
  } catch (error) {
    console.error("Error in sendMessageWithSDK:", error);

    // If all attempts fail, return a mock response to prevent UI breakage
    return createMockResponse(message);
  }
}

/**
 * Format the response into a standardized structure
 */
function formatResponse(data: any): any {
  // Format the array response to match the expected format
  if (Array.isArray(data)) {
    // Transform the array response into the expected format with a messages array
    const formattedResponse = {
      messages: data.map((msg) => ({
        id:
          msg.id ||
          `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        role: msg.role || "assistant",
        content:
          typeof msg.content === "string"
            ? msg.content
            : typeof msg.text === "string"
            ? msg.text
            : msg.content?.text || msg.content?.value || "",
        timestamp: msg.timestamp || new Date().toISOString(),
      })),
    };

    console.log("Formatted array response:", formattedResponse);
    return formattedResponse;
  }

  // If not an array but has a 'messages' property, return as is
  if (data && data.messages) {
    return data;
  }

  // If it's an object with a content/text field, wrap it in the expected format
  if (data && typeof data === "object" && (data.content || data.text)) {
    const formattedResponse = {
      messages: [
        {
          id:
            data.id ||
            `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          role: data.role || "assistant",
          content:
            typeof data.content === "string"
              ? data.content
              : typeof data.text === "string"
              ? data.text
              : data.content?.text || data.content?.value || "",
          timestamp: data.timestamp || new Date().toISOString(),
        },
      ],
    };

    console.log("Formatted single object response:", formattedResponse);
    return formattedResponse;
  }

  // Fallback: wrap whatever we got in a standard format
  console.log("Using fallback response format");
  return {
    messages: [
      {
        id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        role: "assistant",
        content: typeof data === "object" ? JSON.stringify(data) : String(data),
        timestamp: new Date().toISOString(),
      },
    ],
  };
}

/**
 * Check if the agent exists
 */
export async function checkAgentExists(agentId: string): Promise<boolean> {
  try {
    // Try cloud API first if API key is available
    if (LETTA_API_KEY) {
      try {
        const url = `${LETTA_API_URL}/v1/agents/${agentId}?api_key=${LETTA_API_KEY}`;
        const response = await fetch(url);

        if (response.ok) {
          return true;
        }

        if (response.status === 404) {
          console.log("Agent not found in cloud API, falling back to local...");
        } else {
          const errorData = await response.text();
          console.error(
            "Error checking agent on cloud API:",
            response.status,
            errorData
          );
        }
      } catch (cloudError) {
        console.error("Error checking agent on cloud API:", cloudError);
      }
    }

    // Fallback to local server
    try {
      const localUrl = `${LOCAL_API_URL}/v1/agents/${agentId}`;
      const localResponse = await fetch(localUrl);

      if (localResponse.ok) {
        return true;
      }

      if (localResponse.status === 404) {
        return false;
      }

      const errorData = await localResponse.text();
      console.error(
        "Error checking agent on local server:",
        localResponse.status,
        errorData
      );
    } catch (localError) {
      console.error("Error checking agent on local server:", localError);
    }

    return false;
  } catch (error) {
    console.error("Error checking agent:", error);
    return false;
  }
}

/**
 * Create a mock response when the API server is having issues
 */
function createMockResponse(userMessage: string) {
  const mockResponse = {
    messages: [
      {
        id: `ai-response-${Date.now()}`,
        role: "assistant",
        content: `I'm having trouble connecting to my knowledge base right now. However, I received your message: "${userMessage}". Please try again later when the service is back online.`,
        timestamp: new Date().toISOString(),
      },
    ],
  };
  console.log("Created mock response:", mockResponse);
  return mockResponse;
}
