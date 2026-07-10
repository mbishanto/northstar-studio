// c:\Users\NAK\coding code - badhan\js\script.js
/**
 * Northstar Studio Website Javascript Controller
 * Handles performance scroll reveals, interactive navigation, keyboard-triggered search models,
 * custom pointer effects, form validations, FAQ accordions, and cookie consents.
 */

document.addEventListener('DOMContentLoaded', () => {
  initCursorGlow();
  initNavigation();
  initScrollEffects();
  initSearch();
  initForms();
  initAccordions();
  initTabs();
  initCookieConsent();
});

/* ==========================================
   1. Pointer Glow Coordinates
   ========================================== */
function initCursorGlow() {
  const glow = document.querySelector('.cursor-glow');
  if (!glow) return;

  window.addEventListener('pointermove', (e) => {
    glow.style.setProperty('--x', `${e.clientX}px`);
    glow.style.setProperty('--y', `${e.clientY}px`);
  });
}

/* ==========================================
   2. Responsive Header Navigation
   ========================================== */
function initNavigation() {
  const navToggle = document.querySelector('.nav-toggle');
  const siteNav = document.querySelector('.site-nav');
  
  if (navToggle && siteNav) {
    navToggle.addEventListener('click', () => {
      const isOpen = siteNav.classList.toggle('open');
      navToggle.classList.toggle('open', isOpen);
      navToggle.setAttribute('aria-expanded', String(isOpen));
      // Prevent body scrolling when mobile navigation is open
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close menu on navigation link clicks
    siteNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        siteNav.classList.remove('open');
        navToggle.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  // Set Active Link State
  const page = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.site-nav a, .footer-links a');
  
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === page) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

/* ==========================================
   3. Scroll Reveal & Back to Top (IntersectionObserver)
   ========================================== */
function initScrollEffects() {
  const revealElements = document.querySelectorAll('.reveal');
  const backToTopBtn = document.getElementById('back-to-top-btn');

  // Highly performant viewport intersection check
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target); // Trigger only once
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));
  } else {
    // Fallback if IntersectionObserver is not supported
    const revealFallback = () => {
      revealElements.forEach(el => {
        const top = el.getBoundingClientRect().top;
        if (top < window.innerHeight - 80) {
          el.classList.add('visible');
        }
      });
    };
    window.addEventListener('scroll', revealFallback);
    revealFallback();
  }

  // Toggle Back-To-Top button visibility on scroll
  window.addEventListener('scroll', () => {
    if (backToTopBtn) {
      if (window.scrollY > 400) {
        backToTopBtn.classList.add('visible');
      } else {
        backToTopBtn.classList.remove('visible');
      }
    }
  });
}

/* ==========================================
   4. Live Site Search System (Fictional Data Maps)
   ========================================== */
