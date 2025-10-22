import type { Collection } from "tinacms";

const ventureGroup: Collection = {
  name: "venturegroup",
  label: "Venture Group",
  path: "src/content/venturegroup",
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
      name: "slug",
      label: "Slug",
      isTitle: true,
      required: true,
      description: "URL slug for this page",
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
          type: "image",
          name: "backgroundImage",
          label: "Background Image",
        },
      ],
    },
    {
      type: "rich-text",
      name: "content",
      label: "Intro Content",
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
            itemProps: (item) => ({
              label: item?.name,
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
              name: "bio",
              label: "Bio",
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
              label: "X (Twitter) URL",
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
          fields: [
            {
              type: "string",
              name: "title",
              label: "Item Title",
            },
            {
              type: "string",
              name: "description",
              label: "Item Description",
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
      label: "SEO",
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
          label: "Keywords",
        },
        {
          type: "image",
          name: "ogImage",
          label: "Open Graph Image",
        },
      ],
    },
  ],
};

export default ventureGroup;
