/*
 * Hide github dialog if user presses escape
 */
document.onkeydown = function (evt) {
  evt = evt || window.event;
  var isEscape = false;
  if ("key" in evt) {
    isEscape = evt.key === "Escape" || evt.key === "Esc";
  } else {
    isEscape = evt.keyCode === 27;
  }
  if (isEscape) {
    $("#github_dialog").fadeOut();
  }
};

$(".git_btn").on("click", function () {
  var card_element = $("#" + this.value);
  if (card_element.is(":visible")) {
    card_element.slideUp();
  } else {
    card_element.slideDown();
  }
});

$("#add_organization_btn").on("click", function () {
  bootbox.prompt(
    "What is the name of the github organization the repository is/will be in? (This organization must already exist)",
    function (response) {
      if (response) {
        if (typeof user.repos[response] == "undefined") {
          user.repos[response] = {};
          $("#select_org").append(
            $("<option>", {
              value: response,
              text: response,
            })
          );
        }
        $("#select_org").val(response);
        user.current.org = response;
        $("#select_repo").empty();

        Object.keys(user.repos[response]).forEach(function (repository) {
          $("#select_repo").append(
            $("<option>", {
              value: repository,
              text: repository,
            })
          );
        });
      }
    }
  );
});

$("#add_repository_btn").on("click", function () {
  var org = $("#select_org").val();
  bootbox.prompt(
    "What is the name of the repository? (if it doesn't exist yet we'll create it)",
    function (repo) {
      if (repo) {
        progress_bootbox({
          start_text:
            "Feel free to get a coffee while we create/clone your github repository",
          steps: [
            "Checking you have an authentication token",
            "Checking if the organization exists and you are a member of it",
            "Specify where you want your repository (be ready for this)",
            "Synching with online repository",
            "Activate the online repository as a website",
          ],
          labels: [
            "check_auth_token",
            "check_valid_org",
            "create_clone_repo",
            "synch_online_repo",
            "activate_github_pages",
          ],
          actions: [
            // "Checking you have an authentication token"
            function () {
              var this_response = Collector.electron.git.token_exists();
              if (this_response !== "success") {
                bootbox.alert(this_response);
                return false;
              } else {
                return true;
              }
            },

            // "Checking if the organization exists and you are a member of it"
            function () {
              var this_response = Collector.electron.git.valid_org({
                org: org,
              });
              if (this_response !== "success") {
                bootbox.alert(this_response);
                return false;
              } else {
                return true;
              }
            },

            // "Creating/Cloning repository"
            function () {
              repo = valid_repository_name(repo);
              if (typeof user.repos[org][repo] == "undefined") {
                $("#select_repo").append(
                  $("<option>", {
                    value: repo,
                    text: repo,
                  })
                );
                user.repos[org][repo] = {};
              }
              $("#select_repo").val(repo);
              user.current.repo = repo;
              var this_response = Collector.electron.git.add_repo({
                org: org,
                repo: repo,
              });
              if (this_response == "you have cloned an existing repository") {
                location.reload();
              } else if (this_response !== "success") {
                bootbox.alert(this_response);
                return false;
              } else {
                Collector.custom_alert("success");
                //$("#save_btn").click();
                return true;
              }
            },

            // "Synching with online repository"
            function () {
              var this_response = Collector.electron.git.push({
                org: org,
                repo: repo,
                path: user.current.path,
              });
              if (this_response !== "success") {
                bootbox.alert(this_response);
                return false;
              } else {
                return true;
              }
            },

            // "Activate the online repository as a website"
            function () {
              var this_response = Collector.electron.git.pages({
                org: org,
                repo: repo,
              });
              if (this_response !== "success") {
                bootbox.alert(this_response);
              } else {
                location.reload();
              }
            },
          ],
        });
      }
    }
  );
});

$("#add_token_btn").on("click", function () {
  bootbox.prompt(
    "Please copy and paste the authentication token you generated by going <a class='btn btn-info' href='https://docs.github.com/en/github/authenticating-to-github/creating-a-personal-access-token' target='_blank'>here</a>",
    function (auth_token) {
      if (auth_token) {
        var this_response = Collector.electron.git.add_token(auth_token);
        if (this_response !== "success") {
          bootbox.alert(this_response);
        }
      }
    }
  );
});

