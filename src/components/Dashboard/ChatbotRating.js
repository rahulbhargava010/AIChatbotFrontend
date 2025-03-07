import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./ChatbotWidget.css"

const ChatbotRating = ({ onClose, onSubmit }) => {
  const [rating, setRating] = useState(null);
  const [review, setReview] = useState("");

  // Emoji options with labels
  const emojis = [
    { value: 1, icon: "😠", label: "Very Bad" },
    { value: 2, icon: "😕", label: "Bad" },
    { value: 3, icon: "😐", label: "Neutral" },
    { value: 4, icon: "🙂", label: "Good" },
    { value: 5, icon: "😍", label: "Excellent" },
  ];

  const handleSubmit = () => {
    if (!rating) {
      alert("Please select a rating!");
      return;
    }
  
    if (!review.trim()) {
      alert("Please enter a comment before submitting!"); // Ensure review is not empty
      return;
    }
  
    onSubmit({ rating, review });
    onClose(); // Close modal after submitting
  };
  
  

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      role="dialog"
    >
      <div className="modal-dialog modal-fullscreen d-flex align-items-center justify-content-center">
        <div className="modal-content p-4 window_bg_pink">
          {/* Modal Header */}
          <div className="modal-header border-0">
            <h5 className="modal-title">Rate This Chat</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>

          {/* Modal Body */}
          <div className="modal-body text-center">
            <h6 className="mb-3">How was your experience?</h6>

            {/* Emoji Rating with Labels */}
            <div className="d-flex justify-content-center gap-3 mb-4">
              {emojis.map((item) => (
                <div
                  key={item.value}
                  className="d-flex flex-column align-items-center"
                  style={{ cursor: "pointer" }}
                  onClick={() => setRating(item.value)}
                >
                  <span
                    className={`fs-1 ${rating === item.value ? "border border-primary rounded-circle p-2" : ""}`}
                    title={item.label}
                  >
                    {item.icon}
                  </span>
                  <span className="mt-1">{item.label}</span>
                </div>
              ))}
            </div>

            {/* Review Textarea */}
            <textarea
              className="form-control border-0"
              rows="2"
              placeholder="Leave a comment (optional)"
              value={review}
              required
              onChange={(e) => setReview(e.target.value)}
            />

            {/* Buttons */}
            <div className="mt-4">
              {/* <button className="btn btn-secondary" onClick={onClose}>Cancel</button> */}
              <button className="btn btn-primary" onClick={handleSubmit}>Submit</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatbotRating;
