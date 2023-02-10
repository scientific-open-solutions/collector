// App/PhaseTypes/PhasetypesActions.js
functionIsRunning = false;

function initiate_actions() {
  function protected_name_check(this_name) {
    protected_names = ["start_experiment"];
    if (protected_names.indexOf(this_name) === -1) {
      return true;
    } else {
      bootbox.alert(
        "Please do not use <b>" + this_name + "</b>, it is protected"
      );
    }
  }
  function valid_new_name(this_name) {
    if (this_name) {
      this_name = this_name.toLowerCase();

      /*
       * check it's in the list of quality checks
       */
      var quality_checks = [
        "quality_age_check",
        "quality_calibration_zoom",
        "quality_details_warning",
        "quality_participant_commitment",
        "end_checks_experiment",
      ];

      if (quality_checks.indexOf(this_name) !== -1) {
        bootbox.alert(
          "<b>" +
            this_name +
            "</b>" +
            " is protected, please choose another name"
        );
        return false;
      } else {
        return this_name;
      }
    } else {
      return false;
    }

    var current_code = Object.keys(master.phasetypes.user).concat(
      Object.keys(master.phasetypes.default)
    );
    current_code = Array.from(new Set(current_code));
    if (current_code.indexOf(this_name.toLowerCase()) === -1) {
      return true;
    } else {
      bootbox.alert(
        "There is a code file with the name <b>" +
          this_name +
          "</b> - please choose a unique name"
      );
      return false;
    }
  }
  $("#ACE_editor").on("keyup input", function () {
    var ace_content = editor.getValue();
    var code_file = master.phasetypes.file;
    if (typeof master.phasetypes.user[code_file] === "undefined") {
      master.phasetypes.user[code_file] = {
        files: {},
      };
    }
    master.phasetypes.user[code_file].updated = true;
    master.phasetypes.user[code_file] = ace_content;
  });

  $("#delete_phasetypes_button").on("click", function () {
    code_obj.delete_phasetypes();
    setTimeout(function() { 
      $("#save_btn").click();
      console.log("It saved the delete!");
    }, 2100);
  });

 
  // output html framework to a variable
  var htmlFramework = $.ajax({
    url: "./PhaseTypes/html.txt",
    async: false
  }).responseText;

  $("#new_code_button").on("click", function () {
    if (!functionIsRunning) {
      functionIsRunning = true;
      var dialog = bootbox
      .dialog({
        show: false,
        title: "What would you like to name this new code file?",
        message:
          "<p><input class='form-control' id='new_code_name' autofocus='autofocus'></p>",
        buttons: {
          cancel: {
            label: "Cancel",
            className: "btn-secondary",
            callback: function () {
              //none
            },
          },
          code: {
            label: "Using Code",
            className: "btn-primary",
            callback: function () {
              functionIsRunning = false;
              var new_name = $("#new_code_name").val().toLowerCase();
              if (protected_name_check(new_name)) {
                if (valid_new_name(new_name)) {
                  var content = "";
                  master.phasetypes.user[new_name] = content;
                  master.phasetypes.file = new_name;
                  code_obj.save(content, new_name, "new", "code");
                  editor.textInput.getElement().onkeydown = "";
                  $("#rename_code_button").show();
                  $("#delete_phasetypes_button").show();
                  editor.session.setValue(htmlFramework);
                  $("#ace_theme_btn_dark").show();
                }
              }
            },
          },
          graphic: {
            label: "Using Graphics",
            className: "btn-primary",
            callback: function () {
              functionIsRunning = false;
              var new_name = $("#new_code_name").val().toLowerCase();
              if (protected_name_check(new_name)) {
                if (valid_new_name(new_name)) {
                  content = "";
                  master.phasetypes.user[new_name] = content;
                  master.phasetypes.file = new_name;
                  code_obj.save(content, new_name, "new", "graphic");
                  $("#graphic_editor").show();
                  editor.setOption("readOnly", true);
                  editor.textInput.getElement().onkeydown =
                    graphic_editor_obj.graphic_warning;
                  master.phasetypes.graphic.files[new_name] = {
                    elements: {},
                  };
                  master.phasetypes.graphic.files[new_name].width = "600";
                  master.phasetypes.graphic.files[new_name].height = "600";
                  master.phasetypes.graphic.files[new_name][
                    "background-color"
                  ] = "white";
                  master.phasetypes.graphic.files[
                    new_name
                  ].mouse_visible = true;
                  master.phasetypes.graphic.files[new_name].keyboard = {
                    valid_keys: "",
                    end_press: true,
                  };
                  master.phasetypes.file = new_name;
                  graphic_editor_obj.update_main_settings();
                  graphic_editor_obj.clean_canvas();

                  //graphic editor button should be on:
                  $("#view_graphic_btn").removeClass("btn-outline-primary");
                  $("#view_graphic_btn").addClass("btn-primary");
                  $("#graphic_editor").show();

                  //code editor should be on
                  $("#view_code_btn").removeClass("btn-outline-primary");
                  $("#view_code_btn").addClass("btn-primary");
                  $("#ACE_editor").show();
                  $("#delete_phasetypes_button").show();
                }
              }
            },
          },
        },
      })
      .off("shown.bs.modal")
      .on("shown.bs.modal", function () {
        $("#new_code_name").focus();
      })
      .modal("show");
    }
  });
  
  $("#rename_code_button").on("click", function () {
    // Get the selected PhaseType name and assign to variable
    var code_selected = $("#code_select").val();
    // Store the selected PhaseType name again as the original variable is overwritten before we delete anything meaning we can't use it or we delete the new file not the old one!
    var originPT = code_selected;

    if (typeof master.phasetypes.default[code_selected] !== "undefined") {
      bootbox.alert("You can't rename a default code file");
    } else {
      bootbox.prompt(
        "What would you like to rename the Phasetype to?",
        function (new_name) {
          if (new_name === null) {
            // close the window
          } else if ($("#code_select").text().indexOf(new_name) !== -1) {
            bootbox.alert("You already have a code file with this name");
          } else {
            var original_name = $("#code_select").val();
            master.phasetypes.user[new_name] = master.phasetypes.user[original_name];
            
            // This adds the new PhaseType name as an attribute to the dropdown html, not 100% sure why
            // $("#code_select").attr("previousvalue", "");

            // This "renames" the file by actually creating a new file with the required name
            var response = Collector.electron.fs.write_file(
              "PhaseTypes/",
              new_name.replace(".html", "") + ".html",
              master.phasetypes.user[new_name]
            );               
            
            // Then we write a variable to show that everything has worked ok and we're good to delete the old file
            var write_response = "success";
          }

            // If the success variable was created we can delete the previous file
            // NOTE: This is a hard delete (no recycle binning) I'm wondering if it's safer to move it to a "tempDelete" folder or something just in case
          if (write_response == "success") {
            // Remove the old PhaseType from the options dropdown
            // $('#code_select option:contains('+originPT+')').remove();
            
            // Add .html to the originally selected PhaseType name, making it a file
            originPT_file = originPT.concat(".html");
            // Ass PhaseTypes/ to the file name we just created, giving us the path needed for the  delete funciton
            var filePath = ("PhaseTypes/" + originPT_file); 
            
            // -----------------------------------
            // Delete the file and dropdown option
            // -----------------------------------

            // Collector.electron.fs.delete_file(filePath);
            var deleted_code = $("#code_select").val();
            master.phasetypes.file = $("#code_select").val();
            var this_file = master.phasetypes.file;
            if (typeof master.phasetypes.graphic.files[this_file] !== "undefined") {
              delete master.phasetypes.graphic.files[this_file];
            }
            delete master.phasetypes.user[this_file];
            $("#code_select").attr("previousvalue", "");
            $("#code_select option:selected").remove();
            $("#graphic_editor").hide();
            master.phasetypes.file = $("#code_select").val();
            code_obj.load_file("default");
            Collector.electron.fs.delete_file(
                "PhaseTypes/" + deleted_code + ".html",
                function (response) {
                  if (response !== "success") {
                    // bootbox.alert(response);
                  }
                }
              );
            
            // Changes the dropdown menu to show the new filename as being selected, and delete the old one
            $("#code_select").append(new Option(new_name));  
            // $("#code_select").val(new_name);
            
            Collector.custom_alert("<b>File renamed</b><br>Please select it at the bottom of the dropdown list");
            // Lastly, we just do a master "save" to ensure the change is kept after quitting Collector
            setTimeout(function() { 
              $("#save_phasetype_btn").click();
              $("#save_btn").click();
              console.log("It saved the rename!");
            }, 100);
          } else { console.log("Rename failed");}
        }       
        
      );
    }
  });
  $("#save_phasetype_btn").on("click", function () {
    if ($("#code_select").val() !== null) {
      var content = editor.getValue();
      var name = $("#code_select").val();
      if (typeof master.phasetypes.default[name] === "undefined") {
        code_obj.save(content, name, "old");
      } else {
        Collector.custom_alert(
          "You cannot overwrite default code files. Would you like to create a new code file? Copy the code from <b>" +
            name +
            "</b> to a new code file if you want to make changes"
        );
      }
    }
  });
  $("#code_select").on("change", function () {
    var old_code = $(this).attr("previousValue");
    if (
      (old_code !== "") &
      (Object.keys(master.phasetypes.default).indexOf(old_code) === -1)
    ) {
      code_obj.save(master.phasetypes.user[old_code], old_code, "old");
    }
    $(this).attr("previousValue", this.value);
    var code_file = this.value;

    if (typeof master.phasetypes.graphic.files[code_file] !== "undefined") {
      master.phasetypes.file = code_file;
      editor.textInput.getElement().onkeydown =
        graphic_editor_obj.graphic_warning;

      //clear canvas
      graphic_editor_obj.load_canvas(
        master.phasetypes.graphic.files[code_file].elements
      );
      graphic_editor_obj.clean_canvas();

      load_code_mods();

      $("#view_code_btn").removeClass("btn-outline-primary");
      $("#view_code_btn").addClass("btn-primary");
      $("#ACE_editor").show();
      $("#view_graphic_btn").removeClass("btn-outline-primary");
      $("#view_graphic_btn").addClass("btn-primary");
      $("#graphic_editor").show();
      $("#delete_phasetypes_button").show();

    } else {
      editor.setOption("readOnly", false);
      $("#graphic_editor").hide();
      $("#view_graphic_btn").removeClass("btn-primary");
      $("#view_graphic_btn").addClass("btn-outline-primary");

      editor.textInput.getElement().onkeydown = "";
      $("#ACE_editor").show();
      master.phasetypes.file = code_file;

      if (typeof master.phasetypes.default[code_file] === "undefined") {
        user_default = "user";
      } else {
        user_default = "default";
      }

      $("#code_select").removeClass("user_code");
      $("#code_select").removeClass("default_code_file");
      if (user_default === "user") {
        $("#code_select").addClass("user_code");
      } else {
        $("#code_select").addClass("default_code_file");
      }
      code_obj.load_file(user_default);
    }
  });

  $("#view_code_btn").on("click", function () {
    if ($("#view_code_btn").hasClass("btn-primary")) {
      // then hide
      $("#view_code_btn").addClass("btn-outline-primary");
      $("#view_code_btn").removeClass("btn-primary");
      $("#ACE_editor").hide();
    } else {
      $("#view_code_btn").removeClass("btn-outline-primary");
      $("#view_code_btn").addClass("btn-primary");
      $("#ACE_editor").show();
    }
  });
  $("#view_graphic_btn").on("click", function () {
    var code_file = master.phasetypes.file;
    if (typeof master.phasetypes.graphic.files[code_file] === "undefined") {
      bootbox.alert(
        "This code_file was not created using the graphic editor, so cannot be edited with it"
      );
    } else {
      if ($("#view_graphic_btn").hasClass("btn-primary")) {
        // then hide
        $("#view_graphic_btn").addClass("btn-outline-primary");
        $("#view_graphic_btn").removeClass("btn-primary");
        $("#graphic_editor").hide();
      } else {
        $("#view_graphic_btn").removeClass("btn-outline-primary");
        $("#view_graphic_btn").addClass("btn-primary");
        $("#graphic_editor").show();
      }
    }
  });
}
