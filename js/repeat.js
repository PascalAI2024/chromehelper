// Repeat functionality
export const createRepeatManager = (state, elements, chat, log) => {
  let repeatTimer = null;

  const clearRepeatTimer = () => {
    if (repeatTimer) {
      clearTimeout(repeatTimer);
      repeatTimer = null;
    }
  };

  const scheduleNextMessage = () => {
    clearRepeatTimer();

    if (!state.repeat || !state.enabled || state.currentRepeatCount >= state.repeatCount) {
      stopRepeat();
      return;
    }

    // Calculate next interval, ensuring minimum delay
    const timeSinceLastResponse = Date.now() - state.lastResponseTime;
    const delay = Math.max(1000, state.repeatInterval - timeSinceLastResponse);

    repeatTimer = setTimeout(() => {
      if (!state.isWaitingForResponse && state.repeat && state.enabled) {
        const response = chat.getCurrentResponse();
        chat.sendMessage(response);
        state.currentRepeatCount++;
        log(`Repeat message ${state.currentRepeatCount}/${state.repeatCount}`);
        
        // Schedule next message if we haven't reached the count
        if (state.currentRepeatCount < state.repeatCount) {
          scheduleNextMessage();
        } else {
          stopRepeat();
        }
      } else {
        // If we can't send now, try again shortly
        setTimeout(scheduleNextMessage, 1000);
      }
    }, delay);
  };

  const startRepeat = () => {
    if (!state.isRepeating) {
      state.isRepeating = true;
      state.currentRepeatCount = 0;
      log('Started repeat cycle');
      scheduleNextMessage();
    }
  };

  const stopRepeat = () => {
    clearRepeatTimer();
    state.isRepeating = false;
    state.currentRepeatCount = 0;
    log('Stopped repeat cycle');
  };

  // Cleanup on state changes
  const handleStateChange = () => {
    if (!state.repeat || !state.enabled) {
      stopRepeat();
    }
  };

  return {
    startRepeat,
    stopRepeat,
    handleStateChange,
    scheduleNextMessage
  };
};