import axios from "axios";
// Import api directly instead of receiving it as a parameter
import api from "../config/axios";

const handleLeadSubmit = async (
  e,
  leadData,
  setLeadData,
  chatbotId,
  conversation,
  setMessages,
  setFormVisible,
  setFormSubmitted,
  setShowRating,
  setChatVisible,
  setIsTyping,
  uniqueSessionId,
  messages,
  setIsSubmitDisabled 
) => {
  e.preventDefault();
  console.log("handleLeadSubmit function called");

  setIsSubmitDisabled(true); // ✅ Disable submit button

  try {
    const userAgent = navigator.userAgent;
    const device = /mobile/i.test(userAgent) ? "Mobile" : "Desktop";

    // Get IP address
    const ipResponse = await axios.get("https://api.ipify.org?format=json");
    console.log("IP Response:", ipResponse.data);
    const ipAddress = ipResponse.data.ip;

    // Get Geolocation
    let location = {};
    try {
      console.log("Fetching Geolocation...");
      const geoResponse = await axios.get(`https://ipapi.co/${ipAddress}/json/`);
      console.log("Geolocation Response:", geoResponse.data);

      location = {
        country: geoResponse.data.country_name,
        region: geoResponse.data.region,
        city: geoResponse.data.city,
        lat: geoResponse.data.latitude,
        lng: geoResponse.data.longitude,
      };
    } catch (error) {
      console.error("Error fetching geolocation data:", error);
    }

    // Prepare lead data
    const updatedLeadData = {
      ...leadData,
      ipAddress,
      userAgent,
      device,
      location,
    };

    console.log("LeadData:", updatedLeadData);

    // Save lead data
    const leadResponse = await api.post("/leads/save", {
      chatbotId,
      leadData: updatedLeadData,
      conversation,
    });

    setLeadData({ ...leadData, id: leadResponse?.data?.lead?._id });
    const leadName = leadData?.name?.toUpperCase();
    setMessages((prevMessages) => [
      ...prevMessages,
      { sender: "Bot", text: `Thank you! ${leadName}, for submitting your enquiry!` },
    ]);

    // Save analytics event
    console.log("Saving analytics event...");
    await api.post("analytics/saveEvent", {
      eventType: "form_submission",
      sessionId: uniqueSessionId,
      messages,
      chatbotId,
      leadData: updatedLeadData,
    });

    setFormSubmitted(true);
    setIsTyping(false);
    setTimeout(() => {
      setFormVisible(false);
      setChatVisible(true);
      setShowRating(true);
    }, 3000);
  } catch (error) {
    console.error("Error in handleLeadSubmit:", error);
    alert("Failed to save lead.");
  }

  // ✅ Re-enable submit button after 3 seconds
  setTimeout(() => {
    setIsSubmitDisabled(false);
  }, 3000);
};


export default handleLeadSubmit;