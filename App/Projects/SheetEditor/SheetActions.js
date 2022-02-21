/*  Collector (Garcia, Kornell, Kerr, Blake & Haffey)
    A program for running experiments on the web
    Copyright 2012-2020 Mikey Garcia & Nate Kornell


    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License version 3 as published by
    the Free Software Foundation.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>

    Kitten/Cat release (2019-2021) author: Dr. Anthony Haffey (team@someopen.solutions)
*/
$("#default_projects_select").on("change", function () {
  if ($("#default_projects_select").val() !== "Select an experiment") {
    $("#upload_default_exp_btn").attr("disabled", false);
  }
});

$("#delete_proj_btn").on("click", function () {
  var proj_name = $("#project_list").val();
  if (proj_name === null) {
    bootbox.alert("You need to select a study to delete it");
  } else {
    bootbox.confirm(
      "Are you sure you want to delete your project?",
      function (result) {
        if (result) {
          //delete from master
          delete master.projects.projects[proj_name];

          $("#project_list option:contains(" + proj_name + ")")[0].remove();
          $("#project_list").val(
            document.getElementById("project_list").options[1].value
          );
          Collector.custom_alert(proj_name + " succesfully deleted");
          update_handsontables();

          //delete the local file if this is
          if (Collector.detect_context() === "localhost") {
            Collector.electron.fs.delete_project(
              proj_name,
              function (response) {
                if (response !== "success") {
                  bootbox.alert(response);
                }
              }
            );
          }
        }
      }
    );
  }
});

$("#delete_proc_button").on("click", function () {
  if ($("#proc_select option").length < 2) {
    bootbox.alert(
      "This would mean you have no procedure sheets. Please just edit the current sheet rather than deleting it."
    );
  } else {
    bootbox.confirm(
      "Are you sure you want to delete this procedure sheet?",
      function (result) {
        if (!result) {
          // do nothing
        } else {
          /*
           * delete from master
           */
          var project = $("#project_list").val();
          var proc_file = $("#proc_select").val();
          delete master.projects.projects[project].all_procs[proc_file];
          delete master.projects.projects[project].parsed_procs[proc_file];

          delete master.projects.projects[project].procs_csv[proc_file];

          // update the lists
          update_handsontables();

          /*
           * Delete the file locally if in electron
           */
          var file_path = "Projects" + "/" + experiment + "/" + proc_file;
          if (Collector.detect_context() === "localhost") {
            var this_response = Collector.electron.fs.delete_file(file_path);
            if (this_response !== "success") {
              bootbox.alert(this_response);
            } else {
              Collector.custom_alert(this_response);
            }
          }
        }
      }
    );
  }
});

$("#delete_stim_button").on("click", function () {
  if ($("#stim_select option").length < 2) {
    bootbox.alert(
      "This would mean you have no stimuli sheets. Please just edit the current sheet rather than deleting it."
    );
  } else {
    bootbox.confirm(
      "Are you sure you want to delete this stimuli sheet?",
      function (result) {
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
            var this_response = Collector.electron.fs.delete_file(file_path);
            if (this_response !== "success") {
              bootbox.alert(this_response);
            } else {
              Collector.custom_alert(this_response);
            }
          }
        }
      }
    );
  }
});

$("#download_project_button").on("click", function () {
  var project = $("#project_list").val();
  var project_json = master.projects.projects[project];
  var default_filename = project + ".json";
  bootbox.prompt({
    title: "What do you want to save this file as?",
    value: default_filename, //"data.csv",
    callback: function (result) {
      if (result) {
        Collector.download_file(
          result,
          JSON.stringify(project_json, null, 2),
          "json"
        );
      }
    },
  });
});

$("#new_proc_button").on("click", function () {
  var proc_template = default_project.all_procs["procedure_1.csv"];
  bootbox.prompt(
    "What would you like the name of the new <b>procedure</b> sheet to be?",
    function (new_proc_name) {
      if (new_proc_name) {
        var project = $("#project_list").val();
        var this_proj = master.projects.projects[project];
        var current_procs = Object.keys(this_proj.all_procs);
        if (current_procs.indexOf(new_proc_name) !== -1) {
          bootbox.alert("You already have a procedure sheet with that name");
        } else {
          new_proc_name = new_proc_name.replace(".csv", "") + ".csv";
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
        }
      }
    }
  );
});

$("#new_project_button").on("click", function () {
  bootbox.prompt(
    "What would you like to name the new project?",
    function (result) {
      if (result !== null) {
        result = result.toLowerCase();
        result = Collector.clean_string(result);
        if ($("#project_list").text().indexOf(result) !== -1) {
          bootbox.alert("You already have an experiment with this name");
        } else {
          $("#exp_data_table").show();
          new_project(result);
          $("#save_btn").click();
        }
      }
    }
  );
});

