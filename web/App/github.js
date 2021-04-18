/*
* Hide github dialog if user presses escape
*/
document.onkeydown = function(evt) {
  evt = evt || window.event;
  var isEscape = false;
  if ("key" in evt) {
    isEscape = (evt.key === "Escape" || evt.key === "Esc");
  } else {
    isEscape = (evt.keyCode === 27);
  }
  if (isEscape) {
    $("#github_dialog").fadeOut();
  }
};

$("#add_organization_btn").on("click",function(){
  bootbox.prompt("What is the name of the github organization the repository is/will be in? (This organization must already exist)", function(response){
    if(response){
      if(typeof(github_json[response]) == "undefined"){
        github_json[response] = {
          "Repositories" : {}
        };
        $('#select_organization').append($('<option>', {
          value: response,
          text: response
        }));
      }
      $("#select_organization").val(response);
      master.github.organization = response;
      $("#select_repository").empty();

      Object.keys(github_json[response]).forEach(function(repository){
        $('#select_repository').append($('<option>', {
          value: repository,
          text: repository
        }));
      });
    }
  });
});

$("#add_repository_btn").on("click",function(){
  bootbox.prompt("What is the name of the repository? (if it doesn't exist yet we'll create it)", function(repository){
    if(repository){
      progress_bootbox({
        start_text: "Feel free to get a coffee while we create/clone your github repository",
        steps: [
          "Checking you have an authentication token",
          "Checking if the organization exists and you are a member of it",
          "Creating/Cloning repository",
          "Switching to new repo",
          "Synching with online repository (will be quick if cloning, 5+ minutes if new repository)",
          "Activate the online repository as a website"
        ],
        labels: [
          "check_auth_token",
          "check_valid_org",
          "create_clone_repo",
          "switch_new_repo",
          "synch_online_repo",
          "activate_github_pages"
        ],
        actions: [
          // "Checking you have an authentication token"
          function(){
            var this_response = Collector
              .electron
              .git
              .token_exists()
            if(this_response !== "success"){
              bootbox.alert(this_response);
              return false;
            } else {
              return true;
            }
          },

          // "Checking if the organization exists and you are a member of it"
          function(){
            var this_response = Collector
              .electron
              .git
              .valid_org(
              {
                organization: $("#select_organization").val()
              }
            );
            if(this_response !== "success"){
              bootbox.alert(this_response);
              return false;
            } else {
              return true;
            }
          },

          // "Creating/Cloning repository"
          function(){
            repository = valid_repository_name(repository);
            if(typeof(github_json
                        [$("#select_organization").val()]
                        [repository]) == "undefined"){
              $('#select_repository').append($('<option>', {
                value: repository,
                text: repository
              }));
              github_json
                [$("#select_organization").val()]
                [repository] = {};
            }
            $("#select_repository").val(repository);
            master.github.repository = repository;
            var this_response = Collector.electron.git.add_repo({
              organization: $("#select_organization").val(),
              repository: $("#select_repository").val()
            });
            if(this_response !== "success"){
              bootbox.alert(this_response);
              return false;
            } else {
              Collector.custom_alert("success");
              $("#save_btn").click();
              return true;
            }
          },

          // "Switching to new repo"
          function(){
            var this_response = Collector.electron.git.switch_repo({
              repository:   $("#select_repository").val(),
              organization: $("#select_organization").val()
            });
            if(this_response !== "success"){
              bootbox.alert(this_response)
              return false;
            } else {
              return true;
            }
          },

          // "Synching with online repository (will be quick if cloning, 5+ minutes if new repository)"
          function(){
            var this_response = Collector.electron.git.push({
              organization: $("#select_organization").val(),
              repository: $("#select_repository").val()
            });
            if(this_response !== "success"){
              bootbox.alert(this_response);
              return false;
            } else {
              return true;
            }
          },

          // "Activate the online repository as a website"
          function(){
            var this_response = Collector.electron.git.pages({
              organization: $("#select_organization").val(),
              repository: $("#select_repository").val()
            });
            if(this_response !== "success"){
              bootbox.alert(this_response);
            } else {
              location.reload();
            }
          }
        ]
      });
    }
  });
});

