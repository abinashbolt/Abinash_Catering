"""
supabase_client.py
-------------------
Central Supabase connection layer for Abinash Catering.

Keeps all database access in one place so app.py stays focused on routing.

DEMO MODE:
If SUPABASE_URL / SUPABASE_KEY are not set in .env, this module falls back
to small in-memory sample datasets so the website is fully browsable and
demo-able before a real Supabase project is connected. Replace the .env
values with real credentials to switch to live data automatically.
"""

import os
import uuid
from datetime import datetime, date

from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL", "").strip()
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "").strip()

_client = None
DEMO_MODE = not (SUPABASE_URL and SUPABASE_KEY)

if not DEMO_MODE:
    from supabase import create_client, Client
    _client: "Client" = create_client(SUPABASE_URL, SUPABASE_KEY)


# ==========================================================
# In-memory demo store (only used when DEMO_MODE is True)
# ==========================================================
def _new_id():
    return str(uuid.uuid4())


_DEMO_DB = {
    "menu_items": [
        {"id": _new_id(), "name": "Filter Coffee", "name_tamil": "", "description": "Freshly brewed South Indian filter coffee served hot.", "category": "Beverages", "menu_section": "Demo", "image_url": "/static/images/food/filter-coffee.jpg", "is_available": True, "display_order": 1, "created_at": str(datetime.utcnow())},
        {"id": _new_id(), "name": "Ghee Pongal", "name_tamil": "", "description": "Soft rice and lentils tempered with ghee, cashews and pepper.", "category": "Breakfast", "menu_section": "Demo", "image_url": "/static/images/food/pongal.jpg", "is_available": True, "display_order": 2, "created_at": str(datetime.utcnow())},
        {"id": _new_id(), "name": "Mysore Masala Dosa", "name_tamil": "", "description": "Crisp dosa with spicy red chutney and potato masala.", "category": "South Indian", "menu_section": "Demo", "image_url": "/static/images/food/dosa.jpg", "is_available": True, "display_order": 3, "created_at": str(datetime.utcnow())},
        {"id": _new_id(), "name": "Chicken Chettinad", "name_tamil": "", "description": "Fiery Chettinad-style chicken curry with roasted spices.", "category": "Non-Vegetarian", "menu_section": "Demo", "image_url": "/static/images/food/chettinad.jpg", "is_available": True, "display_order": 4, "created_at": str(datetime.utcnow())},
        {"id": _new_id(), "name": "Vegetable Biryani", "name_tamil": "", "description": "Fragrant basmati rice layered with garden vegetables and spices.", "category": "Biryani", "menu_section": "Demo", "image_url": "/static/images/food/veg-biryani.jpg", "is_available": True, "display_order": 5, "created_at": str(datetime.utcnow())},
        {"id": _new_id(), "name": "Mutton Biryani", "name_tamil": "", "description": "Slow-cooked mutton biryani with saffron and caramelised onions.", "category": "Biryani", "menu_section": "Demo", "image_url": "/static/images/food/mutton-biryani.jpg", "is_available": True, "display_order": 6, "created_at": str(datetime.utcnow())},
        {"id": _new_id(), "name": "Paneer Butter Masala", "name_tamil": "", "description": "Cottage cheese cubes simmered in a rich tomato-butter gravy.", "category": "North Indian", "menu_section": "Demo", "image_url": "/static/images/food/paneer-butter-masala.jpg", "is_available": True, "display_order": 7, "created_at": str(datetime.utcnow())},
        {"id": _new_id(), "name": "Kaju Katli", "name_tamil": "", "description": "Diamond-cut cashew fudge finished with edible silver leaf.", "category": "Sweets", "menu_section": "Demo", "image_url": "/static/images/food/kaju-katli.jpg", "is_available": True, "display_order": 8, "created_at": str(datetime.utcnow())},
        {"id": _new_id(), "name": "Gulab Jamun", "name_tamil": "", "description": "Warm milk-solid dumplings soaked in rose-cardamom syrup.", "category": "Desserts", "menu_section": "Demo", "image_url": "/static/images/food/gulab-jamun.jpg", "is_available": True, "display_order": 9, "created_at": str(datetime.utcnow())},
        {"id": _new_id(), "name": "Medu Vada", "name_tamil": "", "description": "Golden, crisp lentil doughnuts served with coconut chutney.", "category": "Snacks", "menu_section": "Demo", "image_url": "/static/images/food/medu-vada.jpg", "is_available": True, "display_order": 10, "created_at": str(datetime.utcnow())},
    ],
    "gallery": [
        {"id": _new_id(), "title": "Traditional Banana Leaf Meal", "category": "Traditional Meals", "image_url": "/static/images/gallery/banana-leaf.jpg", "description": "A complete South Indian meal served on a banana leaf.", "created_at": str(datetime.utcnow())},
        {"id": _new_id(), "title": "Wedding Reception Buffet", "category": "Weddings", "image_url": "/static/images/gallery/wedding-buffet.jpg", "description": "Live buffet counters set up for a wedding reception.", "created_at": str(datetime.utcnow())},
        {"id": _new_id(), "title": "Corporate Event Setup", "category": "Events", "image_url": "/static/images/gallery/corporate-event.jpg", "description": "Elegant food counters arranged for a corporate gathering.", "created_at": str(datetime.utcnow())},
        {"id": _new_id(), "title": "Live Dosa Counter", "category": "Buffet", "image_url": "/static/images/gallery/live-dosa-counter.jpg", "description": "Fresh dosas made live for guests.", "created_at": str(datetime.utcnow())},
        {"id": _new_id(), "title": "Festival Sweets Spread", "category": "Food", "image_url": "/static/images/gallery/sweets-spread.jpg", "description": "An assortment of traditional festive sweets.", "created_at": str(datetime.utcnow())},
    ],
    "testimonials": [
        {"id": _new_id(), "customer_name": "Priya & Karthik", "event_type": "Wedding", "review": "Abinash Catering made our wedding feast unforgettable, every dish tasted like home.", "rating": 5, "image_url": "", "created_at": str(datetime.utcnow())},
        {"id": _new_id(), "customer_name": "Suresh Kumar", "event_type": "Corporate Event", "review": "Punctual, professional, and the food was consistently excellent across all three days of our conference.", "rating": 5, "image_url": "", "created_at": str(datetime.utcnow())},
        {"id": _new_id(), "customer_name": "Lakshmi Narayanan", "event_type": "Birthday Function", "review": "Our guests are still talking about the biryani. Thank you for making the day so special!", "rating": 5, "image_url": "", "created_at": str(datetime.utcnow())},
    ],
    "bookings": [],
    "contact_messages": [],
}


