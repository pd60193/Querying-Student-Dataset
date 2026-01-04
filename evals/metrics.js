import 'dotenv/config';
import { generateQuery } from '../services/openai.js';
import { mysql_grammar } from '../services/grammar.js';
import { writeFile, readFile } from 'node:fs/promises';

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
	allFileContents.split(/\r?\n/).forEach(line => {
		lines.push(line);
	});
	return lines;
}

function extractMetrics(response, prompt) {
	const latency = response.completed_at - response.created_at;
	const total_tokens = response.usage.total_tokens;

	var status = response.status.toUpperCase();
	var model_response = '';

	if (response.output.length === 0 || !response.output[response.output.length - 1].input) {
		status = 'TOOL_FAILED_TO_CALL';
	} else {
		model_response = response.output[response.output.length - 1].input;
	}

	const id = response.id;
	return {
		id: id,
		prompt: prompt,
		latency: latency,
		total_tokens: total_tokens,
		status: status,
		model_response: model_response,
	};
}

async function runGen() {
	const promptsFile = 'test_prompts.txt';
	const outputFile = 'metrics.json';

	let prompts = [];
	try {
		prompts = await readFromFile(promptsFile, 'utf-8');
	} catch (e) {
		console.error(`Could not read ${promptsFile}`);
		process.exit(1);
	}

	const metricsList = [];
	let count = 0;

	console.log(`Starting generation for ${prompts.length} prompts...`);

	for (var prompt of prompts) {
		count = count + 1;
		process.stdout.write(`[${count}/${prompts.length}] processing... `);
		try {
			const response = await generateQuery(prompt, mysql_grammar, true /* eval mode is true */);
			const metrics = extractMetrics(response, prompt);
		} catch (error) {
			console.log(error);
			metricsList.push({ status: 'GENERATION_FAILED' });
		}
		metricsList.push(metrics);
		process.stdout.clearLine();
		process.stdout.cursorTo(0);
	}
	await writeToFile(outputFile, JSON.stringify(metricsList, null, 2));
	console.log(`\nMetrics saved to ${outputFile}`);
}

runGen();