function initSearch() {
  const openBtn = document.getElementById('open-search-btn');
  const closeBtn = document.getElementById('close-search-btn');
  const modal = document.getElementById('search-modal');
  const input = document.getElementById('search-input');
  const results = document.getElementById('search-results');

  if (!modal) return;

  // Static Index of website routes for demo search queries
  const searchIndex = [
    // Core pages
    { title: "Home Page", url: "index.html", desc: "View the portfolio main page and featured items.", cat: "Page" },
    { title: "About Us Story", url: "about.html", desc: "Learn about the designers, developers, and process values.", cat: "Page" },
    { title: "Client Portfolio Projects", url: "projects.html", desc: "Browse our 12 complete portfolio builds.", cat: "Page" },
    { title: "Available Services", url: "services.html", desc: "Explore user interface, API, and cloud services.", cat: "Page" },
    { title: "Skills & Stack", url: "skills.html", desc: "Check core coding and layout technologies.", cat: "Page" },
    { title: "Resume & Education", url: "resume.html", desc: "Detailed professional experience and academic degrees.", cat: "Page" },
    { title: "Blog Hub", url: "blog.html", desc: "Read 20 sample articles detailing development tricks.", cat: "Page" },
    { title: "Contact Inquiry", url: "contact.html", desc: "Drop a line or schedule consultation hours.", cat: "Page" },
    { title: "Frequently Asked Questions (FAQ)", url: "faq.html", desc: "Find support answers regarding workflow guidelines.", cat: "Page" },
    { title: "Pricing & Plans", url: "pricing.html", desc: "Compare monthly and annual subscription options.", cat: "Page" },
    { title: "Our Process Timeline", url: "process.html", desc: "See our staging, build, and launch flow.", cat: "Page" },
    { title: "Testimonials Listing", url: "testimonials.html", desc: "Read fictional reviews from verified clients.", cat: "Page" },
    { title: "Case Studies Index", url: "case-studies.html", desc: "Deep-dives into conversion metrics and KPIs.", cat: "Page" },
    { title: "Downloads & Files", url: "downloads.html", desc: "Get style guide files, templates, and logs.", cat: "Page" },
    { title: "Certifications Log", url: "certifications.html", desc: "Review visual design and engineering badges.", cat: "Page" },
    { title: "Open Source Repos", url: "open-source.html", desc: "Check sample GitHub repository code integrations.", cat: "Page" },
    { title: "Privacy Policy", url: "privacy.html", desc: "Fictional compliance details.", cat: "Page" },
    { title: "Sitemap Hub", url: "sitemap.html", desc: "Browse a unified list of all pages.", cat: "Page" },

    // 12 Projects
    { title: "Nova Cloud Platform Project", url: "project-details-1.html", desc: "Serverless cloud infrastructure management tool built for teams.", cat: "Project" },
    { title: "Aether Design System Project", url: "project-details-2.html", desc: "Fictional UI components and token architecture.", cat: "Project" },
    { title: "Chronos Analytics Project", url: "project-details-3.html", desc: "SaaS analytics dashboard with D3.js visual charts.", cat: "Project" },
    { title: "Zephyr E-Commerce Project", url: "project-details-4.html", desc: "Headless Shopify store utilizing edge caching strategies.", cat: "Project" },
    { title: "Helios Energy Dashboard Project", url: "project-details-5.html", desc: "Smart home solar and battery storage managers.", cat: "Project" },
    { title: "Iris Cognitive API Project", url: "project-details-6.html", desc: "Computer vision classification wrapper integrations.", cat: "Project" },
    { title: "Vortex Collaboration Engine Project", url: "project-details-7.html", desc: "Real-time canvas editor using Operational Transformations.", cat: "Project" },
    { title: "Atlas Geospatial Mapper Project", url: "project-details-8.html", desc: "WebGL mapping overlays for environmental telemetry.", cat: "Project" },
    { title: "Echo Sound Lab Project", url: "project-details-9.html", desc: "Interactive synthesizers running on Web Audio API.", cat: "Project" },
    { title: "Aegis Security Sentinel Project", url: "project-details-10.html", desc: "Threat logging dashboard displaying alert nodes.", cat: "Project" },
    { title: "Orion Asset Registry Project", url: "project-details-11.html", desc: "Blockchain tracker demonstrating smart contract receipts.", cat: "Project" },
    { title: "Apex Mobile Portal Project", url: "project-details-12.html", desc: "Responsive portal simulation with gesture controls.", cat: "Project" },

    // Selected Articles from the 20 articles list
    { title: "Maximizing Frontend Performance", url: "blog-1.html", desc: "Reduce layout thrashing and apply CSS containment.", cat: "Blog" },
    { title: "Why Design Systems Fail", url: "blog-2.html", desc: "Anti-patterns to avoid regarding variable token drift.", cat: "Blog" },
    { title: "Operational Transformation Guides", url: "blog-3.html", desc: "Synchronizing cursor updates inside WebSocket streams.", cat: "Blog" },
    { title: "The Evolution of CSS Containment", url: "blog-4.html", desc: "Check @scope templates and browser fluid calculations.", cat: "Blog" },
    { title: "Building Accessible Forms", url: "blog-5.html", desc: "Ensure proper labels, focus states, and ARIA fields.", cat: "Blog" }
  ];

  const toggleModal = (show) => {
    if (show) {
      modal.showModal();
      input.value = '';
      results.innerHTML = '<p class="search-hint">Type search queries to locate pages, articles, and resources.</p>';
      setTimeout(() => input.focus(), 100);
      document.body.style.overflow = 'hidden';
    } else {
      modal.close();
      document.body.style.overflow = '';
    }
  };

  if (openBtn) openBtn.addEventListener('click', () => toggleModal(true));
  if (closeBtn) closeBtn.addEventListener('click', () => toggleModal(false));

  // Close modal when clicking on the backdrop area
  modal.addEventListener('click', (e) => {
    if (e.target === modal) toggleModal(false);
  });

  // Keyboard shortcut - Press '/' to search
  window.addEventListener('keydown', (e) => {
    if (e.key === '/' && document.activeElement !== input && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
      e.preventDefault();
      toggleModal(true);
    }
  });

  // Query filtering logic
  input.addEventListener('input', () => {
    const query = input.value.trim().toLowerCase();
    
    if (query.length < 2) {
      results.innerHTML = '<p class="search-hint">Type search queries to locate pages, articles, and resources.</p>';
      return;
    }

    const matched = searchIndex.filter(item => 
      item.title.toLowerCase().includes(query) || 
      item.desc.toLowerCase().includes(query) ||
      item.cat.toLowerCase().includes(query)
    );

    if (matched.length === 0) {
      results.innerHTML = '<p class="search-hint">No results found matching your search query.</p>';
      return;
    }

    results.innerHTML = matched.map(item => `
      <a href="${item.url}" class="search-result-item">
        <div class="search-result-title">${item.title}</div>
        <div class="search-result-snippet">${item.desc}</div>
        <span class="search-result-category">${item.cat}</span>
      </a>
    `).join('');
  });
}