$("#new_stim_button").on("click", function () {
  var stim_template = default_project.all_stims["stimuli_1.csv"];
  bootbox.prompt(
    "What would you like the name of the new <b>Stimuli</b> sheet to be?",
    function (new_sheet_name) {
      if (new_sheet_name) {
        var project = $("#project_list").val();
        var this_proj = master.projects.projects[project];
        var current_stims = Object.keys(this_proj.all_stims);
        if (current_stims.indexOf(new_sheet_name) !== -1) {
          bootbox.alert(
            "You already have a <b>Stimuli</b> sheet with that name"
          );
        } else {
          new_sheet_name = new_sheet_name.replace(".csv", "") + ".csv";
          this_proj.all_stims[new_sheet_name] = stim_template;
          $("#stim_select").append(
            $("<option>", {
              text: new_sheet_name,
            })
          );
          $("#stim_select").val(new_sheet_name);

          createExpEditorHoT(
            this_proj.all_stims[new_sheet_name],
            "stimuli",
            new_sheet_name
          );
        }
      }
    }
  );
});

$("#open_proj_folder").on("click", function () {
  Collector.electron.open_folder(
    "repo",
    "User/Projects/" + $("#project_list").val()
  );
});

$("#project_list").on("change", function () {
  $("#exp_data_table").show();
  project_json = master.projects.projects[this.value];
  clean_conditions();
  $("#project_inputs").show();
  update_handsontables();
  update_server_table();
  $("#save_btn").click();
});

$("#proc_select").on("change", function () {
  var project = $("#project_list").val();
  var this_proj = master.projects.projects[project];
  createExpEditorHoT(this_proj.all_procs[this.value], "procedure", this.value);
});

$("#rename_proj_btn").on("click", function () {
  bootbox.prompt(
    "What would you like to rename this experiment to?",
    function (new_name) {
      if (new_name) {
        if ($("#project_list").text().indexOf(new_name) !== -1) {
          bootbox.alert("You already have an experiment with this name");
        } else {
          //proceed
          var original_name = $("#project_list").val();
          master.projects.projects[new_name] =
            master.projects.projects[original_name];
          delete master.projects.projects[original_name];

          Collector.electron.fs.write_project(
            new_name,
            JSON.stringify(master.projects.projects[new_name], null, 2),
            function (response) {
              if (response === "success") {
                Collector.electron.fs.delete_project(
                  original_name,
                  function (response) {
                    if (response === "success") {
                      list_projects();
                      $("#project_list").val(new_name);
                      $("#project_list").change();
                    } else {
                      bootbox.alert(response);
                    }
                  }
                );
              } else {
                bootbox.alert(response);
              }
            }
          );
        }
      }
    }
  );
});

$("#rename_proc_button").on("click", function () {
  bootbox.prompt(
    "What do you want to rename this <b>Procedure</b> sheet to?",
    function (new_proc_name) {
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
          new_proc_name = new_proc_name.replace(".csv", "") + ".csv";
          master.projects.projects[project].all_procs[new_proc_name] =
            current_proc_sheet;

          delete master.projects.projects[project].all_procs[current_proc];
          $("#proc_select").append(
            $("<option>", {
              text: new_proc_name,
            })
          );
          $("#proc_select").val(new_proc_name);
          $('#proc_select option[value="' + current_proc + '"]').remove();
          createExpEditorHoT(
            this_proj.all_procs[new_proc_name],
            "procedure",
            new_proc_name
          );
        }
      }
    }
  );
});

$("#rename_stim_button").on("click", function () {
  bootbox.prompt(
    "What do you want to rename this <b>Stimuli</b> sheet to?",
    function (new_sheet_name) {
      if (new_sheet_name) {
        new_sheet_name = new_sheet_name.toLowerCase();
        var project = $("#project_list").val();
        var this_proj = master.projects.projects[project];

        var current_stims = Object.keys(this_proj.all_stims);
        var current_stim = $("#stim_select").val();
        current_stims.splice(current_stims.indexOf(current_stim), 1);

        var current_stim_sheet = this_proj.all_stims[current_stim];

        if (current_stims.indexOf(new_sheet_name) !== -1) {
          bootbox.alert(
            "You already have a <b>Stimuli</b> sheet with that name"
          );
        } else {
          new_sheet_name = new_sheet_name.replace(".csv", "") + ".csv";

          master.projects.projects[project].all_stims[new_sheet_name] =
            current_stim_sheet;

          delete master.projects.projects[project].all_stims[current_stim];

          $("#stim_select").append(
            $("<option>", {
              text: new_sheet_name,
            })
          );
          $("#stim_select").val(new_sheet_name);

          $('#stim_select option[value="' + current_stim + '"]').remove();

          createExpEditorHoT(
            this_proj.all_stims[new_sheet_name],
            "stimuli",
            new_sheet_name
          );
        }
      }
    }
  );
});

