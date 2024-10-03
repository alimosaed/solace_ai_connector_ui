[![npm](https://img.shields.io/npm/v/drawflow?color=green)](https://www.npmjs.com/package/drawflow)
![npm](https://img.shields.io/npm/dy/drawflow)
![npm bundle size](https://img.shields.io/bundlephobia/minzip/drawflow)
[![GitHub license](https://img.shields.io/github/license/jerosoler/Drawflow)](https://github.com/jerosoler/Drawflow/blob/master/LICENSE)
[![Twitter URL](https://img.shields.io/twitter/url?style=social&url=https%3A%2F%2Ftwitter.com%2Fjerosoler)](https://twitter.com/jerosoler)
# Solace AI Flow

![Demo](static/drawflow.gif)

Solace AI Flow enables you to effortlessly create and run AI and data flows using the Solace AI Connector.

## Features
- **No Code, Drag & Drop**: Design AI and data flows effortlessly without needing any programming skills or knowledge of the Solace AI Connector and Solace broker.
- **Support Multiple Flows**: Create and connect multiple data flows using the Solace broker.
- **Scalability**: Easily add new agents through the user interface to support more complex AI use cases.
- **One-Click Deployment**: Deploy and run workflows with a single click.
- **Extract and upload workflows**: Save workflows for future use by extracting and uploading them as needed.

## Installation
Clone the repository.
```
  git clone https://github.com/alimosaed/solace_ai_connector_ui.git
```

### Setup the web server.
- (Optional) Create a Python environment
```
  python -m venv venv
  source venv/bin/activate
```

- Setup the required Python packages.
```
  pip install -r requirements.txt
```

- Run server
```
  cd server
  python server.py
```

### Setup the Solace AI Connector
Follow [Solace AI Connector](https://github.com/SolaceDev/solace-ai-connector/blob/main/docs/getting_started.md) instruction and install the Solace PubSub+ Event Broker and Solace AI Connector.

### Render Frontend
Open the index.html file from docs folder on the browser.

## License
MIT License
