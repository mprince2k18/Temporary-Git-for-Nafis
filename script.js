const { ipcRenderer } = window.electron || {};

// Settings state
let settings = {
  clockType: 'digital', // digital or analog
  clockFormat: '12',
  theme: 'dark',
  size: '2', // 1=small, 2=medium, 3=large (for digital)
  opacity: '100',
  analogSize: '2', // 1=small, 2=medium, 3=large (for analog)
  analogRoundness: '100', // 30=rounded corners, 100=perfect circle
  draggingEnabled: true
};

// Size multipliers for digital clock
const sizeMultipliers = {
  '1': 0.8,
  '2': 1.0,
  '3': 1.2
};

// Size configurations for analog clock (diameter in pixels)
const analogSizeConfig = {
  '1': 150,  // Small - very compact
  '2': 300,  // Medium - default
  '3': 500   // Large - very large
};

// Load settings from localStorage
function loadSettings() {
  const saved = localStorage.getItem('clockSettings');
  if (saved) {
    settings = JSON.parse(saved);
  }
  applySettings();
}

// Save settings to localStorage
function saveSettings() {
  localStorage.setItem('clockSettings', JSON.stringify(settings));
}

// Draw analog clock
function drawAnalogClock() {
  const canvas = document.getElementById('analogClock');
  const ctx = canvas.getContext('2d');
  
  // Use analogSize setting (1=small, 2=medium, 3=large)
  const diameter = analogSizeConfig[settings.analogSize] || 280;
  canvas.width = diameter;
  canvas.height = diameter;
  const radius = diameter / 2;
  
  // Calculate proportional sizes based on diameter
  const borderThickness = diameter * 0.028; // ~8px at 280px
  const innerBorderThickness = diameter * 0.007; // ~2px at 280px
  const centerDotRadius = diameter * 0.021; // ~6px at 280px
  const markerOffset = diameter * 0.107; // ~30px at 280px
  const markerLargeWidth = diameter * 0.021; // ~6px at 280px
  const markerLargeHeight = diameter * 0.054; // ~15px at 280px
  const markerSmallWidth = diameter * 0.011; // ~3px at 280px
  const markerSmallHeight = diameter * 0.036; // ~10px at 280px
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  const now = new Date();
  let hour = now.getHours();
  let minute = now.getMinutes();
  let second = now.getSeconds();
  
  // Convert to 12-hour format for analog display
  hour = hour % 12;
  
  // Get roundness setting (30-100, where 100 is full circle, 30 is rounded corners)
  const roundness = parseInt(settings.analogRoundness) || 100;
  const borderRadius = (roundness / 100) * radius; // Convert percentage to actual radius
  
  // Draw outer rim with roundness
  const gradient = ctx.createRadialGradient(radius, radius, radius - 20, radius, radius, radius);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 0.05)');
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0.02)');
  ctx.fillStyle = gradient;
  drawRoundedShape(ctx, radius, radius, radius - 10, borderRadius);
  ctx.fill();
  
  // Draw thick border with gradient and roundness
  const borderGradient = ctx.createLinearGradient(0, 0, diameter, diameter);
  borderGradient.addColorStop(0, 'rgba(100, 200, 255, 0.6)');
  borderGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.8)');
  borderGradient.addColorStop(1, 'rgba(255, 100, 200, 0.6)');
  ctx.strokeStyle = borderGradient;
  ctx.lineWidth = borderThickness;
  drawRoundedShape(ctx, radius, radius, radius - 10, borderRadius);
  ctx.stroke();
  
  // Draw inner border with roundness
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.lineWidth = innerBorderThickness;
  drawRoundedShape(ctx, radius, radius, radius - (borderThickness * 2.5), borderRadius * 0.9);
  ctx.stroke();
  
  // Draw hour markers (modern style)
  for (let i = 0; i < 12; i++) {
    const ang = i * Math.PI / 6;
    ctx.save();
    ctx.translate(radius, radius);
    ctx.rotate(ang);
    
    // Larger markers for 12, 3, 6, 9
    if (i % 3 === 0) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.fillRect(-markerLargeWidth/2, -(radius - markerOffset), markerLargeWidth, markerLargeHeight);
    } else {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.fillRect(-markerSmallWidth/2, -(radius - markerOffset + 2), markerSmallWidth, markerSmallHeight);
    }
    ctx.restore();
  }
  
  // Draw center dot with glow (proportional size)
  ctx.shadowBlur = centerDotRadius * 1.5;
  ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(radius, radius, centerDotRadius, 0, 2 * Math.PI);
  ctx.fill();
  ctx.shadowBlur = 0;
  
  // Calculate hand widths proportionally
  const hourHandWidth = diameter * 0.028; // ~8px at 280px
  const minuteHandWidth = diameter * 0.018; // ~5px at 280px
  const secondHandWidth = diameter * 0.007; // ~2px at 280px
  
  // Draw hour hand (thicker, modern)
  const hourAngle = (hour * Math.PI / 6) + (minute * Math.PI / (6 * 60));
  drawHand(ctx, hourAngle, radius * 0.5, hourHandWidth, '#fff', radius);
  
  // Draw minute hand (sleek)
  const minuteAngle = (minute * Math.PI / 30) + (second * Math.PI / (30 * 60));
  drawHand(ctx, minuteAngle, radius * 0.75, minuteHandWidth, 'rgba(100, 200, 255, 0.9)', radius);
  
  // Draw second hand (thin, bright)
  const secondAngle = (second * Math.PI / 30);
  drawHand(ctx, secondAngle, radius * 0.85, secondHandWidth, 'rgba(255, 64, 129, 0.9)', radius);
  
  // Update date display for analog clock
  updateAnalogDate();
}

