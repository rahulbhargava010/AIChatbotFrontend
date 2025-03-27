const generateEmbedScript = (chatbotId) => {
    const script = `
    <script>
       (function() {
        const iframe = document.createElement('iframe');
        iframe.src = 'https://assist-ai.propstory.com/chatbot-widget/${chatbotId}';
         iframe.style.position = 'fixed';
        iframe.style.bottom = window.innerWidth <= 768 ? '13%' : '85px';
     iframe.style.right = window.innerWidth <= 768 ? '3%' : '40px';
     iframe.style.width = window.innerWidth <= 768 ? '95%' : '365px';
     iframe.style.height = window.innerWidth <= 768 ? '85%' : '500px';
        iframe.style.border = 'none';
        iframe.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
        iframe.style.borderRadius = '10px';
        iframe.style.overflow = 'hidden';
        iframe.style.zIndex = '99999999';
        iframe.style.display = 'none';
        iframe.id = 'chatbot-widget';
        document.body.appendChild(iframe);

        setTimeout(() => {
            iframe.style.display = 'block';
        }, 10000);

        var toggleButton = document.createElement('button');
        var toggleImage = document.createElement('img');
        toggleImage.src = "http://assist-ai.propstory.com/uploads/chat-bot-gif.gif"; 
        toggleImage.alt = "AI Chatbot";

        // toggleButton.innerText = 'Hi!';
        // toggleButton.style.position = 'fixed';
        // toggleButton.style.bottom = '30px';
        // toggleButton.style.right = '20px';
        toggleButton.style.padding = '25px 25px';
        toggleButton.style.background = '#34b7f1';
        // toggleButton.style.color = 'white';
        // toggleButton.style.border = 'none';
        // toggleButton.style.borderRadius = '50%';
        // toggleButton.style.cursor = 'pointer';
        // toggleButton.style.zIndex = '9999999999';

        toggleImage.style.position = 'fixed';
        toggleImage.style.bottom = '10px';
        toggleImage.style.right = '20px';
        // toggleImage.style.padding = '25px 25px';
        // toggleImage.style.background = '#34b7f1';
        // toggleImage.style.color = 'white';
        // toggleImage.style.border = 'none';
        // toggleImage.style.borderRadius = '50%';
        toggleImage.style.cursor = 'pointer';
        toggleImage.style.zIndex = '99999999999';

        

        // Set width and height (optional)
        toggleImage.width = 70;
        toggleImage.height = 70;


        toggleImage.onclick = function() {
            var chatbotIframe = document.getElementById('chatbot-widget');
            if (chatbotIframe.style.display === 'none') {
                chatbotIframe.style.display = 'block';
                // toggleButton.innerText = 'Close';
               toggleImage.src = "http://assist-ai.propstory.com/uploads/letter-x-gif.gif"; 
                chatbotIframe.style.width = window.innerWidth <= 768 ? '95%' : '365px';
             chatbotIframe.style.height = window.innerWidth <= 768 ? '85%' : '500px';
             chatbotIframe.style.bottom = window.innerWidth <= 768 ? '13%' : '85px';
             chatbotIframe.style.right = window.innerWidth <= 768 ? '3%' : '40px';
                console.log("width set to 550");
            } else {
                // toggleButton.innerText = 'Hi!';
                toggleImage.src = "http://assist-ai.propstory.com/uploads/chat-bot-gif.gif"; 
                chatbotIframe.style.display = 'none';
            }   
        };
        document.body.appendChild(toggleImage);
        // document.body.appendChild(toggleButton);
    })();


    </script>
    `;
    return script;
};

module.exports = generateEmbedScript;
