const fs = require("fs-extra");
const ipc = require("electron").ipcMain;
const Papa = require("papaparse");

var root_dir = require("os").homedir() + "/.collector/";
//var root_dir = require("os").homedir() + "/Documents/Collector/";

root_dir = root_dir.replaceAll("\\", "/");

//make sure there is a Collector folder in documents
if (!fs.existsSync(root_dir)) {
  fs.mkdirSync(root_dir);
}

//make sure there is a Data folder in documents
if (!fs.existsSync(root_dir + "Data")) {
  fs.mkdirSync(root_dir + "Data");
}

//make sure there is a User.json file in the root director
if (!fs.existsSync(root_dir + "/User.json")) {
  fs.writeFileSync(
    root_dir + "/User.json",
    JSON.stringify(
      {
        current: {
          repo: "",
          org: "",
        },
        repos: {}, //add organization first
      },
      null,
      2
    ),
    "utf8"
  );
}

//https://gist.github.com/jakub-g/5903dc7e4028133704a4
function cleanEmptyFoldersRecursively(folder) {
  var fs = require("fs");
  var path = require("path");

  var isDir = fs.statSync(folder).isDirectory();
  if (!isDir) {
    return;
  }
  var files = fs.readdirSync(folder);
  if (files.length > 0) {
    files.forEach(function (file) {
      var fullPath = path.join(folder, file);
      cleanEmptyFoldersRecursively(fullPath);
    });

    // re-evaluate files; after deleting subfolder
    // we may have parent folder empty now
    files = fs.readdirSync(folder);
  }
  if ((files.length === 0) & (folder.indexOf("User/Projects") === -1)) {
    fs.rmdirSync(folder);
    return;
  }
}

function user() {
  var user = JSON.parse(fs.readFileSync(root_dir + "/User.json"));

  if (typeof user.current.path === "undefined") {
    if (user.current.repo !== "") {
      user.current.path =
        user.repos[user.current.org][user.current.repo].path + "/";
    }
  }
  return user;
}

//make sure there is an Assets file in the users directory
if (fs.existsSync(user().current.path)) {
  if (!fs.existsSync(user().current.path + "/User/Assets/")) {
    fs.mkdirSync(user().current.path + "/User/Assets/");
  }
}

/*
 * fs functions in alphabetical order
 */

ipc.on("fs_delete_project", (event, args) => {
  /*
   * Security checks - should probably have more
   */

  if (args.proj_name.indexOf("..") !== -1) {
    var content = "This request could be insecure, and was blocked";
  } else {
    try {
      // delete the file
      fs.unlinkSync(
        user().current.path + "/User/Projects/" + args.proj_name + ".json"
      );
      // delete the folder
      fs.rmdirSync(user().current.path + "/User/Projects/" + args.proj_name, {
        recursive: true,
      });
      event.returnValue = "success";
    } catch (error) {
      //to trigger an attempt to load a trialtype from the master
      event.returnValue = "failed to delete: " + error;
    }
  }
});

ipc.on("fs_delete_file", (event, args) => {
  console.log("trying to delete " + args.file_path);
  if (args.file_path.indexOf("..") !== -1) {
    event.returnValue =
      "This attempt to delete a file looked dangerous, so hasn't been completed";
  } else if (!fs.existsSync(user().current.path + "/User/" + args.file_path)) {
    console.log("trying to delete a file that doesn't exist");
    event.returnValue =
      "This file doesn't appear to exist, so could not be deleted on your computer (but also doesn't need to be deleted either.)";
  } else {
    console.log("trying to delete a file that exists");
    fs.unlink(user().current.path + "/User/" + args.file_path);
    event.returnValue = "success";
  }
});

ipc.on("fs_home_dir", (event, args) => {
  event.returnValue = root_dir;
});

ipc.on("fs_list_phasetypes", (event, args) => {
  if (!fs.existsSync(user().current.path + "/User")) {
    fs.mkdirSync(user().current.path + "/User");
  }
  if (!fs.existsSync(user().current.path + "/User/PhaseTypes")) {
    fs.mkdirSync(user().current.path + "/User/PhaseTypes");
  }
  event.returnValue = JSON.stringify(
    fs.readdirSync(user().current.path + "/User/PhaseTypes")
  );
});

