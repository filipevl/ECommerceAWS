import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";

export const handler = async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
    
    const { resource, httpMethod, requestContext } = event;
	const { awsRequestId } = context;
    const { requestId: apiRequestId } = requestContext;

    console.log(`API Gateway RequestId: ${apiRequestId} - Lambda RequestId: ${awsRequestId}`)

	if (resource === "/products") {
		if (httpMethod === "GET") {
			console.log("GET");

			return {
				statusCode: 200,
				body: JSON.stringify({
                    message: "Get Products - OK",
                }),
			};
		}
	}

	return {
		statusCode: 404,
		body: JSON.stringify({
			message: "Path not found",
		}),
	};
};
