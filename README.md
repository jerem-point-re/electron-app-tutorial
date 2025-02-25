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
