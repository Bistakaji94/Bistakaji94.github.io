/* ============================================================
   Website interface JavaScript
   ============================================================ */

document.addEventListener("DOMContentLoaded", initialiseInterface);
document.addEventListener("content:loaded", initialiseInterface);

function initialiseInterface() {
  setupMobileNavigation();
  setupFilters();
  setupRevealAnimations();
  setupModals();
  updateCopyrightYear();
}

function setupMobileNavigation() {
  const toggle = document.querySelector(".nav-toggle");
  const menu = document.querySelector(".menu");

  if (!toggle || !menu) return;

  toggle.onclick = function () {
    menu.classList.toggle("open");
  };
}

function setupFilters() {
  const buttons = document.querySelectorAll(".filter");
  const items = document.querySelectorAll("[data-category]");

  buttons.forEach(function (button) {
    button.onclick = function () {
      buttons.forEach(function (item) {
        item.classList.remove("active");
      });

      button.classList.add("active");

      const selected = button.dataset.filter;

      items.forEach(function (item) {
        const show = selected === "all" || item.dataset.category === selected;
        item.style.display = show ? "" : "none";
      });
    };
  });
}

function setupRevealAnimations() {
  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  document.querySelectorAll(".reveal:not(.visible)").forEach(function (element) {
    observer.observe(element);
  });
}

function setupModals() {
  document.querySelectorAll("[data-modal]").forEach(function (button) {
    button.onclick = function () {
      const modal = document.getElementById(button.dataset.modal);

      if (modal) {
        modal.classList.add("open");
        document.body.style.overflow = "hidden";
      }
    };
  });

  document.querySelectorAll(".modal-close, .modal").forEach(function (element) {
    element.onclick = function (event) {
      const closeClicked = event.target.classList.contains("modal-close");
      const outsideClicked = event.target === element;

      if (closeClicked || outsideClicked) {
        document.querySelectorAll(".modal").forEach(function (modal) {
          modal.classList.remove("open");
        });

        document.body.style.overflow = "";
      }
    };
  });
}

function updateCopyrightYear() {
  const year = document.getElementById("year");

  if (year) {
    year.textContent = new Date().getFullYear();
  }
}
