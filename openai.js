import dedent from 'dedent';
import OpenAI from "openai";


// Instantiate an OpenAI client
const client = new OpenAI({
  apiKey: "x",
});

const mysql_generation_instruction_prompt = dedent`
    Call the mysql_grammar to generate a query for My SQL Server that does this:
`

// Function to generate a SQL query from a user prompt against a grammar definition.
export async function generateQuery(prompt, output_grammar_definition, eval_mode = false) {
  try {
    const response = await client.responses.create({
      model: "gpt-5-nano",
      input: `${mysql_generation_instruction_prompt}\n\n${prompt}`,
      store: true,
      text: { format: { type: "text" } },
      tools: [{
        type: "custom",
        name: "mysql_grammar",
        description: "Executes read-only My SQL Server queries limited to SELECT statements. YOU MUST REASON HEAVILY ABOUT THE QUERY AND MAKE SURE IT OBEYS THE GRAMMAR.",
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