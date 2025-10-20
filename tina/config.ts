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
      {
        name: "landingPage",
        label: "Landing Page",
        path: "content/landing",
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
                label: "Main Title",
                required: true,
              },
              {
                type: "string",
                name: "subtitle",
                label: "Subtitle",
                ui: {
                  component: "textarea",
                },
              },
              {
                type: "string",
                name: "ctaText",
                label: "CTA Button Text",
                required: true,
              },
              {
                type: "string",
                name: "ctaLink",
                label: "CTA Button Link",
                required: true,
              },
              {
                type: "image",
                name: "backgroundImage",
                label: "Background Image",
              },
            ],
          },
          {
            type: "object",
            name: "features",
            label: "Features Section",
            fields: [
              {
                type: "string",
                name: "title",
                label: "Section Title",
                required: true,
              },
              {
                type: "string",
                name: "subtitle",
                label: "Section Subtitle",
                ui: {
                  component: "textarea",
                },
              },
              {
                type: "object",
                name: "items",
                label: "Feature Items",
                list: true,
                fields: [
                  {
                    type: "string",
                    name: "title",
                    label: "Feature Title",
                    required: true,
                  },
                  {
                    type: "string",
                    name: "description",
                    label: "Feature Description",
                    ui: {
                      component: "textarea",
                    },
                  },
                  {
                    type: "string",
                    name: "icon",
                    label: "Icon (emoji or icon name)",
                  },
                  {
                    type: "image",
                    name: "image",
                    label: "Feature Image",
                  },
                ],
              },
            ],
          },
          {
            type: "object",
            name: "stats",
            label: "Statistics Section",
            fields: [
              {
                type: "string",
                name: "title",
                label: "Section Title",
              },
              {
                type: "object",
                name: "items",
                label: "Stat Items",
                list: true,
                fields: [
                  {
                    type: "string",
                    name: "value",
                    label: "Stat Value",
                    required: true,
                  },
                  {
                    type: "string",
                    name: "label",
                    label: "Stat Label",
                    required: true,
                  },
                  {
                    type: "string",
                    name: "description",
                    label: "Description",
                  },
                ],
              },
            ],
          },
          {
            type: "object",
            name: "testimonials",
            label: "Testimonials Section",
            fields: [
              {
                type: "string",
                name: "title",
                label: "Section Title",
              },
              {
                type: "object",
                name: "items",
                label: "Testimonials",
                list: true,
                fields: [
                  {
                    type: "string",
                    name: "quote",
                    label: "Quote",
                    required: true,
                    ui: {
                      component: "textarea",
                    },
                  },
                  {
                    type: "string",
                    name: "author",
                    label: "Author Name",
                    required: true,
                  },
                  {
                    type: "string",
                    name: "role",
                    label: "Author Role/Title",
                  },
                  {
                    type: "image",
                    name: "avatar",
                    label: "Author Avatar",
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        name: "footer",
        label: "Footer Settings",
        path: "content/footer",
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
            name: "branding",
            label: "Branding",
            fields: [
              {
                type: "string",
                name: "title",
                label: "Company Title",
                required: true,
              },
              {
                type: "string",
                name: "subtitle",
                label: "Tagline",
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
                label: "Footer Logo",
              },
            ],
          },
          {
            type: "object",
            name: "links",
            label: "Footer Links",
            fields: [
              {
                type: "object",
                name: "sections",
                label: "Link Sections",
                list: true,
                fields: [
                  {
                    type: "string",
                    name: "title",
                    label: "Section Title",
                    required: true,
                  },
                  {
                    type: "object",
                    name: "items",
                    label: "Links",
                    list: true,
                    fields: [
                      {
                        type: "string",
                        name: "label",
                        label: "Link Text",
                        required: true,
                      },
                      {
                        type: "string",
                        name: "url",
                        label: "URL",
                        required: true,
                      },
                      {
                        type: "boolean",
                        name: "external",
                        label: "External Link",
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            type: "object",
            name: "social",
            label: "Social Media",
            fields: [
              {
                type: "string",
                name: "title",
                label: "Social Section Title",
              },
              {
                type: "string",
                name: "description",
                label: "Social Description",
              },
              {
                type: "object",
                name: "platforms",
                label: "Social Platforms",
                fields: [
                  {
                    type: "string",
                    name: "twitter",
                    label: "Twitter URL",
                  },
                  {
                    type: "string",
                    name: "discord",
                    label: "Discord URL",
                  },
                  {
                    type: "string",
                    name: "telegram",
                    label: "Telegram URL",
                  },
                  {
                    type: "string",
                    name: "youtube",
                    label: "YouTube URL",
                  },
                  {
                    type: "string",
                    name: "linkedin",
                    label: "LinkedIn URL",
                  },
                  {
                    type: "string",
                    name: "github",
                    label: "GitHub URL",
                  },
                ],
              },
            ],
          },
          {
            type: "object",
            name: "newsletter",
            label: "Newsletter Signup",
            fields: [
              {
                type: "string",
                name: "title",
                label: "Newsletter Title",
              },
              {
                type: "string",
                name: "description",
                label: "Newsletter Description",
              },
              {
                type: "string",
                name: "placeholder",
                label: "Email Placeholder Text",
              },
              {
                type: "string",
                name: "buttonText",
                label: "Subscribe Button Text",
              },
            ],
          },
          {
            type: "object",
            name: "legal",
            label: "Legal Information",
            fields: [
              {
                type: "string",
                name: "copyright",
                label: "Copyright Text",
              },
              {
                type: "string",
                name: "disclaimer",
                label: "Disclaimer",
                ui: {
                  component: "textarea",
                },
              },
              {
                type: "object",
                name: "links",
                label: "Legal Links",
                list: true,
                fields: [
                  {
                    type: "string",
                    name: "label",
                    label: "Link Text",
                    required: true,
                  },
                  {
                    type: "string",
                    name: "url",
                    label: "URL",
                    required: true,
                  },
                ],
              },
            ],
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
        name: "pricing",
        label: "Pricing",
        path: "content/pricing",
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
                label: "Main Title",
                required: true,
              },
              {
                type: "string",
                name: "subtitle",
                label: "Subtitle",
                ui: {
                  component: "textarea",
                },
              },
            ],
          },
          {
            type: "object",
            name: "plans",
            label: "Pricing Plans",
            list: true,
            fields: [
              {
                type: "string",
                name: "name",
                label: "Plan Name",
                required: true,
              },
              {
                type: "string",
                name: "description",
                label: "Plan Description",
                ui: {
                  component: "textarea",
                },
              },
              {
                type: "string",
                name: "price",
                label: "Price",
                required: true,
              },
              {
                type: "string",
                name: "period",
                label: "Billing Period",
              },
              {
                type: "string",
                name: "features",
                label: "Features",
                list: true,
              },
              {
                type: "string",
                name: "ctaText",
                label: "CTA Button Text",
              },
              {
                type: "string",
                name: "ctaLink",
                label: "CTA Button Link",
              },
              {
                type: "boolean",
                name: "popular",
                label: "Popular Plan",
              },
              {
                type: "string",
                name: "badge",
                label: "Plan Badge",
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
