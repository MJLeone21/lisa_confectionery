# Lisa Confectionery — backend

A full Node.js/Express + MongoDB backend for the Lisa Confectionery site, with
server-rendered Pug views, JWT authentication, stock/inventory tracking,
revenue & profit reporting, an activity notification feed, and a customer
booking form (no shopping cart anywhere).

## Who can log in

**Only admins.** There is no customer registration anywhere on the site —
customers never create accounts. Every booking is a standalone form
submission (name, phone, email, and the order details), saved straight to
the `Order` collection. The admin dashboard is the only place with a login,
and it's linked quietly from the footer ("Admin login") rather than the main
navigation, since it isn't meant for customers.

Admin accounts are created by the seed script (see below) — there's no public
sign-up route to create more of them. To add a second admin, either run a
one-off script that calls `User.create(...)`, or insert directly into MongoDB
with a bcrypt-hashed password.

## Stack

- **Node.js + Express** — server, routing, controllers
- **MongoDB + Mongoose** — orders, stock, products, testimonials, offers, blog posts, notifications, admin users
- **Pug** — every page server-rendered from a template
- **JWT (httpOnly cookie) + bcrypt** — authentication and password hashing
- **Vanilla JS** (`public/js/main.js`) — nav toggle, menu filters, offers countdown, and every admin dashboard action (status changes, edit/delete, approve reviews, mark notifications read) via `fetch` calls to the JSON API

## Project structure

```
backend/
├── app.js                   # Express app: middleware + route mounting
├── server.js                 # Entry point — connects to MongoDB, starts the server
├── config/db.js              # Mongoose connection
├── models/                   # User, Order, Product, Testimonial, Offer, BlogPost, StockItem, Notification
├── controllers/               # Business logic for each resource
├── routes/
│   ├── pageRoutes.js          # Public marketing pages
│   ├── authRoutes.js          # Admin login/logout only — no registration
│   ├── bookingRoutes.js       # GET/POST /book — the customer booking form
│   ├── dashboardRoutes.js     # Every /dashboard/* page — all admin-only
│   └── apiRoutes.js           # JSON API under /api
├── middleware/                 # auth.js (JWT + role checks), error.js (catchAsync + handlers)
├── utils/notify.js            # Helper that writes a Notification document
├── views/                     # Pug templates
├── public/                    # css/, js/, assets/ (served statically)
├── scripts/seed.js            # Populates the DB with starter data + the admin account
├── .env.example
└── package.json
```

## Setup

1. **Install dependencies**:

   ```
   npm install
   ```

2. **Configure environment variables**:

   ```
   cp .env.example .env
   ```

   Then edit `.env` — `MONGO_URI`, `JWT_SECRET`, `WHATSAPP_NUMBER`, and the
   `ADMIN_*` values the seed script uses to create your admin login.

3. **Seed the database**:

   ```
   npm run seed
   ```

   This creates/resets: starter products, blog posts, sample testimonials,
   a sample offer, a handful of sample stock purchases (so the profit
   calculation has something to show), and two demo orders (only added if
   the `Order` collection is empty — real bookings are never touched or
   duplicated by re-running this). It also creates the admin account from
   `ADMIN_EMAIL` / `ADMIN_PASSWORD` if one doesn't already exist.

4. **Run the server**:

   ```
   npm run dev      # nodemon, auto-restarts on changes
   # or
   npm start
   ```

   Visit `http://localhost:3000`.

5. **Log in** at `/auth/login` with your `ADMIN_EMAIL` / `ADMIN_PASSWORD`,
   then go to `/dashboard`.

## The admin dashboard

`/dashboard` has seven tabs:

- **Overview** — revenue (from delivered orders), stock spend, profit, upcoming revenue, order counts, and a recent-activity log pulled from notifications.
- **Orders** — every booking, with a status dropdown (saves instantly via the API), **Edit** (full form, including setting the agreed price) and **Delete**. "+ Log an order" lets the admin record a phone/walk-in booking.
- **Stock** — every ingredient/packaging purchase logged, with Add/Edit/Delete. This is what "spend" is calculated from.
- **Products** — the public menu catalogue, fully editable.
- **Reviews** — pending testimonials (Approve / Edit / Delete) and all testimonials.
- **Offers** — promotions shown on the public offers page, Add/Edit/Delete.
- **Notifications** — the full activity log (see below), with a "mark all as read" button. A bell icon with an unread count sits in the nav on every page while logged in.

Everything here — orders, stock, products, testimonials, offers — can be
edited or deleted by the admin, exactly as asked. Deletes go through a
confirm dialog and update instantly via `fetch` without a full page reload.

## How the money numbers work

- **Revenue** = sum of `amount` across orders with status `delivered`. The
  `amount` field is filled in by the admin (on the order edit page) once a
  price is agreed with the customer — the public booking form intentionally
  doesn't ask for a price, since cakes are quoted individually.
