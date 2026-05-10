const { app, BrowserWindow, globalShortcut, session } = require('electron');
const path = require('path');

app.disableHardwareAcceleration();

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    show: true, // Show immediately
    frame: true,
    backgroundColor: '#0a0a1a', 
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.maximize();

  // 🛠️ DEVTOOLS FOR EMERGENCY DIAGNOSTICS
  mainWindow.webContents.openDevTools();

  // Wait 3 seconds for Vite to settle before loading
  setTimeout(() => {
    console.log("Attempting to load Laxmi from Localhost:3000...");
    mainWindow.loadURL('http://localhost:3000').catch(() => {
      console.log("Localhost failed, loading local build instead.");
      const indexPath = path.join(__dirname, 'dist', 'index.html');
      mainWindow.loadFile(indexPath).catch(e => console.error("CRITICAL ERROR:", e.message));
    });
  }, 3000);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
