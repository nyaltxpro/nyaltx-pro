import { Collection } from "tinacms";

export const pricing: Collection = {
  name: "pricing",
  label: "Pricing Content",
  path: "content/pricing",
  format: "json",
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
          name: "description",
          label: "Description",
          required: true,
          ui: {
            component: "textarea",
          },
        },
      ],
    },
    {
      type: "object",
      name: "nyaltxPro",
      label: "NyaltxPro Section",
      fields: [
        {
          type: "string",
          name: "sectionTitle",
          label: "Section Title",
          required: true,
        },
        {
          type: "string",
          name: "badge",
          label: "Badge Text",
        },
        {
          type: "string",
          name: "title",
          label: "Card Title",
          required: true,
        },
        {
          type: "string",
          name: "description",
          label: "Card Description",
          required: true,
        },
        {
          type: "number",
          name: "price",
          label: "Price (USD)",
          required: true,
        },
        {
          type: "object",
          name: "features",
          label: "Features",
          list: true,
          fields: [
            {
              type: "string",
              name: "text",
              label: "Feature Text",
            },
          ],
        },
        {
          type: "string",
          name: "bannerTitle",
          label: "Banner Title",
        },
        {
          type: "string",
          name: "bannerDescription",
          label: "Banner Description",
        },
        {
          type: "string",
          name: "proMessage",
          label: "Pro Member Message",
        },
      ],
    },
    {
      type: "object",
      name: "raceToLiberty",
      label: "Race to Liberty Section",
      fields: [
        {
          type: "string",
          name: "sectionTitle",
          label: "Section Title",
          required: true,
        },
        {
          type: "object",
          name: "tiers",
          label: "Tiers",
          list: true,
          ui: {
            itemProps: item => ({
              label: item?.name || item?.id || "Tier",
            }),
          },
          fields: [
            {
              type: "string",
              name: "id",
              label: "ID",
              required: true,
            },
            {
              type: "string",
              name: "name",
              label: "Name",
              required: true,
            },
            {
              type: "string",
              name: "description",
              label: "Description",
              required: true,
              ui: {
                component: "textarea",
              },
            },
            {
              type: "number",
              name: "priceUSD",
              label: "Price (USD)",
              required: true,
            },
            {
              type: "boolean",
              name: "isPopular",
              label: "Mark as Popular",
            },
            {
              type: "string",
              name: "popularBadge",
              label: "Popular Badge Text",
            },
            {
              type: "object",
              name: "features",
              label: "Features",
              list: true,
              fields: [
                {
                  type: "string",
                  name: "text",
                  label: "Feature Text",
                },
              ],
            },
            {
              type: "string",
              name: "buttonText",
              label: "Button Text",
              required: true,
            },
            {
              type: "string",
              name: "buttonSubtext",
              label: "Button Subtext",
            },
          ],
        },
      ],
    },
    {
      type: "object",
      name: "boostPacks",
      label: "Boost Packs Section",
      fields: [
        {
          type: "string",
          name: "sectionTitle",
          label: "Section Title",
          required: true,
        },
        {
          type: "string",
          name: "description",
          label: "Description",
          required: true,
          ui: {
            component: "textarea",
          },
        },
        {
          type: "string",
          name: "subDescription",
          label: "Sub Description",
          ui: {
            component: "textarea",
          },
        },
        {
          type: "object",
          name: "packs",
          label: "Boost Packs",
          list: true,
          ui: {
            itemProps: item => ({
              label: item?.name || item?.id || "Pack",
            }),
          },
          fields: [
            {
              type: "string",
              name: "id",
              label: "ID",
              required: true,
            },
            {
              type: "string",
              name: "name",
              label: "Name",
              required: true,
            },
            {
              type: "number",
              name: "points",
              label: "Points",
            },
            {
              type: "number",
              name: "priceUSD",
              label: "Price (USD)",
              required: true,
            },
            {
              type: "string",
              name: "description",
              label: "Description",
              required: true,
              ui: {
                component: "textarea",
              },
            },
            {
              type: "string",
              name: "icon",
              label: "Icon (emoji)",
            },
            {
              type: "boolean",
              name: "isPopular",
              label: "Mark as Popular",
            },
            {
              type: "string",
              name: "popularBadge",
              label: "Popular Badge Text",
            },
            {
              type: "string",
              name: "buttonText",
              label: "Button Text",
            },
            {
              type: "string",
              name: "buttonSubtext",
              label: "Button Subtext",
            },
          ],
        },
      ],
    },
    {
      type: "object",
      name: "footer",
      label: "Footer Text",
      fields: [
        {
          type: "string",
          name: "paymentMethods",
          label: "Payment Methods Text",
          ui: {
            component: "textarea",
          },
        },
        {
          type: "string",
          name: "technicalNote",
          label: "Technical Note",
          ui: {
            component: "textarea",
          },
        },
        {
          type: "string",
          name: "networkFees",
          label: "Network Fees Note",
          ui: {
            component: "textarea",
          },
        },
        {
          type: "string",
          name: "paypalNote",
          label: "PayPal Note",
          ui: {
            component: "textarea",
          },
        },
      ],
    },
  ],
};

export default pricing;
