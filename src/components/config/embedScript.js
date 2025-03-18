const generateEmbedScript = (chatbotId) => {
    const script = `
    <script>
        (function() {
            const iframe = document.createElement('iframe');
            iframe.src = 'https://assist-ai.propstory.com/chatbot-widget/${chatbotId}';
            iframe.id = 'chatbot-widget';
            iframe.style.position = 'fixed';
            iframe.style.width = '90%';
            iframe.style.height = '80%';
            iframe.style.maxWidth = '350px';
            iframe.style.maxHeight = '400px';
            iframe.style.border = 'none';
            iframe.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
            iframe.style.borderRadius = '10px';
            iframe.style.overflow = 'hidden';
            iframe.style.zIndex = '999999999';
            iframe.style.display = 'none';
            iframe.style.left = '50%';
            iframe.style.top = 'toggleImage.alt = "AI Chatbot";0%';
            iframe.style.transform = 'translate(-50%, -50%)';
            document.body.appendChild(iframe);

            setTimeout(() => {
                iframe.style.display = 'block';
            }, 10000);

            var toggleImage = document.createElement('img');
            toggleImage.src = "http://assist-ai.propstory.com/uploads/chat-bot-gif.gif";
            toggleImage.alt = "AI Chatbot";
            toggleImage.style.position = 'fixed';
            toggleImage.style.bottom = '10px';
            toggleImage.style.right = '10px';
            toggleImage.style.cursor = 'pointer';
            toggleImage.style.zIndex = '99999999999';
            toggleImage.width = 70;
            toggleImage.height = 70;

            toggleImage.onclick = function() {
                var chatbotIframe = document.getElementById('chatbot-widget');
                if (chatbotIframe.style.display === 'none') {
                    chatbotIframe.style.display = 'block';
                    toggleImage.src = "http://assist-ai.propstory.com/uploads/letter-x-gif.gif";
                } else {
                    toggleImage.src = "http://assist-ai.propstory.com/uploads/chat-bot-gif.gif";
                    chatbotIframe.style.display = 'none';
                }   
            };
            document.body.appendChild(toggleImage);
        })();
    </script>
    `;
    return script;
};

module.exports = generateEmbedScript;
