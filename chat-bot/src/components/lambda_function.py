import boto3
import json

# Initialize Bedrock client
bedrock = boto3.client(
    service_name='bedrock-runtime',
    region_name='us-east-1'
)

modelId = 'anthropic.claude-3-sonnet'

def lambda_handler(event, context):
    try:
       
        requestBody = json.loads(event['body'])
        prompt = requestBody['prompt']

        body = {
            'prompt': prompt,
            'max_tokens_to_sample': 200,  
            'temperature': 1,  
            'top_p': 1, 
            'top_k': 250,  
            'stop_sequences': []
        }

        
        bedrockResponse = bedrock.invoke_model(
            modelId=modelId,
            body=json.dumps(body),
            accept='*/*',
            contentType='application/json'
        )

       
        response_data = json.loads(bedrockResponse['body'].read())
        response_text = response_data.get('completion', '') 

        apiResponse = {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'prompt': prompt,
                'response': response_text
            })
        }

        return apiResponse

    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'error': str(e)
            })
        }
