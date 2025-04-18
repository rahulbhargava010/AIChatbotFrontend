import React, { useState, useEffect, useRef } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import axios from "axios";
import "./ChatbotWidget.css";
// import "./TestChatbot.css";
import { Mic, Send, Languages, X } from "lucide-react";
import { Dropdown } from "react-bootstrap";
import ChatbotRating from "./ChatbotRating";
import api from "../config/axios";
import handleLeadSubmit from "../config/handleLeadSubmit";
import { v4 as uuidv4 } from "uuid";
import { SketchPicker } from "react-color";
import chatbotThemes from "../config/chatbotThemes";
import { FirstScreen } from "./FirstScreen";
// import { Send } from "lucide-react";
import { Form } from "react-bootstrap";
import { motion } from "framer-motion";

const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const { chatbotId } = useParams();
  const [messages, setMessages] = useState([]);
  const [rating, setRating] = useState("");
  const [review, setReview] = useState("");
  // const [embedScript, setEmbedScript] = useState('');

  const [webhook, setWebhook] = useState("");
  const [projectLogo, setProjectLogo] = useState([]);
  const [projectImages, setProjectImages] = useState([]);
  const [input, setInput] = useState("");
  const chatWindowRef = useRef(null);
  const [buttons] = useState([
    // { label: "Highlights", action: "highlight" },
    { label: "Location", action: "location" },
    { label: "Amenities", action: "amenities" },

    // { label: "Brochure", action: "brochure" },
    // { label: "Schedule Site Visit", action: "schedule_site_visit" },
    { label: "Get a Call Back", action: "schedule_site_visit" },
  ]);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const [formVisible, setFormVisible] = useState(false);
  const [chatVisible, setChatVisible] = useState(true);
  const [formType, setFormType] = useState("");
  const [formAction, setFormAction] = useState("");
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
  const [msgRatingFromResponse, setRatingFromResponse] = useState(
    "Please Provide Your Rating"
  );
  const [formSubmitted, setFormSubmitted] = useState(false); // Add this state
  const [checkedItems, setCheckedItems] = useState({
    option1: false,
    option2: false,
  });
  const [speechRecognition, setSpeechRecognition] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState("en-IN");
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(false);

  // New state variable for page information
  const [pageInfo, setPageInfo] = useState({
    parentUrl: "",
    source: "",
    subsource: "",
    utmSource: "",
    utmMedium: "",
    utmCampaign: "",
    referrer: "",
  });

  // Add a new useEffect to listen for messages from the parent page
  useEffect(() => {
    // Function to handle messages from parent window
    const handleMessage = (event) => {
      const data = event.data;

      // Check if this is page info data
      if (data && data.type === "PAGE_INFO") {
        console.log("Received page info via postMessage:", data);
        setPageInfo({
          parentUrl: data.url || "",
          source: data.source || "",
          subsource: data.subsource || "",
          utmSource: data.utmSource || "",
          utmMedium: data.utmMedium || "",
          utmCampaign: data.utmCampaign || "",
          referrer: data.referrer || "",
        });
      }
    };

    // Add event listener
    window.addEventListener("message", handleMessage);

    // Also try to get info from URL parameters if available
    const urlParams = new URLSearchParams(window.location.search);
    const parentUrl = urlParams.get("parent_url") || "";
    const source = urlParams.get("source") || "";
    const subsource = urlParams.get("subsource") || "";
    const utmSource = urlParams.get("utm_source") || "";
    const utmMedium = urlParams.get("utm_medium") || "";
    const utmCampaign = urlParams.get("utm_campaign") || "";

    // Create direct object for logging (not using state)
    const pageInfoFromParams = {
      parentUrl,
      source,
      subsource,
      utmSource,
      utmMedium,
      utmCampaign,
    };

    // Log the actual parameter values directly
    console.log("Retrieved page info from URL params:", pageInfoFromParams);

    // Only update state if we have a parent URL
    if (parentUrl) {
      setPageInfo({
        parentUrl,
        source,
        subsource,
        utmSource,
        utmMedium,
        utmCampaign,
        referrer: "",
      });
    }

    // IMPORTANT! The cleanup function had a bug - it was adding a listener instead of removing it
    return () => {
      window.removeEventListener("message", handleMessage); // Fixed this line
    };
  }, []);

  // Log when pageInfo state is updated
  useEffect(() => {
    console.log("pageInfo state updated:", pageInfo);
  }, [pageInfo]);

  const indianLanguages = [
    { code: "en-IN", name: "English (India)" },
    { code: "hi-IN", name: "Hindi" },
    { code: "bn-IN", name: "Bengali" },
    { code: "ta-IN", name: "Tamil" },
    { code: "te-IN", name: "Telugu" },
    { code: "mr-IN", name: "Marathi" },
    { code: "gu-IN", name: "Gujarati" },
    { code: "kn-IN", name: "Kannada" },
    { code: "ml-IN", name: "Malayalam" },
    { code: "pa-IN", name: "Punjabi" },
    { code: "ur-IN", name: "Urdu" },
  ];

  useEffect(() => {
    return () => {
      if (speechRecognition) {
        speechRecognition.stop();
      }
    };
  }, [speechRecognition]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768); // Mobile if width ≤ 768px
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Toggle full-screen mode (only for mobile)
  const toggleFullScreen = () => {
    console.log("coming in toggle sceen");

    const chatbotIframe = document.querySelector(".chat-window");
    console.log("coming in toggle sceen class", isFullScreen);
    if (chatbotIframe) {
      if (isFullScreen) {
        console.log("coming in if");
        // Enter fullscreen mode

        // chatbotIframe.style.width = "95%";
        chatbotIframe.style.height = "75%";
        // chatbotIframe.style.left = "0";
        // chatbotIframe.style.top = "0";
        // chatbotIframe.style.transform = "none";
        // chatbotIframe.style.borderRadius = "0";
        // chatbotIframe.style.zIndex = "999999999";
      } else {
        console.log("coming in else");
        // Exit fullscreen mode
        // chatbotIframe.style.bottom = window.innerWidth <= 768 ? '13%' : '85px';
        // chatbotIframe.style.right = window.innerWidth <= 768 ? '3%' : '40px';
        // chatbotIframe.style.width = "100vw";
        chatbotIframe.style.height = "100%";
      }
      setIsFullScreen(!isFullScreen);
    }
  };

  const storedSessionId =
    sessionStorage.getItem("chatbotSessionId") || uuidv4();
  const uniqueSessionId = localStorage.getItem("uniqueSessionId");

  // const [selectedColor, setSelectedColor] = useState("#007bff");
  // const [selectedTextColor, setSelectedTextColor] = useState("#ffffff");
  // const [selectedBubbleColor, setSelectedBubbleColor] = useState("#dddddd");
  // const [showColorPicker, setShowColorPicker] = useState(false);
  const handleRecord = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const startRecording = () => {
    try {
      // Initialize SpeechRecognition
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

      if (!SpeechRecognition) {
        console.error("Speech recognition not supported in this browser.");
        // Show a notification to the user
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            sender: "Bot",
            text: "Speech recognition is not supported in your browser. Please type your message instead.",
          },
        ]);
        return;
      }

      const recognition = new SpeechRecognition();
      setSpeechRecognition(recognition);

      // Configure recognition
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = selectedLanguage;

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

        // Specific handling for different error types
        switch (event.error) {
          case "network":
            // Network-related error handling
            setMessages((prevMessages) => [
              ...prevMessages,
              {
                sender: "Bot",
                text: "Network error occurred with speech recognition. Please check your internet connection and try again. You can also type your message directly.",
              },
            ]);

            // Add a retry button to the UI
            // setShowRetryButton(true);
            break;

          case "not-allowed":
            setMessages((prevMessages) => [
              ...prevMessages,
              {
                sender: "Bot",
                text: "Please allow microphone access to use speech recognition.",
              },
            ]);
            break;

          case "no-speech":
            // Silent error - no need to display a message for no speech detected
            break;

          case "aborted":
            // User or system aborted the recognition - no need for message
            break;

          case "audio-capture":
            setMessages((prevMessages) => [
              ...prevMessages,
              {
                sender: "Bot",
                text: "Unable to capture audio. Please check your microphone settings.",
              },
            ]);
            break;

          case "service-not-allowed":
            setMessages((prevMessages) => [
              ...prevMessages,
              {
                sender: "Bot",
                text: "Speech recognition service not available. This may be due to network restrictions or service limitations. Please type your message instead.",
              },
            ]);
            break;

          default:
            // Generic error message
            setMessages((prevMessages) => [
              ...prevMessages,
              {
                sender: "Bot",
                text: "There was an error with speech recognition. Please try again or type your message.",
              },
            ]);
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
    // Don't reset transcribing here to allow user to see final transcript
  };

  const handleLanguageSelect = (langCode) => {
    setSelectedLanguage(langCode);
    setShowLanguageSelector(false);
  };

  const [utmParams, setUtmParams] = useState({
    utmSource: "",
    utmMedium: "",
    utmCampaign: "",
  });
  const [currentUrl, setCurrentUrl] = useState("");
  const [showFirstScreen, setShowFirstScreen] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowFirstScreen(false);
    }, 10000);

    return () => clearTimeout(timer); // Cleanup timer on unmount
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!formVisible && !isTyping) {
        if (!formSubmitted) {
          setFormVisible(true);
        }
      }
    }, 10000); // Runs every 10 seconds

    return () => clearInterval(interval); // Cleanup on unmount
  }, [formVisible, isTyping]); // Dependencies

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const utmSource = urlParams.get("utm_source") || "";
    const utmMedium = urlParams.get("utm_medium") || "";
    const utmCampaign = urlParams.get("utm_campaign") || "";

    const newUtmParams = { utmSource, utmMedium, utmCampaign };

    setUtmParams(newUtmParams);
    setCurrentUrl(window.location.href);

    console.log("Current URL Path:", window.location.href);
    console.log("UTM Parameters:", newUtmParams); // Use the newUtmParams object here
  }, []);

  const [showRating, setShowRating] = useState(false);

  const handleRateChat = () => {
    if (formSubmitted) {
      setShowRating(true); // Show rating component if form is submitted
    } else {
      // Show form first if not submitted
      setFormVisible(true);
      // Optionally, you can show a message indicating they need to fill the form first
      setMsgFromResponse(
        "Please fill out your information before rating our chat service."
      );
    }
    setIsOpen(false);
  };

  useEffect(() => {
    if (rating) {
      if (formSubmitted) {
        // Only post rating if form is submitted
        const submitRating = async () => {
          try {
            await api.post("/conversations/addRating", {
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
          } catch (error) {
            console.error("Error submitting rating:", error);
          }
        };
        submitRating();
      } else {
        // If form not submitted, show form
        setShowRating(false);
        setFormVisible(true);
        setMsgFromResponse(
          "Please fill out your information before rating our chat service."
        );
      }
    }
  }, [rating, formSubmitted]);

  const handleFeedbackSubmit = async (feedback) => {
    const feedbackRating = feedback?.rating;
    const feedbackReview = feedback?.review;
    try {
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: "User", text: `You rated chat as ${feedbackRating}` },
      ]);
      if (feedback?.review) {
        setMessages((prevMessages) => [
          ...prevMessages,
          { sender: "User", text: `Your review is ${feedbackReview}` },
        ]);
        setReview(feedback?.review);
      }
      setRating(feedback?.rating);

      saveConversation(storedSessionId);
    } catch (error) {
      // setMessages(error.response?.data?.error || "Failed to add company.");
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isButtonDisabled) return;

    setIsButtonDisabled(true); // Disable button

    setMessages((prevMessages) => [
      ...prevMessages,
      { sender: "User", text: input },
    ]);

    const userSenderCount = messages.filter(
      (message) => message.sender === "User"
    ).length;

    if (userSenderCount >= 10) {
      setFormVisible(true);
      setIsButtonDisabled(false); // Re-enable button immediately if form is shown
      return;
    }

    try {
      setIsTyping(true);
      setWhileTyping(true);
      const token = localStorage.getItem("token");
      const response = await api.post("/aichatbots/respond", {
        chatbotId,
        message: input,
      });

      console.log("chatbot response from Test Chatbot", response);
      const { reply, score } = response.data;
      console.log("chatbot response from Test Chatbot score", score);
      if (reply.toLowerCase().includes("form")) {
        setFormVisible(true);
        if (reply.toLowerCase().includes("sitevisit")) {
          setMsgFromResponse(
            "To Book The Site Visit Please Fill Out the Form."
          );
        } else if (reply.toLowerCase().includes("brochure")) {
          setMsgFromResponse(
            "To Download The Brouchure Please Fill Out the Form."
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
          setMsgFromResponse("Hi, How Can I Help You?");
        }
        setIsButtonDisabled(false);
        return;
      }

      const formattedReply = reply.replace(/\.([^\n])/g, ".\n$1");
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: "Bot", text: formattedReply, score },
      ]);

      setIsTyping(false);
      setWhileTyping(false);

      await api.post("analytics/saveEvent", {
        eventType: "chat_message",
        sessionId: uniqueSessionId,
        messages,
        chatbotId,
      });
    } catch (err) {
      console.error("Failed to send message:", err);

      // Show the form instead of displaying an error message
      setFormVisible(true);
      setIsTyping(false);
      setMsgFromResponse(
        "We're sorry, but we couldn't process your request. Please share your details, and our team will assist you."
      );
    }

    saveConversation(sessionId);
    setInput("");

    // Re-enable the button after 3 seconds
    setTimeout(() => {
      setIsButtonDisabled(false);
    }, 3000);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Prevent default form submission behavior
      handleSendMessage();
    }
  };

  useEffect(() => {
    // Assign a unique session ID per user/session
    setSessionId(storedSessionId);
    sessionStorage.setItem("chatbotSessionId", storedSessionId);
    // Auto-save conversation every 10 seconds
    const interval = setInterval(() => {
      const hasUserMessage = messages.some((msg) => msg.sender === "User");
      if (hasUserMessage) {
        saveConversation(storedSessionId);
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [messages]);

  // Save chat message to backend
  const saveConversation = async (sessionId) => {
    try {
      const hasUserMessage = messages.some((msg) => msg.sender === "User");
      if (hasUserMessage) {
        const response = await api.post("/conversations/save", {
          chatbotId,
          messages,
          sessionId,
        });
        setConversation(response.data.conversation._id);
      }
    } catch (err) {
      console.error("Error saving message:", err);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setChatVisible(true);
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  const handleChange = (e) => {
    const { name, checked } = e.target;
    setCheckedItems((prevState) => ({
      ...prevState,
      [name]: checked,
    }));
  };

  const handleButtonClick = async (action, label) => {
    try {
      const token = localStorage.getItem("token");
      const icon = "🔹"; // Replace this with any emoji or HTML entity

      if (
        ["schedule_site_visit", "get_callback", "brochure"].includes(action)
      ) {
        setMsgFromResponse(
          "Please Provide Your Information, We Are Happy To Help!"
        );
        setFormType(action);
        setFormVisible(true);
      } else {
        setFormVisible(false);
        setChatVisible(true);
        // setFormAction(webhook)

        if (buttonContent[action]) {
          setMessages((prevMessages) => [
            ...prevMessages,
            { sender: "User", text: label },
            {
              sender: "Bot",
              text: buttonContent[action]
                .split("\n")
                .map((line) =>
                  line.trim().endsWith(".") ? `${icon} ${line}` : line
                )
                .join("\n"),
            },
          ]);
        }
      }

      saveConversation(storedSessionId);
    } catch (err) {
      console.error("Error fetching content:", err);
    }
  };

  const dummyData = {
    greeting: "Hello! Welcome to our chatbot.",
    chatbotGreeting: "How can I assist you today?",
    projectHighlights: "We offer the best real estate solutions.",
    webhook: "",
    projectImages: [
      "https://magicpage-dev.propstory.com/ImageUploads/VBHC%20Landscape/1nnx53wlrm7yizlva.jpg",
    ],
    chatbotName: "PropBot",
    projectLogo: "/default-logo.png",
    buttons: [
      { label: "Site Visit Schedule", action: "schedule_site_visit" },
      { label: "Download Brochure", action: "brochure" },
      { label: "Location Map", action: "get_callback" },
    ],
  };

  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages]);

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
        } = response.data;

        console.log("Welcome in project greeting 12: ", response);

        setWebhook(webhook);
        setProjectLogo(projectLogo);
        setProjectImages(projectImages);
        setChatbotData(response.data);
        setButtonContent(buttons || {});

        const buttonMap = {};
        buttons.forEach((btn) => {
          buttonMap[btn.action] = btn.data;
        });

        setButtonContent(buttonMap);

        setMessages([
          { sender: "Bot", text: greeting },
          { sender: "Bot", text: chatbotGreeting },
          { sender: "Bot", text: projectHighlights },
          { images: projectImages },
          {
            buttons: [
              { label: "Site Visit Schedule", action: "schedule_site_visit" },
              { label: "Download Brochure", action: "brochure" },
              { label: "Location Map", action: "get_callback" },
            ],
          },
        ]);
      } catch (err) {
        console.error("Error fetching welcome data:", err);

        // ✅ Dummy data if API fails
        const dummyData = {
          greeting: "Welcome! How can I assist you?",
          chatbotGreeting: "Hello! I'm here to help with your queries.",
          projectHighlights: "Key highlights of the project include XYZ.",
          projectImages: ["https://via.placeholder.com/150"],
          buttons: [
            { label: "Site Visit Schedule", action: "schedule_site_visit" },
            { label: "Brochure", action: "brochure" },
            { label: "Location Map", action: "get_callback" },
          ],
        };

        setWebhook(null);
        setProjectLogo(null);
        setProjectImages(dummyData.projectImages);
        setChatbotData(dummyData);
        setButtonContent({});

        setMessages([
          { sender: "Bot", text: dummyData.greeting },
          { sender: "Bot", text: dummyData.chatbotGreeting },
          { sender: "Bot", text: dummyData.projectHighlights },
          { images: dummyData.projectImages },
          { buttons: dummyData.buttons },
        ]);
      }
    };

    fetchWelcomeData();
  }, [chatbotId]);

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now - new Date(timestamp)) / 1000);

    if (diffInSeconds < 60) {
      return "Just now";
    } else if (diffInSeconds < 3600) {
      return `${Math.floor(diffInSeconds / 60)} min ago`;
    } else if (diffInSeconds < 86400) {
      return `${Math.floor(diffInSeconds / 3600)} hrs ago`;
    } else {
      return new Date(timestamp).toLocaleString();
    }
  };

  const theme = chatbotThemes["default"] || chatbotThemes.default;

  return (
    <div className={`chat-wrapper ${chatVisible ? "" : "chatbot-hidden"}`}>
      <div
        className={`test-chatbot-container chatbot-container ${
          isFullScreen ? "full-screen" : ""
        }`}
      >
        {/* Full-screen button (Visible only on mobile) */}

        {formVisible && (
          <div className="chatbot-form-overlay" style={{ zIndex: "10" }}>
            <div className="chatbot-form-container vh-100 window_bg_pink p-3 position-relative">
              <button
                className="close-button"
                onClick={() => {
                  setFormVisible(false);
                  setChatVisible(true);
                }}
              >
                ×
              </button>

              {formSubmitted ? (
                <div className="text-center">
                  <div className="chatbot_wrapper">
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
                    <h4>THANK YOU!</h4>
                    <p>
                      We've received your submission, and we'll be in touch
                      soon!
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="text-center mt-4">
                    <svg
                      width="50"
                      height="50"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle cx="12" cy="12" r="10" fill="#6a11cb" />
                      <path
                        d="M16 14H8M16 10L12 7L8 10"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <h3 className="text-center mt-4">{msgFromResponse}</h3>
                  </div>

                  <form
                    className="chatbot-form my-4"
                    onSubmit={(e) =>
                      handleLeadSubmit(
                        e,
                        // Enhance leadData with page information
                        { ...leadData, pageInfo },
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
                        setIsSubmitDisabled
                      )
                    }
                  >
                    {/* Name Input */}
                    <div className="icondiv">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="#6a11cb"
                        width="32"
                        height="32"
                      >
                        <path d="M12 12c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm0 2c-3.33 0-10 1.67-10 5v3h20v-3c0-3.33-6.67-5-10-5z" />
                      </svg>
                      <input
                        type="text"
                        name="name"
                        placeholder="Your Name"
                        className="form-control"
                        required
                        value={leadData.name}
                        onChange={(e) =>
                          setLeadData({ ...leadData, name: e.target.value })
                        }
                      />
                    </div>

                    {/* Phone Input */}
                    <div className="icondiv">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="#6a11cb"
                        width="32"
                        height="32"
                      >
                        <path d="M6.62 10.79a15.72 15.72 0 006.59 6.59l2.2-2.2a1 1 0 011.09-.23 11.36 11.36 0 003.58.6 1 1 0 011 1v3.79a1 1 0 01-1 1A18 18 0 012 4a1 1 0 011-1h3.79a1 1 0 011 1 11.36 11.36 0 00.6 3.58 1 1 0 01-.23 1.09l-2.2 2.2z" />
                      </svg>
                      <input
                        type="tel"
                        name="phone"
                        className="form-control"
                        placeholder="Mobile Number"
                        pattern="[0-9]{10}"
                        required
                        value={leadData.phone}
                        onChange={(e) =>
                          setLeadData({ ...leadData, phone: e.target.value })
                        }
                      />
                    </div>

                    {/* Email Input */}
                    <div className="icondiv">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="#6a11cb"
                        width="32"
                        height="32"
                      >
                        <path d="M22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6zm-2 0l-8 5-8-5h16zm0 12H4V8l8 5 8-5v10z" />
                      </svg>
                      <input
                        type="email"
                        name="email"
                        className="form-control"
                        placeholder="Email Address"
                        required
                        value={leadData.email}
                        onChange={(e) =>
                          setLeadData({ ...leadData, email: e.target.value })
                        }
                      />
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      className="btn btn-primary w-100"
                      disabled={isSubmitDisabled}
                    >
                      {isSubmitDisabled ? "Processing..." : "SUBMIT"}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        )}

        {chatVisible && (
          <>
            {showFirstScreen ? (
              <FirstScreen
                setShowFirstScreen={setShowFirstScreen}
                chatbotData={chatbotData}
              />
            ) : (
              <>
                <div className="d-flex header p-2 justify-content-between align-items-start">
                  {chatbotData?.projectLogo && (
                    <div className="chatbot-logo d-flex justify-content-center align-items-start">
                      <img
                        key={chatbotData?.projectLogo}
                        className="chatbot-logo-img"
                        src={`https://assist-ai.propstory.com/${chatbotData?.projectLogo}`}
                        alt="Project Logo"
                        height="50"
                        width="60"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                            "https://magicpage-dev.propstory.com/ImageUploads/VBHC%20Landscape/1nnx53gk0m7srs5pd.png";
                        }}
                      />

                      <div className="py-2 text-left ms-2">
                        <h4 className="title">
                          {chatbotData?.chatbotName
                            ?.toLowerCase()
                            .replace(/\b\w/g, (char) =>
                              char.toUpperCase()
                            )}{" "}
                          Help Desk
                        </h4>
                        <small>
                          <span className="d-block pt-2">
                            <svg
                              width="10"
                              height="10"
                              viewBox="0 0 16 16"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <circle
                                cx="8"
                                cy="8"
                                r="6"
                                fill="#198754"
                                stroke="#28C840"
                                strokeWidth="2"
                              />
                            </svg>{" "}
                            We are online to assist you
                          </span>
                        </small>
                      </div>
                    </div>
                  )}

                  <div className="relative py-2">
                    {/* Menu Icon */}
                    <div
                      className="menu-toggle1 cursor-pointer rounded-md hover:bg-gray-200 transition align-items-center"
                      onClick={() => setIsOpen(!isOpen)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="menu-icon"
                        height="1.2em"
                        width="1.4em"
                      >
                        <path d="M12 2C13.1 2 14 2.9 14 4s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm0 8c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm0 8c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z" />
                      </svg>
                    </div>

                    {/* Dropdown Menu (Visible when clicked) */}
                    {isOpen && (
                      <div className="relative right-0 bg-white shadow-lg">
                        <ul className="menu_list bg-white text-center position-absolute list-unstyled">
                          <li
                            onClick={() => {
                              handleRateChat();
                              setIsOpen(false);
                            }}
                          >
                            Rate this Chat
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                <div
                  className="chat-window p-4 border rounded scrollbar"
                  id="style-8"
                  ref={chatWindowRef}
                >
                  {showRating && (
                    <ChatbotRating
                      isFullScreen={isFullScreen}
                      onSubmit={handleFeedbackSubmit}
                      onClose={() => setShowRating(false)}
                      formSubmitted={formSubmitted}
                    />
                  )}

                  {messages?.map((message, index) => {
                    const hasContent =
                      message.text ||
                      message.images?.length ||
                      message.buttons?.length;

                    return hasContent ? (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }} // Start slightly below
                        animate={{ opacity: 1, y: 0 }} // Fade in and move up instantly
                        transition={{ duration: 0.3, ease: "linear" }} // Instant response
                        className={`message ${
                          message.sender === "User"
                            ? "user-message"
                            : "bot-message"
                        }`}
                      >
                        <div
                          className={`message ${
                            message.sender === "User"
                              ? "user-message"
                              : "bot-message"
                          }`}
                        >
                          {/* ✅ Text Message */}
                          {message.text && (
                            <div
                              className="message-bubble"
                              style={{
                                backgroundColor: "rgb(231 218 243 / 51%)",
                                boxShadow: "2px 2px 8px rgba(0, 0, 0, 0.2)",
                                borderRadius: "10px",
                                padding: "10px",
                                width: "auto !important", // Adapts width to content
                                lineHeight: "21px",
                                margin: "5px 0",
                                border: "2px solid rgb(255, 255, 255)",
                                fontSize: "14px",
                                textAlign: "left",
                                whiteSpace: "pre-wrap", // Ensures correct spacing
                                wordBreak: "break-word", // Prevents unwanted breaks
                              }}
                            >
                              {message.text
                                .replace(/\.{2,}/g, ".") // Replaces multiple dots with a single dot
                                .split("\n")
                                .map((line, idx) => (
                                  <span key={idx}>
                                    {line}
                                    {idx !==
                                      message.text.split("\n").length - 1 && (
                                      <br />
                                    )}
                                  </span>
                                ))}
                            </div>
                          )}

                          {/* ✅ Image Message */}
                          {message?.images && (
                            <div className="image-container">
                              {message.images.map((img, idx) => (
                                <img
                                  key={idx}
                                  className="chatbot-logo-img"
                                  src={`https://assist-ai.propstory.com/${img}`}
                                  alt="Project Image"
                                  height="200"
                                  width="200"
                                  style={{
                                    borderRadius: "10%",
                                    marginRight: "10px",
                                    marginBottom: "2rem",
                                  }}
                                  onError={(e) =>
                                    (e.target.style.display = "none")
                                  } // Hide broken images
                                />
                              ))}
                            </div>
                          )}

                          {/* ✅ Buttons */}
                          {message?.buttons &&
                            message?.buttons?.map((button, idx) => (
                              <div
                                className="d-flex flex-wrap justify-content-evenly text-center gap-2"
                                key={idx}
                              >
                                <a
                                  onClick={() =>
                                    handleButtonClick(
                                      button.action,
                                      button.label
                                    )
                                  }
                                  className="button-52"
                                >
                                  {button.label}
                                </a>
                              </div>
                            ))}
                        </div>
                      </motion.div>
                    ) : null;
                  })}

                  {/* ✅ Typing Animation */}
                  {isTyping && whileTyping && (
                    <div className="message bot-message">
                      <div className="message-bubble typing-animation">
                        <span className="dot"></span>
                        <span className="dot"></span>
                        <span className="dot"></span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="chatbot-footer d-flex justify-content-around">
                  <div className="button-container">
                    {buttons.map((button, index) => (
                      <a
                        key={index}
                        onClick={() =>
                          handleButtonClick(button.action, button.label)
                        }
                        className="button-50"
                        style={{
                          // backgroundColor: theme.buttonColor,
                          // color: theme.buttonTextColor,
                          buttonHoverColor: theme.buttonHoverColor,
                          borderRadius: theme.buttonBorderRadius,
                        }}
                      >
                        {button.label}
                      </a>
                    ))}
                  </div>
                </div>

                <div className="typing-area window_bg_pink">
                  <div className="typing-form">
                    <div className="input-wrapper py-0 form-control chat-input d-flex align-items-center">
                      <input
                        type="text"
                        placeholder="Enter a prompt here"
                        className="typing-input"
                        value={input}
                        onChange={(e) => {
                          setInput(e.target.value);
                          setIsTyping(true);
                        }}
                        onKeyDown={handleKeyDown}
                        required
                      />
                      <a
                        id="send-message-button"
                        className="icon material-symbols-rounded send-button p-0"
                        onClick={handleSendMessage}
                        disabled={isButtonDisabled}
                      >
                        <button className="p-1 mt- bg-black rounded-5 bg_pink text-dark">
                          <Send className="w-2 h-2" />
                        </button>
                      </a>
                    </div>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ChatbotWidget;