/* ==========================================
   5. Interactive Form Validations
   ========================================== */
function initForms() {
  const contactForm = document.querySelector('.contact-form');
  const newsletterForm = document.getElementById('newsletter-form');
  const supportForm = document.getElementById('support-form');

  // Helper method: apply validation visuals
  const validateField = (field, condition) => {
    if (condition) {
      field.classList.remove('is-invalid');
      field.classList.add('is-valid');
      return true;
    } else {
      field.classList.remove('is-valid');
      field.classList.add('is-invalid');
      return false;
    }
  };

  // Contact Form Logic
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const name = contactForm.querySelector('input[name="name"]');
      const email = contactForm.querySelector('input[name="email"]');
      const phone = contactForm.querySelector('input[name="phone"]');
      const subject = contactForm.querySelector('input[name="subject"]');
      const message = contactForm.querySelector('textarea[name="message"]');
      const statusEl = contactForm.querySelector('.form-message') || createStatusElement(contactForm);

      let isValid = true;

      if (name) isValid = validateField(name, name.value.trim().length >= 2) && isValid;
      if (email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        isValid = validateField(email, emailRegex.test(email.value.trim())) && isValid;
      }
      if (phone) {
        const phoneRegex = /^[+]?[0-9\s-]{7,15}$/;
        // Optional field: valid if empty, or matches regex
        isValid = validateField(phone, phone.value.trim() === '' || phoneRegex.test(phone.value.trim())) && isValid;
      }
      if (subject) isValid = validateField(subject, subject.value.trim().length >= 2) && isValid;
      if (message) isValid = validateField(message, message.value.trim().length >= 10) && isValid;

      if (isValid) {
        statusEl.className = 'form-status success';
        statusEl.textContent = 'Thanks! Your inquiry was successfully validated (Demonstration submission).';
        statusEl.setAttribute('role', 'alert');
        contactForm.reset();
        
        // Remove validation visual classes after reset
        contactForm.querySelectorAll('.form-control').forEach(el => {
          el.classList.remove('is-valid', 'is-invalid');
        });
      } else {
        statusEl.className = 'form-status error';
        statusEl.textContent = 'Please correct the highlighted validation anomalies in fields.';
        statusEl.setAttribute('role', 'alert');
      }
    });
  }

  // Support Ticketing form logic
  if (supportForm) {
    supportForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = supportForm.querySelector('input[type="email"]');
      const desc = supportForm.querySelector('textarea');
      const statusEl = supportForm.querySelector('.form-message') || createStatusElement(supportForm);

      let isValid = true;
      if (email) isValid = validateField(email, email.value.includes('@')) && isValid;
      if (desc) isValid = validateField(desc, desc.value.trim().length > 5) && isValid;

      if (isValid) {
        statusEl.className = 'form-status success';
        statusEl.textContent = 'Demo ticket submitted! Mock reference #TK-' + Math.floor(Math.random() * 90000 + 10000);
        supportForm.reset();
      } else {
        statusEl.className = 'form-status error';
        statusEl.textContent = 'Please fill out all support fields correctly.';
      }
    });
  }

  // Newsletter Form Logic
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('newsletter-email');
      const status = document.getElementById('newsletter-status');

      if (!email || !status) return;

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (emailRegex.test(email.value.trim())) {
        status.className = 'newsletter-status success';
        status.textContent = 'Demo sub registered successfully!';
        email.value = '';
        email.classList.remove('is-invalid');
      } else {
        status.className = 'newsletter-status error';
        status.textContent = 'Invalid email syntax.';
        email.classList.add('is-invalid');
      }
    });
  }

  function createStatusElement(form) {
    const el = document.createElement('p');
    el.className = 'form-status';
    form.appendChild(el);
    return el;
  }
}

