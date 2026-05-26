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
  const sections = document.querySelectorAll("article[id]");
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
});
