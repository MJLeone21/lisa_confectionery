/**
 * Seed script — populates MongoDB with an admin user, starter products,
 * blog posts, and a couple of sample testimonials/offers so the site
 * isn't empty on first run.
 *
 * Usage:  npm run seed
 * Re-running it is safe — it clears these collections first, so run it
 * again any time you want to reset back to the starter data.
 */
require("dotenv").config();
const connectDB = require("../config/db");
const User = require("../models/User");
const Product = require("../models/Product");
const BlogPost = require("../models/BlogPost");
const Testimonial = require("../models/Testimonial");
const Offer = require("../models/Offer");
const StockItem = require("../models/StockItem");
const Order = require("../models/Order");

const products = [
  {
    name: "Bridal Shower Cake — Classic White",
    category: "bridal",
    image: "bride_cake.jpg",
    priceLabel: "From UGX 55,000",
    note: "Ordinary flavour pricing shown; fondant finish +UGX 20,000.",
    order: 1,
  },
  {
    name: "Bridal Shower Cake — Rose Gold",
    category: "bridal",
    image: "bridal_pink.jpg",
    priceLabel: "From UGX 55,000",
    note: "Ordinary flavour pricing shown; fondant finish +UGX 20,000.",
    order: 2,
  },
  {
    name: "Kids Birthday Cake — Princess Tiered",
    category: "kids",
    image: "girls_tiered2_purple.jpg",
    priceLabel: "From UGX 55,000",
    note: "Character toppers priced under Extras.",
    order: 1,
  },
  {
    name: "Kids Birthday Cake — Superhero Tiered",
    category: "kids",
    image: "boys_tiered2_batman.jpg",
    priceLabel: "From UGX 55,000",
    note: "Character toppers priced under Extras.",
    order: 2,
  },
  {
    name: "Wedding Cake — Classic White Tiers",
    category: "wedding",
    image: "wedding3_white.jpg",
    priceLabel: "Custom quote",
    note: "Tiered wedding cakes are quoted individually.",
    order: 1,
  },
  {
    name: "Wedding Cake — Rose Garden",
    category: "wedding",
    image: "wedding4_red_roses.jpg",
    priceLabel: "Custom quote",
    note: "Tiered wedding cakes are quoted individually.",
    order: 2,
  },
  {
    name: "Baby Shower Cake — Teddy Bears",
    category: "babyshower",
    image: "babyshower_bears.jpg",
    priceLabel: "From UGX 55,000",
    order: 1,
  },
  {
    name: "Baby Shower Cake — Moon & Stars",
    category: "babyshower",
    image: "babyshower_moon.jpg",
    priceLabel: "From UGX 55,000",
    order: 2,
  },
  {
    name: "Introduction Cake — Top Hats",
    category: "introduction",
    image: "intro_hats.jpg",
    priceLabel: "Custom quote",
    note: "Introduction sets are quoted individually.",
    order: 1,
  },
  {
    name: "Introduction Cake — Red & Gold Tiers",
    category: "introduction",
    image: "intro_red_gold.jpg",
    priceLabel: "Custom quote",
    note: "Introduction sets are quoted individually.",
    order: 2,
  },
  {
    name: "Glazed Doughnuts",
    category: "treats",
    image: "glazed_doughnuts.jpg",
    priceLabel: "UGX 25,000 – 60,000",
    order: 1,
  },
  {
    name: "Bento Box",
    category: "treats",
    image: "bento_box.jpg",
    priceLabel: "UGX 45,000",
    order: 2,
  },
  {
    name: "Cupcakes",
    category: "treats",
    image: "cupcakes.jpg",
    priceLabel: "UGX 25,000 – 70,000",
    note: "Final price depends on design.",
    order: 3,
  },
  {
    name: "Easter Cake",
    category: "treats",
    image: "girls_cakes3.jpg",
    priceLabel: "UGX 60,000 – 110,000",
    order: 4,
  },
];

