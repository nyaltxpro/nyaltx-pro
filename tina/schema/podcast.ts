import type { Collection } from "tinacms";

const podcast: Collection = {
  name: "podcast",
  label: "Podcast Page",
  path: "src/content/podcast",
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
      label: "Description",
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
          name: "badge",
          label: "Badge Text",
        },
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
        {
          type: "object",
          name: "host",
          label: "Host",
          fields: [
            {
              type: "string",
              name: "name",
              label: "Host Name",
              required: true,
            },
            {
              type: "string",
              name: "title",
              label: "Host Title",
            },
            {
              type: "string",
              name: "bio",
              label: "Host Bio",
              ui: {
                component: "textarea",
              },
            },
            {
              type: "image",
              name: "photo",
              label: "Host Photo",
            },
            {
              type: "string",
              name: "twitter",
              label: "Host X (Twitter) URL",
            },
            {
              type: "string",
              name: "linkedin",
              label: "Host LinkedIn URL",
            },
          ],
        },
      ],
    },
    {
      type: "object",
      name: "schedule",
      label: "Podcast Schedule",
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
          name: "episodes",
          label: "Upcoming Episodes",
          list: true,
          ui: {
            itemProps: (item) => ({
              label: item?.topic || item?.guest?.name || "Episode",
            }),
          },
          fields: [
            {
              type: "datetime",
              name: "datetime",
              label: "Broadcast Date & Time",
              required: true,
            },
            {
              type: "string",
              name: "duration",
              label: "Duration",
            },
            {
              type: "string",
              name: "topic",
              label: "Topic",
              required: true,
            },
            {
              type: "string",
              name: "description",
              label: "Episode Summary",
              ui: {
                component: "textarea",
              },
            },
            {
              type: "object",
              name: "guest",
              label: "Guest",
              fields: [
                {
                  type: "string",
                  name: "name",
                  label: "Guest Name",
                  required: true,
                },
                {
                  type: "string",
                  name: "title",
                  label: "Guest Title",
                },
                {
                  type: "string",
                  name: "bio",
                  label: "Guest Bio",
                  ui: {
                    component: "textarea",
                  },
                },
                {
                  type: "image",
                  name: "photo",
                  label: "Guest Photo",
                },
                {
                  type: "string",
                  name: "twitter",
                  label: "Guest X (Twitter) URL",
                },
                {
                  type: "string",
                  name: "linkedin",
                  label: "Guest LinkedIn URL",
                },
              ],
            },
            {
              type: "object",
              name: "resources",
              label: "Links",
              list: true,
              fields: [
                {
                  type: "string",
                  name: "label",
                  label: "Link Label",
                },
                {
                  type: "string",
                  name: "url",
                  label: "URL",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      type: "object",
      name: "pastEpisodes",
      label: "Past Episodes",
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
          name: "episodes",
          label: "Episodes",
          list: true,
          ui: {
            itemProps: (item) => ({
              label: item?.topic || item?.guest?.name || "Episode",
            }),
          },
          fields: [
            {
              type: "string",
              name: "topic",
              label: "Topic",
              required: true,
            },
            {
              type: "string",
              name: "summary",
              label: "Summary",
              ui: {
                component: "textarea",
              },
            },
            {
              type: "object",
              name: "guest",
              label: "Guest",
              fields: [
                {
                  type: "string",
                  name: "name",
                  label: "Guest Name",
                },
                {
                  type: "string",
                  name: "title",
                  label: "Guest Title",
                },
                {
                  type: "image",
                  name: "photo",
                  label: "Guest Photo",
                },
              ],
            },
            {
              type: "string",
              name: "recordingUrl",
              label: "Recording URL",
            },
          ],
        },
      ],
    },
    {
      type: "object",
      name: "cta",
      label: "Call To Action",
      fields: [
        {
          type: "string",
          name: "title",
          label: "CTA Title",
        },
        {
          type: "string",
          name: "description",
          label: "CTA Description",
          ui: {
            component: "textarea",
          },
        },
        {
          type: "string",
          name: "buttonLabel",
          label: "Button Label",
        },
        {
          type: "string",
          name: "buttonLink",
          label: "Button Link",
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
          label: "Meta Keywords",
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

export default podcast;
