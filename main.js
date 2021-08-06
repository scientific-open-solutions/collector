// Modules to control application life and create native browser window
//require('coffee-script').register();

//const remote = require('remote');

const { app, BrowserWindow, dialog, remote } = require("electron");

const fs = require("fs-extra");
const ipc = require("electron").ipcMain;
const path = require("path");

const { session } = require("electron");

function createWindow() {
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        "Content-Security-Policy": [
          //"default-src 'self'",
          //"script-src 'self'",
          //"connect-src 'self'",
          //"img-src 'self'",
          //"style-src 'self'",
          //"font-src 'self'"
        ],
      },
    });
  });

  // Create the browser window.
  mainWindow = new BrowserWindow({
    // frame: false,
    title: "Collector: Cat " + app.getVersion(),
    icon: __dirname + "/logos/collector_sized.png",
    webPreferences: {
      //contextIsolation:           true, //has to be false with the way I've designed this
      enableRemoteModule: true,
      //preload:                    [path.join(__dirname, 'App/libraries/collector/Collector.js')],
      preload: path.join(__dirname, "preload.js"),
      worldSafeExecuteJavaScript: true,
    },
  });
  mainWindow.setMenuBarVisibility(false);
  mainWindow.maximize();

  // and load the index.html of the app.
  mainWindow.loadFile(__dirname + "/App/index_local.html");

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
}
app.on("ready", () => {
  createWindow();
});
app.on("window-all-closed", function () {
  console.log("quitting");
  //if (process.platform !== 'darwin') {
  app.quit();
  console.log("finished quitting");
  //}
});

app.on("activate", function () {
  if (mainWindow === null) {
    createWindow();
  }
});

/*
 * Load Modules
 */
require("./ElectronModules/fs.js");
require("./ElectronModules/git.js");
require("./ElectronModules/openFolders.js");

/*
 * To allow right click to inspect element:
 */

const contextMenu = require("electron-context-menu");

function awaiting_trigger() {
  // Asynchronous read
  fs.readFile("hall_of_fame.csv", function (err, data) {
    if (err) {
      return console.error(err);
    }
    console.log("Asynchronous read: " + data.toString());
  });

  // Synchronous read

  console.log("Synchronous read: " + data.toString());
  console.log("Program Ended");
}

contextMenu({
  prepend: (defaultActions, params, browserWindow) => [
    {
      label: "Rainbow",
      // Only show it when right-clicking images
      visible: params.mediaType === "image",
    },
    {
      label: "Search Google for “{selection}”",
      // Only show it when right-clicking text
      visible: params.selectionText.trim().length > 0,
      click: () => {
        dialog.showOpenDialog((fileNames) => {
          // fileNames is an array that contains all the selected
          if (fileNames === undefined) {
            console.log("No file selected");
            return;
          }

          fs.readFile(filepath, "utf-8", (err, data) => {
            if (err) {
              alert("An error ocurred reading the file :" + err.message);
              return;
            }
          });
        });

        //shell.openExternal(`https://google.com/search?q=${encodeURIComponent(params.selectionText)}`);
      },
    },
  ],
});