def _demo_insert(table, row):
    row = dict(row)
    row.setdefault("id", _new_id())
    row.setdefault("created_at", str(datetime.utcnow()))
    for k, v in list(row.items()):
        if isinstance(v, date):
            row[k] = str(v)
    _DEMO_DB[table].insert(0, row)
    return row


def _demo_update(table, row_id, updates):
    for row in _DEMO_DB[table]:
        if row["id"] == row_id:
            row.update(updates)
            return row
    return None


def _demo_delete(table, row_id):
    before = len(_DEMO_DB[table])
    _DEMO_DB[table] = [r for r in _DEMO_DB[table] if r["id"] != row_id]
    return len(_DEMO_DB[table]) < before


# ==========================================================
# Public API — used by app.py. Same function signatures work
# whether running against Supabase or the in-memory demo store.
# ==========================================================

def get_menu_items(category=None, menu_section=None, only_available=True):
    if DEMO_MODE:
        items = _DEMO_DB["menu_items"]
        if only_available:
            items = [i for i in items if i["is_available"]]
        if category and category.lower() != "all":
            items = [i for i in items if i["category"].lower() == category.lower()]
        if menu_section and menu_section.lower() != "all":
            items = [i for i in items if i["menu_section"] == menu_section]
        return sorted(items, key=lambda r: (r["menu_section"], r.get("display_order", 0)))

    query = _client.table("menu_items").select("*")
    if only_available:
        query = query.eq("is_available", True)
    if category and category.lower() != "all":
        query = query.eq("category", category)
    if menu_section and menu_section.lower() != "all":
        query = query.eq("menu_section", menu_section)
    return (
        query.order("menu_section", desc=False)
        .order("display_order", desc=False)
        .execute()
        .data
    )


