import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./ChatbotWidget.css";

const ChatbotRating = ({ isFullScreen, onSubmit, onClose }) => {
  const [rating, setRating] = useState(null);
  const [review, setReview] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false); // Track submission status

  // Emoji options with labels
  const emojis = [
    { value: "1", icon: "😠", label: "Poor" },
    { value: "2", icon: "😕", label: "Bad" },
    { value: "3", icon: "😐", label: "Average" },
    { value: "4", icon: "🙂", label: "Good" },
    { value: "5", icon: "😍", label: "Excellent" },
  ];

  // Function to return a message based on the rating
  const getThankYouMessage = () => {
    switch (rating) {
      case "1":
        return { title: "We're Sorry! 😔", message: "We’ll work hard to improve your experience." };
      case "2":
        return { title: "Thank You! 🙁", message: "We appreciate your feedback and will do better!" };
      case "3":
        return { title: "Thanks! 🙂", message: "We’ll strive to provide a better experience next time!" };
      case "4":
        return { title: "Great! 😊", message: "We’re glad you had a wonderful and good experience!" };
      case "5":
        return { title: "Awesome! 🎉", message: "We love to hear that you enjoyed our service!" };
      default:
        return { title: "Thank You!", message: "We appreciate your feedback!" };
    }
  };

  const handleSubmit = () => {
    if (!rating) {
      alert("⚠️ Please select a rating!");
      return;
    }

    // Send rating data to parent component
    onSubmit({ rating, review });

    // Show Thank You message
    setIsSubmitted(true);

    // Clear rating and review after submission (optional)
    setTimeout(() => {
      setIsSubmitted(false);
      setRating("");
      setReview("");
      onClose(); // Close the modal after 3 seconds
    }, 3000000);
  };

  return (
    <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ zIndex: "999999" }}>
      <div className="modal-dialog modal-fullscreen d-flex align-items-center justify-content-center">
        <div className={`modal-fullscreen modal-content window_bg_pink p-1 ${isFullScreen ? "fullscreen-mode" : ""}`}>
          {/* Modal Header */}
          <div className="modal-header border-0 text-center">
            <h5 className="modal-title">Rate This Chat</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>

          {/* Show Thank You Message if Submitted */}
          {isSubmitted ? (
            <div className="chatbot_wrapper text-center p-4">
              <svg className="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                <circle className="checkmark__circle" cx="26" cy="26" r="25" fill="none" />
                <path className="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
              </svg>
              <h4 className="mt-2">{getThankYouMessage().title}</h4>
              <p>{getThankYouMessage().message}</p>
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
                        rating === item.value ? "border border-primary rounded-circle bg-light" : ""
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
                <button className="btn btn-primary w-100" onClick={handleSubmit}>
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
