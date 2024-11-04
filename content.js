let observer = null;
let settings = null;
let platform = null;

// Initialize the extension
async function init() {
  settings = await chrome.storage.sync.get({
    enabled: true,
    platforms: [],
    debugMode: false
  });

  if (!settings.enabled) return;

  // Find matching platform configuration
  platform = settings.platforms.find(p => 
    new RegExp(p.urlPattern.replace(/\*/g, '.*')).test(window.location.href)
  );

  if (!platform) {
    if (settings.debugMode) {
      console.log('No matching platform configuration found');
    }
    return;
  }

  setupObserver();
}

// Set up the mutation observer
function setupObserver() {
  if (observer) {
    observer.disconnect();
  }

  observer = new MutationObserver(handleMutations);
  
  // Observe the entire document for changes
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true
  });
}

// Handle DOM mutations
function handleMutations(mutations) {
  for (const mutation of mutations) {
    if (isNewResponse(mutation)) {
      handleNewResponse();
      break;
    }
  }
}

// Check if a mutation represents a new chatbot response
function isNewResponse(mutation) {
  if (!platform?.selectors?.output) return false;
  
  const outputElements = document.querySelectorAll(platform.selectors.output);
  if (!outputElements.length) return false;

  const lastOutput = outputElements[outputElements.length - 1];
  return mutation.target === lastOutput || lastOutput.contains(mutation.target);
}

// Handle new chatbot response
async function handleNewResponse() {
  if (!platform?.selectors?.input) return;

  const inputElement = document.querySelector(platform.selectors.input);
  if (!inputElement) {
    if (settings.debugMode) {
      console.log('Input element not found');
    }
    return;
  }

  // Insert predefined text
  inputElement.value = settings.predefinedText || '';
  inputElement.dispatchEvent(new Event('input', { bubbles: true }));

  if (settings.autoSubmit && platform?.selectors?.submit) {
    await autoSubmit();
  }
}

// Auto-submit the response
async function autoSubmit() {
  if (!platform?.selectors?.submit) return;

  if (settings.submitDelay > 0) {
    await new Promise(resolve => setTimeout(resolve, settings.submitDelay * 1000));
  }

  const submitButton = document.querySelector(platform.selectors.submit);
  if (submitButton) {
    submitButton.click();
    if (settings.debugMode) {
      console.log('Response auto-submitted');
    }
  } else if (settings.debugMode) {
    console.log('Submit button not found');
  }
}

// Add highlight effect for selector
function addHighlight(element) {
  const overlay = document.createElement('div');
  overlay.style.position = 'absolute';
  overlay.style.border = '2px solid #3b82f6';
  overlay.style.borderRadius = '4px';
  overlay.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
  overlay.style.pointerEvents = 'none';
  overlay.style.zIndex = '10000';
  
  const rect = element.getBoundingClientRect();
  overlay.style.top = `${rect.top + window.scrollY}px`;
  overlay.style.left = `${rect.left + window.scrollX}px`;
  overlay.style.width = `${rect.width}px`;
  overlay.style.height = `${rect.height}px`;
  
  document.body.appendChild(overlay);
  setTimeout(() => overlay.remove(), 1500);
}

// Initialize the extension
init();

// Listen for settings changes
chrome.storage.onChanged.addListener((changes) => {
  Object.keys(changes).forEach(key => {
    settings[key] = changes[key].newValue;
  });
  
  if (changes.enabled || changes.platforms) {
    init();
  }
});

// Listen for selector updates from context menu
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'updateSelectors') {
    platform = message.platform;
    if (settings.debugMode) {
      console.log('Selectors updated:', platform.selectors);
    }
    
    // Highlight the selected element
    const element = document.querySelector(platform.selectors[message.selectorType]);
    if (element) {
      addHighlight(element);
    }
  }
});