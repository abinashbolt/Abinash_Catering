"""
app.py — Abinash Catering
Flask backend serving the public website, JSON APIs and the admin dashboard.
"""

import os
import re
import secrets
from datetime import datetime, date
from functools import wraps

from flask import (
    Flask, render_template, request, jsonify, redirect,
    url_for, session, flash, abort
)
from werkzeug.security import check_password_hash
from dotenv import load_dotenv

import supabase_client as db

load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv("FLASK_SECRET_KEY") or secrets.token_hex(32)

ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "admin")
ADMIN_PASSWORD_HASH = os.getenv("ADMIN_PASSWORD_HASH", "")

MENU_CATEGORIES = [
    "Breakfast", "Lunch", "Dinner", "South Indian", "North Indian", "Vegetarian",
    "Non-Vegetarian", "Biryani", "Snacks", "Sweets", "Desserts", "Beverages", "Services",
]
GALLERY_CATEGORIES = ["Food", "Weddings", "Events", "Buffet", "Traditional Meals"]
CATERING_MEAL_TYPES = ["Breakfast", "Lunch", "Dinner"]
EVENT_TYPES = [
    "Wedding", "Reception", "Engagement", "Birthday & Family Function",
    "Corporate Event", "House Function / Pooja", "Other",
]
BOOKING_STATUSES = ["pending", "contacted", "confirmed", "completed", "cancelled"]

# Business info placeholders — replace with real details when available.
BUSINESS = {
    "name": "Abinash Catering",
    "phone": "9884588612",
    "phone_link": "tel:+919884588612",
    "whatsapp": "9884588612",
    "whatsapp_link": "https://wa.me/9884588612",
    # "email": "abinashcatering@gmail.com",
    "address": "40/1, DR.Natesan Salai,1st Street, Thiruvallikeni, Chennai-600005",
    "hours": "Mon – Sun: 8:00 AM – 9:00 PM",
}


# ==========================================================
# Helpers
# ==========================================================
EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
PHONE_RE = re.compile(r"^[0-9+\-\s()]{7,20}$")


def clean(value):
    return (value or "").strip()


