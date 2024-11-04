// State management
export const createState = () => ({
  enabled: true,
  repeat: false,
  debug: false,
  currentPreset: 'default',
  submitDelay: 1000,
  repeatInterval: 5000,
  repeatCount: 5,
  currentRepeatCount: 0,
  repeatTimer: null,
  customResponse: '',
  isWaitingForResponse: false,
  lastResponseTime: 0,
  responseObserver: null,
  typingIndicator: false,
  isRepeating: false
});