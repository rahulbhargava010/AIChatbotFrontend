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
  Download,
  ThumbsUp,
  ThumbsDown,
  Map as MapIcon,
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
    { label: "Highlights", action: "highlight", data: "Highlight" },
    { label: "Location", action: "location", data: "Location" },
    { label: "Amenities", action: "amenities", data: "Amenities" },
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
  const [showBrochurePrompt, setShowBrochurePrompt] = useState(false);

  // Map related states
  const [showMap, setShowMap] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapData, setMapData] = useState("");
  const [mapLocation, setMapLocation] = useState({
    lat: 12.9716,
    lng: 77.5946,
    address: "Bangalore",
  }); // Default to Bangalore
  const [mapMessageIndex, setMapMessageIndex] = useState(-1); // Track map message index

  // Speech recognition states
  const [speechRecognition, setSpeechRecognition] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [transcribing, setTranscribing] = useState(false);

  // First screen animation state - CHANGED to ensure it's always shown initially
  const [showFirstScreen, setShowFirstScreen] = useState(true);
  const [chatInitialized, setChatInitialized] = useState(false);

  // Rating system
  const [showRating, setShowRating] = useState(false);

  // Active tab state
  const [activeTab, setActiveTab] = useState("Highlights");

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

  // FIX 1: Ensure proper scrolling
  useEffect(() => {
    // Add overflow properties to enable scrolling
    document.body.style.overflow = "hidden";

    return () => {
      // Clean up the style changes when component unmounts
      document.body.style.overflow = "";
    };
  }, []);

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

  // Automatically hide the first screen after 10 seconds (CHANGED from 5 seconds)
  useEffect(() => {
    if (showFirstScreen) {
      const timer = setTimeout(() => {
        setShowFirstScreen(false);
        setChatInitialized(true);
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [showFirstScreen]);

  // Hide the first screen immediately when Get Started is clicked
  const handleGetStarted = () => {
    setShowFirstScreen(false);
    setChatInitialized(true);
  };

  // FIX: Map handling - Load map data when tab is clicked
  useEffect(() => {
    if (activeTab === "Map" && mapData) {
      setShowMap(true);
      setMapLoaded(true);

      // Find if there is an existing map message in the chat
      const mapIndex = messages.findIndex((msg) => msg.map);

      if (mapIndex >= 0) {
        // Update map message index for scrolling
        setMapMessageIndex(mapIndex);

        // Scroll to the existing map message with a consistent approach
        setTimeout(() => {
          const mapMessage = document.getElementById(`map-message-${mapIndex}`);

          if (mapMessage && chatWindowRef.current) {
            mapMessage.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
          }
        }, 300);
      } else {
        // Add a new map message if none exists
        const mapButton = buttons.find((btn) => btn.action === "map");
        if (mapButton && mapButton.data) {
          setMessages((prevMessages) => {
            const newMessages = [
              ...prevMessages,
              {
                sender: "Bot",
                map: true,
                mapHtml: mapButton.data,
                timestamp: new Date(),
              },
            ];
            // Update map message index
            setMapMessageIndex(newMessages.length - 1);
            return newMessages;
          });

          // Scroll to the newly added map
          setTimeout(() => {
            const mapMessages = document.querySelectorAll(
              ".modern-map-message"
            );
            if (mapMessages.length > 0) {
              mapMessages[mapMessages.length - 1].scrollIntoView({
                behavior: "smooth",
                block: "center",
              });
            }
          }, 500);
        }
      }
    }
  }, [activeTab, mapData, buttons, messages, chatWindowRef]);

  // FIX 8: Only show form if not submitted yet
  // Show form after a certain time if not interacting and form hasn't been submitted
  useEffect(() => {
    if (formSubmitted) return; // Don't show form if already submitted

    // Only show form after 3 messages from user or after 60 seconds
    const interval = setInterval(() => {
      const userSenderCount = messages.filter(
        (message) => message.sender === "User"
      ).length;

      // Only show form after at least 3 user messages
      if (isTyping === false && userSenderCount >= 3) {
        if (!formSubmitted && !inlineFormVisible) {
          // Show the form inline in the chat
          addInlineForm();
        }
      }
    }, 60000); // Increased to 60 seconds (1 minute)

    return () => clearInterval(interval);
  }, [isTyping, messages, formSubmitted, inlineFormVisible]);

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

  // FIX 1: Ensure proper scrolling - Improved auto-scroll to latest message
  useEffect(() => {
    if (chatWindowRef.current) {
      // Smoothly scroll to the bottom
      chatWindowRef.current.scrollTo({
        top: chatWindowRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isTyping]);

  // Ensure chat is visible once first screen is hidden
  useEffect(() => {
    if (!showFirstScreen) {
      setChatVisible(true);
      setChatInitialized(true);
    }
  }, [showFirstScreen]);

  // FIX 7: After project images, show question about brochure download
  // This useEffect detects when project images are added and shows the brochure prompt
  useEffect(() => {
    const hasImages = messages.some(
      (msg) => msg.images && msg.images.length > 0
    );

    if (hasImages && !showBrochurePrompt && !formSubmitted) {
      // Set a timeout to add the brochure question after images have been shown
      const timer = setTimeout(() => {
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            sender: "Bot",
            text: "Would you like to download our brochure?",
            buttons: [
              { label: "Yes, please", action: "brochure" },
              { label: "No, thanks", action: "no_brochure" },
            ],
            timestamp: new Date(),
          },
        ]);

        setShowBrochurePrompt(true);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [messages, showBrochurePrompt, formSubmitted]);

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
          buttons: apiButtons,
          webhook,
          projectImages,
          chatbotGreeting,
          chatbotName,
          projectLogo,
          projectLocation,
        } = response.data;

        console.log("DATA:", response.data);

        setWebhook(webhook || "");
        setProjectLogo(projectLogo || "");
        setProjectImages(projectImages || []);
        setChatbotData(response.data);

        // Set map location if available
        if (projectLocation) {
          setMapLocation(projectLocation);
        }

        if (apiButtons && apiButtons.length > 0) {
          // Store the map data if present
          const mapButton = apiButtons.find((btn) => btn.action === "map");
          if (mapButton && mapButton.data) {
            setMapData(mapButton.data);
          }

          // Merge the API buttons with our custom buttons
          const customButtons = [
            { label: "Get a Call Back", action: "get_callback" },
            { label: "Site Visit Schedule", action: "schedule_site_visit" },
            { label: "Download Brochure", action: "brochure" },
          ];

          // Filter out duplicates based on action
          const mergedButtons = [
            ...apiButtons,
            ...customButtons.filter(
              (cBtn) => !apiButtons.some((btn) => btn.action === cBtn.action)
            ),
          ];

          const buttonMap = {};
          mergedButtons.forEach((btn) => {
            buttonMap[btn.action] = btn.data;
          });
          setButtonContent(buttonMap);
          setButtons(mergedButtons);

          // Make sure "Map" button is present if not already
          if (!mergedButtons.some((btn) => btn.action === "map") && mapData) {
            setButtons((prev) => [
              ...prev,
              { label: "Map", action: "map", data: mapData },
            ]);
          }
        }

        // Prepare messages but don't show them until first screen is dismissed
        const initialMessages = [
          { sender: "Bot", text: greeting, timestamp: new Date() },
          { sender: "Bot", text: chatbotGreeting, timestamp: new Date() },
          { sender: "Bot", text: projectHighlights, timestamp: new Date() },
        ];

        if (projectImages && projectImages.length > 0) {
          initialMessages.push({
            sender: "Bot",
            images: projectImages,
            timestamp: new Date(),
          });
        }

        setMessages(initialMessages);
      } catch (err) {
        console.error("Error fetching welcome data:", err);

        // Fallback to dummy data if API fails and use the JSON data provided by the user
        try {
          const dummyButtons = JSON.parse(`[
            {
                "label": "Highlights",
                "action": "highlight",
                "data": "Highlight"
            },
            {
                "label": "Location",
                "action": "location",
                "data": "Location"
            },
            {
                "label": "Amenities",
                "action": "amenities",
                "data": "Amenities. Kids Play Area. Jogging Track | Gym"
            },
            {
                "label": "Map",
                "action": "map",
                "data": "<iframe src=\\"https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3357.4016555823405!2d77.70788457430174!3d12.900199816441223!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae133b960efefd%3A0xa8f045fff3993f82!2sEast%20park%20residences%20-%20Ramsons%20Trendsquares!5e1!3m2!1sen!2sin!4v1743418540211!5m2!1sen!2sin\\" width=\\"600\\" height=\\"450\\" style=\\"border:0;\\" allowfullscreen=\\"\\" loading=\\"lazy\\" referrerpolicy=\\"no-referrer-when-downgrade\\"></iframe>"
            }
        ]`);

          setButtons(dummyButtons);

          // Store the map data
          const mapButton = dummyButtons.find((btn) => btn.action === "map");
          if (mapButton && mapButton.data) {
            setMapData(mapButton.data);
          }

          const buttonMap = {};
          dummyButtons.forEach((btn) => {
            buttonMap[btn.action] = btn.data;
          });
          setButtonContent(buttonMap);

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
            buttons: dummyButtons,
          };

          setWebhook(null);
          setProjectLogo(dummyData.projectLogo);
          setProjectImages(dummyData.projectImages);
          setChatbotData(dummyData);

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
            {
              sender: "Bot",
              images: dummyData.projectImages,
              timestamp: new Date(),
            },
          ]);
        } catch (parseError) {
          console.error("Error parsing JSON buttons:", parseError);
          const defaultButtons = [
            { label: "Highlights", action: "highlight", data: "Highlight" },
            { label: "Location", action: "location", data: "Location" },
            { label: "Amenities", action: "amenities", data: "Amenities" },
            {
              label: "Map",
              action: "map",
              data: '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3357.4016555823405!2d77.70788457430174!3d12.900199816441223!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae133b960efefd%3A0xa8f045fff3993f82!2sEast%20park%20residences%20-%20Ramsons%20Trendsquares!5e1!3m2!1sen!2sin!4v1743418540211!5m2!1sen!2sin" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>',
            },
          ];
          setButtons(defaultButtons);

          // Store the map data
          const mapButton = defaultButtons.find((btn) => btn.action === "map");
          if (mapButton && mapButton.data) {
            setMapData(mapButton.data);
          }

          const buttonMap = {};
          defaultButtons.forEach((btn) => {
            buttonMap[btn.action] = btn.data;
          });
          setButtonContent(buttonMap);

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
            buttons: defaultButtons,
          };

          setWebhook(null);
          setProjectLogo(dummyData.projectLogo);
          setProjectImages(dummyData.projectImages);
          setChatbotData(dummyData);

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
            {
              sender: "Bot",
              images: dummyData.projectImages,
              timestamp: new Date(),
            },
          ]);
        }
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

  // FIX 8: Add condition to not show form if already submitted
  // Function to add the form inline in the chat
  const addInlineForm = () => {
    // Don't add the form if it's already been submitted
    if (formSubmitted) return;

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
        chatWindowRef.current.scrollTo({
          top: chatWindowRef.current.scrollHeight,
          behavior: "smooth",
        });
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

  // Handle successful form submission - UPDATED
  const handleFormSuccess = () => {
    try {
      // First remove the form from messages
      const filteredMessages = messages.filter((msg) => !msg.isInlineForm);

      // Then add success message with improved styling
      const updatedMessages = [
        ...filteredMessages,
        {
          sender: "Bot",
          text: "Thank you! Your details have been successfully submitted. Our team will get in touch with you soon.",
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
        id: "",
      });

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

      // Show error message if something goes wrong
      setMessages((prevMessages) => [
        ...prevMessages.filter((msg) => !msg.isInlineForm),
        {
          sender: "Bot",
          text: "We're sorry, there was an error submitting your details. Please try again.",
          timestamp: new Date(),
          isError: true,
        },
      ]);
    }
  };

  // Handle inline form submission - UPDATED
  const handleInlineFormSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitDisabled(true);

    try {
      // Validate phone number - ensure it has at least 10 digits
      if (leadData.phone.replace(/\D/g, "").length < 10) {
        setMessages((prevMessages) => [
          ...prevMessages.filter((msg) => !msg.isInlineForm),
          {
            sender: "Bot",
            text: "Please enter a valid phone number with at least 10 digits.",
            timestamp: new Date(),
            isError: true,
          },
          {
            isInlineForm: true,
          },
        ]);
        setIsSubmitDisabled(false);
        return;
      }

      // Create a dummy setMessages function that won't affect our chat
      const dummySetMessages = (msgs) => {
        console.log("Form submission processed");
        return msgs;
      };

      // Call the lead submit handler with proper parameters
      await handleLeadSubmit(
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
      handleFormSuccess();
    } catch (error) {
      console.error("Error submitting form:", error);

      // Show error message
      setMessages((prevMessages) => [
        ...prevMessages.filter((msg) => !msg.isInlineForm),
        {
          sender: "Bot",
          text: "We couldn't process your request. Please try again later.",
          timestamp: new Date(),
          isError: true,
        },
        {
          isInlineForm: true,
        },
      ]);

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

      // FIX 4: Better content formatting - Don't split sentences based on periods
      // Add a slight delay to simulate natural typing
      setTimeout(() => {
        // Instead of splitting on periods, we'll keep the text intact
        // and let CSS white-space: pre-line handle natural line breaks
        setMessages((prevMessages) => [
          ...prevMessages,
          { sender: "Bot", text: reply, score, timestamp: new Date() },
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

  // Handle button clicks - UPDATED for FIX 4 & 5
  const handleButtonClick = async (action, label) => {
    try {
      // Special handling for Map tab
      if (action === "map") {
        setActiveTab("Map");

        // Find if there is an existing map message in the chat
        const mapIndex = messages.findIndex((msg) => msg.map);

        if (mapIndex >= 0) {
          // Update map message index for scrolling
          setMapMessageIndex(mapIndex);

          // Add a small delay to ensure DOM is updated before scrolling
          setTimeout(() => {
            // Use a more specific selector with a unique id attribute for better targeting
            const mapMessage = document.getElementById(
              `map-message-${mapIndex}`
            );

            if (mapMessage && chatWindowRef.current) {
              // Use scrollIntoView with specific options for better positioning
              mapMessage.scrollIntoView({
                behavior: "smooth",
                block: "center", // Center the map in the viewport
              });

              // Alternative approach using the chatWindowRef directly if needed
              /*
              chatWindowRef.current.scrollTo({
                top: mapMessage.offsetTop - (chatWindowRef.current.clientHeight / 4),
                behavior: "smooth"
              });
              */
            }
          }, 300); // Increased timeout to ensure DOM updates are complete
        } else {
          // Find the map button to get the iframe data
          const mapButton = buttons.find((btn) => btn.action === "map");

          if (mapButton && mapButton.data) {
            setMessages((prevMessages) => {
              const newMessages = [
                ...prevMessages,
                {
                  sender: "Bot",
                  map: true,
                  mapHtml: mapButton.data,
                  timestamp: new Date(),
                },
              ];
              // Update map message index
              setMapMessageIndex(newMessages.length - 1);
              return newMessages;
            });

            // Add a delay to scroll to the newly added map
            setTimeout(() => {
              const mapMessages = document.querySelectorAll(
                ".modern-map-message"
              );
              if (mapMessages.length > 0) {
                mapMessages[mapMessages.length - 1].scrollIntoView({
                  behavior: "smooth",
                  block: "center",
                });
              }
            }, 500); // Longer delay for new map addition
          }
        }

        return;
      }

      // Handle the "no_brochure" action - FIX 5: After clicking "No", show other buttons
      if (action === "no_brochure") {
        setMessages((prevMessages) => [
          ...prevMessages,
          { sender: "User", text: label, timestamp: new Date() },
          {
            sender: "Bot",
            text: "No problem! What else would you like to know about our property?",
            timestamp: new Date(),
            buttons: buttons.filter((btn) =>
              ["highlight", "location", "amenities"].includes(btn.action)
            ),
          },
        ]);
        return;
      }

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

        // Set active tab based on button action
        if (["highlight", "location", "amenities"].includes(action)) {
          setActiveTab(label);
        }

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

  // Handle tab click
  const handleTabClick = (tab) => {
    setActiveTab(tab);

    // Find the corresponding button
    const tabButton = buttons.find((btn) => btn.label === tab);

    if (tabButton) {
      // Handle Map tab specially
      if (tabButton.action === "map") {
        handleButtonClick("map", tab);
      } else {
        handleButtonClick(tabButton.action, tab);
      }
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

  // IMPROVED: Enhanced logo rendering with better error handling
  const renderLogo = () => {
    if (projectLogo) {
      return (
        <div className="modern-logo-container">
          <img
            src={`https://assist-ai.propstory.com/${projectLogo}`}
            alt={chatbotData?.chatbotName || "Property Logo"}
            className="modern-chatbot-logo"
            onError={(e) => {
              // First try to load from direct URL if it's a full URL
              if (!projectLogo.startsWith("http")) {
                e.target.src = projectLogo;
                e.target.onerror = (e2) => {
                  // If that fails too, use the placeholder
                  e2.target.onerror = null;
                  e2.target.src =
                    "https://magicpage-dev.propstory.com/ImageUploads/VBHC%20Landscape/1nnx53gk0m7srs5pd.png";
                };
              } else {
                // Use placeholder directly
                e.target.onerror = null;
                e.target.src =
                  "https://magicpage-dev.propstory.com/ImageUploads/VBHC%20Landscape/1nnx53gk0m7srs5pd.png";
              }
            }}
          />
        </div>
      );
    } else {
      // Improved placeholder with background gradient
      return (
        <div className="modern-logo-container">
          <div className="modern-placeholder-logo">
            <span>{chatbotData?.chatbotName?.charAt(0) || "M"}</span>
          </div>
        </div>
      );
    }
  };

  // FIX 2: Improved image size rendering
  // UPDATED: Improved rendering of chat images with adjusted dimensions
  const renderChatImage = (img, idx) => {
    let imageUrl = "";
    // Simpler image URL handling
    if (typeof img === "string") {
      if (img.startsWith("http")) {
        imageUrl = img;
      } else {
        imageUrl = `https://assist-ai.propstory.com/${img}`;
      }
    } else {
      imageUrl = "https://via.placeholder.com/300x200?text=Project+Image";
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
            "https://via.placeholder.com/300x200?text=Image+Not+Found";
        }}
      />
    );
  };

  // FIX 6: Improved phone field padding
  // UPDATED: Render inline form component with close button and improved phone field
  const renderInlineForm = () => {
    return (
      <div className="modern-inline-form">
        <div className="modern-form-header">
          <button
            className="modern-form-close-button"
            onClick={() => {
              // Remove form from messages
              setMessages((prevMessages) =>
                prevMessages.filter((msg) => !msg.isInlineForm)
              );
              setInlineFormVisible(false);
            }}
            aria-label="Close form"
          >
            <X size={16} />
          </button>
          <h3>{msgFromResponse || "Please share your details:"}</h3>
        </div>

        <form className="modern-contact-form" onSubmit={handleInlineFormSubmit}>
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

          <div className="modern-form-group phone-input-group">
            <label htmlFor="phone">Phone Number</label>
            <PhoneInput
              country={"in"}
              value={leadData.phone}
              onChange={(phone) => setLeadData({ ...leadData, phone })}
              inputProps={{
                required: true,
                id: "phone",
                placeholder: "Enter your mobile number",
                className: "enhanced-phone-input",
              }}
              containerClass="phone-input-container"
              inputClass="phone-input"
              buttonClass="phone-select-button"
              dropdownClass="phone-dropdown"
              // Remove validation by setting isValid to always return true
              isValid={() => true}
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

  // FIX 4: Modified to render Yes & No buttons in a single row
  const renderYesNoButtons = (buttons) => {
    if (!buttons || buttons.length !== 2) return null;

    // Check if buttons are Yes & No options
    const isYesNoButtons =
      (buttons[0].label.toLowerCase().includes("yes") &&
        buttons[1].label.toLowerCase().includes("no")) ||
      (buttons[0].action === "brochure" && buttons[1].action === "no_brochure");

    if (!isYesNoButtons) return null;

    return (
      <div className="modern-yesno-buttons">
        {buttons.map((button, idx) => (
          <motion.button
            key={idx}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className={`modern-yesno-button ${
              button.action === "brochure" ? "yes-button" : "no-button"
            }`}
            onClick={() => handleButtonClick(button.action, button.label)}
          >
            {button.action === "brochure" ? (
              <>
                <ThumbsUp size={14} className="button-icon" /> {button.label}
              </>
            ) : (
              <>
                <ThumbsDown size={14} className="button-icon" /> {button.label}
              </>
            )}
          </motion.button>
        ))}
      </div>
    );
  };

  // Get the tab buttons from the full buttons array
  const getTabButtons = () => {
    return buttons.filter((btn) =>
      ["highlight", "location", "amenities", "map"].includes(btn.action)
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
                {/* {renderLogo()} */}
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
            {/* IMPROVED: Enhanced Header with Better Logo Styling */}
            {/* Revised Header Layout - Logo next to 3 dots */}
            <div className="modern-header-redesigned">
              <div className="modern-header-content">
                {/* Title and Status Section - Left side */}
                <div className="modern-header-title">
                  <h3>{chatbotData?.chatbotName || "AI Assistant"}</h3>
                  <span className="modern-status">
                    <span className="modern-status-dot"></span>
                    Online
                  </span>
                </div>

                {/* Spacer div to create gap between title and logo/menu */}
                <div className="modern-header-spacer"></div>

                {/* Right side container for Logo and Actions */}
                <div className="modern-header-right">
                  {/* Logo Section with white background */}
                  <div className="modern-logo-container modern-logo-white-bg">
                    {projectLogo ? (
                      <img
                        src={`https://assist-ai.propstory.com/${projectLogo}`}
                        alt={chatbotData?.chatbotName || "Property Logo"}
                        className="modern-chatbot-logo"
                        onError={(e) => {
                          // First try to load from direct URL if it's a full URL
                          if (!projectLogo.startsWith("http")) {
                            e.target.src = projectLogo;
                            e.target.onerror = (e2) => {
                              // If that fails too, use the placeholder
                              e2.target.onerror = null;
                              e2.target.src =
                                "https://magicpage-dev.propstory.com/ImageUploads/VBHC%20Landscape/1nnx53gk0m7srs5pd.png";
                            };
                          } else {
                            // Use placeholder directly
                            e.target.onerror = null;
                            e.target.src =
                              "https://magicpage-dev.propstory.com/ImageUploads/VBHC%20Landscape/1nnx53gk0m7srs5pd.png";
                          }
                        }}
                      />
                    ) : (
                      <div className="modern-placeholder-logo">
                        <span>
                          {chatbotData?.chatbotName?.charAt(0) || "M"}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons Section */}
                  <div className="modern-header-actions">
                    <div className="modern-dropdown">
                      <button
                        className="modern-icon-button"
                        onClick={() => setIsOpen(!isOpen)}
                        aria-label="Menu"
                      >
                        <MoreVertical size={22} />
                      </button>
                      {isOpen && (
                        <div className="modern-dropdown-menu">
                          <button
                            onClick={() => {
                              const phoneNumber =
                                chatbotData?.phone || "+91 86683 71594";
                              window.open(
                                `https://wa.me/${phoneNumber}`,
                                "_blank"
                              );
                              setIsOpen(false);
                            }}
                          >
                            <ExternalLink size={16} />
                            <span>Send details via WhatsApp</span>
                          </button>
                          <button
                            onClick={() => {
                              handleRateChat();
                              setIsOpen(false);
                            }}
                          >
                            <MessageSquare size={16} />
                            <span>Contact Support</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
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
                  // Handle regular messages with text, images, or buttons
                  if (
                    message.text ||
                    message.images?.length ||
                    message.buttons?.length
                  ) {
                    // Check if this is a message with yes/no buttons
                    const hasYesNoButtons =
                      message.buttons &&
                      message.buttons.length === 2 &&
                      ((message.buttons[0].label
                        .toLowerCase()
                        .includes("yes") &&
                        message.buttons[1].label
                          .toLowerCase()
                          .includes("no")) ||
                        (message.buttons[0].action === "brochure" &&
                          message.buttons[1].action === "no_brochure"));

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
                        } ${message.isSuccess ? "modern-success-message" : ""}
                          ${message.isError ? "modern-error-message" : ""}`}
                      >
                        {/* Text Message */}
                        {message.text && (
                          <div className="modern-message-bubble">
                            {message.text}
                          </div>
                        )}

                        {/* Image Message - UPDATED to use the new renderChatImage function */}
                        {message.images && message.images.length > 0 && (
                          <div className="modern-image-gallery">
                            {message.images.map((img, idx) =>
                              renderChatImage(img, idx)
                            )}
                          </div>
                        )}

                        {/* FIX 4: Yes/No Buttons in one row if applicable */}
                        {hasYesNoButtons
                          ? renderYesNoButtons(message.buttons)
                          : /* Regular Button Options */
                            message.buttons &&
                            message.buttons.length > 0 && (
                              <div className="modern-button-options">
                                {message.buttons.map((button, idx) => (
                                  <motion.button
                                    key={idx}
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    className="modern-option-button"
                                    onClick={() =>
                                      handleButtonClick(
                                        button.action,
                                        button.label
                                      )
                                    }
                                  >
                                    {button.action === "brochure" ? (
                                      <>
                                        <Download
                                          size={14}
                                          className="button-icon"
                                        />{" "}
                                        {button.label}
                                      </>
                                    ) : button.action === "no_brochure" ? (
                                      <>
                                        <ThumbsDown
                                          size={14}
                                          className="button-icon"
                                        />{" "}
                                        {button.label}
                                      </>
                                    ) : (
                                      button.label
                                    )}
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
                  // Handle map message
                  else if (message.map) {
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="modern-message modern-bot-message modern-map-message"
                        id={`map-message-${index}`}
                      >
                        <div className="modern-message-map">
                          {/* Use the HTML from the map data directly */}
                          <div
                            className="modern-iframe-container"
                            dangerouslySetInnerHTML={{
                              __html: message.mapHtml,
                            }}
                          />
                        </div>
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

            {/* Tabs for Highlights, Location, Amenities, Map */}
            <div className="modern-chat-tabs">
              {getTabButtons().map((button) => (
                <button
                  key={button.action}
                  className={`modern-tab-button ${
                    activeTab === button.label ? "active" : ""
                  }`}
                  onClick={() => handleTabClick(button.label)}
                >
                  {button.label}
                </button>
              ))}
              <button
                className={`modern-tab-button ${
                  activeTab === "Contact" ? "active" : ""
                }`}
                onClick={() => {
                  handleButtonClick("get_callback", "Get a Call Back");
                  setActiveTab("Contact");
                }}
              >
                Contact
              </button>
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

                {/* FIX 5: Larger send button */}
                <button
                  className={`modern-send-button ${
                    !input.trim() || isButtonDisabled ? "disabled" : ""
                  }`}
                  onClick={handleSendMessage}
                  disabled={!input.trim() || isButtonDisabled}
                  aria-label="Send message"
                >
                  <Send size={24} />
                </button>
              </div>
              {/* <div className="modern-powered-by">
                Powered by{" "}
                <Link
                  className="modern-powered-link"
                  to="https://propstory.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Propstory
                </Link>
              </div> */}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ModernChatbotWidget;