const blogPosts = [
  {
    title: "How to store and transport your cake",
    slug: "how-to-store-and-transport-your-cake",
    tag: "Cake care",
    excerpt: "A quick guide from our kitchen to yours.",
    coverImage: "wedding3_white.jpg",
    body: `A cake's journey doesn't end when it leaves our kitchen — how it's stored and moved matters just as much as how it's baked. Here's how to keep it looking (and tasting) its best.

Before the event: keep the cake in its box, in a cool room away from direct sunlight and heat. If refrigerating, leave it in the fridge until 30–60 minutes before serving so the icing isn't too firm to cut. Avoid stacking anything on top of the box, even briefly.

During transport: place the cake flat on a solid surface in the car — the boot or floor of the back seat, not the seat itself. Use a non-slip mat or towel underneath the box to stop it sliding on corners. Keep the air conditioning on if it's a hot day, especially for fondant or whipped cream finishes. Drive gently — treat corners and speed bumps as if the cake were a passenger.

On the day: unbox your cake as close to serving time as possible, and keep it away from open windows, fans or direct sun while on display. For tiered cakes, we'll always brief you on the specific supports used so you know what to expect when serving.

If anything shifts in transit, don't panic — message us a photo and we can usually talk you through a quick fix.`,
  },
  {
    title: "Choosing a flavour for your occasion",
    slug: "choosing-a-flavour-for-your-occasion",
    tag: "Celebration ideas",
    excerpt:
      "A quick guide to matching cake flavours with the season and the celebration.",
    coverImage: "cupcakes.jpg",
    body: `With flavours ranging from classic vanilla to black forest, picking one can be the hardest part of ordering. Here's how we'd think about it.

For weddings & introductions: red velvet and chocolate fudge are popular for their rich colour when sliced and their crowd-pleasing taste. If you're serving a large mixed crowd, consider two flavours split across tiers.

For birthdays: this is where you can have fun — bubblegum, butterscotch and marble are favourites with children, while coffee, caramel and mint suit an adult crowd.

For showers: lighter, fruity flavours like strawberry, pineapple or mango tend to suit daytime shower gatherings well, especially when paired with whipped cream icing rather than heavier fondant.

Still not sure? Tell us the occasion and the crowd when you book and we'll recommend a flavour.`,
  },
  {
    title: "From sketch to cake: how we design a custom order",
    slug: "from-sketch-to-cake-how-we-design-a-custom-order",
    tag: "Behind the scenes",
    excerpt: "A look at how an idea becomes the cake on your table.",
    coverImage: "intro_hats.jpg",
    body: `Every custom cake starts the same way: a booking. Here's what happens between that first form submission and the finished cake.

1. The brief — you share your occasion, date, guest count and any inspiration photos or colours. We ask questions to understand the vibe: elegant and minimal, or bold and colourful?

2. The plan — we match your brief to a size and flavour from our price list, confirm any extras like fondant, toppers or fresh flowers, and lock in your pickup or delivery date.

3. The bake — cakes are baked fresh, never premade. Tiered and fondant designs are built and decorated over one to several days depending on complexity.

4. The reveal — we share a photo before pickup or delivery so you know exactly what to expect, and then it's over to you to celebrate.`,
  },
];

const testimonials = [
  {
    name: "Grace K.",
    quote:
      "The cake was even more beautiful in person, and it tasted incredible. Everyone at the introduction asked who made it!",
    rating: 5,
    cakeType: "Introduction cake",
    approved: true,
  },
  {
    name: "Brian T.",
    quote:
      "Booked a superhero cake for my son's birthday and the whole process was so easy. Will be ordering again.",
    rating: 5,
    cakeType: "Kids' birthday cake",
    approved: true,
  },
  {
    name: "Faith A.",
    quote:
      "Professional, on time, and the baby shower cake matched our theme perfectly.",
    rating: 5,
    cakeType: "Baby shower cake",
    approved: true,
  },
];

const offers = [
  {
    title: "Easter Cake Bundle",
    description: "Small Easter cake + 6 cupcakes.",
    image: "girls_cakes3.jpg",
    wasPrice: 120000,
    nowPrice: 100000,
    active: true,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  },
];

const daysAgo = (n) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);

