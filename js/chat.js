// Chat functionality
export const createChat = (state, elements, log) => {
  const getSmartResponse = (text) => {
    text = text.toLowerCase();
    
    if (text.match(/^(hi|hello|hey|greetings)/)) {
      return botResponses.greeting[Math.floor(Math.random() * botResponses.greeting.length)];
    }
    
    if (text.match(/^(bye|goodbye|see you|farewell)/)) {
      return botResponses.farewell[Math.floor(Math.random() * botResponses.farewell.length)];
    }
    
    return botResponses.default[Math.floor(Math.random() * botResponses.default.length)];
  };

  const getCurrentResponse = async (userInput = '', isRepeat = false) => {
    const presets = await chrome.storage.sync.get('presets');
    const currentPreset = presets[state.currentPreset];

    if (!currentPreset) {
      return getSmartResponse(userInput);
    }

    if (isRepeat && currentPreset.repeat?.enabled && currentPreset.repeat.messages.length > 0) {
      const messageIndex = state.currentRepeatCount % currentPreset.repeat.messages.length;
      return currentPreset.repeat.messages[messageIndex];
    }

    return currentPreset.text || getSmartResponse(userInput);
  };

  const simulateTyping = (callback, text) => {
    const typingTime = Math.min(text.length * 50, 2000);
    elements.typingIndicator.classList.remove('hidden');
    state.isWaitingForResponse = true;
    
    setTimeout(() => {
      elements.typingIndicator.classList.add('hidden');
      callback();
    }, typingTime);
  };

  const addMessage = (text, isUser = true) => {
    const div = document.createElement('div');
    div.className = `flex ${isUser ? 'justify-end' : ''}`;
    div.innerHTML = `
      <div class="max-w-[80%] ${isUser ? 'bg-blue-600 text-white' : 'bg-gray-100'} rounded-lg px-4 py-2">
        ${text}
      </div>
    `;
    elements.chatOutput.appendChild(div);
    elements.chatOutput.scrollTop = elements.chatOutput.scrollHeight;
    log(`Message ${isUser ? 'sent' : 'received'}: ${text}`);

    if (!isUser) {
      state.lastResponseTime = Date.now();
      state.isWaitingForResponse = false;
    }
  };

  const sendMessage = async (text, isRepeat = false) => {
    if (!text.trim() || (state.isWaitingForResponse && !isRepeat)) return;
    
    addMessage(text);
    if (!isRepeat) {
      elements.chatInput.value = '';
    }
    
    const response = await getCurrentResponse(text, isRepeat);
    simulateTyping(() => {
      addMessage(response, false);
    }, response);
  };

  return {
    sendMessage,
    getCurrentResponse
  };
};