import 'dotenv/config';
import * as fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { shopify } from "./toShop.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'metaobjects.json')));

const session = shopify.session.customAppSession(process.env.SHOP_NAME2);

const client = new shopify.clients.Graphql({ session });

async function createMetaobject(obj) {
    const mutationString = `
        mutation metaobjectCreate ($metaobject: MetaobjectCreateInput!) {
            metaobjectCreate(metaobject: $metaobject) {
                metaobject {
                    fields {
                        key
                        value
                    }
                }
                userErrors {
                    field
                    message
                }
            }
        }
    `

    const response = await client.query({
        data: {
            query: mutationString,
            variables: {
                "metaobject": {
                    "capabilities": obj.capabilities,
                    "type": obj.type,
                    "fields": obj.fields
                }
            }
        }
    });

    console.log(response.body);
}

data.forEach(async node => await createMetaobject(node));