$("#run_btn").on("click", function () {
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

  var github_url =
    "https://" +
    org +
    ".github.io" +
    "/" +
    repo +
    "/" +
    "App" +
    "/" +
    "Run.html?platform=github&" +
    "location=" +
    $("#project_list").val() +
    "&" +
    "name=" +
    conditions[0].name;

  bootbox.dialog({
    title: "Select a Condition",
    message:
      "Which condition would you like to run? <br><br>" +
      select_html +
      "To run the study copy the following into a browser:<br>(make sure you've pushed the latest changes and waited 5+ minutes) <input class='form-control' value='" +
      github_url +
      "' onfocus='this.select();' id='experiment_url_input'>" +
      "To <b>Preview</b> a project copy the following into a browser: <input class='form-control' value='" +
      github_url.replace("platform=github", "platform=onlinepreview") +
      "' onfocus='this.select();' id='experiment_url_input'>",
    buttons: {
      local: {
        label: "Run",
        className: "btn-primary",
        callback: function () {
          window.open(
            "Run.html?platform=localhost&" +
              "location=" +
              $("#project_list").val() +
              "&" +
              "name=" +
              $("#select_condition").val(),
            "_blank"
          );
        },
      },
      local_preview: {
        label: "Preview Local",
        className: "btn-info",
        callback: function () {
          window.open(
            "Run.html?platform=preview&" +
              "location=" +
              $("#project_list").val() +
              "&" +
              "name=" +
              $("#select_condition").val(),
            "_blank"
          );
        },
      },
      online_preview: {
        label: "Preview Online",
        className: "btn-info",
        callback: function () {
          window.open(
            "Run.html?platform=simulateonline&" +
              "location=" +
              $("#project_list").val() +
              "&" +
              "name=" +
              $("#select_condition").val(),
            "_blank"
          );
        },
      },
      cancel: {
        label: "Cancel",
        className: "btn-secondary",
        callback: function () {
          //nada;
        },
      },
    },
  });
  $("#select_condition").on("change", function () {
    $("#experiment_url_input").val(
      "https://" +
        org +
        ".github.io" +
        "/" +
        repo +
        "/" +
        "App" +
        "/" +
        "Run.html?platform=github&" +
        "location=" +
        $("#project_list").val() +
        "&" +
        "name=" +
        $("#select_condition").val()
    );
  });
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
        console.log("cleaned_row");
        console.log(cleaned_row);
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
              typeof master.phasetypes.user[cleaned_row.phasetype] !==
              "undefined"
            ) {
              this_code = master.phasetypes.user[cleaned_row.phasetype];
            } else if (
              typeof master.phasetypes.default[cleaned_row.phasetype] !==
              "undefined"
            ) {
              this_code = master.phasetypes.default[cleaned_row.phasetype];
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
      if (typeof master.phasetypes.user[code_file] === "undefined") {
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
            this_proj.surveys[this_survey] =
              master.surveys.user_surveys[this_survey];

            keyed_survey = Papa.parse(
              Papa.unparse(master.surveys.user_surveys[this_survey]),
              {
                header: true,
              }
            ).data;
            keyed_survey.forEach(function (key_row) {
              clean_key_row = Collector.clean_obj_keys(key_row);
              if (typeof clean_key_row.type !== "undefined") {
                var survey_mod_type = clean_key_row.type.toLowerCase();
                if (
                  typeof master.phasetypes.user[survey_mod_type] !== "undefined"
                ) {
                  this_proj.phasetypes[survey_mod_type] =
                    master.phasetypes[survey_mod_type];
                }
              }
            });
          } else if (
            typeof master.surveys.default_surveys[this_survey] !== "undefined"
          ) {
            this_proj.surveys[proc_row.survey] =
              master.surveys.default_surveys[this_survey];
          } else {
            bootbox.alert(
              "The survey <b>" +
                proc_row.survey +
                "</b> in your procedure sheet doesn't appear to exist. Please check the spelling of it"
            );
          }
        }
      });
    });
    return this_proj;
  }

  $("#save_phasetype_btn").click();
  $("#save_survey_btn").click();
  $("#save_snip_btn").click();
  $("#save_pathway_btn").click();

  if (
    typeof master.keys === "undefined" ||
    typeof master.keys.public_key === "undefined"
  ) {
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
      if (typeof this_proj.surveys === "undefined") {
        this_proj.surveys = {};
      }

      this_proj = process_conditions(this_proj);
      this_proj = process_procs(this_proj);
      this_proj = process_code(this_proj);

      this_proj.procs_csv = {};
      this_proj.stims_csv = {};

      this_proj = JSON.stringify(this_proj, null, 2);
      Collector.electron.fs.write_project(
        project,
        this_proj,
        function (response) {
          if (response !== "success") {
            bootbox.alert(response);
          }
        }
      );

      write_response = Collector.electron.fs.write_file(
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
    write_response = Collector.electron.fs.write_file(
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
  var default_project_name = $("#default_projects_select").val();
  if (default_project_name !== "Select an experiment") {
    $.get(
      "Default/DefaultProjects/" + default_project_name + ".json",
      function (experiment_json) {
        upload_exp_contents(
          JSON.stringify(experiment_json),
          default_project_name
        );
        $("#upload_experiment_modal").hide();
      }
    );
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
