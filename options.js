document.addEventListener('DOMContentLoaded', async () => {
  const platformsContainer = document.getElementById('platforms');
  const addPlatformBtn = document.getElementById('addPlatform');
  const debugMode = document.getElementById('debugMode');
  const resetBtn = document.getElementById('resetSettings');
  const saveBtn = document.getElementById('saveSettings');

  const defaultPlatforms = [
    {
      name: 'ChatGPT',
      urlPattern: 'https://chat.openai.com/*',
      selectors: {
        input: 'textarea[data-id="root"]',
        output: '.markdown',
        submit: 'button[data-testid="send-button"]'
      }
    },
    {
      name: 'Google Bard',
      urlPattern: 'https://bard.google.com/*',
      selectors: {
        input: 'rich-textarea[aria-label="Message textarea"]',
        output: '.response-content',
        submit: 'button[aria-label="Send message"]'
      }
    }
  ];

  // Load saved settings
  const settings = await chrome.storage.sync.get({
    platforms: defaultPlatforms,
    debugMode: false
  });

  debugMode.checked = settings.debugMode;

  // Create platform configuration UI
  const createPlatformConfig = (platform) => {
    const div = document.createElement('div');
    div.className = 'platform-config';
    div.innerHTML = `
      <div class="flex justify-between items-center mb-4">
        <input type="text" class="platform-name w-1/3" value="${platform.name}" placeholder="Platform Name">
        <button class="remove-platform px-2 py-1 text-red-600 hover:text-red-800">Remove</button>
      </div>
      <div class="space-y-4">
        <div>
          <label>URL Pattern</label>
          <input type="text" class="url-pattern" value="${platform.urlPattern}" placeholder="https://example.com/*">
        </div>
        <div>
          <label>Input Selector</label>
          <input type="text" class="input-selector" value="${platform.selectors.input}" placeholder="CSS Selector">
        </div>
        <div>
          <label>Output Selector</label>
          <input type="text" class="output-selector" value="${platform.selectors.output}" placeholder="CSS Selector">
        </div>
        <div>
          <label>Submit Button Selector</label>
          <input type="text" class="submit-selector" value="${platform.selectors.submit}" placeholder="CSS Selector">
        </div>
      </div>
    `;

    div.querySelector('.remove-platform').addEventListener('click', () => {
      div.remove();
    });

    return div;
  };

  // Add existing platforms
  settings.platforms.forEach(platform => {
    platformsContainer.appendChild(createPlatformConfig(platform));
  });

  // Add new platform
  addPlatformBtn.addEventListener('click', () => {
    const newPlatform = {
      name: '',
      urlPattern: '',
      selectors: {
        input: '',
        output: '',
        submit: ''
      }
    };
    platformsContainer.appendChild(createPlatformConfig(newPlatform));
  });

  // Reset settings
  resetBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to reset all settings to defaults?')) {
      platformsContainer.innerHTML = '';
      defaultPlatforms.forEach(platform => {
        platformsContainer.appendChild(createPlatformConfig(platform));
      });
      debugMode.checked = false;
    }
  });

  // Save settings
  saveBtn.addEventListener('click', async () => {
    const platforms = Array.from(platformsContainer.children).map(div => ({
      name: div.querySelector('.platform-name').value,
      urlPattern: div.querySelector('.url-pattern').value,
      selectors: {
        input: div.querySelector('.input-selector').value,
        output: div.querySelector('.output-selector').value,
        submit: div.querySelector('.submit-selector').value
      }
    }));

    await chrome.storage.sync.set({
      platforms,
      debugMode: debugMode.checked
    });

    alert('Settings saved successfully!');
  });
});