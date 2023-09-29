import 'dotenv/config';
import { shopify } from "./index.js";

import { timeout } from './helpers.js';

const session = shopify.session.customAppSession(process.env.SHOP_NAME);
const client = new shopify.clients.Graphql({ session });

// async function getCollectionURL(handle) {
//     const collectionQueryString = `
//         query getCollectionURLFromHandle($handle: String!) {
//             collectionByHandle(handle: $handle) {
//                 handle
//                 title
//             }
//         }
//     `

//     const collection = await client.query({
//         data: {
//             "query": collectionQueryString,
//             "variables": {
//                 "handle": `${handle}`
//             }
//         }
//     });

//     console.log(collection.body.data.collectionByHandle);
// };

async function updataMetaobjectField() {
    const metaobjectsQueryString = `{
        metaobjects (type: "vendor_logo", first: 100) {
          edges {
            node {
                id
                label: field(key: "label") { value }
                logo: field(key: "logo") { value }
                collection_link: field(key: "collection_link") { value }
            }
          }
        }
    }`

    const metaobjectUpdateQueryString = `
        mutation metaobjectUpdate($id: ID!, $metaobject: MetaobjectUpdateInput!) {
            metaobjectUpdate(id: $id, metaobject: $metaobject) {
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
        data: metaobjectsQueryString
    });
    response.body.data.metaobjects.edges.map(async ({ node }, i) => {
        const handle = node.label.value.split(' ').join('-').toLowerCase();

        const collectionURL = `https://multi-outdoor.myshopify.com/collections/${handle}`;

        await timeout(i);
        const updatedMetaobject = await client.query({
            data: {
                "query": metaobjectUpdateQueryString,
                "variables": {
                    "id": node.id,
                    "metaobject": {
                        "fields": [
                            {
                                "key": "collection_url",
                                "value": collectionURL
                            }
                        ]
                    }
                }
            }
       });

       console.log(updatedMetaobject.body.data.metaobjectUpdate);
    });


    return response.body.data.metaobjects.edges;
}

updataMetaobjectField();