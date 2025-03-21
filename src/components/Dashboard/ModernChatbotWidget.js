import React, { useState, useEffect, useRef } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import {
  Mic,
  Send,
  X,
  MoreVertical,
  MessageSquare,
  Star,
  ExternalLink,
} from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { Form } from "react-bootstrap";
import { motion, AnimatePresence } from "framer-motion";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import api from "../config/axios";
import handleLeadSubmit from "../config/handleLeadSubmit";
import "./ModernChatbot.css";

const ModernChatbotWidget = () => {
  // State variables
  const [isOpen, setIsOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const { chatbotId } = useParams();
  const [messages, setMessages] = useState([]);
  const [rating, setRating] = useState("");
  const [review, setReview] = useState("");
  const [webhook, setWebhook] = useState("");
  const [projectLogo, setProjectLogo] = useState("");
  const [projectImages, setProjectImages] = useState([]);
  const [input, setInput] = useState("");
  const chatWindowRef = useRef(null);
  const [buttons, setButtons] = useState([
    { label: "Location", action: "location" },
    { label: "Amenities", action: "amenities" },
    { label: "Get a Call Back", action: "schedule_site_visit" },
  ]);
  const [isMobile, setIsMobile] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [chatVisible, setChatVisible] = useState(true);
  const [formType, setFormType] = useState("");
  const [buttonContent, setButtonContent] = useState({});
  const [isTyping, setIsTyping] = useState(false);
  const [leadData, setLeadData] = useState({
    name: "",
    phone: "",
    email: "",
    id: "",
  });
  const [chatbotData, setChatbotData] = useState(null);
  const [sessionId, setSessionId] = useState("");
  const [conversation, setConversation] = useState("");
  const [msgFromResponse, setMsgFromResponse] = useState("");
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [checkedItems, setCheckedItems] = useState({
    option1: false,
    option2: false,
  });

  // Speech recognition states
  const [speechRecognition, setSpeechRecognition] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [transcribing, setTranscribing] = useState(false);

  // First screen animation state
  const [showFirstScreen, setShowFirstScreen] = useState(true);
  const [chatInitialized, setChatInitialized] = useState(false);

  // Rating system
  const [showRating, setShowRating] = useState(false);

  // UTM params for tracking
  const [utmParams, setUtmParams] = useState({
    utmSource: "",
    utmMedium: "",
    utmCampaign: "",
  });
  const [currentUrl, setCurrentUrl] = useState("");

  // Session and unique IDs
  const storedSessionId =
    sessionStorage.getItem("chatbotSessionId") || uuidv4();
  const uniqueSessionId = localStorage.getItem("uniqueSessionId") || uuidv4();

  // Rating emojis data
  const emojis = [
    { value: "1", icon: "😠", label: "Poor" },
    { value: "2", icon: "😕", label: "Bad" },
    { value: "3", icon: "😐", label: "Average" },
    { value: "4", icon: "🙂", label: "Good" },
    { value: "5", icon: "😍", label: "Excellent" },
  ];

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    // Store uniqueSessionId in localStorage if not already present
    if (!localStorage.getItem("uniqueSessionId")) {
      localStorage.setItem("uniqueSessionId", uniqueSessionId);
    }

    return () => window.removeEventListener("resize", checkMobile);
  }, [uniqueSessionId]);

  // Stop speech recognition when component unmounts
  useEffect(() => {
    return () => {
      if (speechRecognition) {
        speechRecognition.stop();
      }
    };
  }, [speechRecognition]);

  // Hide the first screen immediately when Get Started is clicked
  const handleGetStarted = () => {
    setShowFirstScreen(false);
    // Ensure the chat is initialized and visible
    setChatInitialized(true);
  };

  // Show form after a certain time if not interacting
  useEffect(() => {
    const interval = setInterval(() => {
      if (!formVisible && !isTyping && messages.length > 5) {
        setFormVisible(true);
      }
    }, 180000); // 3 minutes

    return () => clearInterval(interval);
  }, [formVisible, isTyping, messages.length]);

  // Track UTM parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const utmSource = urlParams.get("utm_source") || "";
    const utmMedium = urlParams.get("utm_medium") || "";
    const utmCampaign = urlParams.get("utm_campaign") || "";

    const newUtmParams = { utmSource, utmMedium, utmCampaign };

    setUtmParams(newUtmParams);
    setCurrentUrl(window.location.href);
  }, []);

  // Handle rating submission
  useEffect(() => {
    if (rating) {
      if (formSubmitted) {
        api.post("/conversations/addRating", {
          leadId: leadData.id,
          chatbotId,
          rating,
          sessionId,
          review,
        });
        setRating("");
        setTimeout(() => {
          setShowRating(false);
        }, 3000);
      } else {
        setShowRating(false);
        setFormVisible(true);
        setMsgFromResponse(
          "Please fill out your information before rating our chat service."
        );
      }
    }
  }, [rating, formSubmitted, leadData.id, chatbotId, sessionId, review]);

  // Auto-save session and conversations
  useEffect(() => {
    setSessionId(storedSessionId);
    sessionStorage.setItem("chatbotSessionId", storedSessionId);

    const interval = setInterval(() => {
      const hasUserMessage = messages.some((msg) => msg.sender === "User");
      if (hasUserMessage) {
        saveConversation(storedSessionId);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [messages, storedSessionId]);

  // Auto-scroll to latest message
  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages]);

  // Ensure chat is visible once first screen is hidden
  useEffect(() => {
    if (!showFirstScreen) {
      setChatVisible(true);
      setChatInitialized(true);
    }
  }, [showFirstScreen]);

  // Fetch welcome data
  useEffect(() => {
    const fetchWelcomeData = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await api.post(
          "/aichatbots/welcome",
          { chatbotId },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const {
          greeting,
          projectHighlights,
          buttons,
          webhook,
          projectImages,
          chatbotGreeting,
          chatbotName,
          projectLogo,
        } = response.data;

        setWebhook(webhook || "");
        setProjectLogo(projectLogo || "");
        setProjectImages(projectImages || []);
        setChatbotData(response.data);

        if (buttons && buttons.length > 0) {
          const buttonMap = {};
          buttons.forEach((btn) => {
            buttonMap[btn.action] = btn.data;
          });
          setButtonContent(buttonMap);
          setButtons(buttons);
        }

        // Prepare messages but don't show them until first screen is dismissed
        const initialMessages = [
          { sender: "Bot", text: greeting, timestamp: new Date() },
          { sender: "Bot", text: chatbotGreeting, timestamp: new Date() },
          { sender: "Bot", text: projectHighlights, timestamp: new Date() },
          { images: projectImages, timestamp: new Date() },
          {
            buttons: buttons || [
              { label: "Features", action: "features" },
              { label: "Location", action: "location" },
              { label: "Contact Us", action: "schedule_site_visit" },
            ],
            timestamp: new Date(),
          },
        ];

        setMessages(initialMessages);
      } catch (err) {
        console.error("Error fetching welcome data:", err);

        // Fallback to dummy data if API fails
        const dummyData = {
          greeting: "Welcome to our chatbot! 👋",
          chatbotGreeting:
            "I'm here to help you with any questions you might have.",
          projectHighlights:
            "Our project offers exceptional features, prime location, and attractive amenities. How may I assist you today?",
          projectImages: [
            "https://via.placeholder.com/400x200?text=Project+Image",
          ],
          chatbotName: "AI Assistant",
          projectLogo: "https://via.placeholder.com/150x60?text=Logo",
          buttons: [
            { label: "Features", action: "features" },
            { label: "Location", action: "location" },
            { label: "Contact Us", action: "schedule_site_visit" },
          ],
        };

        setWebhook(null);
        setProjectLogo(dummyData.projectLogo);
        setProjectImages(dummyData.projectImages);
        setChatbotData(dummyData);
        setButtonContent({});

        setMessages([
          { sender: "Bot", text: dummyData.greeting, timestamp: new Date() },
          {
            sender: "Bot",
            text: dummyData.chatbotGreeting,
            timestamp: new Date(),
          },
          {
            sender: "Bot",
            text: dummyData.projectHighlights,
            timestamp: new Date(),
          },
          { images: dummyData.projectImages, timestamp: new Date() },
          {
            buttons: dummyData.buttons,
            timestamp: new Date(),
          },
        ]);
      }
    };

    fetchWelcomeData();
  }, [chatbotId]);

  // Handle rating
  const handleRateChat = () => {
    if (formSubmitted) {
      setShowRating(true);
    } else {
      setFormVisible(true);
      setMsgFromResponse(
        "Please fill out your information before rating our chat service."
      );
    }
    setIsOpen(false);
  };

  // Handle form checkbox changes
  const handleChange = (e) => {
    const { name, checked } = e.target;
    setCheckedItems((prevState) => ({
      ...prevState,
      [name]: checked,
    }));
  };

  // Handle feedback submission
  const handleFeedbackSubmit = (feedback) => {
    const feedbackRating = feedback?.rating;
    const feedbackReview = feedback?.review;

    setMessages((prevMessages) => [
      ...prevMessages,
      {
        sender: "User",
        text: `You rated chat as ${feedbackRating}`,
        timestamp: new Date(),
      },
    ]);

    if (feedback?.review) {
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          sender: "User",
          text: `Your review is ${feedbackReview}`,
          timestamp: new Date(),
        },
      ]);
      setReview(feedback?.review);
    }

    setRating(feedback?.rating);
    saveConversation(storedSessionId);
  };

  // Speech recognition functions
  const startRecording = () => {
    try {
      // Initialize SpeechRecognition
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

      if (!SpeechRecognition) {
        console.error("Speech recognition not supported in this browser.");
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            sender: "Bot",
            text: "Speech recognition is not supported in your browser. Please type your message instead.",
            timestamp: new Date(),
          },
        ]);
        return;
      }

      const recognition = new SpeechRecognition();
      setSpeechRecognition(recognition);

      // Configure recognition
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = "en-IN"; // Default to English (India)

      // Set up event handlers
      recognition.onstart = () => {
        setIsRecording(true);
        setIsListening(true);
        setTranscribing(false);
        // Clear input when starting new recording
        setInput("");
      };

      recognition.onresult = (event) => {
        setTranscribing(true);
        const transcript = Array.from(event.results)
          .map((result) => result[0].transcript)
          .join("");

        setInput(transcript);
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        setIsRecording(false);
        setIsListening(false);
        setTranscribing(false);

        // Handle different error types
        switch (event.error) {
          case "network":
            setMessages((prevMessages) => [
              ...prevMessages,
              {
                sender: "Bot",
                text: "Network error occurred with speech recognition. Please check your internet connection and try again.",
                timestamp: new Date(),
              },
            ]);
            break;
          case "not-allowed":
            setMessages((prevMessages) => [
              ...prevMessages,
              {
                sender: "Bot",
                text: "Please allow microphone access to use speech recognition.",
                timestamp: new Date(),
              },
            ]);
            break;
          case "audio-capture":
            setMessages((prevMessages) => [
              ...prevMessages,
              {
                sender: "Bot",
                text: "Unable to capture audio. Please check your microphone settings.",
                timestamp: new Date(),
              },
            ]);
            break;
          default:
            // Don't show error for no-speech or aborted
            if (event.error !== "no-speech" && event.error !== "aborted") {
              setMessages((prevMessages) => [
                ...prevMessages,
                {
                  sender: "Bot",
                  text: "There was an error with speech recognition. Please try again or type your message.",
                  timestamp: new Date(),
                },
              ]);
            }
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        setTranscribing(false);

        // If we got some input and recognition ended normally, keep recording state active
        // so the user can see what was transcribed before sending
        if (input.trim() === "") {
          setIsRecording(false);
        }
      };

      // Start recognition
      recognition.start();
    } catch (error) {
      console.error("Error initializing speech recognition:", error);
      setIsRecording(false);
      setIsListening(false);
      setTranscribing(false);
    }
  };

  const stopRecording = () => {
    if (speechRecognition) {
      speechRecognition.stop();
    }
    setIsRecording(false);
    setIsListening(false);
  };

  const handleRecord = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // Handle sending messages
  const handleSendMessage = async () => {
    if (!input.trim()) return;

    setMessages((prevMessages) => [
      ...prevMessages,
      { sender: "User", text: input, timestamp: new Date() },
    ]);

    const userSenderCount = messages.filter(
      (message) => message.sender === "User"
    ).length;

    // If more than 10 user messages and no form submitted yet, show form
    if (userSenderCount >= 10 && !formSubmitted) {
      setFormVisible(true);
      return;
    }

    try {
      setIsTyping(true);
      const currentInput = input;
      setInput("");

      const response = await api.post("/aichatbots/respond", {
        chatbotId,
        message: currentInput,
      });

      const { reply, score } = response.data;

      if (reply === "form") {
        setFormVisible(true);
        setMsgFromResponse(
          "We're sorry to hear that you're facing issues. 😞 Please share your details, and our team will assist you."
        );
        setIsTyping(false);
        return;
      }

      // Add a slight delay to simulate natural typing
      setTimeout(() => {
        const formattedReply = reply.replace(/\.([^\n])/g, ".\n$1");
        setMessages((prevMessages) => [
          ...prevMessages,
          { sender: "Bot", text: formattedReply, score, timestamp: new Date() },
        ]);
        setIsTyping(false);
      }, 800);

      await api.post("analytics/saveEvent", {
        eventType: "chat_message",
        sessionId: uniqueSessionId,
        messages,
        chatbotId,
      });
    } catch (err) {
      console.error("Failed to send message:", err);
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          sender: "Bot",
          text: "Sorry, something went wrong. Please try again.",
          timestamp: new Date(),
        },
      ]);
      setIsTyping(false);
    }

    saveConversation(sessionId);
  };

  // Handle keyboard entry
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Handle button clicks
  const handleButtonClick = async (action, label) => {
    try {
      if (
        ["schedule_site_visit", "get_callback", "brochure", "contact"].includes(
          action
        )
      ) {
        setFormType(action);
        setFormVisible(true);
      } else {
        setFormVisible(false);
        setChatVisible(true);

        setMessages((prevMessages) => [
          ...prevMessages,
          { sender: "User", text: label, timestamp: new Date() },
        ]);

        // Show typing indicator
        setIsTyping(true);

        // Simulate response delay
        setTimeout(() => {
          setMessages((prevMessages) => [
            ...prevMessages,
            {
              sender: "Bot",
              text:
                buttonContent[action] || `Here's information about ${label}...`,
              timestamp: new Date(),
            },
          ]);
          setIsTyping(false);
        }, 800);
      }

      saveConversation(storedSessionId);
    } catch (err) {
      console.error("Error fetching content:", err);
    }
  };

  // Handle rating submission
  const handleSubmitRating = () => {
    if (!rating) {
      alert("⚠️ Please select a rating!");
      return;
    }

    handleFeedbackSubmit({ rating, review });
    setShowRating(false);
  };

  // Save conversation to backend
  const saveConversation = async (sessionId) => {
    try {
      const response = await api.post("/conversations/save", {
        chatbotId,
        messages,
        sessionId,
      });
      setConversation(response.data.conversation._id);
    } catch (err) {
      console.error("Error saving message:", err);
    }
  };

  // Format timestamp display
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "";

    const now = new Date();
    const messageDate = new Date(timestamp);
    const diffInSeconds = Math.floor((now - messageDate) / 1000);

    if (diffInSeconds < 60) {
      return "Just now";
    } else if (diffInSeconds < 3600) {
      return `${Math.floor(diffInSeconds / 60)}m ago`;
    } else if (diffInSeconds < 86400) {
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    } else {
      return messageDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  };

  // Close chatbot
  const handleClose = () => {
    // For iframe implementation, send message to parent window
    if (window.parent && window !== window.parent) {
      window.parent.postMessage({ type: "closeChatbot" }, "*");
    }
    // Fallback if not in iframe
    setChatVisible(false);
  };

  // Placeholder for the logo
  const renderLogo = () => {
    if (projectLogo) {
      return (
        <img
          src={projectLogo}
          alt="Logo"
          className="modern-chatbot-logo"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://via.placeholder.com/150x60?text=Logo";
          }}
        />
      );
    } else {
      return (
        <div className="modern-placeholder-logo">
          <span>{chatbotData?.chatbotName?.charAt(0) || "A"}</span>
        </div>
      );
    }
  };

  return (
    <div
      className={`modern-chatbot-wrapper ${
        !chatVisible ? "modern-chatbot-hidden" : ""
      }`}
    >
      <div className="modern-chatbot-container">
        {/* First Screen / Welcome Screen */}
        <AnimatePresence mode="wait">
          {showFirstScreen && chatVisible && (
            <motion.div
              className="modern-first-screen"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="modern-first-screen-content">
                <div className="modern-logo-container">{renderLogo()}</div>
                <h2 className="text-white">
                  {chatbotData?.chatbotName || "AI Assistant"}
                </h2>
                <p>
                  👋 Hi there! I'm here to help answer your questions and
                  provide information.
                </p>
                <motion.button
                  className="modern-start-button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleGetStarted}
                >
                  Get Started
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Contact Form Overlay */}
        <AnimatePresence>
          {formVisible && (
            <motion.div
              className="modern-form-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="modern-form-container">
                <button
                  className="modern-close-form"
                  onClick={() => {
                    setFormVisible(false);
                    setChatVisible(true);
                  }}
                  aria-label="Close form"
                >
                  <X size={24} />
                </button>

                {formSubmitted ? (
                  <motion.div
                    className="modern-form-success"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  >
                    <div className="modern-success-icon">
                      <svg
                        className="checkmark"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 52 52"
                      >
                        <circle
                          className="checkmark__circle"
                          cx="26"
                          cy="26"
                          r="25"
                          fill="none"
                        />
                        <path
                          className="checkmark__check"
                          fill="none"
                          d="M14.1 27.2l7.1 7.2 16.7-16.8"
                        />
                      </svg>
                    </div>
                    <h3>THANK YOU!</h3>
                    <p>
                      We've received your submission, and we'll be in touch
                      soon!
                    </p>
                    <button
                      className="modern-submit-button"
                      onClick={() => {
                        setFormVisible(false);
                        setChatVisible(true);
                      }}
                    >
                      Return to Chat
                    </button>
                  </motion.div>
                ) : (
                  <div className="modern-form-fields">
                    <div className="modern-form-header">
                      <h3>{msgFromResponse || "Please Introduce Yourself"}</h3>
                    </div>

                    <form
                      className="modern-contact-form"
                      onSubmit={async (e) =>
                        handleLeadSubmit(
                          e,
                          leadData,
                          setLeadData,
                          chatbotId,
                          conversation,
                          setMessages,
                          setFormVisible,
                          setFormSubmitted,
                          setChatVisible,
                          setShowRating,
                          setIsTyping,
                          uniqueSessionId,
                          messages,
                          api
                        )
                      }
                      onFocus={() => setIsTyping(true)}
                      onBlur={() => setIsTyping(false)}
                    >
                      <div className="modern-form-group">
                        <label htmlFor="name">Full Name</label>
                        <div className="modern-input-with-icon">
                          <input
                            type="text"
                            id="name"
                            placeholder="Enter your name"
                            required
                            value={leadData.name}
                            onChange={(e) =>
                              setLeadData({ ...leadData, name: e.target.value })
                            }
                          />
                        </div>
                      </div>

                      <div className="modern-form-group">
                        <label htmlFor="phone">Phone Number</label>
                        <PhoneInput
                          country={"in"}
                          value={leadData.phone}
                          onChange={(phone) =>
                            setLeadData({ ...leadData, phone })
                          }
                          inputProps={{
                            required: true,
                            id: "phone",
                            placeholder: "Enter your mobile number",
                          }}
                          containerClass="phone-input-container"
                          inputClass="phone-input"
                          buttonClass="phone-select-button"
                          dropdownClass="phone-dropdown"
                        />
                      </div>

                      <div className="modern-form-group">
                        <label htmlFor="email">Email Address</label>
                        <div className="modern-input-with-icon">
                          <input
                            type="email"
                            id="email"
                            placeholder="Enter your email"
                            required
                            value={leadData.email}
                            onChange={(e) =>
                              setLeadData({
                                ...leadData,
                                email: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>

                      {/* <Form.Check
                        type="checkbox"
                        id="permission"
                        name="option1"
                        label={`I allow ${
                          chatbotData?.chatbotName || "AI Assistant"
                        } call center to contact me for sales and support`}
                        checked={checkedItems.option1}
                        onChange={handleChange}
                        required
                        className="modern-form-checkbox"
                      /> */}

                      <button type="submit" className="modern-form-submit">
                        SUBMIT
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Chat Interface */}
        {chatVisible && (!showFirstScreen || chatInitialized) && (
          <>
            {/* Header */}
            <div className="modern-header">
              <div className="modern-header-left">
                {renderLogo()}
                <div className="modern-header-info">
                  <h3>{chatbotData?.chatbotName || "AI Assistant"}</h3>
                  <span className="modern-status">
                    <span className="modern-status-dot"></span>
                    We are online to assist you
                  </span>
                </div>
              </div>
              <div className="modern-header-actions">
                <div className="modern-dropdown">
                  <button
                    className="modern-icon-button"
                    onClick={() => setIsOpen(!isOpen)}
                    aria-label="Menu"
                  >
                    <MoreVertical size={18} />
                  </button>
                  {isOpen && (
                    <div className="modern-dropdown-menu">
                      <button
                        onClick={() => {
                          handleButtonClick(
                            "schedule_site_visit",
                            "Talk to Human"
                          );
                          setIsOpen(false);
                        }}
                      >
                        <MessageSquare size={16} />
                        <span>Talk to Human</span>
                      </button>
                      <button
                        onClick={() => {
                          handleRateChat();
                          setIsOpen(false);
                        }}
                      >
                        <Star size={16} />
                        <span>Rate this Chat</span>
                      </button>
                      <button
                        onClick={() => {
                          window.open("https://wa.me/+919999999999", "_blank");
                          setIsOpen(false);
                        }}
                      >
                        <ExternalLink size={16} />
                        <span>Send details via WhatsApp</span>
                      </button>
                    </div>
                  )}
                </div>
                <button
                  className="modern-icon-button"
                  onClick={handleClose}
                  aria-label="Close chatbot"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Chat Window */}
            <div className="modern-chat-window" ref={chatWindowRef}>
              {/* Rating Modal */}
              <AnimatePresence>
                {showRating && (
                  <motion.div
                    className="modern-rating-modal"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                  >
                    <div className="modern-rating-content">
                      <button
                        className="modern-close-button"
                        onClick={() => setShowRating(false)}
                        aria-label="Close"
                      >
                        <X size={20} />
                      </button>
                      <h3>How was your experience?</h3>
                      <div className="modern-emoji-rating">
                        {emojis.map((item) => (
                          <div
                            key={item.value}
                            className={`modern-emoji ${
                              rating === item.value ? "selected" : ""
                            }`}
                            onClick={() => setRating(item.value)}
                          >
                            <div className="modern-emoji-icon">{item.icon}</div>
                            <span>{item.label}</span>
                          </div>
                        ))}
                      </div>
                      <textarea
                        className="modern-review-input"
                        placeholder="Share your feedback (optional)"
                        value={review}
                        onChange={(e) => setReview(e.target.value)}
                        rows="3"
                      />
                      <button
                        className="modern-submit-button"
                        onClick={handleSubmitRating}
                      >
                        Submit Feedback
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Messages */}
              <div className="modern-messages">
                {messages?.map((message, index) => {
                  const hasContent =
                    message.text ||
                    message.images?.length ||
                    message.buttons?.length;

                  return hasContent ? (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`modern-message ${
                        message.sender === "User"
                          ? "modern-user-message"
                          : "modern-bot-message"
                      }`}
                    >
                      {/* Text Message */}
                      {message.text && (
                        <div className="modern-message-bubble">
                          {message.text}
                        </div>
                      )}

                      {/* Image Message */}
                      {message?.images && message.images.length > 0 && (
                        <div className="modern-image-gallery">
                          {message.images.map((img, idx) => {
                            let imageUrl = "";
                            try {
                              if (img.startsWith("http")) {
                                imageUrl = img;
                              } else {
                                imageUrl = `https://assist-ai.propstory.com/${img}`;
                              }
                            } catch (error) {
                              imageUrl =
                                "https://via.placeholder.com/150x100?text=Project+Image";
                            }
                            return (
                              <img
                                key={idx}
                                src={imageUrl}
                                alt={`Project image ${idx + 1}`}
                                className="modern-chat-image"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src =
                                    "https://via.placeholder.com/150x100?text=Image+Not+Found";
                                }}
                              />
                            );
                          })}
                        </div>
                      )}

                      {/* Button Options */}
                      {message?.buttons && message.buttons.length > 0 && (
                        <div className="modern-button-options">
                          {message.buttons.map((button, idx) => (
                            <motion.button
                              key={idx}
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.97 }}
                              className="modern-option-button"
                              onClick={() =>
                                handleButtonClick(button.action, button.label)
                              }
                            >
                              {button.label}
                            </motion.button>
                          ))}
                        </div>
                      )}

                      {/* Message timestamp */}
                      {message.timestamp && (
                        <div className="modern-message-time">
                          {formatTimestamp(message.timestamp)}
                        </div>
                      )}
                    </motion.div>
                  ) : null;
                })}

                {/* Typing Indicator */}
                {isTyping && (
                  <div className="modern-message modern-bot-message">
                    <div className="modern-typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Buttons above input area */}
            <div className="modern-quick-buttons">
              {/* Filter out duplicate buttons based on action */}
              {buttons
                .filter(
                  (button, index, self) =>
                    index === self.findIndex((b) => b.action === button.action)
                )
                .map((button, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="modern-quick-button"
                    onClick={() =>
                      handleButtonClick(button.action, button.label)
                    }
                  >
                    {button.label}
                  </motion.button>
                ))}
            </div>

            {/* Input Area */}
            <div className="modern-input-area">
              <div className="modern-input-container">
                {/* Optional mic button */}
                <button
                  className={`modern-mic-button ${
                    isRecording ? "recording" : ""
                  }`}
                  onClick={handleRecord}
                  aria-label={
                    isRecording ? "Stop recording" : "Start recording"
                  }
                >
                  <Mic size={20} />
                </button>

                <input
                  type="text"
                  className="modern-chat-input"
                  placeholder="Type your message..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                />

                <button
                  className={`modern-send-button ${
                    !input.trim() ? "disabled" : ""
                  }`}
                  onClick={handleSendMessage}
                  disabled={!input.trim()}
                  aria-label="Send message"
                >
                  <Send size={20} />
                </button>
              </div>
              <div className="modern-powered-by">
                Powered by{" "}
                <Link
                  className="modern-powered-link"
                  to="https://propstory.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Propstory
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ModernChatbotWidget;
