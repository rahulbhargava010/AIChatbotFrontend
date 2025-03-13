import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./ChatbotWidget.css";

const ChatbotRating = ({ isFullScreen, onSubmit, onClose, formSubmitted }) => {
  const [rating, setRating] = useState(null);
  const [review, setReview] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showLeadFormMessage, setShowLeadFormMessage] = useState(false);
  
  // Add a state to track whether a rating has ever been submitted
  // Check localStorage on component mount to see if rating was submitted previously
  useEffect(() => {
    const hasRatedBefore = localStorage.getItem("chatRatingSubmitted");
    if (hasRatedBefore === "true") {
      setIsSubmitted(true);
      // Optionally retrieve the previous rating to show the correct thank you message
      const previousRating = localStorage.getItem("chatRatingValue");
      if (previousRating) {
        setRating(previousRating);
      }
    }
  }, []);
  
  // Check if lead form has been filled out
  const hasFilledLeadForm = () => {
    // Check both the formSubmitted prop (from parent component) and localStorage
    return formSubmitted || localStorage.getItem("leadFormSubmitted") === "true";
  };

  // Emoji options with labels
  const emojis = [
    { value: "1", icon: "😠", label: "Poor" },
    { value: "2", icon: "😕", label: "Bad" },
    { value: "3", icon: "😐", label: "Average" },
    { value: "4", icon: "🙂", label: "Good" },
    { value: "5", icon: "😍", label: "Excellent" },
  ];

  const getThankYouMessage = () => {
    switch (rating) {
      case "1":
        return {
          title: "We're Sorry! 😔",
          message: "We'll work hard to improve your experience.",
        };
      case "2":
        return {
          title: "Thank You! 🙁",
          message: "We appreciate your feedback and will do better!",
        };
      case "3":
        return {
          title: "Thanks! 🙂",
          message: "We'll strive to provide a better experience next time!",
        };
      case "4":
        return {
          title: "Great! 😊",
          message: "We're glad you had a wonderful and good experience!",
        };
      case "5":
        return {
          title: "Awesome! 🎉",
          message: "We love to hear that you enjoyed our service!",
        };
      default:
        return { title: "Thank You!", message: "We appreciate your feedback!" };
    }
  };

  const handleSubmit = () => {
    if (!rating) {
      alert("⚠ Please select a rating!");
      return;
    }
    
    // Check if lead form has been filled out
    if (!hasFilledLeadForm()) {
      setShowLeadFormMessage(true);
      return;
    }

    // Send rating data to parent component
    onSubmit({ rating, review });

    // Store submission status in localStorage
    localStorage.setItem("chatRatingSubmitted", "true");
    localStorage.setItem("chatRatingValue", rating);

    // Show Thank You message
    setIsSubmitted(true);
    setShowLeadFormMessage(false);

    // No longer reset the form after submission
    // The timeout now only closes the modal after showing the thank you message
    setTimeout(() => {
      onClose();
    }, 30000);
  };
  
  // Redirect user to lead form
  const redirectToLeadForm = () => {
    // Close the rating modal
    onClose();
    // You'll need to implement how to open the lead form here
    // This could be through a callback, event bus, or other state management
    if (typeof window !== 'undefined' && window.openLeadForm) {
      window.openLeadForm();
    } else {
      // Fallback if direct function isn't available
      console.log("Lead form open function not available");
      // You might dispatch an event or use another method to signal that the lead form should open
    }
  };

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      role="dialog"
      style={{ zIndex: "999999" }}
    >
      <div className="modal-dialog modal-fullscreen d-flex align-items-center justify-content-center">
        <div
          className={`modal-fullscreen modal-content window_bg_pink p-1 ${
            isFullScreen ? "fullscreen-mode" : ""
          }`}
        >
          {/* Modal Header */}
          <div className="modal-header border-0 text-center">
            <h5 className="modal-title">
              {isSubmitted ? "Thank You for Your Feedback" : "Rate This Chat"}
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>

          {/* Show Thank You Message if Submitted */}
          {isSubmitted ? (
            <div className="chatbot_wrapper text-center p-4">
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
              <h4 className="mt-2">{getThankYouMessage().title}</h4>
              <p>{getThankYouMessage().message}</p>
            </div>
          ) : showLeadFormMessage ? (
            // Show lead form message if needed
            <div className="modal-body text-center">
              <div className="alert alert-warning" role="alert">
                {/* <h6 className="alert-heading">Complete Your Profile First</h6> */}
                <p>Please fill out your information before submitting a rating.</p>
                <hr />
                <div className="d-flex justify-content-center gap-2">
                  <button 
                    className="btn btn-outline-secondary" 
                    onClick={() => setShowLeadFormMessage(false)}
                  >
                    Back
                  </button>
                  <button 
                    className="btn btn-primary" 
                    onClick={redirectToLeadForm}
                  >
                    Fill Form
                  </button>
                </div>
              </div>
            </div>
          ) : (
            // Show Rating Form if Not Submitted
            <div className="modal-body text-center">
              <h6 className="mb-3">How was your experience?</h6>

              {/* Emoji Rating with Labels */}
              <div className="d-flex justify-content-center gap-3 mb-4">
                {emojis.map((item) => (
                  <div
                    key={item.value}
                    className={`d-flex flex-column align-items-center rating-emoji ${
                      rating === item.value ? "selected" : ""
                    }`}
                    onClick={() => setRating(item.value)}
                  >
                    <span
                      className={`fs-1 ${
                        rating === item.value
                          ? "border border-primary rounded-circle bg-light"
                          : ""
                      }`}
                      title={item.label}
                    >
                      {item.icon}
                    </span>
                    <small>
                      <span className="mt-1">{item.label}</span>
                    </small>
                  </div>
                ))}
              </div>

              {/* Review Textarea */}
              <textarea
                className="form-control border rounded p-2"
                rows="2"
                placeholder="Leave a comment (optional)"
                value={review}
                onChange={(e) => setReview(e.target.value)}
              />

              {/* Buttons */}
              <div className="mt-2">
                <button
                  className="btn btn-primary w-100"
                  onClick={handleSubmit}
                >
                  Submit
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatbotRating;