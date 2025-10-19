import { defineConfig } from "tinacms";

// Your hosting provider likely exposes this as an environment variable
const branch =
  process.env.GITHUB_BRANCH ||
  process.env.VERCEL_GIT_COMMIT_REF ||
  process.env.HEAD ||
  "main";

export default defineConfig({
  branch,

  // Get this from tina.io
  clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID,
  // Get this from tina.io
  token: process.env.TINA_TOKEN,

  build: {
    outputFolder: "tina-admin",
    publicFolder: "public",
  },
  media: {
    tina: {
      mediaRoot: "uploads",
      publicFolder: "public",
    },
  },
  // See docs on content modeling for more info on how to setup new content models: https://tina.io/docs/schema/
  schema: {
    collections: [
      {
        name: "post",
        label: "Blog Posts",
        path: "content/posts",
        format: "mdx",
        fields: [
          {
            type: "string",
            name: "title",
            label: "Title",
            isTitle: true,
            required: true,
          },
          {
            type: "string",
            name: "description",
            label: "Description",
            required: false,
          },
          {
            type: "image",
            name: "heroImg",
            label: "Hero Image",
          },
          {
            type: "datetime",
            name: "date",
            label: "Date",
            required: true,
          },
          {
            type: "string",
            name: "author",
            label: "Author",
            required: true,
          },
          {
            type: "string",
            name: "category",
            label: "Category",
            options: ["crypto", "trading", "news", "tutorial"],
          },
          {
            type: "string",
            name: "tags",
            label: "Tags",
            list: true,
          },
          {
            type: "rich-text",
            name: "body",
            label: "Body",
            isBody: true,
          },
        ],
      },
      {
        name: "page",
        label: "Pages",
        path: "content/pages",
        format: "mdx",
        fields: [
          {
            type: "string",
            name: "title",
            label: "Title",
            isTitle: true,
            required: true,
          },
          {
            type: "string",
            name: "description",
            label: "Description",
          },
          {
            type: "rich-text",
            name: "body",
            label: "Body",
            isBody: true,
          },
        ],
      },
      {
        name: "announcement",
        label: "Announcements",
        path: "content/announcements",
        format: "json",
        fields: [
          {
            type: "string",
            name: "title",
            label: "Title",
            isTitle: true,
            required: true,
          },
          {
            type: "string",
            name: "message",
            label: "Message",
            required: true,
            ui: {
              component: "textarea",
            },
          },
          {
            type: "datetime",
            name: "startDate",
            label: "Start Date",
            required: true,
          },
          {
            type: "datetime",
            name: "endDate",
            label: "End Date",
            required: false,
          },
          {
            type: "boolean",
            name: "active",
            label: "Active",
            required: true,
          },
          {
            type: "string",
            name: "type",
            label: "Type",
            options: ["info", "warning", "success", "error"],
            required: true,
          },
          {
            type: "string",
            name: "link",
            label: "Link URL",
            required: false,
          },
        ],
      },
      {
        name: "token",
        label: "Featured Tokens",
        path: "content/tokens",
        format: "json",
        fields: [
          {
            type: "string",
            name: "name",
            label: "Token Name",
            isTitle: true,
            required: true,
          },
          {
            type: "string",
            name: "symbol",
            label: "Symbol",
            required: true,
          },
          {
            type: "string",
            name: "description",
            label: "Description",
            ui: {
              component: "textarea",
            },
          },
          {
            type: "image",
            name: "logo",
            label: "Logo",
            required: true,
          },
          {
            type: "string",
            name: "contractAddress",
            label: "Contract Address",
            required: true,
          },
          {
            type: "string",
            name: "chain",
            label: "Blockchain",
            options: ["ethereum", "bsc", "polygon", "solana", "arbitrum", "optimism"],
            required: true,
          },
          {
            type: "string",
            name: "website",
            label: "Website",
          },
          {
            type: "string",
            name: "twitter",
            label: "Twitter",
          },
          {
            type: "string",
            name: "telegram",
            label: "Telegram",
          },
          {
            type: "boolean",
            name: "featured",
            label: "Featured",
            required: true,
          },
          {
            type: "number",
            name: "order",
            label: "Display Order",
          },
        ],
      },
    ],
  },
});
