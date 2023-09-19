import 'dotenv/config';
import '@shopify/shopify-api/adapters/node';
import { shopifyApi, ApiVersion, Session } from "@shopify/shopify-api";

export const shopify = shopifyApi({
    apiSecretKey: process.env.API_SECRET_KEY2,
    apiVersion: ApiVersion.July23,
    isCustomStoreApp: true,
    isEmbeddedApp: false,
    adminApiAccessToken: process.env.ACCESS_TOKEN2,
    scopes: ['read_products', 'write_metaobjects', 'read_metaobjects'],
    hostName: process.env.SHOP_NAME2
  });