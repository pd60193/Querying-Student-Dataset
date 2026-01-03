import { generateQuery } from './openai.js';
import { mysql_grammar } from './grammar.js';
import { writeFile } from 'node:fs/promises';
import { readFile } from 'node:fs/promises';


async function writeToFile(filename, data) {
  try {
    await writeFile(filename, data, 'utf8');
    console.log(`Data written to file successfully: ${filename}`);
  } catch (error) {
    console.error('Failed to write to file:', error.message);
    throw error;
  }
}

async function readFromFile(filename) {
	const lines = [];
	const allFileContents = await readFile(filename, 'utf-8');
	allFileContents.split(/\r?\n/).forEach(line =>  {
	  lines.push(line);
	});
	return lines;
}

// const parser = new Lark(grammar, { start: 'start' });

function extractMetrics(response, prompt) {
	const latency = response.completed_at - response.created_at;
	const total_tokens = response.usage.total_tokens;

	var status = response.status.toUpperCase();
	var model_response = "";

	if(response.output.length === 0 || !response.output[response.output.length - 1].input) {
		status = "TOOL_FAILED_TO_CALL";
	} else {
		model_response = response.output[response.output.length - 1].input;
	}

	// try {
	// 	parser.parse(response.output[response.output.length - 1].input);
	// } catch (e) {
	// 	status = "TOOL_HALLUCINATION";
	// }

	const id = response.id;
	return {
		id: id,
		prompt: prompt,
		latency: latency,
		total_tokens: total_tokens,
		status: status,
		model_response: model_response,
	}
}


var count = 0 // to show how many prompts are already run and measure progress
const metricsList = [];

const prompts = await readFromFile('test_prompts.txt');
for (var prompt of prompts) {
	try {
		//console.log("Executing Prompt \n": prompt + "\n");
		process.stdout.write("Executing Prompt: "+ prompt + "\n");
		process.stdout.write("Completed: "+ count + "/" + prompts.length)

		const response =  await generateQuery(prompt, mysql_grammar, true /* eval mode is true */);
		const metrics = extractMetrics(response, prompt);
		metricsList.push(metrics);

		process.stdout.clearLine();
    	process.stdout.cursorTo(0);
    	count = count + 1;
	} catch (error) {
		console.log(error);
		metricsList.push({status: "GENERATION_FAILED"});
	}
}

writeToFile('metrics.json', JSON.stringify(metricsList));

process.stdout.write("Completed: "+ count + "/" + prompts.length + "\n");
console.log('Done!');

