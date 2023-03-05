#!/usr/bin/env node
import "dotenv/config";
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { ProductsAppStack } from "../lib/productsApp-stack";
import { EcommerceApiStack } from "../lib/ecommerceAPI-stack";
import { ProductsAppLayersStack } from "../lib/productsAppLayers-stack";

const app = new cdk.App();

const env: cdk.Environment = {
	account: process.env.ACCOUNT,
	region: "us-east-1",
};

const tags = {
	cost: "ECommerce",
};

const productsAppLayersStack = new ProductsAppLayersStack(app, "ProductsAppLayersStack", {
	tags,
	env
})

const productsAppStack = new ProductsAppStack(app, "ProductsApp", {
	tags,
	env,
});

productsAppStack.addDependency(productsAppLayersStack)

const ecommerceApiStack = new EcommerceApiStack(app, "EcommerceAPI", {
	productsFetchHandler: productsAppStack.productsFetchHandler,
	productsAdminHandler: productsAppStack.productsAdminHandler,
	tags,
	env,
});
ecommerceApiStack.addDependency(productsAppStack);
