from dotenv import load_dotenv
import json
import os
import argparse
from dataclasses import dataclass
from typing import List
from lark import Lark, exceptions
import clickhouse_connect
import pandas as pd

# Load env vars from root .env
load_dotenv(os.path.join(os.path.dirname(__file__), '../.env'))

@dataclass
class ModelResponse:
    id: str
    prompt: str
    latency: int
    total_tokens: int
    status: str
    model_response: str

    # Helper method to print the object neatly
    def __repr__(self):
        return f"<ModelResponse ID: {self.id[:8]}... | Status: {self.status} | Latency: {self.latency}ms>"

class Evaluator:
    def __init__(self, grammar_path: str):
        self.db_client = self._init_db()
        self.parser = self._init_parser(grammar_path)

    def _init_db(self):
        host = os.getenv('TINYBIRD_URL', 'https://clickhouse.us-east.tinybird.co').replace('https://', '')
        # Handle trailing slashes or protocol differences if necessary
        return clickhouse_connect.get_client(
            interface='https',
            host=host,
            username=os.getenv('TINYBIRD_USERNAME', 'default'),
            password=os.getenv('TINYBIRD_PASSWORD'),
            port=443,
        )

    def _init_parser(self, grammar_path: str):
        try:
            with open(grammar_path, 'r', encoding='utf-8') as f:
                grammar = f.read()
            return Lark(grammar, start='start')
        except Exception as e:
            print(f"Failed to load grammar: {e}")
            return None

    def query_data_source(self, query: str):
        try:
            # Basic sanitization
            if not query or query.strip() == "":
                return None
            result = self.db_client.query(query)
            return pd.DataFrame(result.result_rows, columns=result.column_names)
        except Exception as e:
            # print(f"DB Query Failed: {e}")
            return None

    def is_valid_grammar(self, query: str) -> bool:
        if not self.parser: return False
        try:
            self.parser.parse(query)
            return True
        except exceptions.LarkError:
            return False

    def compare_data(self, df1: pd.DataFrame, df2: pd.DataFrame) -> bool:
        if df1 is None or df2 is None:
            return False
        return data_from_model_query.equals(data_from_ground_truth)

def load_metrics(filepath: str) -> List[ModelResponse]:
    try:
        with open(filepath, 'r', encoding='utf-8') as file:
            data_list = json.load(file)
            return [ModelResponse(**item) for item in data_list]

    except FileNotFoundError:
        print(f"Error: The file '{filepath}' was not found.")
        return []
    except json.JSONDecodeError:
        print("Error decoding JSON. The file format might be invalid.")
        return []
    except Exception as e:
	    print(f"An error occurred: {e}")

def load_ground_truth(filepath): 
	try:
		with open(filepath, 'r', encoding='utf-8') as file:
			return [line.rstrip() for line in file]
	except FileNotFoundError:
	    print(f"Error: The file '{filepath}' was not found.")
	except Exception as e:
	    print(f"An error occurred: {e}")

def main():
	parser = argparse.ArgumentParser(description="Run evals on generated SQL queries.")
	parser.add_argument("--metrics", default="metrics.json", help="Path to metrics.json")
	parser.add_argument("--truth", default="test_prompts_ground_truth.txt", help="Path to ground truth SQL")
	parser.add_argument("--grammar", default="../mysql_grammar.lark", help="Path to grammar file (Note: python lark expects lark format, ensure file compat)")

	args = parser.parse_args()


	# Determine absolute paths
	base_dir = os.path.dirname(__file__)
	metrics_path = os.path.join(base_dir, args.metrics)
	truth_path = os.path.join(base_dir, args.truth)
	grammar_path = os.path.join(base_dir, args.grammar) 


	evaluator = Evaluator(grammar_path)
	metrics = load_metrics(metrics_path)
	ground_truth = load_ground_truth(truth_path)

	if len(metrics) != len(ground_truth):
	    print(f"Warning: Mismatch in count. Metrics: {len(metrics)}, Truth: {len(ground_truth)}")

	stats = {
	    "total": len(metrics),
	    "completed": 0,
	    "valid_grammar": 0,
	    "factually_correct": 0,
	    "tool_failure": 0,
	    "gen_failure": 0,
	    "total_latency": 0,
	    "total_tokens": 0
	}

	print(f"\nRunning evaluations on {len(metrics)} records...\n")

	for i, record in enumerate(metrics):
		stats["total_latency"] += record.latency
		stats["total_tokens"] += record.total_tokens


		if record.status == "COMPLETED":
			stats["completed"] += 1
	        
	        # 1. Grammar Check
			if evaluator.is_valid_grammar(record.model_response):
			    stats["valid_grammar"] += 1
			    
			    # 2. Data Accuracy Check
			    try:
			        model_df = evaluator.query_data_source(record.model_response)
			        truth_df = evaluator.query_data_source(ground_truth[i])
			        
			        if evaluator.compare_data(model_df, truth_df):
			            stats["factually_correct"] += 1
			    except:
			    	continue
		elif record.status == "TOOL_FAILED_TO_CALL":
		    stats["tool_failure"] += 1
		else:
		    stats["gen_failure"] += 1

	print("-" * 30)
	print("Performance Metric")
	print("-" * 30)

	acc = stats["factually_correct"] / (stats["total"] if stats["total"] else 0)
	print(f"Accuracy (% of all generations that are factually right): {acc:.2%} of total generations\n")


	print("-" * 30)
	print("Reliability & Quality")
	print("-" * 30)
	hallucination_rate = 0
	if stats["completed"] > 0:
	    hallucination_rate = (stats["completed"] - stats["valid_grammar"]) / stats["completed"]
	print(f"Hallucinations (% of completed generations that are invalid sql grammar i.e. nonsensical): {hallucination_rate:.2%}\n")

	print("-" * 30)
	print("Agent Specific Metric")
	print("-" * 30)
	tool_usage_rate = 0
	valid_attempts = stats["total"] - stats["gen_failure"]
	if valid_attempts > 0:
	    tool_usage_rate = stats["completed"] / valid_attempts
	print(f"Tools Usage (% of attempted calls in which the model called a custom tool): {tool_usage_rate:.2%}\n")

	print("-" * 30)
	print("Efficency and Cost Metrics")
	print("-" * 30)
	print(f"Average Latency across all calls: {stats['total_latency'] / stats['total']:.2f} ms")
	print(f"Average input+output token count across all calls: {stats['total_tokens'] / stats['total']:.2f}\n")

if __name__ == "__main__":
    main()

