var navbar_names = [
  "Projects",
  "Code",
  "Surveys",
  //"Pathway",
  "Data",
];
var pages = [
  "Projects/Projects.html",
  "Code/Code.html",
  "Surveys/Surveys.html",
  //"Pathways/Pathways.html",
  "Data/Data.html",
];
var icons = [
  "folder",
  "code-slash",
  "card-checklist",
  //"arrow-up-right",
  "table",
];
navbar_names.forEach(function (this_name, index) {
  $("#content_area").append(
    "<div class='collapse multi-collapse' " +
      "style='margin:20px; width:100%' " +
      "id='collapse_" +
      this_name +
      "'>"
  );
  $("#collapse_" + this_name).load(pages[index]);
});

navbar_html = "";
navbar_names.forEach(function (name, index) {
  var this_icon = icons[index];
  navbar_html +=
    '<button style="font-size:20px;" class="top_icon select_page btn btn-primary bi-' +
    this_icon +
    '" id="top_tab_' +
    name +
    '" ' +
    'data-toggle="collapse" ' +
    'href="#collapse_' +
    name +
    '" ' +
    'role="button" ' +
    'aria-expanded="false" ' +
    'aria-controls="#collapse_' +
    name +
    '">' +
    '<input type="radio" ' +
    'style="display:none" ' +
    'name="options" ' +
    'autocomplete="off" > ' +
    '<span class="content_name">' +
    name +
    "</span>" +
    " </button>";
});

$("#page_selected").html(navbar_html);

$(".select_page").on("click", function () {
  $(".collapse").hide();
  $("#collapse_" + this.id.replace("top_tab_", "")).show();
  $(".select_page").css("font-weight", "normal");
  $(this).css("font-weight", "bold");
  $(".select_page").removeClass("bg-white");
  $(".select_page").removeClass("text-primary");
  $(this).addClass("bg-white");
  $(this).addClass("text-primary");
});

$("#help_area").load("Help/Help.html");
$("#logo_div").load("../logos/logo.html");
$("#github_div").load("github.html");
$("#platforms_div").load("Platforms.html");
$("#register_div").load("Register.html");

setTimeout(function () {
  $("#loading_spinner").fadeOut(function () {
    $("#everything").fadeIn();
  });
}, 500);

var top_icon_timer;
$(".top_icon").hover(
  function () {
    var this_icon = this;
    top_icon_timer = setTimeout(function () {
      $(this_icon).find(".content_name").animate({ "font-size": "15px" });
    }, 500);
  },
  function () {
    clearTimeout(top_icon_timer);
    $(this).find(".content_name").animate({ "font-size": "0px" });
  }
);

$("#github_logo").on("click", function () {
  if (typeof user.repos == "undefined") {
    var git_exists = Collector.electron.git.exists();
    if (git_exists !== "true-true") {
      git_exists = git_exists.split("-");
      if (git_exists[0] !== "true") {
        bootbox.prompt(
          "What github email do you want to use?",
          function (email) {
            var email_response = Collector.electron.git.set_email(email);
            if (email_response !== "success") {
              bootbox.alert("error: " + email_response);
            }
          }
        );
      }
      if (git_exists[1] !== "true") {
        bootbox.prompt(
          "What github username do you want to use?",
          function (name) {
            var name_response = Collector.electron.git.set_name(name);
            if (name_response !== "success") {
              bootbox.alert("error: " + name_response);
            }
          }
        );
      }
    } else {
      list_repos();

      if (typeof org !== "undefined" && org !== "") {
        var repos = Object.keys(user.repos[org]);
        repos.forEach(function (repository) {
          $("#select_repo").append(
            $("<option>", {
              value: repository,
              text: repository,
            })
          );
        });
        $("#select_repo").val(master.github.repository);
      }

      setTimeout(function () {
        if (
          typeof master.github.organization !== "undefined" &&
          master.github.organization !== "" &&
          typeof master.github.repository !== "undefined" &&
          master.github.repository !== ""
        ) {
          var commits_behind = Collector.electron.git.status({
            organization: master.github.organization,
            repository: master.github.repository,
          });
          if (commits_behind !== 0) {
            bootbox.alert(
              "You are behind by " +
                commits_behind +
                " commits (or you'll have just seen an error message). Be careful about pushing or pulling changes until your local repository is synched up with the online repository"
            );
          }
        }
      }, 1000);
    }
  }

  /*
   * check repository information
   */

  var git_status = Collector.electron.git.status({
    org: $("#select_org").val(),
    repo: $("#select_repo").val(),
  });

  try {
    git_status = JSON.parse(git_status);
    console.log(git_status);

    if (git_status.ahead > 0) {
      $("#git_ahead").addClass("bg-danger");
      $("#git_ahead").addClass("text-white");
    } else {
      $("#git_ahead").removeClass("bg-danger");
      $("#git_ahead").removeClass("text-white");
    }

    if (git_status.behind > 0) {
      $("#git_behind").addClass("bg-danger");
      $("#git_behind").addClass("text-white");
    } else {
      $("#git_behind").removeClass("bg-danger");
      $("#git_behind").removeClass("text-white");
    }

    $("#git_ahead").val(git_status.ahead);
    $("#git_behind").val(git_status.behind);

    /*
     * clear and update each of the cards for each change
     */

    var git_updates = [
      "conflicted",
      "created",
      "deleted",
      "modified",
      "not_added",
      "renamed",
      "staged",
    ];

    git_updates.forEach(function (git_update) {
      if (git_status[git_update].length > 0) {
        $("#git_" + git_update + "_btn").show();
        $("#git_" + git_update + "_card")
          .find($(".card-body"))
          .html(
            "<table>" +
              git_status[git_update]
                .map(function (row) {
                  if (row !== "") {
                    return (
                      "<tr>" +
                      "<td>" +
                      row +
                      "</td>" +
                      "<td><button class='btn btn-primary update_btn " +
                      git_update +
                      "' value='" +
                      row +
                      "'>Undo " +
                      git_update +
                      "</button></td>" +
                      "</tr>"
                    );
                  }
                })
                .join("") +
              "</table>"
          );
      } else {
        $("#git_" + git_update + "_btn").hide();
        $("#git_" + git_update + "_card").hide();
      }
    });

    $(".update_btn").on("click", function () {
      var git_type;
      var this_element = $(this);
      git_updates.forEach(function (git_update) {
        if (this_element.hasClass(git_update)) {
          git_type = git_update;
        }
      });
      var response = Collector.electron.git.undo({
        org: $("#select_org").val(),
        repo: $("#select_repo").val(),
        path: $(this).val(),
        type: git_type,
      });
      Collector.custom_alert(response);
      $("#github_logo").click();
    });
  } catch (error) {
    //bootbox.alert(git_status);
  }
  /*
  if(git_status == "Incomplete org or repo information"){
    //bootbox.alert(git_status);
  } else {

  }
  */
  $("#github_dialog").fadeIn();
});

