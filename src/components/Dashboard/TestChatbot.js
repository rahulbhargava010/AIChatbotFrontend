import React, { useState, useEffect, useRef } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import axios from "axios";
import "./TestChatbot.css";
import { v4 as uuidv4 } from "uuid";
import { SketchPicker } from "react-color";
import api from "../config/axios";
import ChatbotRating from "./ChatbotRating";
import handleLeadSubmit from "../config/handleLeadSubmit";
import { Mic, Send } from "lucide-react";
import { FirstScreen } from "./FirstScreen";

import chatbotThemes from "../config/chatbotThemes";
import { Form } from "react-bootstrap";
import { motion } from "framer-motion";

const TestChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const { chatbotId } = useParams();
  const [messages, setMessages] = useState([]);
  const [embedScript, setEmbedScript] = useState('');
  const [webhook, setWebhook] = useState("");
  const [projectLogo, setProjectLogo] = useState([]);
  const [projectImages, setProjectImages] = useState([]);
  const [input, setInput] = useState("");
  const chatWindowRef = useRef(null);
  const [buttons] = useState([
    { label: "Highlights", action: "highlight" },
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
  const [leadData, setLeadData] = useState({ name: "", phone: "", email: "" });
  const [chatbotData, setChatbotData] = useState(null);
  const [sessionId, setSessionId] = useState("");
  const [conversation, setConversation] = useState("");
  const [formSubmitted, setFormSubmitted] = useState(false);  // Add this state
  const [checkedItems, setCheckedItems] = useState({
    option1: false,
    option2: false,
  });
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
    if (isMobile) {
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
    setIsRecording(!isRecording);
    // Add voice recording logic here
  };

  const handleSend = () => {
    console.log("Message sent:", message);
    setMessage("");
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
    }, 5000); // 5 seconds

    return () => clearTimeout(timer); // Cleanup timer on unmount
  }, []);


  useEffect(() => {
    const interval = setInterval(() => {
      if (!formVisible && !isTyping) {
        setFormVisible(true);
        // setChatVisible(false);
      }
    }, 200000); // Runs every 10 seconds

    return () => clearInterval(interval); // Cleanup on unmount
  }, [formVisible, isTyping]);


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
    setShowRating(true); // Show full-height rating component
  };

  const handleFeedbackSubmit = (feedback) => {
    console.log("User Feedback:", feedback);
    setShowRating(false); // Hide rating after submission
  };

  // const handleSendMessage = async () => {
  //   // console.log('Send Message check check', chatbotId);
  //   if (!input.trim()) return;
  //   // console.log('Send Message check check', input);

  //   setMessages((prevMessages) => [
  //     ...prevMessages,
  //     { sender: "User", text: input },
  //   ]);

  //   try {
  //     setIsTyping(true);
  //     const token = localStorage.getItem("token");
  //     const response = await api.post(
  //       "/aichatbots/respond",
  //       { chatbotId, message: input }
  //       // {
  //       //     headers: {
  //       //         Authorization: `Bearer ${token}`,
  //       //     },
  //       // }
  //     );
  //     console.log("chatbot response from Test Chatbot", response);
  //     const { reply, score } = response.data;
  //     // setChatHistory([...chatHistory, { user: message, bot: response.data.reply }]);
  //     setMessages((prevMessages) => [
  //       ...prevMessages,
  //       { sender: "Bot", text: reply, score },
  //     ]);
  //     setIsTyping(false);
  //     await api.post("analytics/saveEvent", {
  //       eventType: "chat_message",
  //       sessionId: uniqueSessionId,
  //       messages,
  //       chatbotId,
  //     });
  //   } catch (err) {
  //     console.error("Failed to send message:", err);
  //     setMessages((prevMessages) => [
  //       ...prevMessages,
  //       { sender: "Bot", text: "Sorry, something went wrong." },
  //     ]);
  //   }
  //   saveConversation(sessionId);
  //   setInput("");
  // };


  const handleSendMessage = async () => {
    if (!input.trim()) return;
  
    setMessages((prevMessages) => [
      ...prevMessages,
      { sender: "User", text: input },
    ]);
  
    try {
      setIsTyping(true);
      const response = await api.post("/aichatbots/respond", {
        chatbotId,
        message: input,
      });
  
      console.log("chatbot response from Test Chatbot", response);
      const { reply, score } = response.data;
  
      // Ensure period stays on the same line
      const formattedReply = reply.replace(/\.([^\n])/g, ".\n$1");
  
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: "Bot", text: formattedReply, score },
      ]);
  
      setIsTyping(false);
  
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
        { sender: "Bot", text: "Sorry, something went wrong." },
      ]);
    }
  
    saveConversation(sessionId);
    setInput("");
  };

  
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Prevent default form submission behavior
      handleSendMessage();
    }
  };

  // const handleColorChange = (color) => {
  //     setSelectedColor(color.hex);
  // };

  // const handleTextColorChange = (color) => {
  //     setSelectedTextColor(color.hex);
  // };

  // const handleBubbleColorChange = (color) => {
  //     setSelectedBubbleColor(color.hex);
  // };

  useEffect(() => {
    // Assign a unique session ID per user/session
    setSessionId(storedSessionId);
    sessionStorage.setItem("chatbotSessionId", storedSessionId);
    // Auto-save conversation every 10 seconds
    const interval = setInterval(() => {
      const hasUserMessage = messages.some(msg => msg.sender === "User")
      if(hasUserMessage) {
        saveConversation(storedSessionId);
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [messages]);

  // Save chat message to backend
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


  // const callLeadSubmit = (e, leadData,
  //   chatbotId,
  //   conversation,
  //   uniqueSessionId,
  //   messages,
  //   api) => {
  //   e.preventDefault();
  
  //   console.log("leadData", leadData);
  //   console.log("chatbotId", chatbotId);
  //   console.log("conversation", conversation);
  //   console.log("messages", messages);
  //   console.log("api", api);
  //   handleLeadSubmit();
  //   // callLeadSubmit()
  //   // Simulate API call success
  //   setTimeout(() => {
  //     setFormSubmitted(true);
  
  //     setLeadData({
  //       name: "",
  //       phone: "",
  //       email: "",
  //     });
  //     setCheckedItems({
  //       option1: false,
  //       option2: false,
  //     });
      
      
  //     // Hide success message after 3 seconds
  //     setTimeout(() => {
  //       setFormSubmitted(false);
  //       setFormVisible(false);
  //       setChatVisible(true);
  //     }, 3000);
  //   }, 1000);
  // };
  

  //   const handleLeadSubmit = async (e) => {
  //     e.preventDefault();
  //     console.log("handleLeadSubmit function called");

  //     try {
  //       const userAgent = navigator.userAgent;
  //       const device = /mobile/i.test(userAgent) ? "Mobile" : "Desktop";

  //       console.log("Fetching IP address...");
  //       const ipResponse = await axios.get("https://api.ipify.org?format=json");
  //       console.log("IP Response:", ipResponse.data);

  //       const ipAddress = ipResponse.data.ip;

  //       let locationData = {};
  //       try {
  //         console.log("Fetching Geolocation...");
  //         const geoResponse = await axios.get(
  //           `https://ipapi.co/${ipAddress}/json/`
  //         );
  //         console.log("Geolocation Response:", geoResponse.data);

  //         locationData = {
  //           country: geoResponse.data.country_name,
  //           region: geoResponse.data.region,
  //           city: geoResponse.data.city,
  //         };
  //       } catch (error) {
  //         console.error("Error fetching geolocation data:", error);
  //       }

  //       const updatedLeadData = {
  //         ...leadData,
  //         ipAddress,
  //         userAgent,
  //         device,
  //         locationData,
  //       };

  //       console.log("LeadData before API call:", updatedLeadData); // Check lead data before API call

  //       console.log("Saving lead data...");
  //       await api.post("/leads/save", {
  //         chatbotId,
  //         leadData: updatedLeadData,
  //         conversation,
  //       });
  //       console.log("Lead data saved successfully!");

  //       alert("Lead saved successfully!");
  //       setMessages((prevMessages) => [
  //         ...prevMessages,
  //         {
  //           sender: "Bot",
  //           text: `Thank you, ${leadData.name}, for submitting your enquiry!`,
  //         },
  //       ]);
  //       setFormVisible(false);

  //       console.log("Saving analytics event...");
  //       await api.post("analytics/saveEvent", {
  //         eventType: "form_submission",
  //         sessionId: uniqueSessionId,
  //         messages,
  //         chatbotId,
  //         leadData: updatedLeadData,
  //       });
  //       console.log("Analytics event saved!");
  //     } catch (error) {
  //       console.error("Error in handleLeadSubmit:", error);
  //       alert("Failed to save lead.");
  //     }
  //   };

  useEffect(() => {
      const timer = setTimeout(() => {
          setChatVisible(true);
      }, 500);

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

      if (
        ["schedule_site_visit", "get_callback", "brochure"].includes(action)
      ) {
        setFormType(action);

        setFormVisible(true);

        // setFormAction(webhook)

        // setChatVisible(false);
      } else {
        setFormVisible(false);

        setChatVisible(true);

        if (buttonContent[action])
          setMessages((prevMessages) => [
            ...prevMessages,
            { sender: "User", text: label },
            { sender: "Bot", text: buttonContent[action] },
          ]);
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
    projectImages: ["https://magicpage-dev.propstory.com/ImageUploads/VBHC%20Landscape/1nnx53wlrm7yizlva.jpg"],
    chatbotName: "PropBot",
    projectLogo: "/default-logo.png",
    buttons: [
      { label: "Site Visit Schedule", action: "schedule_site_visit" },
      { label: "Brochure", action: "brochure" },
      { label: "Location Map", action: "get_callback" },
    ],
  };
  
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
  
        // ✅ If API response is empty or missing, use dummyData
        const data = response?.data && Object.keys(response.data).length > 0 ? response.data : dummyData;
  
        console.log("Welcome in project greeting 12: ", response);
  
        setWebhook(data.webhook);
        setProjectLogo(data.projectLogo);
        setProjectImages(data.projectImages);
        setChatbotData(data);
        setButtonContent(data.buttons || {});
  
        const buttonMap = {};
        (data.buttons || []).forEach((btn) => {
          buttonMap[btn.action] = btn.data || {};
        });
  
        setButtonContent(buttonMap);
  
        setMessages([
          { sender: "Bot", text: data.greeting?.trim() || "" },
          { sender: "Bot", text: data.chatbotGreeting?.trim() || "" },
          { sender: "Bot", text: data.projectHighlights?.trim() || "" },
          { images: data.projectImages || [] },
          { buttons: data.buttons || [] },
        ]);
        
      } catch (err) {
        console.error("Error fetching welcome data:", err);
  
        // ✅ If API fails, set dummy data
        setWebhook(dummyData.webhook);
        setProjectLogo(dummyData.projectLogo);
        setProjectImages(dummyData.projectImages);
        setChatbotData(dummyData);
        setButtonContent(dummyData.buttons || {});
  
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
  
  
  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages]);


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
  const generateEmbedScript = () => {
    const script = `
                <script>
                (function() {
                    const iframe = document.createElement('iframe');
                    iframe.src = 'https://assest-ai.propstory.com/chatbot-widget/679b2c0b101d48795ab7a4e2';
                    iframe.style.position = 'fixed';
                    iframe.style.bottom = '20px';
                    iframe.style.right = '20px';
                    iframe.style.width = '400px';
                    iframe.style.height = '600px';
                    iframe.style.border = 'none';
                    iframe.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
                    iframe.style.borderRadius = '10px';
                    iframe.style.overflow = 'hidden';
                    iframe.style.zIndex = '1000';
                    iframe.style.display = 'none';
                    iframe.id = 'chatbot-widget';
                    document.body.appendChild(iframe);
            
                    setTimeout(() => {
                        iframe.style.display = 'block';
                    }, 10000);
            
                    var toggleButton = document.createElement('button');
                    toggleButton.innerText = 'Chat';
                    toggleButton.style.position = 'fixed';
                    toggleButton.style.bottom = '20px';
                    toggleButton.style.right = '20px';
                    toggleButton.style.padding = '10px 15px';
                    toggleButton.style.background = '#34b7f1';
                    toggleButton.style.color = 'white';
                    toggleButton.style.border = 'none';
                    toggleButton.style.borderRadius = '20px';
                    toggleButton.style.cursor = 'pointer';
                    toggleButton.style.zIndex = '1001';
            
                    toggleButton.onclick = function() {
                        var chatbotIframe = document.getElementById('chatbot-widget');
                        if (chatbotIframe.style.display === 'none') {
                            chatbotIframe.style.display = 'block';
                            chatbotIframe.style.width = window.innerWidth <= 768 ? '100%' : '350px';
                            chatbotIframe.style.height = window.innerWidth <= 768 ? '100%' : '500px';
                            chatbotIframe.style.bottom = window.innerWidth <= 768 ? '0' : '20px';
                            chatbotIframe.style.right = window.innerWidth <= 768 ? '0' : '20px';
                        } else {
                            chatbotIframe.style.display = 'none';
                        }   
                    };
                    document.body.appendChild(toggleButton);
                })();
            </script>
        `;
    setEmbedScript(script);
  };

  return (
    <div
      className="chatbot-wrapper-test"
      style={{
        position: "fixed ",
        bottom: "10px ",
        right: "10px",
        zIndex: 100000,
      }}
    >
      {/* <div className="color-picker-wrapper">
                <button onClick={() => setShowColorPicker(!showColorPicker)}>Customize Theme</button>
                {showColorPicker && (
                    <div className="color-picker">
                        <p>Background Color:</p>
                        <SketchPicker color={selectedColor} onChangeComplete={handleColorChange} />
                        <p>Text Color:</p>
                        <SketchPicker color={selectedTextColor} onChangeComplete={handleTextColorChange} />
                        <p>Bubble Color:</p>
                        <SketchPicker color={selectedBubbleColor} onChangeComplete={handleBubbleColorChange} />
                    </div>
                )}
            </div> */}
     <div
      className={`test-chatbot-container1 chatbot-container ${
        isFullScreen ? "full-screen" : ""
      }`}
    >
      {/* Full-screen button (Visible only on mobile) */}
     
      
            {formVisible && (
  <div className="chatbot-form-overlay1" style={{ zIndex: "10" , width: "fit-content"}}>
    <div className="chatbot-form-container1 vh-100 window_bg_pink">
      <button
        className="close-button1"
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
          <svg className="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
              <circle className="checkmark__circle" cx="26" cy="26" r="25" fill="none" />
              <path className="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
            </svg>
            <h4>THANK YOU!</h4>
          <p>We've received your submission, and we'll be in touch soon!</p>
            
          </div>
         
        </div>
      ) : (
        <>
          <div className="text-center mt-4 mobile">
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
            <h3 className="text-center mt-4">Please Introduce Yourself:</h3>
          </div>

          <form
            className="chatbot-form my-4"
            onSubmit={async (e) =>
             handleLeadSubmit(
                e,
                leadData,
                chatbotId,
                conversation,
                setMessages,
                setFormVisible,
                setFormSubmitted,
                setChatVisible,
                setIsTyping,
                uniqueSessionId,
                messages,
                api,
                
              )
            }
            onFocus={() => setIsTyping(true)}
            onBlur={() => setIsTyping(false)}
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
                value={leadData.phone} // ✅ Corrected
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
                value={leadData.email} // ✅ Corrected
                onChange={(e) =>
                  setLeadData({ ...leadData, email: e.target.value })
                }
              />
            </div>

            {/* Checkboxes */}
            <div className="align-items-center">
              <Form.Check
                type="checkbox"
                id="checkbox1"
                name="option1"
                label={`\u00A0 I allow ${chatbotData?.name} call center to call me on this number for  \u00A0\u00A0sales and support activities`}
                checked={checkedItems.option1}
                onChange={handleChange}
              />
            </div>

            <div>
              <Form.Check
                type="checkbox"
                id="checkbox2"
                name="option2"
                label={`\u00A0 Sign up for our newsletter`}
                checked={checkedItems.option2}
                onChange={handleChange}
              />
            </div>

            {/* Submit Button */}
            <button type="submit" className="btn btn-primary w-100">
              SUBMIT
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
              <FirstScreen setShowFirstScreen={setShowFirstScreen}/>
            ) : (
              <>
                {/* <button
  className="close_button"
  onClick={() => setChatVisible(false)} // Hide chatbot
>
  ×
</button> */}
 {showRating && <ChatbotRating onSubmit={handleFeedbackSubmit} onClose={() => setShowRating(false)} />}
                <div className="d-flex header p-2 justify-content-between align-items-center">
                  {/* <div>
                <img
                      className="chatbot-logo-img"
                      src="https://magicpage-dev.propstory.com/ImageUploads/VBHC%20Landscape/1nnx53gk0m7srs5pd.png"
                      // src={`https://assist-ai.propstory.com/${chatbotData.projectLogo}`}
                      alt="Project Logo"
                      height="50"
                      width="60"
                    />
                </div> */}
                  {chatbotData?.projectLogo && (
                    <div className="chatbot-logo d_flex">
                      <img
                        className="chatbot-logo-img"
                        src="https://magicpage-dev.propstory.com/ImageUploads/VBHC%20Landscape/1nnx53gk0m7srs5pd.png"
                        // src={`https://assist-ai.propstory.com/${chatbotData.projectLogo}`}
                        alt="Project Logo"
                        height="50"
                        width="60"
                      />

<div className="py-2 text-left ms-2">
                    <h4 className="title">
                    {chatbotData?.chatbotName} Help Desk
                    </h4>
                    <small>
                      <span className="d-block pt-2">
                        {" "}
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

                    {/* <p className="subtitle">
                    How can I help you today {chatbotData?.name}?
                  </p> */}
                  </div>
                    </div>
                  )}
                

                  <div className="relative py-2">
                  {isMobile && (
        <button className="fullscreen-toggle1" onClick={toggleFullScreen}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="black"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 3h6v2H5v4H3V3zM15 3h6v6h-2V5h-4V3zM3 15h2v4h4v2H3v-6zM21 15v6h-6v-2h4v-4h2z" />
        </svg>
      </button>
        // <button className="fullscreen-toggle1" onClick={toggleFullScreen}>
        //   {isFullScreen ? "Exit Fullscreen" : "Full Screen"}
        // </button>
      )}
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
                          <li onClick={() => setIsOpen(false)}>Talk to Human</li>
                          <li onClick={() => { handleRateChat(); setIsOpen(false); }}>Rate this Chat</li>
                          <li onClick={() => setIsOpen(false)}>Send details over WhatsApp</li>
                        </ul>
                      </div>
                    )}
                  </div>
                  {/* <div
                    className="fw-bold close_button"
                    style={{ cursor: "pointer", color: "#000" }}
                    onClick={() => setChatVisible(false)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      width="22"
                      height="22"
                    >
                      <path
                        d="M6 6L18 18M6 18L18 6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div> */}
                </div>
              
                <div className="chat-window p-4 mb-3 border rounded scrollbar" id="style-8" ref={chatWindowRef}>
      {messages?.map((message, index) => {
        const hasContent =
          message.text ||
          message.images?.length ||
          message.buttons?.length; 

        return hasContent ? (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }} // Start slightly below
            animate={{ opacity: 1, y: 0 }} // Move up and become visible
            transition={{ duration: 0.5, delay: index * 0.1 }} // Stagger effect
            className={`message ${message.sender === "User" ? "user-message" : "bot-message"}`}
          >
            <div className={`message ${message.sender === "User" ? "user-message" : "bot-message"}`}>
              
              {/* ✅ Text Message */}
              {message.text && (
                <div className="message-bubble"
                  style={{
                    backgroundColor: "rgb(231 218 243 / 51%)",
                    boxShadow: "2px 2px 8px rgba(0, 0, 0, 0.2)",
                    borderRadius: "10px",
                    padding: "10px",
                    maxWidth: "80%",
                    width: "100%",
                    margin: "5px 0",
                    border: "2px solid rgb(255, 255, 255)",
                    fontSize: "14px",
                    textAlign: "left",
                  }}>
                  {message.text.split('.').filter(sentence => sentence.trim() !== "").map((sentence, idx) => (
  <p key={idx}>{sentence.trim()}</p>
))}

                </div>
              )}

              {/* ✅ Image Message */}
              {message?.images && message?.images?.length > 0 && (
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
                      onError={(e) => (e.target.style.display = "none")} // Hide broken images
                    />
                  ))}
                </div>
              )}

              {/* ✅ Buttons */}
              {/* ✅ Buttons */}
{message?.buttons && (
  <div className="d-flex flex-wrap justify-content-evenly text-center gap-2">
    {message.buttons.map((button, idx) => (
      <a
        key={idx}
        onClick={() => handleButtonClick(button.action, button.label)}
        className="button-53"
        style={{ minWidth: "150px" }} // Ensures buttons don’t shrink too much
      >
        {button.label}
      </a>
    ))}
  </div>
)}

            </div>
          </motion.div>
        ) : null;
      })}

      {/* ✅ Typing Animation */}
      {isTyping && (
        <div className="message bot-message">
          <div className="message-bubble typing-animation">
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
          </div>
        </div>
      )}
    </div>

                {/* <div
                className="chat-window p-4 mb-3 border rounded scrollbar" id="style-8"
                ref={chatWindowRef}
              >
               
                {messages?.map((message, index) => (
                  <div
                    key={index}
                    className={`message ${
                      message.sender === "User" ? "user-message" : "bot-message"
                    }`}
                  >
                    {message.sender && (
  <div
    className="message-bubble"
    style={{
      backgroundColor: "rgba(252, 247, 251, 0.64)",
      boxShadow: "2px 2px 10px rgba(0, 0, 0, 0.2)",
      borderRadius: "10px",
      padding: "10px",
      maxWidth: "80%",
      width: "100%",
      margin: "5px 0",
      border: "2px solid rgb(255, 255, 255)",
      fontSize: "13px",
      textAlign: "left", // ✅ This will now apply correctly
    }}
  >
    {message.text}
  </div>
)}

                    {message.images &&
                      message.images.map((img, idx) => (
                        <img
                          key={idx}
                          className="chatbot-logo-img"
                          src={`https://assist-ai.propstory.com/${img}`}
                          alt="Project Logo"
                          height="200"
                          width="200"
                          style={{ borderRadius: "10%", marginRight: "10px", marginBottom:"2rem" }}
                        />
                      ))}
                    {message.buttons &&
                      message.buttons.map((button, idx) => (
                        <a
                          key={idx}
                          onClick={() =>
                            handleButtonClick(button.action, button.label)
                          }
                          className="button-52"
                        >
                          {button.label}
                        </a>
                      ))}
                  </div>
                ))}
                {isTyping && (
                  <div className="message bot-message">
                    <div className="message-bubble typing-animation">
                      <span className="dot"></span>
                      <span className="dot"></span>
                      <span className="dot"></span>
                    </div>
                  </div>
                )}
              </div> */}

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

                {/* <div className="flex items-center p-2 rounded-full shadow-md w-96 justify-content-between">
     <div className="mic_div d-flex justify-content-around">
     <button
        onClick={handleRecord}
        className={`p-1 mt-0 bg-transparent text-dark rounded-full ${isRecording ? "bg-red-500" : "bg-gray-200"}`}
      >
        <Mic className="w-4 h-4 text-gray-700" />
      </button>
      <input
                type="text"
                placeholder="Enter a prompt here"
               className="flex-1 p-1 text-sm w-90 border-0 outline-none bg-transparent"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                required
                style={{marginLeft:"-2.5rem"}}
              />
              <a
                id="send-message-button"
                className="icon material-symbols-rounded"
                
              >
                <button
        className="p-1 mt-0 bg-black rounded-5 bg_pink text-dark"
      >
        <Send className="w-2 h-2" />
      </button>
              </a>
     </div>
    </div> */}

                <div className="typing-area window_bg_pink">
                  <div className="typing-form">
                    <div className="input-wrapper form-control chat-input d-flex align-items-center">
                      <button
                        onClick={handleRecord}
                        className={`p-1 mt-0 bg-transparent text-dark rounded-full ${
                          isRecording ? "bg-red-500" : "bg-gray-200"
                        }`}
                      >
                        <Mic className="w-4 h-4 text-gray-700" />
                      </button>
                      <input
                        type="text"
                        placeholder="Enter a prompt here"
                        className="typing-input"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        required
                      />
                      <a
                        id="send-message-button"
                        className="icon material-symbols-rounded send-button p-0"
                        onClick={handleSendMessage}
                      >
                        <button className="p-1 mt- bg-black rounded-5 bg_pink text-dark">
                          <Send className="w-2 h-2" />
                        </button>
                      </a>
                    </div>
                  </div>
                  <div>
                    <small>
                      Powered by{" "}
                      <Link
                        className="text-primary fw-bold ps-1"
                        to="https://propstory.in/"
                        target="_blank"
                      >
                        Propstory
                      </Link>
                    </small>
                  </div>
                  {/* <div className="action-buttons">
                        <span id="theme-toggle-button" className="icon material-symbols-rounded">light_mode</span>
                        <span id="delete-chat-button" className="icon material-symbols-rounded">delete</span>
                    </div>
                    <p className="disclaimer-text">
                    Gemini may display inaccurate info, including about people, so double-check its responses.
                    </p> */}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TestChatbot;
