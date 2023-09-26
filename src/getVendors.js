import 'dotenv/config';
import { shopify } from "./index.js";

const session = shopify.session.customAppSession(process.env.SHOP_NAME);
const client = new shopify.clients.Graphql({ session });

async function getVendors(client) {
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

    const vendorsList = products.body.data.products.edges.reduce((list, { node }) => {
        !list.includes(node.vendor) && list.push(node.vendor);
        return list;
    }, []);

    return vendorsList;
}

const vendors = await getVendors(client);

console.log(vendors);