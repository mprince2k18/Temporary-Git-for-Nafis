# Desktop Clock 🕐

A sleek, customizable desktop clock application built with [Electron](https://www.electronjs.org/). Display a floating clock on your desktop with support for both digital and analog formats, complete with dark/light themes and extensive customization options.

## Features ✨

- **Dual Clock Formats**: Switch between digital and analog clock displays
- **24/12 Hour Format**: Choose your preferred time format
- **Themes**: Light and dark theme support
- **Adjustable Size**: Multiple size options for both digital and analog clocks
- **Transparency Control**: Adjust the opacity of the clock window
- **Draggable Interface**: Move the clock anywhere on your screen
- **Always Visible**: Stays on top of your desktop (can be toggled)
- **Context Menu**: Quick access to settings and controls via right-click
- **System Tray Integration**: Minimize to system tray for quick access
- **Persistent Settings**: Your preferences are saved automatically

## Screenshots 📸

- **Digital Clock**: Clean, minimalist display with customizable size and opacity
- **Analog Clock**: Classic round clock face with adjustable roundness
- **Settings Panel**: Easy-to-use modal for all customization options

## Requirements 📋

- **Node.js**: v14 or higher
- **npm**: v6 or higher
- **Windows**: Currently targeted for Windows (portable and NSIS installer)

## Installation 🚀

### Option 1: Download Release
1. Visit the [Releases](https://github.com/mprince2k18/Temporary-Git-for-Nafis/releases) page
2. Download the latest `Desktop Clock` executable (portable or installer)
3. Run the application

### Option 2: Build from Source

1. **Clone the repository**
   ```bash
   git clone https://github.com/mprince2k18/Temporary-Git-for-Nafis.git
   cd Temporary-Git-for-Nafis
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the application**
   ```bash
   npm start
   ```

4. **Build for distribution**
   ```bash
   npm run build
   ```

## Usage 💻

### Starting the Application

```bash
npm start
```

### Development Mode

For development with hot-reload:

```bash
npm run dev
```

### Available Commands

| Command | Description |
|---------|-------------|
| `npm start` | Launch the application |
| `npm run dev` | Run in development mode with auto-reload |
| `npm run build` | Build Windows portable executable |
| `npm run pack` | Create package (test build) |
| `npm run dist` | Build all configured distributables |
| `npm run clean` | Remove dist and node_modules |
| `npm run clean:dist` | Remove only dist folder |
| `npm run clean:modules` | Remove only node_modules |
| `npm run rebuild` | Clean and reinstall everything |

## Settings ⚙️

Right-click on the clock to access the context menu and select "Main Menu" to open the settings panel. Configure:

- **Clock Type**: Digital or Analog
- **Time Format**: 12-hour or 24-hour
- **Theme**: Dark or Light
- **Size**: Small, Medium, or Large
- **Opacity**: 0-100%
- **Analog Clock Roundness**: Adjust corner roundness (for analog mode)
- **Dragging**: Enable/disable window dragging

## Keyboard & Mouse Controls 🎮

- **Right-click**: Open context menu
- **Left-click & Drag**: Move the clock (when dragging is enabled)
- **Context Menu Options**:
  - ⚙️ Main Menu: Open settings
  - ✓ Dragging Enabled: Toggle dragging mode
  - ⬇️ Minimize: Hide to system tray
  - ✕ Close Menu: Close the context menu

## File Structure 📁

```
├── main.js                 # Electron main process
├── preload.js             # IPC bridge for secure communication
├── script.js              # Frontend logic and clock rendering
├── index.html             # Main HTML interface
├── style.css              # Styling
├── create-tray-icon.js    # System tray integration
├── package.json           # Project configuration
└── README.md              # This file
```

## Technologies Used 🛠️

- **Electron**: Cross-platform desktop application framework
- **Node.js**: JavaScript runtime
- **HTML5/CSS3**: Frontend interface
- **JavaScript (Vanilla)**: Frontend logic
- **electron-builder**: Application packaging and distribution
- **electron-reload**: Development hot-reload

## Building & Packaging 📦

The application is configured to build for Windows with two distribution formats:

- **Portable**: Single executable file (no installation required)
- **NSIS**: Traditional Windows installer

To build:

```bash
npm run build
```

Compiled files will be available in the `dist/` directory.

## Development 👨‍💻

### Running in Development Mode

```bash
npm run dev
```

This enables:
- Hot-reload on file changes
- Detailed error logging
- Easier debugging

### Project Structure

- **main.js**: Handles window creation, IPC communication, and system tray
- **script.js**: Contains all frontend logic including:
  - Clock rendering (digital and analog)
  - Settings management
  - Event handling
  - Theme application
- **preload.js**: Secure bridge between renderer and main processes
- **index.html**: Modal dialogs, clock display, and context menu
- **style.css**: Complete styling for all modes and themes

## Known Issues 🐛

- Application is currently optimized for Windows
- Analog clock renders on HTML5 canvas

## Contributing 🤝

Contributions are welcome! Please feel free to submit a Pull Request.

## License 📄

This project is licensed under the ISC License - see `package.json` for details.

## Author ✍️

**Nafis**

## Changelog 📝

### Version 1.0.0 (November 1, 2025)
- Initial release
- Digital and analog clock support
- Full settings customization
- System tray integration
- Theme support
- Cross-platform Electron architecture

## Support 💬

If you encounter any issues or have suggestions, please open an issue on the [GitHub Issues](https://github.com/mprince2k18/Temporary-Git-for-Nafis/issues) page.

---

**Enjoy your Desktop Clock!** 🕐✨