/* ==========================================
   6. FAQ Accordions Handler
   ========================================== */
function initAccordions() {
  const headers = document.querySelectorAll('.accordion-header');
  
  headers.forEach(header => {
    header.addEventListener('click', () => {
      const currentItem = header.parentElement;
      const isActive = currentItem.classList.contains('active');
      
      // Close other accordion panels for accordion effect
      const allItems = currentItem.parentElement.querySelectorAll('.accordion-item');
      allItems.forEach(item => {
        item.classList.remove('active');
      });

      if (!isActive) {
        currentItem.classList.add('active');
      }
    });

    // Keyboard support - toggle with Space / Enter
    header.addEventListener('keydown', (e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        header.click();
      }
    });
  });
}

/* ==========================================
   7. Dynamic Tabs Handler (Pricing switches)
   ========================================== */
function initTabs() {
  const listContainers = document.querySelectorAll('.tabs-container');

  listContainers.forEach(container => {
    const buttons = container.querySelectorAll('.tab-btn');
    const panels = container.querySelectorAll('.tab-panel');

    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-tab');

        buttons.forEach(b => b.classList.remove('active'));
        panels.forEach(p => p.classList.remove('active'));

        btn.classList.add('active');
        const activePanel = container.querySelector(`.tab-panel[id="${target}"]`);
        if (activePanel) {
          activePanel.classList.add('active');
        }
      });
    });
  });
}

/* ==========================================
   8. Localized Cookie settings
   ========================================== */
function initCookieConsent() {
  const banner = document.getElementById('cookie-banner');
  const acceptBtn = document.getElementById('cookie-accept');
  const declineBtn = document.getElementById('cookie-decline');

  if (!banner) return;

  // Retrieve stored setting
  const consent = localStorage.getItem('demo_cookie_consent');
  if (!consent) {
    // Reveal banner with slight delay
    setTimeout(() => {
      banner.classList.add('show');
    }, 1000);
  }

  const dismissBanner = (status) => {
    localStorage.setItem('demo_cookie_consent', status);
    banner.classList.remove('show');
  };

  if (acceptBtn) acceptBtn.addEventListener('click', () => dismissBanner('accepted'));
  if (declineBtn) declineBtn.addEventListener('click', () => dismissBanner('declined'));
}
