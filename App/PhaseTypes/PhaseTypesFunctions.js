/*
 * PhaseTypesSFunctions.js
 * PhaseTypes functions (i.e. element subroutines)
 */
$.ajaxSetup({ cache: false }); // prevents caching, which disrupts $.get calls

code_obj = {
  delete_phasetypes: function () {
    if (!parent.parent.functionIsRunning) {
      parent.parent.functionIsRunning = true;
      var deleted_phasetype = $("#phasetype_select").val();
      console.log(deleted_phasetype);
      master.phasetypes.file = $("#phasetype_select").val();
      var this_file = master.phasetypes.file;
      bootbox.confirm({
        message: "Are you sure you want to delete the <b>" + this_file + "</b> PhaseType?",
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
                parent.parent.functionIsRunning = false;
                if (result) {
                  if (typeof master.phasetypes.graphic.files[this_file] !== "undefined") {
                    delete master.phasetypes.graphic.files[this_file];
                  }
                  delete master.phasetypes.user[this_file];
                  $("#phasetype_select").attr("previousvalue", "");
                  $("#phasetype_select option:selected").remove();
                  $("#graphic_editor").hide();
                  master.phasetypes.file = $("#phasetype_select").val();
                  code_obj.load_file("default");
                  var response = CElectron.fs.delete_file("PhaseTypes/" + deleted_phasetype + ".html");
                    if (response !== "success") {
                      Collector.custom_alert("Failed to delete the phase type: " + this_file);
                    } else {
                      Collector.custom_alert("The phase type: " + this_file + " has been deleted");
                    }
                  // This is just delayed to allow the custom alert to clear first
                  setTimeout(function() { 
                    $("#save_btn").click();
                    console.log("It saved the delete!");
                  }, 2100);
                }
              }
            });
          }
        }
      });
    }
  },
  load_file: function (user_default) {
    $("#ACE_editor").show();
    $("#new_code_button").show();
    $("#rename_phasetypes_button").show();
    if (user_default === "default") {
      $("#delete_phasetypes_button").hide();
      $("#phasetype_select")
        .removeClass("user_code")
        .addClass("default_code");
    } else {
      $("#delete_phasetypes_button").show();
    }

    var this_file = master.phasetypes.file;

    //python load if localhost
    switch (Collector.detect_context()) {
      case "localhost":
        cleaned_code = this_file.toLowerCase().replace(".html", "") + ".html";
        this_content = CElectron.fs.read_file(
          "PhaseTypes",
          cleaned_code
        );
        if (this_content === "") {
          editor.setValue(master.phasetypes[user_default][this_file]);
        } else {
          editor.setValue(this_content);
        }
        break;
      default:
        var content = master.phasetypes[user_default][this_file];
        editor.setValue(content);
        break;
    }
  },
  save: function (content, name, new_old, graphic_code) {
    if (new_old === "new") {
      graphic_editor_obj.clean_canvas();
      editor.setValue("");
    }
    if (
      $("#phasetype_select option").filter(function () {
        return $(this).val() === name;
      }).length === 0
    ) {
      $("#phasetype_select").append(
        $("<option>", {
          value: name,
          text: name,
          class: "user_code",
        })
      );
      $("#phasetype_select").val(name);
      $("#phasetype_select")[0].className = $("#phasetype_select")[0].className.replace(
        "default_",
        "user_"
      );

      if (graphic_code === "code") {
        $("#ACE_editor").show();
      } else if (graphic_code === "graphic") {
        $("#graphic_editor").show();
      }
      $("#trial_type_file_select").show();
      Collector.custom_alert("success - " + name + " created");
    } else {
      Collector.custom_alert("success - " + name + " updated");
    }
    if (typeof CElectron !== "undefined") {
      var write_response = CElectron.fs.write_file(
        "PhaseTypes",
        name.toLowerCase().replace(".html", "") + ".html",
        content
      );
      if (write_response !== "success") {
        bootbox.alert(write_response);
      }
    }
  },
};

function list_phasetypes(to_do_after) {
  //try{
  if (typeof CElectron !== "undefined") {
    var files = CElectron.fs.list_phasetypes();
    files = JSON.parse(files);
    files = files.map((item) => item.replaceAll(".html", ""));
    files.forEach(function (file) {
      if (Object.keys(master.phasetypes.user).indexOf(file) === -1) {
        master.phasetypes.user[file] = CElectron.fs.read_file(
          "PhaseTypes",
          file + ".html"
        );
      }
    });
  }

  function process_returned(returned_data) {
    $("#phasetype_select").empty();
    $("#phasetype_select").append("<option disabled>Select a file</option>");
    $("#phasetype_select").val("Select a file");

    var default_code = JSON.parse(returned_data);
    var user = master.phasetypes.user;

    master.phasetypes.default = default_code;
    default_keys = Object.keys(default_code).sort((a, b) =>
      a.localeCompare(b, undefined, { sensitivity: "base" })
    );

    user_keys = Object.keys(user).sort((a, b) =>
      a.localeCompare(b, undefined, { sensitivity: "base" })
    );

    default_keys.forEach(function (element) {
      $("#phasetype_select").append(
        "<option class='default_code'>" + element + "</option>"
      );
    });
    master.phasetypes.user = user;

    user_keys.forEach(function (element) {
      $("#phasetype_select").append(
        "<option class='user_code'>" + element + "</option>"
      );
    });

    if (typeof to_do_after !== "undefined") {
      to_do_after();
    }
    setTimeout(function(){
      $('#phasetype_select :nth-child(6)').after("<option disabled>--- User Surveys ---</option>");
    },500);
  }

  function get_default(list) {
    if (list.length > 0) {
      var item = list.pop();

      switch (Collector.detect_context()) {
        case "localhost":
          var trial_content = CElectron.fs.read_default(
            "DefaultPhaseTypes",
            item
          );
          master.phasetypes.default[item.toLowerCase().replace(".html", "")] =
            trial_content;
          get_default(list);
          break;
        default:
          $.get(collector_map[item], function (trial_content) {
            master.phasetypes.default[item.toLowerCase().replace(".html", "")] =
              trial_content;
            get_default(list);
          });
          break;
      }
    } else {
      process_returned(JSON.stringify(master.phasetypes.default));
    }
  }
  var default_list = Object.keys(
    isolation_map[".."]["Default"]["DefaultPhaseTypes"]
  );

  get_default(default_list);

  Collector.tests.pass("code", "list");
  /*
  } catch(error){
    Collector.tests.fail("trialtypes",
                         "list",
                         error);
  };
  */
}