$("#add_token_btn").on("click",function(){
  bootbox.prompt("Please copy and paste the authentication token you generated by going <a class='btn btn-info' href='https://docs.github.com/en/github/authenticating-to-github/creating-a-personal-access-token' target='_blank'>here</a>", function(auth_token){
    if(auth_token){
      var this_response = Collector.electron.git.add_token(auth_token);
      if(this_response !== "success"){
        bootbox.alert(this_response);
      }
    }
  });
});

$("#delete_organization_btn").on("click", function (){
  bootbox.confirm("Are you sure you want to delete this organisation and all the Repositories on your computer? (this will not delete them online)", function(result){
    if(result){
      delete(
        github_json
          [github_json.organization]
      )
      if(Collector.detect_context() == "localhost"){
        Collector.electron.git.delete_org({
          organization: $("#select_organization").val()
        });
      }
      $("#select_organization option[value='" + $("#select_organization").val() + "']").remove();
    }
  });
});

$("#delete_repo_btn").on("click",function(){
  bootbox.confirm("Are you sure you want to delete this repository?", function(result){
    if(result){
      delete(
        github_json
          [github_json.organization]
          [github_json.repository]
      )
      if(Collector.detect_context() == "localhost"){
        Collector.electron.git.delete_repo({
          organization: $("#select_organization").val(),
          repository:   $("#select_repository").val()
        });
      }
      $("#select_repository option[value='" + $("#select_repository").val() + "']").remove();
    }
  });
});

$("#fadeout_github").on("click", function(){
  if($("#select_repository").val() == "select a repository"){
    $("#select_repository").val(github_json.repository);
  }
  $("#github_dialog").fadeOut();
});

$("#pull_repo_btn").on("click",function(){
  bootbox.confirm("This will overwrite any changes you have made. Are you sure you want to proceed?", function(confirmed){
    if(confirmed){
      var organization = $("#select_organization").val();
      var repository   = $("#select_repository").val();
      progress_bootbox({
        start_text: "Feel free to get a coffee while we pull your github repository",
        steps: [
          "Synching with online repository"
        ],
        labels: [
          "pull_repo_input"
        ],
        actions: [
          function(){
            var pull_response = Collector.electron.git.pull({
              "organization" : organization,
              "repository"   : repository
            });
            if(pull_response !== "success"){
              bootbox.alert(pull_response);
              return false;
            } else {

              //refresh the page
              bootbox.confirm("Do you want to restart Collector so that you can see the changes you've just pulled? (Strongly recommended)", function(response){
                if(response){
                  location.reload();
                }
              });
              return true;
            }
          }
        ]
      });
    }
  });
});

$("#push_repo_btn").on("click",function(){

  /*
  * check user has a valid token before anything else
  */
  if(Collector.electron.git.token_exists()){
    var organization = $("#select_organization").val();
    var repository   = $("#select_repository").val();
    bootbox.prompt({
      title: "Please describe this commit:",
      inputType: "textarea",
      callback: function(message){
        if(message){
          progress_bootbox({
            start_text: "Pushing to your repository<br><br>",
            steps: [
              "Updating your local version of the repository",
              "Push your changes to your online repository"
            ],
            labels: [
              "update_local_repo",
              "push_repo_online"

            ],
            actions: [
              function(){
                var this_response = Collector.electron.git.add_changes({
                  "organization" : organization,
                  "repository"   : repository
                });
                if(this_response !== "success"){
                  bootbox.alert(this_response);
                  return false;
                } else {
                  return true;
                }
                $("#update_local_repo_spinner").hide();
              },
              function(){
                /*
                * commit and push changes
                */
                var this_response = Collector.electron.git.push({
                  "organization" : organization,
                  "repository"   : repository,
                  "message"      : message
                });
                if(this_response !== "success"){
                  bootbox.alert(this_response);
                  return false;
                } else {
                  return true;
                }
              }
            ]
          });
        }
      }
    });
  } else {
    bootbox.alert("You have not yet set up a valid token to manage your github repository with. Please do this by clicking on the <b>Add token</b> button");
  }
});

