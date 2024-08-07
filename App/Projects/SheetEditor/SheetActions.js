/*
 * SheetActions.js
 * Projects page actions (i.e. element triggers)
 */

$("#default_projects_select").on("change", function () {
  if ($("#default_projects_select").val() !== "Select an experiment") {
    $("#upload_default_exp_btn").attr("disabled", false);
  }
});

$("#delete_proj_btn").on("click", function () {
  var firstResponse = '';
  if (!parent.parent.functionIsRunning) {
    parent.parent.functionIsRunning = true;
    var proj_name = $("#project_list").val();
    if (proj_name === null) {
      bootbox.alert("You need to select a study to delete it");
      parent.parent.functionIsRunning = false;
    } else {
      bootbox.confirm({
        message: "Are you sure you want to delete the <b>" + proj_name+ "</b> project?",
        buttons: {
            confirm: {
                label: 'Yes',
                className: 'btn-success'
            },
            cancel: {
                label: 'No',
                className: 'btn-danger'
            }
        },
        callback: function (result) {
            parent.parent.functionIsRunning = false;
            firstResponse = result;
            console.log('This was logged in the callback: ' + result);
            console.log("1 " + firstResponse);
       
          if (firstResponse == true) {
            console.log("2 " + firstResponse);
            bootbox.confirm({
              message: "Are you very sure? This cannot be undone",
              buttons: {
                confirm: {
                    label: 'Yes',
                    className: 'btn-success'
                },
                cancel: {
                    label: 'No',
                    className: 'btn-danger'
                }
              },
              callback: function (result) {
                parent.parent.functionIsRunning = false;
                if (result) {
                  //delete from master
                  delete master.projects.projects[proj_name];

                  $("#project_list option:contains(" + proj_name + ")")[0].remove();
                  $("#project_list").val(document.getElementById("project_list").options[1].value);
                  Collector.custom_alert(proj_name + " succesfully deleted");
                  update_handsontables();

                  //delete the local file if this is
                  if (Collector.detect_context() === "localhost") {CElectron.fs.delete_project(proj_name,
                      function (response) {
                        if (response !== "success") {
                          bootbox.alert(response);
                        }
                      }
                    );
                    setTimeout(() => {
                      $('#save_btn').click();
                    }, 100);
                  }
                }
              }
            });
          }
        }
      });
    }
  }
});

$("#delete_proc_button").on("click", function () {
  if (!parent.parent.functionIsRunning) {
    parent.parent.functionIsRunning = true;
    if ($("#proc_select option").length < 2) {
      bootbox.alert(
        "This would mean you have no procedure sheets. Please just edit the current sheet rather than deleting it."
      );
      parent.parent.functionIsRunning = false;
    } else {
      console.log("Delete!!")
      var proc_file = $("#proc_select").val();
      bootbox.confirm({
        message: "Are you sure you want to delete the <b>"+ proc_file +"</b> procedure sheet?",
        buttons: {
            confirm: {
                label: 'Yes',
                className: 'btn-success'
            },
            cancel: {
                label: 'No',
                className: 'btn-danger'
            }
        },
        callback: function (result) {
          parent.parent.functionIsRunning = false;
            firstResponse = result;
          if (firstResponse == true) {
            console.log("2 " + firstResponse);
            bootbox.confirm({
              message: "Are you very sure? This cannot be undone",
              buttons: {
                confirm: {
                    label: 'Yes',
                    className: 'btn-success'
                },
                cancel: {
                    label: 'No',
                    className: 'btn-danger'
                }
              },
              callback: function (result) {
                if (!result) {
                  // do nothing
                } else {
                  /*
                  * delete from master
                  */
                  var project = $("#project_list").val();
                  var proc_file = $("#proc_select").val();
                  var file_path = "Projects" + "/" + project + "/" + proc_file;
                  delete master.projects.projects[project].all_procs[proc_file];

                  // update the lists
                  update_handsontables();

                  /*
                  * Delete the file locally if in electron
                  */
                  var file_path = "Projects" + "/" + project + "/" + proc_file;
                  if (Collector.detect_context() === "localhost") {
                    var this_response = CElectron.fs.delete_file(file_path);
                    if (this_response !== "success") {
                      bootbox.alert(this_response);
                    } else {
                      Collector.custom_alert(this_response);
                    }
                  }
                  setTimeout(() => {
                    $('#save_btn').click();
                  }, 100);
                }
              }
            });
          }
        }
      });
    }
  }
});

