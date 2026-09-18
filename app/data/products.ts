export type ProductTone = "ivory" | "steel" | "black" | "bronze";
export type Lifestyle = "OFFICE" | "NIGHT" | "DATE" | "TRAVEL";

export type ProductMedia = {
  hero?: string;
  detail?: string;
  dial?: string;
  wrist?: string;
  lifestyle?: Partial<Record<Lifestyle, string>>;
};

export type Product = {
  id: string;
  name: string;
  type: "CLASSIC" | "URBAN" | "NIGHT" | "SIGNATURE";
  price: string;
  tone: ProductTone;
  detail: string;
  checkoutUrl: string;
  media?: ProductMedia;
};

export const products: Product[] = [
  {
    id: "nova-arc",
    name: "NOVA ARC",
    type: "CLASSIC",
    price: "AED 299",
    tone: "ivory",
    detail: "Clean lines. Everyday precision.",
    checkoutUrl: "",
    media: {
      // Add verified product files when available.
      // hero: "/products/nova-arc/hero.webp",
      // detail: "/products/nova-arc/detail.webp",
      // dial: "/products/nova-arc/dial.webp",
      // wrist: "/products/nova-arc/wrist.webp",
      // lifestyle: {
      //   OFFICE: "/products/nova-arc/office.webp",
      //   NIGHT: "/products/nova-arc/night.webp",
      //   DATE: "/products/nova-arc/date.webp",
      //   TRAVEL: "/products/nova-arc/travel.webp",
      // },
    },
  },
  {
    id: "nova-grid",
    name: "NOVA GRID",
    type: "URBAN",
    price: "AED 329",
    tone: "steel",
    detail: "Sharp geometry for city hours.",
    checkoutUrl: "",
  },
  {
    id: "nova-noir",
    name: "NOVA NOIR",
    type: "NIGHT",
    price: "AED 349",
    tone: "black",
    detail: "A darker expression after sunset.",
    checkoutUrl: "",
  },
  {
    id: "nova-signature",
    name: "NOVA SIGNATURE",
    type: "SIGNATURE",
    price: "AED 399",
    tone: "bronze",
    detail: "The statement piece.",
    checkoutUrl: "",
  },
];

export const lifestyles: Lifestyle[] = ["OFFICE", "NIGHT", "DATE", "TRAVEL"];

export const featureCopy = {
  CASE: "The silhouette defines the presence.",
  DIAL: "The face keeps the essentials clear.",
  STRAP: "The finishing detail completes the look.",
  FINISH: "Every surface is part of the visual language.",
} as const;
