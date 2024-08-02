/*
 * PaseTypesActions.js
 * PhaseTypes actions (i.e. element triggers)
 */
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

  $("#assets_folder_btn").click(function () {
    CElectron.open_folder("repo", "User\\Assets");
  });
  $("#assets_loc_btn").click(function () {
    var text = "../../" + user.current.repo + "/User/Assets/";
    navigator.clipboard.writeText(text)
  });

  $("#convert_to_code_btn").on("click", function () {
    if (!parent.parent.functionIsRunning) {
      parent.parent.functionIsRunning = true;
      var deleted_phasetype = $("#phasetype_select").val();
      // master.phasetypes.file = $("#phasetype_select").val();
      // var this_file = master.phasetypes.file;
      bootbox.confirm({
        message: "Are you sure you want to covert <b>" + deleted_phasetype + "</b> to a Code Editor file?",
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
          if (firstResponse) {
            bootbox.confirm({
              message: "<b>Are you very sure?</b> This cannot be undone and means you cannot use the Graphics editor on this file again",
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
                  delete master.phasetypes.graphic.files[deleted_phasetype];
                  var delete_graphicObj = CElectron.fs.delete_file("Graphics/" + deleted_phasetype + ".html");
                  console.log("Deleted Graphic Object:" + delete_graphicObj)
                }
                secondResponse = result;
                if (secondResponse) {
                  $("#save_btn").click();
                  Collector.custom_alert("The phase type: " + deleted_phasetype + " has been converted"); 
                  // $("#view_code_btn").removeClass("btn-outline-primary");
                  // $("#view_code_btn").addClass("btn-primary");
                  editor.setOption("readOnly", false);
                  // $("#view_graphic_code_btn").hide(); // Hide the graphic editor current code button
                  $("#convert_to_code_btn").hide(); // Hide the graphic editor current code button
                  $("#graphic_editor").hide(); // Hide the graphic editor
                  $("#view_graphic_btn").hide() // hide the graphic editor button
                  $('#ACE_citation').show(); // show the code editor citation
                  $("#editor_theme_select").show();
                  $("#ACE_editor").show();
                  editor.textInput.getElement().onkeydown = "";
                } else {
                  Collector.custom_alert("The file was not converted"); 
                }
              }
            });
          }
        }
      });
    }
  });

  $("#delete_phasetypes_button").on("click", function () {
    code_obj.delete_phasetypes();
    // $('#view_code_btn').removeClass('btn-outline-primary');
  });

  $("#new_code_button").on("click", function () {
    if (!parent.parent.functionIsRunning) {
      parent.parent.functionIsRunning = true;
      var dialog = bootbox
      .dialog({
        show: false,
        title: "What would you like to name the new <b>PhaseType</b>?",
        message:
          "<p><input class='form-control' id='new_code_name' autofocus='autofocus'></p>",
        buttons: {
          cancel: {
            label: "Cancel",
            className: "btn-secondary",
            callback: function () {
              parent.parent.functionIsRunning = false;
            },
          },
          code: {
            label: "Using Code",
            className: "btn-primary bi bi-file-earmark-code",
            callback: function () {
              parent.parent.functionIsRunning = false;
              var new_name = $("#new_code_name").val().toLowerCase();
              if (protected_name_check(new_name)) {
                if (valid_new_name(new_name)) {
                  var content = htmlFramework;
                  master.phasetypes.user[new_name] = content;
                  master.phasetypes.file = new_name;
                  $("#rename_phasetypes_button").show();
                  $("#delete_phasetypes_button").show();
                  $("#save_phasetype_btn").show();
                  $("#editor_theme_select").show();
                  $('#ACE_citation').show(); // show the code editor citation
                  // $("#view_graphic_code_btn").hide(); // Show the graphic editor current code button
                  $("#convert_to_code_btn").hide(); // Show the graphic editor current code button
                  $("#view_graphic_btn").hide();
                  $("#graphic_editor").hide();
                  $("#phasetype_select").addClass("form-select").addClass("user_code");
                  $('#view_code_btn').removeClass('btn-outline-primary').removeClass('bi').addClass('btn-primary');
                  code_obj.save(content, new_name, "new", "code");
                  editor.session.setValue(htmlFramework);
                  editor.textInput.getElement().onkeydown = "";
                  editor.setOption("readOnly", false);
                  $("#phasetype_select").attr("previousvalue", new_name);
                }
                //the editor button should be on
                $('#code_editor-tab').removeClass('btn-outline-info').addClass('btn-info')
                setTimeout(function() { 
                  $("#save_phasetype_btn").click();
                  $("#save_btn").click();
                  console.log("It saved the new Graphic PhaseType: " + new_name);
                }, 100);
              }
            },
          },
          graphic: {
            label: "Using Graphics",
            className: "btn-primary bi bi-textarea-t",
            callback: function () {
              parent.parent.functionIsRunning = false;
              var new_name = $("#new_code_name").val().toLowerCase();
              if (protected_name_check(new_name)) {
                if (valid_new_name(new_name)) {
                  content = "";
                  master.phasetypes.user[new_name] = content;
                  master.phasetypes.file = new_name;
                  code_obj.save(content, new_name, "new", "graphic");
                  editor.setOption("readOnly", true);
                  editor.textInput.getElement().onkeydown = graphic_editor_obj.graphic_warning;
                  master.phasetypes.graphic.files[new_name] = { elements: {}, };
                  master.phasetypes.graphic.files[new_name].width = "1920px";
                  master.phasetypes.graphic.files[new_name].height = "1080px";
                  master.phasetypes.graphic.files[new_name].aspect = "lg";
                  master.phasetypes.graphic.files[new_name]["background-color"] = "#ffffff";
                  master.phasetypes.graphic.files[new_name].mouse_visible = true;
                  master.phasetypes.graphic.files[new_name].keyboard = { valid_keys: "", end_press: true, };
                  master.phasetypes.file = new_name;
                  // graphic_editor_obj.update_main_settings();
                  // graphic_editor_obj.clean_canvas();
                  graphic_editor_obj.load_canvas(master.phasetypes.graphic.files[new_name].elements);

                  //graphic editor button should be on:
                  // $("#view_graphic_btn").removeClass("btn-outline-primary");
                  // $("#view_graphic_btn").addClass("btn-primary");
                  $("#graphic_editor").show();
                  $("#rename_phasetypes_button").show();
                  $("#delete_phasetypes_button").show();
                  $("#save_phasetype_btn").show();
                  // $("#view_graphic_code_btn").show(); // Show the graphic editor current code button
                  $("#convert_to_code_btn").show(); // Show the graphic editor current code button
                  $("#ACE_citation").html("<br>").show(); // Hide the Code Editor Citation
                  $("#ACE_editor").hide();
                  $("#editor_theme_select").hide();
                  $("#phasetype_select").addClass("form-select").addClass("user_code");
                  //code editor should be on
                  // $("#view_code_btn").removeClass("btn-outline-primary");
                  // $("#view_code_btn").addClass("btn-primary");
                  // $("#delete_phasetypes_button").show();

                  //the editor button should be on
                  $('#code_editor-tab').removeClass('btn-outline-info').addClass('btn-info')
                  setTimeout(function() { 
                    $("#save_phasetype_btn").click();
                    $("#save_btn").click();
                    console.log("It saved the new Graphic PhaseType: " + new_name);
                  }, 100);
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

  $("#rename_phasetypes_button").on("click", function () {
    if (!parent.parent.functionIsRunning) {
      parent.parent.functionIsRunning = true;
      // Get the selected PhaseType name and assign to variable
      var phasetype_selected = $("#phasetype_select").val();
      // Store the selected PhaseType name again as the original variable is overwritten before we delete anything meaning we can't use it or we delete the new file not the old one!
      var originPT = phasetype_selected;

      if (typeof master.phasetypes.default[phasetype_selected] !== "undefined") {
        bootbox.alert("You can't rename a default code file");
        parent.parent.functionIsRunning = false;
      } else {
        bootbox.prompt(
          "What would you like to rename the <b>Phasetype</b> to?",
          function (new_name) {
            if (new_name === null) {
              // close the window
              parent.parent.functionIsRunning = false;
            } else if ($("#phasetype_select").text().indexOf(new_name) !== -1) {
              bootbox.alert("You already have a code file with this name");
              parent.parent.functionIsRunning = false;
            } else {
              parent.parent.functionIsRunning = false;
              var original_name = $("#phasetype_select").val();
              master.phasetypes.user[new_name] = master.phasetypes.user[original_name];
              delete master.phasetypes.user[original_name];

              var response = CElectron.fs.write_file("PhaseTypes/",new_name.replace(".html", "") + ".html",master.phasetypes.user[new_name]);
              
              if (response === "success") {
                if (master.phasetypes.graphic.files[original_name]){
                  console.log(original_name)
                  var graphic_objcontent = JSON.stringify(master.phasetypes.graphic.files[original_name]);
                  var write_newGraphicObj = CElectron.fs.write_file("Graphics/",new_name.replace(".html", "") + ".html",graphic_objcontent);
                  console.log("Create new graphic object: " + write_newGraphicObj)
                  $("#graphic_editor").show();
                } else {
                  $("#graphic_editor").hide(); // error in the above string (in this case, yes)!
                }

                // Add .html to the originally selected PhaseType name, making it a file
                originPT_file = originPT.concat(".html");
                var deleted_code = $("#phasetype_select").val();
                master.phasetypes.file = $("#phasetype_select").val();
                var this_file = master.phasetypes.file;
                // if (typeof master.phasetypes.graphic.files[this_file] !== "undefined") {
                //   delete master.phasetypes.graphic.files[this_file];
                // }

                delete master.phasetypes.user[this_file];
                $("#phasetype_select").attr("previousvalue", "");
                $("#phasetype_select option:selected").remove();
                master.phasetypes.file = $("#phasetype_select").val();               
                var delete_oldfile = CElectron.fs.delete_file("PhaseTypes/" + deleted_code + ".html");
                    if (delete_oldfile === "success") {
                      if (master.phasetypes.graphic.files[original_name]) {
                        var deleted_OldGraphicObj = CElectron.fs.delete_file("Graphics/" + deleted_code + ".html");
                        console.log("Delete old graphic object: " + deleted_OldGraphicObj)
                      } else {
                        console.log("No graphic object file to delete")
                      }
                    } else {
                      bootbox.alert(response);
                    }
                // Changes the dropdown menu to show the new filename as being selected, and delete the old one 
                $("#phasetype_select").append($('<option>',{
                  class: 'user_code',
                  text: new_name
                }));
                // Lastly, we just do a master "save" to ensure the change is kept after quitting Collector
                setTimeout(function() { 
                  $("#save_phasetype_btn").click();
                  $("#save_btn").click();
                  console.log("It saved the rename!");
                }, 100);
                $("#phasetype_select").val(new_name);
              } else { console.log("Rename failed"); }

            }       
          } 
        );
      } 
    }
  });
  $("#save_phasetype_btn").on("click", function () {
    if ($("#phasetype_select").val() !== null) {
      var content = editor.getValue();
      var name = $("#phasetype_select").val();
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
  $("#phasetype_select").on("change", function () {
    //console.log(master.phasetypes.graphic.files)
    first_view = true; // This is just a reset flag for the graphics editor, you can ignore it
    //master.phasetypes.graphic.files = {};
    var code_file = master.phasetypes.file;

    // Note: do not alter the two Settimeout functions, they build the delay needed to load the files before populating the graphics editor object. The graphics editor breaks without them.

    $('#code_editor-tab').removeClass("btn-outline-info").addClass("btn-info");
    var old_code = $(this).attr("previousValue");

    if (old_code !== "" && (Object.keys(master.phasetypes.default).indexOf(old_code) === -1)) {
      code_obj.save(master.phasetypes.user[old_code], old_code, "old");
    }

    $(this).attr("previousValue", this.value);
    var code_file = this.value; // This technically doesn't change from before, so not sure why it's being changed?
    master.phasetypes.file = code_file;

    if (master.phasetypes.default[code_file] == null) {
      user_default = "user";
      $("#phasetype_select").addClass("form-select").addClass("user_code").removeClass("default_code");
    } else {
      user_default = "default";
      $("#phasetype_select").addClass("form-select").addClass("default_code").removeClass("user_code");
    }

    code_obj.load_file(user_default);
    
    // This just hides the save, rename, and delete phasetype buttons when loading a default phasetype file, as they cannot be used
    if ($('#phasetype_select option:selected').hasClass('default_code')) {
      $('#rename_phasetypes_button').hide();
      $('#save_phasetype_btn').hide();
      $('#delete_phasetypes_button').hide();
    }
    console.log("code_file");
    console.log(code_file);
      
    if(typeof(master.phasetypes.graphic.files[code_file]) !== "undefined"){
    
      // editor.textInput.getElement().onkeydown = graphic_editor_obj.graphic_warning; // I'm keeping this incase someone gets to the code editor (as it's just hidden) but is slightly redundant now

      // setup canvas with required html elements
      graphic_editor_obj.load_canvas(master.phasetypes.graphic.files[code_file].elements);
        // graphic_editor_obj.clean_canvas();

      // load_code_mods();
      $('#code_editor-tab').removeAttr('disabled'); // activate the editor button
      $('#code-preview-tab').removeAttr('disabled'); // activate the preview button
      $("#ACE_editor").hide(); // Hide the Code Editor
      $("#ACE_citation").html("<br>").show(); // Hide the Code Editor Citation
      $("#editor_theme_select").hide(); // Hide the code editor themes dropdown
      // $("#view_graphic_code_btn").show(); // Show the graphic editor current code button
      $("#convert_to_code_btn").show(); // Show the graphic editor current code button
      $("#graphic_editor").show(); // Show the graphics editor
      $("#delete_phasetypes_button").show(); // Show the delete phasetype button
      $("#save_phasetype_btn").show(); // Show the save phasetype button

    } else {
      $('#code_editor-tab').removeAttr('disabled'); // activate the editor button
      $('#code-preview-tab').removeAttr('disabled'); // activate the preview button
      $('#ACE_citation').show(); // show the code editor citation
      $("#view_code_btn").removeClass("btn-outline-primary");
      $("#view_code_btn").addClass("btn-primary");
      editor.setOption("readOnly", false);
      // $("#view_graphic_code_btn").hide(); // Hide the graphic editor current code button
      $("#convert_to_code_btn").hide(); // Hide the graphic editor current code button
      $("#graphic_editor").hide(); // Hide the graphic editor
      $("#view_graphic_btn").hide() // hide the graphic editor button
      // $("#view_graphic_btn").removeClass("btn-primary");
      // $("#view_graphic_btn").addClass("btn-outline-primary");
      editor.textInput.getElement().onkeydown = "";
      $("#ACE_editor").show();

      $("#phasetype_select").removeClass("user_code");
      $("#phasetype_select").removeClass("default_code_file");
      if (user_default === "user") {
        $("#phasetype_select").addClass("user_code");
      } else {
        $("#phasetype_select").addClass("default_code_file");
      }
      $("#delete_phasetypes_button").show();
      $("#save_phasetype_btn").show();
      $("#editor_theme_select").show();

      // code_obj.load_file(user_default);
    }
  // }, 150);
 
  });

  $("#view_code_btn").on("click", function () {
    if ($("#view_code_btn").hasClass("btn-primary")) {
      // then hide
      $("#view_code_btn").addClass("btn-outline-primary");
      $("#view_code_btn").removeClass("btn-primary");
      $("#ACE_editor").hide();
      $("#editor_theme_select").hide();
    } else {
      $("#view_code_btn").removeClass("btn-outline-primary");
      $("#view_code_btn").addClass("btn-primary");
      $("#ACE_editor").show();
      $("#editor_theme_select").show();
    }
  });

  $("#view_graphic_btn").on("click", function () {
    var code_file = master.phasetypes.file;
    // graphics_file = $('.ace_attribute-value').html().replace("'","").replace("'","");
      if (graphics_file === "graphics_editor") {
      bootbox.alert(
        "Sorry, the graphics editor doesn't currently support reopening/editing previously saved files - we're working to fix this."
        // "Sorry, this PhaseType wasn't created using the graphics editor and, therefore, cannot be edited with it."
      );
    } else {
      $('#view_graphic_btn').show()
      $('#save_phasetype_btn').show()
      $('#rename_phasetype_btn').show()
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

// output html.txt framework to a variable to load into the ACE editor later
var htmlFramework = $.ajax({url: "./PhaseTypes/html.txt", async: false}).responseText;