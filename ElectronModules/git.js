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
const { Octokit } = require("@octokit/rest");
const simpleGit = require("simple-git");

/*
 * trying to help migration to "main" rather than "master" as default branch

 // clearly not working

var git = simpleGit();
    git.addConfig("init.defaultBranch", "main", append = false, scope = 'local');
    */


/*
var git = simpleGit(); has to be called in individual functions to make sure it's fresh rather than has carrying over information from previous calls
*/
var commandExistsSync = require("command-exists").sync;
const git_token_location = root_dir + "/Private/github_token.txt";

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

/*
 * In alphabetical order
 */

ipc.on("git_add_repo", (event, args) => {
  var auth_token = fs.readFileSync(git_token_location, "utf8");

  /*
   * Request of where to clone repo to
   */
  dialog
    .showOpenDialog(mainWindow, {
      properties: ["openDirectory"], //'openFile',
    })
    .then((result) => {
      if (result.canceled === false) {
        /*
         * update user().current.path
         */
        var user = JSON.parse(fs.readFileSync(root_dir + "/User.json"));

        if (typeof user.current === "undefined") {
          user.current = {};
        }

        user.current.org = args.org;
        user.current.repo = args.repo;
        user.current.path = result.filePaths[0] + "/" + args.repo;

        if (typeof user.repos === "undefined") {
          user.current.repos = {};
        }

        if (typeof user.repos[args.org] === "undefined") {
          user.repos[args.org] = {};
        }
        user.repos[args.org][args.repo] = {
          path: user.current.path,
        };

        fs.writeFileSync(
          root_dir + "/User.json",
          JSON.stringify(user, null, 2),
          "utf-8"
        );

        /*
         * Check if the repository exists online
         */
        const octokit = new Octokit({
          auth: auth_token,
        });

        var git = simpleGit();

        octokit.repos
          .get({
            owner: args.org,
            repo: args.repo,
          })
          .then(function (result) {
            console.log("result of whether repository exists online:");

            /*
             * Then clone the repository
             */
            git
              .clone(
                "https://github.com" + "/" + args.org + "/" + args.repo,
                user.current.path
              )
              .then(function (result) {
                event.returnValue = "you have cloned an existing repository";
              })
              .catch(function (error) {
                event.returnValue = "error" + error;
              });
          })
          .catch(function (error) {
            console.log("result of repository not existing online:");
            console.log(error);
            /*
             * Create repository online
             */
            octokit.repos
              .createInOrg({
                org: args.org,
                name: args.repo,
              })
              .then(function (result) {
                git
                  .clone(
                    "https://github.com" + "/" + args.org + "/" + args.repo,
                    user.current.path
                  )
                  .then(function (result) {
                    /*
                     * Copy the relevant default files into the new repo
                     * App folder
                     * Default folder
                     */

                    update.files.forEach(function (this_file) {
                      fs.copySync(
                        "extra/App/" + this_file,
                        user.current.path + "/" + "App" + "/" + this_file
                      );
                    });

                    /*
                     * update folders
                     */
                    update.folders.forEach(function (this_folder) {
                      fs.copySync(
                        "extra/" + this_folder,
                        user.current.path + "/" + this_folder,
                        {
                          recursive: true,
                        }
                      );
                    });

                    /*
                     * remove excess - no longer doing this due to LocalLibraries

                    update.excesses.forEach(function (this_excess) {
                      fs.rmdirSync(user.current.path + this_excess, {
                        recursive: true,
                      });
                    });
                    */
                    event.returnValue = "success";
                  })
                  .catch(function (error) {
                    event.returnValue = "error" + error;
                  });
              })
              .catch(function (error) {
                console.log(
                  "failed to clone Collector into repository, right?"
                );
                event.return = "error - failed to create online repo:" + error;
              });
          });
      } else {
        event.returnValue =
          "error - You didn't select where to put your repository";
      }
    });
});

ipc.on("git_add_token", (event, args) => {
  /*
   * Make sure the required folders exist
   */
  event.returnValue = "success";
  if (!fs.existsSync(root_dir + "/Private")) {
    fs.mkdirSync(root_dir + "/Private");
  }

  try {
    fs.writeFileSync(git_token_location, args.auth_token, "utf8");
    event.returnValue = "success";
  } catch (error) {
    event.returnValue =
      "error - could not add token to: " + root_dir + git_token_location;
  }
});

/*
 * Expanding git_exists to check if there is a valid email
 */