$("#delete_stim_button").on("click", function () {
  if (!parent.parent.functionIsRunning) {
    parent.parent.functionIsRunning = true;
    if ($("#stim_select option").length < 2) {
      bootbox.alert(
        "This would mean you have no stimuli sheets. Please just edit the current sheet rather than deleting it."
      );
      setTimeout(() => {
        parent.parent.functionIsRunning = false;
      }, 500);
    } else {
      var stimName = $('#stim_select').val();
      bootbox.confirm({
        message: "Are you sure you want to delete the <b>" + stimName + "</b> stimuli sheet?",
        buttons: {
            confirm: {
              label: 'Yes',
              className: 'btn-success'
            },
            cancel: {
              label: 'No',
              className: 'btn-danger'
            }
        },
        callback: function (result) {
          parent.parent.functionIsRunning = false;
          firstResponse = result;       
          if (firstResponse == true) {
            bootbox.confirm({
              message: "Are you very sure? This cannot be undone",
              buttons: {
                confirm: {
                  label: 'Yes',
                  className: 'btn-success'
                },
                cancel: {
                  label: 'No',
                  className: 'btn-danger'
                }
              },
              callback: function (result) {
                if (!result) {
                  // do nothing
                } else {
                  /*
                  * delete from master
                  */
                  var project = $("#project_list").val();
                  var stim_file = $("#stim_select").val();
                  delete master.projects.projects[project].all_stims[stim_file];

                  delete master.projects.projects[project].stims_csv[stim_file];

                  // update the lists
                  update_handsontables();

                  /*
                  * Delete the file locally if in electron
                  */
                  var file_path = "Projects" + "/" + project + "/" + stim_file;
                  if (Collector.detect_context() === "localhost") {
                    var this_response = CElectron.fs.delete_file(file_path);
                    if (this_response !== "success") {
                      bootbox.alert(this_response);
                    } else {
                      Collector.custom_alert(this_response);
                    }
                  }
                  setTimeout(function() { 
                    $("#save_btn").click();
                  }, 2100);
                }
              }
            });
          }
        }
      });
    }
  }
});

$("#download_project_button").on("click", function () {
  if (!parent.parent.functionIsRunning) {
    parent.parent.functionIsRunning = true;
    var project = $("#project_list").val();
    var project_json = master.projects.projects[project];
    var default_filename = project + ".json";
    bootbox.prompt({
      title: "What do you want to save this file as?",
      value: default_filename, //"data.csv",
      callback: function (result) {
        parent.parent.functionIsRunning = false;
        if (result) {
          Collector.download_file(
            result,
            JSON.stringify(project_json, null, 2),
            "json"
          );
        }
      },
    });
  };
});

$("#new_proc_button").on("click", function () {
  if (!parent.parent.functionIsRunning) {
    parent.parent.functionIsRunning = true;
    var proc_template = default_project.all_procs["procedure_1.csv"];
    bootbox.prompt(
      "What yould you like to name the new <b>Procedure</b>?",
      function (new_proc_name) {
        parent.parent.functionIsRunning = false;
        if (new_proc_name) {
          var project = $("#project_list").val();
          var this_proj = master.projects.projects[project];
          var current_procs = Object.keys(this_proj.all_procs);
          if (current_procs.indexOf(new_proc_name) !== -1) {
            bootbox.alert("You already have a procedure sheet with that name");
          } else {
            new_proc_name = new_proc_name.replace(/ /g, "_").replace(".csv", "") + ".csv";
            this_proj.all_procs[new_proc_name] = proc_template;
            $("#proc_select").append(
              $("<option>", {
                text: new_proc_name,
              })
            );
            $("#proc_select").val(new_proc_name);
            createExpEditorHoT(
              this_proj.all_procs[new_proc_name],
              "procedure",
              new_proc_name
            ); 
            setTimeout(() => {
              $('#save_btn').click();
            }, 100);
          }
        }
      }
    );
  };
});