// Helper function to draw rounded/square shape
function drawRoundedShape(ctx, centerX, centerY, size, cornerRadius) {
  if (cornerRadius >= size) {
    // Draw circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, size, 0, 2 * Math.PI);
  } else if (cornerRadius <= 0) {
    // Draw square
    ctx.beginPath();
    ctx.rect(centerX - size, centerY - size, size * 2, size * 2);
  } else {
    // Draw rounded rectangle
    const x = centerX - size;
    const y = centerY - size;
    const width = size * 2;
    const height = size * 2;
    
    ctx.beginPath();
    ctx.moveTo(x + cornerRadius, y);
    ctx.lineTo(x + width - cornerRadius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + cornerRadius);
    ctx.lineTo(x + width, y + height - cornerRadius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - cornerRadius, y + height);
    ctx.lineTo(x + cornerRadius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - cornerRadius);
    ctx.lineTo(x, y + cornerRadius);
    ctx.quadraticCurveTo(x, y, x + cornerRadius, y);
    ctx.closePath();
  }
}

function drawHand(ctx, angle, length, width, color, centerX, centerY = centerX) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(centerX, centerY);
  ctx.lineTo(centerX + length * Math.sin(angle), centerY - length * Math.cos(angle));
  ctx.stroke();
}

// Update date display for analog clock
function updateAnalogDate() {
  const now = new Date();
  const date = now.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' });
  const dateElement = document.getElementById('analogDate');
  if (dateElement) {
    dateElement.textContent = date;
    
    // Scale date font size based on analog clock size
    const diameter = analogSizeConfig[settings.analogSize] || 300;
    const fontSize = Math.max(0.8, diameter / 300); // Scale relative to medium size
    dateElement.style.fontSize = `${fontSize}rem`;
  }
}

// Apply settings to the UI
function applySettings() {
  // Apply clock type
  applyClockType(settings.clockType);

  // Apply theme
  applyTheme(settings.theme);

  // Apply size
  applySize(settings.size);

  // Apply opacity
  applyOpacity(settings.opacity);
}

