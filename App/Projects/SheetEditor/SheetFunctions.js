/*  Collector (Garcia, Kornell, Kerr, Blake & Haffey)
    A program for running experiments on the web
    Copyright 2012-2016 Mikey Garcia & Nate Kornell


    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License version 3 as published by
    the Free Software Foundation.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>

		Kitten/Cat release (2019-2022) author: Dr. Anthony Haffey 
*/
function check_phasetypes_in_proc(procedure, post_phasetype) {
  var experiment = $("#project_list").val();
  var this_proj = your_stuff.projects.projects[project];
  var this_proc = this_proj.all_procs[procedure];
  var phasetypes = [];
  var trial_type_col = this_proc[0]
    .map(function (element) {
      if (element !== null) {
        return element.toLowerCase();
      }
    })
    .indexOf(post_phasetype);
  for (var i in this_proc) {
    if (i > 0) {
      if (this_proc[i][trial_type_col] !== null) {
        phasetypes.push(this_proc[i][trial_type_col].toLowerCase());
      }
    }
  }
  phasetypes = phasetypes.filter((n) => n);
  console.dir(phasetypes);
  if (typeof your_stuff.projects.projects[project].phasetypes == "undefined") {
    your_stuff.projects.projects[project].phasetypes = {};
  }
  phasetypes.forEach(function (phasetype) {
    if (typeof your_stuff.phasetypes.user[phasetype] !== "undefined") {
      your_stuff.projects.projects[project].phasetypes[phasetype] =
        your_stuff.phasetypes.user[phasetype];
    } else if (typeof your_stuff.phasetypes.default[phasetype] !== "undefined") {
      your_stuff.projects.projects[project].phasetypes[phasetype] =
        your_stuff.phasetypes.default[phasetype];
    } else {
      Collector.custom_alert(
        "Invalid phasetype <b>" +
          phasetype +
          "</b> in at least one of your procedure sheets. The file will save, but the experiment won't run until you use a valid phasetype.",
        4000
      );
    }
  });
}
function clean_conditions() {
  project_json = your_stuff.projects.projects[$("#project_list").val()];

  var parsed_conditions = Collector.PapaParsed(project_json.conditions);
  parsed_conditions = parsed_conditions.filter((row) => row.procedure !== "");
  parsed_conditions = parsed_conditions.map(function (row) {
    row.name = row.name.replaceAll(" ", "_");
    /*
    if(row.name.indexOf(" ") !== -1){
      bootbox.alert("You have a space in your condition: " + row.name + ". Please change the name to not have any spaces");
    }
    */
    return row;
  });

  project_json.conditions = Papa.unparse(parsed_conditions);

  update_handsontables();
}
function createExpEditorHoT(sheet, selected_handsonTable, sheet_name) {
  var area;
  var table_name;
  if (selected_handsonTable.toLowerCase() === "conditions") {
    area = $("#conditionsArea");
    table_name = "handsOnTable_Conditions";
  } else if (selected_handsonTable.toLowerCase() === "stimuli") {
    area = $("#stimsArea");
    table_name = "handsOnTable_Stimuli";
  } else if (selected_handsonTable.toLowerCase() === "procedure") {
    area = $("#procsArea");
    table_name = "handsOnTable_Procedure";
  } else {
    bootstrap.alert(
      "There is a bug in your code - not clear which experiment sheet you want to edit/update/create etc."
    );
  }
  area.html(
    "<span class='sheet_name' style='display: none'>" + sheet_name + "</span>"
  );
  var container = $("<div>").appendTo(area)[0];
  window[table_name] = createHoT(container, Papa.parse(sheet).data, sheet_name);
}
function get_HoT_data(current_sheet) {
  console.dir(current_sheet);
  var data = JSON.parse(JSON.stringify(current_sheet.getData()));

  // remove last column and last row
  data.pop();

  for (var i = 0; i < data.length; ++i) {
    data[i].pop();

    for (var j = 0; j < data[i].length; ++j) {
      if (data[i][j] === null) {
        data[i][j] = "";
      }
    }
  }

  // check for unique headers
  var unique_headers = [];

  for (var i = 0; i < data[0].length; ++i) {
    while (unique_headers.indexOf(data[0][i]) > -1) {
      data[0][i] += "*";
    }

    unique_headers.push(data[0][i]);
  }

  return data;
}
function list_projects() {
  if(window.localStorage.local_online === "local"){
    var local_projects = CElectron.fs.list_projects();
    local_projects.forEach(function (project) {
      try {
        var project_json = JSON.parse(
          CElectron.fs.read_file("Projects", project + ".json")
        );
        your_stuff.projects.projects[project] = project_json;
      } catch (error) {
        if(project !== ".DS_Store"){
          bootbox.alert("You have a problem with project:" + project);
        }
      }
    });
  }
  

  name_list = Object.keys(your_stuff.projects.projects);

  function update_proj_list() {
    /*
     * reset the selects
     */
    $("#add_project_pathway_select option").remove();
    $("#project_list option").remove();
    $("#code_project_select option").remove();

    /*
     * add "Select a project" option
     */
    var default_option =
      "<option hidden disabled selected>Select a project</option>";

    $("#add_project_pathway_select").append(default_option);
    $("#project_list").append(default_option);
    $("#code_project_select").append(default_option);

    /*
     * add options to each of the selects
     */
    name_list.sort(function (a, b) {
      return a.toLowerCase().localeCompare(b.toLowerCase());
    });
    name_list.forEach(function (item_name) {
      var this_option = "<option>" + item_name + "</option>";
      $("#add_project_pathway_select").append(this_option);
      $("#project_list").append(this_option);
      $("#code_project_select").append(this_option);
    });
  }

  update_proj_list();
}
function new_project(project) {
  if ($("#project_list").text().indexOf(project) !== -1) {
    bootbox.alert("Name already exists. Please try again.");
  } else {
    your_stuff.projects.projects[project] = JSON.parse(
      JSON.stringify(default_project)
    );

    var this_path = "/Projects/" + project + ".json";

    function update_project_list(project) {
      $("#project_list").append(
        $("<option>", {
          text: project,
        })
      );
      $("#project_list").val(project);
      update_handsontables();
      $("#save_btn").click();
    }
    update_project_list(project);
  }
}
function remove_from_list(project) {
  var x = document.getElementById("project_list");
  x.remove(project);
  if (project !== "Select a project") {
    update_handsontables();
  }
}

