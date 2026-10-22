import { createClient } from "tinacms/dist/client";
import { queries } from "./types";
export const client = createClient({ url: 'http://localhost:3000/graphql', token: '744dcb2882cb9acd09e800e9b06b21792965972d', queries,  });
export default client;
  