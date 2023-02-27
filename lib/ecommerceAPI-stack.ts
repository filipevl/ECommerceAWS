import * as cdk from "aws-cdk-lib";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as cwlogs from "aws-cdk-lib/aws-logs";
import { Construct } from "constructs";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";

interface EcommerceApiStackProps extends cdk.StackProps {
	productsFetchHandler: NodejsFunction;
	productsAdminHandler: NodejsFunction;
}

export class EcommerceApiStack extends cdk.Stack {
	constructor(scope: Construct, id: string, props: EcommerceApiStackProps) {
		super(scope, id, props);

		const logGroup = new cwlogs.LogGroup(this, "ECommerceApiLogs");

		const api = new apigateway.RestApi(this, "ECommerceApi", {
			restApiName: "ECommerceRestApi",
			cloudWatchRole: true,
			deployOptions: {
				accessLogDestination: new apigateway.LogGroupLogDestination(logGroup),
				accessLogFormat: apigateway.AccessLogFormat.jsonWithStandardFields({
					httpMethod: true,
					ip: false,
					protocol: true,
					requestTime: true,
					resourcePath: true,
					responseLength: true,
					status: true,
					caller: true,
					user: false,
				}),
			},
		});

		const productsFetchIntegration = new apigateway.LambdaIntegration(props.productsFetchHandler);
		const productsAdminIntegration = new apigateway.LambdaIntegration(props.productsAdminHandler);

		const productsResource = api.root.addResource("products");
		const productsIdResource = productsResource.addResource("{id}");

		productsResource.addMethod("GET", productsFetchIntegration);
		productsResource.addMethod("POST", productsAdminIntegration);
		productsIdResource.addMethod("GET", productsAdminIntegration);
		productsIdResource.addMethod("PUT", productsAdminIntegration);
		productsIdResource.addMethod("DELETE", productsAdminIntegration);
	}
}
