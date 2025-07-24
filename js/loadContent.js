import { db } from "./firebase-config.js";
import {
  ref,
  onValue,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";
import { auth } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// Modal functionality
function createModal() {
  const modal = document.createElement("div");
  modal.className = "modal";
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3 id="modal-title"></h3>
        <span class="close">&times;</span>
      </div>
      <div class="modal-body">
        <p id="modal-content"></p>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  // Close modal functionality
  const closeBtn = modal.querySelector(".close");
  closeBtn.onclick = () => closeModal();

  // Close modal when clicking outside
  modal.onclick = (e) => {
    if (e.target === modal) {
      closeModal();
    }
  };

  // Close modal with Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.style.display === "block") {
      closeModal();
    }
  });

  function closeModal() {
    modal.style.display = "none";
    document.body.style.overflow = "auto";
  }

  return modal;
}

// Initialize modal
const modal = createModal();

function showModal(title, content) {
  document.getElementById("modal-title").textContent = title;
  document.getElementById("modal-content").textContent = content;
  modal.style.display = "block";
  document.body.style.overflow = "hidden";
}

// Update the renderArticle function to include login check
function renderArticle({ title, content }) {
  const articleDiv = document.createElement("div");
  articleDiv.className = "loading";
  articleDiv.innerHTML = `
    <h3>${escapeHtml(title)}</h3>
    <p>${escapeHtml(content.substring(0, 150))}${
    content.length > 150 ? "..." : ""
  }</p>
    <div style="margin-top: 1rem; color: #667eea; font-weight: 500;">
      <i class="fas fa-arrow-right" style="margin-right: 5px;"></i>
      Click to read more
    </div>
  `;

  // Add click event for modal with authentication check
  articleDiv.addEventListener("click", () => {
    checkAuthBeforeReading(title, content);
  });

  // Add keyboard accessibility
  articleDiv.setAttribute("tabindex", "0");
  articleDiv.setAttribute("role", "button");
  articleDiv.setAttribute("aria-label", `Read full article: ${title}`);

  articleDiv.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      checkAuthBeforeReading(title, content);
    }
  });

  return articleDiv;
}

// Add this new function to check authentication
function checkAuthBeforeReading(title, content) {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // User is signed in, show the article
      showModal(title, content);
    } else {
      // User is not signed in, redirect to login page
      window.location.href = "login.html";
    }
  });
}

function renderInfographic({ imageUrl, caption }) {
  const infographicDiv = document.createElement("div");
  infographicDiv.className = "loading";
  infographicDiv.innerHTML = `
    <img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(
    caption
  )}" loading="lazy" onerror="handleImageError(this)">
    <p>${escapeHtml(caption)}</p>
  `;
  return infographicDiv;
}

function renderVideo({ title, videoUrl }) {
  let embedUrl = videoUrl;

  // Handle different YouTube URL formats
  if (videoUrl.includes("youtu.be")) {
    const videoId = videoUrl.split("/").pop().split("?")[0];
    embedUrl = `https://www.youtube.com/embed/${videoId}`;
  } else if (videoUrl.includes("youtube.com/watch")) {
    const videoId = new URL(videoUrl).searchParams.get("v");
    embedUrl = `https://www.youtube.com/embed/${videoId}`;
  }

  const videoDiv = document.createElement("div");
  videoDiv.className = "loading";
  videoDiv.innerHTML = `
    <h4>${escapeHtml(title)}</h4>
    <iframe 
      width="100%" 
      height="200" 
      src="${escapeHtml(embedUrl)}" 
      frameborder="0" 
      allowfullscreen
      loading="lazy"
      title="${escapeHtml(title)}"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    ></iframe>
  `;
  return videoDiv;
}

