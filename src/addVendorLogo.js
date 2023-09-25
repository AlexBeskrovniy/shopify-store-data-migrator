import 'dotenv/config';
import { shopify } from "./index.js";

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

async function getAllProducts(client) {
    const productsQueryString = `query {
        products(first: 250) {
            edges {
                node {
                    id
                    vendor
                }
            }
        }
    }`

    const products = await client.query({
        data: productsQueryString
    });

    return products.body.data.products.edges;
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
}

async function addVendorLogos() {
    const session = shopify.session.customAppSession(process.env.SHOP_NAME);
    const client = new shopify.clients.Graphql({ session });
    
    const products = await getAllProducts(client);
    const metaobjects = await getMetaobjects(client);
    
    const metaobjectData = metaobjects.reduce((acc, { node }) => {
        acc[node.label.value] = node.id;
        return acc;
    }, {});
    // console.log(metaobjectData);

    const productsWithVendors = products.reduce((acc, { node }) => {
        if (metaobjectData[node.vendor]) {
            acc[node.id] = metaobjectData[node.vendor];
        };

        return acc;
    }, {});
    // console.log(productsWithVendors);

    const timeout = async (m) => {
        return new Promise((res) => {
            setTimeout(res, m*300)
        })
    }

    products.map(async ({ node }, i) => {
        if (productsWithVendors[node.id]) {
            await timeout(i);
            await updateProductMetafield(client, node.id, productsWithVendors[node.id])
        }
    })
}

addVendorLogos();