$("#new_project_button").on("click", function () {
  if (!parent.parent.functionIsRunning) {
    parent.parent.functionIsRunning = true;
    bootbox.prompt(
      "What would you like to name the new <b>Project</b>?",
      function (result) {
        parent.parent.functionIsRunning = false;
        if (result !== null) {
          result = result.toLowerCase();
          result = Collector.clean_string(result);
          if ($("#project_list").text().indexOf(result) !== -1) {
            bootbox.alert("You already have an experiment with this name");
          } else {
            $("#exp_data_table").show();
            new_project(result);
            setTimeout(() => {
              $('#save_btn').click();
            }, 100);
          }
        }
      }
    );
  };
});

$("#new_stim_button").on("click", function () {
  if (!parent.parent.functionIsRunning) {
    parent.parent.functionIsRunning = true;
    var stim_template = default_project.all_stims["stimuli_1.csv"];
    bootbox.prompt(
      "What yould you like to name the new <b>Stimuli</b>?",
      function (new_sheet_name) {
        parent.parent.functionIsRunning = false;
        if (new_sheet_name) {
          var project = $("#project_list").val();
          var this_proj = master.projects.projects[project];
          var current_stims = Object.keys(this_proj.all_stims);
          if (current_stims.indexOf(new_sheet_name) !== -1) {
            bootbox.alert(
              "You already have a <b>Stimuli</b> sheet with that name"
            );
          } else {
            new_sheet_name = new_sheet_name.replace(/ /g, "_").replace(".csv", "") + ".csv";
            this_proj.all_stims[new_sheet_name] = stim_template;
            $("#stim_select").append($("<option>", {text: new_sheet_name,}));
            $("#stim_select").val(new_sheet_name);

            createExpEditorHoT(this_proj.all_stims[new_sheet_name],"stimuli",new_sheet_name);
            setTimeout(() => {
              $('#save_btn').click();
            }, 100);
          }
        }
      }
    );
  };
});

$("#open_proj_folder").on("click", function () {
  if (!parent.parent.functionIsRunning) {
    var location = "User\Project"
    parent.parent.functionIsRunning = true;
    CElectron.open_folder(
      "repo",
      "User\\Projects\\" + $("#project_list").val(),
    );
  };
  $("#open_proj_folder").blur(function(){
    parent.parent.functionIsRunning = false;
  });
});

var hasRunProjectPageIcons = false;
$("#project_list").on("change", function () {
  $('#hide_show_table_span button').removeClass("btn-outline-primary").addClass("btn-primary");
  $("#exp_data_table").show();
  project_json = master.projects.projects[this.value];
  clean_conditions();
  $("#project_inputs").show();
  if (!hasRunProjectPageIcons) {
    project_page_icons();
    hasRunProjectPageIcons = true;
  }
});

$("#proc_select").on("change", function () {
  var project = $("#project_list").val();
  var this_proj = master.projects.projects[project];
  createExpEditorHoT(this_proj.all_procs[this.value], "procedure", this.value);
});

$("#rename_proj_btn").on("click", function () {
  if (!parent.parent.functionIsRunning) {
    parent.parent.functionIsRunning = true;
    bootbox.prompt(
      "What would you like to rename this <b>Experiment</b> to?",
      function (new_name) {
        parent.parent.functionIsRunning = false;
        if (new_name) {
          if ($("#project_list").text().indexOf(new_name) !== -1) {
            bootbox.alert("You already have an experiment with this name");
          } else {
            //proceed
            var original_name = $("#project_list").val();
            master.projects.projects[new_name] = master.projects.projects[original_name];
            delete master.projects.projects[original_name];

            $("#project_list").append($("<option>", {text: new_name,}));
            $("#project_list").val(new_name);
            $("#project_list option[value='" + original_name + "']").remove();

            // if (Collector.detect_context() === "localhost") {
              CElectron.fs.delete_project(original_name, function (response) {
                if (response !== "success") {
                  console.log("Original project name files removed")
                }
              });
            
            setTimeout(() => {
              $('#save_btn').click();
            }, 250);
          }
            
        }
      }
    )
  }
});

