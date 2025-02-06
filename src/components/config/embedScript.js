const generateEmbedScript = (chatbotId) => {
    console.log('generateEmbedScript coming inside', chatbotId);
    const script = `
    <script>
        (function() {
            const iframe = document.createElement('iframe');
            iframe.src = 'http://localhost:3000/chatbot-widget/679f257a5ae98c2adf49eb4a';
            iframe.style.position = 'fixed';
            iframe.style.bottom = '80px';
            iframe.style.right = '40px';
            iframe.style.width = '450px';
            iframe.style.height = '550px';
            iframe.style.border = 'none';
            iframe.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
            iframe.style.borderRadius = '10px';
            iframe.style.overflow = 'hidden';
            iframe.style.zIndex = '1000';
            iframe.style.display = 'none';
            iframe.id = 'chatbot-widget';
            document.body.appendChild(iframe);

            setTimeout(() => {
                iframe.style.display = 'block';
            }, 10000);

            var toggleButton = document.createElement('button');
            toggleButton.innerText = 'Hi!';
            toggleButton.style.position = 'fixed';
            toggleButton.style.bottom = '30px';
            toggleButton.style.right = '20px';
            toggleButton.style.padding = '25px 25px';
            toggleButton.style.background = '#34b7f1';
            toggleButton.style.color = 'white';
            toggleButton.style.border = 'none';
            toggleButton.style.borderRadius = '50%';
            toggleButton.style.cursor = 'pointer';
            toggleButton.style.zIndex = '1001';

            toggleButton.onclick = function() {
                var chatbotIframe = document.getElementById('chatbot-widget');
                if (chatbotIframe.style.display === 'none') {
                    chatbotIframe.style.display = 'block';
                    toggleButton.innerText = 'Close';
                    chatbotIframe.style.width = window.innerWidth <= 768 ? '100%' : '350px';
                    chatbotIframe.style.height = window.innerWidth <= 768 ? '100%' : '500px';
                    chatbotIframe.style.bottom = window.innerWidth <= 768 ? '0' : '20px';
                    chatbotIframe.style.right = window.innerWidth <= 768 ? '0' : '20px';
                } else {
                    toggleButton.innerText = 'Hi!';
                    chatbotIframe.style.display = 'none';
                }   
            };
            document.body.appendChild(toggleButton);
        })();
    </script>
    `;
    return script;
    // setEmbedScript(script);
};

module.exports = generateEmbedScript;