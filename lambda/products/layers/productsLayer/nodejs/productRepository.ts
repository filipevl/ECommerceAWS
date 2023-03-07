import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { v4 as uuid } from "uuid";

export interface Product {
	id: string;
	productName: string;
	code: number;
	model: string;
	price: number;
	productUrl: string;
}

export class ProductRepository {
	constructor(private ddbClient: DocumentClient, private productsDdb: string) {}

	async getAll(): Promise<Product[]> {
		const { Items } = await this.ddbClient
			.scan({
				TableName: this.productsDdb,
			})
			.promise();

		return Items as Product[];
	}

	async getById(productId: string): Promise<Product> {
		const { Item } = await this.ddbClient
			.get({
				TableName: this.productsDdb,
				Key: {
					id: productId,
				},
			})
			.promise();
		if (!Item) {
			throw new Error(`Product ${productId} not found`);
		}

		return Item as Product;
	}

	async create(product: Product): Promise<Product> {
		product.id = uuid();
		await this.ddbClient
			.put({
				TableName: this.productsDdb,
				Item: product,
			})
			.promise();

		return product;
	}

	async deleteById(productId: string): Promise<Product> {
		const { Attributes } = await this.ddbClient
			.delete({
				TableName: this.productsDdb,
				Key: {
					id: productId,
				},
				ReturnValues: "ALL_OLD",
			})
			.promise();

		if (!Attributes) {
			throw new Error(`Product ${productId} not found`);
		}

		return Attributes as Product;
	}

	async updateProduct(productId: string, product: Product): Promise<Product> {

        const { code, model, price, productName, productUrl } = product;

		const { Attributes } = await this.ddbClient
			.update({
				TableName: this.productsDdb,
				Key: {
					id: productId,
				},
				ConditionExpression: "attribute_exists(id)",
				ReturnValues: "UPDATED_NEW",
                UpdateExpression: "set productName = :n, code = :c, price = :p, model = :m, productUrl = :u",
                ExpressionAttributeValues: {
                    ":c": code,
                    ":m": model,
                    ":p": price,
                    ":n": productName,
					":u": productUrl
                }
			})
			.promise();

		if (!Attributes) {
			throw new Error(`Product ${productId} not found`);
		}

		Attributes!.id = productId;

		return Attributes as Product;
	}
}