$("#rename_proc_button").on("click", function () {
  if (!parent.parent.functionIsRunning) {
    parent.parent.functionIsRunning = true;
    bootbox.prompt(
      "What would you like to rename this <b>Procedure</b> to?",
      function (new_proc_name) {
        parent.parent.functionIsRunning = false;
        if (new_proc_name) {
          new_proc_name = new_proc_name.toLowerCase();
          var project = $("#project_list").val();
          var this_proj = master.projects.projects[project];
          var current_procs = Object.keys(this_proj.all_procs);
          var current_proc = $("#proc_select").val();
          current_procs.splice(current_procs.indexOf(current_proc), 1);
          var current_proc_sheet = this_proj.all_procs[current_proc];

          if (current_procs.indexOf(new_proc_name) !== -1) {
            bootbox.alert("You already have a procedure sheet with that name");
          } else {
            new_proc_name = new_proc_name.replace(/ /g, "_").replace(".csv", "") + ".csv";
            master.projects.projects[project].all_procs[new_proc_name] = current_proc_sheet;

            delete master.projects.projects[project].all_procs[current_proc];

            var file_path = "Projects" + "/" + project + "/" + current_proc;
            CElectron.fs.delete_file(file_path);

            $("#proc_select").append($("<option>", {text: new_proc_name,}));
            $("#proc_select").val(new_proc_name);
            $('#proc_select option[value="' + current_proc + '"]').remove();
            
            // Update handsontable
            var handsOnTableInstance = tables['handsOnTable_Conditions'];

            for (var row = 1; row < handsOnTableInstance.countRows(); row++) {
              for (var col = 0; col < handsOnTableInstance.countCols(); col++) {
                var cellValue = handsOnTableInstance.getDataAtCell(row, col);
                if (cellValue === current_proc) {
                  handsOnTableInstance.setDataAtCell(row, col, new_proc_name);
                }
              }
            }

            handsOnTableInstance.render();
            var index = 0;
            for (let i = 0; i < handsOnTableInstance.countCols(); i++) {
              const colHeader = handsOnTableInstance.getDataAtCell(0, index + i);
              if (colHeader.toLowerCase().indexOf("counterbalance") !== -1) {
                bootbox.dialog({
                  title: "Counterbalance Conflict",
                  message: "You may have counterbalancing setup on a Conditions row. Please check whether this rename will effect any existing CSV files you may be using.",
                  buttons: {
                    ok: {
                      label: "OK",
                      className: 'btn-primary',
                      callback: function () {
                        // This will close the modal
                      }
                    }
                  }
                });
              }
            }

            createExpEditorHoT(this_proj.all_procs[new_proc_name],"procedure",new_proc_name);
            setTimeout(() => {
              $('#save_btn').click();
            }, 250);
          }
        }
      }
    );
  }
});


$("#rename_stim_button").on("click", function () {
  if (!parent.parent.functionIsRunning) {
    parent.parent.functionIsRunning = true;
    bootbox.prompt(
      "What would you like to rename this <b>Stimuli</b> to?",
      function (new_sheet_name) {
        parent.parent.functionIsRunning = false;
        if (new_sheet_name) {
          new_sheet_name = new_sheet_name.toLowerCase();
          var project = $("#project_list").val();
          var this_proj = master.projects.projects[project];

          var current_stims = Object.keys(this_proj.all_stims);
          var current_stim = $("#stim_select").val();
          current_stims.splice(current_stims.indexOf(current_stim), 1);

          var current_stim_sheet = this_proj.all_stims[current_stim];

          if (current_stims.indexOf(new_sheet_name) !== -1) {
            bootbox.alert("You already have a <b>Stimuli</b> sheet with that name");
          } else {
            new_sheet_name = new_sheet_name.replace(/ /g, "_").replace(".csv", "") + ".csv";
            master.projects.projects[project].all_stims[new_sheet_name] = current_stim_sheet;

            delete master.projects.projects[project].all_stims[current_stim];

            var file_path = "Projects" + "/" + project + "/" + current_stim;
            CElectron.fs.delete_file(file_path);

            $("#stim_select").append($("<option>", {text: new_sheet_name,}));
            $("#stim_select").val(new_sheet_name);
            $('#stim_select option[value="' + current_stim + '"]').remove();

            // Update handsontable
            var handsOnTableInstance = tables['handsOnTable_Conditions'];
            console.log(handsOnTableInstance.countRows());

            for (var row = 1; row < handsOnTableInstance.countRows(); row++) {
              for (var col = 0; col < handsOnTableInstance.countCols(); col++) {
                var cellValue = handsOnTableInstance.getDataAtCell(row, col);
                if (cellValue === current_stim) {
                  handsOnTableInstance.setDataAtCell(row, col, new_sheet_name);
                }
              }
            }

            handsOnTableInstance.render();
            
            createExpEditorHoT(this_proj.all_stims[new_sheet_name],"stimuli",new_sheet_name);
            setTimeout(() => {
              $('#save_btn').click();
            }, 250);
          }
        }
      }
    );
  };
});