- **Stock spend** = sum of `cost` across every `StockItem` record.
- **Profit** = revenue − stock spend.
- **Upcoming revenue** = sum of `amount` for orders still `new`, `in_progress`
  or `ready` — a rough look at what's coming in.

This is intentionally simple (no per-order cost-of-goods breakdown) — a
solid foundation you can make more precise later (e.g. linking specific
stock items to specific orders) without changing the shape of the dashboard.

## Notifications

A `Notification` document is created automatically for:

- Admin login ("X logged in successfully")
- New order received (from the public booking form or logged manually)
- Order deleted
- Stock added / stock deleted
- Testimonial submitted / approved / deleted
- Offer added / deleted
- Product added / removed

They show up in the **Notifications** tab and as a badge on the nav bell.
`utils/notify.js` is the single helper every controller calls — add a new
call there if you want to log more event types later.

## Authentication & authorization

- `POST /auth/login` — form-based, sets an httpOnly JWT cookie, redirects into `/dashboard`.
- `GET /auth/logout` — clears the cookie.
- `middleware/auth.js`:
  - `isLoggedIn` — runs on every request, attaches `req.user`/`res.locals.user` if a valid cookie is present. Never blocks.
  - `protect` — requires a logged-in user.
  - `restrictTo('admin')` — for admin-only routes (in practice, every protected route, since there's only one role now).
- Every route under `/dashboard` is wrapped in `protect + restrictTo('admin')` at the top of `routes/dashboardRoutes.js`, so nothing there is reachable without a valid admin session.

## API reference

All JSON endpoints are under `/api`. Admin-only endpoints need the JWT cookie
from an admin login (use Postman/Insomnia with cookies enabled, or your
browser session after logging in at `/auth/login`).

| Method            | Endpoint                           | Access | Description                                   |
| ----------------- | ---------------------------------- | ------ | --------------------------------------------- |
| POST              | `/api/auth/login`                  | Public | Admin login (JSON)                            |
| GET               | `/api/auth/logout`                 | Public | Clear session                                 |
| GET               | `/api/auth/me`                     | Admin  | Current admin user                            |
| POST              | `/api/orders`                      | Public | Create a booking (JSON version of the form)   |
| GET               | `/api/orders`                      | Admin  | All orders (`?status=new` to filter)          |
| GET               | `/api/orders/summary`              | Admin  | Revenue/spend/profit + counts                 |
| PATCH             | `/api/orders/:id/status`           | Admin  | Update an order's status                      |
| DELETE            | `/api/orders/:id`                  | Admin  | Delete an order                               |
| GET               | `/api/stock`                       | Admin  | All stock purchases                           |
| GET               | `/api/stock/summary`               | Admin  | Total spend                                   |
| POST/PATCH/DELETE | `/api/stock`                       | Admin  | Manage stock                                  |
| GET               | `/api/products`                    | Public | List products (`?category=wedding` to filter) |
| POST/PATCH/DELETE | `/api/products`                    | Admin  | Manage the catalogue                          |
| GET               | `/api/testimonials`                | Public | Approved reviews only                         |
| GET               | `/api/testimonials/pending`        | Admin  | Reviews awaiting approval                     |
| PATCH             | `/api/testimonials/:id/approve`    | Admin  | Approve a review                              |
| DELETE            | `/api/testimonials/:id`            | Admin  | Delete a review                               |
| GET               | `/api/offers`                      | Public | Active, unexpired offers                      |
| GET               | `/api/offers/all`                  | Admin  | Every offer                                   |
| POST/PATCH/DELETE | `/api/offers`                      | Admin  | Manage offers                                 |
| GET               | `/api/notifications`               | Admin  | Recent activity feed + unread count           |
| PATCH             | `/api/notifications/mark-all-read` | Admin  | Clear the unread badge                        |
| DELETE            | `/api/notifications/:id`           | Admin  | Delete a notification                         |

Full admin **page** routes (forms, not JSON) live under `/dashboard/...` —
e.g. `/dashboard/stock/new`, `/dashboard/orders/:id/edit` — see
`routes/dashboardRoutes.js` for the complete list.

## What's deliberately simple (next steps if you want to extend it)

- **Contact form** logs the enquiry to the server console rather than emailing it — wire up Nodemailer + a transactional email provider when you're ready.
- **Testimonials submitted publicly** go in unapproved and only appear once an admin approves them — this avoids fake/spam reviews going live automatically.
- **Profit tracking is bakery-wide, not per-order** — it doesn't yet know which stock item went into which cake. That's a reasonable next step if you want per-order cost-of-goods, but would need a way to link stock to orders.
- **Blog posts** are seeded from `scripts/seed.js` with no admin UI to write new ones yet — the model and a listing/detail route are already there, ready for one.