ipc.on("fs_list_projects", (event, args) => {
  //try{
  if (user().current.path !== "") {
    /*
     * fixing legacy structure
     */
    if (fs.existsSync(user().current.path + "\\User\\Experiments")) {
      fs.copySync(
        user().current.path + "\\User\\Experiments",
        user().current.path + "\\User\\Projects",
        {
          recursive: true,
        }
      );
      fs.rmdirSync(user().current.path + "\\User\\Experiments", {
        recursive: true,
      });
    }

    if (!fs.existsSync(user().current.path + "/User")) {
      fs.mkdirSync(user().current.path + "/User");
    }
    if (!fs.existsSync(user().current.path + "/User/Projects")) {
      fs.mkdirSync(user().current.path + "/User/Projects");
    }
    /*
     * remove empty directories before listing the
     */
    cleanEmptyFoldersRecursively(user().current.path + "/User/Projects");
    var projects = JSON.stringify(
      fs.readdirSync(user().current.path + "/User/Projects")
    );
    event.returnValue = projects;
  } else {
    event.returnValue = "No repo loaded yet";
  }
});

ipc.on("fs_list_surveys", (event, args) => {
  if (!fs.existsSync(user().current.path + "/User")) {
    fs.mkdirSync(user().current.path + "/User");
  }
  if (!fs.existsSync(user().current.path + "/User/Surveys")) {
    fs.mkdirSync(user().current.path + "/User/Surveys");
  }
  var user_surveys = JSON.stringify(
    fs.readdirSync(user().current.path + "/User/Surveys")
  );
  event.returnValue = user_surveys;
});

ipc.on("fs_load_user", (event, args) => {
  event.returnValue = fs.readFileSync(root_dir + "User.json", "utf8");
});

ipc.on("fs_read_default", (event, args) => {
  /*
   * Security checks - should probably have more
   */
  var content;
  if (args.user_folder.indexOf("..") !== -1) {
    content = "This request could be insecure, and was blocked";
  } else if (args.this_file.indexOf("../") !== -1) {
    content = "This request could be insecure, and was blocked";
  } else {
    var this_path =
      user().current.path +
      "/Default/" +
      args.user_folder +
      "/" +
      args.this_file;
    //console.log(this_path);
    try {
      content = fs.readFileSync(this_path, "utf8");
      event.returnValue = content;
    } catch (error) {
      //to trigger an attempt to load a trialtype from the master
      event.returnValue = "";
    }
  }
});

ipc.on("fs_list_project_files", (event, args) => { 
  var project_files = event.returnValue = JSON.stringify(fs.readdirSync(user().current.path + "/User/" + args.folder));
  event.returnValue = project_files;
}) 

ipc.on("fs_read_file", (event, args) => {
  /*
   * Security checks - should probably have more
   */
  var content;
  if (args.user_folder.indexOf("..") !== -1) {
    content = "This request could be insecure, and was blocked";
  } else if (args.this_file.indexOf("../") !== -1) {
    content = "This request could be insecure, and was blocked";
  } else {
    /*
     * fix legacy file structure if necessary
     */
    if (fs.existsSync(user().current.path + "\\web\\User")) {
      fs.copySync(
        user().current.path + "\\web\\User",
        user().current.path + "\\User",
        {
          recursive: true,
        }
      );
      fs.rmdirSync(user().current.path + "\\web\\User", {
        recursive: true,
      });
    }

    try {
      content = fs.readFileSync(
        user().current.path +
          "/User" +
          "/" +
          args.user_folder +
          "/" +
          args.this_file,
        "utf8"
      );
      event.returnValue = content;
    } catch (error) {
      //to trigger an attempt to load a code from the master
      event.returnValue = "";
    }
  }
});

