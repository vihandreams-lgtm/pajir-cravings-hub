import { describe, expect, it } from "vitest";
import { categoryHasItems, maskEmail, ownerSetupAllowed, slugifyCategory } from "@/lib/admin-access";

describe("Admin access rules", () => {
  it("offers the owner account setup only while no admin exists", () => {
    expect(ownerSetupAllowed(false)).toBe(true);
    expect(ownerSetupAllowed(true)).toBe(false);
  });

  it("names a new category from the label the owner typed", () => {
    expect(slugifyCategory("Pajir Oven & Cookies")).toBe("pajir-oven-cookies");
    expect(slugifyCategory("  100% Natural Juices & Smoothies ")).toBe("100-natural-juices-smoothies");
  });

  it("keeps a category that still holds treats", () => {
    const items = [{ category: "oven" }, { category: "juices" }];
    expect(categoryHasItems("oven", items)).toBe(true);
    expect(categoryHasItems("soups", items)).toBe(false);
  });

  it("hides most of a manager's email in the access list", () => {
    expect(maskEmail("jireh@gmail.com")).toBe("ji•••@gmail.com");
  });
});
