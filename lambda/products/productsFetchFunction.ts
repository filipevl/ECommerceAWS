import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import { ProductRepository } from "/opt/nodejs/productsLayer";
import { DocumentClient } from "aws-sdk/clients/dynamodb";

const productsDdb = process.env.PRODUCTS_DDB!;
const ddbClient = new DocumentClient();

const productRepository = new ProductRepository(ddbClient, productsDdb);

export const handler = async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
	const { resource, requestContext, pathParameters } = event;
	const { awsRequestId } = context;
	const { requestId: apiRequestId } = requestContext;

	console.log(`API Gateway RequestId: ${apiRequestId} - Lambda RequestId: ${awsRequestId}`);
	if (resource === "/products") {
		console.log("GET products");

		return {
			statusCode: 200,
			body: JSON.stringify(await productRepository.getAll()),
		};
	} else if (resource === "/products/{id}") {
		const productId = pathParameters!.id as string;
		const product = await productRepository.getById(productId).catch((error: Error) => {
			console.error(error.message);
			return {
				statusCode: 404,
				body: error.message,
			};
		});
		console.log(`GET product by id: ${productId} `);

		return {
			statusCode: 200,
			body: JSON.stringify(product),
		};
	}

	return {
		statusCode: 404,
		body: JSON.stringify({
			message: "Path not found",
		}),
	};
};
