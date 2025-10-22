import type { Collection } from "tinacms";

const generalStatement: Collection = {
  label: "General Statement Page",
  name: "generalStatement",
  path: "src/content/generalstatement",
  format: "json",
  fields: [
    {
      type: "string",
      name: "title",
      label: "Title",
      required: true,
    },
    {
      type: "string",
      name: "tagline",
      label: "Tagline",
    },
    {
      type: "string",
      name: "description",
      label: "Description",
      ui: { component: "textarea" },
    },
    {
      type: "string",
      name: "badges",
      label: "Badges",
      list: true,
    },
    {
      type: "object",
      name: "sections",
      label: "Sections",
      list: true,
      fields: [
        {
          type: "string",
          name: "heading",
          label: "Heading",
        },
        {
          type: "string",
          name: "icon",
          label: "Icon (optional)",
        },
        {
          type: "object",
          name: "subsections",
          label: "Subsections",
          list: true,
          fields: [
            { type: "string", name: "title", label: "Subsection Title" },
            {
              type: "string",
              name: "content",
              label: "Content",
              ui: { component: "textarea" },
            },
          ],
        },
        {
          type: "string",
          name: "content",
          label: "Content",
          ui: { component: "textarea" },
        },
        {
          type: "string",
          name: "list",
          label: "List Items",
          list: true,
        },
      ],
    },
  ],
};

export default generalStatement;
