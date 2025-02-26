import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./TestChatbot.css";
import "./ChatbotWidget.css";
import api from "../config/axios";
import handleLeadSubmit from "../config/handleLeadSubmit";

import { v4 as uuidv4 } from "uuid";
import { SketchPicker } from "react-color";
import chatbotThemes from "../config/chatbotThemes";

const TestChatbot = () => {
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
    // { label: 'Location', action: 'location' },
    // { label: 'Amenities', action: 'amenities' },
    { label: "Brochure", action: "brochure" },
    { label: "Schedule Site Visit", action: "schedule_site_visit" },
    // { label: 'Get a Call Back', action: 'get_callback' }
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
              { label: "Location", action: "location" },
              { label: "Amenities", action: "amenities" },
              { label: "Get a Call Back", action: "get_callback" },
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

  // const toggleChatbotWidget = () => {
  //     var chatbotIframe = document.getElementById('chatbot-widget');
  //     if (chatbotIframe?.style.display === 'none') {
  //         chatbotIframe?.style.display = 'block';
  //         chatbotIframe?.style.width = window.innerWidth <= 768 ? '100%' : '350px';
  //         chatbotIframe?.style.height = window.innerWidth <= 768 ? '100%' : '500px';
  //         chatbotIframe?.style.bottom = window.innerWidth <= 768 ? '0' : '20px';
  //         chatbotIframe?.style.right = window.innerWidth <= 768 ? '0' : '20px';
  //     } else {
  //         chatbotIframe.style.display = 'none';
  //     }
  // };
  // if (!chatbotData) return null;

  const theme = chatbotThemes["default"] || chatbotThemes.default;
  // const generateEmbedScript = () => {
  //     const script = `
  //             <script>
  //             (function() {
  //                 const iframe = document.createElement('iframe');
  //                 iframe.src = 'http://localhost:3000/chatbot-widget/679b2c0b101d48795ab7a4e2';
  //                 iframe.style.position = 'fixed';
  //                 iframe.style.bottom = '20px';
  //                 iframe.style.right = '20px';
  //                 iframe.style.width = '400px';
  //                 iframe.style.height = '600px';
  //                 iframe.style.border = 'none';
  //                 iframe.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
  //                 iframe.style.borderRadius = '10px';
  //                 iframe.style.overflow = 'hidden';
  //                 iframe.style.zIndex = '1000';
  //                 iframe.style.display = 'none';
  //                 iframe.id = 'chatbot-widget';
  //                 document.body.appendChild(iframe);

  //                 setTimeout(() => {
  //                     iframe.style.display = 'block';
  //                 }, 10000);

  //                 var toggleButton = document.createElement('button');
  //                 toggleButton.innerText = 'Chat';
  //                 toggleButton.style.position = 'fixed';
  //                 toggleButton.style.bottom = '20px';
  //                 toggleButton.style.right = '20px';
  //                 toggleButton.style.padding = '10px 15px';
  //                 toggleButton.style.background = '#34b7f1';
  //                 toggleButton.style.color = 'white';
  //                 toggleButton.style.border = 'none';
  //                 toggleButton.style.borderRadius = '20px';
  //                 toggleButton.style.cursor = 'pointer';
  //                 toggleButton.style.zIndex = '1001';

  //                 toggleButton.onclick = function() {
  //                     var chatbotIframe = document.getElementById('chatbot-widget');
  //                     if (chatbotIframe.style.display === 'none') {
  //                         chatbotIframe.style.display = 'block';
  //                         chatbotIframe.style.width = window.innerWidth <= 768 ? '100%' : '350px';
  //                         chatbotIframe.style.height = window.innerWidth <= 768 ? '100%' : '500px';
  //                         chatbotIframe.style.bottom = window.innerWidth <= 768 ? '0' : '20px';
  //                         chatbotIframe.style.right = window.innerWidth <= 768 ? '0' : '20px';
  //                     } else {
  //                         chatbotIframe.style.display = 'none';
  //                     }
  //                 };
  //                 document.body.appendChild(toggleButton);
  //             })();
  //         </script>
  //     `;
  //     setEmbedScript(script);
  // };

  return (
    <div className="chatbot-wrapper">
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
        className="test-chatbot-container chatbot-container p-2"
        style={{
          backgroundColor: theme.backgroundColor,
          color: theme.textColor,
        }}
      >
        {/* <button
                className="chatbot-close-btn"
                style={{ backgroundColor: theme.buttonColor, color: theme.buttonTextColor }}
                onClick={() => setChatVisible(false)}
            >
                Close
            </button> */}
        {formVisible && (
          <div className="chatbot-form-overlay" style={{ zIndex: "10" }}>
            <div className="chatbot-form-container mb-2">
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
            <div className="d-flex header">
              {chatbotData?.projectLogo && (
                <div className="chatbot-logo d-flex flex-column justify-content-center align-items-center">
                  <img
                    className="chatbot-logo-img"
                    src={`https://assist-ai.propstory.com/${chatbotData.projectLogo}`}
                    alt="Project Logo"
                    height="60"
                    width="60"
                    style={{ borderRadius: "50%", marginRight: "10px" }}
                  />
                  {/* <img src={`https://assist-ai.propstory.com/uploads/${chatbotData.projectLogo}`} alt="Project Logo" /> */}
                </div>
              )}
              <div style={{ marginTop: "10px" }}>
                <h1 className="title">Hello, there</h1>
                <p className="subtitle">
                  How can I help you today {chatbotData?.name}?
                </p>
              </div>
              {/* <button
                                className="chatbot-close-btn"
                                style={{ backgroundColor: theme.buttonColor, color: theme.buttonTextColor }}
                                onClick={() => toggleChatbotWidget(false)}
                            >
                                X
                            </button> */}
              {/* <h2 className="text-primary mb-2">Welcome to KRPL Chatbot</h2> */}
            </div>
            <div
              className="chat-window p-2 mb-3 border rounded"
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
                        backgroundColor:
                          message.sender === "User"
                            ? theme.userBubbleColor
                            : theme.botBubbleColor,
                        textAlign:
                          message.sender === "User"
                            ? theme.botAlign
                            : theme.userAlign,
                      }}
                    >
                      {message.text}
                    </div>
                  )}
                  {message.images &&
                    message.images.length > 0 &&
                    message.images.map((img, idx) => (
                      <img
                        className="chatbot-logo-img"
                        src={`https://assist-ai.propstory.com/${img}`}
                        alt="Project Logo"
                        height="200"
                        width="200"
                        style={{ borderRadius: "10%", marginRight: "10px" }}
                      />
                    ))}
                  {message.buttons &&
                    message.buttons.length > 0 &&
                    message.buttons.map((button, idx) => (
                      <a
                        key={index}
                        onClick={() =>
                          handleButtonClick(button.action, button.label)
                        }
                        className="button-52"
                      >
                        {button.label}
                      </a>
                    ))}

                  {/* <div className="timestamp">{formatTimestamp(message.timestamp)}</div> */}
                  {/* {message.sender === 'User' && message.score !== undefined && (
                                            <>
                                                <div className="message-score">Score: {message.score.toFixed(2)}</div>
                                                
                                            </>
                                        )} */}
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
            </div>
          </>
        )}
        {/* <div className="button-container">
                        {buttons.map((button, index) => (
                            <button key={index} onClick={() => handleButtonClick(button.action, button.label)} className="chatbot-button">
                                {button.label}
                            </button>
                        ))}
                    </div> */}

        <div className="chatbot-footer">
          <div className="button-container">
            {buttons.map((button, index) => (
              <a
                key={index}
                onClick={() => handleButtonClick(button.action, button.label)}
                className="button-50"
                style={{
                  backgroundColor: theme.buttonColor,
                  color: theme.buttonTextColor,
                  buttonHoverColor: theme.buttonHoverColor,
                  borderRadius: theme.buttonBorderRadius,
                }}
              >
                {button.label}
              </a>
            ))}
          </div>
        </div>

        <div className="typing-area">
          <div className="typing-form">
            <div className="input-wrapper form-control chat-input">
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
                className="icon material-symbols-rounded send-button"
                onClick={handleSendMessage}
              >
                send
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

        {/* <div className="">
                    <input
                        type="text"
                        className="form-control chat-input"
                        placeholder="Type a message..."
                        // value={message}
                        // onChange={(e) => setMessage(e.target.value)}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                </div>

                <button className="btn btn-primary w-100 mb-4 send-button" onClick={handleSendMessage}>Send</button> */}
        {/* <button className="btn btn-secondary w-100" onClick={generateEmbedScript}>Get Embed Script</button>
                {embedScript && (
                    <div className="mt-3">
                        <h5>Embed Code:</h5>
                        <pre>{embedScript}</pre>
                        <p>Copy and paste the above script into any HTML page to embed the chatbot.</p>
                    </div>
                )} */}
      </div>
    </div>
  );
};

export default TestChatbot;
