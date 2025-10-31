import type { Collection } from "tinacms";

export const aboutUs: Collection = {
  name: "aboutUs",
  label: "About Us Page",
  path: "src/content/aboutus",
  format: "json",
  fields: [
    {
      name: "slug",
      label: "Slug",
      type: "string",
      required: true,
      description: "URL slug for the page"
    },
    {
      name: "meta",
      label: "Metadata",
      type: "object",
      fields: [
        {
          name: "title",
          label: "Title",
          type: "string",
          required: true
        },
        {
          name: "description",
          label: "Description",
          type: "string",
          ui: { component: "textarea" }
        },
        {
          name: "lastUpdated",
          label: "Last Updated",
          type: "datetime",
          required: true
        },
        {
          name: "version",
          label: "Version",
          type: "string"
        }
      ]
    },
    {
      name: "hero",
      label: "Hero Section",
      type: "object",
      fields: [
        {
          name: "badge",
          label: "Badge",
          type: "object",
          fields: [
            {
              name: "icon",
              label: "Icon",
              type: "string",
              description: "React Icon name, e.g., 'FiUsers'"
            },
            {
              name: "text",
              label: "Text",
              type: "string"
            }
          ]
        },
        {
          name: "title",
          label: "Title",
          type: "object",
          fields: [
            {
              name: "text",
              label: "Text",
              type: "string",
              required: true
            },
            {
              name: "gradient",
              label: "Gradient Classes",
              type: "string",
              description: "Tailwind gradient classes"
            }
          ]
        },
        {
          name: "description",
          label: "Description",
          type: "string",
          ui: { component: "textarea" }
        }
      ]
    },
    {
      name: "content",
      label: "Page Content",
      type: "object",
      fields: [
        {
          name: "sections",
          label: "Content Sections",
          type: "object",
          list: true,
          fields: [
            {
              name: "id",
              label: "Section ID",
              type: "string",
              required: true
            },
            {
              name: "icon",
              label: "Section Icon",
              type: "string",
              description: "React Icon name (optional), e.g., 'FiTarget', 'FiCpu'"
            },
            {
              name: "title",
              label: "Section Title",
              type: "string",
              required: true
            },
            {
              name: "type",
              label: "Section Type",
              type: "string",
              options: ["default", "highlight", "warning"],
              description: "Visual style of the section"
            },
            {
              name: "paragraphs",
              label: "Paragraphs",
              type: "string",
              list: true,
              ui: { component: "textarea" },
              description: "Array of paragraph texts"
            },
            {
              name: "contactInfo",
              label: "Contact Information",
              type: "object",
              list: true,
              description: "Optional contact details for contact sections",
              fields: [
                {
                  name: "label",
                  label: "Label",
                  type: "string",
                  description: "e.g., 'Email', 'Twitter'"
                },
                {
                  name: "value",
                  label: "Value",
                  type: "string",
                  description: "e.g., 'info@nyaltx.pro', '@nyaltx'"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      name: "seo",
      label: "SEO Settings",
      type: "object",
      fields: [
        {
          name: "metaTitle",
          label: "Meta Title",
          type: "string",
          required: true
        },
        {
          name: "metaDescription",
          label: "Meta Description",
          type: "string",
          ui: { component: "textarea" },
          required: true
        },
        {
          name: "keywords",
          label: "Keywords",
          type: "string",
          description: "Comma-separated keywords"
        },
        {
          name: "canonical",
          label: "Canonical URL",
          type: "string"
        }
      ]
    }
  ]
};