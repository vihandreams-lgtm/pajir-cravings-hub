import { describe, expect, it } from "vitest";
import { buildOrderMessage, finalPrice, whatsappLink } from "@/lib/menu";

describe("WhatsApp order", () => {
  it("formats items, total and location", () => {
    const msg = buildOrderMessage(
      [
        { name: "Fresh Fruit Juice (500ml)", qty: 3, unitPrice: 2000 },
        { name: "Signature Pumpkin Soup", qty: 1, unitPrice: 15000 },
      ],
      "Kira Town",
    );
    expect(msg).toContain("- 3x Fresh Fruit Juice (500ml) (6,000 UGX)");
    expect(msg).toContain("Total: 21,000 UGX");
    expect(msg).toContain("Delivery Location: Kira Town");
  });
  it("sends to 256774501297", () => {
    expect(whatsappLink("hi")).toMatch(/^https:\/\/wa\.me\/256774501297\?/);
  });
  it("applies discounts", () => {
    expect(finalPrice({ price: 20000, discount_percent: 10 })).toBe(18000);
  });
});
