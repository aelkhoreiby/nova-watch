type NovaEventName =
  | "view_content"
  | "select_product"
  | "select_lifestyle"
  | "click_buy"
  | "open_quick_view"
  | "open_store";

type NovaEventPayload = Record<string, string | number | boolean | undefined>;

export function trackNovaEvent(name: NovaEventName, payload: NovaEventPayload = {}) {
  if (typeof window === "undefined") return;

  const event = {
    event: `nova_${name}`,
    ...payload,
  };

  const dataLayer = (window as Window & { dataLayer?: Record<string, unknown>[] }).dataLayer;
  if (Array.isArray(dataLayer)) dataLayer.push(event);

  const fbq = (
    window as Window & {
      fbq?: (...args: unknown[]) => void;
    }
  ).fbq;

  if (typeof fbq === "function") {
    if (name === "view_content") {
      fbq("track", "ViewContent", payload);
    } else {
      fbq("trackCustom", `NOVA_${name.toUpperCase()}`, payload);
    }
  }

  window.dispatchEvent(new CustomEvent("nova:analytics", { detail: event }));
}
