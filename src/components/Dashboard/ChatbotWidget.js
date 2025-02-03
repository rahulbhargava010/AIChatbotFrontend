import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './TestChatbot.css';

const TestChatbot = () => {
    const { chatbotId } = useParams();
    const [messages, setMessages] = useState([]);
    const [projectLogo, setProjectLogo] = useState([]);
    const [projectImages, setProjectImages] = useState([]);
    const [name, setName] = useState('');
    const [webhook, setWebhook] = useState('');
    const [input, setInput] = useState('');
    const chatWindowRef = useRef(null);
    const [buttons] = useState([
        { label: 'Highlights', action: 'highlight' },
        { label: 'Location', action: 'location' },
        { label: 'Amenities', action: 'amenities' },
        { label: 'Brochure', action: 'brochure' },
        // { label: 'Schedule Site Visit', action: 'schedule_site_visit' },
        // { label: 'Get a Call Back', action: 'get_callback' }
    ]);

    const [formVisible, setFormVisible] = useState(false);
    const [chatVisible, setChatVisible] = useState(true);
    const [formType, setFormType] = useState('');
    const [formAction, setFormAction] = useState('');
    const [buttonContent, setButtonContent] = useState({});
    const [isTyping, setIsTyping] = useState(false);

    const handleSendMessage = async () => {
        // console.log('Send Message check check', chatbotId);
        if (!input.trim()) return;
        // console.log('Send Message check check', input);

        setMessages((prevMessages) => [
            ...prevMessages,
            { sender: 'User', text: input }
        ]);

        try {
            setIsTyping(true);
            const token = localStorage.getItem('token');
            const response = await axios.post(
                'http://localhost:3001/api/aichatbots/respond',
                { chatbotId, message: input },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            console.log('chatbot response from Test Chatbot', response);
            const { reply, score } = response.data;
            // setChatHistory([...chatHistory, { user: message, bot: response.data.reply }]);
            setMessages((prevMessages) => [
                ...prevMessages,
                { sender: 'Bot', text: reply, score }
            ]);
            setIsTyping(false);
        } catch (err) {
            console.error('Failed to send message:', err);
            setMessages((prevMessages) => [
                ...prevMessages,
                { sender: 'Bot', text: 'Sorry, something went wrong.' }
            ]);
        }
        setInput('');
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Prevent default form submission behavior
            handleSendMessage();
        }
    };

    const handleButtonClick = async (action, label) => {
        try {
            const token = localStorage.getItem('token');

            if (['schedule_site_visit', 'get_callback', 'brochure'].includes(action)) {
                setFormType(action);
                setFormVisible(true);
                setFormAction(webhook)
                setChatVisible(false);
            } else {
                setFormVisible(false);
                setChatVisible(true);
                if(buttonContent[action])
                    setMessages((prevMessages) => [...prevMessages, { sender: 'User', text: label }, { sender: 'Bot', text: buttonContent[action] }]);
            }
        } catch (err) {
            console.error('Error fetching content:', err);
        }
    };

    useEffect(() => {
        if (chatWindowRef.current) {
            chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
        }
    }, [messages]);

    // useEffect(() => {
    //     const timer = setTimeout(() => {
    //         setChatVisible(true);
    //     }, 10000);

    //     return () => clearTimeout(timer);
    // }, []);

    useEffect(() => {
        const fetchWelcomeData = async () => {
            try {
                const token = localStorage.getItem('token');

                const response = await axios.post(
                    'http://localhost:3001/api/aichatbots/welcome',
                    { chatbotId },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                const { greeting, projectHighlights, buttons, webhook, projectLogo, projectImages } = response.data;
                console.log('Welcome in project greeting: ' + response.data)
                setWebhook(webhook);
                setProjectLogo(projectLogo);
                setProjectImages(projectImages);
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
                // Set initial messages and buttons
                setMessages([
                    { sender: 'Bot', text: greeting },
                    { sender: 'Bot', text: projectHighlights },
                ]);
                // setButtons(buttons);
            } catch (err) {
                console.error('Error fetching welcome data:', err);
            }
        };
        fetchWelcomeData();
    }, []);

    return (
        <div className="chatbot-wrapper">
            {/* {!chatVisible && (
                <button className="chatbot-toggle" onClick={() => setChatVisible(true)}>Open Chat</button>
            )}
            {chatVisible && ( */}
                <div className="test-chatbot-container chatbot-container p-2">
                    {formVisible && (
                        <div className="chatbot-form-overlay">
                            <div className="chatbot-form-container mb-2">
                                <button className="close-button" onClick={() => { setFormVisible(false); setChatVisible(true); }}>×</button>
                                <h3>{formType === 'schedule_site_visit' ? 'Schedule Site Visit' : 'Get a Call Back'}</h3>
                                <form action={formAction} method="POST" className="chatbot-form mb-3">
                                    <label>Name:</label>
                                    <input type="text" name="name" className="form-control" required />

                                    <label>Phone:</label>
                                    <input type="tel" name="phone" className="form-control" required />

                                    <label>Email:</label>
                                    <input type="email" name="email" className="form-control" required />

                                    <button type="submit" className="btn btn-primary w-100">Submit</button>
                                </form>
                                {/* <button className="close-button" onClick={() => setFormVisible(false)}>Close</button> */}
                            </div>
                        </div>
                    )}
                    { chatVisible && (
                        <>
                            {projectLogo && (
                                <div className="chatbot-logo">
                                    <img src={`http://localhost:3001/${projectLogo}`} alt="Project Logo" />
                                </div>
                            )}
                            <h2 className="text-primary mb-2">Welcome to KRPL Chatbot</h2>
                            <div className="chat-window p-2 mb-3 border rounded" ref={chatWindowRef}>
                                {messages.map((message, index) => (
                                    <div
                                        key={index}
                                        className={`message ${message.sender === 'User' ? 'user-message' : 'bot-message'}`}
                                    >
                                        <div className="message-bubble">
                                            {message.text}
                                            {message.sender === 'Bot' && message.score !== undefined && (
                                                <div className="message-score">Score: {message.score.toFixed(2)}</div>
                                            )}
                                        </div>
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
                                <button key={index} onClick={() => handleButtonClick(button.action, button.label)} className="chatbot-button btn btn-xs">
                                    {button.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    <div className="mb-3">
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

                    <button className="btn btn-primary w-100 mb-4 send-button" onClick={handleSendMessage}>Send</button>
                    
                </div>
            {/* )} */}
        </div>
    );
};

export default TestChatbot;
