# Getting started with Electron

## Prerequisites

### Required tools
- [x] Code editor
- [x] Command line
- [x] Git and GitHub
- [x] Node.js and npm

---

## Building your First App

### Initializing your npm project

```sh
mkdir my-electron-app && cd my-electron-app
npm init
```

- *entry point* should be `main.js`
- *author*, *license*, and *description* can be any value, but will be necessary for **packaging** later on.

### Adding Electron as DevDependency

```sh
npm install electron --save-dev
```

### Adding a .gitignore
[GitHub's Node.js gitignore template](https://github.com/github/gitignore/blob/main/Node.gitignore)

### Running an Electron app

> Create a `main.js` file in the root folder of your project with a single line of code:
```js
console.log('Hello from Electron 👋')
```

> Add `electron .` to the `start` command in the **`scripts`** field of your package.json and run in the CLI:

```sh
npm run start
```

### Loading a web page into a BrowserWindow

> Start by creating a barebones web page in an `index.html` file in the root folder of your project:

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <!-- https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP -->
    <meta
      http-equiv="Content-Security-Policy"
      content="default-src 'self'; script-src 'self'"
    />
    <meta
      http-equiv="X-Content-Security-Policy"
      content="default-src 'self'; script-src 'self'"
    />
    <title>Hello from Electron renderer!</title>
  </head>
  <body>
    <h1>Hello from Electron renderer!</h1>
    <p>👋</p>
  </body>
</html>
```

> Replace the contents of your `main.js` file with the following code:

```js
const { app, BrowserWindow } = require('electron')

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800, height: 600
  })

  win.loadFile('index.html')
}

app.whenReady().then(() => {
  createWindow()
})
```

### Managing your app's window lifecycle

#### Quit the app when all windows are closed (Windows & Linux)
> To implement this pattern in your Electron app, listen for the app module's **`window-all-closed`** event, and call **`app.quit()`** to exit your app if the user is not on macOS.

```js
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
```

#### Open a window if none are open

> To implement this feature, listen for the app module's **`activate`** event, and call your existing `createWindow()` method if no BrowserWindows are open.
>> Because windows cannot be created before the `ready` event, you should only listen for `activate` events after your app is initialized. Do this by only listening for activate events inside your existing `whenReady()` callback:

```js
app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})
```
---

## Using Preload Scripts

### Augmenting the renderer with a preload script

> Add a new `preload.js` script that exposes selected properties of Electron's `process.versions` object to the renderer process in a `versions` global variable.

```js
const { contextBridge } = require('electron')

contextBridge.exposeInMainWorld('versions', {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron
  // we can also expose variables, not just functions
})
```

> To attach this script to your renderer process, pass its path to the webPreferences.preload option in the BrowserWindow constructor.

```js
const { app, BrowserWindow } = require('electron')
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
  createWindow()
})
```

> Create a `renderer.js` script that uses the **`document.getElementById`** DOM API to replace the displayed text for the HTML element with `info` as its `id` property:

```js
const information = document.getElementById('info')
information.innerText = `This app is using Chrome (v${versions.chrome()}), Node.js (v${versions.node()}), and Electron (v${versions.electron()})`
```
> Then, modify your index.html by adding a new element with info as its id property, and attach your renderer.js script:

```html
[...]
    <p>👋</p>
    <p id="info"></p>
  </body>
  <script src="./renderer.js"></script>
[...]
```

### 

> We will add a global function to the renderer called `ping()` that will return a string from the main process.
>> First, set up the `invoke` call in your preload script:

```js
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('versions', {
// [...]
  electron: () => process.versions.electron,
  ping: () => ipcRenderer.invoke('ping')
  // we can also expose variables, not just functions
})
```

>> Then, set up your `handle` listener in the main process. We do this *before* loading the HTML file so that the handler is guaranteed to be ready before you send out the `invoke` call from the renderer.

```js
const { app, BrowserWindow, ipcMain } = require('electron/main')

// [...]

app.whenReady().then(() => {
  ipcMain.handle('ping', () => 'pong')
  createWindow()
})
```

>> Once you have the sender and receiver set up, you can now send messages from the renderer to the main process through the `'ping'` channel you just defined.

```js
const func = async () => {
  const response = await window.versions.ping()
  console.log(response) // prints out 'pong'
}

func()
```
