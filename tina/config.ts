import { defineConfig } from "tinacms";
import { aboutUs } from './schema/aboutus';
import generalStatement from "./schema/generalstatment";
import { legalAdvice } from "./schema/legalAdvice";
import podcast from "./schema/podcast";
import pricing from "./schema/pricing";
import { privacyPolicy } from "./schema/privacyPolicy";
import blog from "./schema/blog";
import tradeVideos from "./schema/tradeVideos";
import ventureGroup from "./schema/ventureGroup";
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
      generalStatement,
      aboutUs,
      legalAdvice,
      privacyPolicy,
      ventureGroup,
      podcast,
      tradeVideos,
      pricing,
      blog,
      {
        name: "navigation",
        label: "Navigation",
        path: "content/navigation",
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
            name: "brand",
            label: "Brand",
            fields: [
              {
                type: "string",
                name: "label",
                label: "Brand Label",
              },
              {
                type: "string",
                name: "href",
                label: "Brand Link",
                ui: {
                  validate: (value) => (value ? undefined : "Brand link is required"),
                },
              },
            ],
          },
          {
            type: "object",
            name: "primaryLinks",
            label: "Primary Links",
            list: true,
            ui: {
              itemProps: (item) => ({
                label: item?.label || "New Link",
              }),
            },
            fields: [
              {
                type: "string",
                name: "label",
                label: "Link Label",
                required: true,
              },
              {
                type: "string",
                name: "href",
                label: "Link URL",
                required: true,
              },
              {
                type: "boolean",
                name: "enabled",
                label: "Enabled",
                ui: {
                  defaultValue: true,
                },
              },
            ],
          },
          {
            type: "object",
            name: "dropdownMenus",
            label: "Dropdown Menus",
            list: true,
            ui: {
              itemProps: (item) => ({
                label: item?.label || "Dropdown",
              }),
            },
            fields: [
              {
                type: "string",
                name: "label",
                label: "Dropdown Label",
                required: true,
              },
              {
                type: "boolean",
                name: "enabled",
                label: "Enabled",
                ui: {
                  defaultValue: true,
                },
              },
              {
                type: "object",
                name: "links",
                label: "Dropdown Links",
                list: true,
                ui: {
                  itemProps: (item) => ({
                    label: item?.label || "Dropdown Link",
                  }),
                },
                fields: [
                  {
                    type: "string",
                    name: "label",
                    label: "Link Label",
                    required: true,
                  },
                  {
                    type: "string",
                    name: "href",
                    label: "Link URL",
                    required: true,
                  },
                  {
                    type: "boolean",
                    name: "enabled",
                    label: "Enabled",
                    ui: {
                      defaultValue: true,
                    },
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        name: "landing",
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
                label: "Hero Title",
                required: true,
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
                    label: "Feature Icon (emoji)",
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
                    label: "Stat Description",
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
                label: "Testimonial Items",
                list: true,
                fields: [
                  {
                    type: "string",
                    name: "quote",
                    label: "Testimonial Quote",
                    ui: {
                      component: "textarea",
                    },
                    required: true,
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
                    label: "Author Role",
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
          {
            type: "object",
            name: "cta",
            label: "Call to Action Section",
            fields: [
              {
                type: "string",
                name: "title",
                label: "CTA Title",
              },
              {
                type: "string",
                name: "subtitle",
                label: "CTA Subtitle",
                ui: {
                  component: "textarea",
                },
              },
              {
                type: "string",
                name: "primaryButtonText",
                label: "Primary Button Text",
              },
              {
                type: "string",
                name: "primaryButtonLink",
                label: "Primary Button Link",
              },
              {
                type: "string",
                name: "secondaryButtonText",
                label: "Secondary Button Text",
              },
              {
                type: "string",
                name: "secondaryButtonLink",
                label: "Secondary Button Link",
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
            name: "howItWorks",
            label: "How It Works Section",
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
                name: "steps",
                label: "Steps",
                list: true,
                fields: [
                  {
                    type: "string",
                    name: "step",
                    label: "Step Number",
                    required: true,
                  },
                  {
                    type: "string",
                    name: "title",
                    label: "Step Title",
                    required: true,
                  },
                  {
                    type: "string",
                    name: "description",
                    label: "Step Description",
                    ui: {
                      component: "textarea",
                    },
                  },
                  {
                    type: "string",
                    name: "icon",
                    label: "Step Icon (emoji)",
                  },
                  {
                    type: "image",
                    name: "image",
                    label: "Step Image",
                  },
                ],
              },
            ],
          },
          {
            type: "object",
            name: "partnerships",
            label: "Partnerships Section",
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
                name: "partners",
                label: "Partners",
                list: true,
                fields: [
                  {
                    type: "string",
                    name: "name",
                    label: "Partner Name",
                    required: true,
                  },
                  {
                    type: "image",
                    name: "logo",
                    label: "Partner Logo",
                  },
                  {
                    type: "string",
                    name: "description",
                    label: "Partner Description",
                  },
                ],
              },
            ],
          },
          {
            type: "object",
            name: "roadmap",
            label: "Roadmap Section",
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
                name: "quarters",
                label: "Roadmap Quarters",
                list: true,
                fields: [
                  {
                    type: "string",
                    name: "period",
                    label: "Time Period",
                    required: true,
                  },
                  {
                    type: "string",
                    name: "title",
                    label: "Quarter Title",
                    required: true,
                  },
                  {
                    type: "string",
                    name: "status",
                    label: "Status",
                    options: ["completed", "in-progress", "planned", "research"],
                  },
                  {
                    type: "string",
                    name: "features",
                    label: "Features",
                    list: true,
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
    ],
  },
});
