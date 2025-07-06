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
  // INJECT CSS
  var css = document.createElement("style");
  css.type = "text/css";
  css.innerHTML = ".typewrite > .wrap { border-right: 0.08em solid var(--color-text), border-left: 0.08em solid var(--color-text), border-top: 0.08em solid var(--color-text), border-bottom: 0.08em solid var(--color-text)}";
  document.body.appendChild(css);
};

// THEME TOGGLE
function setTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
  const themeIcon = document.getElementById("theme-icon").querySelector("i");
  if (themeIcon) {
    themeIcon.classList.remove("fa-moon", "fa-sun");
    themeIcon.classList.add(theme === "dark" ? "fa-moon" : "fa-sun");
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
      e.preventDefault(); // Prevent default anchor click behavior

      document.querySelector(this.getAttribute("href")).scrollIntoView({
        behavior: "smooth",
      });

      // Remove active class from all links
      document.querySelectorAll("header.navbar-container .menu a").forEach((link) => {
        link.classList.remove("active");
      });

      // Add active class to the clicked link
      this.classList.add("active");
    });
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
    fetch("http://localhost:3000/chat", {
      // Ganti URL ini jika backend Anda berjalan di port/host lain
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: userMessage }),
    })
      .then((response) => response.json())
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
        appendMessage("Maaf, terjadi kesalahan. Silakan coba lagi nanti.", "bot-message");
      });
  }

  function appendMessage(message, type) {
    const messageElement = document.createElement("div");
    messageElement.classList.add("message", type);
    messageElement.textContent = message;
    chatbotMessages.appendChild(messageElement);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
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
});
