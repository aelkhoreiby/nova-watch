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
  type: string;
  price: string;
  tone: ProductTone;
  detail: string;
  checkoutUrl: string;
  slug?: string;
  currency?: string;
  quantity?: number;
  available?: boolean;
  media?: ProductMedia;
};

export const lifestyles: Lifestyle[] = ["OFFICE", "NIGHT", "DATE", "TRAVEL"];

export const featureCopy = {
  CASE: "The silhouette defines the presence.",
  DIAL: "The face keeps the essentials clear.",
  STRAP: "The finishing detail completes the look.",
  FINISH: "Every surface is part of the visual language.",
} as const;

export const fallbackProduct: Product = {
  id: "catalog-unavailable",
  name: "NOVA",
  type: "NOVA",
  price: "—",
  tone: "ivory",
  detail: "Live catalog temporarily unavailable.",
  checkoutUrl: "",
};
