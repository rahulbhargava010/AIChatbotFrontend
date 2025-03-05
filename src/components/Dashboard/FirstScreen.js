export const FirstScreen = ({ setShowFirstScreen }) => {
  return (
    <div className="text-center first_screen">
      <img
        src="https://magicpage-dev.propstory.com/ImageUploads/VBHC%20Landscape/1nnx534j6m7oc5zo9.webp"
        alt="image"
        className="animated"
      />

      <div className="mt-5 text-center">
        <h3 className="fw-normal">
          How May <span className="fw-bold">I Assist <span className="d-block">You Today</span></span>
        </h3>
        <p className="pt-2">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Iure quos doloremque repellendus explicabo.?
        </p>
      </div>

      <div className="text-center get_started">
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
      </div>
    </div>
  );
};