ipc.on("git_exists", (event, args) => {
  if (commandExistsSync("git")) {
    var git = simpleGit();
    git
      .listConfig()
      .then(function (result) {
        /*
         * Check all configs for the relevant values
         */
        var user_email_valid = "false";
        var user_name_valid = "false";

        Object.keys(result.values).forEach(function (item) {
          if (
            typeof result.values[item]["user.email"] !== "undefined" &&
            result.values[item]["user.email"] !== ""
          ) {
            user_email_valid = "true";
          }
          if (
            typeof result.values[item]["user.name"] !== "undefined" &&
            result.values[item]["user.name"] !== ""
          ) {
            user_name_valid = "true";
          }
        });
        event.returnValue = user_email_valid + "-" + user_name_valid;
      })
      .catch(function (error) {
        event.returnValue = error;
      });
  } else {
    event.returnValue =
      "Git is not yet installed. Please go to https://git-scm.com/ to download and install it so that you can do online research.";
  }
});

ipc.on("git_locate_repo", (event, args) => {
  event.returnValue = user().repos[args.org][args.repo].path.replaceAll(
    "\\",
    "/"
  );
});

ipc.on("git_pages", (event, args) => {
  /*
   * confirm authentication file exists
   */
  var auth_token = fs.readFileSync(git_token_location, "utf8");

  /*
   * Check if the repository already is a github page
   */
  const octokit = new Octokit({
    auth: auth_token,
  }).repos
    .getPages({
      owner: args.org,
      repo: args.repo,
    })
    .then(function (results) {
      event.returnValue = "success";
    })
    .catch(function (error) {
      try {
        const octokit = new Octokit({
          auth: auth_token,
        }).repos
          .createPagesSite({
            owner: args.org,
            repo: args.repo,
            source: {
              branch: "main",
              path: "/",
            },
          })
          .then(function (result) {
            event.returnValue = "success";
          })
          .catch(function (error) {
            event.returnValue = "error: " + error;
          });
      } catch (this_error) {
        console.log("HERE BE THE ERROR");
        event.returnValue = "error: " + error;
      }
    });
});

ipc.on("git_pull", (event, args) => {
  /*
   * check if repo exists to confirm whether cloning or pulling
   */
  var git = simpleGit();

  if (!fs.existsSync(user().current.path)) {
    //ask for a current path
    dialog
      .showOpenDialog(mainWindow, {
        properties: ["openDirectory"], //'openFile',
      })
      .then((result) => {
        /*
         * update user().current.path
         */
        var user = JSON.parse(fs.readFileSync(root_dir + "/User.json"));
        user.current.path = result.filePaths;

        fs.writeFileSync(
          root_dir + "/User.json",
          JSON.stringify(user),
          "utf-8"
        );

        git.clone(
          "https://github.com" + "/" + args.org + "/" + args.repo,
          result.filePaths
        );
        event.returnValue = "success";
      })
      .catch((err) => {
        console.log(err);
        event.returnValue = "error:" + err;
      });

    /* deletable, right?
    //cloning
    git.clone(
      "https://github.com" + "/" +
        args.org  + "/" +
        args.repo,
      user().current.path
    )
    .then(function(error){
      event.returnValue = "success";
    })
    .catch(function(error){
      event.returnValue = "error: " + error;
    });
    */
  } else {
    console.log("Repository exists locally, so pulling in changes");

    var remote =
      "https://" +
      args.org +
      "@github.com" +
      "/" +
      args.org +
      "/" +
      args.repo +
      ".git";

    /*
    for debugging
    const simpleGit          = require('simple-git');
    const git                = simpleGit();
    */

    git
      .cwd(user().current.path)
      .pull(remote, "main")
      .then(function (result) {
        event.returnValue = "success";
      })
      .catch(function (error) {
        git
          .cwd(user().current.path)
          .pull(remote, "main") //in case their version of the repository hasn't transitioned to "main" yet
          .then(function (result) {
            event.returnValue = "success";
          })
          .catch(function (error) {
            console.log("error");
            console.log(error);
            event.returnValue = "error: " + error;
          });
      });
  }
});

