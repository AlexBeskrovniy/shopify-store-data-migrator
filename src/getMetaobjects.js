import 'dotenv/config';
import * as fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { shopify } from "./index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const session = shopify.session.customAppSession(process.env.SHOP_NAME);

const queryString = `{
    metaobjects (type: "theme_color_swatches", first: 100) {
      edges {
        node {
            handle
            type
            color: field(key: "color") { value }
            label: field(key: "label") { value }
            image: field(key: "image") { value }
        }
      }
    }
  }`

  const client = new shopify.clients.Graphql({ session });
  const response = await client.query({
    data: queryString,
  });

const defs = response.body.data.metaobjects.edges.map(metaObj => {
    return {
        handle: metaObj.node.handle,
        type: metaObj.node.type,
        fields: {
            color: metaObj.node.color.value,
            label: metaObj.node.label.value
        }
    }
});

fs.writeFileSync(path.join(__dirname, 'metaobjects.json'), JSON.stringify(defs, null, '\t'));
console.log(defs);