$("#delete_organization_btn").on("click", function () {
  bootbox.confirm(
    "Are you sure you want to delete this organisation from Collector? This will not delete the files on your computer or online.",
    function (result) {
      if (result) {
        delete user.repos[$("#select_org").val()];
        $(
          "#select_org option[value='" + $("#select_org").val() + "']"
        ).remove();
      }
    }
  );
});

$("#delete_repo_btn").on("click", function () {
  bootbox.confirm(
    "Are you sure you want to remove this repository from Collector? This will not delete it on your computer or online.",
    function (result) {
      if (result) {
        delete user.repos[$("#select_org").val()][$("#select_repo").val()];
        $(
          "#select_repo option[value='" + $("#select_repo").val() + "']"
        ).remove();
      }
    }
  );
});

$("#fadeout_github").on("click", function () {
  if ($("#select_repo").val() == "select a repository") {
    $("#select_repo").val(user.current.repo);
  }
  $("#github_dialog").fadeOut();
});

$("#find_repo_btn").on("click", function () {
  //resume here
  var response = Collector.electron.open_folder("repo", "");
  console.dir(response);
});

$("#local_repo_btn").on("click", function () {
  var path = Collector.electron.find_path()[0];

  if(typeof(path) !== "undefined"){
    /*
     * get info about repo
     */

    var repo_info = JSON.parse(Collector.electron.git.repo_info(path));
    var org = repo_info.organization;
    var repo = repo_info.repository;
    /*
     * create organization if it doesn't exist
     */
    if (typeof user.repos[org] === "undefined") {
      user.repos[org] = {};
    }

    if (typeof user.repos[org][repo] === "undefined") {
      user.repos[org][repo] = {
        path: path,
      };
      user.current.path = path;
      user.current.org = org;
      user.current.repo = repo;

      Collector.save_user();
      list_repos();
      $("#select_org").val(user.current.org);
      $("#select_repo").val(user.current.repo);
      setTimeout(function () {
        /*
         * Let user briefly see the org and repo
         */
        location.reload();
      }, 1000);
    } else {
      var this_repo = user.repos[org][repo];
      bootbox.alert("You already have this repository in: " + this_repo.path);
    }
  }
});

$("#pull_repo_btn").on("click", function () {
  /*
   * check if anything is not committed locally
   */

  /*
   * show the user what they're about to pull
   */

  bootbox.confirm(
    "This will overwrite any changes you have made. Are you sure you want to proceed?",
    function (confirmed) {
      if (confirmed) {
        var org = $("#select_org").val();
        var repo = $("#select_repo").val();
        progress_bootbox({
          start_text:
            "Feel free to get a coffee while we pull your github repository",
          steps: ["Synching with online repository"],
          labels: ["pull_repo_input"],
          actions: [
            function () {
              var pull_response = Collector.electron.git.pull({
                org: org,
                repo: repo,
              });
              if (pull_response !== "success") {
                bootbox.alert(pull_response);
                return false;
              } else {
                location.reload();

                /*
                //refresh the page
                bootbox.confirm(
                  "Do you want to restart Collector so that you can see the changes you've just pulled? (Strongly recommended)",
                  function (response) {
                    if (response) {
                      location.reload();
                    }
                  }
                );
                */
                return true;
              }
            },
          ],
        });
      }
    }
  );
});

$("#push_repo_btn").on("click", function () {
  /*
   * check user has a valid token before anything else
   */
  if (Collector.electron.git.token_exists()) {
    var org = $("#select_org").val();
    var repo = $("#select_repo").val();
    bootbox.prompt({
      title: "Please describe this commit:",
      inputType: "textarea",
      callback: function (message) {
        if (message) {
          progress_bootbox({
            start_text: "Pushing to your repository<br><br>",
            steps: ["Push your changes to your online repository"],
            labels: ["push_repo_online"],
            actions: [
              function () {
                /*
                 * commit and push changes
                 */
                var this_response = Collector.electron.git.push({
                  org: org,
                  repo: repo,
                  message: message,
                });
                if (this_response !== "success") {
                  bootbox.alert(this_response);
                  return false;
                } else {
                  return true;
                }
              },
            ],
          });
        }
      },
    });
  } else {
    bootbox.alert(
      "You have not yet set up a valid token to manage your github repository with. Please do this by clicking on the <b>Add token</b> button"
    );
  }
});

