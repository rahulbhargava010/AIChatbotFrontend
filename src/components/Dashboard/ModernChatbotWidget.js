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
    { label: "Get a Call Back", action: "get_callback" },
    { label: "Site Visit Schedule", action: "schedule_site_visit" },
    { label: "Download Brochure", action: "brochure" },
  ]);
  const [isMobile, setIsMobile] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [inlineFormVisible, setInlineFormVisible] = useState(false);
  const [chatVisible, setChatVisible] = useState(true);
  const [formType, setFormType] = useState("");
  const [buttonContent, setButtonContent] = useState({});
  const [isTyping, setIsTyping] = useState(false);
  const [whileTyping, setWhileTyping] = useState(false);
  const [leadData, setLeadData] = useState({
    name: "",
    phone: "",
    email: "",
    id: "",
  });
  const [chatbotData, setChatbotData] = useState(null);
  const [sessionId, setSessionId] = useState("");
  const [conversation, setConversation] = useState("");
  const [msgFromResponse, setMsgFromResponse] = useState(
    "Please Introduce Yourself"
  );
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [checkedItems, setCheckedItems] = useState({
    option1: false,
    option2: false,
  });
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(false);

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

  // Automatically hide the first screen after 5 seconds
  useEffect(() => {
    if (showFirstScreen) {
      const timer = setTimeout(() => {
        setShowFirstScreen(false);
        setChatInitialized(true);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [showFirstScreen]);

  // Hide the first screen immediately when Get Started is clicked
  const handleGetStarted = () => {
    setShowFirstScreen(false);
    setChatInitialized(true);
  };

  // Show form after a certain time if not interacting
  useEffect(() => {
    const interval = setInterval(() => {
      const userSenderCount = messages.filter(
        (message) => message.sender === "User"
      ).length;

      if (isTyping === false && userSenderCount > 0) {
        if (!formSubmitted) {
          // Show the form inline in the chat instead of overlay
          addInlineForm();
        }
      }
    }, 20000); // Runs every 20 seconds

    return () => clearInterval(interval); // Cleanup on unmount
  }, [isTyping]);

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
    // Rating functionality disabled
    if (rating) {
      setRating("");
      setShowRating(false);
    }
  }, [rating]);

  // Auto-save session and conversations
  useEffect(() => {
    setSessionId(storedSessionId);
    sessionStorage.setItem("chatbotSessionId", storedSessionId);

    const interval = setInterval(() => {
      const hasUserMessage = messages.some((msg) => msg.sender === "User");
      if (hasUserMessage) {
        saveConversation(storedSessionId);
      }
    }, 7000);

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

        console.log("Welcome response data:", response.data);

        setWebhook(webhook || "");
        setProjectLogo(projectLogo || "");
        setProjectImages(projectImages || []);
        setChatbotData(response.data);

        if (buttons && buttons.length > 0) {
          // Merge the API buttons with our custom buttons
          const customButtons = [
            { label: "Get a Call Back", action: "get_callback" },
            { label: "Site Visit Schedule", action: "schedule_site_visit" },
            { label: "Download Brochure", action: "brochure" },
          ];

          // Filter out duplicates based on action
          const mergedButtons = [
            ...buttons,
            ...customButtons.filter(
              (cBtn) => !buttons.some((btn) => btn.action === cBtn.action)
            ),
          ];

          const buttonMap = {};
          mergedButtons.forEach((btn) => {
            buttonMap[btn.action] = btn.data;
          });
          setButtonContent(buttonMap);
          setButtons(mergedButtons);
        }

        // Prepare messages but don't show them until first screen is dismissed
        const initialMessages = [
          { sender: "Bot", text: greeting, timestamp: new Date() },
          { sender: "Bot", text: chatbotGreeting, timestamp: new Date() },
          { sender: "Bot", text: projectHighlights, timestamp: new Date() },
        ];

        if (projectImages && projectImages.length > 0) {
          initialMessages.push({
            images: projectImages,
            timestamp: new Date(),
          });
        }

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
        ]);
      }
    };

    fetchWelcomeData();
  }, [chatbotId]);

  // Handle rating
  const handleRateChat = () => {
    if (formSubmitted) {
      // Rating functionality is disabled for now
      // setShowRating(true);
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          sender: "Bot",
          text: "Thank you for your interest in providing feedback. This feature is currently being updated.",
          timestamp: new Date(),
        },
      ]);
    } else {
      addInlineForm();
      setMsgFromResponse("Please share your details:");
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

  // Function to add the form inline in the chat
  const addInlineForm = () => {
    // Remove existing inline forms first
    setMessages((prevMessages) =>
      prevMessages.filter((msg) => !msg.isInlineForm)
    );

    // Now add the new inline form
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        isInlineForm: true,
        // Don't include a timestamp for the form
      },
    ]);

    setInlineFormVisible(true);

    // Scroll to the form after it renders
    setTimeout(() => {
      if (chatWindowRef.current) {
        chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
      }
    }, 100);
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

  // Handle successful form submission
  const handleFormSuccess = () => {
    try {
      // First remove the form from messages
      const filteredMessages = messages.filter((msg) => !msg.isInlineForm);

      // Then add success message
      const updatedMessages = [
        ...filteredMessages,
        {
          sender: "Bot",
          text: "Thank you! We've received your information and will get back to you soon.",
          timestamp: new Date(),
          isSuccess: true,
        },
      ];

      // Update messages state with the new array
      setMessages(updatedMessages);

      // Update other states
      setInlineFormVisible(false);
      setFormSubmitted(true);

      // Reset form values
      setLeadData({
        name: "",
        phone: "",
        email: "",
        id: "",
      });

      // Make sure rating doesn't show
      setShowRating(false);

      // Add a follow-up message after a delay
      setTimeout(() => {
        setMessages((currentMessages) => [
          ...currentMessages,
          {
            sender: "Bot",
            text: "Is there anything else I can help you with?",
            timestamp: new Date(),
          },
        ]);
      }, 1000);
    } catch (error) {
      console.error("Error in handleFormSuccess:", error);
    }
  };

  // Handle inline form submission
  const handleInlineFormSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitDisabled(true);

    try {
      // Create a dummy setMessages function that won't affect our chat
      // but will satisfy the handleLeadSubmit function's requirements
      const dummySetMessages = (msgs) => {
        console.log("Form submission processed");
        return msgs;
      };

      // Call the lead submit handler with proper parameters
      const result = await handleLeadSubmit(
        e,
        leadData,
        setLeadData,
        chatbotId,
        conversation,
        dummySetMessages, // Provide a dummy function that won't modify our messages
        () => {}, // Dummy function for setFormVisible
        setFormSubmitted,
        () => {}, // Disable showing the rating by providing a no-op function
        setChatVisible,
        setIsTyping,
        uniqueSessionId,
        messages,
        setIsSubmitDisabled
      );

      // Handle success in our own way
      if (!e.defaultPrevented) {
        handleFormSuccess();

        // Reset form values
        setLeadData({
          name: "",
          phone: "",
          email: "",
          id: "",
        });
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setIsSubmitDisabled(false);
    }
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
    if (!input.trim() || isButtonDisabled) return;

    setIsButtonDisabled(true); // Disable button to prevent multiple submissions

    setMessages((prevMessages) => [
      ...prevMessages,
      { sender: "User", text: input, timestamp: new Date() },
    ]);

    const userSenderCount = messages.filter(
      (message) => message.sender === "User"
    ).length;

    // If more than 10 user messages and no form submitted yet, show form
    if (userSenderCount >= 10 && !formSubmitted) {
      addInlineForm();
      setIsButtonDisabled(false); // Re-enable button
      return;
    }

    try {
      setIsTyping(true);
      setWhileTyping(true);
      const currentInput = input;
      setInput("");

      const response = await api.post("/aichatbots/respond", {
        chatbotId,
        message: currentInput,
      });

      const { reply, score } = response.data;

      if (reply && reply.toLowerCase().includes("form")) {
        addInlineForm();

        if (reply.toLowerCase().includes("sitevisit")) {
          setMsgFromResponse(
            "To Book The Site Visit Please Fill Out the Form."
          );
        } else if (reply.toLowerCase().includes("brochure")) {
          setMsgFromResponse(
            "To Download The Brochure Please Fill Out the Form."
          );
        } else if (reply.toLowerCase().includes("payments")) {
          setMsgFromResponse(
            "To Know More About The Payment Plan Please Fill Out the Form."
          );
        } else if (reply.toLowerCase().includes("sorry")) {
          setMsgFromResponse(
            "We're sorry to hear that you're facing issues. 😞 Please share your details, and our team will assist you."
          );
        } else {
          setMsgFromResponse(
            "Please Fill Out the Form Below and We'll Get Back to You"
          );
        }
        setIsTyping(false);
        setWhileTyping(false);
        setIsButtonDisabled(false);
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
        setWhileTyping(false);
      }, 800);

      await api.post("analytics/saveEvent", {
        eventType: "chat_message",
        sessionId: uniqueSessionId,
        messages,
        chatbotId,
      });
    } catch (err) {
      console.error("Failed to send message:", err);
      addInlineForm();
      setMsgFromResponse(
        "We're sorry, but we couldn't process your request. Please share your details, and our team will assist you."
      );
      setIsTyping(false);
      setWhileTyping(false);
    }

    saveConversation(sessionId);

    // Re-enable button after delay
    setTimeout(() => {
      setIsButtonDisabled(false);
    }, 2000);
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

        // Set appropriate message for the form
        if (action === "schedule_site_visit") {
          setMsgFromResponse("Please share your details for a site visit:");
        } else if (action === "get_callback") {
          setMsgFromResponse(
            "Please share your details for a call back from our team:"
          );
        } else if (action === "brochure") {
          setMsgFromResponse(
            "Please share your details to download our brochure:"
          );
        } else {
          setMsgFromResponse("Please provide your information:");
        }

        // Add user's request as a message
        setMessages((prevMessages) => [
          ...prevMessages,
          { sender: "User", text: label, timestamp: new Date() },
        ]);

        // First remove any existing inline form
        setMessages((prevMessages) =>
          prevMessages.filter((msg) => !msg.isInlineForm)
        );

        setInlineFormVisible(false);

        // Wait a bit before adding the new form
        setTimeout(() => {
          // Add bot response and form
          addInlineForm();
        }, 300);
      } else {
        setFormVisible(false);
        setChatVisible(true);

        setMessages((prevMessages) => [
          ...prevMessages,
          { sender: "User", text: label, timestamp: new Date() },
        ]);

        // Show typing indicator
        setIsTyping(true);
        setWhileTyping(true);

        // Format the content with bullet points if it's a text block
        const formatContent = (content) => {
          if (!content) return `Information about ${label}`;

          // If content has multiple lines, add bullet points
          if (content.includes("\n")) {
            const icon = "🔹"; // Use emoji as bullet
            return content
              .split("\n")
              .map((line) => line.trim())
              .filter((line) => line)
              .map((line) => (line.endsWith(".") ? `${icon} ${line}` : line))
              .join("\n");
          }

          return content;
        };

        // Simulate response delay
        setTimeout(() => {
          setMessages((prevMessages) => [
            ...prevMessages,
            {
              sender: "Bot",
              text: formatContent(buttonContent[action]),
              timestamp: new Date(),
            },
          ]);
          setIsTyping(false);
          setWhileTyping(false);
        }, 800);
      }

      saveConversation(storedSessionId);
    } catch (err) {
      console.error("Error fetching content:", err);
      setIsTyping(false);
      setWhileTyping(false);
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
      let logoUrl = projectLogo;

      // If the logo path doesn't start with http, prepend the base URL
      if (!projectLogo.startsWith("http")) {
        logoUrl = `https://assist-ai.propstory.com/${projectLogo}`;
      }

      return (
        <img
          src={logoUrl}
          alt="Logo"
          className="modern-chatbot-logo"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src =
              "https://magicpage-dev.propstory.com/ImageUploads/VBHC%20Landscape/1nnx53gk0m7srs5pd.png";
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

  // Render inline form component
  const renderInlineForm = () => {
    return (
      <div className="modern-inline-form">
        <div className="modern-form-header">
          <h3>
            {msgFromResponse ||
              "Please share your details for a call back from our team:"}
          </h3>
        </div>

        <form
          className="modern-contact-form"
          onSubmit={(e) =>
            handleLeadSubmit(
              e,
              leadData,
              setLeadData,
              chatbotId,
              conversation,
              setMessages,
              setFormVisible,
              setFormSubmitted,
              setShowRating,
              setChatVisible,
              setIsTyping,
              uniqueSessionId,
              messages,
              setIsSubmitDisabled // ✅ Pass it here
            )
          }
        >
          <div className="modern-form-group">
            <label htmlFor="name">Full Name</label>
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

          <div className="modern-form-group">
            <label htmlFor="phone">Phone Number</label>
            <PhoneInput
              country={"in"}
              value={leadData.phone}
              onChange={(phone) => setLeadData({ ...leadData, phone })}
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

          <button
            type="submit"
            className="modern-inline-submit-button"
            disabled={isSubmitDisabled}
          >
            {isSubmitDisabled ? "PROCESSING..." : "SUBMIT"}
          </button>
        </form>
      </div>
    );
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
                  Hi there! I'm an AI assistant designed to help you discover
                  the perfect property.
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
                    Online
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
                    <MoreVertical size={24} />
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
                          // Use the actual phone number from API if available
                          const phoneNumber =
                            chatbotData?.phoneNumber || "+919999999999";
                          window.open(`https://wa.me/${phoneNumber}`, "_blank");
                          setIsOpen(false);
                        }}
                      >
                        <ExternalLink size={16} />
                        <span>Send details via WhatsApp</span>
                      </button>
                    </div>
                  )}
                </div>
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
                  // Handle regular messages
                  if (
                    message.text ||
                    message.images?.length ||
                    message.buttons?.length
                  ) {
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className={`modern-message ${
                          message.sender === "User"
                            ? "modern-user-message"
                            : "modern-bot-message"
                        } ${message.isSuccess ? "modern-success-message" : ""}`}
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
                    );
                  }
                  // Handle inline form
                  else if (message.isInlineForm) {
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="modern-fullwidth-form-container"
                      >
                        {renderInlineForm()}
                      </motion.div>
                    );
                  }

                  return null;
                })}

                {/* Typing Indicator */}
                {isTyping && whileTyping && (
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
                    !input.trim() || isButtonDisabled ? "disabled" : ""
                  }`}
                  onClick={handleSendMessage}
                  disabled={!input.trim() || isButtonDisabled}
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
