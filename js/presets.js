// Preset management for demo
export const createPresetManager = () => {
  const defaultPresets = {
    default: {
      name: 'Smart Response',
      type: 'smart',
      text: '',
      repeat: {
        enabled: false,
        messages: []
      }
    },
    positive: {
      name: 'Positive',
      type: 'fixed',
      text: 'Thank you for your message! I\'d be happy to help with that.',
      repeat: {
        enabled: true,
        messages: [
          'Is there anything specific you\'d like to know?',
          'I can provide more details if needed.',
          'Would you like me to explain further?'
        ]
      }
    },
    negative: {
      name: 'Negative',
      type: 'fixed',
      text: 'I apologize, but I cannot assist with that request.',
      repeat: {
        enabled: true,
        messages: [
          'Perhaps I can help with something else?',
          'Is there an alternative you\'d like to explore?',
          'Let me know if you have other questions.'
        ]
      }
    }
  };

  let presets = { ...defaultPresets };

  const getPreset = (id) => presets[id] || defaultPresets.default;
  
  const addPreset = (id, preset) => {
    presets[id] = preset;
  };

  const updatePreset = (id, updates) => {
    if (presets[id]) {
      presets[id] = { ...presets[id], ...updates };
    }
  };

  const deletePreset = (id) => {
    if (id !== 'default') {
      delete presets[id];
    }
  };

  const getAllPresets = () => ({ ...presets });

  const resetToDefaults = () => {
    presets = { ...defaultPresets };
  };

  return {
    getPreset,
    addPreset,
    updatePreset,
    deletePreset,
    getAllPresets,
    resetToDefaults
  };
};