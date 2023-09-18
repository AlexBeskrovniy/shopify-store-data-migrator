import 'dotenv/config';
import { shopify } from "./index.js";

const session = shopify.session.customAppSession(process.env.SHOP_NAME);

const queryString = `{
    metaobjects (type: "theme_color_swatches", first: 100) {
      edges {
        node {
          handle
        }
      }
    }
  }`

  const client = new shopify.clients.Graphql({ session });
  const products = await client.query({
    data: queryString,
  });

  console.log(products.body.data.metaobjects.edges);