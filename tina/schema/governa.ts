import type { Collection } from "tinacms";

const governa: Collection = {
  name: "governa",
  label: "Governa Landing Page",
  path: "content/public-pages",
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
      label: "Page Description",
      ui: {
        component: "textarea",
      },
    },
    {
      type: "object",
      name: "nav",
      label: "Navigation",
      fields: [
        {
          type: "string",
          name: "brandText",
          label: "Brand Text",
        },
        {
          type: "string",
          name: "brandHref",
          label: "Brand Link",
        },
        {
          type: "string",
          name: "ctaText",
          label: "CTA Text",
        },
        {
          type: "string",
          name: "ctaHref",
          label: "CTA Link",
        },
      ],
    },
    {
      type: "object",
      name: "hero",
      label: "Hero Section",
      fields: [
        {
          type: "string",
          name: "eyebrow",
          label: "Eyebrow Label",
        },
        {
          type: "string",
          name: "heading",
          label: "Heading",
          required: true,
        },
        {
          type: "string",
          name: "highlight",
          label: "Highlight Text",
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
          name: "primaryCta",
          label: "Primary CTA",
          fields: [
            {
              type: "string",
              name: "label",
              label: "Label",
            },
            {
              type: "string",
              name: "href",
              label: "Link",
            },
          ],
        },
        {
          type: "object",
          name: "secondaryCta",
          label: "Secondary CTA",
          fields: [
            {
              type: "string",
              name: "label",
              label: "Label",
            },
            {
              type: "string",
              name: "href",
              label: "Link",
            },
          ],
        },
        {
          type: "object",
          name: "floatingCards",
          label: "Floating Cards",
          list: true,
          ui: {
            itemProps: (item) => ({
              label: item?.alt || item?.image || "Floating Card",
            }),
          },
          fields: [
            {
              type: "image",
              name: "image",
              label: "Image",
            },
            {
              type: "string",
              name: "alt",
              label: "Alt Text",
            },
            {
              type: "number",
              name: "width",
              label: "Width",
            },
            {
              type: "number",
              name: "height",
              label: "Height",
            },
          ],
        },
      ],
    },
    {
      type: "object",
      name: "comparisonSection",
      label: "Comparison Section",
      fields: [
        {
          type: "string",
          name: "title",
          label: "Section Title",
        },
        {
          type: "object",
          name: "withGovernance",
          label: "With Governance Card",
          fields: [
            {
              type: "string",
              name: "title",
              label: "Card Title",
            },
            {
              type: "string",
              name: "icon",
              label: "Icon Text",
            },
            {
              type: "object",
              name: "benefits",
              label: "Benefits",
              list: true,
              fields: [
                {
                  type: "string",
                  name: "text",
                  label: "Benefit",
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
          name: "withoutGovernance",
          label: "Without Governance Card",
          fields: [
            {
              type: "string",
              name: "title",
              label: "Card Title",
            },
            {
              type: "string",
              name: "icon",
              label: "Icon Text",
            },
            {
              type: "object",
              name: "benefits",
              label: "Benefits",
              list: true,
              fields: [
                {
                  type: "string",
                  name: "text",
                  label: "Benefit",
                  ui: {
                    component: "textarea",
                  },
                },
              ],
            },
          ],
        },
      ],
    },
    {
      type: "object",
      name: "ctaSection",
      label: "CTA Section",
      fields: [
        {
          type: "string",
          name: "title",
          label: "Title",
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
          type: "object",
          name: "primaryCta",
          label: "Primary CTA",
          fields: [
            {
              type: "string",
              name: "label",
              label: "Label",
            },
            {
              type: "string",
              name: "href",
              label: "Link",
            },
          ],
        },
        {
          type: "object",
          name: "secondaryCta",
          label: "Secondary CTA",
          fields: [
            {
              type: "string",
              name: "label",
              label: "Label",
            },
            {
              type: "string",
              name: "href",
              label: "Link",
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
          name: "twitterTitle",
          label: "Twitter Title",
        },
        {
          type: "string",
          name: "twitterDescription",
          label: "Twitter Description",
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

export default governa;
