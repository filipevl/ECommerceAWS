import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Stack, StackProps, Duration, RemovalPolicy } from "aws-cdk-lib";
import { AttributeType, BillingMode, Table } from "aws-cdk-lib/aws-dynamodb";

import { Construct } from "constructs";
import { StringParameter } from "aws-cdk-lib/aws-ssm";
import { LayerVersion, Tracing } from "aws-cdk-lib/aws-lambda";

export class ProductsAppStack extends Stack {
	readonly productsFetchHandler: NodejsFunction;
	readonly productsDdb: Table;
	readonly productsAdminHandler: NodejsFunction;

	constructor(scope: Construct, id: string, props?: StackProps) {
		super(scope, id, props);

		this.productsDdb = new Table(this, "ProductsDdb", {
			tableName: "products",
			removalPolicy: RemovalPolicy.DESTROY,
			partitionKey: {
				name: "id",
				type: AttributeType.STRING,
			},
			billingMode: BillingMode.PROVISIONED,
			readCapacity: 1,
			writeCapacity: 1,
		});

		const productsLayerArn = StringParameter.valueForStringParameter(this, "ProductsLayerVersionArn");
		const productsLayer = LayerVersion.fromLayerVersionArn(this, "ProductsLayerVersionArn", productsLayerArn)

		this.productsFetchHandler = new NodejsFunction(this, "ProductsFetchFunction", {
			entry: "lambda/products/productsFetchFunction.ts",
			functionName: "ProductsFetchFunction",
			handler: "handler",
			memorySize: 128,
			timeout: Duration.seconds(5),
			bundling: {
				minify: true,
				sourceMap: false,
			},
			environment: {
				PRODUCTS_DDB: this.productsDdb.tableName
			},
			layers: [productsLayer],
			tracing: Tracing.ACTIVE
		});

		this.productsDdb.grantReadData(this.productsFetchHandler)

		this.productsAdminHandler = new NodejsFunction(this, "ProductsAdminFunction", {
			entry: "lambda/products/productsAdminFunction.ts",
			functionName: "ProductsAdminFunction",
			handler: "handler",
			memorySize: 128,
			timeout: Duration.seconds(5),
			bundling: {
				minify: true,
				sourceMap: false,
			},
			environment: {
				PRODUCTS_DDB: this.productsDdb.tableName
			},
			layers: [productsLayer],
			tracing: Tracing.ACTIVE
		});

		this.productsDdb.grantWriteData(this.productsAdminHandler)
	}
}