const stockItems = [
  {
    name: "Flour, 25kg bag",
    category: "Ingredient",
    quantity: 25,
    unit: "kg",
    cost: 180000,
    supplier: "Kampala Wholesale",
    purchaseDate: daysAgo(20),
  },
  {
    name: "Granulated sugar, 50kg",
    category: "Ingredient",
    quantity: 50,
    unit: "kg",
    cost: 310000,
    supplier: "Kampala Wholesale",
    purchaseDate: daysAgo(20),
  },
  {
    name: "Eggs, 30-tray x4",
    category: "Ingredient",
    quantity: 120,
    unit: "pcs",
    cost: 96000,
    supplier: "Local market",
    purchaseDate: daysAgo(12),
  },
  {
    name: "Fresh cream, 5L",
    category: "Ingredient",
    quantity: 5,
    unit: "litres",
    cost: 150000,
    supplier: "Brookside",
    purchaseDate: daysAgo(9),
  },
  {
    name: "Fondant icing, 10kg",
    category: "Ingredient",
    quantity: 10,
    unit: "kg",
    cost: 220000,
    supplier: "Baker\u2019s Corner",
    purchaseDate: daysAgo(6),
  },
  {
    name: "Cake boxes, assorted sizes",
    category: "Packaging",
    quantity: 100,
    unit: "pcs",
    cost: 250000,
    supplier: "Kampala Wholesale",
    purchaseDate: daysAgo(15),
  },
  {
    name: "Edible decor (pearls, flowers)",
    category: "Decoration",
    quantity: 1,
    unit: "lot",
    cost: 90000,
    supplier: "Baker\u2019s Corner",
    purchaseDate: daysAgo(3),
  },
];

// A couple of demo orders so the dashboard isn't empty on first run —
// safe to edit or delete from the dashboard once you have real bookings.
const demoOrders = [
  {
    name: "Grace Kembabazi",
    phone: "0700111222",
    email: "grace@example.com",
    occasion: "Introduction / Traditional marriage",
    cakeType: "Introduction Cake",
    size: 'Large — 12" / 4.5kg',
    flavour: "Red Velvet",
    extras: ["Fondant finish", "Fresh flowers / faux decor"],
    eventDate: daysAgo(-4),
    fulfilment: "Pickup — Kanyanya Road, Kawempe",
    amount: 480000,
    status: "delivered",
  },
  {
    name: "Brian Tumusiime",
    phone: "0700333444",
    occasion: "Birthday",
    cakeType: "Children's Cake",
    size: 'Medium — 10" / 3kg',
    flavour: "Chocolate",
    extras: ["Personalised topper"],
    eventDate: daysAgo(-10),
    fulfilment: "Pickup — Kanyanya Road, Kawempe",
    amount: 160000,
    status: "in_progress",
  },
];

async function seed() {
  await connectDB();

  console.log("Clearing existing seed-managed collections...");
  await Promise.all([
    Product.deleteMany({}),
    BlogPost.deleteMany({}),
    Testimonial.deleteMany({}),
    Offer.deleteMany({}),
    StockItem.deleteMany({}),
  ]);

  console.log("Inserting products, blog posts, testimonials, offers, stock...");
  await Product.insertMany(products);
  await BlogPost.insertMany(blogPosts);
  await Testimonial.insertMany(testimonials);
  await Offer.insertMany(offers);
  await StockItem.insertMany(stockItems);

  const adminEmail = (
    process.env.ADMIN_EMAIL || "admin@lisaconfectionery.com"
  ).toLowerCase();

  const adminPassword = process.env.ADMIN_PASSWORD || "change-this-password";

  const existingAdmin = await User.findOne({ email: adminEmail }).select(
    "+password",
  );

  if (!existingAdmin) {
    console.log("Creating admin user:", adminEmail);

    await User.create({
      name: process.env.ADMIN_NAME || "Angel Lisa Nansubuga",
      email: adminEmail,
      phone: process.env.ADMIN_PHONE || "0706200567",
      password: adminPassword,
      role: "admin",
    });
  } else {
    console.log("Admin user already exists — updating admin details.");

    existingAdmin.name = process.env.ADMIN_NAME || "Angel Lisa Nansubuga";

    existingAdmin.phone = process.env.ADMIN_PHONE || "0706200567";

    existingAdmin.password = adminPassword;
    existingAdmin.role = "admin";

    await existingAdmin.save();

    console.log("Admin password updated successfully.");
  }

  console.log("Seed complete.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