function applyClockType(clockType) {
  try {
    const timeEl = document.getElementById('time');
    const dateEl = document.getElementById('date');
    const analogContainer = document.getElementById('analogClockContainer');
    const clockBody = document.getElementById('body');
    
    if (!timeEl || !dateEl || !analogContainer || !clockBody) {
      console.error('Some clock elements not found');
      return;
    }
    
    if (clockType === 'analog') {
      // Show analog clock with date
      timeEl.style.display = 'none';
      dateEl.style.display = 'none';
      analogContainer.style.display = 'flex';
      drawAnalogClock();
      
      // Adjust body dimensions based on analog clock size
      const diameter = analogSizeConfig[settings.analogSize] || 300;
      // Calculate padding proportional to clock size (smaller clock = less padding, larger clock = more padding)
      const paddingVertical = Math.max(20, diameter * 0.08); // 8% of diameter, minimum 20px
      const paddingHorizontal = Math.max(30, diameter * 0.12); // 12% of diameter, minimum 30px
      
      clockBody.style.width = 'fit-content';
      clockBody.style.padding = `${paddingVertical}px ${paddingHorizontal}px`;
    } else {
      // Show digital clock
      timeEl.style.display = 'block';
      dateEl.style.display = 'block';
      analogContainer.style.display = 'none';
      updateClock();
      
      // Reset body dimensions for digital clock
      clockBody.style.width = 'fit-content';
      clockBody.style.padding = '25px 45px';
    }
  } catch (error) {
    console.error('Error in applyClockType:', error);
  }
}

function applyTheme(theme) {
  const body = document.getElementById('body');
  if (theme === 'light') {
    document.body.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
    body.style.background = 'rgba(0, 0, 0, 0.05)';
    body.style.border = '1px solid rgba(0, 0, 0, 0.1)';
    body.style.color = '#000';
    document.getElementById('time').style.color = '#000';
    document.getElementById('time').style.textShadow = '0 0 20px rgba(0, 0, 0, 0.2)';
    document.getElementById('date').style.color = '#000';
  } else {
    body.style.background = 'rgba(255, 255, 255, 0.05)';
    body.style.border = '1px solid rgba(255, 255, 255, 0.2)';
    body.style.color = '#fff';
    document.getElementById('time').style.color = '#fff';
    document.getElementById('time').style.textShadow = '0 0 20px rgba(255, 255, 255, 0.3)';
    document.getElementById('date').style.color = '#fff';
  }
}

function applySize(size) {
  const body = document.getElementById('body');
  const multiplier = sizeMultipliers[size];
  const timeEl = document.getElementById('time');
  const dateEl = document.getElementById('date');
  
  timeEl.style.fontSize = (4 * multiplier) + 'vw';
  dateEl.style.fontSize = (1.2 * multiplier) + 'vw';
}

function applyOpacity(opacity) {
  const body = document.getElementById('body');
  const opacityValue = opacity / 100;
  // Apply opacity only to the ::before pseudo-element (background)
  body.style.setProperty('--bg-opacity', opacityValue);
  const style = document.createElement('style');
  style.id = 'opacity-style';
  const existing = document.getElementById('opacity-style');
  if (existing) existing.remove();
  style.innerHTML = `#body::before { opacity: ${opacityValue}; }`;
  document.head.appendChild(style);
}

function updateClock() {
  const now = new Date();
  const hour12 = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  const hour24 = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  const time = settings.clockFormat === '12' ? hour12 : hour24;
  const date = now.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' });

  document.getElementById('time').textContent = time;
  document.getElementById('date').textContent = date;
}

// Initialize
loadSettings();
updateClock();

// Update clock every second
setInterval(() => {
  if (settings.clockType === 'analog') {
    drawAnalogClock();
  } else {
    updateClock();
  }
}, 1000);

// Dragging functionality
console.log('Script loading - starting to get element references...');

const clockBody = document.getElementById('body');
const contextMenu = document.getElementById('contextMenu');
const settingsModal = document.getElementById('settingsModal');
const mainMenuBtn = document.getElementById('mainMenuBtn');
const toggleDraggingBtn = document.getElementById('toggleDragging');
const minimizeBtn = document.getElementById('minimizeBtn');
const closeMenuBtn = document.getElementById('closeMenu');
const closeSettingsBtn = document.getElementById('closeSettingsBtn');
const saveSettingsBtn = document.getElementById('saveSettingsBtn');
const cancelSettingsBtn = document.getElementById('cancelSettingsBtn');

console.log('Element check:');
console.log('mainMenuBtn exists:', !!mainMenuBtn);
console.log('settingsModal exists:', !!settingsModal);
console.log('contextMenu exists:', !!contextMenu);