ipc.on("fs_write_data", (event, args) => {
  /*
   * Making sure the relevant folders exist
   */

  /*
   * Security checks - should probably have more
   */
  var content;
  if (args.project_folder.indexOf("../") !== -1) {
    content = "This request could be insecure, and was blocked";
  } else if (args.this_file.indexOf("../") !== -1) {
    content = "This request could be insecure, and was blocked";
  } else {
    try {
      /*
       * create organization folder if it doesn't exist yet
       */
      if (!fs.existsSync(user().data_folder + "/" + user().current.org)) {
        fs.mkdirSync(user().data_folder + "/" + user().current.org);
      }

      /*
       * create repository folder if it doesn't exist yet
       */
      if (
        !fs.existsSync(
          user().data_folder +
            "/" +
            user().current.org +
            "/" +
            user().current.repo
        )
      ) {
        fs.mkdirSync(
          user().data_folder +
            "/" +
            user().current.org +
            "/" +
            user().current.repo
        );
      }

      /*
       * create project folder if it doesn't exist yet
       */
      if (
        !fs.existsSync(
          user().data_folder +
            "/" +
            user().current.org +
            "/" +
            user().current.repo +
            "/" +
            args.project_folder
        )
      ) {
        fs.mkdirSync(
          user().data_folder +
            "/" +
            user().current.org +
            "/" +
            user().current.repo +
            "/" +
            args.project_folder
        );
      }
      content = fs.writeFileSync(
        user().data_folder +
          "/" +
          user().current.org +
          "/" +
          user().current.repo +
          "/" +
          args.project_folder +
          "/" +
          args.this_file,
        args.file_content,
        "utf8"
      );
      event.returnValue = "success";
    } catch (error) {
      //to trigger an attempt to load a trialtype from the master
      event.returnValue = error;
    }
  }
});

ipc.on("fs_write_file", (event, args) => {
  /*
   * Security checks - should probably have more
   */
  var content;
  if (args.user_folder.indexOf("../") !== -1) {
    content = "This request could be insecure, and was blocked";
  } else if (args.this_file.indexOf("../") !== -1) {
    content = "This request could be insecure, and was blocked";
  } else {
    try {
      if (!fs.existsSync(user().current.path + "/User")) {
        fs.mkdirSync(user().current.path + "/User");
      }
      if (!fs.existsSync(user().current.path + "/User/" + args.user_folder)) {
        fs.mkdirSync(user().current.path + "/User/" + args.user_folder);
      }

      content = fs.writeFileSync(
        user().current.path +
          "/User/" +
          args.user_folder +
          "/" +
          args.this_file,
        args.file_content,
        "utf8"
      );
      event.returnValue = "success";
    } catch (error) {
      //to trigger an attempt to load a trialtype from the master
      event.returnValue = "failed to save: " + error;
    }
  }
});

ipc.on("fs_write_project", (event, args) => {
  /*
   * Security checks - probably need more
   */

  if (args.this_project.indexOf("..") !== -1) {
    var content = "This request could be insecure, and was blocked";
  } else {
    try {
      if (!fs.existsSync(user().current.path + "/User/Projects")) {
        fs.mkdirSync(user().current.path + "/User/Projects");
      }
      /*
       * save JSON
       */
      fs.writeFileSync(
        user().current.path + "/User/Projects/" + args.this_project + ".json",
        args.file_content,
        "utf8"
      );

      /*
       * Create folder if it doesn't exist
       */
      if (
        !fs.existsSync(
          user().current.path + "/User/Projects/" + args.this_project
        )
      ) {
        fs.mkdirSync(
          user().current.path + "/User/Projects/" + args.this_project
        );
      }

      parsed_contents = JSON.parse(args.file_content);

      /*
       * save specific csvs
       * - first need to parse each csv here
       */
      var conditions_csv = parsed_contents.conditions;

      fs.writeFileSync(
        user().current.path +
          "/User/Projects/" +
          args.this_project +
          "/" +
          "conditions.csv",
        conditions_csv,
        "utf-8"
      );

      Object.keys(parsed_contents.all_procs).forEach(function (this_proc) {
        fs.writeFileSync(
          user().current.path +
            "/User/Projects/" +
            args.this_project +
            "/" +
            this_proc,
          parsed_contents.all_procs[this_proc]
        );
      });

      Object.keys(parsed_contents.all_stims).forEach(function (this_stim) {
        fs.writeFileSync(
          user().current.path +
            "/User/Projects/" +
            args.this_project +
            "/" +
            this_stim,
          parsed_contents.all_stims[this_stim]
        );
      });
      event.returnValue = "success";
    } catch (error) {
      //to trigger an attempt to load a trialtype from the master
      event.returnValue = "failed to save " + error;
    }
  }
});

ipc.on("fs_write_user", (event, args) => {
  /*
   * Security checks??
   */
  try {
    var content = fs.writeFileSync(
      root_dir + "/User.json",
      JSON.stringify(JSON.parse(args.file_content), null, 2),
      "utf8"
    );
    event.returnValue = "success";
  } catch (error) {
    event.returnValue = "failed to save";
  }
});
