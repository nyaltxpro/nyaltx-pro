import type { Collection } from "tinacms";

const whitepaper: Collection = {
  name: "whitepaper",
  label: "Whitepaper",
  path: "content/whitepaper",
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
      label: "Page Description",
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
        },
        {
          type: "string",
          name: "tagline",
          label: "Hero Tagline",
        },
      ],
    },
    {
      type: "object",
      name: "toc",
      label: "Table of Contents",
      list: true,
      ui: {
        itemProps: (item) => ({
          label: item?.title || item?.id || "Section",
        }),
      },
      fields: [
        {
          type: "string",
          name: "id",
          label: "Section ID",
          required: true,
        },
        {
          type: "string",
          name: "title",
          label: "Section Title",
          required: true,
        },
        {
          type: "string",
          name: "level",
          label: "Hierarchy Level",
          options: [
            { label: "Top Level", value: "0" },
            { label: "Subsection", value: "1" },
          ],
        },
      ],
    },
    {
      type: "object",
      name: "sections",
      label: "Sections",
      list: true,
      ui: {
        itemProps: (item) => ({
          label: item?.title || item?.id || "Section",
        }),
      },
      fields: [
        {
          type: "string",
          name: "id",
          label: "Section ID",
          required: true,
        },
        {
          type: "string",
          name: "title",
          label: "Section Title",
          required: true,
        },
        {
          type: "string",
          name: "level",
          label: "Hierarchy Level",
          options: [
            { label: "Top Level", value: "0" },
            { label: "Subsection", value: "1" },
          ],
        },
        {
          type: "string",
          name: "content",
          label: "Section Content",
        },
        {
          type: "object",
          name: "highlight",
          label: "Highlight",
          fields: [
            {
              type: "string",
              name: "style",
              label: "Highlight Style",
              options: [
                { label: "Cyan", value: "cyan" },
                { label: "Green", value: "green" },
                { label: "Purple", value: "purple" },
                { label: "Indigo", value: "indigo" },
                { label: "Orange", value: "orange" },
              ],
            },
            {
              type: "string",
              name: "content",
              label: "Highlight Content",
            },
          ],
        },
        {
          type: "object",
          name: "listItems",
          label: "List Items",
          list: true,
          fields: [
            {
              type: "string",
              name: "content",
              label: "Item Content",
            },
          ],
        },
        {
          type: "object",
          name: "stats",
          label: "Stats",
          list: true,
          fields: [
            {
              type: "string",
              name: "value",
              label: "Value",
              required: true,
            },
            {
              type: "string",
              name: "description",
              label: "Description",
            },
            {
              type: "string",
              name: "color",
              label: "Color",
              options: [
                { label: "Cyan", value: "cyan" },
                { label: "Green", value: "green" },
                { label: "Blue", value: "blue" },
                { label: "Purple", value: "purple" },
                { label: "Orange", value: "orange" },
              ],
            },
          ],
        },
        {
          type: "object",
          name: "cards",
          label: "Cards",
          list: true,
          fields: [
            {
              type: "string",
              name: "title",
              label: "Title",
              required: true,
            },
            {
              type: "string",
              name: "description",
              label: "Description",
            },
            {
              type: "string",
              name: "color",
              label: "Color",
              options: [
                { label: "Blue", value: "blue" },
                { label: "Green", value: "green" },
                { label: "Purple", value: "purple" },
                { label: "Teal", value: "teal" },
                { label: "Indigo", value: "indigo" },
                { label: "Orange", value: "orange" },
              ],
            },
          ],
        },
        {
          type: "object",
          name: "details",
          label: "Detail List",
          list: true,
          fields: [
            {
              type: "string",
              name: "label",
              label: "Label",
              required: true,
            },
            {
              type: "string",
              name: "value",
              label: "Value",
              required: true,
            },
          ],
        },
        {
          type: "object",
          name: "subsections",
          label: "Subsections",
          list: true,
          ui: {
            itemProps: (item) => ({
              label: item?.title || item?.id || "Subsection",
            }),
          },
          fields: [
            {
              type: "string",
              name: "id",
              label: "Subsection ID",
              required: true,
            },
            {
              type: "string",
              name: "title",
              label: "Title",
              required: true,
            },
            {
              type: "string",
              name: "content",
              label: "Content",
            },
            {
              type: "object",
              name: "highlight",
              label: "Highlight",
              fields: [
                {
                  type: "string",
                  name: "style",
                  label: "Highlight Style",
                  options: [
                    { label: "Cyan", value: "cyan" },
                    { label: "Green", value: "green" },
                    { label: "Purple", value: "purple" },
                    { label: "Teal", value: "teal" },
                    { label: "Orange", value: "orange" },
                  ],
                },
                {
                  type: "string",
                  name: "content",
                  label: "Highlight Content",
                },
              ],
            },
            {
              type: "object",
              name: "listItems",
              label: "List Items",
              list: true,
              fields: [
                {
                  type: "string",
                  name: "content",
                  label: "Item Content",
                },
              ],
            },
          ],
        },
        {
          type: "object",
          name: "timeline",
          label: "Timeline",
          list: true,
          fields: [
            {
              type: "string",
              name: "id",
              label: "Timeline ID",
              required: true,
            },
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
            },
            {
              type: "string",
              name: "color",
              label: "Color",
              options: [
                { label: "Cyan", value: "cyan" },
                { label: "Green", value: "green" },
                { label: "Purple", value: "purple" },
                { label: "Blue", value: "blue" },
                { label: "Orange", value: "orange" },
              ],
            },
            {
              type: "object",
              name: "items",
              label: "Items",
              list: true,
              fields: [
                {
                  type: "string",
                  name: "text",
                  label: "Item",
                },
              ],
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
        },
        {
          type: "string",
          name: "keywords",
          label: "Keywords",
        },
        {
          type: "image",
          name: "ogImage",
          label: "OG Image",
        },
      ],
    },
  ],
};

export default whitepaper;
