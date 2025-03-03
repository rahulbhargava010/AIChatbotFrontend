import { useState } from "react";
import { Mic, Send } from "lucide-react";

const VoiceMessageInput = () => {
  const [message, setMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);

  const handleRecord = () => {
    setIsRecording(!isRecording);
    // Add voice recording logic here
  };

  const handleSend = () => {
    console.log("Message sent:", message);
    setMessage("");
  };

  return (
    <div className="flex items-center bg-white border p-2 rounded-full shadow-md w-96 justify-content-between">
     <div className="mic_div d-flex justify-content-around">
     <button
        onClick={handleRecord}
        className={`p-1 mt-0 rounded-full ${isRecording ? "bg-red-500" : "bg-gray-200"}`}
      >
        <Mic className="w-4 h-4 text-gray-700" />
      </button>
      <input
        type="text"
        placeholder="Ask Heree"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="flex-1 p-1 text-sm w-90 border-0 outline-none bg-transparent"
      />
      <button
        onClick={handleSend}
        className="p-1 mt-0 bg-black rounded-full text-white"
      >
        <Send className="w-4 h-4" />
      </button>
     </div>
    </div>
  );
};

export default VoiceMessageInput;
