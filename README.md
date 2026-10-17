# Pajir Cravings

Build a warm, highly aesthetic, interactive, and mouth-watering cafe & bakery web application for "Pajir Cravings Hub" located in Kira, Uganda.

BRAND IDENTITY & DESIGN SYSTEM:
- Primary Brand Palette: Warm Burgundy/Rose (#8B3A4A), Cream Vanilla (#FDF8F5), Warm Baked Beige (#E8D5C8), and Leaf Green accents.
- Location Badge: "Kira, Uganda"
- Contact Info: Phone/WhatsApp: 0774501297 | TikTok: @pajirkitchenandoven
- Slogans: "Precision in Every Taste", "Made with Love. Served with Joy.", and "Good Food, Good Vibes Always."
- Visual Style: Soft rounded cards, smooth Framer Motion scroll animations, micro-interactions, subtle 3D hover scale on food images, and floating order buttons.

REQUIRED SECTIONS & COMPONENTS:

1. NAVIGATION & HERO SECTION:
   - Header with logo title "Pajir Cravings Hub" and a dynamic cart icon badge.
   - Hero banner displaying "Location: Kira, Uganda" with the headline "Precision in Every Taste".
   - Primary CTAs: "View Full Menu" (smooth scroll) and "Order via WhatsApp" (opens WhatsApp to 0774501297).

2. SPECIAL FEATURES BANNER:
   - Interactive Loyalty Program Widget: "Buy 10 Times • Get 1 Free Gift" featuring a 10-stamp tracker preview.
   - "Business Ethics with Jireh" Quote Card: "REMINDER: The strongest business decisions are guided by reason, not emotion."

3. DYNAMIC CMS-POWERED INTERACTIVE MENU (Searchable + Category Tabs):
   - Integration: Connect a headless CMS (Sanity.io or Supabase) backend schema so the menu items, prices, and images are dynamically fetched via an API and fully manageable via an admin view.
   - Tabs: [All Items], [100% Natural Juices & Smoothies], [Pajir Oven & Cookies], [Pajir Kitchen & Breakfast], [Soups & Special Platters].

   Initial Seed Items & Official Pricing (UGX):
   * Fresh Fruit Juice (500ml) - 2,000 UGX
   * Mixed Fruit Juice (500ml) - 4,000 UGX
   * 3-Litre Jerrycan Juice - 25,000 UGX
   * 5-Litre Jerrycan Juice - 40,000 UGX
   * Fresh Cookies (5 Pieces Pack) - 1,000 UGX
   * Medium Cookie Tin (60 cookies) - 16,000 UGX
   * Large Digestive Cookie Tin (118 cookies) - 32,000 UGX
   * Breakfast Platter (2 Fried Eggs, 2 Sausages, Irish Potatoes, Toasted Bread, Chapati, Fresh Fruit) - 25,000 UGX
   * Strawberry & Banana Smoothie - 12,000 UGX
   * Avocado & Honey Smoothie (Avocado, Banana, Milk, Honey) - 12,000 UGX
   * Green Detox Smoothie (Apple, Cucumber, Spinach, Ginger) - 12,000 UGX
   * Signature Pumpkin Soup - 15,000 UGX
   * Chef's Special Crispy Fish with Mashed Potatoes & Wedges - 35,000 UGX
   * Nuggets with White Rice, Salad & Ketchup - 20,000 UGX
   * Yogurt Parfait Bowl - 18,000 UGX

4. SLIDE-OUT CART & DYNAMIC WHATSAPP ORDER SYSTEM:
   - Every product card features "Add to Cart" and "Quick Order via WhatsApp" buttons.
   - Slide-out Cart Drawer with quantity controls (+ / -), subtotal calculations in UGX, and a text field for "Delivery Location / Special Instructions in Kira".
   - The "Checkout via WhatsApp" button formats a pre-filled WhatsApp message sent to "256774501297".

   Default WhatsApp Message Format:
   "Hello Pajir Cravings Hub! 👋 I would like to place an order:
   - [Quantity]x [Item Name] ([Item Total Price] UGX)
   Total: [Total Price] UGX
   Delivery Location: [User Location / Address]
   Is this available for delivery right now?"

5. SOCIAL PROOF & TESTIMONIAL CAROUSEL:
   - Showcase WhatsApp review cards (e.g. "Thank you for the juice, it's really nice! Putting the rest in the fridge", "Last time I took 7 cookies and my colleagues asked where the rest were!").

6. CLIENT ADMIN DASHBOARD LINK (CMS ACCESS):
   - Provide a clean, protected `/admin` route or dashboard link where Jireh can securely log in on her phone or laptop to add new daily treats, update prices, or toggle discounts in real time without touching code.

7. FOOTER:
   - Business Info: Kira, Uganda | Phone: 0774501297 | TikTok: @pajirkitchenandoven
   - Hours of operation notice: "Freshly prepared every morning with quality ingredients."

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://pajir-cravings.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/6cb240fd-45b1-4f9f-8d0a-ebafff4a4386).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