$("#select_organization").on("change", function(){
  $("#select_repository").attr("disabled",false);
  $("#add_repository_btn").attr("disabled",false);
  var this_org = $("#select_organization").val();


  $("#select_repository").empty();
  github_json[this_org].forEach(function(repository){
    $('#select_repository').append($('<option>', {
        value: repository,
        text:  repository
    }));
  });

  $('#select_repository').append($('<option>', {
      value: "Select a repository",
      text:  "Select a repository",
      disabled: true
  }));
  $('#select_repository').val("Select a repository");
});

$("#select_repository").on("change", function(){
  bootbox.confirm("Changing your repository will cause you to lose all your changes you've made since you last pushed them. Are you sure you want to do this?", function(response){
    var this_org = $("#select_organization").val();
    if(response){
      console.log("howdy");
      master.github.repository = $("#select_repository").val();

      Collector
        .electron
        .git
        .switch_repo({
          old_org:      master.github.organization,
          old_rep:      master.github.repository,
          repository:   $("#select_repository").val(),
          organization: this_org
        });


      master.github.organization = this_org;
      master.github.repository = $("#select_repository").val();
      $("#save_btn").click();
      location.reload();
    } else {
      $("#select_repository").val(
        master
        .github
        .repository
      );
    }
  })

});

$("#view_repo_btn").on("click",function(){
  var organization = $("#select_organization").val();
  var repository   = $("#select_repository").val();

  if(organization == ""){
    organization = username;
  }
  window.open('https://www.github.com/' +
              organization +
              '/' +
              repository,'_blank');
});

function progress_bootbox(this_object){

  var message_html = this_object.start_text +
    "<table style='margin:10px'>";



  this_object.steps.forEach(function(this_step,step_index){
    message_html +=
    "<tr>" +
      "<td>" +
        '<input class="form-check-input" type="checkbox" value="" id="' +
          this_object.labels[step_index]
        + '_input">' +
      "</td>" +
      "<td>" +
        "<div id='" +
          this_object.labels[step_index]
        + "_div'>" + this_step + "</div>" +
      "</td>" +
      "<td>" +
        '<span class="spinner-border text-primary" role="status" id="' +
          this_object.labels[step_index]
        + '_spinner">' +
          '<span class="sr-only">Loading...</span>' +
        '</span>' +
      "</td>" +
    "</tr>";
  });
  message_html += "</table>";
  bootbox.alert(message_html);

  function sequential_progression(actions_list,labels_list){
    setTimeout(function(){
      this_label    = labels_list.shift();
      this_function = actions_list.shift();
      if(this_function()){
        $("#" + this_label + "_input").attr("checked",true);
        $("#" + this_label + "_div").addClass("text-primary");
        $("#" + this_label + "_spinner").hide();
        if(actions_list.length > 0){
          sequential_progression(actions_list, labels_list);
        }
      } else {
        $("#" + this_label + "_input").fadeOut();
        $("#" + this_label + "_div").addClass("text-danger");
        $("#" + this_label + "_spinner").hide();
      }
    },500);
  }
  sequential_progression(
    this_object.actions,
    this_object.labels,
  );
}

function valid_repository_name(repository){
  if(repository.indexOf(" ") !== -1){
    bootbox.alert("<b>" + repository + "</b> has at least one space in it - removing all spaces");
  }
  repository = repository.replaceAll(" ","");
  return (repository);
}
