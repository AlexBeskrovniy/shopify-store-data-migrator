import 'dotenv/config';
// import * as fs from 'fs';
// import path from 'path';
// import { fileURLToPath } from 'url';
import { shopify } from "./index.js";

// const session = shopify.session.customAppSession(process.env.SHOP_NAME);
// const client = new shopify.clients.Graphql({ session });

async function getMetaobjects(client) {
    const metaobjectsQueryString = `{
        metaobjects (type: "vendor_logo", first: 100) {
          edges {
            node {
                id
                label: field(key: "label") { value }
                image: field(key: "image") { value }
            }
          }
        }
    }`

    const response = await client.query({
        data: metaobjectsQueryString
    });

    return response.body.data.metaobjects.edges;
}

async function getProductsByVendor(client, vendor) {
    const productsQueryString = `query {
        products(first: 100, query: "vendor:${vendor}") {
            edges {
                node {
                    id
                    vendor
                }
            }
        }
    }`

    const response = await client.query({
        data: productsQueryString
    });

    // response.body.data.products.edges.map(edge => {
    //     console.log(edge.node)
    // });
    // console.log(response.body.data.products.edges);

    return response.body.data.products.edges;
}

async function updateProductMetafield(client, productId, metaobjectId) {
    const productUpdateString = `
        mutation updateProductMetafields($input: ProductInput!) {
            productUpdate(input: $input) {
                product {
                    id
                }
                userErrors {
                    message
                    field
                }
            }
    }`

    const data = await client.query({
        data: {
            "query": productUpdateString,
            "variables": {
                "input": {
                    "id": productId,
                    "metafields": [
                        {
                            "namespace": "custom",
                            "key": "product_vendor_logo",
                            "type": "metaobject_reference",
                            "value": metaobjectId
                        }
                    ]
                }
            }
        }
    });

    console.log(data.body.data.productUpdate.userErrors);
    console.log(data.body.data.productUpdate.product.metafields);
}

async function addVendorLogos() {
    const session = shopify.session.customAppSession(process.env.SHOP_NAME);
    const client = new shopify.clients.Graphql({ session });

    const metaobjects = await getMetaobjects(client);
    const metaobjectData = metaobjects.map(({ node }) => {
        return {
            metaobjectId: node.id,
            metaobjectLabel: node.label.value
        } 
    });

    metaobjectData.map(async ({ metaobjectId, metaobjectLabel }) => {
        const products = await getProductsByVendor(client, metaobjectLabel);
        products.map(async ({ node }) => {
            await updateProductMetafield(client, node.id, metaobjectId);
        });
    });
}

// getProductsByVendor('Arzum');

// updateProductMetafield('gid://shopify/Product/7823074689263', 'gid://shopify/Metaobject/11672125679');

// getMetaobjects(client, metaobjectsQueryString);

addVendorLogos();
