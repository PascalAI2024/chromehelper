// UI management
export const createUI = (elements, state, presetManager, log) => {
  const updatePresetSelect = () => {
    const presets = presetManager.getAllPresets();
    elements.presetSelect.innerHTML = '';

    Object.entries(presets).forEach(([id, preset]) => {
      const option = document.createElement('option');
      option.value = id;
      option.textContent = preset.name;
      elements.presetSelect.appendChild(option);
    });

    const manageOption = document.createElement('option');
    manageOption.value = '__manage__';
    manageOption.textContent = '✏️ Manage Presets...';
    elements.presetSelect.appendChild(manageOption);
  };

  const createPresetEditor = (id, preset) => {
    const div = document.createElement('div');
    div.className = 'bg-gray-50 rounded-lg p-4';
    div.innerHTML = `
      <div class="flex items-center justify-between mb-4">
        <input type="text" class="preset-name flex-1 px-3 py-2 border border-gray-300 rounded-lg mr-2" 
               value="${preset.name}" placeholder="Preset Name">
        ${id !== 'default' ? `
          <button class="delete-preset text-red-600 hover:text-red-700 p-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" 
                 stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 6h18"></path>
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
            </svg>
          </button>
        ` : ''}
      </div>

      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Initial Response</label>
          <textarea class="initial-response w-full px-3 py-2 border border-gray-300 rounded-lg h-24"
                    placeholder="Enter initial response">${preset.text}</textarea>
        </div>

        <div>
          <label class="flex items-center text-sm font-medium text-gray-700 mb-2">
            <input type="checkbox" class="repeat-enabled mr-2" ${preset.repeat?.enabled ? 'checked' : ''}>
            Enable Repeat Messages
          </label>

          <div class="repeat-messages space-y-2 ${preset.repeat?.enabled ? '' : 'hidden'}">
            ${(preset.repeat?.messages || []).map(msg => `
              <div class="flex items-center gap-2">
                <input type="text" class="repeat-message flex-1 px-3 py-2 border border-gray-300 rounded-lg" 
                       value="${msg}" placeholder="Enter repeat message">
                <button class="delete-message text-red-600 hover:text-red-700 p-1">×</button>
              </div>
            `).join('')}
            
            <button class="add-repeat-message px-3 py-1 text-sm text-blue-600 hover:text-blue-700">
              + Add Repeat Message
            </button>
          </div>
        </div>
      </div>
    `;

    attachPresetEditorListeners(div, id);
    return div;
  };

  const attachPresetEditorListeners = (div, id) => {
    if (id !== 'default') {
      div.querySelector('.delete-preset')?.addEventListener('click', () => {
        if (confirm('Are you sure you want to delete this preset?')) {
          presetManager.deletePreset(id);
          updatePresetSelect();
          div.remove();
        }
      });
    }

    const repeatEnabled = div.querySelector('.repeat-enabled');
    const repeatMessages = div.querySelector('.repeat-messages');
    
    repeatEnabled?.addEventListener('change', (e) => {
      repeatMessages.classList.toggle('hidden', !e.target.checked);
    });

    div.querySelector('.add-repeat-message')?.addEventListener('click', () => {
      const messageDiv = document.createElement('div');
      messageDiv.className = 'flex items-center gap-2';
      messageDiv.innerHTML = `
        <input type="text" class="repeat-message flex-1 px-3 py-2 border border-gray-300 rounded-lg" 
               placeholder="Enter repeat message">
        <button class="delete-message text-red-600 hover:text-red-700 p-1">×</button>
      `;

      messageDiv.querySelector('.delete-message')?.addEventListener('click', () => {
        messageDiv.remove();
      });

      repeatMessages.insertBefore(messageDiv, repeatMessages.lastElementChild);
    });

    div.querySelectorAll('.delete-message').forEach(btn => {
      btn.addEventListener('click', () => {
        btn.closest('.flex').remove();
      });
    });
  };

  const showPresetManager = () => {
    const presets = presetManager.getAllPresets();
    elements.presetList.innerHTML = '';

    Object.entries(presets).forEach(([id, preset]) => {
      elements.presetList.appendChild(createPresetEditor(id, preset));
    });

    elements.presetManager.classList.remove('hidden');
  };

  const hidePresetManager = () => {
    elements.presetManager.classList.add('hidden');
  };

  return {
    updatePresetSelect,
    showPresetManager,
    hidePresetManager,
    createPresetEditor
  };
};