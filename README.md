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

---

## Adding application complexity

> [!NOTE]
> If you have been following along, you should have a functional Electron application with a static user interface. From this starting point, you can generally progress in developing your app in two broad directions:
> 1. Adding complexity to your renderer process' web app code
> 2. Deeper integrations with the operating system and Node.js

> [!CAUTION]
> It is important to understand the distinction between these two broad concepts. For the first point, Electron-specific resources are not necessary. Building a pretty to-do list in Electron is just pointing your Electron BrowserWindow to a pretty to-do list web app. Ultimately, you are building your renderer's UI using the same tools (HTML, CSS, JavaScript) that you would on the web. Therefore, Electron's docs will not go in-depth on how to use standard web tools.

> [!TIP]
> On the other hand, Electron also provides a rich set of tools that allow you to integrate with the desktop environment, from creating tray icons to adding global shortcuts to displaying native menus. It also gives you all the power of a Node.js environment in the main process. This set of capabilities separates Electron applications from running a website in a browser tab, and are the focus of Electron's documentation.

> [!IMPORTANT]
> Electron's documentation has many tutorials to help you with more advanced topics and deeper operating system integrations. To get started, check out the **[How-To Examples](https://www.electronjs.org/docs/latest/tutorial/examples)** doc.

> [!WARNING]
> For the rest of the tutorial, we will be shifting away from application code and giving you a look at how you can get your app from your developer machine into end users' hands.

---

## Packaging Your Application

### Importing your project into Forge

> You can install Electron Forge's CLI in your project's `devDependencies` and import your existing project with a handy conversion script.

```sh
npm install --save-dev @electron-forge/cli
npx electron-forge import
```

### Creating a distributable

> To create a distributable, use your project's new `make` script, which runs the `electron-forge make` command:

```sh
npm run make
```

> After the script runs, you should see an `out` folder containing both the distributable and a folder containing the packaged application code.
>> The distributable in the `out/make` folder should be ready to launch! You have now created your first bundled Electron application

> [!NOTE]
> Distributable formats
> Electron Forge can be configured to create distributables in different OS-specific formats (e.g. DMG, deb, MSI, etc.). See Forge's **[Makers](https://www.electronforge.io/config/makers)** documentation for all configuration options.

> [!ITP]
> Creating and adding application icons
> Setting custom application icons requires a few additions to your config. Check out **[Forge's icon tutorial](https://www.electronforge.io/guides/create-and-add-icons)** for more information.

> [!WARNING]
> Packaging without Electron Forge
> If you want to manually package your code, or if you're just interested understanding the mechanics behind packaging an Electron app, check out the full **[Application Packaging](https://www.electronjs.org/docs/latest/tutorial/application-distribution)** documentation.

### Important: signing your code

> [!IMPORTANT]
> In order to distribute desktop applications to end users, we *highly* recommend that you code sign your Electron app. Code signing is an important part of shipping desktop applications, and is mandatory for the auto-update step in the final part of the tutorial.

> [!IMPORTANT]
> Code signing is a security technology that you use to certify that a desktop app was created by a known source. Windows and macOS have their own OS-specific code signing systems that will make it difficult for users to download or launch unsigned applications.

> [!IMPORTANT]
> On macOS, code signing is done at the app packaging level. On Windows, distributable installers are signed instead. If you already have code signing certificates for Windows and macOS, you can set your credentials in your Forge configuration.

> [!NOTE]
> For more information on code signing, check out the **[Signing Apps](https://www.electronforge.io/guides/code-signing)** guide in the Forge docs.

---

## Publishing and Updating

### Using update.electronjs.org

> The Electron maintainers provide a free auto-updating service for open-source apps at https://update.electronjs.org. Its requirements are:
> - [x] Your app runs on macOS or Windows | I developed on Mac 
> - [x] Your app has a public GitHub repository | You're actually on this repository 😅
> - [ ] Builds are published to **[GitHub releases](https://docs.github.com/en/repositories/releasing-projects-on-github/managing-releases-in-a-repository)** | Dunno if I can, will try 😉
> - [ ] Builds are **[code signed](https://www.electronjs.org/docs/latest/tutorial/code-signing)** (macOS only) | Sorry I'm broke 😭😂

### Publishing a GitHub release

#### Generating a personal access token

> Forge cannot publish to any repository on GitHub without permission. You need to pass in an authenticated token that gives Forge access to your GitHub releases. The easiest way to do this is to **[create a new personal access token (PAT)](https://github.com/settings/tokens/new)** with the `public_repo` scope, which gives write access to your public repositories. **Make sure to keep this token a secret**.

#### Setting up the GitHub Publisher

> Forge's **[GitHub Publisher](https://www.electronforge.io/config/publishers/github)** is a plugin that needs to be installed in your project's `devDependencies`:

```sh
npm install --save-dev @electron-forge/publisher-github
```

#### Configuring the publisher in Forge

> Once you have it installed, you need to set it up in your Forge configuration. A full list of options is documented in the Forge's **[`PublisherGitHubConfig`](https://js.electronforge.io/interfaces/_electron_forge_publisher_github.PublisherGitHubConfig.html)** API docs.

##### Icon
> Description
>> Set of icons about work and education

> Date
>> 31 March 2020

> Source
>> www.flaticon.com

> Author
>> Good Ware and monkik edited by Bruce The Deus

> License
>> [Creative Commons](https://en.wikipedia.org/wiki/en:Creative_Commons) & [Attribution-Share Alike 4.0 International](https://creativecommons.org/licenses/by-sa/4.0/deed.en)
