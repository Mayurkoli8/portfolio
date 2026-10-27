(function () {
  "use strict";

  var header = document.querySelector(".site-header");
  var toggle = document.querySelector(".nav-toggle");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ── Header background once the page scrolls ──
  if (header) {
    var onScroll = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  // ── Mobile menu ──
  function setMenu(open) {
    if (!header || !toggle) return;
    header.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.querySelector(".nav-toggle-text").textContent = open ? "Close" : "Menu";
  }
  if (toggle) {
    toggle.addEventListener("click", function () {
      setMenu(toggle.getAttribute("aria-expanded") !== "true");
    });
    document.querySelectorAll(".nav-links a").forEach(function (a) {
      a.addEventListener("click", function () { setMenu(false); });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && header.classList.contains("is-open")) {
        setMenu(false);
        toggle.focus();
      }
    });
  }

  // ── Highlight the nav link for the section in view ──
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav-links a[href^="#"]'));
  if (navLinks.length && "IntersectionObserver" in window) {
    var byId = {};
    navLinks.forEach(function (a) { byId[a.getAttribute("href").slice(1)] = a; });
    // Watch every section so ones without a nav link (services, writing…) clear the highlight.
    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (a) { a.removeAttribute("aria-current"); });
        var link = byId[entry.target.id];
        if (link) link.setAttribute("aria-current", "true");
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    document.querySelectorAll("main section").forEach(function (el) {
      sectionObserver.observe(el);
    });
  }

  // ── Reveal on scroll ──
  var revealEls = document.querySelectorAll(".reveal");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  } else {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  }

  // ── Latest posts from the blog (the HTML ships with a fallback list) ──
  var postList = document.getElementById("post-list");
  if (postList && window.fetch && window.DOMParser) {
    var FEED_URL = "https://blog.mayurkoli.me/feed.xml";
    var dateFmt = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });
    // Reuse the arrow icon from the static fallback markup.
    var arrowTemplate = postList.querySelector("svg");

    var el = function (tag, className, text) {
      var node = document.createElement(tag);
      if (className) node.className = className;
      if (text) node.textContent = text;
      return node;
    };

    fetch(FEED_URL, { headers: { Accept: "application/rss+xml, application/xml" } })
      .then(function (res) {
        if (!res.ok) throw new Error("Feed returned " + res.status);
        return res.text();
      })
      .then(function (xml) {
        var doc = new DOMParser().parseFromString(xml, "application/xml");
        var items = Array.prototype.slice.call(doc.querySelectorAll("item"), 0, 5);
        var rows = [];
        items.forEach(function (item) {
          var text = function (tag) {
            var node = item.querySelector(tag);
            return node ? node.textContent.trim() : "";
          };
          var link = text("link");
          if (!/^https:\/\/blog\.mayurkoli\.me\//.test(link)) return;
          var date = new Date(text("pubDate"));

          var li = el("li", "post");
          var a = el("a");
          a.href = link;
          var time = el("time", "mono", isNaN(date) ? "" : dateFmt.format(date));
          if (!isNaN(date)) time.dateTime = date.toISOString().slice(0, 10);
          a.appendChild(time);
          a.appendChild(el("span", "post-title", text("title")));
          if (arrowTemplate) a.appendChild(arrowTemplate.cloneNode(true));
          a.appendChild(el("span", "post-desc", text("description")));
          li.appendChild(a);
          rows.push(li);
        });
        if (rows.length) postList.replaceChildren.apply(postList, rows);
      })
      .catch(function () {
        // Keep the static list that shipped with the page.
      });
  }

  // ── Contact form (Formspree) ──
  var form = document.getElementById("contact-form");
  if (form && window.fetch) {
    var status = form.querySelector(".form-status");
    var submit = form.querySelector('button[type="submit"]');
    var submitLabel = submit.querySelector(".label");
    var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    var rules = {
      name: function (v) { return v ? "" : "Please add your name."; },
      email: function (v) {
        if (!v) return "Please add your email so I can reply.";
        return emailPattern.test(v) ? "" : "That email address doesn't look right.";
      },
      message: function (v) {
        if (!v) return "Tell me a little about what you need.";
        return v.length < 10 ? "A few more words, please (10 characters or more)." : "";
      }
    };

    var validateField = function (name) {
      var input = form.elements[name];
      var error = rules[name](input.value.trim());
      var slot = document.getElementById(name + "-error");
      input.setAttribute("aria-invalid", error ? "true" : "false");
      if (slot) slot.textContent = error;
      return !error;
    };

    // Validate on submit, then re-check a flagged field as it's corrected. No blur
    // validation: an error appearing on blur shifts the Send button mid-click.
    Object.keys(rules).forEach(function (name) {
      var input = form.elements[name];
      input.addEventListener("input", function () {
        if (input.getAttribute("aria-invalid") === "true") validateField(name);
      });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      status.className = "form-status";
      status.textContent = "";

      var firstInvalid = null;
      Object.keys(rules).forEach(function (name) {
        if (!validateField(name) && !firstInvalid) firstInvalid = form.elements[name];
      });
      if (firstInvalid) {
        firstInvalid.focus();
        return;
      }

      submit.disabled = true;
      submitLabel.textContent = "Sending…";

      fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" }
      })
        .then(function (res) {
          if (res.ok) return;
          return res.json().catch(function () { return {}; }).then(function (data) {
            var msg = data && data.errors && data.errors.length ? data.errors[0].message : "";
            throw new Error(msg || "The form service returned an error.");
          });
        })
        .then(function () {
          form.reset();
          Object.keys(rules).forEach(function (name) {
            form.elements[name].removeAttribute("aria-invalid");
          });
          status.classList.add("is-ok");
          status.textContent = "Thanks, your message is on its way. I usually reply within a day.";
        })
        .catch(function (err) {
          status.classList.add("is-error");
          status.textContent = err.message + " You can also email me at kolimohit9595@gmail.com.";
        })
        .then(function () {
          submit.disabled = false;
          submitLabel.textContent = "Send message";
        });
    });
  }
})();
