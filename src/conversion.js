// Assuming the 'js-yaml' library is included in your HTML (e.g., via a <script> tag)
// <script src="https://cdn.jsdelivr.net/npm/js-yaml@4.1.0/dist/js-yaml.min.js"></script>

// Function to convert JSON workflow to YAML
async function convertJsonToYaml(drawflow, save) {
    const flows = []
    var components = [];
    
    // Extract components from the workflow
    const data = drawflow.drawflow.Home.data;
    for (const key in data) {
        const component = data[key];
        let componentName, componentModule;
        
        // Define component names and modules based on their class/type
        if (component.class === 'input') {
            componentName = 'stdin';
            componentModule = 'stdin_input';
            components.push({
                component_name: componentName,
                component_module: componentModule
            });
        } else if (component.class === 'output') {
            componentName = 'stdout';
            componentModule = 'stdout_output';
            components.push({
                component_name: componentName,
                component_module: componentModule
            });
            // add the flow and reset components
            flows.push(
                {
                    name: 'sample workflow',
                    components: components
                }
            )
            components = []
        } else if (component.class == 'broker_input') {
            // Check if the component is of class 'broker_input'
            const fields = component.data;
        
            // Extract values using custom attributes (df-*)
            const componentName = fields.component?.name || 'default_component_name';
            const topic = fields.topic ? fields.topic : 'default/topic';
            const qos = fields.qos ? fields.qos : '1';
            const brokerQueueName = fields.queue?.name || 'default_queue_name';
        
            // Set default values for additional fields
            const componentModule = 'broker_input';
            const payloadEncoding = 'utf-8';
            const payloadFormat = 'json';
        
            // Store extracted details in an object
            const brokerDetails = {
                component_name: componentName,
                component_module: componentModule,
                component_config: {
                    broker_type: 'solace',
                    broker_url: '${SOLACE_BROKER_URL}', // Replace with actual URL or set dynamically
                    broker_username: '${SOLACE_BROKER_USERNAME}', // Replace with actual username or set dynamically
                    broker_password: '${SOLACE_BROKER_PASSWORD}', // Replace with actual password or set dynamically
                    broker_vpn: '${SOLACE_BROKER_VPN}', // Replace with actual VPN or set dynamically
                    broker_queue_name: brokerQueueName,
                    broker_subscriptions: [
                        {
                            topic: topic,
                            qos: parseInt(qos)
                        }
                    ],
                    payload_encoding: payloadEncoding,
                    payload_format: payloadFormat
                }
            };
        
            components.push(brokerDetails);
        } else if (component.class == 'broker_output') {
            // Check if the component is of class 'broker_output'
            const fields = component.data;
        
            // Extract values using custom attributes (df-*)
            const componentName = fields.component?.name || 'default_component_name';
            const topic = fields.topic ? `template:${fields.topic}` : 'template: default/topic';
        
            // Set default values for additional fields
            const componentModule = 'broker_output';
            const payloadEncoding = 'utf-8';
            const payloadFormat = 'json';
            const copyUserProp = true;
        
            // Store extracted details in an object
            const brokerDetails = {
                component_name: componentName,
                component_module: componentModule,
                component_config: {
                    broker_type: 'solace',
                    broker_url: '${SOLACE_BROKER_URL}', // Replace with actual URL or set dynamically
                    broker_username: '${SOLACE_BROKER_USERNAME}', // Replace with actual username or set dynamically
                    broker_password: '${SOLACE_BROKER_PASSWORD}', // Replace with actual password or set dynamically
                    broker_vpn: '${SOLACE_BROKER_VPN}', // Replace with actual VPN or set dynamically
                    payload_encoding: payloadEncoding,
                    payload_format: payloadFormat,
                    copy_user_properties: copyUserProp,
                },
                input_transforms: [
                    {
                        type: 'copy',
                        source_expression: 'previous',
                        dest_expression: 'user_data.output:payload',
                    },
                    {
                        type: 'copy',
                        source_expression: topic,
                        dest_expression: 'user_data.output:topic',
                    },
                ],
                input_selection: {
                    source_expression: 'user_data.output',
                },
            };
        
            components.push(brokerDetails);
            // add the flow and reset components
            flows.push(
                {
                    name: 'sample workflow',
                    components: components
                }
            )
            components = []
        } else if (component.class === 'openai_chat_model') {
            // Check if the component is of class 'openai_chat_model'
            const fields = component.data;
        
            // Extract values using custom attributes (df-*)
            const componentName = fields.component?.name || 'default_component_name';
            const temperature = fields.temperature? parseFloat(fields.temperature) : 0.01;
            const sourceExpression = fields.query || 'default_source_expression';
        
            // Set default values for additional fields
            const componentModule = 'openai_chat_model';
            const apiKey = '${OPENAI_API_KEY}';
            const baseUrl = '${OPENAI_API_ENDPOINT}';
            const model = '${OPENAI_MODEL_NAME}';
        
            // Store extracted details in an object
            const llmRequestDetails = {
                component_name: componentName,
                component_module: componentModule,
                component_config: {
                    api_key: apiKey,
                    base_url: baseUrl,
                    model: model,
                    temperature: temperature,
                },
                input_transforms: [
                    {
                        type: 'copy',
                        source_expression: `template:You are a helpful AI assistant. Please help with the user's request below:
                            <user-question>
                            ${sourceExpression}
                            </user-question>`,
                        dest_expression: 'user_data.llm_input:messages.0.content',
                    },
                    {
                        type: 'copy',
                        source_expression: 'static:user',
                        dest_expression: 'user_data.llm_input:messages.0.role',
                    },
                ],
                input_selection: {
                    source_expression: 'user_data.llm_input',
                },
            };
        
            components.push(llmRequestDetails);
        } else if (component.class === 'langchain_openai') {
            // Check if the component is of class 'openai_chat_model'
            const fields = component.data;
        
            // Extract values using custom attributes (df-*)
            const componentName = fields.component?.name || 'chat_request_llm';
            const temperature = fields.temperature? parseFloat(fields.temperature) : 0.01;
            const prompt = fields.prompt || "You are a helpful AI assistant. Please help with the user's request:";
        
            // Set default values for additional fields
            const componentModule = 'langchain_chat_model_with_history';
            const apiKey = '${OPENAI_API_KEY}';
            const baseUrl = '${OPENAI_API_ENDPOINT}';
            const model = fields.model || 'azure-gpt-4o';

            // Set history
            const historyLength = parseInt(fields.history?.length) || 6000;
        
            // Store extracted details in an object
            const llmRequestDetails = {
                component_name: componentName,
                component_module: componentModule,
                component_config: {
                    langchain_module: 'langchain_openai',
                    langchain_class: 'ChatOpenAI',
                    langchain_component_config: {
                        api_key: apiKey,
                        base_url: baseUrl,
                        model: model,
                        temperature: temperature
                    },
                    history_module: 'langchain_core.chat_history',
                    history_class: 'InMemoryChatMessageHistory',
                    history_max_turns: 20,
                    history_max_length: historyLength
                },
                input_transforms: [
                    {
                        type: 'copy',
                        source_expression: `template:${prompt}. The below is the user question:
                            <user-question>
                            {{text://input.payload}}
                            </user-question>`,
                        dest_expression: 'user_data.llm_input:messages.0.content',
                    },
                    {
                        type: 'copy',
                        source_expression: 'static:user',
                        dest_expression: 'user_data.llm_input:messages.0.role',
                    },
                ],
                input_selection: {
                    source_expression: 'user_data.llm_input',
                },
            };
        
            components.push(llmRequestDetails);
        } else if (component.class === 'web_search') {
            // Check if the component is of class 'web_search'
            const fields = component.data;
        
            // Extract values using custom attributes (df-*)
            const componentName = fields.component?.name || 'web_search';
            const engine = fields.engine?fields.engine : 'duckduckgo';

            detail = false
            if(fields.detail) {
                detail = true
            }
        
            // Set default values for additional fields
            switch(engine) {
                case 'duckduckgo':
                    componentModule = 'websearch_duckduckgo';
                    webRequestDetails = {
                        component_name: componentName,
                        component_module: componentModule,
                        component_config: {
                            engine: engine,
                            detail: detail,
                        },
                        input_selection: {
                            source_expression: 'previous:payload',
                        },
                    };
                    break;
                case 'google':
                    componentModule = 'websearch_google';
                    webRequestDetails = {
                        component_name: componentName,
                        component_module: componentModule,
                        component_config: {
                            engine: engine,
                            api_key: 'AIzaSyA7kKgIBK_Clw-HFb_YZYSxwQgKEX1rza8',
                            search_engine_id: 'd244da49663d44d5e',
                            detail: detail,
                        },
                        input_selection: {
                            source_expression: 'previous:payload',
                        },
                    };
                    break;
                case 'bing':
                    componentModule = 'websearch_bing';
                    break;
                default:
                    componentModule = 'websearch_duckduckgo';
                    webRequestDetails = {
                        component_name: componentName,
                        component_module: componentModule,
                        component_config: {
                            engine: engine,
                            detail: detail,
                        },
                        input_selection: {
                            source_expression: 'previous:payload',
                        },
                    };
            }
        
            components.push(webRequestDetails);
        }
    }

    // Construct the final YAML flow structure
    const yamlFlow = {
        log: {
            stdout_log_level: 'INFO',
            log_file_level: 'DEBUG',
            log_file: 'solace_ai_connector.log'
        },

        flows: flows
    };

    // Convert to YAML
    const yamlStr = jsyaml.dump(yamlFlow);

    // Save to a file (using browser-based download if `save` is true)
    if (save) {
        const blob = new Blob([yamlStr], { type: 'text/yaml' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'workflow.yaml';
        link.click();
        URL.revokeObjectURL(link.href);
        console.log('YAML file created successfully!');
    }

    try {
        // Make a POST request to the Flask API
        const response = await fetch('http://localhost:8070/execute', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-yaml', // Set content type
            },
            body: yamlStr // Send the YAML string as the body
        });

        // Handle the response
        if (response.ok) {
            const result = await response.json();
            console.log('Success:', result.message);
        } else {
            const error = await response.json();
            console.error('Error:', error.details);
        }
    } catch (error) {
        console.error('Error:', error);
    }

    return yamlStr;
}
