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
    outputFolder: "admin",
    publicFolder: "public",
  },
  media: {
    tina: {
      mediaRoot: "",
      publicFolder: "public",
    },
  },
  // See docs on content modeling for more info on how to setup new content models: https://tina.io/docs/r/content-modelling-collections/
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
            type: "datetime",
            name: "date",
            label: "Date",
            required: false,
          },
          {
            type: "string",
            name: "author",
            label: "Author",
            required: false,
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
        ui: {
          router: ({ document }) => `/blog/${document._sys.filename}`,
        },
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
        name: "publicPage",
        label: "Public Pages",
        path: "content/public-pages",
        format: "json",
        fields: [
          {
            type: "string",
            name: "slug",
            label: "Page Slug",
            isTitle: true,
            required: true,
          },
          {
            type: "string",
            name: "title",
            label: "Page Title",
            required: true,
          },
          {
            type: "string",
            name: "description",
            label: "Meta Description",
            ui: {
              component: "textarea",
            },
          },
          {
            type: "object",
            name: "hero",
            label: "Hero Section",
            fields: [
              {
                type: "string",
                name: "title",
                label: "Hero Title",
              },
              {
                type: "string",
                name: "subtitle",
                label: "Hero Subtitle",
                ui: {
                  component: "textarea",
                },
              },
              {
                type: "image",
                name: "backgroundImage",
                label: "Background Image",
              },
            ],
          },
          {
            type: "rich-text",
            name: "content",
            label: "Page Content",
            isBody: true,
          },
          {
            type: "object",
            name: "seo",
            label: "SEO Settings",
            fields: [
              {
                type: "string",
                name: "metaTitle",
                label: "Meta Title",
              },
              {
                type: "string",
                name: "metaDescription",
                label: "Meta Description",
                ui: {
                  component: "textarea",
                },
              },
              {
                type: "string",
                name: "keywords",
                label: "Keywords (comma-separated)",
              },
              {
                type: "image",
                name: "ogImage",
                label: "Open Graph Image",
              },
            ],
          },
        ],
      },
      {
        name: "faq",
        label: "FAQ",
        path: "content/faq",
        format: "json",
        ui: {
          allowedActions: {
            create: false,
            delete: false,
          },
        },
        fields: [
          {
            type: "string",
            name: "title",
            label: "FAQ Page Title",
            required: true,
          },
          {
            type: "string",
            name: "description",
            label: "FAQ Description",
            ui: {
              component: "textarea",
            },
          },
          {
            type: "object",
            name: "categories",
            label: "FAQ Categories",
            list: true,
            fields: [
              {
                type: "string",
                name: "name",
                label: "Category Name",
                required: true,
              },
              {
                type: "string",
                name: "description",
                label: "Category Description",
              },
              {
                type: "object",
                name: "questions",
                label: "Questions",
                list: true,
                fields: [
                  {
                    type: "string",
                    name: "question",
                    label: "Question",
                    required: true,
                  },
                  {
                    type: "rich-text",
                    name: "answer",
                    label: "Answer",
                    required: true,
                  },
                  {
                    type: "string",
                    name: "tags",
                    label: "Tags (comma-separated)",
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        name: "contact",
        label: "Contact",
        path: "content/contact",
        format: "json",
        ui: {
          allowedActions: {
            create: false,
            delete: false,
          },
        },
        fields: [
          {
            type: "object",
            name: "hero",
            label: "Hero Section",
            fields: [
              {
                type: "string",
                name: "title",
                label: "Page Title",
                required: true,
              },
              {
                type: "string",
                name: "subtitle",
                label: "Page Subtitle",
                ui: {
                  component: "textarea",
                },
              },
            ],
          },
          {
            type: "object",
            name: "contactInfo",
            label: "Contact Information",
            fields: [
              {
                type: "string",
                name: "email",
                label: "Contact Email",
              },
              {
                type: "string",
                name: "phone",
                label: "Phone Number",
              },
              {
                type: "string",
                name: "address",
                label: "Address",
                ui: {
                  component: "textarea",
                },
              },
              {
                type: "string",
                name: "businessHours",
                label: "Business Hours",
                ui: {
                  component: "textarea",
                },
              },
            ],
          },
          {
            type: "object",
            name: "form",
            label: "Contact Form",
            fields: [
              {
                type: "string",
                name: "title",
                label: "Form Title",
              },
              {
                type: "string",
                name: "description",
                label: "Form Description",
              },
              {
                type: "string",
                name: "submitText",
                label: "Submit Button Text",
              },
            ],
          },
        ],
      },
    ],
  },
});
