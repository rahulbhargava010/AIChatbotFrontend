import React, { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "react-router-dom";
import axios from "axios";
import "./TestChatbot.css";
import "./ChatbotWidget.css";
import api from "../config/axios";
import handleLeadSubmit from "../config/handleLeadSubmit";
import { Mic, Send } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { SketchPicker } from "react-color";
import chatbotThemes from "../config/chatbotThemes";
import { FirstScreen } from "./FirstScreen";
// import { Send } from "lucide-react";

const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

const TestChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const { chatbotId } = useParams();
  const [messages, setMessages] = useState([]);
  // const [embedScript, setEmbedScript] = useState('');
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
    { label: "Get a Call Back", action: "get_callback" },
  ]);

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
    }, 2000); // 5 seconds

    return () => clearTimeout(timer); // Cleanup timer on unmount
  }, []);

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

  const handleSendMessage = async () => {
    // console.log('Send Message check check', chatbotId);
    if (!input.trim()) return;
    // console.log('Send Message check check', input);

    setMessages((prevMessages) => [
      ...prevMessages,
      { sender: "User", text: input },
    ]);

    try {
      setIsTyping(true);
      const token = localStorage.getItem("token");
      const response = await api.post(
        "/aichatbots/respond",
        { chatbotId, message: input }
        // {
        //     headers: {
        //         Authorization: `Bearer ${token}`,
        //     },
        // }
      );
      console.log("chatbot response from Test Chatbot", response);
      const { reply, score } = response.data;
      // setChatHistory([...chatHistory, { user: message, bot: response.data.reply }]);
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: "Bot", text: reply, score },
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
      saveConversation(storedSessionId);
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

  // useEffect(() => {
  //     const timer = setTimeout(() => {
  //         setChatVisible(true);
  //     }, 10000);

  //     return () => clearTimeout(timer);
  // }, []);

  const handleButtonClick = async (action, label) => {
    try {
      const token = localStorage.getItem("token");

      if (
        ["schedule_site_visit", "get_callback", "brochure"].includes(action)
      ) {
        setFormType(action);

        setFormVisible(true);

        // setFormAction(webhook)

        setChatVisible(false);
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
        } = response.data;
        // console.log('Welcome in project greeting: ' + response.data)
        setWebhook(webhook);
        setProjectLogo(projectLogo);
        setProjectImages(projectImages);
        setChatbotData(response.data);
        // setButtonContent(buttons || {});
        const buttonMap = {};
        // console.log('Welcome in project buttons: ', buttons);
        const buttonList = buttons.map((btn) => {
          buttonMap[btn.action] = btn.data;
          // return { label: btn.label, action: btn.action };
        });

        // setButtons(buttonList);

        setButtonContent(buttonMap);
        // console.log('Welcome in project buttons: buttonMap', buttonMap);
        // console.log('Welcome in project buttons: buttonList', buttonList);
        // Set initial messages and buttons chatbotGreeting
        setMessages([
          { sender: "Bot", text: greeting },
          { sender: "Bot", text: chatbotGreeting },
          { sender: "Bot", text: projectHighlights },
          { images: projectImages },
          {
            buttons: [
              // { label: "Location", action: "location" },
              // { label: "Amenities", action: "amenities" },
              // { label: "Get a Call Back", action: "get_callback" },
            ],
          },
        ]);
        // setButtons(buttons);
      } catch (err) {
        console.error("Error fetching welcome data:", err);
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
    <div className={`chatbot-wrapper ${chatVisible ? "" : "chatbot-hidden"}`}>
      <div
        className="test-chatbot-container chatbot-container"
        // style={{
        //   backgroundColor: theme.backgroundColor,
        //   color: theme.textColor,
        // }}
      >
        {formVisible && (
          <div className="chatbot-form-overlay" style={{ zIndex: "10" }}>
            <div className="chatbot-form-container">
              <button
                className="close-button"
                onClick={() => {
                  setFormVisible(false);
                  setChatVisible(true);
                }}
              >
                ×
              </button>
              <h3>
                {formType === "schedule_site_visit"
                  ? "Schedule Site Visit"
                  : "Get a Call Back"}
              </h3>
              <form
                className="chatbot-form mb-3"
                onSubmit={(e) =>
                  handleLeadSubmit(
                    e,
                    leadData,
                    chatbotId,
                    conversation,
                    setMessages,
                    setFormVisible,
                    uniqueSessionId,
                    messages,
                    api
                  )
                }
              >
                <label>Name:</label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  required
                  value={leadData.name}
                  onChange={(e) =>
                    setLeadData({ ...leadData, name: e.target.value })
                  }
                />

                <label>Phone:</label>
                <input
                  type="tel"
                  name="phone"
                  className="form-control"
                  required
                  value={leadData.email}
                  onChange={(e) =>
                    setLeadData({ ...leadData, email: e.target.value })
                  }
                />

                <label>Email:</label>
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  required
                  value={leadData.phone}
                  onChange={(e) =>
                    setLeadData({ ...leadData, phone: e.target.value })
                  }
                />

                <button type="submit" className="btn btn-primary w-100">
                  Submit
                </button>
              </form>
              {/* <button className="close-button" onClick={() => setFormVisible(false)}>Close</button> */}
            </div>
          </div>
        )}
        {chatVisible && (
          <>
            {showFirstScreen ? (
              <FirstScreen />
            ) : (
              <>
                {/* <button
  className="close_button"
  onClick={() => setChatVisible(false)} // Hide chatbot
>
  ×
</button> */}
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
                    <div className="chatbot-logo d-flex flex-column justify-content-center align-items-center">
                      <img
                        className="chatbot-logo-img"
                        src="https://magicpage-dev.propstory.com/ImageUploads/VBHC%20Landscape/1nnx53gk0m7srs5pd.png"
                        // src={`https://assist-ai.propstory.com/${chatbotData.projectLogo}`}
                        alt="Project Logo"
                        height="50"
                        width="60"
                      />
                    </div>
                  )}
                  <div className="py-2 text-center">
                    <h4 className="title">
                      PropStory Help Desk {chatbotData?.name}
                    </h4>
                    {/* <p className="subtitle">
                    How can I help you today {chatbotData?.name}?
                  </p> */}
                  </div>

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
                      <div
                        className="cursor-pointer fw-bold close_button"
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
                      </div>
                    </div>

                    {/* Dropdown Menu (Visible when clicked) */}
                    {isOpen && (
                      <div className="relative right-0 bg-white shadow-lg">
                        <ul className="menu_list bg-white text-center position-absolute list-unstyled">
                          <li>Site Visit</li>
                          <li>Voice Call</li>
                          <li>Video Call</li>
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                <div
                  className="chat-window p-4 mb-3 border rounded scrollbar"
                  id="style-8"
                  ref={chatWindowRef}
                >
                  {messages?.map((message, index) => {
                    const hasContent =
                      message.text ||
                      message.images?.length ||
                      message.buttons?.length;

                    return hasContent ? (
                      <div
                        key={index}
                        className={`message ${
                          message.sender === "User"
                            ? "user-message"
                            : "bot-message"
                        }`}
                      >
                        {message.text && (
                          <div
                            className="message-bubble"
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
                            }}
                          >
                            {message.text}
                          </div>
                        )}

                        {message.images && message.images.length > 0 && (
                          <div className="image-container">
                            {message.images
                              .filter((img) => img) // Ensure image URL is valid
                              .map((img, idx) => (
                                <img
                                  key={idx}
                                  className="chatbot-logo-img"
                                  src={`https://assist-ai.propstory.com/${img}`}
                                  alt="Project Logo"
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
                      </div>
                    ) : null;
                  })}

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
