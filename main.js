const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('node:path')

const createWindow = () => {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    })

    win.loadFile('index.html')
}

app.whenReady().then(() => {
    ipcMain.handle('ping', () => 'pong')
    createWindow()

    // Open a window if none are open (macOS)
    // https://www.electronjs.org/docs/latest/tutorial/tutorial-first-app#open-a-window-if-none-are-open-macos
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

// Quit the app when all windows are closed (Windows & Linux)
// https://www.electronjs.org/docs/latest/tutorial/tutorial-first-app#quit-the-app-when-all-windows-are-closed-windows--linux
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})