function stim_proc_defaults(proc_values, stim_values) {
  var this_proj = your_stuff.projects.projects[$("#project_list").val()];

  // selecting Stimuli_1 and Procedure_1 as default
  if (proc_values.indexOf("Procedure_1") !== -1) {
    $("#proc_select").val("Procedure_1");
    this_proj.procedure = "Procedure_1";
  } else {
    this_proj.procedure = this_proj[proc_values[0]];
  }
  if (stim_values.indexOf("Stimuli_1") !== -1) {
    $("#stim_select").val("Stimuli_1");
    this_proj.stimuli = "Stimuli_1";
  } else {
    this_proj.stimuli = this_proj[stim_values[0]];
  }
}
function stim_proc_selection(stim_proc, sheet_selected) {
  var this_proj = your_stuff.projects.projects[$("#project_list").val()];
  createExpEditorHoT(
    this_proj.all_stims[sheet_selected],
    stim_proc,
    sheet_selected
  ); //sheet_name
}

function update_dropdown_lists() {
  var this_proj = your_stuff.projects.projects[$("#project_list").val()];
  var stim_values = [];
  var proc_values = [];

  //wipe the stimuli list
  $("#proc_select").find("option").remove();
  $("#stim_select").find("option").remove();

  //wipe the procedure list

  Object.keys(this_proj.all_procs).forEach(function (this_proc) {
    proc_values.push(this_proc);
    $("#proc_select").append(
      $("<option>", {
        value: this_proc,
        text: this_proc,
      })
    );
  });
  Object.keys(this_proj.all_stims).forEach(function (this_stim) {
    stim_values.push(this_stim);
    $("#stim_select").append(
      $("<option>", {
        value: this_stim,
        text: this_stim,
      })
    );
  });
  stim_proc_defaults(proc_values, stim_values);
}
function unique_phasetype(possible_name, phasetype_content){
  var all_your_phasetypes = {...your_stuff.phasetypes.default,...your_stuff.phasetypes.user};
  if(typeof(all_your_phasetypes[possible_name]) !== "undefined"){
    bootbox.prompt(
      "<b>" +
        possible_name +
        "</b> is taken. Please suggest another name, or press cancel if you don't want to save this phasetype?",
      function (new_name) {
        if (new_name) {
          unique_phasetype(new_name, phasetype_content);
        }
      }
    );
  } else {
    your_stuff.phasetypes.user[possible_name] = phasetype_content;
  }
}
function update_handsontables() {
  var this_proj = your_stuff.projects.projects[$("#project_list").val()];

  update_dropdown_lists();
  stim_file = Object.keys(this_proj.all_stims)[0];
  proc_file = Object.keys(this_proj.all_procs)[0];

  function load_spreadsheet(
    sheet_type,
    sheet_name,
    projects_location,
    sheet_content
  ) {
    if (typeof sheet_content !== "string") {
      sheet_content = Papa.unparse(sheet_content);
    }
    if (sheet_content.split(",").length > 1) {
      createExpEditorHoT(sheet_content, sheet_type, sheet_name);
    } else {
      var sheet_json =
        your_stuff.projects.projects[$("#project_list").val()][projects_location];
      createExpEditorHoT(sheet_json, sheet_type, sheet_name);
    }
  }

  var conditions_sheet = CElectron.fs.read_file(
    "Projects/" + $("#project_list").val(),
    "conditions.csv"
  );

  if (conditions_sheet == "") {
    var this_cond_sheet =
      your_stuff.projects.projects[$("#project_list").val()].conditions;
    if (typeof this_cond_sheet == "object")
      conditions_sheet = Papa.unparse(this_cond_sheet);
  }
  load_spreadsheet(
    "Conditions",
    "conditions.csv",
    "conditions",
    conditions_sheet
  );

  var stim_sheet = CElectron.fs.read_file(
    "Projects/" + $("#project_list").val(),
    stim_file
  );
  if (stim_sheet == "") {
    stim_sheet =
      your_stuff.projects.projects[$("#project_list").val()].all_stims[stim_file];
  }
  load_spreadsheet("Stimuli", stim_file, "all_stims[sheet_name]", stim_sheet);

  var proc_sheet = CElectron.fs.read_file(
    "Projects/" + $("#project_list").val(),
    proc_file
  );
  if (proc_sheet == "") {
    proc_sheet =
      your_stuff.projects.projects[$("#project_list").val()].all_procs[proc_file];
  }
  load_spreadsheet("Procedure", proc_file, "all_procs[sheet_name]", proc_sheet);
  $("#project_inputs").show();
}

