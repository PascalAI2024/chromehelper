// Chat management
export const createChatManager = (elements, state, presetManager, log) => {
  const sendMessage = async () => {
    const message = elements.chatInput.value.trim();
    if (!message) return;

    log(message, 'user');
    elements.chatInput.value = '';

    const preset = presetManager.getPreset(state.currentPreset);
    const delay = parseFloat(elements.delayInput.value) * 1000;

    await new Promise(resolve => setTimeout(resolve, delay));

    if (state.messageCount === 0) {
      log(preset.text, 'bot');
    } else if (preset.repeat?.enabled && preset.repeat.messages.length > 0) {
      const repeatMessage = preset.repeat.messages[state.repeatIndex % preset.repeat.messages.length];
      log(repeatMessage, 'bot');
      state.repeatIndex++;
    }

    state.messageCount++;

    if (elements.autoSubmit.checked) {
      await new Promise(resolve => setTimeout(resolve, delay));
      sendMessage();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') sendMessage();
  };

  return {
    sendMessage,
    handleKeyPress
  };
};