// Store in window for inspection
window.debugElements = {
  mainMenuBtn,
  settingsModal,
  contextMenu,
  clockBody
};

// Try to change mainMenuBtn color to see if it works
if (mainMenuBtn) {
  mainMenuBtn.style.borderLeft = '4px solid yellow';
  console.log('Applied yellow border to mainMenuBtn');
}

let isDragging = false;
let startX, startY, initialX, initialY;

// Helper function to check if cursor is over the clock
function isOverClock(x, y) {
  const rect = clockBody.getBoundingClientRect();
  return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
}

// Make window pass-through for areas outside the clock
document.addEventListener('mousemove', (e) => {
  const overClock = isOverClock(e.clientX, e.clientY);
  const menuOpen = contextMenu.classList.contains('show');
  const modalOpen = settingsModal.classList.contains('show');
  
  // Only pass through if NOT over clock and menus are not open
  if (!overClock && !menuOpen && !modalOpen && window.electron && window.electron.ipcRenderer) {
    window.electron.ipcRenderer.send('set-pass-through', true);
  } else if ((overClock || menuOpen || modalOpen) && window.electron && window.electron.ipcRenderer) {
    window.electron.ipcRenderer.send('set-pass-through', false);
  }
});

// Enable/Disable dragging via mouse events
clockBody.addEventListener('mousedown', (e) => {
  if (!settings.draggingEnabled || e.button !== 0) return; // Only left click
  
  isDragging = true;
  clockBody.classList.add('dragging');
  startX = e.clientX;
  startY = e.clientY;
  
  // Get current position
  const rect = clockBody.getBoundingClientRect();
  initialX = rect.left;
  initialY = rect.top;
});

document.addEventListener('mousemove', (e) => {
  if (!isDragging || !settings.draggingEnabled) return;
  
  // Calculate the difference
  const deltaX = e.clientX - startX;
  const deltaY = e.clientY - startY;
  
  // Update position
  clockBody.style.left = (initialX + deltaX) + 'px';
  clockBody.style.top = (initialY + deltaY) + 'px';
});

document.addEventListener('mouseup', () => {
  if (isDragging) {
    isDragging = false;
    clockBody.classList.remove('dragging');
  }
});

// Global function to open settings (can be called via onclick)
window.openSettings = function() {
  console.log('openSettings called');
  try {
    const contextMenu = document.getElementById('contextMenu');
    const settingsModal = document.getElementById('settingsModal');
    
    if (contextMenu) contextMenu.classList.remove('show');
    
    if (settingsModal) {
      settingsModal.classList.add('show');
      console.log('Modal class updated - should be visible now');
    } else {
      console.error('settingsModal element not found!');
    }
  } catch (error) {
    console.error('Error in openSettings:', error);
  }
};

// Context Menu
clockBody.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  contextMenu.style.left = e.clientX + 'px';
  contextMenu.style.top = e.clientY + 'px';
  contextMenu.classList.add('show');
});

// Hide context menu when clicking elsewhere
document.addEventListener('click', (e) => {
  if (e.target !== contextMenu && !contextMenu.contains(e.target) && !settingsModal.contains(e.target)) {
    contextMenu.classList.remove('show');
  }
});

// Main Menu Button - Opens Settings Modal
if (mainMenuBtn) {
  mainMenuBtn.addEventListener('click', () => {
    console.log('Main menu button clicked');
    window.openSettings();
    
    // Load current settings into modal
    const clockTypeEl = document.querySelector(`input[name="clockType"][value="${settings.clockType}"]`);
    if (clockTypeEl) clockTypeEl.checked = true;
    
    const clockFormatEl = document.querySelector(`input[name="clockFormat"][value="${settings.clockFormat}"]`);
    if (clockFormatEl) clockFormatEl.checked = true;
    
    const themeEl = document.querySelector(`input[name="theme"][value="${settings.theme}"]`);
    if (themeEl) themeEl.checked = true;
    
    const sizeSlider = document.getElementById('sizeSlider');
    if (sizeSlider) sizeSlider.value = settings.size;
    
    const opacitySlider = document.getElementById('opacitySlider');
    if (opacitySlider) opacitySlider.value = settings.opacity;
    
    const opacityValue = document.getElementById('opacityValue');
    if (opacityValue) opacityValue.textContent = settings.opacity + '%';
    
    const analogSizeSlider = document.getElementById('analogSizeSlider');
    if (analogSizeSlider) analogSizeSlider.value = settings.analogSize;
    
    const analogRoundnessSlider = document.getElementById('analogRoundnessSlider');
    if (analogRoundnessSlider) analogRoundnessSlider.value = settings.analogRoundness;
    
    updateFormatVisibility();
  });
} else {
  console.error('mainMenuBtn not found - cannot attach click listener');
}