$("#run_btn").on("click", function () {
    if (!parent.parent.functionIsRunning) {
      parent.parent.functionIsRunning = true;
      var project = $("#project_list").val();
      var project_json = master.projects.projects[project];
      var select_html = '<select id="select_condition" class="form-select">';
      var conditions = Collector.PapaParsed(project_json.conditions);
      if (typeof conditions === "undefined") {
        conditions = conditions.filter(function (condition) {
          return condition.name !== "";
        });
      }
      conditions.forEach(function (condition) {
        select_html += "<option>" + condition.name + "</option>";
      });
      select_html += "</select>";

      if (
        typeof master.data.save_script === "undefined" ||
        //test here for whether there is a github repository linked
        master.data.save_script === ""
      ) {
        /* might reinstate this later if it becomes helpful
        bootbox.prompt("You currently have no link that saves your data. Please follow the instructions in the tutorial (to be completed), and then copy the link to confirm where to save your data below:",function(this_url){
          if(this_url){
            master.data.save_script = this_url;
            $("#save_btn").click();
          }
        });
        */
      }
      var org = user.current.org;
      var repo = user.current.repo;

      var github_url = "https://" + org + ".github.io/" + repo + "/App/Run.html?platform=github&location=" + $("#project_list").val() + "&name=" + conditions[0].name;

      bootbox.dialog({
        title: "Select a Condition",
        message:
          "Which condition would you like to run? <br><br>" +
          select_html +
          "To run the study copy the following into a browser:<br>(make sure you've pushed the latest changes and waited 5+ minutes) "+
          '<div class="input-group mb-3">'+"<input class='form-control' value='" + github_url + "' onfocus='this.select();' id='experiment_url_input'>"+
          '<div class="input-group-append"><button class="btn btn-primary" type="button" onclick="copyToClipboard_url_input()" style="border-top-left-radius: 0;border-bottom-left-radius: 0;" title="Copy to clipboard"><i class="bi-files"></i></button></div></div>' +
          "To <b>Preview</b> a project copy the following into a browser: "+
          '<div class="input-group mb-3">'+"<input type='text' class='form-control' value='" + github_url.replace("platform=github", "platform=onlinepreview") + "' onfocus='this.select();' id='experiment_url_input_preview'>" +
          '<div class="input-group-append"><button class="btn btn-primary" type="button" onclick="copyToClipboard_url_input_preview()" style="border-top-left-radius: 0;border-bottom-left-radius: 0;" title="Copy to clipboard"><i class="bi-files"></i></button></div></div>',
        buttons: {
          local: {
            label: "Run",
            className: "btn btn-success bi bi-play-btn",
            callback: function () {
              parent.parent.functionIsRunning = false;
              window.open("Run.html?platform=localhost&location=" + $("#project_list").val() + "&name=" + $("#select_condition").val(),
                "_blank"
              );
            },
          },
          local_preview: {
            label: "Preview Local",
            className: "btn-info",
            callback: function () {
              parent.parent.functionIsRunning = false;
              window.open("Run.html?platform=preview&location=" + $("#project_list").val() + "&name=" + $("#select_condition").val(),
                "_blank"
              );
            },
          },
          online_preview: {
            label: "Preview Online",
            className: "btn-info",
            callback: function () {
              parent.parent.functionIsRunning = false;
              window.open(
                "Run.html?platform=simulateonline&location=" + $("#project_list").val() + "&name=" + $("#select_condition").val(),
                "_blank"
              );
            },
          },
          cancel: {
            label: "Cancel",
            className: "btn-secondary",
            callback: function () {
              parent.parent.functionIsRunning = false;
              //nada;
            },
          },
        },
      });
      $("#select_condition").change(() => {
        var ConditionValue = $("#select_condition").val();
        // Update link text
        $("#experiment_url_input").val(
          `https://${org}.github.io/${repo}/App/Run.html?platform=github&location=${$("#project_list").val()}&name=${ConditionValue}`
        );
        $("#experiment_url_input_preview").val(
          `https://${org}.github.io/${repo}/App/Run.html?platform=onlinepreview&location=${$("#project_list").val()}&name=${ConditionValue}`
        );
      });
    }
});
  