def get_combos(category):
    """
    Group available menu_items into catering combos for a given meal
    category (Breakfast / Lunch / Dinner). Each combo corresponds to one
    menu_section on the physical menu card (e.g. "Lunch Menu 1").

    Returns:
        [
          {
            "section": "Lunch Menu 1",
            "item_count": 12,
            "items": [{"id", "name", "name_tamil", "description", "image_url", "category"}, ...]
          },
          ...
        ]
    """
    items = get_menu_items(category=category, only_available=True)
    combos = []
    by_section = {}
    for item in items:
        section = item.get("menu_section") or "Menu"
        if section not in by_section:
            by_section[section] = {"section": section, "item_count": 0, "items": []}
            combos.append(by_section[section])
        by_section[section]["items"].append(item)
        by_section[section]["item_count"] += 1
    return combos


def get_gallery(category=None):
    if DEMO_MODE:
        items = _DEMO_DB["gallery"]
        if category and category.lower() != "all":
            items = [i for i in items if i["category"].lower() == category.lower()]
        return sorted(items, key=lambda r: r["created_at"], reverse=True)

    query = _client.table("gallery").select("*")
    if category and category.lower() != "all":
        query = query.eq("category", category)
    return query.order("created_at", desc=True).execute().data


def get_testimonials():
    if DEMO_MODE:
        return sorted(_DEMO_DB["testimonials"], key=lambda r: r["created_at"], reverse=True)
    return _client.table("testimonials").select("*").order("created_at", desc=True).execute().data


def create_booking(data):
    if DEMO_MODE:
        return _demo_insert("bookings", {**data, "status": "pending"})
    payload = {**data, "status": "pending"}
    return _client.table("bookings").insert(payload).execute().data[0]


def create_contact_message(data):
    if DEMO_MODE:
        return _demo_insert("contact_messages", data)
    return _client.table("contact_messages").insert(data).execute().data[0]


# ---- Admin: bookings ----
def get_all_bookings():
    if DEMO_MODE:
        return sorted(_DEMO_DB["bookings"], key=lambda r: r["created_at"], reverse=True)
    return _client.table("bookings").select("*").order("created_at", desc=True).execute().data


def update_booking_status(booking_id, status):
    if DEMO_MODE:
        return _demo_update("bookings", booking_id, {"status": status})
    return _client.table("bookings").update({"status": status}).eq("id", booking_id).execute().data


# ---- Admin: contact messages ----
def get_all_contact_messages():
    if DEMO_MODE:
        return sorted(_DEMO_DB["contact_messages"], key=lambda r: r["created_at"], reverse=True)
    return _client.table("contact_messages").select("*").order("created_at", desc=True).execute().data


# ---- Admin: menu management ----
def get_all_menu_items():
    if DEMO_MODE:
        return sorted(_DEMO_DB["menu_items"], key=lambda r: (r["menu_section"], r.get("display_order", 0)))
    return (
        _client.table("menu_items").select("*")
        .order("menu_section", desc=False)
        .order("display_order", desc=False)
        .execute()
        .data
    )


def create_menu_item(data):
    if DEMO_MODE:
        return _demo_insert("menu_items", {**data, "is_available": data.get("is_available", True)})
    return _client.table("menu_items").insert(data).execute().data[0]


def update_menu_item(item_id, data):
    if DEMO_MODE:
        return _demo_update("menu_items", item_id, data)
    return _client.table("menu_items").update(data).eq("id", item_id).execute().data


def delete_menu_item(item_id):
    if DEMO_MODE:
        return _demo_delete("menu_items", item_id)
    return _client.table("menu_items").delete().eq("id", item_id).execute().data


# ---- Admin: gallery management ----
def create_gallery_item(data):
    if DEMO_MODE:
        return _demo_insert("gallery", data)
    return _client.table("gallery").insert(data).execute().data[0]


def update_gallery_item(item_id, data):
    if DEMO_MODE:
        return _demo_update("gallery", item_id, data)
    return _client.table("gallery").update(data).eq("id", item_id).execute().data


def delete_gallery_item(item_id):
    if DEMO_MODE:
        return _demo_delete("gallery", item_id)
    return _client.table("gallery").delete().eq("id", item_id).execute().data


# ---- Admin: testimonials management ----
def create_testimonial(data):
    if DEMO_MODE:
        return _demo_insert("testimonials", data)
    return _client.table("testimonials").insert(data).execute().data[0]


def update_testimonial(item_id, data):
    if DEMO_MODE:
        return _demo_update("testimonials", item_id, data)
    return _client.table("testimonials").update(data).eq("id", item_id).execute().data


def delete_testimonial(item_id):
    if DEMO_MODE:
        return _demo_delete("testimonials", item_id)
    return _client.table("testimonials").delete().eq("id", item_id).execute().data
