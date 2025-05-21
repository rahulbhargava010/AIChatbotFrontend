import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./CreateChatbot.css";
import api from "../config/axios";

// Theme preview component
const ThemePreview = ({ colors }) => {
  return (
    <div
      className="theme-preview-container"
      style={{
        backgroundColor: colors.background,
        borderRadius: "8px",
        overflow: "hidden",
        border: "1px solid #e2e8f0",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        width: "100%",
        margin: "0 auto",
      }}
    >
      {/* Header */}
      <div
        className="preview-header"
        style={{
          backgroundColor: colors.primary,
          padding: "10px 12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              width: "10px",
              height: "10px",
              backgroundColor: colors.accent,
              borderRadius: "50%",
              marginRight: "8px",
            }}
          ></div>
          <div
            style={{
              height: "8px",
              width: "80px",
              backgroundColor: "rgba(255,255,255,0.8)",
              borderRadius: "4px",
            }}
          ></div>
        </div>
        <div
          style={{
            height: "12px",
            width: "12px",
            backgroundColor: "rgba(255,255,255,0.5)",
            borderRadius: "2px",
          }}
        ></div>
      </div>

      {/* Chat body */}
      <div style={{ padding: "10px", backgroundColor: colors.background }}>
        {/* Bot message */}
        <div
          style={{
            display: "flex",
            marginBottom: "8px",
            alignItems: "flex-start",
          }}
        >
          <div
            style={{
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              backgroundColor: colors.accent,
              marginTop: "4px",
              marginRight: "6px",
              flexShrink: 0,
            }}
          ></div>
          <div
            style={{
              width: "70%",
              padding: "8px",
              backgroundColor: colors.secondary,
              borderRadius: "8px",
              boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
            }}
          >
            <div
              style={{
                height: "8px",
                width: "90%",
                backgroundColor: "#CBD5E1",
                borderRadius: "4px",
                marginBottom: "6px",
              }}
            ></div>
            <div
              style={{
                height: "8px",
                width: "60%",
                backgroundColor: "#CBD5E1",
                borderRadius: "4px",
              }}
            ></div>
          </div>
        </div>

        {/* User message */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: "8px",
          }}
        >
          <div
            style={{
              width: "60%",
              padding: "8px",
              backgroundColor: colors.primary,
              borderRadius: "8px",
              boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
            }}
          >
            <div
              style={{
                height: "8px",
                width: "80%",
                backgroundColor: "rgba(255,255,255,0.7)",
                borderRadius: "4px",
                marginBottom: "6px",
              }}
            ></div>
            <div
              style={{
                height: "8px",
                width: "50%",
                backgroundColor: "rgba(255,255,255,0.7)",
                borderRadius: "4px",
              }}
            ></div>
          </div>
        </div>

        {/* Input area */}
        <div
          style={{
            display: "flex",
            marginTop: "12px",
            alignItems: "center",
            borderTop: `1px solid ${colors.secondary}`,
            paddingTop: "10px",
          }}
        >
          <div
            style={{
              flex: 1,
              height: "12px",
              backgroundColor: colors.secondary,
              borderRadius: "6px",
            }}
          ></div>
          <div
            style={{
              width: "20px",
              height: "20px",
              borderRadius: "50%",
              backgroundColor: colors.primary,
              marginLeft: "8px",
              flexShrink: 0,
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

// Modern color picker component
const ColorPicker = ({ label, color, onChange }) => {
  return (
    <div className="color-picker-container">
      <div className="color-picker-swatch" style={{ backgroundColor: color }}>
        <input
          type="color"
          value={color}
          onChange={(e) => onChange(e.target.value)}
          className="color-input"
        />
      </div>
      <div className="color-picker-details">
        <span className="color-picker-label">{label}</span>
        <input
          type="text"
          value={color}
          onChange={(e) => onChange(e.target.value)}
          className="hex-input"
          placeholder="#RRGGBB"
        />
      </div>
    </div>
  );
};

// Theme options with CSS-based previews
const themeOptions = [
  {
    id: "default-theme.css",
    name: "Default",
    description: "Clean, professional interface with balanced colors",
    previewColors: {
      primary: "#3a86ff",
      secondary: "#f0f2f5",
      accent: "#4caf50",
      background: "#ffffff",
      text: "#333333",
    },
  },
  {
    id: "dark-theme.css",
    name: "Dark Mode",
    description: "Sleek dark theme that's easy on the eyes",
    previewColors: {
      primary: "#6366f1",
      secondary: "#374151",
      accent: "#10b981",
      background: "#1f2937",
      text: "#f3f4f6",
    },
  },
  {
    id: "corporate-theme.css",
    name: "Corporate",
    description: "Professional appearance for business applications",
    previewColors: {
      primary: "#0f172a",
      secondary: "#e2e8f0",
      accent: "#0ea5e9",
      background: "#ffffff",
      text: "#0f172a",
    },
  },
  {
    id: "colorful-theme.css",
    name: "Colorful",
    description: "Vibrant and engaging design for standout presence",
    previewColors: {
      primary: "#8b5cf6",
      secondary: "#fae8ff",
      accent: "#ec4899",
      background: "#ffffff",
      text: "#4b5563",
    },
  },
  {
    id: "minimal-theme.css",
    name: "Minimal",
    description: "Clean, minimalist design for a modern look",
    previewColors: {
      primary: "#f8f8f8",
      secondary: "#f1f1f1",
      accent: "#777777",
      background: "#ffffff",
      text: "#333333",
    },
  },
  {
    id: "custom-theme.css",
    name: "Custom",
    description: "Personalize with your own brand colors",
    previewColors: {
      primary: "#0c4a6e",
      secondary: "#f8fafc",
      accent: "#10b981",
      background: "#ffffff",
      text: "#334155",
    },
    isCustom: true,
  },
];

const ChatbotForm = ({ initialData = {}, mode = "create" }) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [conversation, setConversation] = useState("");
  const [chatbotId, setChatbotId] = useState("");
  const [webhook, setWebhook] = useState("");
  const [website, setWebsite] = useState("");
  const [conversion, setConversion] = useState("");
  const [GTM, setGTM] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [buttonContent, setButtonContent] = useState({
    highlight: "",
    location: "",
    amenities: "",
    map: "",
  });
  const [step, setStep] = useState(1);
  const [projectLogo, setProjectLogo] = useState(null);
  const [projectLogoURL, setProjectLogoURL] = useState(null);
  const [projectImages, setProjectImages] = useState([]);
  const [projectImagesURL, setProjectImagesURL] = useState([]);
  const [brochure, setBrochure] = useState(null);
  const [brochureURL, setBrochureURL] = useState(null);
  const [template, setTemplate] = useState("default-theme.css"); // Default theme

  // Custom theme colors
  const [customColors, setCustomColors] = useState({
    primary: "#0c4a6e",
    secondary: "#f8fafc",
    accent: "#10b981",
    background: "#ffffff",
    text: "#334155",
  });

  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setButtonContent((prevContent) => ({
      ...prevContent,
      [name]: value,
    }));
  };

  const handleColorChange = (colorKey, value) => {
    setCustomColors((prev) => ({
      ...prev,
      [colorKey]: value,
    }));

    // Update the custom theme preview colors
    const updatedThemeOptions = themeOptions.map((theme) => {
      if (theme.id === "custom-theme.css") {
        return {
          ...theme,
          previewColors: {
            ...customColors,
            [colorKey]: value,
          },
        };
      }
      return theme;
    });

    // We're updating the reference, not the state here
    themeOptions.forEach((theme, index) => {
      if (theme.id === "custom-theme.css") {
        themeOptions[index].previewColors = {
          ...customColors,
          [colorKey]: value,
        };
      }
    });
  };

  const handleFileChange = (e, setProjectLogo) => {
    const file = e.target.files[0];
    setProjectLogo(file);
    setProjectLogoURL(null);
  };

  const handleMultipleFilesChange = (e) => {
    const files = Array.from(e.target.files);
    setProjectImages(files);
    setProjectImagesURL([]);
  };

  const handleCreate = async (e) => {
    const formData = new FormData();
    e.preventDefault();
    const token = localStorage.getItem("token");

    if (!name) {
      setError("Chatbot name is required.");
      return;
    }
    if (chatbotId) {
      formData.append("id", chatbotId);
    }

    if (projectLogo) {
      formData.append("projectLogo", projectLogo);
    }

    projectImages.forEach((img) => {
      formData.append("projectImages", img);
    });

    if (brochure) {
      formData.append("brochure", brochure);
    }

    // Ensure buttonContent is an object before setting state
    if (typeof buttonContent === "object" && buttonContent !== null) {
      setButtonContent(buttonContent);
    } else {
      setButtonContent({});
    }

    formData.append("name", name);
    formData.append("webhook", webhook);
    formData.append("phone", phone);
    formData.append("website", website);
    formData.append("conversion", conversion);
    formData.append("GTM", GTM);
    formData.append("template", template); // Include the selected theme

    // If custom theme is selected, include the custom colors
    if (template === "custom-theme.css") {
      formData.append("customColors", JSON.stringify(customColors));
    }

    if (buttonContent && typeof buttonContent === "object") {
      formData.append("buttonContent", JSON.stringify(buttonContent));
    }

    try {
      const response = await api.post("/chatbots/create", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      const chatbotId = response.data.chatbot._id;
      setMessage("Chatbot created successfully!");
      setError("");
      setName("");

      navigate(`/dashboard/train/${chatbotId}`);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create chatbot.");
      setMessage("");
    }
  };

  const removeLogo = () => {
    setProjectLogo(null);
    setProjectLogoURL(null);
  };

  const removeBrochure = () => {
    setBrochure(null);
    setBrochureURL(null);
  };

  const removeImage = (index) => {
    setProjectImages((prevImages) => prevImages.filter((_, i) => i !== index));
    setProjectImagesURL((prevImages) =>
      prevImages.filter((_, i) => i !== index)
    );
  };

  useEffect(() => {
    const fetchChatbotData = async () => {
      if (
        initialData?.chatbotDetails &&
        Object.keys(initialData.chatbotDetails).length > 0
      )
        try {
          if (mode === "update" && Object.keys(initialData).length > 0) {
            setChatbotId(initialData?.chatbotDetails._id);
            setName(initialData?.chatbotDetails.name);
            setPhone(initialData?.chatbotDetails.phone);
            setWebhook(initialData?.chatbotDetails.webhook);
            setWebsite(initialData?.chatbotDetails.website);
            setGTM(initialData?.chatbotDetails.GTM);
            setConversion(initialData?.chatbotDetails.conversion);
            setTemplate(
              initialData?.chatbotDetails.template || "default-theme.css"
            ); // Set template from data

            // REPLACE THIS SECTION:
            // Load custom colors if available
            if (initialData?.chatbotDetails.customColors) {
              try {
                const colors = initialData.chatbotDetails.customColors;
                setCustomColors(
                  typeof colors === "string" ? JSON.parse(colors) : colors
                );

                // Update the custom theme preview with these colors
                themeOptions.forEach((theme, index) => {
                  if (theme.id === "custom-theme.css") {
                    themeOptions[index].previewColors =
                      typeof colors === "string" ? JSON.parse(colors) : colors;
                  }
                });
              } catch (err) {
                console.error("Error parsing custom colors:", err);
              }
            }
            // END OF REPLACEMENT

            const prevContent = initialData?.chatbotDetails.button_content;
            setButtonContent(prevContent);
            setProjectLogoURL(initialData?.chatbotDetails.projectLogo);
            setProjectImagesURL(initialData?.chatbotDetails.projectImages);
            setBrochureURL(initialData?.chatbotDetails.brochure);
          }
        } catch (err) {
          console.log("Fetching chatbot err", err);
        }
    };

    fetchChatbotData();
  }, [initialData]);

  return (
    <div className="create-chatbot-container d-flex justify-content-center align-items-center vh-100">
      <div className="create-chatbot-card p-4 shadow rounded bg-white">
        <h1 className="text-center text-primary mb-4">
          {mode === "create" ? "Create Chatbot" : "Update Chatbot"}
        </h1>
        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-danger">{error}</div>}

        {/* Step indicator */}
        <div className="step-indicator mb-4">
          <div className={`step ${step >= 1 ? "active" : ""}`}>1</div>
          <div className="step-line"></div>
          <div className={`step ${step >= 2 ? "active" : ""}`}>2</div>
          <div className="step-line"></div>
          <div className={`step ${step >= 3 ? "active" : ""}`}>3</div>
          <div className="step-line"></div>
          <div className={`step ${step >= 4 ? "active" : ""}`}>4</div>
        </div>

        <form onSubmit={handleCreate}>
          {step === 1 && (
            <div className="mb-3">
              <label htmlFor="chatbot-name" className="form-label">
                Chatbot Name
              </label>
              <input
                id="chatbot-name"
                type="text"
                placeholder="Enter chatbot name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="form-control"
              />
              <label htmlFor="chatbot-phone" className="form-label mt-3">
                Phone
              </label>
              <input
                id="chatbot-phone"
                type="text"
                placeholder="Enter Phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="form-control"
              />

              <label htmlFor="chatbot-webhook" className="form-label mt-3">
                Webhook
              </label>
              <input
                id="chatbot-webhook"
                type="text"
                placeholder="Enter Webhook"
                value={webhook}
                onChange={(e) => setWebhook(e.target.value)}
                className="form-control"
              />

              <label htmlFor="chatbot-website" className="form-label mt-3">
                Website
              </label>
              <input
                id="chatbot-website"
                type="text"
                placeholder="Enter Website"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="form-control"
              />
              <label htmlFor="chatbot-gtm" className="form-label mt-3">
                GTM Account ID
              </label>
              <input
                id="chatbot-gtm"
                type="text"
                placeholder="Enter GTM Account"
                value={GTM}
                onChange={(e) => setGTM(e.target.value)}
                className="form-control"
              />
              <label htmlFor="chatbot-conversion" className="form-label mt-3">
                Conversation ID
              </label>
              <input
                id="chatbot-conversion"
                type="text"
                placeholder="Enter Conversation ID"
                value={conversion}
                onChange={(e) => setConversion(e.target.value)}
                className="form-control"
              />
              <button
                type="button"
                onClick={() => setStep(2)}
                className="btn btn-primary w-100 mt-4"
              >
                Next
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="multi-step-form">
              <div className="mb-3">
                <label>Map:</label>
                <input
                  id="chatbot-map"
                  type="text"
                  placeholder="Insert Map Iframe"
                  name="map"
                  value={buttonContent.map}
                  onChange={handleInputChange}
                  className="form-control"
                />

                <label className="mt-3">Project Highlight:</label>
                <textarea
                  type="textarea"
                  name="highlight"
                  placeholder="Insert Project Highlight keep it small"
                  value={buttonContent.highlight}
                  onChange={handleInputChange}
                  className="form-control"
                  rows="3"
                />

                <label className="mt-3">Location Details:</label>
                <textarea
                  type="text"
                  name="location"
                  placeholder="Insert only project location details"
                  value={buttonContent.location}
                  onChange={handleInputChange}
                  className="form-control"
                  rows="3"
                />

                <label className="mt-3">Amenities:</label>
                <textarea
                  type="text"
                  name="amenities"
                  placeholder="Insert All Amenities, can be separated by dot or pipe"
                  value={buttonContent.amenities}
                  onChange={handleInputChange}
                  className="form-control"
                  rows="3"
                />
              </div>
              <div className="btn-group btn-group-justified w-100 mt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="btn btn-secondary"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="btn btn-primary"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="multi-step-form">
              <label>Upload Project Logo:</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, setProjectLogo)}
                className="form-control mb-2"
              />
              {projectLogo && (
                <div className="preview-container">
                  <img
                    src={URL.createObjectURL(projectLogo)}
                    alt="Project Logo"
                    className="preview-image"
                  />
                  <button
                    type="button"
                    className="delete-button"
                    onClick={removeLogo}
                  >
                    ×
                  </button>
                </div>
              )}
              {projectLogoURL && !projectLogo && (
                <div className="preview-container">
                  <img
                    src={`https://assist-ai.propstory.com/${projectLogoURL}`}
                    alt="Project Logo"
                    className="preview-image"
                  />
                  <button
                    type="button"
                    className="delete-button"
                    onClick={removeLogo}
                  >
                    ×
                  </button>
                </div>
              )}
              <hr className="my-4" />

              <label>Upload Project Images:</label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleMultipleFilesChange}
                className="form-control mb-2"
              />

              <div className="image-preview-container">
                {projectImages.map((img, index) => (
                  <div className="preview-container" key={`new-${index}`}>
                    <img
                      src={URL.createObjectURL(img)}
                      alt={`Project ${index + 1}`}
                      className="preview-image"
                    />
                    <button
                      type="button"
                      className="delete-button"
                      onClick={() => removeImage(index)}
                    >
                      ×
                    </button>
                  </div>
                ))}
                {projectImagesURL.map((img, index) => (
                  <div className="preview-container" key={`existing-${index}`}>
                    <img
                      src={`https://assist-ai.propstory.com/${img}`}
                      alt={`Project ${index + 1}`}
                      className="preview-image"
                    />
                    <button
                      type="button"
                      className="delete-button"
                      onClick={() => removeImage(index)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              <hr className="my-4" />

              <label>Upload Project Brochure (PDF):</label>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => {
                  const file = e.target.files[0];
                  setBrochure(file);
                  setBrochureURL(null);
                }}
                className="form-control mb-2"
              />

              {brochureURL && !brochure && (
                <div className="brochure-preview">
                  <div className="file-info">
                    <i className="fa fa-file-pdf-o" aria-hidden="true"></i>
                    <span>Current brochure</span>
                    <a
                      href={`https://assist-ai.propstory.com/${brochureURL}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="view-button"
                    >
                      View
                    </a>
                    <button
                      type="button"
                      className="delete-button"
                      onClick={removeBrochure}
                    >
                      ×
                    </button>
                  </div>
                </div>
              )}

              <div className="btn-group btn-group-justified mt-4 w-100">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="btn btn-secondary"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="btn btn-primary"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="multi-step-form">
              <h3 className="mb-3">Select Chatbot Theme</h3>

              <div className="theme-selection-container">
                {themeOptions.map((theme) => (
                  <div
                    key={theme.id}
                    className={`theme-option ${
                      template === theme.id ? "selected" : ""
                    }`}
                    onClick={() => setTemplate(theme.id)}
                  >
                    <div className="theme-preview">
                      {/* Use our ThemePreview component with the theme's colors */}
                      <ThemePreview
                        colors={
                          theme.id === "custom-theme.css" &&
                          template === "custom-theme.css"
                            ? customColors
                            : theme.previewColors
                        }
                      />
                    </div>
                    <div className="theme-details">
                      <h4>{theme.name}</h4>
                      <p>{theme.description}</p>
                    </div>
                    <div className="theme-radio">
                      <input
                        type="radio"
                        name="template"
                        value={theme.id}
                        checked={template === theme.id}
                        onChange={() => setTemplate(theme.id)}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Custom color pickers - only show when custom theme is selected */}
              {template === "custom-theme.css" && (
                <div className="custom-colors-container">
                  <h4 className="colors-title">Customize Your Colors</h4>

                  <div className="color-pickers-grid">
                    <ColorPicker
                      label="Primary Color (Header & Buttons)"
                      color={customColors.primary}
                      onChange={(value) => handleColorChange("primary", value)}
                    />

                    <ColorPicker
                      label="Secondary Color (Messages & Input)"
                      color={customColors.secondary}
                      onChange={(value) =>
                        handleColorChange("secondary", value)
                      }
                    />

                    <ColorPicker
                      label="Accent Color (Status & Highlights)"
                      color={customColors.accent}
                      onChange={(value) => handleColorChange("accent", value)}
                    />

                    <ColorPicker
                      label="Background Color"
                      color={customColors.background}
                      onChange={(value) =>
                        handleColorChange("background", value)
                      }
                    />

                    <ColorPicker
                      label="Text Color"
                      color={customColors.text}
                      onChange={(value) => handleColorChange("text", value)}
                    />
                  </div>

                  <div className="preview-note">
                    <span>
                      * The preview above will update as you select colors.
                    </span>
                  </div>
                </div>
              )}

              <div className="btn-group btn-group-justified mt-4 w-100">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="btn btn-secondary"
                >
                  Back
                </button>
                <button type="submit" className="btn btn-primary">
                  {mode === "create" ? "Create Chatbot" : "Update Chatbot"}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default ChatbotForm;
