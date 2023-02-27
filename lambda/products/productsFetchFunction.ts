import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";

export const handler = async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
	const { resource, httpMethod, requestContext, pathParameters } = event;
	const { awsRequestId } = context;
	const { requestId: apiRequestId } = requestContext;

	console.log(`API Gateway RequestId: ${apiRequestId} - Lambda RequestId: ${awsRequestId}`);
	if (resource === "/products") {
		console.log("GET products");

		return {
			statusCode: 200,
			body: JSON.stringify({
				message: "Get Products - OK",
			}),
		};
	} else if (resource === "/products/{id}") {
		const productId = pathParameters!.id as string;
		console.log(`GET product by id: ${productId} `);

		return {
			statusCode: 200,
			body: JSON.stringify({
				message: `GET product by id: ${productId} `,
			}),
		};
	}

	return {
		statusCode: 404,
		body: JSON.stringify({
			message: "Path not found",
		}),
	};
};
