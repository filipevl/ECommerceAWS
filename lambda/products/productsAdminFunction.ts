import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import { Product, ProductRepository } from "/opt/nodejs/productsLayer";
import { DocumentClient } from "aws-sdk/clients/dynamodb";

const productsDdb = process.env.PRODUCTS_DDB!;
const ddbClient = new DocumentClient();

const productNotFoundError = (more?:any) => {
	return {
		statusCode: 400,
		body: JSON.stringify({
			message: "Product not found",
			...more
		}),
	};
}

const productRepository = new ProductRepository(ddbClient, productsDdb);

export const handler = async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
	const { resource, httpMethod, requestContext, body } = event;
	const { awsRequestId } = context;
	const { requestId: apiRequestId } = requestContext;

	console.log(`API Gateway RequestId: ${apiRequestId} - Lambda RequestId: ${awsRequestId}`);

	if (resource === "/products") {
		console.log("POST /products");
		const product = JSON.parse(body!) as Product;
		try{
			const productCreated = await productRepository.create(product);
	
			return {
				statusCode: 201,
				body: JSON.stringify(productCreated),
			};
		}catch(error){
			return {
				statusCode: 500,
				body: JSON.stringify(error)
			}
		}
	} else if (resource === "/products/{id}") {
		const productId = event.pathParameters!.id as string;
		
		if (httpMethod === "GET") {
			console.log(`GET product by id: ${productId} `);
			try{
				const productFounded = await productRepository.getById(productId)
				return {
					statusCode: 202,
					body: JSON.stringify(productFounded),
				};
			}catch(error){
				return {
					statusCode: 404,
					body: JSON.stringify(error)
				}
			}
		}
		if (httpMethod === "PUT") {
			console.log(`PUT product by id: ${productId} `);
			const product = JSON.parse(body!) as Product;
			try{
				const productUpdated = await productRepository.updateProduct(productId, product);
				return {
					statusCode: 202,
					body: JSON.stringify(productUpdated),
				};
			}catch(error){
				return {
					statusCode: 400,
					body: JSON.stringify(error)
				}
			}
			
		} else if (httpMethod === "DELETE") {
			console.log(`DELETE product by id: ${productId} `);
			try{
				const deletedProduct = await productRepository.deleteById(productId);
				return {
					statusCode: 200,
					body: JSON.stringify(deletedProduct),
				};
			}catch(error){
				return {
					statusCode: 400,
					body: JSON.stringify(error)
				}
			}
		}
	}

	return {
		statusCode: 404,
		body: JSON.stringify({
			message: "Path not found",
		}),
	};
};
