import React, { useState } from "react";
import axios from "axios";
import { useParams } from 'react-router-dom';
import chatbotThemes from "../config/chatbotThemes";
import "./TemplateSelection.css";

const chatbotTemplates = [
    {
        name: "dark",
        theme: "dark",
    },
    {
        name: "Mustard",
        theme: "mustard",
    },
    {
        name: "Oceanic",
        theme: "oceanic",
    },
    {
        name: "default",
        theme: "default",
    },
    {
        name: "modernGreen",
        theme: "modernGreen",
    },
    {
        name: "futuristicBlue",
        theme: "futuristicBlue",
    },
    {
        name: "elegantPurple",
        theme: "elegantPurple",
    },
    {
        name: "Orange",
        theme: "orange",
    },
];

const TemplateSelection = () => {
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const { chatbotId } = useParams();

    const handleConfirm = async () => {
        if (!selectedTemplate || !chatbotId) return;
        try {
            await axios.put(`http://localhost:3001/api/chatbots/update/${chatbotId}`, {
                template: selectedTemplate,
            });
            alert("Template updated successfully!");
            // setSelectedTemplate(selectedTemplate);
        } catch (error) {
            console.error("Error updating chatbot template:", error);
            alert("Failed to update template.");
        }
    };

    return (
        <div className="template-selection-container">
            <h2>Select a Chatbot Template</h2>
            <div className="template-list">
                
                {chatbotTemplates.map((template, index) => (
                    <div
                        key={index}
                        // className={`template-card ${selectedTemplate === template.name ? "selected" : ""}`}
                        // onClick={() => setSelectedTemplate(template.name)}
                    >
                        {/* <div
                            className="chatbot-preview"
                            style={{ backgroundColor: template.styles.backgroundColor, color: template.styles.textColor }}
                        >
                            <div
                                className="message-bubble"
                                style={{ backgroundColor: template.styles.bubbleColor }}
                            >
                                Hello! This is {template.name} chatbot.
                            </div>
                        </div> */}

                        <div
                            key={index}
                            className={`chatbot-wrapper template-card ${selectedTemplate === template.theme ? "selected" : ""}`}
                            style={{ backgroundColor: chatbotThemes[template.theme].backgroundColor, color: chatbotThemes[template.theme].textColor }} 
                            onClick={() => setSelectedTemplate(template.theme)}>
                            {/* <div className="test-chatbot-container chatbot-container p-4 chatbot-preview"> */}
                                <h2 className="mb-2" style={{ color: chatbotThemes[template.theme].textColor }}>Welcome to KRPL Chatbot</h2>
                                <div className="chat-window p-2 mb-3 border rounded">
                                    <div class="message bot-message">
                                        <div class="message-bubble" 
                                        style={{ backgroundColor: chatbotThemes[template.theme].botBubbleColor, color: chatbotThemes[template.theme].textColor, textAlign: chatbotThemes[template.theme].botAlign }}>Good Afternoon!</div>
                                    </div>
                                    <div class="message bot-message">
                                        <div class="message-bubble" style={{ backgroundColor: chatbotThemes[template.theme].botBubbleColor, color: chatbotThemes[template.theme].textColor, textAlign: chatbotThemes[template.theme].botAlign }}>Lorem Ipsum is simply dummy text of the printing and typesetting industry.</div>
                                    </div>
                                    <div class="message user-message"  >
                                        <div class="message-bubble" style={{ backgroundColor: chatbotThemes[template.theme].userBubbleColor, color: chatbotThemes[template.theme].textColor, textAlign: chatbotThemes[template.theme].userAlign }}>hello</div>
                                    </div>
                                    <div class="message bot-message">
                                        <div class="message-bubble" style={{ backgroundColor: chatbotThemes[template.theme].botBubbleColor, color: chatbotThemes[template.theme].textColor, textAlign: chatbotThemes[template.theme].botAlign }}>Hi, How are you?</div>
                                    </div>
                                </div>
                            {/* </div> */}
                        </div>
                        <p>{template.name}</p>
                    </div>
                ))}
            </div>
            {selectedTemplate && (
                <button onClick={handleConfirm}>Confirm Template</button>
            )}
        </div>
    );
};

export default TemplateSelection;