function upload_exp_contents(these_contents, this_filename) {
  parsed_contents = JSON.parse(these_contents);
  cleaned_filename = this_filename.toLowerCase().replace(".json", "");

  // note that this is a local function. right?
  function upload_to_your_stuff(proj_name, this_content) {
    your_stuff.projects.projects[proj_name] = this_content;
    list_projects();
    upload_phasetypes(this_content);
    upload_surveys(this_content);
    list_surveys();
  }
  function upload_surveys(this_content) {
    function unique_survey(suggested_name, survey_content) {
      all_surveys = Object.keys(your_stuff.surveys.user_surveys).concat(
        Object.keys(your_stuff.surveys.default_surveys)
      );
      if (all_surveys.indexOf(suggested_name) !== -1) {
        bootbox.prompt(
          "<b>" +
            suggested_name +
            "</b> is taken. Please suggest another name, or press cancel if you don't want to save this survey?",
          function (new_name) {
            if (new_name) {
              unique_survey(new_name, survey_content);
            }
          }
        );
      } else {
        your_stuff.surveys.user_surveys[suggested_name] = survey_content;
      }
    }

    Object.keys(this_content.surveys).forEach(function (this_survey) {
      unique_survey(this_survey, this_content.surveys[this_survey]);
    });
  }
  function upload_phasetypes(this_proj) {
    console.log("this_proj");
    console.log(this_proj);
    var project_phasetypes = Object.keys(this_proj.phasetypes);
    /*
    var all_phasetypes = Object.keys(your_stuff.phasetypes.user).concat(
      Object.keys(your_stuff.phasetypes.default)
    );
    */
    all_your_phasetypes = {...your_stuff.phasetypes.default,...your_stuff.phasetypes.user};

    var same_phasetypes = Object.keys(all_your_phasetypes).filter(value => project_phasetypes.includes(value));

    project_phasetypes.map(function(item){
      if(Object.keys(all_your_phasetypes).indexOf(item) === -1){
        your_stuff.phasetypes.user[item] = project_phasetypes[item];
        $("#phasetype_select").append(
          $("<option>").html(item)
        );
      }      
    });
    // check if they are actually identical
    same_phasetypes.forEach(function(this_phasetype){
      unique_phasetype(this_phasetype, this_proj.phasetypes[this_phasetype]);      
    });

  }

  bootbox.prompt({
    title: "Save experiment?",
    message:
      "Please confirm that you would like to upload this experiment and if so, what you would like to call it?",
    value: cleaned_filename,

    callback: function (proj_name) {
      if (proj_name) {
        function unique_experiment(suggested_name, content) {
          all_experiments = Object.keys(your_stuff.projects.projects);
          if (all_experiments.indexOf(suggested_name) !== -1) {
            bootbox.prompt(
              "<b>" +
                suggested_name +
                "</b> is taken. Please suggest another name, or press cancel if you don't want to save this experiment?",
              function (new_name) {
                if (new_name) {
                  unique_experiment(new_name, content);
                } else {
                  upload_to_your_stuff(proj_name, parsed_contents);
                  $("#save_btn").click();
                }
              }
            );
          } else {
            your_stuff.projects.projects[suggested_name] = content;
            list_projects();
            $("#upload_experiment_modal").hide();
            upload_to_your_stuff(proj_name, parsed_contents);
            $("#save_btn").click();
          }
        }
        unique_experiment(proj_name, parsed_contents);
      } else {
        upload_to_your_stuff(proj_name, parsed_contents);
        $("#save_btn").click();
      }
    },
  });
}
loading_scripts("SheetFunctions.js");
