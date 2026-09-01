# Abinash Catering — Full-Stack Website

A complete, responsive catering business website built with **HTML5, CSS3, vanilla JavaScript, Python Flask, and Supabase (PostgreSQL)**.

Includes a public marketing site (home, about, services, menu, gallery, contact, booking), a JSON API layer, and a password-protected admin dashboard for managing bookings, contact messages, menu items, gallery photos and testimonials.

> **Note on images:** No real Abinash Catering photography was available, so this project ships with original, brand-styled placeholder graphics (maroon/gold cards with labels) generated for this project — not copied from any reference site. Swap the files in `static/images/` with real photos whenever you're ready; the folder structure and filenames are already wired into the templates and database seed data.

---

## 1. Requirements

- Python 3.10+
- A free [Supabase](https://supabase.com) account (optional — see "Demo Mode" below)

---

## 2. Install Python and create a virtual environment

```bash
# Check Python is installed
python --version

# Create a virtual environment inside the project folder
python -m venv venv
```

Activate it:

**Windows**
```bash
venv\Scripts\activate
```

**macOS / Linux**
```bash
source venv/bin/activate
```

---

## 3. Install dependencies

```bash
pip install -r requirements.txt
```

---

## 4. Demo Mode (no Supabase required to try it out)

If you just want to run the site immediately, **skip to step 8**. When `SUPABASE_URL` / `SUPABASE_KEY` are left blank in `.env`, the app automatically runs in **Demo Mode** using realistic sample data held in memory (menu items, gallery photos, testimonials, and any bookings/messages you submit while the server is running). This is perfect for reviewing the site and admin panel before setting up a database. Data in Demo Mode resets when the server restarts.

---

## 5. Create a Supabase project (for real, persistent data)

1. Go to [supabase.com](https://supabase.com) and create a free account.
2. Click **New Project**, choose a name, database password, and region.
3. Wait for the project to finish provisioning.

---

## 6. Run the database schema

1. In your Supabase project, open **SQL Editor** → **New Query**.
2. Open `database/schema.sql` from this project, copy its contents, and paste them into the query editor.
3. Click **Run**. This creates all required tables (`menu_items`, `gallery`, `testimonials`, `bookings`, `contact_messages`, `admin_users`) and inserts a small set of starter sample rows.

---

## 7. Configure your `.env` file

Copy the example file:

```bash
cp .env.example .env
```

Open `.env` and fill in:

```env
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_KEY=your-supabase-anon-or-service-key
FLASK_SECRET_KEY=a-long-random-string
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=generated-hash-see-below
```

- Find `SUPABASE_URL` and `SUPABASE_KEY` under **Project Settings → API** in your Supabase dashboard.
- Generate a Flask secret key:
  ```bash
  python -c "import secrets; print(secrets.token_hex(32))"
  ```
- Generate your admin password hash (never store a plain-text password):
  ```bash
  python -c "from werkzeug.security import generate_password_hash; print(generate_password_hash('your-password'))"
  ```
  Paste the output into `ADMIN_PASSWORD_HASH`.

A working **local demo login** is pre-filled in `.env`:
- Username: `admin`
- Password: `changeme123`

Change this before deploying anywhere public.

---

## 8. Start the Flask server

```bash
python app.py
```

You should see:

```
* Running on http://127.0.0.1:5000
```

---

## 9. Open the website

Visit **http://127.0.0.1:5000** in your browser. Explore:

- `/` — Home
- `/about` — About Us
- `/services` — Services
- `/menu` — Menu (with live category filtering)
- `/gallery` — Gallery (with filtering + lightbox)
- `/contact` — Contact form
- `/booking` — Catering enquiry / quote request form

---

## 10. Access the admin panel

Go to **http://127.0.0.1:5000/admin/login** and sign in with the credentials from your `.env` file.

From the dashboard you can:

- **Bookings** — view every enquiry and update its status (Pending → Contacted → Confirmed → Completed / Cancelled).
- **Contact Messages** — read all messages submitted through the contact form.
- **Menu** — add, edit, delete, and enable/disable menu items.
- **Gallery** — add, edit, and delete gallery photos.
- **Testimonials** — add and delete customer testimonials.

### Adding menu items
Open the **Menu** tab → **+ Add Menu Item** → fill in name, category, description and an image URL (e.g. `/static/images/food/your-photo.jpg` after adding the file to that folder) → **Add Item**.

### Adding gallery images
Open the **Gallery** tab → **+ Add Gallery Image** → fill in title, category and image URL → **Add Image**.

### Managing enquiries
Open the **Bookings** tab. Each row has a status dropdown — changing it saves immediately.

---

## Project structure

```
abinash-catering/
├── app.py                  # Flask routes, APIs, admin logic
├── supabase_client.py      # Database access layer (Supabase + demo-mode fallback)
├── requirements.txt
├── .env.example
├── .env
├── database/
│   └── schema.sql          # Full Supabase PostgreSQL schema + seed data
├── templates/               # Jinja2 templates (base.html + pages + admin/)
├── static/
│   ├── css/style.css        # Hand-written responsive CSS (no frameworks)
│   ├── js/main.js           # Vanilla JS: nav, filters, lightbox, carousel, forms
│   └── images/               # hero / food / events / gallery / logo placeholders
└── README.md
```

---

## API reference

| Method | Endpoint          | Description                          |
|--------|--------------------|---------------------------------------|
| GET    | `/api/menu`        | List menu items (optional `?category=`) |
| GET    | `/api/gallery`     | List gallery images (optional `?category=`) |
| GET    | `/api/testimonials`| List testimonials                     |
| POST   | `/api/bookings`    | Submit a catering enquiry             |
| POST   | `/api/contact`     | Submit a contact message              |

All POST endpoints validate input server-side and return JSON with `success`, `message`/`errors`, matching HTTP status codes (`201` created, `400` validation error, `500` server error).

---

## Security notes

- Admin password is never stored in plain text — only a Werkzeug-generated hash.
- Supabase service credentials and the Flask secret key stay server-side in `.env` and are never sent to the browser.
- All forms are validated both client-side (JS) and server-side (Flask).
- Session-based admin auth guards every `/admin/*` route.

---

## Customizing business details

Contact details currently use placeholders (`[PHONE NUMBER]`, `[WHATSAPP NUMBER]`, `[EMAIL ADDRESS]`, `[BUSINESS ADDRESS]`) defined near the top of `app.py` in the `BUSINESS` dictionary. Update them with real details, and replace the Google Maps placeholder on the Contact page with an embedded map once you have a confirmed address.