// Helper function to escape HTML
function escapeHtml(text) {
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text ? text.replace(/[&<>"']/g, (m) => map[m]) : "";
}

// Enhanced loading with staggered animations
function loadContentWithAnimation(container, items, renderFunction) {
  container.innerHTML = ""; // Clear existing content

  if (items.length === 0) {
    showEmptyState(container);
    return;
  }

  items.forEach((item, index) => {
    const element = renderFunction(item);
    element.style.animationDelay = `${index * 0.1}s`;
    container.appendChild(element);
  });
}

// Show empty state with better styling
function showEmptyState(container) {
  const sectionName = container.id
    .replace("-list", "")
    .replace(/([A-Z])/g, " $1")
    .toLowerCase();
  const icons = {
    article: "fas fa-newspaper",
    infographic: "fas fa-chart-bar",
    video: "fas fa-play-circle",
  };

  const iconClass = icons[sectionName] || "fas fa-info-circle";

  container.innerHTML = `
    <div class="empty-state">
      <i class="${iconClass}" style="font-size: 3rem; color: #bdc3c7; margin-bottom: 1rem;"></i>
      <h3>No ${sectionName}s available yet</h3>
      <p>Check back soon for new ${sectionName} content!</p>
    </div>
  `;
}

// Global error handler for images
window.handleImageError = function (img) {
  img.style.display = "none";
  const fallback = document.createElement("div");
  fallback.innerHTML = `
    <div style="
      width: 100%; 
      height: 200px; 
      background: linear-gradient(135deg, #ecf0f1, #bdc3c7); 
      display: flex; 
      flex-direction: column;
      align-items: center; 
      justify-content: center; 
      color: #7f8c8d;
      border-radius: 10px;
      margin-bottom: 1rem;
    ">
      <i class="fas fa-image" style="font-size: 2rem; margin-bottom: 0.5rem;"></i>
      <span>Image not available</span>
    </div>
  `;
  img.parentNode.insertBefore(fallback.firstElementChild, img);
};

// Load articles with enhanced functionality
onValue(ref(db, "articles"), (snap) => {
  const container = document.getElementById("article-list");
  const articles = [];

  snap.forEach((child) => {
    const article = child.val();
    if (article && article.title && article.content) {
      articles.push(article);
    }
  });

  loadContentWithAnimation(container, articles, renderArticle);
});

// Load infographics
onValue(ref(db, "infographics"), (snap) => {
  const container = document.getElementById("infographic-list");
  const infographics = [];

  snap.forEach((child) => {
    const infographic = child.val();
    if (infographic && infographic.imageUrl && infographic.caption) {
      infographics.push(infographic);
    }
  });

  loadContentWithAnimation(container, infographics, renderInfographic);
});

// Load videos
onValue(ref(db, "videos"), (snap) => {
  const container = document.getElementById("video-list");
  const videos = [];

  snap.forEach((child) => {
    const video = child.val();
    if (video && video.title && video.videoUrl) {
      videos.push(video);
    }
  });

  loadContentWithAnimation(container, videos, renderVideo);
});

// Enhanced scroll functionality
document.addEventListener("DOMContentLoaded", () => {
  // Smooth scrolling for navigation links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        target.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    });
  });

  // Intersection Observer for scroll animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1";
        entry.target.style.transform = "translateY(0)";
      }
    });
  }, observerOptions);

  // Observe elements as they're created
  const observeNewElements = () => {
    document.querySelectorAll(".loading:not([data-observed])").forEach((el) => {
      observer.observe(el);
      el.setAttribute("data-observed", "true");
    });
  };

  // Set up a mutation observer to watch for new content
  const mutationObserver = new MutationObserver(observeNewElements);
  mutationObserver.observe(document.body, {
    childList: true,
    subtree: true,
  });

  // Initial observation
  observeNewElements();

  // Header scroll effect
  let lastScrollTop = 0;
  const header = document.querySelector(".header");

  window.addEventListener(
    "scroll",
    () => {
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;

      if (scrollTop > lastScrollTop && scrollTop > 100) {
        // Scrolling down
        header.style.transform = "translateY(-100%)";
      } else {
        // Scrolling up
        header.style.transform = "translateY(0)";
      }

      lastScrollTop = scrollTop;
    },
    { passive: true }
  );
});

// Performance optimization: Lazy load iframes
const observeVideos = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const iframe = entry.target;
      if (iframe.dataset.src) {
        iframe.src = iframe.dataset.src;
        iframe.removeAttribute("data-src");
        observeVideos.unobserve(iframe);
      }
    }
  });
});

// Apply lazy loading to videos when they're created
setInterval(() => {
  document
    .querySelectorAll("iframe[data-src]:not([data-lazy-observed])")
    .forEach((iframe) => {
      observeVideos.observe(iframe);
      iframe.setAttribute("data-lazy-observed", "true");
    });
}, 1000);