$("#save_btn").attr("previousValue", "");

$("#save_btn").on("click", function () {
  
    function process_code(this_proj) {
      var phasetype_files = [];
      Object.keys(this_proj.all_procs).forEach(function (proc_name) {
        var this_proc = Collector.PapaParsed(this_proj.all_procs[proc_name]);
        var cleaned_parsed_proc = [];
        this_proc.forEach(function (row) {
          if (Object.values(row).join("") !== "") {
            cleaned_parsed_proc.push(row);
          }
        });
        this_proc = cleaned_parsed_proc.map(function (row, row_index) {
          var cleaned_row = Collector.clean_obj_keys(row);
          if (phasetype_files.indexOf(cleaned_row.phasetype) === -1) {
            phasetype_files.push(cleaned_row.phasetype.toLowerCase());
          }
          cleaned_row.phasetype = cleaned_row.phasetype.toLowerCase();
          if (cleaned_row.phasetype.indexOf(" ") !== -1) {
            bootbox.alert(
              "You have a space in row <b>" +
                (row_index + 2) +
                "</b> of your procedure <b>" +
                proc_name +
                "</b>. Please fix this before trying to run your project."
            );
          }
          if (cleaned_row.item === 0) {
            var this_code;
            if (
              typeof master.phasetypes.user[cleaned_row.phasetype] ===
                "undefined" &&
              typeof master.phasetypes.default[cleaned_row.phasetype] ===
                "undefined"
            ) {
              bootbox.alert(
                "The code file <b>" +
                  cleaned_row.phasetypes +
                  "</b> doesn't appear to exist"
              );
            } else {
              if (
                typeof master.phasetypes.default[cleaned_row.phasetype] !==
                "undefined"
              ) {
                this_code = master.phasetypes.default[cleaned_row.phasetype];
              } else if (
                typeof master.phasetypes.user[cleaned_row.phasetype] !==
                "undefined"
              ) {
                this_code = master.phasetypes.user[cleaned_row.phasetype];
              }

              these_variables = Collector.list_variables(this_code);
              these_variables.forEach(function (this_variable) {
                if (
                  Object.keys(cleaned_row).indexOf(this_variable) === -1 &&
                  this_variable !== "survey" &&
                  cleaned_row.phasetypes !== "survey"
                ) {
                  //i.e. this variable is not part of this procedure
                  Collector.custom_alert(
                    "Error: You have your item set to <b>0</b> in row <b>" +
                      (row_index + 2) +
                      "</b>. However, it seems like the trialtype <b>" +
                      cleaned_row.phasetypes +
                      "</b> will be looking for a variable <b>" +
                      this_variable +
                      "</b> in your" +
                      " stimuli sheet."
                  );
                }
              });
            }

            //need to take into account the code might be referring to a header in the procedure sheet
          }
          return cleaned_row;
        });
        this_proj.all_procs[proc_name] = Papa.unparse(this_proc);
      });
      phasetype_files = phasetype_files.filter(Boolean); //remove blanks
      if (typeof this_proj.phasetypes === "undefined") {
        this_proj.trialtypes = {};
      }

      /*
      * First loop is to make sure the experiment has all the phasetype_files
      */
      this_proj.phasetypes = {};
      phasetype_files.forEach(function (code_file) {
        if (typeof master.phasetypes.default[code_file] !== "undefined") {
          this_proj.phasetypes[code_file] =
            "[[[LOCATION]]]../Default/DefaultPhaseTypes/" +
            code_file.replace(".html", "") +
            ".html";
        } else {
          this_proj.phasetypes[code_file] =
            "[[[LOCATION]]]../User/PhaseTypes/" +
            code_file.replace(".html", "") +
            ".html";
        }
      });
      return this_proj;
    }
    function process_conditions(this_proj) {
      /*
      * detect if conditions needs to be unparsed
      */
      try {
        this_proj.conditions = Papa.unparse(this_proj.conditions);
      } catch (error) {
        //do nothing yet
      } finally {
        var parsed_conditions = Collector.PapaParsed(this_proj.conditions);
        parsed_conditions.map(function (row) {
          row.name = Collector.clean_string(row.name);
          return row;
        });
        this_proj.conditions = Papa.unparse(parsed_conditions);
        return this_proj;
      }
    }
    function process_procs(this_proj) {
      if (typeof this_proj.phasetypes === "undefined") {
        this_proj.phasetypes = {};
      }
      Object.keys(this_proj.all_procs).forEach(function (proc_name) {
        this_proc = Collector.PapaParsed(this_proj.all_procs[proc_name]);
        this_proc.forEach(function (proc_row) {
          proc_row = Collector.clean_obj_keys(proc_row);

          /* survey check */
          if (typeof proc_row.survey !== "undefined" && proc_row.survey !== "") {
            var this_survey = proc_row.survey.toLowerCase();
            if (typeof master.surveys.user_surveys[this_survey] !== "undefined") {
              if (typeof this_proj.surveys === "undefined") {
                this_proj.surveys = {};
              }
              this_proj.surveys[this_survey] = master.surveys.user_surveys[this_survey];
              keyed_survey = Papa.parse(
                Papa.unparse(master.surveys.user_surveys[this_survey]),
                {header: true,}
              ).data;
              keyed_survey.forEach(function (key_row) {
                clean_key_row = Collector.clean_obj_keys(key_row);
                if (typeof clean_key_row.type !== "undefined") {
                  var survey_mod_type = clean_key_row.type.toLowerCase();
                  if (typeof master.phasetypes.user[survey_mod_type] !== "undefined") {
                    this_proj.phasetypes[survey_mod_type] = master.phasetypes[survey_mod_type];
                  }
                }
              });
            } else if (typeof master.surveys.default_surveys[this_survey] !== "undefined") {
              if(typeof(this_proj.surveys) == "undefined"){
                this_proj.surveys = {};
              }
              this_proj.surveys[proc_row.survey] = master.surveys.default_surveys[this_survey];
            } else {
              if (!parent.parent.functionIsRunning) {
                parent.parent.functionIsRunning = true;
                bootbox.alert("The survey <b>" + proc_row.survey + "</b> in your procedure sheet doesn't appear to exist. Please check the spelling of it", function() { 
                  setTimeout(() => {
                    parent.parent.functionIsRunning = false;
                  }, 1500);
                  
                });
              }
            }
          }
        });
      });
      return this_proj;
    }
  // $("#save_phasetype_btn").click();
  // $("#save_survey_btn").click();
  // $("#save_snip_btn").click();
  // $("#save_pathway_btn").click();

  if (typeof master.keys === "undefined" || typeof master.keys.public_key === "undefined") {
    encrypt_obj.generate_keys();
  }

  var project = $("#project_list").val();
  /*
   * Only try to save an experiment if there is a valid experiment loaded
   */
  var write_response;
  if ((typeof project !== "undefined") & (project !== null)) {
    /*
     * add the org and repo to the project_json
     */

    var this_proj = master.projects.projects[project];

    this_proj.location =
      $("#select_org").val() + "/" + $("#select_repo").val() + "/" + project;

    /*
     * Cleaning the project_json of deprecated properties
     */
    delete this_proj.conditions_csv;
    delete this_proj.cond_array;
    delete this_proj.parsed_procs;
    delete this_proj.procedure;
    delete this_proj.procs_csv;
    delete this_proj.stimuli;
    delete this_proj.stims_csv;

    /*
     * converting procs and stims to csv rather than json formats
     */

    if (typeof this_proj !== "undefined") {
      this_proj.public_key = master.keys.public_key;
    }
    //parse procs for survey saving next
    if ($("#project_list").val() !== null) {
      Object.keys(this_proj.all_procs).forEach(function (proc) {
        try {
          this_proj.all_procs[proc] = Papa.unparse(this_proj.all_procs[proc]);
        } catch (error) {}
      });

      Object.keys(this_proj.all_stims).forEach(function (stim) {
        try {
          this_proj.all_stims[stim] = Papa.unparse(this_proj.all_stims[stim]);
        } catch (error) {}
      });

      //add surveys to experiment
      if (typeof this_proj.surveys !== "undefined") {
        this_proj.surveys = {};
      }

      this_proj = process_conditions(this_proj);
      this_proj = process_procs(this_proj);
      this_proj = process_code(this_proj);

      this_proj.procs_csv = {};
      this_proj.stims_csv = {};

      this_proj = JSON.stringify(this_proj, null, 2);
      CElectron.fs.write_project(
        project,
        this_proj,
        function (response) {
          if (response !== "success") {
            bootbox.alert(response);
          }
        }
      );

      write_response = CElectron.fs.write_file(
        "",
        "master.json",
        JSON.stringify(master, null, 2)
      );
      if (write_response !== "success") {
        bootbox.alert(response);
      } else {
        Collector.custom_alert("Succesfully saved " + project);
      }
    }
  } else {
    write_response = CElectron.fs.write_file(
      "",
      "master.json",
      JSON.stringify(master, null, 2)
    );
    if (write_response !== "success") {
      bootbox.alert(response);
    } else {
      Collector.custom_alert("Succesfully saved master");
    }
  }

  Collector.tests.pass("projects", "save_at_start");

  /*
  }  catch (error){
    Collector.tests.fail("projects",
                         "save_at_start",
                         error);
  }
  */
});

