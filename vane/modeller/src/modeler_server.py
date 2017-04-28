from flask import Flask, request
import json
app = Flask(__name__)

@app.route("/", methods=["POST"])
def run_model():
	print("Got POST content with length {}".format(len(request.data)))
	print("Got {} nodes".format(len(request.json["nodes"])))
	print("Got {} links".format(len(request.json["links"])))
	print("Got {} demands".format(len(request.json["demands"])))

	output = {"routes":[], "capacities":[]}

	return json.dumps(output)

if __name__ == "__main__":
    app.run()
