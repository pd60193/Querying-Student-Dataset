import dedent from 'dedent';
import OpenAI from "openai";

// Instantiate OpenAI client lazily or via config
const getClient = () => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not set in environment variables");
  }
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
};

const DEFAULT_INSTRUCTION = dedent`
    Call the mysql_grammar to generate a query for My SQL Server that does this:
`

/**
 * Generates a SQL query based on a natural language prompt and a Lark grammar definition.
 * @param {string} prompt - User input
 * @param {string} grammarDefinition - The Lark grammar string
 * @param {boolean} [evalMode=false] - If true, returns full response object
 * @param {string} [model="gpt-4o"] - Model to use (gpt-5-nano isn't public, defaulting to 4o or 4o-mini)
 */
export async function generateQuery(prompt, output_grammar_definition, eval_mode = false) {
  const client = getClient();

  try {
    const response = await client.responses.create({
      model: "gpt-5-nano",
      input: `${DEFAULT_INSTRUCTION}\n\n${prompt}`,
      store: true,
      text: { format: { type: "text" } },
      tools: [{
        type: "custom",
        name: "mysql_grammar",
        description: "Generates read-only My SQL Server queries limited to SELECT statements. YOU MUST REASON HEAVILY ABOUT THE QUERY AND MAKE SURE IT OBEYS THE GRAMMAR.",
        format: {
          type: "grammar",
          syntax: "lark",
          definition: output_grammar_definition
        }
      }, ],
      parallel_tool_calls: false
    });
    if (eval_mode) {
      return response;
    }
    console.log(response);
    return response.output[response.output.length - 1].input;
  } catch (error) {
    throw new Error(`Unable to generate query for ${prompt}: ${error.message}`);
  }
}