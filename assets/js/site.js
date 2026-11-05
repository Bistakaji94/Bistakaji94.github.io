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
    .map(function (item) {
      const embedUrl = convertVideoUrl(item.url);

      return `
        <article class="card video-card reveal">
          ${
            embedUrl
              ? `
                <div class="video-frame">
                  <iframe
                    src="${embedUrl}"
                    title="${item.title}"
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write;
                      encrypted-media; gyroscope; picture-in-picture"
                    allowfullscreen>
                  </iframe>
                </div>`
              : `
                <img src="${item.image || PLACEHOLDER_IMAGE}"
                  alt="${item.title}">
                <p class="muted" style="padding: 0 22px;">
                  Video link coming soon.
                </p>`
          }

          <div class="card-body">
            <h3>${item.title}</h3>
            <p>${item.description}</p>
            <img src="${item.image || PLACEHOLDER_IMAGE}"
              alt="${item.title}"
              style="border-radius: 14px; margin: 14px 0 0;">
            <p class="caption">${item.imageCaption || ""}</p>
          </div>
        </article>`;
    })
    .join("");
}

function convertVideoUrl(url) {
  if (!url) return "";

  const youtubeWatch = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]+)/
  );

  if (youtubeWatch) {
    return `https://www.youtube.com/embed/${youtubeWatch[1]}`;
  }

  const youtubeShort = url.match(/youtube\.com\/shorts\/([A-Za-z0-9_-]+)/);

  if (youtubeShort) {
    return `https://www.youtube.com/embed/${youtubeShort[1]}`;
  }

  const vimeo = url.match(/vimeo\.com\/(\d+)/);

  if (vimeo) {
    return `https://player.vimeo.com/video/${vimeo[1]}`;
  }

  return "";
}

let galleryImages = [];
let currentGalleryImage = 0;

function renderGallery(albums) {
  const container = document.getElementById("gallery-list");

  if (!container) return;

  galleryImages = [];

  container.innerHTML = albums
    .map(function (album) {
      const albumPhotos = [
        {
          image: album.cover,
          caption: album.coverCaption || album.title
        }
      ].concat(album.images || []);

      albumPhotos.forEach(function (photo) {
        galleryImages.push({
          src: photo.image || PLACEHOLDER_IMAGE,
          caption: photo.caption || album.title
        });
      });

      return `
        <section class="album reveal">
          <h2>${album.title}</h2>
          <p class="muted">${album.description || ""}</p>

          <img
            class="gallery-cover"
            src="${album.cover || PLACEHOLDER_IMAGE}"
            alt="${album.title}"
            data-index="${galleryImages.length - albumPhotos.length}"
          >
          <p class="caption">${album.coverCaption || ""}</p>

          <div class="album-grid">
            ${
              (album.images || [])
                .map(function (photo, photoIndex) {
                  const imageIndex =
                    galleryImages.length - albumPhotos.length + 1 + photoIndex;

                  return `
                    <figure class="album-image">
                      <img
                        src="${photo.image || PLACEHOLDER_IMAGE}"
                        alt="${photo.caption || album.title}"
                        data-index="${imageIndex}"
                      >
                      <figcaption class="caption">
                        ${photo.caption || ""}
                      </figcaption>
                    </figure>`;
                })
                .join("")
            }
          </div>
        </section>`;
    })
    .join("");

  setupGalleryViewer();
}

function setupGalleryViewer() {
  const images = document.querySelectorAll("#gallery-list img[data-index]");

  images.forEach(function (image) {
    image.addEventListener("click", function () {
      openGalleryViewer(Number(image.dataset.index));
    });
  });
}

function openGalleryViewer(index) {
  currentGalleryImage = index;
  updateGalleryViewer();
  document.getElementById("gallery-lightbox").classList.add("open");
  document.body.style.overflow = "hidden";
}

function updateGalleryViewer() {
  const image = galleryImages[currentGalleryImage];

  document.getElementById("gallery-lightbox-image").src = image.src;
  document.getElementById("gallery-lightbox-caption").textContent =
    image.caption;
}

function nextGalleryImage() {
  currentGalleryImage = (currentGalleryImage + 1) % galleryImages.length;
  updateGalleryViewer();
}

function previousGalleryImage() {
  currentGalleryImage =
    (currentGalleryImage - 1 + galleryImages.length) % galleryImages.length;
  updateGalleryViewer();
}

function closeGalleryViewer() {
  document.getElementById("gallery-lightbox").classList.remove("open");
  document.body.style.overflow = "";
}

function setupGalleryLightbox() {
  const images = document.querySelectorAll(
    "#gallery-list img[data-full]"
  );

  images.forEach(function (image) {
    image.addEventListener("click", function () {
      openLightbox(image.dataset.full, image.alt);
    });
  });
}

function openLightbox(imageSource, caption) {
  const lightbox = document.getElementById("lightbox");

  document.getElementById("lightbox-image").src = imageSource;
  document.getElementById("lightbox-caption").textContent = caption || "";
  lightbox.classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeLightbox() {
  const lightbox = document.getElementById("lightbox");

  lightbox.classList.remove("open");
  document.body.style.overflow = "";
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
