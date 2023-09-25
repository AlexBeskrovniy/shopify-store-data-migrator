import 'dotenv/config';
// import * as fs from 'fs';
// import path from 'path';
// import { fileURLToPath } from 'url';
import { shopify } from "./index.js";

const session = shopify.session.customAppSession(process.env.SHOP_NAME);
const client = new shopify.clients.Graphql({ session });

const metaobjectsQueryString = `{
    metaobjects (type: "vendor_logo", first: 100) {
      edges {
        node {
            handle
            type
            capabilities {
                publishable {
                    status
                }
            }
            label: field(key: "label") { value }
            image: field(key: "image") { value }
        }
      }
    }
}`

async function getMetaobjects(client, queryStr) {
    const response = await client.query({
        data: queryStr,
    });

    return response.body.data.metaobjects.edges;
}

// getMetaobjects(client, metaobjectsQueryString);
