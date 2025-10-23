import type { Collection } from "tinacms";

const tradeVideos: Collection = {
  name: "tradevideos",
  label: "Trade Page Videos",
  path: "src/content/tradevideos",
  format: "json",
  ui: {
    allowedActions: {
      create: true,
      delete: true,
    },
  },
  fields: [
    {
      type: "string",
      name: "title",
      label: "Video Title",
      required: true,
    },
    {
      type: "string",
      name: "videoId",
      label: "YouTube Video ID",
      required: true,
      description: "11-character YouTube video identifier",
    },
    {
      type: "string",
      name: "description",
      label: "Short Description",
      ui: {
        component: "textarea",
      },
    },
    {
      type: "boolean",
      name: "featured",
      label: "Featured",
      description: "Use as the primary video on the trade page",
    },
    {
      type: "number",
      name: "order",
      label: "Display Order",
      description: "Lower numbers appear first",
    },
    {
      type: "datetime",
      name: "publishedAt",
      label: "Published Date",
      ui: {
        timeFormat: "HH:mm",
      },
    },
  ],
};

export default tradeVideos;
