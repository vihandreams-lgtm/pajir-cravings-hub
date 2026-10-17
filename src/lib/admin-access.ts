/**
 * The owner-account setup is offered on the sign-in screen only while no admin
 * account exists. Once the first admin is in place it is gone for good, so
 * nobody can quietly register their own way into the kitchen manager.
 */
export const ownerSetupAllowed = (hasAdmin: boolean): boolean => !hasAdmin;

/** Turns a category name into the short code stored on each menu item. */
export function slugifyCategory(label: string): string {
  return label
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

/** A category may only be deleted once nothing still points at it. */
export const categoryHasItems = (slug: string, items: { category: string }[]): boolean =>
  items.some((i) => i.category === slug);

/** Enough of an email to recognise the account without publishing the whole thing. */
export const maskEmail = (email: string): string => {
  const [name = "", domain = ""] = email.split("@");
  if (!domain) return email;
  const hidden = Math.max(name.length - 2, 1);
  return `${name.slice(0, 2)}${"•".repeat(hidden)}@${domain}`;
};
