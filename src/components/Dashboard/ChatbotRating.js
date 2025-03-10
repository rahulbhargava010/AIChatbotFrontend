import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./ChatbotWidget.css";

const ChatbotRating = ({ isFullScreen, onSubmit, onClose }) => {
  const [rating, setRating] = useState(null);
  const [review, setReview] = useState("");

  // Emoji options with labels
  const emojis = [
    { value: "1", icon: "😠", label: "Poor" },
    { value: "2", icon: "😕", label: "Bad" },
    { value: "3", icon: "😐", label: "Average" },
    { value: "4", icon: "🙂", label: "Good" },
    { value: "5", icon: "😍", label: "Excellent" },
  ];


  const handleSubmit = async () => {
      if (!rating) {
        alert("⚠️ Please select a rating!");
        return;
      }

      // Send rating data to parent component
      onSubmit({ rating, review });
  };

  return (
    <div className="modal fade show d-block" tabIndex="-1" role="dialog">
      <div className="modal-dialog modal-fullscreen d-flex align-items-center justify-content-center">
      <div className={`modal-fullscreen modal-content p-1 ${isFullScreen ? "fullscreen-mode" : ""}`}>
        {/* <div className="modal-content p-1 window_bg_pink"> */}
          {/* Modal Header */}
          <div className="modal-header border-0 text-center">
            <h5 className="modal-title">Rate This Chat</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>

          {/* Modal Body */}
          <div className="modal-body text-center">
            <h6 className="mb-3">How was your experience?</h6>

            {/* Emoji Rating with Labels */}
            <div className="d-flex justify-content-center gap-3 mb-4">
              {emojis.map((item) =>
               (
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
              placeholder="Leave a comment (required)"
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
        </div>
      </div>
    </div>
  );
};

export default ChatbotRating;