// Toggle dragging
toggleDraggingBtn.addEventListener('click', () => {
  settings.draggingEnabled = !settings.draggingEnabled;
  toggleDraggingBtn.textContent = settings.draggingEnabled 
    ? '✓ Dragging Enabled' 
    : '✗ Dragging Disabled';
});

// Minimize button
minimizeBtn.addEventListener('click', () => {
  contextMenu.classList.remove('show');
  if (window.electron && window.electron.ipcRenderer) {
    window.electron.ipcRenderer.send('minimize-window');
  }
});

// Close menu button
closeMenuBtn.addEventListener('click', () => {
  contextMenu.classList.remove('show');
});

// Function to show/hide format option based on clock type
function updateFormatVisibility() {
  try {
    const formatSection = document.getElementById('formatSection');
    const digitalSizeSection = document.getElementById('digitalSizeSection');
    const analogSizeSection = document.getElementById('analogSizeSection');
    const analogRoundnessSection = document.getElementById('analogRoundnessSection');
    const selectedType = document.querySelector('input[name="clockType"]:checked');
    
    if (!formatSection || !selectedType) {
      console.warn('formatSection or clockType selector not found');
      return;
    }
    
    if (selectedType.value === 'analog') {
      // Hide digital-specific options
      formatSection.style.display = 'none';
      if (digitalSizeSection) digitalSizeSection.style.display = 'none';
      
      // Show analog-specific options
      if (analogSizeSection) analogSizeSection.style.display = 'block';
      if (analogRoundnessSection) analogRoundnessSection.style.display = 'block';
    } else {
      // Show digital-specific options
      formatSection.style.display = 'block';
      if (digitalSizeSection) digitalSizeSection.style.display = 'block';
      
      // Hide analog-specific options
      if (analogSizeSection) analogSizeSection.style.display = 'none';
      if (analogRoundnessSection) analogRoundnessSection.style.display = 'none';
    }
  } catch (error) {
    console.error('Error in updateFormatVisibility:', error);
  }
}

// Listen for clock type change
document.addEventListener('change', (e) => {
  if (e.target.name === 'clockType') {
    updateFormatVisibility();
  }
});

// Close Settings Modal
closeSettingsBtn.addEventListener('click', () => {
  settingsModal.classList.remove('show');
});

cancelSettingsBtn.addEventListener('click', () => {
  settingsModal.classList.remove('show');
});

// Update opacity display
document.getElementById('opacitySlider').addEventListener('input', (e) => {
  document.getElementById('opacityValue').textContent = e.target.value + '%';
});

// Save Settings
saveSettingsBtn.addEventListener('click', () => {
  try {
    settings.clockType = document.querySelector('input[name="clockType"]:checked').value;
    settings.clockFormat = document.querySelector('input[name="clockFormat"]:checked').value;
    settings.theme = document.querySelector('input[name="theme"]:checked').value;
    settings.size = document.getElementById('sizeSlider').value;
    settings.opacity = document.getElementById('opacitySlider').value;
    settings.analogSize = document.getElementById('analogSizeSlider').value;
    settings.analogRoundness = document.getElementById('analogRoundnessSlider').value;
    
    saveSettings();
    applySettings();
    settingsModal.classList.remove('show');
  } catch (error) {
    console.error('Error saving settings:', error);
    alert('Error saving settings: ' + error.message);
  }
});

// Close modal when clicking outside
settingsModal.addEventListener('click', (e) => {
  if (e.target === settingsModal) {
    settingsModal.classList.remove('show');
  }
});
