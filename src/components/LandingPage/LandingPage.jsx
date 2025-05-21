import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import "./LandingPage.css";

const LandingPage = () => {
  useEffect(() => {
    // Make sure document body has no overflow hidden that might prevent scrolling
    document.body.style.overflow = "auto";

    // Initialize AOS
    if (window.AOS) {
      window.AOS.init({
        duration: 800,
        once: true,
      });
    }

    // Navbar scroll effect
    const navbar = document.querySelector(".navbar");
    const handleScroll = () => {
      if (window.scrollY > 50) {
        navbar.classList.add("scrolled");
      } else {
        navbar.classList.remove("scrolled");
      }
    };
    window.addEventListener("scroll", handleScroll);

    // Chat demo typing effect
    const typingMessage = document.getElementById("typingMessage");

    const simulateTyping = () => {
      if (typingMessage) {
        typingMessage.textContent = "";
        const text =
          "Absolutely! We offer a 14-day free trial with full access to all features, no credit card required. Would you like me to help you get started?";
        let index = 0;

        const timer = setInterval(() => {
          if (index < text.length) {
            typingMessage.textContent += text.charAt(index);
            index++;
          } else {
            clearInterval(timer);
          }
        }, 20);
      }
    };

    // Chat demo interaction
    const userInput = document.getElementById("userInput");
    const sendButton = document.getElementById("sendButton");
    const chatBody = document.getElementById("chatBody");

    if (sendButton && userInput && chatBody) {
      sendButton.addEventListener("click", () => {
        if (userInput.value.trim() === "") return;

        // Add user message
        const userMsg = document.createElement("div");
        userMsg.className = "message message-user";
        userMsg.innerHTML = `
          <div class="message-content">
            ${userInput.value}
          </div>
          <div class="message-time">${new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}</div>
        `;
        chatBody.appendChild(userMsg);

        // Clear input
        userInput.value = "";

        // Scroll to bottom
        chatBody.scrollTop = chatBody.scrollHeight;

        // Show typing indicator after a delay
        setTimeout(() => {
          // Add bot message
          const botMsg = document.createElement("div");
          botMsg.className = "message message-bot";
          botMsg.innerHTML = `
            <div class="message-content">
              Thanks for your message! This is a demo chatbot. In a real implementation, I would provide a relevant response based on your question.
            </div>
            <div class="message-time">${new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}</div>
          `;
          chatBody.appendChild(botMsg);

          // Scroll to bottom again
          chatBody.scrollTop = chatBody.scrollHeight;
        }, 1000);
      });

      userInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          sendButton.click();
          e.preventDefault();
        }
      });
    }

    // Run typing animation on load
    setTimeout(simulateTyping, 2000);

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", function (e) {
        e.preventDefault();

        const targetId = this.getAttribute("href");
        if (targetId === "#") return;

        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          const navbarHeight = document.querySelector(".navbar").offsetHeight;
          const targetPosition =
            targetElement.getBoundingClientRect().top +
            window.pageYOffset -
            navbarHeight;

          window.scrollTo({
            top: targetPosition,
            behavior: "smooth",
          });
        }
      });
    });

    // Cleanup function
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="landing-page-container">
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-light fixed-top">
        <div className="container">
          <a className="navbar-brand" href="#hero">
            <span className="text-primary">Prop</span>Bot
          </a>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <a className="nav-link active" href="#hero">
                  Home
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#features">
                  Features
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#how-it-works">
                  How It Works
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#pricing">
                  Pricing
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#faq">
                  FAQ
                </a>
              </li>
              <li className="nav-item">
                <Link className="btn btn-outline-primary" to="/login">
                  Log In
                </Link>
              </li>
              <li className="nav-item">
                <Link className="btn btn-primary" to="/signup">
                  Get Started
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="hero">
        <div className="hero-shape"></div>
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6 hero-content">
              <h1 data-aos="fade-up" data-aos-delay="100">
                Elevate Your Customer Experience with AI
              </h1>
              <p data-aos="fade-up" data-aos-delay="200">
                PropBot uses advanced AI technology to create human-like
                conversations that engage your customers 24/7, boosting
                satisfaction and driving growth.
              </p>
              {/* Updated button container */}
              <div
                className="btn-container"
                data-aos="fade-up"
                data-aos-delay="300"
              >
                <Link to="/signup" className="btn btn-primary">
                  Get Started
                </Link>
                <a href="#how-it-works" className="btn btn-outline-primary">
                  See How It Works
                </a>
              </div>
              <div
                className="hero-brands"
                data-aos="fade-up"
                data-aos-delay="400"
              >
                <p className="text-muted">Trusted by leading brands:</p>
                <div className="row">
                  <div className="col-3">
                    <img
                      src="https://www.apple.com/ac/structured-data/images/knowledge_graph_logo.png"
                      alt="Apple"
                      className="img-fluid"
                    />
                  </div>
                  <div className="col-3">
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Volkswagen_logo_2019.svg/2048px-Volkswagen_logo_2019.svg.png"
                      alt="Volkswagen"
                      className="img-fluid"
                    />
                  </div>
                  <div className="col-3">
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Logo_NIKE.svg/1200px-Logo_NIKE.svg.png"
                      alt="Nike"
                      className="img-fluid"
                    />
                  </div>
                  <div className="col-3">
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/1200px-Google_2015_logo.svg.png"
                      alt="Google"
                      className="img-fluid"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div
              className="col-lg-6 hero-image"
              data-aos="fade-left"
              data-aos-delay="200"
            >
              {/* <img
                src="https://images.unsplash.com/photo-1535378917042-10a22c95931a?q=80&w=1476&auto=format&fit=crop"
                alt="AI Assistant"
                className="img-fluid rounded shadow-lg"
              /> */}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="section-padding bg-light">
        <div className="container">
          <div className="section-title text-center">
            <h2>Powerful Features</h2>
            <p>
              Discover what makes PropBot the preferred choice for businesses
            </p>
          </div>
          <div className="row">
            <div
              className="col-md-6 col-lg-4 mb-4"
              data-aos="fade-up"
              data-aos-delay="100"
            >
              <div className="feature-box">
                <div className="feature-icon">
                  <i className="fas fa-robot"></i>
                </div>
                <h3 className="feature-title">AI-Powered Responses</h3>
                <p>
                  Our advanced natural language processing provides human-like
                  conversations that improve with each interaction.
                </p>
              </div>
            </div>
            <div
              className="col-md-6 col-lg-4 mb-4"
              data-aos="fade-up"
              data-aos-delay="200"
            >
              <div className="feature-box">
                <div className="feature-icon">
                  <i className="fas fa-globe"></i>
                </div>
                <h3 className="feature-title">Multilingual Support</h3>
                <p>
                  Communicate with customers in over 50 languages, automatically
                  detecting and responding in their preferred language.
                </p>
              </div>
            </div>
            <div
              className="col-md-6 col-lg-4 mb-4"
              data-aos="fade-up"
              data-aos-delay="300"
            >
              <div className="feature-box">
                <div className="feature-icon">
                  <i className="fas fa-chart-line"></i>
                </div>
                <h3 className="feature-title">Advanced Analytics</h3>
                <p>
                  Gain insights into customer interactions with detailed reports
                  and analytics to optimize your service.
                </p>
              </div>
            </div>
            <div
              className="col-md-6 col-lg-4 mb-4"
              data-aos="fade-up"
              data-aos-delay="400"
            >
              <div className="feature-box">
                <div className="feature-icon">
                  <i className="fas fa-magic"></i>
                </div>
                <h3 className="feature-title">Easy Integration</h3>
                <p>
                  Simple integration with your website, apps, and popular
                  platforms like Facebook, WhatsApp, and Slack.
                </p>
              </div>
            </div>
            <div
              className="col-md-6 col-lg-4 mb-4"
              data-aos="fade-up"
              data-aos-delay="500"
            >
              <div className="feature-box">
                <div className="feature-icon">
                  <i className="fas fa-user-friends"></i>
                </div>
                <h3 className="feature-title">Human Handoff</h3>
                <p>
                  Seamlessly transfer complex conversations to your support team
                  when human intervention is needed.
                </p>
              </div>
            </div>
            <div
              className="col-md-6 col-lg-4 mb-4"
              data-aos="fade-up"
              data-aos-delay="600"
            >
              <div className="feature-box">
                <div className="feature-icon">
                  <i className="fas fa-shield-alt"></i>
                </div>
                <h3 className="feature-title">Enterprise Security</h3>
                <p>
                  Bank-level encryption and compliance with data protection
                  regulations for secure conversations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="section-padding">
        <div className="container">
          <div className="section-title text-center">
            <h2>How PropBot Works</h2>
            <p>Experience intelligent customer engagement in action</p>
          </div>
          <div className="row align-items-center">
            <div className="col-lg-6 mb-5 mb-lg-0" data-aos="fade-right">
              <div className="chat-demo">
                <div className="chat-header">
                  <h5 className="chat-title">
                    <span className="status-indicator"></span>
                    PropBot Assistant
                  </h5>
                </div>
                <div className="chat-body" id="chatBody">
                  <div className="message message-bot">
                    <div className="message-content">
                      Hello! 👋 I'm your PropBot assistant. How can I help you
                      today?
                    </div>
                    <div className="message-time">10:30 AM</div>
                  </div>
                  <div className="message message-user">
                    <div className="message-content">
                      I'm interested in your product. Can you tell me about
                      pricing?
                    </div>
                    <div className="message-time">10:31 AM</div>
                  </div>
                  <div className="message message-bot">
                    <div className="message-content">
                      Of course! We offer three plans: Basic ($29/mo), Pro
                      ($79/mo), and Enterprise (custom pricing). Each comes with
                      different features suited for businesses of various sizes.
                    </div>
                    <div className="message-time">10:31 AM</div>
                  </div>
                  <div className="message message-user">
                    <div className="message-content">
                      What's included in the Pro plan?
                    </div>
                    <div className="message-time">10:32 AM</div>
                  </div>
                  <div className="message message-bot">
                    <div className="message-content">
                      The Pro plan includes all Basic features plus: advanced AI
                      capabilities, unlimited chats, multi-language support, API
                      access, and priority support. Would you like more details?
                    </div>
                    <div className="message-time">10:32 AM</div>
                  </div>
                  <div className="message message-user">
                    <div className="message-content">
                      Can I try it before purchasing?
                    </div>
                    <div className="message-time">10:33 AM</div>
                  </div>
                  <div className="message message-bot typing">
                    <div className="message-content" id="typingMessage">
                      Absolutely! We offer a 14-day free trial with full access
                      to all features, no credit card required. Would you like
                      me to help you get started?
                    </div>
                    <div className="message-time">10:33 AM</div>
                  </div>
                </div>
                <div className="chat-input">
                  <input
                    type="text"
                    placeholder="Type your message..."
                    id="userInput"
                  />
                  <button id="sendButton">
                    <i className="fas fa-paper-plane"></i>
                  </button>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="row">
                <div className="col-12" data-aos="fade-up" data-aos-delay="100">
                  <div className="benefits-item">
                    <div className="benefits-icon">
                      <i className="fas fa-brain"></i>
                    </div>
                    <div>
                      <h4>Intelligent Learning</h4>
                      <p>
                        Our AI continuously learns from each interaction to
                        improve accuracy and relevance over time, providing
                        better responses with every conversation.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="col-12" data-aos="fade-up" data-aos-delay="200">
                  <div className="benefits-item">
                    <div className="benefits-icon">
                      <i className="fas fa-database"></i>
                    </div>
                    <div>
                      <h4>Knowledge Base Integration</h4>
                      <p>
                        Connect your existing knowledge base, FAQs, and
                        documentation to provide accurate information without
                        manual training.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="col-12" data-aos="fade-up" data-aos-delay="300">
                  <div className="benefits-item">
                    <div className="benefits-icon">
                      <i className="fas fa-headset"></i>
                    </div>
                    <div>
                      <h4>Customer Support Enhancement</h4>
                      <p>
                        Resolve up to 80% of routine inquiries automatically,
                        allowing your support team to focus on complex issues
                        that require human expertise.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="col-12" data-aos="fade-up" data-aos-delay="400">
                  <div className="benefits-item">
                    <div className="benefits-icon">
                      <i className="fas fa-cogs"></i>
                    </div>
                    <div>
                      <h4>Customizable Workflows</h4>
                      <p>
                        Design conversation flows that guide users to solutions,
                        collect information, or complete transactions based on
                        your business needs.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="section-padding bg-light">
        <div className="container">
          <div className="section-title text-center">
            <h2>Pricing Plans</h2>
            <p>Choose the perfect plan for your business needs</p>
          </div>
          <div className="row">
            <div
              className="col-md-4 mb-4 mb-md-0"
              data-aos="fade-up"
              data-aos-delay="100"
            >
              <div className="pricing-table">
                <div className="pricing-header">
                  <h3 className="pricing-name">Basic</h3>
                  <h2 className="pricing-price">$29</h2>
                  <p className="pricing-duration">per month</p>
                </div>
                <ul className="pricing-features">
                  <li>1,000 chat interactions/month</li>
                  <li>Basic AI capabilities</li>
                  <li>Website integration</li>
                  <li>Business hours support</li>
                  <li>Basic analytics</li>
                  <li className="disabled">Multi-language support</li>
                  <li className="disabled">API access</li>
                  <li className="disabled">Human handoff</li>
                  <li className="disabled">Custom training</li>
                </ul>
                <Link to="/signup" className="btn btn-outline-primary w-100">
                  Get Started
                </Link>
              </div>
            </div>
            <div className="col-md-4 mb-4 mb-md-0" data-aos="fade-up">
              <div className="pricing-table featured">
                <div className="plan-badge">Most Popular</div>
                <div className="pricing-header">
                  <h3 className="pricing-name">Pro</h3>
                  <h2 className="pricing-price">$79</h2>
                  <p className="pricing-duration">per month</p>
                </div>
                <ul className="pricing-features">
                  <li>10,000 chat interactions/month</li>
                  <li>Advanced AI capabilities</li>
                  <li>Website & app integration</li>
                  <li>24/7 email support</li>
                  <li>Advanced analytics</li>
                  <li>Multi-language support (10 languages)</li>
                  <li>API access</li>
                  <li>Human handoff</li>
                  <li className="disabled">Custom training</li>
                </ul>
                <Link to="/signup" className="btn btn-primary w-100">
                  Get Started
                </Link>
              </div>
            </div>
            <div className="col-md-4" data-aos="fade-up" data-aos-delay="100">
              <div className="pricing-table">
                <div className="pricing-header">
                  <h3 className="pricing-name">Enterprise</h3>
                  <h2 className="pricing-price">Custom</h2>
                  <p className="pricing-duration">tailored solution</p>
                </div>
                <ul className="pricing-features">
                  <li>Unlimited chat interactions</li>
                  <li>Premium AI capabilities</li>
                  <li>Omni-channel integration</li>
                  <li>24/7 priority support</li>
                  <li>Enterprise analytics</li>
                  <li>Multi-language support (50+ languages)</li>
                  <li>Advanced API access</li>
                  <li>Advanced human handoff</li>
                  <li>Custom training & fine-tuning</li>
                </ul>
                <Link to="/contact" className="btn btn-outline-primary w-100">
                  Contact Sales
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="cta" className="section-padding">
        <div className="cta-shape"></div>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8 text-center cta-content">
              <h2 className="mb-4" data-aos="fade-up">
                Ready to Transform Your Customer Experience?
              </h2>
              <p className="mb-5" data-aos="fade-up" data-aos-delay="100">
                Join thousands of businesses that are using PropBot to provide
                exceptional customer service, increase sales, and reduce support
                costs.
              </p>
              <div
                className="btn-container"
                data-aos="fade-up"
                data-aos-delay="200"
              >
                <a href="#pricing" className="btn btn-light btn-lg">
                  View Pricing
                </a>
                <Link to="/signup" className="btn btn-outline-light btn-lg">
                  Start Free Trial
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <div className="container">
          <div className="row">
            <div className="col-lg-4 mb-5 mb-lg-0">
              <a href="#" className="navbar-brand mb-4 d-block">
                <span className="text-primary">Prop</span>Bot
              </a>
              <p>
                Advanced AI-powered chatbot platform that provides human-like
                customer service and engagement for businesses of all sizes.
              </p>
              <div className="footer-social">
                <a href="#">
                  <i className="fab fa-facebook-f"></i>
                </a>
                <a href="#">
                  <i className="fab fa-twitter"></i>
                </a>
                <a href="#">
                  <i className="fab fa-linkedin-in"></i>
                </a>
                <a href="#">
                  <i className="fab fa-instagram"></i>
                </a>
              </div>
            </div>
            <div className="col-lg-2 col-md-4 col-6 mb-5 mb-md-0">
              <h5 className="footer-title">Company</h5>
              <ul className="footer-links">
                <li>
                  <a href="#">About Us</a>
                </li>
                <li>
                  <a href="#">Careers</a>
                </li>
                <li>
                  <a href="#">Blog</a>
                </li>
                <li>
                  <a href="#">Press</a>
                </li>
                <li>
                  <a href="#">Contact</a>
                </li>
              </ul>
            </div>
            <div className="col-lg-2 col-md-4 col-6 mb-5 mb-md-0">
              <h5 className="footer-title">Product</h5>
              <ul className="footer-links">
                <li>
                  <a href="#">Features</a>
                </li>
                <li>
                  <a href="#">Pricing</a>
                </li>
                <li>
                  <a href="#">Integrations</a>
                </li>
                <li>
                  <a href="#">API</a>
                </li>
                <li>
                  <a href="#">Documentation</a>
                </li>
              </ul>
            </div>
            <div className="col-lg-2 col-md-4 col-6 mb-5 mb-md-0">
              <h5 className="footer-title">Resources</h5>
              <ul className="footer-links">
                <li>
                  <a href="#">Help Center</a>
                </li>
                <li>
                  <a href="#">Community</a>
                </li>
                <li>
                  <a href="#">Webinars</a>
                </li>
                <li>
                  <a href="#">Case Studies</a>
                </li>
                <li>
                  <a href="#">Tutorials</a>
                </li>
              </ul>
            </div>
            <div className="col-lg-2 col-md-4 col-6">
              <h5 className="footer-title">Legal</h5>
              <ul className="footer-links">
                <li>
                  <a href="#">Privacy Policy</a>
                </li>
                <li>
                  <a href="#">Terms of Service</a>
                </li>
                <li>
                  <a href="#">Cookie Policy</a>
                </li>
                <li>
                  <a href="#">GDPR</a>
                </li>
                <li>
                  <a href="#">Security</a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="container">
            <p>&copy; 2025 PropBot AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
