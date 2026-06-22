// Typewriter
var TxtType = function (el, toRotate, period) {
  this.toRotate = toRotate;
  this.el = el;
  this.loopNum = 0;
  this.period = parseInt(period, 10) || 2000;
  this.txt = "";
  this.tick();
  this.isDeleting = false;
};

TxtType.prototype.tick = function () {
  var i = this.loopNum % this.toRotate.length;
  var fullTxt = this.toRotate[i];

  if (this.isDeleting) {
    this.txt = fullTxt.substring(0, this.txt.length - 1);
  } else {
    this.txt = fullTxt.substring(0, this.txt.length + 1);
  }

  this.el.innerHTML = '<span class="wrap">' + this.txt + "</span>";

  var that = this;
  var delta = 200 - Math.random() * 100;

  if (this.isDeleting) {
    delta /= 2;
  }

  if (!this.isDeleting && this.txt === fullTxt) {
    delta = this.period;
    this.isDeleting = true;
  } else if (this.isDeleting && this.txt === "") {
    this.isDeleting = false;
    this.loopNum++;
    delta = 500;
  }

  setTimeout(function () {
    that.tick();
  }, delta);
};

window.onload = function () {
  var elements = document.getElementsByClassName("typewrite");
  for (var i = 0; i < elements.length; i++) {
    var toRotate = elements[i].getAttribute("data-type");
    var period = elements[i].getAttribute("data-period");
    if (toRotate) {
      new TxtType(elements[i], JSON.parse(toRotate), period);
    }
  }
  // Cursor CSS is handled in style.css
};

// THEME TOGGLE
function setTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
  const themeIcon = document.getElementById("theme-icon").querySelector("i");
  if (themeIcon) {
    themeIcon.classList.remove("fa-moon", "fa-sun");
    // In dark mode show sun (to switch to light), in light mode show moon (to switch to dark)
    themeIcon.classList.add(theme === "dark" ? "fa-sun" : "fa-moon");
  }
}

function getPreferredTheme() {
  const stored = localStorage.getItem("theme");
  if (stored) return stored;
  if (window.matchMedia("(prefers-color-scheme: dark)").matches) return "dark";
  return "light";
}

