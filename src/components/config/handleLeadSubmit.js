import axios from "axios";

const handleLeadSubmit = async (
  e,
  leadData,
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
  api
) => {
  e.preventDefault();
  console.log("handleLeadSubmit function called");

  try {
    const userAgent = navigator.userAgent;
    const device = /mobile/i.test(userAgent) ? "Mobile" : "Desktop";

    // console.log("Fetching IP address...");
    const ipResponse = await axios.get("https://api.ipify.org?format=json");
    console.log("IP Response:", ipResponse.data);

    const ipAddress = ipResponse.data.ip;

    let location = {};
    try {
      console.log("Fetching Geolocation...");
      const geoResponse = await axios.get(
        `https://ipapi.co/${ipAddress}/json/`
      );
      console.log("Geolocation Response:", geoResponse.data);

      location = {
        country: geoResponse.data.country_name,
        region: geoResponse.data.region,
        city: geoResponse.data.city,
        latitude: geoResponse.data.latitude,
        longitude: geoResponse.data.longitude,
      };
    } catch (error) {
      console.error("Error fetching geolocation data:", error);
    }

    const updatedLeadData = {
      ...leadData,
      ipAddress,
      userAgent,
      device,
      location,
    };

    console.log("LeadData:", updatedLeadData);

    // console.log("Saving lead data...");
    await api.post("/leads/save", {
      chatbotId,
      leadData: updatedLeadData,
      conversation,
    });
    // console.log("Lead data saved successfully!");

    alert("Lead saved successfully!");
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        sender: "Bot",
        text: (
          <>
            Thank you! <strong>{leadData.name.toUpperCase()}</strong>, for submitting your enquiry!
          </>
        )
        
      },
    ]);
    // setFormVisible(false);

    console.log("Saving analytics event...");
    await api.post("analytics/saveEvent", {
      eventType: "form_submission",
      sessionId: uniqueSessionId,
      messages,
      chatbotId,
      leadData: updatedLeadData,
    });
    console.log("Analytics event saved!");
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
};

export default handleLeadSubmit;