$("#stim_select").on("change", function () {
  var project = $("#project_list").val();
  var this_proj = master.projects.projects[project];
  createExpEditorHoT(this_proj.all_stims[this.value], "stimuli", this.value);
});

$("#code_project_select").on("change", function () {
  var this_proj = master.projects.projects[this.value];
  var procs = Object.keys(this_proj.all_procs);
  var stims = Object.keys(this_proj.all_stims);

  $("#code_procedure_select").show();
  $("#code_stimuli_select").show();
});

$("#upload_default_exp_btn").on("click", function () {
  if (!parent.parent.functionIsRunning) {
    parent.parent.functionIsRunning = true;
    var default_project_name = $("#default_projects_select").val();
    if (default_project_name !== "Select an experiment") {
      $.get(
        "Default/DefaultProjects/" + default_project_name + ".json",
        function (project_json) {
          parent.parent.functionIsRunning = false;
          upload_exp_contents(
            JSON.stringify(project_json),
            default_project_name
          );
          $("#upload_experiment_modal").hide();
        }
      );
    }
  }
});

$("#upload_experiment_button").on("click", function () {
  $("#upload_experiment_modal").show();
});

$("#upload_project_input").on("change", function () {
  if (this.files && this.files[0]) {
    var myFile = this.files[0];
    var reader = new FileReader();
    var this_filename = this.files[0].name;
    reader.addEventListener("load", function (e) {
      upload_exp_contents(e.target.result, this_filename);
    });
    reader.readAsBinaryString(myFile);
  }
});