$("#select_org").on("change", function () {
  $("#select_repo").attr("disabled", false);
  $("#add_repository_btn").attr("disabled", false);
  var this_org = $("#select_org").val();

  $("#select_repo").empty();
  Object.keys(user.repos[this_org]).forEach(function (repo) {
    $("#select_repo").append(
      $("<option>", {
        value: repo,
        text: repo,
      })
    );
  });

  $("#select_repo").append(
    $("<option>", {
      value: "Select a repository",
      text: "Select a repository",
      disabled: true,
    })
  );
  $("#select_repo").val("Select a repository");
});

$("#select_repo").on("change", function () {
  bootbox.confirm(
    "Are you sure you want to change to the following repo? Press CTRL-S if you would like to save your changes first",
    function (response) {
      if (response) {
        user.current.org = $("#select_org").val();
        user.current.repo = $("#select_repo").val();
        user.current.path =
          user.repos[user.current.org][user.current.repo].path;
        Collector.save_user();
        location.reload();
      }
    }
  );
});

$("#view_repo_btn").on("click", function () {
  var org = $("#select_org").val();
  var repo = $("#select_repo").val();
  window.open("https://www.github.com/" + org + "/" + repo, "_blank");
});

function list_repos() {
  var these_orgs = Object.keys(user.repos).sort();
  these_orgs.forEach(function (org) {
    $("#select_org").append(
      $("<option>", {
        value: org,
        text: org,
      })
    );
  });
  if (user.current.org !== "") {
    $("#select_org").val(user.current.org);
    var these_repos = Object.keys(
      user.repos[user.current.org]
    ).sort();
    these_repos.forEach(function (repo) {
      $("#select_repo").append(
        $("<option>", {
          value: repo,
          text: repo,
        })
      );
    });
    if (user.current.repo !== "") {
      $("#select_repo").val(user.current.repo);
    }
  }
}

function progress_bootbox(this_object) {
  var message_html = this_object.start_text + "<table style='margin:10px'>";

  this_object.steps.forEach(function (this_step, step_index) {
    message_html +=
      "<tr>" +
      "<td>" +
      '<input class="form-check-input" type="checkbox" value="" id="' +
      this_object.labels[step_index] +
      '_input">' +
      "</td>" +
      "<td>" +
      "<div id='" +
      this_object.labels[step_index] +
      "_div'>" +
      this_step +
      "</div>" +
      "</td>" +
      "<td>" +
      '<span class="spinner-border text-primary" role="status" id="' +
      this_object.labels[step_index] +
      '_spinner">' +
      '<span class="sr-only"></span>' +
      "</span>" +
      "</td>" +
      "</tr>";
  });
  message_html += "</table>";
  bootbox.alert(message_html);

  function sequential_progression(actions_list, labels_list) {
    setTimeout(function () {
      this_label = labels_list.shift();
      this_function = actions_list.shift();
      if (this_function()) {
        $("#" + this_label + "_input").attr("checked", true);
        $("#" + this_label + "_div").addClass("text-primary");
        $("#" + this_label + "_spinner").hide();
        if (actions_list.length > 0) {
          sequential_progression(actions_list, labels_list);
        }
      } else {
        $("#" + this_label + "_input").fadeOut();
        $("#" + this_label + "_div").addClass("text-danger");
        $("#" + this_label + "_spinner").hide();
      }
    }, 500);
  }
  sequential_progression(this_object.actions, this_object.labels);
}

function valid_repository_name(repo) {
  if (repo.indexOf(" ") !== -1) {
    bootbox.alert(
      "<b>" +
        repository +
        "</b> has at least one space in it - removing all spaces"
    );
  }
  repo = repo.replaceAll(" ", "");
  return repo;
}
loading_scripts("github.js");