def admin_required(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        if not session.get("is_admin"):
            return redirect(url_for("admin_login", next=request.path))
        return f(*args, **kwargs)
    return wrapper


@app.context_processor
def inject_globals():
    return {"business": BUSINESS, "current_year": datetime.utcnow().year}


# ==========================================================
# PUBLIC PAGES
# ==========================================================
@app.route("/")
def home():
    try:
        gallery_items = db.get_gallery()
    except Exception as e:
        app.logger.error(f"Error loading home page data: {e}")
        gallery_items = []
    return render_template(
        "index.html",
        meal_types=CATERING_MEAL_TYPES,
        gallery_items=gallery_items[:8],
    )


@app.route("/about")
def about():
    return render_template("about.html")


@app.route("/services")
def services():
    return render_template("services.html")


@app.route("/menu")
def menu():
    try:
        items = db.get_menu_items()
    except Exception as e:
        app.logger.error(f"Error loading menu: {e}")
        items = []

    # Menu sections, in first-seen order (items already come back sorted
    # by menu_section, display_order from supabase_client.get_menu_items).
    seen = set()
    sections = []
    for item in items:
        s = item.get("menu_section") or ""
        if s and s not in seen:
            seen.add(s)
            sections.append(s)

    return render_template(
        "menu.html",
        menu_items=items,
        categories=MENU_CATEGORIES,
        menu_sections=sections,
        menu_count=len(items),
        meal_types=CATERING_MEAL_TYPES,
        event_types=EVENT_TYPES,
    )


@app.route("/gallery")
def gallery():
    try:
        items = db.get_gallery()
    except Exception as e:
        app.logger.error(f"Error loading gallery: {e}")
        items = []
    return render_template("gallery.html", gallery_items=items, categories=GALLERY_CATEGORIES)


@app.route("/contact")
def contact():
    return render_template("contact.html")


@app.route("/booking")
def booking():
    return render_template("booking.html", event_types=EVENT_TYPES)


# ==========================================================
# JSON APIs (used by vanilla JS fetch calls)
# ==========================================================
@app.route("/api/menu")
def api_menu():
    category = request.args.get("category")
    menu_section = request.args.get("section")
    try:
        items = db.get_menu_items(category=category, menu_section=menu_section)
        return jsonify({"success": True, "data": items}), 200
    except Exception as e:
        app.logger.error(f"/api/menu error: {e}")
        return jsonify({"success": False, "error": "Unable to load menu right now."}), 500


@app.route("/api/catering/combos")
def api_catering_combos():
    category = clean(request.args.get("category"))
    if category not in CATERING_MEAL_TYPES:
        return jsonify({"success": False, "error": "Please select Breakfast, Lunch or Dinner."}), 400
    try:
        combos = db.get_combos(category)
        return jsonify({"success": True, "data": combos}), 200
    except Exception as e:
        app.logger.error(f"/api/catering/combos error: {e}")
        return jsonify({"success": False, "error": "Unable to load catering menus right now."}), 500


@app.route("/api/gallery")
def api_gallery():
    category = request.args.get("category")
    try:
        items = db.get_gallery(category=category)
        return jsonify({"success": True, "data": items}), 200
    except Exception as e:
        app.logger.error(f"/api/gallery error: {e}")
        return jsonify({"success": False, "error": "Unable to load gallery right now."}), 500


@app.route("/api/testimonials")
def api_testimonials():
    try:
        items = db.get_testimonials()
        return jsonify({"success": True, "data": items}), 200
    except Exception as e:
        app.logger.error(f"/api/testimonials error: {e}")
        return jsonify({"success": False, "error": "Unable to load testimonials right now."}), 500


@app.route("/api/bookings", methods=["POST"])
def api_create_booking():
    payload = request.get_json(silent=True) or request.form
    errors = {}

    name = clean(payload.get("name"))
    phone = clean(payload.get("phone"))
    email = clean(payload.get("email"))
    event_type = clean(payload.get("event_type"))
    event_date = clean(payload.get("event_date"))
    event_time = clean(payload.get("event_time"))
    guest_count = clean(payload.get("guest_count"))
    location = clean(payload.get("location"))

    # Catering menu selection (from the catering wizard on /menu). Optional
    # so /api/bookings still works for plain enquiries with no menu chosen.
    meal_type = clean(payload.get("meal_type"))
    selected_menu = clean(payload.get("selected_menu"))
    menu_type = clean(payload.get("menu_type")) or "original"
    if menu_type not in ("original", "customized"):
        menu_type = "original"

    def _clean_item_list(raw):
        if isinstance(raw, list):
            return [clean(v) for v in raw if clean(v)]
        return []

    included_items = _clean_item_list(payload.get("included_items"))
    added_items = _clean_item_list(payload.get("added_items"))
    removed_items = _clean_item_list(payload.get("removed_items"))

    if not name or len(name) < 2:
        errors["name"] = "Please enter your full name."
    if not phone or not PHONE_RE.match(phone):
        errors["phone"] = "Please enter a valid phone number."
    if email and not EMAIL_RE.match(email):
        errors["email"] = "Please enter a valid email address."
    if not event_type:
        errors["event_type"] = "Please select an event type."
    if not event_date:
        errors["event_date"] = "Please select an event date."
    if not location:
        errors["location"] = "Please enter the event location."

    guests_int = None
    if guest_count:
        try:
            guests_int = int(guest_count)
            if guests_int <= 0:
                errors["guest_count"] = "Guest count must be a positive number."
        except ValueError:
            errors["guest_count"] = "Guest count must be a number."

    if errors:
        return jsonify({"success": False, "errors": errors}), 400

    try:
        row = db.create_booking({
            "name": name,
            "phone": phone,
            "email": email,
            "event_type": event_type,
            "event_date": event_date or None,
            "event_time": event_time,
            "guest_count": guests_int,
            "location": location,
            "food_preference": clean(payload.get("food_preference")),
            "preferred_menu": clean(payload.get("preferred_menu")),
            "additional_requirements": clean(payload.get("additional_requirements")),
            "meal_type": meal_type,
            "selected_menu": selected_menu,
            "menu_type": menu_type,
            "included_items": included_items,
            "added_items": added_items,
            "removed_items": removed_items,
        })
        return jsonify({
            "success": True,
            "message": "Thank you! Your catering enquiry has been received. Our team will contact you shortly.",
            "data": row,
        }), 201
    except Exception as e:
        app.logger.error(f"/api/bookings error: {e}")
        return jsonify({"success": False, "error": "Something went wrong while submitting your enquiry. Please try again or call us directly."}), 500


@app.route("/api/contact", methods=["POST"])
def api_contact():
    payload = request.get_json(silent=True) or request.form
    errors = {}

    name = clean(payload.get("name"))
    phone = clean(payload.get("phone"))
    email = clean(payload.get("email"))
    message = clean(payload.get("message"))

    if not name or len(name) < 2:
        errors["name"] = "Please enter your name."
    if not phone and not email:
        errors["contact"] = "Please provide a phone number or an email address."
    if email and not EMAIL_RE.match(email):
        errors["email"] = "Please enter a valid email address."
    if phone and not PHONE_RE.match(phone):
        errors["phone"] = "Please enter a valid phone number."
    if not message or len(message) < 5:
        errors["message"] = "Please enter a short message."

    if errors:
        return jsonify({"success": False, "errors": errors}), 400

    try:
        row = db.create_contact_message({
            "name": name, "phone": phone, "email": email, "message": message,
        })
        return jsonify({
            "success": True,
            "message": "Thank you for reaching out! We'll get back to you shortly.",
            "data": row,
        }), 201
    except Exception as e:
        app.logger.error(f"/api/contact error: {e}")
        return jsonify({"success": False, "error": "Something went wrong while sending your message. Please try again."}), 500


# ==========================================================
# ADMIN AUTH
# ==========================================================
@app.route("/admin/login", methods=["GET", "POST"])
def admin_login():
    if request.method == "GET":
        return render_template("admin/login.html")

    username = clean(request.form.get("username"))
    password = request.form.get("password") or ""

    valid_user = username == ADMIN_USERNAME
    valid_pass = bool(ADMIN_PASSWORD_HASH) and check_password_hash(ADMIN_PASSWORD_HASH, password)

    if valid_user and valid_pass:
        session.clear()
        session["is_admin"] = True
        session["admin_username"] = username
        next_url = request.args.get("next") or url_for("admin_dashboard")
        return redirect(next_url)

    flash("Invalid username or password.", "error")
    return render_template("admin/login.html"), 401


@app.route("/admin/logout")
def admin_logout():
    session.clear()
    return redirect(url_for("admin_login"))


# ==========================================================
# ADMIN DASHBOARD
# ==========================================================
@app.route("/admin")
@admin_required
def admin_dashboard():
    try:
        bookings = db.get_all_bookings()
        messages = db.get_all_contact_messages()
        menu_items = db.get_all_menu_items()
        gallery_items = db.get_gallery()
        testimonials = db.get_testimonials()
    except Exception as e:
        app.logger.error(f"Admin dashboard load error: {e}")
        bookings = messages = menu_items = gallery_items = testimonials = []

    today_str = date.today().isoformat()
    stats = {
        "total_bookings": len(bookings),
        "pending_bookings": len([b for b in bookings if b.get("status") == "pending"]),
        "confirmed_bookings": len([b for b in bookings if b.get("status") == "confirmed"]),
        "completed_bookings": len([b for b in bookings if b.get("status") == "completed"]),
        "cancelled_bookings": len([b for b in bookings if b.get("status") == "cancelled"]),
        "today_bookings": len([b for b in bookings if b.get("event_date") == today_str]),
        "upcoming_bookings": len([b for b in bookings if b.get("event_date") and b.get("event_date") >= today_str and b.get("status") not in ("cancelled",)]),
        "total_messages": len(messages),
        "total_menu_items": len(menu_items),
    }

    return render_template(
        "admin/dashboard.html",
        bookings=bookings, messages=messages, menu_items=menu_items,
        gallery_items=gallery_items, testimonials=testimonials,
        stats=stats, menu_categories=MENU_CATEGORIES,
        gallery_categories=GALLERY_CATEGORIES, statuses=BOOKING_STATUSES,
        demo_mode=db.DEMO_MODE,
    )


@app.route("/admin/bookings/<booking_id>/status", methods=["POST"])
@admin_required
def admin_update_booking_status(booking_id):
    status = clean(request.form.get("status"))
    if status not in BOOKING_STATUSES:
        flash("Invalid status value.", "error")
        return redirect(url_for("admin_dashboard"))
    try:
        db.update_booking_status(booking_id, status)
        flash("Booking status updated.", "success")
    except Exception as e:
        app.logger.error(f"Update booking status error: {e}")
        flash("Could not update booking status.", "error")
    return redirect(url_for("admin_dashboard") + "#bookings")


@app.route("/admin/menu/add", methods=["POST"])
@admin_required
def admin_add_menu_item():
    try:
        display_order_raw = clean(request.form.get("display_order"))
        db.create_menu_item({
            "name": clean(request.form.get("name")),
            "name_tamil": clean(request.form.get("name_tamil")),
            "description": clean(request.form.get("description")),
            "category": clean(request.form.get("category")),
            "menu_section": clean(request.form.get("menu_section")),
            "image_url": clean(request.form.get("image_url")) or "/static/images/food/placeholder.jpg",
            "is_available": bool(request.form.get("is_available")),
            "display_order": int(display_order_raw) if display_order_raw.isdigit() else 0,
        })
        flash("Menu item added.", "success")
    except Exception as e:
        app.logger.error(f"Add menu item error: {e}")
        flash("Could not add menu item.", "error")
    return redirect(url_for("admin_dashboard") + "#menu")


@app.route("/admin/menu/<item_id>/edit", methods=["POST"])
@admin_required
def admin_edit_menu_item(item_id):
    try:
        display_order_raw = clean(request.form.get("display_order"))
        db.update_menu_item(item_id, {
            "name": clean(request.form.get("name")),
            "name_tamil": clean(request.form.get("name_tamil")),
            "description": clean(request.form.get("description")),
            "category": clean(request.form.get("category")),
            "menu_section": clean(request.form.get("menu_section")),
            "image_url": clean(request.form.get("image_url")),
            "is_available": bool(request.form.get("is_available")),
            "display_order": int(display_order_raw) if display_order_raw.isdigit() else 0,
        })
        flash("Menu item updated.", "success")
    except Exception as e:
        app.logger.error(f"Edit menu item error: {e}")
        flash("Could not update menu item.", "error")
    return redirect(url_for("admin_dashboard") + "#menu")


@app.route("/admin/menu/<item_id>/delete", methods=["POST"])
@admin_required
def admin_delete_menu_item(item_id):
    try:
        db.delete_menu_item(item_id)
        flash("Menu item deleted.", "success")
    except Exception as e:
        app.logger.error(f"Delete menu item error: {e}")
        flash("Could not delete menu item.", "error")
    return redirect(url_for("admin_dashboard") + "#menu")


@app.route("/admin/gallery/add", methods=["POST"])
@admin_required
def admin_add_gallery_item():
    try:
        db.create_gallery_item({
            "title": clean(request.form.get("title")),
            "category": clean(request.form.get("category")),
            "image_url": clean(request.form.get("image_url")) or "/static/images/gallery/placeholder.jpg",
            "description": clean(request.form.get("description")),
        })
        flash("Gallery image added.", "success")
    except Exception as e:
        app.logger.error(f"Add gallery item error: {e}")
        flash("Could not add gallery image.", "error")
    return redirect(url_for("admin_dashboard") + "#gallery")


@app.route("/admin/gallery/<item_id>/edit", methods=["POST"])
@admin_required
def admin_edit_gallery_item(item_id):
    try:
        db.update_gallery_item(item_id, {
            "title": clean(request.form.get("title")),
            "category": clean(request.form.get("category")),
        })
        flash("Gallery image updated.", "success")
    except Exception as e:
        app.logger.error(f"Edit gallery item error: {e}")
        flash("Could not update gallery image.", "error")
    return redirect(url_for("admin_dashboard") + "#gallery")


@app.route("/admin/gallery/<item_id>/delete", methods=["POST"])
@admin_required
def admin_delete_gallery_item(item_id):
    try:
        db.delete_gallery_item(item_id)
        flash("Gallery image deleted.", "success")
    except Exception as e:
        app.logger.error(f"Delete gallery item error: {e}")
        flash("Could not delete gallery image.", "error")
    return redirect(url_for("admin_dashboard") + "#gallery")


@app.route("/admin/testimonials/add", methods=["POST"])
@admin_required
def admin_add_testimonial():
    try:
        db.create_testimonial({
            "customer_name": clean(request.form.get("customer_name")),
            "event_type": clean(request.form.get("event_type")),
            "review": clean(request.form.get("review")),
            "rating": int(request.form.get("rating") or 5),
            "image_url": clean(request.form.get("image_url")),
        })
        flash("Testimonial added.", "success")
    except Exception as e:
        app.logger.error(f"Add testimonial error: {e}")
        flash("Could not add testimonial.", "error")
    return redirect(url_for("admin_dashboard") + "#testimonials")


@app.route("/admin/testimonials/<item_id>/delete", methods=["POST"])
@admin_required
def admin_delete_testimonial(item_id):
    try:
        db.delete_testimonial(item_id)
        flash("Testimonial deleted.", "success")
    except Exception as e:
        app.logger.error(f"Delete testimonial error: {e}")
        flash("Could not delete testimonial.", "error")
    return redirect(url_for("admin_dashboard") + "#testimonials")


# ==========================================================
# ERROR HANDLERS
# ==========================================================
@app.errorhandler(404)
def not_found(e):
    return render_template("404.html"), 404


@app.errorhandler(500)
def server_error(e):
    app.logger.error(f"Server error: {e}")
    return render_template("500.html"), 500


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)