document.addEventListener("DOMContentLoaded", function () {
  const themeToggle = document.getElementById("theme-toggle");
  const icon = document.getElementById("theme-icon");
  let currentTheme = getPreferredTheme();
  setTheme(currentTheme);

  themeToggle.addEventListener("click", function () {
    currentTheme = currentTheme === "dark" ? "light" : "dark";
    setTheme(currentTheme);
  });

  // Smooth scroll for navigation links
  document.querySelectorAll('header.navbar-container .menu a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();

      document.querySelector(this.getAttribute("href")).scrollIntoView({
        behavior: "smooth",
      });
    });
  });

  // Intersection Observer for active nav links
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll("header.navbar-container .menu a.nav-link");

  const observerOptions = {
    root: null,
    rootMargin: "0px",
    threshold: 0.3,
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        navLinks.forEach((link) => {
          link.classList.remove("active");
          if (link.getAttribute("href") === `#${entry.target.id}`) {
            link.classList.add("active");
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach((section) => {
    observer.observe(section);
  });

  // Chatbot functionality
  const openChatbotBtn = document.getElementById("open-chatbot-btn");
  const closeChatbotBtn = document.getElementById("close-chatbot-btn");
  const chatbotPopup = document.getElementById("chatbot-popup");
  const chatbotInputField = document.getElementById("chatbot-input-field");
  const chatbotSendBtn = document.getElementById("chatbot-send-btn");
  const chatbotMessages = document.getElementById("chatbot-messages");

  openChatbotBtn.addEventListener("click", () => {
    chatbotPopup.classList.add("active");
  });

  closeChatbotBtn.addEventListener("click", () => {
    chatbotPopup.classList.remove("active");
  });

  chatbotSendBtn.addEventListener("click", sendMessage);
  chatbotInputField.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  });

  function sendMessage() {
    const userMessage = chatbotInputField.value.trim();
    if (userMessage === "") return;

    appendMessage(userMessage, "user-message");
    chatbotInputField.value = "";

    // Tampilkan pesan "Typing..." atau indikator loading
    const loadingMessage = appendMessage("...", "bot-message-loading");

    // Kirim pesan ke backend Anda
    fetch("/api/chatbot", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: userMessage }),
    })
      .then((response) => {
        if (!response.ok) {
          // Jika respons bukan 2xx, lempar error
          return response.json().then((errorData) => {
            throw new Error(errorData.error || "Server responded with an error");
          });
        }
        return response.json();
      })
      .then((data) => {
        // Hapus pesan loading
        if (loadingMessage && chatbotMessages.contains(loadingMessage)) {
          chatbotMessages.removeChild(loadingMessage);
        }
        appendMessage(data.response, "bot-message");
      })
      .catch((error) => {
        console.error("Error:", error);
        // Hapus pesan loading dan tampilkan pesan error
        if (loadingMessage && chatbotMessages.contains(loadingMessage)) {
          chatbotMessages.removeChild(loadingMessage);
        }
        appendMessage(`Maaf, terjadi kesalahan: ${error.message || "Tidak dikenal"}. Silakan coba lagi nanti.`, "bot-message");
      });
  }

  function appendMessage(message, type) {
    const messageElement = document.createElement("div");
    messageElement.classList.add("message", type);
    messageElement.textContent = message;
    chatbotMessages.appendChild(messageElement);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    return messageElement; // Return the created element
  }

  // Profile minimalist functionality on scroll (Mobile only)
  const asideProfile = document.querySelector("aside.profile");
  const mediaQuery = window.matchMedia("(max-width: 900px)"); // Match with your CSS media query

  function handleScroll() {
    if (mediaQuery.matches) {
      if (window.scrollY > 50) {
        // Adjust scroll threshold as needed
        asideProfile.classList.add("minimalist");
      } else {
        asideProfile.classList.remove("minimalist");
      }
    } else {
      // Ensure minimalist class is removed on larger screens if applied
      asideProfile.classList.remove("minimalist");
    }
  }

  // Initial check and add event listener
  handleScroll(); // Call once on load
  window.addEventListener("scroll", handleScroll);

  // Listen for media query changes (e.g., if user resizes window)
  mediaQuery.addEventListener("change", handleScroll);

  // Tech Stack Marquee Duplication for seamless scroll
  const marqueeContent = document.querySelector(".marquee-content");
  if (marqueeContent) {
    const marqueeClone = marqueeContent.cloneNode(true);
    document.querySelector(".marquee").appendChild(marqueeClone);
  }

  // --- PREMIUM MICRO-INTERACTIONS ---

  // 1. Scroll Progress Bar
  const scrollProgress = document.createElement("div");
  scrollProgress.id = "scroll-progress";
  document.body.appendChild(scrollProgress);

  window.addEventListener("scroll", () => {
    const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = height > 0 ? (winScroll / height) * 100 : 0;
    scrollProgress.style.width = scrolled + "%";
  });

  // 2. Glass Cards Spotlight & 3D Tilt Interaction
  const glassCards = document.querySelectorAll(".glass-card, .achievement-card");
  glassCards.forEach((card) => {
    if (!card.classList.contains("glass-card")) {
      card.classList.add("glass-card");
    }

    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      card.style.setProperty("--mouse-x", `${x}px`);
      card.style.setProperty("--mouse-y", `${y}px`);

      // 3D Parallax Tilt calculation
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -6; // max -6deg tilt
      const rotateY = ((x - centerX) / centerX) * 6;  // max 6deg tilt

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
    });
  });

  // 3. Magnetic Hover Effect
  const magneticElements = document.querySelectorAll(".btn-cv, #theme-toggle, header.navbar-container .menu a.nav-link, .floating-btn");
  magneticElements.forEach((el) => {
    el.addEventListener("mousemove", (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      // Restrict pull distance to keep it neat
      const pullX = x * 0.25;
      const pullY = y * 0.25;

      el.style.transform = `translate(${pullX}px, ${pullY}px)`;
    });

    el.addEventListener("mouseleave", () => {
      el.style.transform = "";
    });
  });
  // ---- HIT ME UP — Social links popup ----
  const hitMeUpBtn = document.getElementById('hit-me-up-btn');
  const socialPanel = document.getElementById('social-popup-panel');

  if (hitMeUpBtn && socialPanel) {
    hitMeUpBtn.addEventListener('click', function () {
      const isOpen = socialPanel.classList.toggle('open');
      hitMeUpBtn.classList.toggle('open', isOpen);
      hitMeUpBtn.setAttribute('aria-expanded', String(isOpen));
      socialPanel.setAttribute('aria-hidden', String(!isOpen));
    });

    // Close panel when clicking outside
    document.addEventListener('click', function (e) {
      if (!hitMeUpBtn.contains(e.target) && !socialPanel.contains(e.target)) {
        socialPanel.classList.remove('open');
        hitMeUpBtn.classList.remove('open');
        hitMeUpBtn.setAttribute('aria-expanded', 'false');
        socialPanel.setAttribute('aria-hidden', 'true');
      }
    });
  }

  // ---- PROJECT MODAL & GALLERY INTERACTIVITY ----
  const projectCards = document.querySelectorAll('.project.glass-card');
  const modal = document.getElementById('project-modal');
  const modalClose = document.querySelector('.project-modal-close');
  const track = document.querySelector('.carousel-track');
  const prevBtn = document.querySelector('.carousel-btn-prev');
  const nextBtn = document.querySelector('.carousel-btn-next');
  const dotsContainer = document.querySelector('.carousel-dots');
  
  const modalNum = document.querySelector('.modal-project-number');
  const modalTitle = document.querySelector('.modal-project-title');
  const modalRole = document.querySelector('.modal-project-role');
  const modalTech = document.querySelector('.modal-project-tech');
  const modalDesc = document.querySelector('.modal-project-desc');
  const modalActionBtn = document.querySelector('.modal-action-btn');
  const modalNoLinkMsg = document.querySelector('.modal-no-link-msg');

  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.querySelector('.lightbox-image');
  const lightboxClose = document.querySelector('.lightbox-close');

  let currentSlideIndex = 0;
  let totalSlides = 0;

  function updateSlides() {
    const slidesList = track.querySelectorAll('.carousel-slide');
    const dotsList = dotsContainer.querySelectorAll('.carousel-dot');
    
    slidesList.forEach((slide, idx) => {
      if (idx === currentSlideIndex) {
        slide.classList.add('active');
      } else {
        slide.classList.remove('active');
      }
    });

    dotsList.forEach((dot, idx) => {
      if (idx === currentSlideIndex) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });
  }

  function showPrevSlide() {
    if (totalSlides <= 1) return;
    currentSlideIndex = (currentSlideIndex - 1 + totalSlides) % totalSlides;
    updateSlides();
  }

  function showNextSlide() {
    if (totalSlides <= 1) return;
    currentSlideIndex = (currentSlideIndex + 1) % totalSlides;
    updateSlides();
  }

  projectCards.forEach(card => {
    card.addEventListener('click', function (e) {
      e.preventDefault();

      // Get metadata from DOM
      const title = card.querySelector('.project-title').textContent;
      const desc = card.querySelector('.project-desc').textContent;
      const role = card.querySelector('.project-role').textContent;
      const tech = card.querySelector('.project-tech').textContent;
      const num = card.querySelector('.project-number').textContent;
      const link = card.getAttribute('href');
      const screenshotData = card.getAttribute('data-screenshots');

      // Populate details
      modalNum.textContent = num;
      modalTitle.textContent = title;
      modalRole.textContent = role;
      modalTech.textContent = tech;
      modalDesc.textContent = desc;

      // Handle action link
      if (!link || link === '#') {
        modalActionBtn.style.display = 'none';
        modalNoLinkMsg.style.display = 'flex';
      } else {
        modalActionBtn.style.display = 'inline-flex';
        modalActionBtn.setAttribute('href', link);
        modalNoLinkMsg.style.display = 'none';
      }

      // Build screenshots carousel
      track.innerHTML = '';
      dotsContainer.innerHTML = '';
      currentSlideIndex = 0;

      let screenshots = [];
      if (screenshotData && screenshotData.trim() !== '') {
        screenshots = screenshotData.split(',');
      }

      // If no screenshots, use the thumbnail image
      if (screenshots.length === 0) {
        const imgEl = card.querySelector('.project-image-wrapper img');
        const thumbSrc = imgEl ? imgEl.src : '';
        if (thumbSrc) screenshots.push(thumbSrc);
      }

      totalSlides = screenshots.length;

      // Render slides and dots
      screenshots.forEach((src, idx) => {
        // Slide li
        const li = document.createElement('li');
        li.className = 'carousel-slide';
        if (idx === 0) li.classList.add('active');
        
        const img = document.createElement('img');
        img.src = src;
        img.alt = `${title} Screenshot ${idx + 1}`;
        img.loading = 'lazy';
        
        // Open lightbox on image click
        img.addEventListener('click', function () {
          openLightbox(src);
        });

        li.appendChild(img);
        track.appendChild(li);

        // Dot button
        const dot = document.createElement('button');
        dot.className = 'carousel-dot';
        if (idx === 0) dot.classList.add('active');
        dot.setAttribute('aria-label', `Go to slide ${idx + 1}`);
        
        dot.addEventListener('click', function () {
          currentSlideIndex = idx;
          updateSlides();
        });

        dotsContainer.appendChild(dot);
      });

      // Show/hide navigation arrows based on count
      if (totalSlides <= 1) {
        prevBtn.classList.add('hidden');
        nextBtn.classList.add('hidden');
        dotsContainer.style.display = 'none';
      } else {
        prevBtn.classList.remove('hidden');
        nextBtn.classList.remove('hidden');
        dotsContainer.style.display = 'flex';
      }

      // Open modal with smooth scroll lock
      modal.classList.add('active');
      modal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('modal-open');
    });
  });

  function closeModal() {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
  }

  modalClose.addEventListener('click', closeModal);
  modal.addEventListener('click', function (e) {
    if (e.target === modal) {
      closeModal();
    }
  });

  prevBtn.addEventListener('click', showPrevSlide);
  nextBtn.addEventListener('click', showNextSlide);

  // Mobile swipe gestures for carousel
  let touchStartX = 0;
  let touchEndX = 0;
  
  track.addEventListener('touchstart', function (e) {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });
  
  track.addEventListener('touchend', function (e) {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, { passive: true });
  
  function handleSwipe() {
    const swipeThreshold = 50; // minimum distance to count as swipe
    if (touchEndX - touchStartX < -swipeThreshold) {
      showNextSlide();
    } else if (touchEndX - touchStartX > swipeThreshold) {
      showPrevSlide();
    }
  }

  // Lightbox functions
  function openLightbox(src) {
    lightboxImg.src = src;
    lightbox.classList.add('active');
    lightbox.setAttribute('aria-hidden', 'false');
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    lightbox.setAttribute('aria-hidden', 'true');
    setTimeout(() => {
      lightboxImg.src = '';
    }, 350); // clear source after transition finishes
  }

  lightboxClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox || e.target.classList.contains('lightbox-content')) {
      closeLightbox();
    }
  });

  // Keyboard navigation
  document.addEventListener('keydown', function (e) {
    if (lightbox.classList.contains('active')) {
      if (e.key === 'Escape') {
        closeLightbox();
      }
    } else if (modal.classList.contains('active')) {
      if (e.key === 'Escape') {
        closeModal();
      } else if (e.key === 'ArrowLeft') {
        showPrevSlide();
      } else if (e.key === 'ArrowRight') {
        showNextSlide();
      }
    }
  });
});
