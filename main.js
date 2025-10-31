const { app, BrowserWindow, screen, Menu, ipcMain, Tray } = require('electron');
const path = require('path');

// Enable live reload in development mode
if (process.env.NODE_ENV === 'development') {
  try {
    require('electron-reload')(__dirname, {
      electron: path.join(__dirname, 'node_modules', '.bin', 'electron')
    });
  } catch (err) {
    console.error('electron-reload load failed:', err);
  }
}

// IPC handler for mouse events
let mainWindow;
ipcMain.on('enable-mouse-events', (event, enable) => {
  if (mainWindow) {
    mainWindow.setIgnoreMouseEvents(!enable, { forward: !enable });
  }
});

ipcMain.on('set-pass-through', (event, passThrough) => {
  if (mainWindow) {
    mainWindow.setIgnoreMouseEvents(passThrough, { forward: passThrough });
  }
});

// IPC handler for minimize
ipcMain.on('minimize-window', (event) => {
  if (mainWindow) {
    mainWindow.hide(); // Hide instead of minimize
  }
});

// Store reference to main window
let tray = null;

function createWindow() {
  // Get the primary display's size (full screen)
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  const win = new BrowserWindow({
    width,
    height,
    x: 0,
    y: 0,
    frame: false,          // no title bar
    transparent: true,     // allows background transparency
    alwaysOnTop: false,    // stays above wallpaper but below windows
    fullscreen: true,      // take entire display area
    resizable: false,
    skipTaskbar: true,     // don't show in taskbar
    focusable: true,       // allow focus for interaction
    hasShadow: false,
    webPreferences: {
      devTools: true,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow = win;

  win.setIgnoreMouseEvents(false); // Capture mouse events for the window
  win.setAlwaysOnTop(false, 'screen-saver'); // ensures it stays behind normal windows
  win.loadFile('index.html');

  // Optional: remove menu bar for clean look
  win.setMenuBarVisibility(false);

  // Handle minimize event - hide to tray instead
  win.on('minimize', (event) => {
    event.preventDefault();
    win.hide();
  });

  // Create tray icon
  createTray();

  // Open dev tools in dev mode
  if (process.env.NODE_ENV === 'development') {
    win.webContents.openDevTools({ mode: 'detach' });
  }
}

function createTray() {
  const { nativeImage } = require('electron');
  
  // Create a simple programmatic image for the tray icon
  // A simple 16x16 pixel colored image
  let trayIcon;
  
  try {
    // Try to load from assets if available
    const fs = require('fs');
    const iconPath = path.join(__dirname, 'assets', 'tray-icon.png');
    if (fs.existsSync(iconPath)) {
      trayIcon = nativeImage.createFromPath(iconPath);
    } else {
      // Create a simple colored image programmatically
      // Using a basic approach: create from data URL
      trayIcon = nativeImage.createEmpty();
    }
  } catch (e) {
    trayIcon = nativeImage.createEmpty();
  }
  
  tray = new Tray(trayIcon);
  
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show Clock',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        }
      }
    },
    {
      type: 'separator'
    },
    {
      label: 'Quit',
      click: () => {
        app.quit();
      }
    }
  ]);

  tray.setContextMenu(contextMenu);

  // Click on tray icon to toggle visibility
  tray.on('click', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
        mainWindow.focus();
      }
    }
  });

  tray.setToolTip('Desktop Clock - Click to toggle visibility');
}

app.whenReady().then(createWindow);

// IPC handlers for dragging toggle
ipcMain.on('toggle-dragging', (event, isDraggingEnabled) => {
  // This will be used to communicate between renderer and main process
  event.reply('dragging-toggled', isDraggingEnabled);
});

// Quit when all windows are closed (Windows & Linux)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
