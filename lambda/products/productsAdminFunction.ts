import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import { ProductRepository } from "/opt/nodejs/productsLayer";
import { DocumentClient } from "aws-sdk/clients/dynamodb";

const productsDdb = process.env.PRODUCTS_DDB!
const ddbClient = new DocumentClient()

const productRepository = new ProductRepository(ddbClient, productsDdb)

export const handler = async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
	const { resource, httpMethod, requestContext } = event;
	const { awsRequestId } = context;
	const { requestId: apiRequestId } = requestContext;

	console.log(`API Gateway RequestId: ${apiRequestId} - Lambda RequestId: ${awsRequestId}`);

	if (resource === "/products") {
		console.log("POST /products");
		return {
			statusCode: 201,
			body: JSON.stringify({
				message: "Product created at" + Date.now(),
			}),
		};
	} else if (resource === "/products/{id}") {
		const productId = event.pathParameters!.id as string;
		if (httpMethod === "GET") {
			console.log(`GET product by id: ${productId} `);
			return {
				statusCode: 202,
				body: JSON.stringify({
					message: `GET product by id: ${productId} `,
				}),
			};
		}
		if (httpMethod === "PUT") {
			console.log(`PUT product by id: ${productId} `);
			return {
				statusCode: 202,
				body: JSON.stringify({
					message: `PUT product by id: ${productId} `,
				}),
			};
		} else if (httpMethod === "DELETE") {
			console.log(`DELETE product by id: ${productId} `);
			return {
				statusCode: 200,
				body: JSON.stringify({
					message: `DELETE product by id: ${productId} `,
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
