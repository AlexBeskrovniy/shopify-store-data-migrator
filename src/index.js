import 'dotenv/config';
import '@shopify/shopify-api/adapters/node';
import { shopifyApi, ApiVersion, Session } from "@shopify/shopify-api";

export const shopify = shopifyApi({
    apiSecretKey: process.env.API_SECRET_KEY,
    apiVersion: ApiVersion.July23,
    isCustomStoreApp: true,
    isEmbeddedApp: false,
    adminApiAccessToken: process.env.ACCESS_TOKEN,
    scopes: ['read_products', 'write_products', 'write_metaobjects', 'read_metaobjects'],
    hostName: process.env.SHOP_NAME
  });