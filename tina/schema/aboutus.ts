import type { Collection } from "tinacms";

export const aboutUs: Collection = {
    name: "aboutUs",
    label: "About Us Page",
    path: "content/pages",
    format: "json",
    fields: [
      {
        name: "slug",
        label: "Slug",
        type: "string",
        required: true,
      },
      {
        name: "title",
        label: "Page Title",
        type: "string",
      },
      {
        name: "description",
        label: "Page Description",
        type: "string",
        ui: {
          component: "textarea",
        },
      },
      {
        name: "hero",
        label: "Hero Section",
        type: "object",
        fields: [
          {
            name: "title",
            label: "Hero Title",
            type: "string",
          },
          {
            name: "subtitle",
            label: "Hero Subtitle",
            type: "string",
            ui: {
              component: "textarea",
            },
          },
        ],
      },
      {
        name: "content",
        label: "Page Content",
        type: "rich-text",
        isBody: true,
      },
      {
        name: "teamSection",
        label: "Team Section",
        type: "object",
        fields: [
          {
            name: "title",
            label: "Title",
            type: "string",
          },
          {
            name: "subtitle",
            label: "Subtitle",
            type: "string",
          },
          {
            name: "members",
            label: "Team Members",
            type: "object",
            list: true,
            fields: [
              { name: "name", label: "Name", type: "string" },
              { name: "role", label: "Role", type: "string" },
              { name: "image", label: "Image", type: "image" },
              { name: "bio", label: "Bio", type: "string", ui: { component: "textarea" } },
            ],
          },
        ],
      },
      {
        name: "sections",
        label: "Additional Sections",
        type: "object",
        list: true,
        fields: [
          { name: "title", label: "Title", type: "string" },
          { name: "content", label: "Content", type: "rich-text" },
        ],
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
          },
          {
            name: "metaDescription",
            label: "Meta Description",
            type: "string",
            ui: {
              component: "textarea",
            },
          },
          {
            name: "keywords",
            label: "Keywords",
            type: "string",
          },
          {
            name: "ogImage",
            label: "OG Image",
            type: "image",
          },
        ],
      },
    ],
  }