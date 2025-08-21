const { dialog } = require("electron");
const fs = require("fs-extra");
var root_dir = require("os").homedir() + "/.collector/";
root_dir = root_dir.replaceAll("\\", "/");

//make sure there is a Collector folder in documents
if (!fs.existsSync(root_dir)) {
  fs.mkdirSync(root_dir);
}



// make User folder if it doesn't exist yet
if (!fs.existsSync(root_dir + "/User")) {
  fs.mkdirSync(root_dir + "/User");
}

/*
 * Github management
 */
const ipc = require("electron").ipcMain;

/*
 * trying to help migration to "main" rather than "your_stuff" as default branch

 // clearly not working

var git = simpleGit();
    git.addConfig("init.defaultBranch", "main", append = false, scope = 'local');
    */


/*
var git = simpleGit(); has to be called in individual functions to make sure it's fresh rather than has carrying over information from previous calls
*/

function user() {
  var user = JSON.parse(fs.readFileSync(root_dir + "/User.json"));

  if (typeof user.current.path === "undefined") {
    if (user.current.repo !== "") {
      user.current.path =
        user.repos[user.current.org][user.current.repo].path + "/";
    }
  }

  /*
   * Create required folders if they don't exist yet
   */
  //if(!fs.existsSync)

  return user;
}

/*
 * Objects
 */
update = {
  files: [
    "ParticipantCountry.html",
    "Run.html",
    "Run.js",
    "Welcome.html",
    "PhaseFunctions.js",
    "iframe_library.js",
  ],
  folders: ["App/libraries", "App/Quality", "Default", "logos"]
};



ipc.on("git_locate_repo", (event, args) => {
  event.returnValue = user().repos[args.org][args.repo].path.replaceAll(
    "\\",
    "/"
  );
});