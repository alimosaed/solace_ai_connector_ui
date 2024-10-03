import os
import subprocess
import yaml
from flask import Flask, request, jsonify
from flask_cors import CORS 

app = Flask(__name__)
CORS(app)

@app.route('/execute', methods=['POST'])
def execute():
    try:
        # Get the YAML data from the request
        yaml_data = request.data.decode('utf-8')
        
        # Validate if it's a proper YAML
        try:
            parsed_yaml = yaml.safe_load(yaml_data)
        except yaml.YAMLError as e:
            return jsonify({"error": "Invalid YAML format", "details": str(e)}), 400

        # Save the YAML data to a file
        file_path = 'workflow.yaml'
        with open(file_path, 'w') as file:
            file.write(yaml_data)

        # Run the command in the background
        command = f'solace-ai-connector {file_path}'
        process = subprocess.Popen(command, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

        # Optional: Read initial output or log process PID
        return jsonify({"message": "YAML file saved and command executed in the background.", "pid": process.pid}), 200

    except Exception as e:
        return jsonify({"error": "An error occurred", "details": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8070)