switch (Collector.detect_context()) {
  case "localhost":
    //show the github icon
    $("#github_logo").show();
    $("#data_storage_logo").show();
    break;
  case "github":
  case "server":
    $("#data_storage_logo").show();
    break;
  default:
    $("#data_storage_logo").show(); //this might be redundant
    break;
}

$("#power_btn").on("click", function () {
  bootbox.dialog({
    title: "Do you want to restart or close Collector?",
    message:
      "Or you can press cancel if you want to carry on without restarting or closing Collector",
    buttons: {
      restart: {
        label: "Restart",
        className: "btn-info",
        callback: function () {
          location.reload();
        },
      },
      close: {
        label: "Push Changes and Close",
        className: "btn-primary",
        callback: function () {
          $("#save_btn").click();
          /*
           * Push changes in repository to github
           */

          /*
           * Give the above a little time to register before closing
           */
          setTimeout(function () {
            close();
          }, 2000);
        },
      },
      cancel: {
        label: "Cancel",
        className: "btn-secondary",
        callback: function () {},
      },
    },
  });
});
$("#show_citations").on("click", function () {
  $.get("PopOuts/Citations.csv", function (result) {
    var table_html = '<h3 class="text-primary">Citations</h3>' + "<p>";

    Collector.PapaParsed(result).forEach(function (row) {
      table_html +=
        '<a class="btn btn-primary" data-toggle="collapse" href="#cite_' +
        row.paper +
        '" role="button" aria-expanded="false" aria-controls="cite_' +
        row.paper +
        '" style="margin:2px; width:100%">' +
        row.description +
        "</a>";

      table_html +=
        '<div class="collapse" id="cite_' +
        row.paper +
        '">' +
        '<div class="card card-body">' +
        "<table>" +
        "<tr>" +
        "<th>MLA</td>" +
        "<td><div contenteditable='true' onclick='document.execCommand(\"selectAll\", false, null);' class='citation_info'>" +
        row.mla +
        "</div></td>" +
        "</tr><tr>" +
        "<th>APA</td>" +
        "<td><div contenteditable='true' onclick='document.execCommand(\"selectAll\", false, null);' class='citation_info'>" +
        row.apa +
        "</div></td>" +
        "</tr><tr>" +
        "<th>Chicago</td>" +
        "<td><div contenteditable='true' onclick='document.execCommand(\"selectAll\", false, null);' class='citation_info'>" +
        row.chicago +
        "</div></td>" +
        "</tr><tr>" +
        "<th>Harvard</td>" +
        "<td><div contenteditable='true' onclick='document.execCommand(\"selectAll\", false, null);' class='citation_info'>" +
        row.harvard +
        "</div></td>" +
        "</tr><tr>" +
        "<th>Vancouver</td>" +
        "<td><div contenteditable='true' onclick='document.execCommand(\"selectAll\", false, null);' class='citation_info'>" +
        row.vancouver +
        "</div></td>" +
        "</tr></table></div></div>";
    });

    table_html += "</table>";

    bootbox.alert(table_html);
  });
});

$("#show_contributors").on("click", function () {
  $.get("PopOuts/contributors.html", function (this_html) {
    bootbox.alert({
      message: this_html,
      size: "large",
    });
  });
});

$("#show_maps").on("click", function () {
  $.get("PopOuts/Maps.html", function (this_html) {
    bootbox.alert({
      message: this_html,
      size: "large",
    });
  });
});

$("#show_security_info").on("click", function () {
  $.get("PopOuts/security.html", function (this_html) {
    bootbox.alert({
      message: this_html,
      size: "large",
    });
  });
});

$("#data_storage_logo").on("click", function () {
  update_server_table();
  $("#login_modal").fadeIn();
});

/*
 * when you've loaded all the relevant js files
 */
function loading_scripts(script_url) {
  let script = document.createElement("script");
  script.setAttribute("src", "github.js");
  document.body.appendChild(script);

  // now wait for it to load...
  script.onload = () => {
    loaded_scripts[script_url] = true;
    if (
      Object.keys(loaded_scripts).filter((row) => loaded_scripts[row] == false)
        .length == 0
    ) {
      Collector.start();
    }
    // script has loaded, you can now use it safely
    //alert('thank me later')
    // ... do something with the newly loaded script
  };
}

var loaded_scripts = {
  "github.js": false,
};
