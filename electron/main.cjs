// Janela do app para Windows: carrega o jogo empacotado (dist/index.html)
const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

function criarJanela() {
  const win = new BrowserWindow({
    width: 960,
    height: 680,
    minWidth: 480,
    minHeight: 340,
    backgroundColor: '#101018',
    title: 'Aurora: Caçadores de Feras',
    icon: path.join(__dirname, '..', 'dist', 'icon.png'),
    autoHideMenuBar: true,
    webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true },
  });
  Menu.setApplicationMenu(null);
  win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  // F11 alterna tela cheia, F12 abre ferramentas de desenvolvedor
  win.webContents.on('before-input-event', (e, input) => {
    if (input.type !== 'keyDown') return;
    if (input.key === 'F11') { win.setFullScreen(!win.isFullScreen()); e.preventDefault(); }
    if (input.key === 'F12') win.webContents.toggleDevTools();
  });
  // bloqueia navegação externa
  win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  win.webContents.on('will-navigate', (e) => e.preventDefault());
}

app.whenReady().then(criarJanela);
app.on('window-all-closed', () => app.quit());
