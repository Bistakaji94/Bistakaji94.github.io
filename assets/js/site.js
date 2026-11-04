/* ============================================================
   Website content renderer
   Loads all editable content from content/data.json
   ============================================================ */

const PLACEHOLDER_IMAGE =
  "https://commons.wikimedia.org/wiki/Special:FilePath/Himalayas,_Ama_Dablam,_Nepal.jpg?width=1200";

async function loadContent() {
  const response = await fetch("content/data.json");

  if (!response.ok) {
    throw new Error("Could not load website content.");
  }

  return response.json();
}

function setText(selector, value) {
  document.querySelectorAll(selector).forEach(function (element) {
    element.textContent = value || "";
  });
}

function setLink(selector, value) {
  document.querySelectorAll(selector).forEach(function (element) {
    if (value) {
      element.href = value;
      element.style.display = "";
    } else {
      element.href = "#";
      element.style.display = "none";
    }
  });
}

function setImage(selector, value) {
  document.querySelectorAll(selector).forEach(function (element) {
    element.src = value || PLACEHOLDER_IMAGE;
  });
}

function slug(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function renderProfile(profile) {
  setText(".profile-name", profile.name);
  setText(".profile-nickname", profile.nickname);
  setText(".profile-tagline", profile.tagline);
  setText(".profile-intro", profile.intro);
  setText(".profile-email", profile.email);
  setText(".profile-location", profile.location);

  document.querySelectorAll(".profile-email-link").forEach(function (link) {
    link.href = "mailto:" + profile.email;
    link.textContent = profile.email;
  });

  setImage(".profile-portrait", profile.portrait);

  const hero = document.querySelector(".hero");
  if (hero && profile.heroImage) {
    hero.style.setProperty("--hero-image", 'url("' + profile.heroImage + '")');
  }

  setLink(".profile-github-link", profile.github);
  setLink(".profile-linkedin-link", profile.linkedin);
  setLink(".profile-youtube-link", profile.youtube);
  setLink(".profile-researchgate-link", profile.researchgate);
}

function renderResearch(items) {
  const cards = document.getElementById("research-list");
  const modals = document.getElementById("research-modals");

  if (!cards || !modals) return;

  cards.innerHTML = items
    .map(
      (item) => `
        <article class="card reveal" data-category="${item.category}">
          <img src="${item.image || PLACEHOLDER_IMAGE}" alt="${item.title}">
          <div class="card-body">
            <span class="badge">${item.category}</span>
            <h3>${item.title}</h3>
            <p>${item.summary}</p>
            <button class="btn btn-outline" data-modal="modal-${slug(item.title)}">
              Project details
            </button>
          </div>
        </article>`
    )
    .join("");

  modals.innerHTML = items
    .map(
      (item) => `
        <div class="modal" id="modal-${slug(item.title)}">
          <div class="modal-content">
            <button class="modal-close">&times;</button>
            <h3>${item.title}</h3>
            <img src="${item.image || PLACEHOLDER_IMAGE}" alt="${item.title}"
              style="border-radius: 14px; margin-bottom: 14px;">
            <p class="caption">${item.imageCaption || ""}</p>
            <p><strong>Summary:</strong> ${item.summary}</p>
            <p><strong>Methods:</strong> ${item.methods}</p>
            <p><strong>Outcome:</strong> ${item.outcome}</p>
          </div>
        </div>`
    )
    .join("");
}

function renderPosts(items) {
  const container = document.getElementById("post-list");

  if (!container) return;

  container.innerHTML = items
    .map(
      (item) => `
        <article class="post reveal" data-category="${item.category}">
          <p class="meta">${item.category} &middot; ${item.date}</p>
          <h3>${item.title}</h3>
          <p>${item.body}</p>
          <img src="${item.image || PLACEHOLDER_IMAGE}" alt="${item.title}">
          <p class="caption">${item.imageCaption || ""}</p>
        </article>`
    )
    .join("");
}

function renderPostPreview(items) {
  const container = document.getElementById("post-preview");

  if (!container) return;

  container.innerHTML = items
    .map(
      (item) => `
        <article class="card reveal">
          <img src="${item.image || PLACEHOLDER_IMAGE}" alt="${item.title}">
          <div class="card-body">
            <span class="badge">${item.category}</span>
            <h3>${item.title}</h3>
            <p>${item.body}</p>
            <a href="blog.html">Read more &rarr;</a>
          </div>
        </article>`
    )
    .join("");
}

function renderVideos(items) {
  const container = document.getElementById("video-list");

  if (!container) return;

  container.innerHTML = items
    .map(
      (item) => `
        <article class="card video-card reveal">
          <img src="${item.image || PLACEHOLDER_IMAGE}" alt="${item.title}">
          <div class="play">&#9654;</div>
          <div class="card-body">
            <h3>${item.title}</h3>
            <p>${item.description}</p>
            <img src="${item.image || PLACEHOLDER_IMAGE}" alt="${item.title}"
              style="border-radius: 14px; margin: 14px 0 0;">
            <p class="caption">${item.imageCaption || ""}</p>
            ${
              item.url
                ? `<a href="${item.url}" target="_blank" rel="noopener">Watch video &rarr;</a>`
                : `<p class="muted">Video link coming soon.</p>`
            }
          </div>
        </article>`
    )
    .join("");
}

function renderGallery(albums) {
  const container = document.getElementById("gallery-list");

  if (!container) return;

  container.innerHTML = albums
    .map(
      (album) => `
        <section class="album reveal">
          <h2>${album.title}</h2>
          <p class="muted">${album.description || ""}</p>

          <img src="${album.cover || PLACEHOLDER_IMAGE}" alt="${album.title}"
            style="border-radius: 16px; width: 100%; max-height: 430px; object-fit: cover;">
          <p class="caption">${album.coverCaption || ""}</p>

          <div class="album-grid">
            ${
              (album.images || [])
                .map(
                  (photo) => `
                    <figure class="album-image">
                      <img src="${photo.image || PLACEHOLDER_IMAGE}"
                        alt="${photo.caption || album.title}">
                      <figcaption class="caption">${photo.caption || ""}</figcaption>
                    </figure>`
                )
                .join("")
            }
          </div>
        </section>`
    )
    .join("");
}

loadContent()
  .then(function (content) {
    renderProfile(content.profile || {});
    renderResearch(content.research || []);
    renderPosts(content.posts || []);
    renderPostPreview((content.posts || []).slice(0, 3));
    renderVideos(content.videos || []);
    renderGallery(content.gallery || []);

    document.dispatchEvent(new Event("content:loaded"));
  })
  .catch(function (error) {
    console.error(error);
  });
