/* ==========================================================
   Abinash Catering — main.js (vanilla JS, no dependencies)
   ========================================================== */
(function () {
  "use strict";

  /* ---------------- Toasts ---------------- */
  function showToast(message, type) {
    var container = document.getElementById("toast-container");
    if (!container) return;
    var toast = document.createElement("div");
    toast.className = "toast " + (type || "");
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(function () {
      toast.style.opacity = "0";
      toast.style.transform = "translateX(24px)";
      setTimeout(function () { toast.remove(); }, 300);
    }, 4200);
  }

  /* Auto-dismiss server-rendered flash messages */
  document.addEventListener("DOMContentLoaded", function () {
    var flashes = document.querySelectorAll(".flash-stack .flash");
    flashes.forEach(function (f) {
      setTimeout(function () {
        f.style.transition = "opacity .4s";
        f.style.opacity = "0";
        setTimeout(function () { f.remove(); }, 400);
      }, 3800);
    });
  });

  /* ---------------- Header scroll behavior ---------------- */
  var header = document.getElementById("siteHeader");
  function onScrollHeader() {
    if (!header) return;
    if (window.scrollY > 12) header.classList.add("scrolled");
    else header.classList.remove("scrolled");
  }
  window.addEventListener("scroll", onScrollHeader, { passive: true });
  onScrollHeader();

  /* ---------------- Mobile nav ---------------- */
  var hamburger = document.getElementById("hamburgerBtn");
  var mobileNav = document.getElementById("mobileNav");
  if (hamburger && mobileNav) {
    hamburger.addEventListener("click", function () {
      var open = mobileNav.classList.toggle("open");
      hamburger.classList.toggle("open", open);
      hamburger.setAttribute("aria-expanded", open ? "true" : "false");
    });
    mobileNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        mobileNav.classList.remove("open");
        hamburger.classList.remove("open");
        hamburger.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------------- Smooth scroll for in-page anchors ---------------- */
  document.addEventListener("click", function (e) {
    var link = e.target.closest('a[href^="#"]');
    if (!link) return;
    var id = link.getAttribute("href").slice(1);
    if (!id) return;
    var target = document.getElementById(id);
    if (target && !link.closest(".admin-tabs")) {
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });

  /* ---------------- Scroll reveal animations ---------------- */
  var revealEls = document.querySelectorAll(".reveal");
  if (revealEls.length && "IntersectionObserver" in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    revealEls.forEach(function (el) { observer.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in-view"); });
  }

  /* ---------------- Back to top ---------------- */
  var backToTop = document.getElementById("backToTop");
  if (backToTop) {
    window.addEventListener(
      "scroll",
      function () {
        backToTop.classList.toggle("visible", window.scrollY > 500);
      },
      { passive: true }
    );
    backToTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ---------------- Generic category filter (menu + gallery) ---------------- */
  function initFilterBar(barId, itemsSelector, emptyStateId) {
    var bar = document.getElementById(barId);
    if (!bar) return;
    var chips = bar.querySelectorAll(".filter-chip");
    var items = document.querySelectorAll(itemsSelector);
    var emptyState = emptyStateId ? document.getElementById(emptyStateId) : null;

    function applyFilter(category) {
      var visibleCount = 0;
      items.forEach(function (item) {
        var match = category === "all" || item.dataset.category === category;
        item.classList.toggle("filtered-hide", !match);
        if (match) visibleCount++;
      });
      if (emptyState) emptyState.hidden = visibleCount !== 0;
    }

    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        chips.forEach(function (c) {
          c.classList.remove("active");
          c.setAttribute("aria-selected", "false");
        });
        chip.classList.add("active");
        chip.setAttribute("aria-selected", "true");
        applyFilter(chip.dataset.category);
      });
    });
  }
  initFilterBar("galleryFilterBar", "#galleryGrid .gallery-item", "galleryEmptyState");

  /* ---------------- Menu page: search + category filter + section filter (combined, no reload) ---------------- */
  (function initMenuFilters() {
    var categoryBar = document.getElementById("menuCategoryFilterBar");
    var sectionBar = document.getElementById("menuSectionFilterBar");
    var searchInput = document.getElementById("menuSearch");
    var sectionsWrap = document.getElementById("menuSections");
    if (!sectionsWrap) return; // not on the menu page

    var cards = sectionsWrap.querySelectorAll(".menu-card");
    var sectionBlocks = sectionsWrap.querySelectorAll(".menu-section-block");
    var emptyState = document.getElementById("menuEmptyState");

    var state = { category: "all", section: "all", query: "" };

    function applyFilters() {
      var totalVisible = 0;
      cards.forEach(function (card) {
        var matchesCategory = state.category === "all" || card.dataset.category === state.category;
        var matchesSection = state.section === "all" || card.dataset.section === state.section;
        var matchesQuery = !state.query || (card.dataset.search || "").indexOf(state.query) !== -1;
        var visible = matchesCategory && matchesSection && matchesQuery;
        card.classList.toggle("filtered-hide", !visible);
        if (visible) totalVisible++;
      });

      sectionBlocks.forEach(function (block) {
        var visibleInBlock = block.querySelectorAll(".menu-card:not(.filtered-hide)").length;
        block.classList.toggle("filtered-hide", visibleInBlock === 0);
      });

      if (emptyState) emptyState.hidden = totalVisible !== 0;
    }

    function wireBar(bar, datasetKey, stateKey) {
      if (!bar) return;
      var chips = bar.querySelectorAll(".filter-chip");
      chips.forEach(function (chip) {
        chip.addEventListener("click", function () {
          chips.forEach(function (c) {
            c.classList.remove("active");
            c.setAttribute("aria-selected", "false");
          });
          chip.classList.add("active");
          chip.setAttribute("aria-selected", "true");
          state[stateKey] = chip.dataset[datasetKey];
          applyFilters();
        });
      });
    }

    wireBar(categoryBar, "category", "category");
    wireBar(sectionBar, "section", "section");

    if (searchInput) {
      searchInput.addEventListener("input", function () {
        state.query = searchInput.value.trim().toLowerCase();
        applyFilters();
      });
    }
  })();

  /* ---------------- Gallery lightbox ---------------- */
  (function initLightbox() {
    var lightbox = document.getElementById("lightbox");
    if (!lightbox) return;
    var imgEl = document.getElementById("lightboxImage");
    var titleEl = document.getElementById("lightboxTitle");
    var descEl = document.getElementById("lightboxDesc");
    var closeBtn = document.getElementById("lightboxClose");
    var prevBtn = document.getElementById("lightboxPrev");
    var nextBtn = document.getElementById("lightboxNext");

    var items = [];
    var currentIndex = 0;

    function refreshVisibleItems() {
      items = Array.prototype.slice.call(
        document.querySelectorAll("#galleryGrid .gallery-item:not(.filtered-hide)")
      );
    }

    function openAt(index) {
      refreshVisibleItems();
      if (!items.length) return;
      currentIndex = (index + items.length) % items.length;
      var el = items[currentIndex];
      imgEl.src = el.dataset.full;
      imgEl.alt = el.dataset.title || "";
      titleEl.textContent = el.dataset.title || "";
      descEl.textContent = el.dataset.desc || "";
      lightbox.classList.add("open");
      lightbox.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    }

    function close() {
      lightbox.classList.remove("open");
      lightbox.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    }

    document.querySelectorAll("#galleryGrid .gallery-item").forEach(function (el, i) {
      el.addEventListener("click", function () {
        refreshVisibleItems();
        var idx = items.indexOf(el);
        openAt(idx === -1 ? 0 : idx);
      });
    });

    if (closeBtn) closeBtn.addEventListener("click", close);
    if (prevBtn) prevBtn.addEventListener("click", function () { openAt(currentIndex - 1); });
    if (nextBtn) nextBtn.addEventListener("click", function () { openAt(currentIndex + 1); });
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) close();
    });
    document.addEventListener("keydown", function (e) {
      if (!lightbox.classList.contains("open")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") openAt(currentIndex - 1);
      if (e.key === "ArrowRight") openAt(currentIndex + 1);
    });
  })();

  /* ---------------- Testimonial carousel ---------------- */
  (function initCarousel() {
    var carousel = document.getElementById("testimonialCarousel");
    if (!carousel) return;
    var track = carousel.querySelector(".testimonial-track");
    var slides = carousel.querySelectorAll(".testimonial-slide");
    var dotsWrap = document.getElementById("carouselDots");
    var prevBtn = document.getElementById("carouselPrev");
    var nextBtn = document.getElementById("carouselNext");
    if (!slides.length) return;

    var index = 0;
    var timer = null;
    var autoplayMs = parseInt(carousel.dataset.autoplay || "0", 10);

    slides.forEach(function (_, i) {
      var dot = document.createElement("button");
      if (i === 0) dot.classList.add("active");
      dot.setAttribute("aria-label", "Go to testimonial " + (i + 1));
      dot.addEventListener("click", function () { goTo(i); });
      dotsWrap.appendChild(dot);
    });

    function goTo(i) {
      index = (i + slides.length) % slides.length;
      track.style.transform = "translateX(-" + index * 100 + "%)";
      dotsWrap.querySelectorAll("button").forEach(function (d, di) {
        d.classList.toggle("active", di === index);
      });
    }

    function next() { goTo(index + 1); }
    function prev() { goTo(index - 1); }

    if (nextBtn) nextBtn.addEventListener("click", function () { next(); resetAutoplay(); });
    if (prevBtn) prevBtn.addEventListener("click", function () { prev(); resetAutoplay(); });

    function startAutoplay() {
      if (autoplayMs > 0 && slides.length > 1) {
        timer = setInterval(next, autoplayMs);
      }
    }
    function resetAutoplay() {
      if (timer) clearInterval(timer);
      startAutoplay();
    }
    startAutoplay();
  })();

  /* ---------------- Form validation + AJAX submission ---------------- */
  function clearErrors(form) {
    form.querySelectorAll(".field-error").forEach(function (el) { el.textContent = ""; });
    form.querySelectorAll(".invalid").forEach(function (el) { el.classList.remove("invalid"); });
  }

  function showErrors(form, errors) {
    Object.keys(errors).forEach(function (field) {
      var errEl = form.querySelector('[data-error-for="' + field + '"]');
      if (errEl) errEl.textContent = errors[field];
      var input = form.querySelector('[name="' + field + '"]');
      if (input) input.classList.add("invalid");
    });
  }

  function basicClientValidate(form) {
    var errors = {};
    form.querySelectorAll("[required]").forEach(function (input) {
      if (!input.value || !input.value.trim()) {
        errors[input.name] = "This field is required.";
      }
    });
    var emailField = form.querySelector('input[type="email"]');
    if (emailField && emailField.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailField.value)) {
      errors[emailField.name] = "Please enter a valid email address.";
    }
    return errors;
  }

  function submitForm(form, endpoint, successBoxId, submitBtnId) {
    clearErrors(form);
    var clientErrors = basicClientValidate(form);
    if (Object.keys(clientErrors).length) {
      showErrors(form, clientErrors);
      showToast("Please fix the highlighted fields.", "error");
      return;
    }

    var submitBtn = document.getElementById(submitBtnId);
    var btnText = submitBtn ? submitBtn.querySelector(".btn-text") : null;
    var spinner = submitBtn ? submitBtn.querySelector(".btn-spinner") : null;
    if (submitBtn) submitBtn.disabled = true;
    if (spinner) spinner.hidden = false;
    if (btnText) btnText.style.opacity = "0.6";

    var formData = new FormData(form);
    var payload = {};
    formData.forEach(function (value, key) { payload[key] = value; });

    fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then(function (res) {
        return res.json().then(function (data) { return { status: res.status, data: data }; });
      })
      .then(function (result) {
        if (result.data.success) {
          var successBox = document.getElementById(successBoxId);
          if (successBox) {
            successBox.textContent = result.data.message;
            successBox.hidden = false;
          }
          showToast(result.data.message, "success");
          form.reset();
        } else if (result.data.errors) {
          showErrors(form, result.data.errors);
          showToast("Please check the form and try again.", "error");
        } else {
          showToast(result.data.error || "Something went wrong. Please try again.", "error");
        }
      })
      .catch(function () {
        showToast("Network error. Please check your connection and try again.", "error");
      })
      .finally(function () {
        if (submitBtn) submitBtn.disabled = false;
        if (spinner) spinner.hidden = true;
        if (btnText) btnText.style.opacity = "1";
      });
  }

  function bindContactForm() {
    var form = document.getElementById("contactForm");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      submitForm(form, "/api/contact", "contactSuccess", "contactSubmitBtn");
    });
  }

  function bindBookingForm() {
    var form = document.getElementById("bookingForm");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      submitForm(form, "/api/bookings", "bookingSuccess", "bookingSubmitBtn");
    });
  }

  /* ---------------- Catering Menu Builder Wizard ---------------- */
  (function initCateringWizard() {
    var root = document.getElementById("cateringWizard");
    if (!root) return; // not on the menu page

    // Bilingual name helpers.
    // menu_items already stores BOTH the Tamil name (name_tamil) and the
    // English translation (name) in the database — this was purely a
    // rendering gap, not a data gap.
    function itemNameTamil(item) {
      return (item.name_tamil && item.name_tamil.trim()) || "";
    }
    function itemNameEnglish(item) {
      return (item.name && item.name.trim()) || "";
    }
    // Combined plain-text label — used only in single-line contexts
    // (search matching, the plain-text summary list) where two-line
    // markup isn't practical.
    function itemLabel(item) {
      var tamil = itemNameTamil(item);
      var english = itemNameEnglish(item);
      if (tamil && english) return tamil + " — " + english;
      return tamil || english || "Item";
    }
    // Two-line bilingual markup: Tamil as the primary line, English
    // directly beneath it. Used everywhere a dish is shown as its own
    // row/card (detail checklist, add-dish list, added-dish chips).
    function itemNameMarkup(item) {
      var tamil = itemNameTamil(item);
      var english = itemNameEnglish(item);
      var html = '<span class="menu-item-content">';
      html += '<span class="menu-item-tamil">' + (tamil || english || "Item") + '</span>';
      if (tamil && english) {
        html += '<span class="menu-item-english">' + english + '</span>';
      }
      html += '</span>';
      return html;
    }

    // English headings for the physical menu-card sections. menu_section
    // only stores the Tamil heading in the database, so this is a small
    // display-only lookup rather than a schema change.
    var SECTION_ENGLISH = {
      "காலை டிபன் - 1": "Breakfast Tiffin - 1",
      "காலை டிபன் - 2": "Breakfast Tiffin - 2",
      "காலை டிபன் - 3": "Breakfast Tiffin - 3",
      "மதியம் சாப்பாடு - 1": "Lunch Meal - 1",
      "மதியம் சாப்பாடு - 2": "Lunch Meal - 2",
      "டின்னர் மெனு - 1": "Dinner Menu - 1",
      "டின்னர் மெனு - 2": "Dinner Menu - 2",
      "டின்னர் மெனு - 3": "Dinner Menu - 3",
      "டின்னர் மெனு - 4": "Dinner Menu - 4",
      "டின்னர் மெனு - 5": "Dinner Menu - 5",
      "டின்னர் மெனு - 6": "Dinner Menu - 6"
    };
    function sectionLabel(section) {
      var english = SECTION_ENGLISH[section];
      return english
        ? section + '<span class="combo-card-title-en">' + english + '</span>'
        : section;
    }

    var state = {
      mealType: "",
      comboSection: "",
      comboItems: [],       // full item objects for the chosen combo
      checkedIds: {},       // id -> true/false, kept items while customizing
      addedItems: {},       // id -> item object, dishes added from master list
      menuType: "original", // 'original' | 'customized'
      masterList: null,     // cached /api/menu results (fetched once)
      form: {},
    };

    var panels = root.querySelectorAll(".wizard-panel");
    var progressItems = root.querySelectorAll("#wizardProgress li");

    function goToStep(step) {
      panels.forEach(function (p) { p.classList.toggle("active", p.dataset.panel === step); });
      progressItems.forEach(function (li) {
        li.classList.toggle("active", li.dataset.step === step);
        li.classList.toggle("done", stepOrder.indexOf(li.dataset.step) < stepOrder.indexOf(step));
      });
      root.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    var stepOrder = ["meal", "combo", "detail", "form", "summary"];

    root.querySelectorAll(".wizard-back").forEach(function (btn) {
      btn.addEventListener("click", function () { goToStep(btn.dataset.backTo); });
    });

    /* ---- Step 1: meal type ---- */
    document.getElementById("mealTypeGrid").addEventListener("click", function (e) {
      var card = e.target.closest(".meal-type-card");
      if (!card) return;
      state.mealType = card.dataset.meal;
      document.getElementById("comboHeading").textContent = state.mealType + " Menus";
      loadCombos(state.mealType);
      goToStep("combo");
    });

    /* ---- Step 2: combo list ---- */
    var comboGrid = document.getElementById("comboGrid");
    var comboEmptyState = document.getElementById("comboEmptyState");
    var comboLoadingState = document.getElementById("comboLoadingState");

    function loadCombos(category) {
      comboGrid.innerHTML = "";
      comboEmptyState.hidden = true;
      comboLoadingState.hidden = false;
      fetch("/api/catering/combos?category=" + encodeURIComponent(category))
        .then(function (res) { return res.json(); })
        .then(function (result) {
          comboLoadingState.hidden = true;
          if (!result.success) {
            showToast(result.error || "Unable to load menus.", "error");
            return;
          }
          renderCombos(result.data);
        })
        .catch(function () {
          comboLoadingState.hidden = true;
          showToast("Network error while loading menus.", "error");
        });
    }

    function renderCombos(combos) {
      comboGrid.innerHTML = "";
      comboEmptyState.hidden = combos.length !== 0;
      combos.forEach(function (combo) {
        var card = document.createElement("button");
        card.type = "button";
        card.className = "combo-card";
        card.innerHTML =
          '<span class="combo-card-title">' + sectionLabel(combo.section) + "</span>" +
          '<span class="combo-card-count">' + combo.item_count + " items included</span>" +
          '<span class="combo-card-cta">View Menu &rarr;</span>';
        card.addEventListener("click", function () { selectCombo(combo); });
        comboGrid.appendChild(card);
      });
    }

    /* ---- Step 3: review / keep / customize ---- */
    var detailItemList = document.getElementById("detailItemList");
    var customizePanel = document.getElementById("customizePanel");
    var detailActions = document.getElementById("detailActions");

    function selectCombo(combo) {
      state.comboSection = combo.section;
      state.comboItems = combo.items;
      state.checkedIds = {};
      state.addedItems = {};
      state.menuType = "original";
      combo.items.forEach(function (item) { state.checkedIds[item.id] = true; });

      document.getElementById("detailHeading").innerHTML = sectionLabel(combo.section);
      var sectionEnglish = SECTION_ENGLISH[combo.section];
      document.getElementById("detailSub").textContent =
        "Everything included in " + combo.section +
        (sectionEnglish ? " (" + sectionEnglish + ")" : "") + ":";
      customizePanel.hidden = true;
      detailActions.hidden = false;
      renderDetailList(false);
      goToStep("detail");
    }

    function renderDetailList(editable) {
      detailItemList.innerHTML = "";
      state.comboItems.forEach(function (item) {
        var li = document.createElement("li");
        li.className = "item-checklist-row";
        var checked = state.checkedIds[item.id];
        if (editable) {
          li.innerHTML =
            '<label class="item-checkbox"><input type="checkbox" data-item-id="' + item.id + '" ' +
            (checked ? "checked" : "") + ">" + itemNameMarkup(item) + "</label>";
        } else {
          li.innerHTML = '<span class="item-check-mark">&#10003;</span>' + itemNameMarkup(item);
        }
        detailItemList.appendChild(li);
      });
    }

    document.getElementById("keepMenuBtn").addEventListener("click", function () {
      state.menuType = "original";
      state.comboItems.forEach(function (item) { state.checkedIds[item.id] = true; });
      state.addedItems = {};
      goToStep("form");
    });

    document.getElementById("customizeMenuBtn").addEventListener("click", function () {
      state.menuType = "customized";
      detailActions.hidden = true;
      customizePanel.hidden = false;
      renderDetailList(true);
      loadMasterListIfNeeded();
    });

    detailItemList.addEventListener("change", function (e) {
      if (e.target.matches("input[type=checkbox]")) {
        state.checkedIds[e.target.dataset.itemId] = e.target.checked;
      }
    });

    /* ---- Customize: add dishes from master food list ---- */
    var addDishList = document.getElementById("addDishList");
    var addDishSearch = document.getElementById("addDishSearch");
    var addedDishesWrap = document.getElementById("addedDishesWrap");
    var addedDishesChips = document.getElementById("addedDishesChips");

    function loadMasterListIfNeeded() {
      if (state.masterList) {
        renderAddDishList();
        return;
      }
      addDishList.innerHTML = '<p class="loading-state">Loading dishes&hellip;</p>';
      fetch("/api/menu")
        .then(function (res) { return res.json(); })
        .then(function (result) {
          if (!result.success) {
            addDishList.innerHTML = "";
            showToast(result.error || "Unable to load dish list.", "error");
            return;
          }
          state.masterList = result.data.filter(function (item) {
            return item.category !== "Services";
          });
          renderAddDishList();
        })
        .catch(function () {
          addDishList.innerHTML = "";
          showToast("Network error while loading dishes.", "error");
        });
    }

    function comboItemIds() {
      var ids = {};
      state.comboItems.forEach(function (item) { ids[item.id] = true; });
      return ids;
    }

    function renderAddDishList() {
      var query = (addDishSearch.value || "").trim().toLowerCase();
      var inCombo = comboItemIds();
      addDishList.innerHTML = "";
      var shown = 0;
      state.masterList.forEach(function (item) {
        if (inCombo[item.id] || state.addedItems[item.id]) return;
        var label = itemLabel(item); // combined text — used for search matching only
        if (query && label.toLowerCase().indexOf(query) === -1) return;
        shown++;
        var row = document.createElement("div");
        row.className = "add-dish-row";
        row.innerHTML =
          itemNameMarkup(item) + '<button type="button" class="btn btn-sm btn-outline add-dish-btn" data-item-id="' + item.id + '">+ Add</button>';
        addDishList.appendChild(row);
      });
      if (!shown) {
        var msg = document.createElement("p");
        msg.className = "empty-state";
        msg.textContent = "No matching dishes found.";
        addDishList.appendChild(msg);
      }
    }

    addDishSearch.addEventListener("input", function () {
      if (state.masterList) renderAddDishList();
    });

    addDishList.addEventListener("click", function (e) {
      var btn = e.target.closest(".add-dish-btn");
      if (!btn) return;
      var item = state.masterList.find(function (i) { return String(i.id) === btn.dataset.itemId; });
      if (!item) return;
      state.addedItems[item.id] = item;
      renderAddDishList();
      renderAddedChips();
    });

    function renderAddedChips() {
      var ids = Object.keys(state.addedItems);
      addedDishesWrap.hidden = ids.length === 0;
      addedDishesChips.innerHTML = "";
      ids.forEach(function (id) {
        var item = state.addedItems[id];
        var chip = document.createElement("span");
        chip.className = "added-dish-chip";
        chip.innerHTML = itemNameMarkup(item) + ' <button type="button" data-item-id="' + id + '" aria-label="Remove">&times;</button>';
        addedDishesChips.appendChild(chip);
      });
    }

    addedDishesChips.addEventListener("click", function (e) {
      var btn = e.target.closest("button[data-item-id]");
      if (!btn) return;
      delete state.addedItems[btn.dataset.itemId];
      renderAddDishList();
      renderAddedChips();
    });

    document.getElementById("customizeContinueBtn").addEventListener("click", function () {
      goToStep("form");
    });

    /* ---- Step 4: customer details ---- */
    var detailsForm = document.getElementById("cateringDetailsForm");

    document.getElementById("detailsContinueBtn").addEventListener("click", function () {
      clearErrors(detailsForm);
      var errors = basicClientValidate(detailsForm);
      if (Object.keys(errors).length) {
        showErrors(detailsForm, errors);
        showToast("Please fix the highlighted fields.", "error");
        return;
      }
      var formData = new FormData(detailsForm);
      state.form = {};
      formData.forEach(function (value, key) { state.form[key] = value; });
      renderSummary();
      goToStep("summary");
    });

    /* ---- Step 5: summary + submit ---- */
    var summaryCard = document.getElementById("summaryCard");

    function includedItemLabels() {
      return state.comboItems
        .filter(function (item) { return state.checkedIds[item.id]; })
        .map(itemLabel);
    }
    function removedItemLabels() {
      return state.comboItems
        .filter(function (item) { return !state.checkedIds[item.id]; })
        .map(itemLabel);
    }
    function addedItemLabels() {
      return Object.keys(state.addedItems).map(function (id) { return itemLabel(state.addedItems[id]); });
    }

    function summaryRow(label, value) {
      return '<div class="summary-row"><span class="summary-label">' + label + '</span><span class="summary-value">' + (value || "—") + "</span></div>";
    }
    function summaryListRow(label, items, prefix) {
      if (!items.length) return "";
      var html = items.map(function (i) { return "<li>" + prefix + " " + i + "</li>"; }).join("");
      return '<div class="summary-list-block"><h4>' + label + "</h4><ul>" + html + "</ul></div>";
    }

    function renderSummary() {
      var f = state.form;
      var html = "";
      html += summaryRow("Meal", state.mealType);
      html += summaryRow("Selected Menu", state.comboSection);
      html += summaryRow("Menu Type", state.menuType === "customized" ? "Customized" : "Original");
      html += summaryRow("Guests", f.guest_count);
      html += summaryListRow("Included", includedItemLabels(), "&#10003;");
      if (state.menuType === "customized") {
        html += summaryListRow("Added", addedItemLabels(), "+");
        html += summaryListRow("Removed", removedItemLabels(), "&minus;");
      }
      html += summaryRow("Event", f.event_type);
      html += summaryRow("Date", f.event_date);
      if (f.event_time) html += summaryRow("Time", f.event_time);
      html += summaryRow("Location", f.location);
      if (f.food_preference) html += summaryRow("Food Preference", f.food_preference);
      if (f.additional_requirements) html += summaryRow("Additional Requirements", f.additional_requirements);
      html += summaryRow("Contact", f.name + " · " + f.phone + (f.email ? " · " + f.email : ""));
      summaryCard.innerHTML = html;
    }

    document.getElementById("submitEnquiryBtn").addEventListener("click", function () {
      var submitBtn = document.getElementById("submitEnquiryBtn");
      var btnText = submitBtn.querySelector(".btn-text");
      var spinner = submitBtn.querySelector(".btn-spinner");
      submitBtn.disabled = true;
      spinner.hidden = false;
      btnText.style.opacity = "0.6";

      var payload = Object.assign({}, state.form, {
        meal_type: state.mealType,
        selected_menu: state.comboSection,
        menu_type: state.menuType,
        included_items: includedItemLabels(),
        added_items: state.menuType === "customized" ? addedItemLabels() : [],
        removed_items: state.menuType === "customized" ? removedItemLabels() : [],
      });

      fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
        .then(function (res) { return res.json().then(function (data) { return { status: res.status, data: data }; }); })
        .then(function (result) {
          if (result.data.success) {
            var successBox = document.getElementById("cateringSuccess");
            successBox.textContent = result.data.message;
            successBox.hidden = false;
            showToast(result.data.message, "success");
            submitBtn.hidden = true;
          } else if (result.data.errors) {
            showToast("Please check your details and try again.", "error");
            goToStep("form");
            showErrors(detailsForm, result.data.errors);
          } else {
            showToast(result.data.error || "Something went wrong. Please try again.", "error");
          }
        })
        .catch(function () {
          showToast("Network error. Please check your connection and try again.", "error");
        })
        .finally(function () {
          submitBtn.disabled = false;
          spinner.hidden = true;
          btnText.style.opacity = "1";
        });
    });
  })();

  /* Expose small API used by inline template scripts */
  window.AbinashApp = {
    bindContactForm: bindContactForm,
    bindBookingForm: bindBookingForm,
    showToast: showToast,
  };

  /* ---------------- Admin dashboard tabs ---------------- */
  (function initAdminTabs() {
    var tabs = document.querySelectorAll(".admin-tab");
    var panels = document.querySelectorAll(".admin-panel");
    if (!tabs.length || !panels.length) return;

    function activate(name) {
      tabs.forEach(function (t) { t.classList.toggle("active", t.dataset.tab === name); });
      panels.forEach(function (p) { p.classList.toggle("active", p.id === name); });
    }

    tabs.forEach(function (tab) {
      tab.addEventListener("click", function (e) {
        e.preventDefault();
        activate(tab.dataset.tab);
        history.replaceState(null, "", "#" + tab.dataset.tab);
      });
    });

    var initial = (window.location.hash || "").replace("#", "");
    var valid = Array.prototype.some.call(panels, function (p) { return p.id === initial; });
    activate(valid ? initial : panels[0].id);
  })();

  /* ---------------- Owner dashboard: booking search/filter/detail ---------------- */
  (function initBookingTools() {
    var table = document.getElementById("bookingTable");
    if (!table) return; // not on the admin dashboard

    var rows = Array.prototype.slice.call(table.querySelectorAll(".booking-row"));
    var searchInput = document.getElementById("bookingSearch");
    var statusGroup = document.getElementById("statusFilterGroup");
    var mealGroup = document.getElementById("mealFilterGroup");
    var dateFilter = document.getElementById("bookingDateFilter");
    var clearBtn = document.getElementById("clearFiltersBtn");
    var noResults = document.getElementById("bookingNoResults");

    var todayStr = new Date().toISOString().slice(0, 10);
    var state = { search: "", status: "all", meal: "all", date: "" };

    function applyFilters() {
      var visible = 0;
      rows.forEach(function (row) {
        var ok = true;
        if (state.search && row.dataset.search.indexOf(state.search) === -1) ok = false;
        if (ok && state.status !== "all") {
          if (state.status === "today") ok = row.dataset.date === todayStr;
          else if (state.status === "upcoming") ok = !!row.dataset.date && row.dataset.date >= todayStr && row.dataset.status !== "cancelled";
          else ok = row.dataset.status === state.status;
        }
        if (ok && state.meal !== "all") ok = row.dataset.meal === state.meal;
        if (ok && state.date) ok = row.dataset.date === state.date;
        row.hidden = !ok;
        if (ok) visible++;
      });
      noResults.hidden = visible !== 0;
    }

    if (searchInput) {
      searchInput.addEventListener("input", function () {
        state.search = searchInput.value.trim().toLowerCase();
        applyFilters();
      });
    }

    [statusGroup, mealGroup].forEach(function (group) {
      if (!group) return;
      group.addEventListener("click", function (e) {
        var btn = e.target.closest(".filter-pill");
        if (!btn) return;
        group.querySelectorAll(".filter-pill").forEach(function (b) { b.classList.remove("active"); });
        btn.classList.add("active");
        state[group.dataset.filterType] = btn.dataset.value;
        applyFilters();
      });
    });

    if (dateFilter) {
      dateFilter.addEventListener("change", function () {
        state.date = dateFilter.value;
        applyFilters();
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener("click", function () {
        state = { search: "", status: "all", meal: "all", date: "" };
        if (searchInput) searchInput.value = "";
        if (dateFilter) dateFilter.value = "";
        [statusGroup, mealGroup].forEach(function (group) {
          if (!group) return;
          group.querySelectorAll(".filter-pill").forEach(function (b, i) { b.classList.toggle("active", i === 0); });
        });
        applyFilters();
      });
    }

    /* ---- Booking detail modal ---- */
    var modal = document.getElementById("bookingModal");
    var printArea = document.getElementById("bookingModalPrintArea");
    var whatsappBtn = document.getElementById("bookingWhatsAppBtn");

    function splitName(label) {
      // Stored labels look like "தமிழ் — English" or just "தமிழ்" for
      // older bookings. Split on the em dash used by itemLabel().
      var parts = String(label).split(" — ");
      return { tamil: parts[0] || "", english: parts[1] || "" };
    }

    function nameLine(label) {
      var n = splitName(label);
      return n.english
        ? '<div class="booking-item-line"><span class="menu-item-tamil">' + n.tamil + '</span><span class="menu-item-english">' + n.english + '</span></div>'
        : '<div class="booking-item-line"><span class="menu-item-tamil">' + n.tamil + '</span></div>';
    }

    function fieldRow(label, value) {
      return '<div class="print-row"><span class="print-label">' + label + '</span><span class="print-value">' + (value || "—") + "</span></div>";
    }

    function whatsappLink(phone) {
      var digits = String(phone || "").replace(/\D/g, "");
      if (digits.length === 10) digits = "91" + digits; // default India country code
      return "https://wa.me/" + digits;
    }

    function openBookingModal(booking) {
      var included = booking.included_items || [];
      var added = booking.added_items || [];
      var removed = booking.removed_items || [];

      var html = "";
      html += '<h2 class="print-title">ABINASH CATERING</h2>';
      html += '<p class="print-sub">Booking #' + String(booking.id).slice(0, 8).toUpperCase() + "</p>";

      html += '<h3>Customer Details</h3>';
      html += fieldRow("Name", booking.name);
      html += fieldRow("Phone", booking.phone);
      html += fieldRow("Email", booking.email);

      html += '<h3>Event Details</h3>';
      html += fieldRow("Event", booking.event_type);
      html += fieldRow("Date", booking.event_date);
      html += fieldRow("Time", booking.event_time);
      html += fieldRow("Guests", booking.guest_count);
      html += fieldRow("Location", booking.location);
      html += fieldRow("Meal", booking.meal_type);

      html += '<h3>Selected Combo</h3>';
      html += fieldRow("Menu", (booking.selected_menu || "—") + (booking.menu_type === "customized" ? " (Customized)" : " (Original)"));

      if (included.length) {
        html += "<h3>Included Items</h3><div class='booking-item-list'>" +
          included.map(function (i) { return nameLine(i); }).join("") + "</div>";
      }
      if (booking.menu_type === "customized" && removed.length) {
        html += "<h3>Removed Items</h3><div class='booking-item-list booking-item-removed'>" +
          removed.map(function (i) { return nameLine(i); }).join("") + "</div>";
      }
      if (booking.menu_type === "customized" && added.length) {
        html += "<h3>Added Items</h3><div class='booking-item-list booking-item-added'>" +
          added.map(function (i) { return nameLine(i); }).join("") + "</div>";
      }

      html += '<h3>Special Instructions</h3>';
      html += "<p class='print-note'>" + (booking.additional_requirements || "No special instructions") + "</p>";
      if (booking.food_preference) html += fieldRow("Food Preference", booking.food_preference);

      html += '<h3>Status</h3>';
      html += fieldRow("Current Status", (booking.status || "pending").charAt(0).toUpperCase() + (booking.status || "pending").slice(1));

      printArea.innerHTML = html;
      whatsappBtn.href = whatsappLink(booking.phone);
      modal.hidden = false;
      document.body.style.overflow = "hidden";
    }

    function closeBookingModal() {
      modal.hidden = true;
      document.body.style.overflow = "";
    }

    table.addEventListener("click", function (e) {
      var btn = e.target.closest(".view-booking-btn");
      if (!btn) return;
      var row = btn.closest(".booking-row");
      var booking = JSON.parse(row.dataset.booking);
      openBookingModal(booking);
    });

    var backdrop = document.getElementById("bookingModalBackdrop");
    var closeBtn = document.getElementById("bookingModalClose");
    if (backdrop) backdrop.addEventListener("click", closeBookingModal);
    if (closeBtn) closeBtn.addEventListener("click", closeBookingModal);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && modal && !modal.hidden) closeBookingModal();
    });

    var printBtn = document.getElementById("bookingPrintBtn");
    if (printBtn) printBtn.addEventListener("click", function () { window.print(); });
  })();
})();