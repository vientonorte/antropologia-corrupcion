let sidebar = null;

function createSidebar() {
  if (sidebar) return;
  sidebar = document.createElement('div');
  sidebar.id = 'dihe-sidebar';
  sidebar.innerHTML = `
    <div id="dihe-header">
      <span>Dihë</span>
      <button id="dihe-close" aria-label="Cerrar sidebar">&times;</button>
    </div>
    <div id="dihe-chat"></div>
    <div id="dihe-input-area">
      <input type="text" id="dihe-input" placeholder="Escribe tu mensaje..." aria-label="Mensaje para Dihë" />
      <button id="dihe-send" aria-label="Enviar mensaje">Enviar</button>
    </div>
    <div id="dihe-settings">
      <label for="openai-key">Clave OpenAI (API key):</label>
      <input type="password" id="openai-key" placeholder="sk-..." aria-label="Clave API de OpenAI" />
      <button id="save-key" aria-label="Guardar clave">Guardar</button>
      <span id="key-status" style="margin-left:10px;"></span>
    </div>
  `;
  document.body.appendChild(sidebar);

  document.getElementById('dihe-close').onclick = () => sidebar.style.display = 'none';
  document.getElementById('dihe-send').onclick = sendMessage;
  document.getElementById('dihe-input').onkeydown = (e) => {
    if (e.key === 'Enter') sendMessage();
  };
  document.getElementById('save-key').onclick = saveOpenAIKey;

  // Cargar clave almacenada si existe
  chrome.storage.local.get(['openaiKey'], function(result) {
    if (result.openaiKey) {
      document.getElementById('openai-key').value = result.openaiKey;
      document.getElementById('key-status').textContent = 'Clave guardada';
      document.getElementById('key-status').style.color = 'green';
    }
  });
}

function toggleSidebar() {
  if (!sidebar) createSidebar();
  sidebar.style.display = sidebar.style.display === 'none' ? 'block' : 'none';
}

function sendMessage() {
  const input = document.getElementById('dihe-input');
  const msg = input.value.trim();
  if (!msg) return;
  const chat = document.getElementById('dihe-chat');
  chat.innerHTML += `<div class="dihe-msg user">${msg}</div>`;
  input.value = '';

  // Llamada al backend/chatbot usando la clave almacenada
  chrome.storage.local.get(['openaiKey'], function(result) {
    const apiKey = result.openaiKey || '';
    if (!apiKey) {
      chat.innerHTML += `<div class="dihe-msg bot">Por favor, ingresa tu clave de OpenAI en Configuración.</div>`;
      return;
    }
    // Aquí iría la llamada real a la API de OpenAI
    chat.innerHTML += `<div class="dihe-msg bot">[respuesta simulada: integración OpenAI pendiente]</div>`;
  });
}

function saveOpenAIKey() {
  const keyInput = document.getElementById('openai-key');
  const keyStatus = document.getElementById('key-status');
  const apiKey = keyInput.value.trim();

  if (apiKey.startsWith('sk-')) {
    chrome.storage.local.set({'openaiKey': apiKey}, function() {
      keyStatus.textContent = 'Clave guardada';
      keyStatus.style.color = 'green';
    });
  } else {
    keyStatus.textContent = 'Clave inválida';
    keyStatus.style.color = 'red';
  }
}

chrome.runtime.onMessage.addListener((request) => {
  if (request.action === "toggleSidebar") {
    toggleSidebar();
  }
});

// Inicialización automática en GitHub
if (window.location.hostname === "github.com") {
  createSidebar();
  sidebar.style.display = 'none';
}