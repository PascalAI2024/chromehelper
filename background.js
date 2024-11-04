// Listen for installation or update
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // Open options page on first install
    chrome.runtime.openOptionsPage();
  }

  // Create context menu items
  chrome.contextMenus.create({
    id: 'selectChatInput',
    title: 'Set as Chat Input Box',
    contexts: ['all']
  });

  chrome.contextMenus.create({
    id: 'selectChatOutput',
    title: 'Set as Chat Output Box',
    contexts: ['all']
  });

  chrome.contextMenus.create({
    id: 'selectSubmitButton',
    title: 'Set as Submit Button',
    contexts: ['all']
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  const platform = new URL(tab.url).hostname;
  const settings = await chrome.storage.sync.get({
    platforms: []
  });

  // Find or create platform config
  let platformConfig = settings.platforms.find(p => p.urlPattern.includes(platform));
  if (!platformConfig) {
    platformConfig = {
      name: platform,
      urlPattern: `*://*.${platform}/*`,
      selectors: {
        input: '',
        output: '',
        submit: ''
      }
    };
    settings.platforms.push(platformConfig);
  }

  // Inject selector finder script
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: getSelectorForElement,
    args: [info.targetElementId]
  }).then(([result]) => {
    const selector = result.result;
    if (selector) {
      switch (info.menuItemId) {
        case 'selectChatInput':
          platformConfig.selectors.input = selector;
          break;
        case 'selectChatOutput':
          platformConfig.selectors.output = selector;
          break;
        case 'selectSubmitButton':
          platformConfig.selectors.submit = selector;
          break;
      }
      
      chrome.storage.sync.set({ platforms: settings.platforms });
      
      // Notify content script to update
      chrome.tabs.sendMessage(tab.id, { 
        type: 'updateSelectors',
        platform: platformConfig
      });
    }
  });
});

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'log' && message.debugMode) {
    console.log(`[${sender.tab.id}]`, message.data);
  }
  return true;
});

// Helper function to get unique selector for element
function getSelectorForElement(elementId) {
  const element = globalThis.browser.menus.getTargetElement(elementId);
  if (!element) return null;

  // Try to get a unique ID
  if (element.id) {
    return `#${element.id}`;
  }

  // Try to get a unique class combination
  if (element.classList.length) {
    const classSelector = `.${Array.from(element.classList).join('.')}`;
    if (document.querySelectorAll(classSelector).length === 1) {
      return classSelector;
    }
  }

  // Generate path using tag names and nth-child
  const path = [];
  let current = element;
  while (current && current !== document.body) {
    let selector = current.tagName.toLowerCase();
    if (current.parentElement) {
      const siblings = Array.from(current.parentElement.children);
      const index = siblings.indexOf(current) + 1;
      if (siblings.length > 1) {
        selector += `:nth-child(${index})`;
      }
    }
    path.unshift(selector);
    current = current.parentElement;
  }

  return path.join(' > ');
}