var navbar_names = [
  "Projects",
  "PhaseTypes",
  "Surveys",
  //"Pathway",
  "Data",
  "RedCap"
];
var pages = [
  "Projects/Projects.html",
  "PhaseTypes/PhaseTypes.html",
  "Surveys/Surveys.html",
  //"Pathways/Pathways.html",
  "Data/Data.html",
  "RedCap/RedCap.html"
];
var icons = [
  "folder",
  "code-slash",
  "card-checklist",
  //"arrow-up-right",
  "table",
  "Redcap"
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

/*
 * Detect if there are any repositories yet
 */

//CElectron.fs.list_projects();
navbar_html = "";
navbar_names.forEach(function (name, index) {
  var this_icon = icons[index];
  var navbar_btn = $("<div>")
    .css("font-size", "20px")
    .addClass("top_icon")
    .addClass("select_page")
    .addClass("btn")
    .addClass("btn-primary")
    .addClass("bi")
    .addClass("bi-" + this_icon)
    .prop("id", "top_tab_" + name)
    .append(
      $("<span>")
        .addClass("content_name")
        .html(name)
    );
  
    navbar_html += navbar_btn[0].outerHTML;



  /* possibly deletable, as has redundant code and is harder to read:
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
  */
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
  if (typeof user.repos === "undefined") {
    var git_exists = CElectron.git.exists();
    if (git_exists !== "true-true") {
      git_exists = git_exists.split("-");
      if (git_exists[0] !== "true") {
        bootbox.prompt(
          "What github email do you want to use?",
          function (email) {
            var email_response = CElectron.git.set_email(email);
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
            var name_response = CElectron.git.set_name(name);
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
          var commits_behind = CElectron.git.status({
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

  var git_status = CElectron.git.status({
    org: $("#select_org").val(),
    repo: $("#select_repo").val(),
  });

  try {
    git_status = JSON.parse(git_status);

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
      var response = CElectron.git.undo({
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
    break;
  case "github":
  case "server":
    break;
  default:
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

$("#reset_collector_btn").on("click", function(){
  bootbox.alert("If you want to reset Collector, you just need to remove the <b>.collector</b> folder that is in your user folder. You may want to copy your Private/github_token.txt file to avoid needing to create a new authorization token.");
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


/*
 * when you've loaded all the relevant js files
 */
function loading_scripts(script_url) {
  /*
  let script = document.createElement("script");
  script.setAttribute("src", "github.js");
  document.body.appendChild(script);

  // now wait for it to load...
  script.onload = () => {
  */
  loaded_scripts[script_url] = true;
  if (
    Object.keys(loaded_scripts).filter((row) => loaded_scripts[row] === false)
      .length === 0
  ) {
    Collector.start();
  }
    // script has loaded, you can now use it safely
    //alert('thank me later')
    // ... do something with the newly loaded script
  //};
}

var loaded_scripts = {
  "github.js": false,
  "SheetFunctions.js": false, //for projects
  "Graphic.js": false,        //for phasetypes
};

// This loads in the custom 'Redcap' button icon
$('#top_tab_RedCap').prepend('<svg id="Redcap-icon" xmlns="http://www.w3.org/2000/svg" width="35" height="22" viewBox="0 0 15 10.601" style="transform: translate(-5px, -1px);">'+
'<path fill="#ffffff" d="m.585,9.633c.985.647,2.508-.202,3.425-.919.488.251,1.05.553,1.716.919,1.409.776,3.094,1.317,4.589.703,1.35-.551,1.955-1.793,2.14-2.276.541.101,1.657.23'+
'4,2.14-.028.052-.026.091-.073.11-.129,1.022-2.974-.708-6.148-3.657-6.959.04-.462-.279-.837-.701-.902l-.18-.03c-.443-.07-.856.216-.952.64-.005,0-.806-.098-.832-.103-1.91-.239-'+
'3.715.919-4.294,2.754l-.827,2.625c-.884.483-2.039,1.111-2.103,1.151,0,0-.002,0-.005.002-1.081.72-1.662,1.831-.57,2.553ZM8.186,1c-.895.488-1.58,1.303-1.896,2.304l-.755,2.388c'+
'-.537-.007-1.207.012-1.737.094l.738-2.344c.497-1.575,2.016-2.581,3.65-2.442Zm3.427.647c2.299,1.027,3.443,3.617,2.684,5.998-.18.052-.698.143-1.685-.033.455-2.051.094-4.175-.'+
'998-5.965ZM1.895,7.209l1.636-.893c2.768-.476,7.158.635,8.487,1.573-.347.863-.999,1.653-1.882,2.014-1.123.459-2.531.23-4.186-.682-1.088-.598-2.899-1.577-4.055-2.011Z"/></svg>');
// This turns the RedCap icon blue when it's active
$("#top_tab_RedCap").on("click", function () {
  $('#Redcap-icon').find("path").css({ fill: '#20669b' });
});
  // This is the global variable that ensure 
parent.parent.functionIsRunning = false;