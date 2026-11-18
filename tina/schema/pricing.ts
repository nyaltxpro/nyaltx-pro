import { Collection } from "tinacms";

export const pricing: Collection = {
  name: "pricing",
  label: "Pricing",
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
      name: "newsPublishing",
      label: "News Publishing Section",
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
          type: "object",
          name: "plans",
          label: "News Publishing Plans",
          list: true,
          ui: {
            itemProps: item => ({
              label: item?.name || "News Plan",
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
              name: "ctaText",
              label: "Button Text",
              required: true,
            },
            {
              type: "string",
              name: "ctaLink",
              label: "Button Link",
              required: true,
            },
          ],
        },
      ],
    },
    {
      type: "object",
      name: "fintechMedia",
      label: "Fintech Media & Advertising Section",
      fields: [
        {
          type: "string",
          name: "sectionTitle",
          label: "Section Label",
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
          name: "description",
          label: "Description",
          required: true,
          ui: { component: "textarea" },
        },
        {
          type: "object",
          name: "plans",
          label: "Media Plans",
          list: true,
          ui: {
            itemProps: item => ({
              label: item?.name || "Media Plan",
            }),
          },
          fields: [
            { type: "string", name: "id", label: "ID", required: true },
            { type: "string", name: "tag", label: "Card Label" },
            { type: "string", name: "name", label: "Name", required: true },
            { type: "string", name: "price", label: "Price", required: true },
            {
              type: "string",
              name: "description",
              label: "Description",
              required: true,
              ui: { component: "textarea" },
            },
            {
              type: "object",
              name: "features",
              label: "Features",
              list: true,
              fields: [
                { type: "string", name: "text", label: "Feature Text" },
              ],
            },
            { type: "string", name: "ctaText", label: "Button Text", required: true },
            { type: "string", name: "ctaLink", label: "Button Link", required: true },
          ],
        },
      ],
    },
    {
      type: "object",
      name: "corporateRoadshow",
      label: "Corporate Roadshow Section",
      fields: [
        {
          type: "string",
          name: "sectionTitle",
          label: "Section Label",
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
          name: "description",
          label: "Description",
          required: true,
          ui: { component: "textarea" },
        },
        {
          type: "object",
          name: "plans",
          label: "Roadshow Plans",
          list: true,
          ui: {
            itemProps: item => ({
              label: item?.name || "Roadshow Plan",
            }),
          },
          fields: [
            { type: "string", name: "id", label: "ID", required: true },
            { type: "string", name: "tag", label: "Card Label" },
            { type: "string", name: "name", label: "Name", required: true },
            { type: "string", name: "price", label: "Price", required: true },
            {
              type: "string",
              name: "description",
              label: "Description",
              required: true,
              ui: { component: "textarea" },
            },
            { type: "string", name: "ctaText", label: "Button Text", required: true },
            { type: "string", name: "ctaLink", label: "Button Link", required: true },
          ],
        },
        {
          type: "object",
          name: "campaign",
          label: "Custom Media Campaign",
          fields: [
            { type: "string", name: "tag", label: "Card Label" },
            { type: "string", name: "title", label: "Title", required: true },
            {
              type: "string",
              name: "description",
              label: "Description",
              required: true,
              ui: { component: "textarea" },
            },
            { type: "string", name: "ctaText", label: "Button Text", required: true },
            { type: "string", name: "ctaLink", label: "Button Link", required: true },
          ],
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
          type: "image",
          name: "bannerImage",
          label: "Race to Liberty Banner Image",
          description: "Image shown on the Race to Liberty card (Statue of Liberty campaign banner)",
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
