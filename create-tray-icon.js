const fs = require('fs');
const path = require('path');

// Create a simple 16x16 transparent PNG with a colored clock symbol
// This is a minimal PNG file in base64 format
const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAOxAAADsQBlSsOGwAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAEkSURBVDiPY/wPBAx/gIECSBwYQbg/QKQKxGYgVgHiKkBcAeL/QFwNxDVAXAvEv4H4PxD/B+L/QPwfiP8D8X8g/g/E/4H4PxD/B+L/QPwfiP8D8X8g/g/E/4H4PxD/B+L/QPwfiP8D8X8g/g/E/4H4PxD/B+L/QPwfiP8D8X8g/g/E/4H4PxD/B+L/QPwfiP8D8X8g/g/E/4H4PxD/B+L/QPwfiP8D8X8g/g/E/4H4PxD/B+L/QPwfiP8D8X8g/g/E/4H4PxD/B+L/QPwfiP8D8X8g/g/E/4H4PxD/B+L/QPwfiP8D8X8g/g/E/4H4PxD/B+L/QPwfiP8D8X+Bgf8//38g/o+A+D8Q/wfi/0D8H4j/A/F/IP4PxP+B+D8Q/wfi/0D8H4j/A/H/QPCQ/0DxFxD/B+L/QOQ/BQAqEp3M1F3yzAAAAABJRU5ErkJggg==';

const assetsDir = path.join(__dirname, 'assets');
const iconPath = path.join(assetsDir, 'tray-icon.png');

// Create assets directory if it doesn't exist
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Convert base64 to buffer and write file
const buffer = Buffer.from(pngBase64, 'base64');
fs.writeFileSync(iconPath, buffer);

console.log('Tray icon created at:', iconPath);
