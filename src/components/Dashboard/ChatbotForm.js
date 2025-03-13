import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./CreateChatbot.css";
import api from "../config/axios";

const ChatbotForm = ({ initialData = {}, mode = "create" }) => {
  const [name, setName] = useState("");
  const [map, setMap] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [gtm, setGTM] = useState("");
  const [conversation, setConversation] = useState("");
  const [chatbotId, setChatbotId] = useState("");
  const [webhook, setWebhook] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [buttonContent, setButtonContent] = useState({
    highlight: "",
    location: "",
    amenities: "",
  });
  const [step, setStep] = useState(1);
  const [projectLogo, setProjectLogo] = useState(null);
  const [projectLogoURL, setProjectLogoURL] = useState(null);
  const [projectImages, setProjectImages] = useState([]);
  const [projectImagesURL, setProjectImagesURL] = useState([]);

  const navigate = useNavigate();
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setButtonContent((prevContent) => ({
      ...prevContent,
      [name]: value,
    }));
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
    console.log("updateChatbot", projectLogo);
    if (projectLogo) {
      formData.append("projectLogo", projectLogo);
    }

    projectImages.forEach((img) => {
      formData.append("projectImages", img);
    });

    // console.log("Fetched Button Content:", buttonContent); // Debug log

    // Ensure buttonContent is an object before setting state
    if (typeof buttonContent === "object" && buttonContent !== null) {
      setButtonContent(buttonContent);
    } else {
      // console.error("Invalid button content format:", buttonContent);
      setButtonContent({});
    }

    formData.append("name", name);
    formData.append("webhook", webhook);
    // formData.append("button_content", JSON.stringify(buttonContent));
    if (buttonContent && typeof buttonContent === "object") {
      formData.append("buttonContent", JSON.stringify(buttonContent));
    }
    try {
      const response = await api.post(
        "/chatbots/create",
        // { name, webhook, button_content: buttonContent, projectLogo, projectImages },
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
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
        console.log("Fetching chatbot data", initialData?.chatbotDetails);
      try {
        if (mode === "update" && Object.keys(initialData).length > 0) {
          setChatbotId(initialData?.chatbotDetails._id);
          setName(initialData?.chatbotDetails.name);
          setWebhook(initialData?.chatbotDetails.webhook);
          const prevContent = initialData?.chatbotDetails.button_content;
          setButtonContent(prevContent);
          // setProjectImages(initialData?.chatbotDetails.projectImages);
          // setProjectLogo(initialData?.chatbotDetails.projectLogo);
          setProjectLogoURL(initialData?.chatbotDetails.projectLogo);
          setProjectImagesURL(initialData?.chatbotDetails.projectImages);
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
              <label htmlFor="chatbot-name" className="form-label">
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

              <label htmlFor="chatbot-name" className="form-label">
                Webhook
              </label>
              <input
                // id="chatbot-name"
                type="text"
                placeholder="Enter Webhook"
                value={webhook}
                onChange={(e) => setWebhook(e.target.value)}
                className="form-control"
              />
              <button
                onClick={() => setStep(2)}
                className="btn btn-primary w-100"
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
                  placeholder="Enter Map Location"
                  value={map}
                  onChange={(e) => setMap(e.target.value)}
                  className="form-control"
                />
                <textarea
                  type="text"
                  name="map"
                  value={map}
                  onChange={(e) => setMap(e.target.value)}
                  className="form-control"
                />

                <label>Project Highlight:</label>
                <textarea
                  type="textarea"
                  name="highlight"
                  value={buttonContent.highlight}
                  onChange={handleInputChange}
                  className="form-control"
                />

                <label>Location Details:</label>
                <textarea
                  type="text"
                  name="location"
                  value={buttonContent.location}
                  onChange={handleInputChange}
                  className="form-control"
                />

                <label>Amenities:</label>
                <textarea
                  type="text"
                  name="amenities"
                  value={buttonContent.amenities}
                  onChange={handleInputChange}
                  className="form-control"
                />
              </div>
              <div className="btn-group btn-group-justified">
                <a onClick={() => setStep(1)} className="btn btn-primary">
                  Back
                </a>
                <a onClick={() => setStep(3)} className="btn btn-primary">
                  Next
                </a>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="multi-step-form">
              <label> Upload Project Logo:</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, setProjectLogo)}
              />
              {projectLogo && (
                <div className="preview-container">
                  <img
                    src={URL.createObjectURL(projectLogo)}
                    alt="Project Logo"
                    className="preview-image"
                  />{" "}
                </div>
              )}
              {projectLogoURL && (
                <div className="preview-container">
                  <img
                    src={`https://assist-ai.propstory.com/${projectLogoURL}`}
                    alt="Project Logo"
                    className="preview-image"
                  />{" "}
                </div>
              )}
              <button className="delete-button" onClick={removeLogo}>
                ×
              </button>
              <hr />

              <label>Upload Project Images:</label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleMultipleFilesChange}
              />

              <div className="image-preview-container">
                {projectImages.map((img, index) => (
                  <div className="preview-container">
                    <img
                      key={index}
                      src={URL.createObjectURL(img)}
                      alt={`Project ${index + 1}`}
                      className="preview-image"
                    />
                    <button
                      className="delete-button"
                      onClick={() => removeImage(index)}
                    >
                      ×
                    </button>
                  </div>
                ))}
                {projectImagesURL.map((img, index) => (
                  <div className="preview-container">
                    <img
                      key={index}
                      src={`https://assist-ai.propstory.com/${img}`}
                      alt={`Project ${index + 1}`}
                      className="preview-image"
                    />
                    <button
                      className="delete-button"
                      onClick={() => removeImage(index)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              <button onClick={() => setStep(2)} className="btn btn-danger ">
                Back
              </button>
              <button type="submit" className="btn btn-primary">
                {/* Submit Chatbot Details */}
                {mode === "create" ? "Create Chatbot" : "Update Chatbot"}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default ChatbotForm;
