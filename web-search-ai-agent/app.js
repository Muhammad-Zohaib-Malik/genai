import Groq from "groq-sdk";
import { tavily } from "@tavily/core";
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const tvly = tavily({ apiKey: process.env.TRAVILY_API_KEY });

async function main() {
  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content: `you are smart assistant who answers the asked questions.
        you have access to a tool called webSearch that helps you search the lastest information and real-time data from the web.
        `,
      },
      {
        role: "user",
        content: `what was the release date and starting price of iphone16?`,
      },
    ],
    model: "llama-3.3-70b-versatile",
    temperature: 0,
    tools: [
      {
        type: "function",
        function: {
          name: "webSearch",
          description:
            "search the lastest information and real-time data from the web",
          parameters: {
            type: "object",
            properties: {
              query: {
                type: "string",
                description: "The search query to perform search on",
              },
            },
            required: ["query"],
          },
        },
      },
    ],
    tool_choice: "auto",
  });

  const toolCalls = completion.choices[0].message.tool_calls;

  if (!toolCalls) {
    console.log(`Assistant ${completion.choices[0].message.content}`);
    return;
  }

  for (const tool of toolCalls) {
    console.log(`Tool call:`, tool);
    const functionName = tool.function.name;
    let args = tool.function.arguments;

    if (functionName === "webSearch") {
      const toolResult = await webSearch(JSON.parse(args));
      console.log(`Tool result:`, toolResult);
    }
  }
}

main();

async function webSearch({ query }) {
  console.log(`Searching the web for query: ${query}`);
  const response = await tvly.search(query);
  console.log("response", response);
  return "iphone16 was realesed in september 2024 with a starting price of $999";
}
