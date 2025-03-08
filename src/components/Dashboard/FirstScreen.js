import { motion } from "framer-motion";


export const FirstScreen = ({ setShowFirstScreen, chatbotData }) => {
  return (
    <div
    className="text-center first_screen"
  > 
      <img
        src="https://magicpage-dev.propstory.com/ImageUploads/VBHC%20Landscape/1nnx534j6m7oc5zo9.webp"
        alt="image"
        className="animated"
      />
  

      <motion.div className="mt-5 text-center" 
      initial={{ opacity: 0, y: 20 }} // Start slightly below
      animate={{ opacity: 1, y: 0 }} // Move up and become visible
      transition={{ duration: 0.5, delay: 0.1 }} // Stagger effect>
      >
        <h3 className="fw-normal">
          Welcome! to AI {chatbotData?.chatbotName} Chatbot, How May <span className="fw-bold">I Assist <span className="d-block">You Today</span></span>
        </h3>
        <p className="pt-2">
          {chatbotData?.projectHighlights}
        </p>
      </motion.div>

      <motion.div className="text-center get_started"
     initial={{ opacity: 0, y: 20 }} // Start slightly below
     animate={{ opacity: 1, y: 0 }} // Move up and become visible
     transition={{ duration: 0.5, delay: 0.1 }}   >
        <button onClick={() => setShowFirstScreen(false)}>
          Get Started
          <div className="scroll-prompt">
            <div className="scroll-prompt-arrow-container">
              <div className="scroll-prompt-arrow"><div></div></div>
              <div className="scroll-prompt-arrow"><div></div></div>
              <div className="scroll-prompt-arrow"><div></div></div>
            </div>
          </div>
        </button>
      </motion.div>
      </div>
  );
};