// Functions to copy preview/run links to clipboard
function copyToClipboard_url_input() {
  var textBox = $("#experiment_url_input");
  textBox.select();
  
  try {
    var successful = document.execCommand('copy');
    var msg = successful ? 'successful' : 'unsuccessful';
    Collector.custom_alert('URL was ' + msg + ' copied');
  } catch (err) {
    Collector.custom_alert('Oops, unable to copy');
  }
};

function copyToClipboard_url_input_preview() {
  var textBox = $("#experiment_url_input_preview");
  textBox.select();
  
  try {
    var successful = document.execCommand('copy');
    var msg = successful ? 'successful' : 'unsuccessful';
    Collector.custom_alert('URL was ' + msg + ' copied');
  } catch (err) {
    Collector.custom_alert('Oops, unable to copy');
  }
};

// $("#conditions_btn").on("click", function () {
//   var conditionTable = tables['handsOnTable_conditions'];
//   bootbox.prompt("Enter the name for the new column:", function(columnName) {
//     if (columnName !== null) {
//       // Add a new column to the Handsontable instance
//       conditionTable.alter('insert_col', conditionTable.countCols());
  
//       // Insert the value into the first row of the new column
//       conditionTable.setDataAtCell(0, conditionTable.countCols() - 1, columnName);
//   }
//   });
// });