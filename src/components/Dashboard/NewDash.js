import React, { useState, useEffect } from 'react';
import "./NewDash.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { Link, useNavigate } from 'react-router-dom';
import Dashboardcopy from './Dashboardcopy';

export const NewDash = () => {
    const navigate = useNavigate();
    const [currentDate, setCurrentDate] = useState("");

    const handleLogout = () => {
        localStorage.removeItem('token'); // Clear token
        navigate('/'); // Redirect to login
    };

    useEffect(() => {
        const today = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' };
        setCurrentDate(today.toLocaleDateString('en-US', options));
    }, []);  // Empty dependency array ensures this runs only once when component mounts

    const handleCreateChatbot = () => {
        navigate('/dashboard/create-chatbot');
    };

    return (
        <>
        <div className='container-fluid'>
            <div className="row">
                <div className="col-lg-2 border-end text-center pt-4">
                    <h4 className='fw-bold'>AIChatbot</h4>
                    <div className='my-3'>
                        <img src="https://img.freepik.com/premium-vector/business-man-avatar-profile_1133257-2431.jpg?w=740" alt="userprofile" className='w-50' />
                        <h6 className='mb-1'>User Name</h6>
                        <p className='text-secondary'>abc@gmail.com</p>
                    </div>
                    <div>
                        <ul className='my-5 list-unstyled px-4'>
                            <li className='d-flex justify-content-start align-items-center'>
                                <i className="bi bi-robot pe-4"></i>
                                <a className="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                    Chatbot
                                </a>
                                <div className="dropdown-menu" aria-labelledby="navbarDropdown">
                                    <a className="dropdown-item" href="/dashboard/create">Create Chatbot</a>
                                    <a className="dropdown-item" href="/dashboard/list">Chatbot List</a>
                                    <div className="dropdown-divider"></div>
                                    <a className="dropdown-item" href="#">Something else here</a>
                                </div>
                            </li>
                            <li className='d-flex justify-content-start align-items-center'>
                                <i className="bi bi-chat-dots pe-4"></i>
                                <Link className="nav-link" to="/dashboard/create">Conversation</Link>
                            </li>
                            <li className='d-flex justify-content-start align-items-center'>
                                <i className="bi bi-bar-chart pe-4"></i>
                                <Link className="nav-link" to="/dashboard/AdminAnalytics">Analytics</Link>
                            </li>
                            <li className='d-flex justify-content-start align-items-center'>
                                <i className="bi bi-box-arrow-right pe-4"></i>
                                <button className="btn btn-link nav-link mt-0 p-0" onClick={handleLogout}>Logout</button>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="col-lg-8 bg_sky pt-4">
                    <div class="d-flex justify-content-between">
                        <div>
                        <div>
                        <h5 className='fw-bold mb-1'>Hello, User</h5>
                        {/* Display dynamic date and day */}
                        <p className='text-secondary'><small>Today is {currentDate}</small></p>
                    </div>
                        </div>
                        <div>
                        <button className='mt-0 chat-create-btn' onClick={handleCreateChatbot}>Create Chatbot</button>
                        </div>

                    </div>
                    <div>
                    <Dashboardcopy />
                    </div> 
                </div>

                <div className="col-lg-2 bg-secondary pt-4">
                </div>
            </div>
        </div>
        </>
    );
}
