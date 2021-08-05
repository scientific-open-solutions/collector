const { app, BrowserWindow, dialog, remote, shell } = require("electron");

const fs = require("fs-extra");
const ipc = require("electron").ipcMain;

/*
 * by qwerty at
 * https://stackoverflow.com/questions/2116558/fastest-method-to-replace-all-instances-of-a-character-in-a-string
 */
String.prototype.replaceAll = function (str1, str2, ignore) {
  return this.replace(
    new RegExp(
      str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g, "\\$&"),
      ignore ? "gi" : "g"
    ),
    typeof str2 === "string" ? str2.replace(/\$/g, "$$$$") : str2
  );
};

var root_dir = require("os").homedir() + "/.collector/";

//make sure there is a Collector folder in documents
if (!fs.existsSync(root_dir + "user.json")) {
  fs.writeFileSync(
    root_dir + "user.json",
    JSON.stringify({
      current: {
        repo: "",
        org: "",
      },
      repos: {}, //add organization first
    }),
    "utf8"
  );
}

var user = JSON.parse(fs.readFileSync(root_dir + "user.json"));

if (typeof user.current.path === "undefined") {
  if (user.current.repo !== "") {
    user.current.path =
      user.repos[user.current.org][user.current.repo].path + "/";
  }
}

ipc.on("open_folder", (event, args) => {
  switch (args.location) {
    case "home":
      var this_dir = root_dir + args.folder;
      shell.openPath(this_dir.replaceAll("/", "\\"));
      event.returnValue = "done";
      break;
    case "relative":
      shell.openPath(args.folder);
      event.returnValue = "done";
      break;
    case "repo":
      shell.openPath(
        user.current.path.replaceAll("/", "\\") + "\\" + args.folder
      );
      event.returnValue = "done";
      break;
  }

  /*
  if(process.platform.indexOf("win") !== -1){
    var location = require("os").homedir() +
    "\\Documents\\Collector\\" +
    args["folder"];
    location = location.replace("\/","\\");
  } else {
    var location = require("os").homedir() +
    "/Documents/Collector/" +
    args["folder"];
  }
  location = location.replace(
    "resources\\app.asar\\",
    ""
  );
  shell.openPath(
    location
  );
  */
});

ipc.on("find_path", (event, args) => {
  dialog
    .showOpenDialog(mainWindow, {
      properties: ["openDirectory"], //'openFile',
    })
    .then((result) => {
      event.returnValue = result.filePaths;
    })
    .catch((err) => {
      console.log(err);
      event.returnValue = err;
    });

  /*
  dialog.showOpenDialog({
    properties: ["openDirectory"] //,"openFile"
  },function (folder_dir) {
    event.returnValue = folder_dir;
  });
  */
});