ipc.on("git_push", (event, args) => {
  if (fs.existsSync("App")) {
    /*
     * update files
     */
    update.files.forEach(function (this_file) {
      fs.copySync(
        "App/" + this_file,
        user().current.path + "/" + "App" + "/" + this_file
      );
      fs.copySync("App/" + this_file, "extra/App/" + this_file);
    });

    /*
     * update folders
     */
    update.folders.forEach(function (this_folder) {
      fs.copySync(this_folder, user().current.path + "/" + this_folder, {
        recursive: true,
      });
      fs.copySync(this_folder, "extra/" + this_folder, {
        recursive: true,
      });
    });

    /*
     * remove excess - no longer doing this due to LocalLibraries

    update.excesses.forEach(function (this_excess) {
      fs.rmdirSync(user().current.path + this_excess, {
        recursive: true,
      });
      fs.rmdirSync("extra/" + this_excess, {
        recursive: true,
      });
    });
    */
  }

  /*
   * check that auth token exists and deal with eventuality if it doesn't
   */

  var baseline_time = new Date().getTime();
  console.log("baseline_time = " + baseline_time);

  var auth_token = fs.readFileSync(git_token_location, "utf8");

  console.log(
    "auth token time = " + parseFloat(new Date().getTime() - baseline_time)
  );

  if (typeof args.message === "undefined") {
    args.message = "automatic commit";
  }

  var remote =
    "https://" +
    args.org +
    ":" +
    auth_token +
    "@github.com/" +
    args.org +
    "/" +
    args.repo +
    ".git";


  /*
  var auth_token = fs.readFileSync(git_token_location, "utf8");
  const octokit = new Octokit({
    auth: auth_token,
  });

  octokit.rest.repos.renameBranch({
    owner: args.org,
    repo: args.repo,
    branch: "master",
    new_name: "main",
  });
  */

  var git = simpleGit();
  /*
   * update master to main branch here
   */
   if(fs.existsSync(user().current.path + "/.git/refs/heads/master")){
     console.log(user().current.path + "/.git/refs/heads/master exists");
     //

     fs.copySync(
       user().current.path + "/.git/refs/heads/master",
       user().current.path + "/.git/refs/heads/main"
     )
     fs.unlinkSync(
       user().current.path + "/.git/refs/heads/master"
     );
   } else {
     console.log(user().current.path + "/.git/refs/heads/master does not exist");
   }

  git
    .cwd(user().current.path)
    .add("./*")
    .commit(args.message)
    .push(remote, "main")
    .then(function (new_err) {
      /*
       *
       */

      event.returnValue = "success";
    })
    .catch(function (error) {
      event.returnValue =
        "error when pushing (are you sure you have permission? You need to accept the invite if you are not the original creator of the repositories organization):" +
        error;
    });
});

ipc.on("git_repo_info", (event, args) => {
  var git = simpleGit();

  //git remote -v

  git
    .cwd(args.path)
    .getRemotes(true)
    .then(function (data) {
      url = data
        .filter((row) => row.name === "origin")[0]
        .refs.fetch.split("/");
      var return_obj = {
        organization: url[3],
        repository: url[4],
      };
      event.returnValue = JSON.stringify(return_obj);
    });
});

ipc.on("git_set_email", (event, args) => {
  var git = simpleGit();
  git.addConfig("user.email", args.email);
  event.returnValue = "success";
});

ipc.on("git_set_name", (event, args) => {
  var git = simpleGit();
  git.addConfig("user.name", args.name);
  event.returnValue = "success";
});

ipc.on("git_status", (event, args) => {
  if ((args.org === null) | (args.repo === null)) {
    event.returnValue = "Incomplete org or repo information";
  } else {
    var git = simpleGit();
    git
      .cwd(user().repos[args.org][args.repo].path)
      .fetch()
      .status()
      .then(function (result) {
        event.returnValue = JSON.stringify(result);
      })
      .catch(function (error) {
        event.returnValue = error;
      });
  }
});

ipc.on("git_token_exists", (event, args) => {
  if (fs.existsSync(git_token_location)) {
    event.returnValue = "success";
  } else {
    event.returnValue =
      "Did not find the token. Use the <b>Add token</b> button to add a github token.";
  }
});

ipc.on("git_undo", (event, args) => {
  var git = simpleGit();

  if (args.path.indexOf("..") !== -1) {
    event.returnValue = "This request looked unsafe, so was ignored";
  } else if (args.type === "not_added") {
    fs.unlinkSync(user().repos[args.org][args.repo].path + "/" + args.path);
    event.returnValue = "success";
  } else {
    //if(args.type == "modified"){
    git
      .cwd(user().repos[args.org][args.repo].path)
      .checkout([args.path])
      .then(function (result) {
        console.log("success");
      })
      .catch(function (error) {
        console.log(error);
      });
    event.returnValue = "success";
  }
});


ipc.on("git_update_folder", (event, args) => {
  if (fs.existsSync("App")) {
    update.files.forEach(function (this_file) {
      fs.copySync("App/" + this_file, user().current.path + "/" + "App" + "/" + this_file);
      fs.copySync("App/" + this_file, "extra/App/" + this_file);
    });

    update.folders.forEach(function (this_folder) {
      fs.copySync(this_folder, user().current.path + "/" + this_folder, {
        recursive: true,
      });
      fs.copySync(this_folder, "extra/" + this_folder, {
        recursive: true,
      });
    });
  }

  event.returnValue = "Repository App Folder Updated";
});

ipc.on("git_valid_org", (event, args) => {
  var auth_token = fs.readFileSync(git_token_location, "utf8");
  const octokit = new Octokit({
    auth: auth_token,
  });
  octokit.orgs
    .get({
      org: args.org,
    })
    .then(function (result) {
      event.returnValue = "success";
    })
    .catch(function (error) {
      event.returnValue = "error: " + error + " valid org check failed";
    });
});
