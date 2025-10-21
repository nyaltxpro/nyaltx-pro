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
        match: {
          exclude: "venture-group.json",
        },
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
      {
        name: "collectionVenture",
        label: "Venture Group Page",
        path: "content/public-pages",
        format: "json",
        match: {
          include: "venture-group.json",
        },
        ui: {
          allowedActions: {
            create: false,
            delete: false,
          },
        },
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
          },
          {
            type: "object",
            name: "teamSection",
            label: "Team Section",
            fields: [
              {
                type: "string",
                name: "title",
                label: "Section Title",
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
                name: "members",
                label: "Team Members",
                list: true,
                ui: {
                  itemProps: (item) => {
                    return {
                      label: item?.name,
                    };
                  },
                },
                fields: [
                  {
                    type: "string",
                    name: "name",
                    label: "Name",
                    required: true,
                  },
                  {
                    type: "string",
                    name: "role",
                    label: "Role",
                    required: true,
                  },
                  {
                    type: "string",
                    name: "bio",
                    label: "Short Bio",
                    ui: {
                      component: "textarea",
                    },
                  },
                  {
                    type: "image",
                    name: "photo",
                    label: "Photo",
                  },
                  {
                    type: "string",
                    name: "linkedin",
                    label: "LinkedIn URL",
                  },
                  {
                    type: "string",
                    name: "twitter",
                    label: "Twitter URL",
                  },
                ],
              },
            ],
          },
          {
            type: "object",
            name: "sections",
            label: "Additional Sections",
            list: true,
            ui: {
              itemProps: (item) => {
                return {
                  label: item?.title,
                };
              },
            },
            fields: [
              {
                type: "string",
                name: "title",
                label: "Section Title",
              },
              {
                type: "string",
                name: "description",
                label: "Section Description",
                ui: {
                  component: "textarea",
                },
              },
              {
                type: "object",
                name: "items",
                label: "Highlights",
                list: true,
                ui: {
                  itemProps: (item) => {
                    return {
                      label: item?.title,
                    };
                  },
                },
                fields: [
                  {
                    type: "string",
                    name: "title",
                    label: "Title",
                  },
                  {
                    type: "string",
                    name: "description",
                    label: "Description",
                    ui: {
                      component: "textarea",
                    },
                  },
                ],
              },
            ],
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
        name: "team",
        label: "Team",
        path: "content/team",
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
                label: "Title",
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
                type: "image",
                name: "backgroundImage",
                label: "Background Image",
              },
            ],
          },
          {
            type: "object",
            name: "members",
            label: "Team Members",
            list: true,
            ui: {
              itemProps: (item) => {
                return {
                  label: item?.name || "New Team Member",
                };
              },
              defaultItem: () => ({
                name: "New Team Member",
                role: "Role / Title",
                description: "",
                image: "",
                socials: {
                  twitter: "",
                  linkedin: "",
                  telegram: "",
                },
              }),
            },
            fields: [
              {
                type: "string",
                name: "name",
                label: "Name",
                required: true,
              },
              {
                type: "string",
                name: "role",
                label: "Role",
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
                name: "image",
                label: "Photo",
                required: true,
              },
              {
                type: "object",
                name: "socials",
                label: "Social Links",
                fields: [
                  {
                    type: "string",
                    name: "twitter",
                    label: "Twitter URL",
                  },
                  {
                    type: "string",
                    name: "linkedin",
                    label: "LinkedIn URL",
                  },
                  {
                    type: "string",
                    name: "telegram",
                    label: "Telegram URL",
                  },
                ],
              },
            ],
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
                label: "Company Subtitle",
              },
              {
                type: "string",
                name: "description",
                label: "Company Description",
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
                        label: "Link Label",
                        required: true,
                      },
                      {
                        type: "string",
                        name: "url",
                        label: "Link URL",
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
                label: "Social Section Description",
                ui: {
                  component: "textarea",
                },
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
            label: "Newsletter",
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
                ui: {
                  component: "textarea",
                },
              },
              {
                type: "string",
                name: "placeholder",
                label: "Email Placeholder",
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
                ui: {
                  component: "textarea",
                },
              },
              {
                type: "string",
                name: "disclaimer",
                label: "Disclaimer Text",
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
                    label: "Link Label",
                    required: true,
                  },
                  {
                    type: "string",
                    name: "url",
                    label: "Link URL",
                    required: true,
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
});
