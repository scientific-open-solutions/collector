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
                  listSmarties();
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
      if ($('#code_editor-tab').hasClass('active')) {
        var content = editor.getValue();
      } else if ($('#graphic_editor-tab').hasClass('active')) {
        var htmlContent = editor_grape.getHtml();
        var cssContent = editor_grape.getCss();
        var jsContent = editor_grape.getJs();

        // Function to merge content and comments in the correct order
        function mergeContentAndComments(content, commentRegex) {
          let result = '';
          let lastIndex = 0;
          let match;
          
          while ((match = commentRegex.exec(content)) !== null) {
              // Append content before the comment
              result += content.slice(lastIndex, match.index);
              // Append the comment itself
              result += match[0];
              // Update lastIndex to the end of the comment
              lastIndex = commentRegex.lastIndex;
          }
          
          // Append any remaining content after the last comment
          result += content.slice(lastIndex);
          
          return result;
        }

        var mergedHtmlContent = mergeContentAndComments(htmlContent, /<!--[\s\S]*?-->/g);
        var mergedCssContent = mergeContentAndComments(cssContent, /\/\*[\s\S]*?\*\//g);
        var mergedJsContent = mergeContentAndComments(jsContent, /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm);

        // Combine everything into a single string, structured like a standard webpage
        var content = `
          <style>
            ${mergedCssContent}
          </style>
          </head>
            <body>
              ${mergedHtmlContent}
              <script>
                ${mergedJsContent}
              </script>
            </body>
          </html>
        `;
        console.log(content);  // You can now use this variable as needed


      } else {
        //skip
      }
      var name = $("#phasetype_select").val();
      if (typeof master.phasetypes.default[name] === "undefined") {
        code_obj.save(content, name, "old");
      } else {
        Collector.custom_alert("You cannot overwrite default code files. Would you like to create a new code file? Copy the code from <b>" + name + "</b> to a new code file if you want to make changes");
      }
    }
  });

  // QWERTY
  var firstView = true;
  $("#phasetype_select").on("change", function () {
    $('#code_editor-tab, #graphic_editor-tab, #code-preview-tab, #ACE_citation').show();

    // Loading the graphics editor on the first view, but then loading into what was open when changed
    if (firstView) {
      setTimeout(function(){
        $("#graphic_editor-tab").click();
        $('#graphic_editor-tab').removeClass("btn-outline-info").addClass("btn-info");
      },50);
      firstView = false;
    } else {
      setTimeout(function(){
        if ($('#code_editor-tab').hasClass('active')) {
          $("#code_editor-tab").click();
        } else if ($('#graphic_editor-tab').hasClass('active')) {
          $("#graphic_editor-tab").click();
        } else {
          $("#code-preview-tab").click();
        }
      },50);
    }
    
    var code_file = master.phasetypes.file;  
    var old_code = $(this).attr("previousValue");

    if (old_code !== "" && (Object.keys(master.phasetypes.default).indexOf(old_code) === -1)) {
      code_obj.save(master.phasetypes.user[old_code], old_code, "old");
    }

    $(this).attr("previousValue", this.value);
    var code_file = this.value; // This technically doesn't change from before, so not sure why it's being changed?
    master.phasetypes.file = code_file;

    if (master.phasetypes.default[code_file] == null) {
      // We're in a user generate file
      user_default = "user";
      $("#phasetype_select").addClass("form-select").addClass("user_code").removeClass("default_code");
      $('delete_phasetypes_button, #save_phasetype_btn, #rename_phasetypes_button').show();
      listSmarties();
    } else {
      // We're in a default file that cannot be edited
      user_default = "default";
      $("#phasetype_select").addClass("form-select").addClass("default_code").removeClass("user_code");
      $('delete_phasetypes_button, #save_phasetype_btn, #rename_phasetypes_button').hide();
    }

    // This loads in our selected file
    code_obj.load_file(user_default);
  });

  $("#code_editor-tab").on("click", function () {
    $("#code_preview").prop("src", "about:blank");
    $(this).addClass("active").removeClass("btn-outline-info").addClass("btn-info");
    $('#code-preview-tab').removeClass("active").removeClass("btn-info").addClass("btn-outline-info");
    $('#graphic_editor-tab').removeClass("active").removeClass("btn-info").addClass("btn-outline-info");
    $('#code_preview_fullscreen').hide();
    $('#code_editor').addClass('show active').siblings().removeClass('show active');
    $("#ACE_editor").show();
    $("#editor_theme_select").show();
    $("#graphic_editor").hide();
    $("#code_preview").hide();
  });


  $("#graphic_editor-tab").on("click", function () {
    $(this).addClass("active").removeClass("btn-outline-info").addClass("btn-info");
    $('#code_editor-tab').removeClass("active").removeClass("btn-info").addClass("btn-outline-info");
    $('#code-preview-tab').removeClass("active").removeClass("btn-info").addClass("btn-outline-info");
    $('#code_preview_fullscreen').hide();
    $('#graphic_editor').addClass('show active').siblings().removeClass('show active');
    $("#ACE_editor").hide();
    $("#graphic_editor").show();
    $("#editor_theme_select").hide();
    $("#code_preview").hide();

    // iframe_content = editor.getValue();
    
    // /* * find and replace items for developmental piloting */
    // iframe_variables = eval(iframe_content.split("---development---")[1]);
    // if (typeof iframe_variables !== "undefined") {
    //   iframe_variables.forEach(function (row) {
    //     var this_key = Object.keys(row);
    //     if (this_key.length == 0) {
    //       bootbox.alert("Error: You don't have any keys!");
    //     } else {
    //       for (i = 0; i < this_key.length; i++) {
    //         iframe_content = iframe_content.replaceAll("{{" + this_key[i] + "}}", row[this_key[i]]);
    //       }
    //     }
    //   });
    // }
    // /* use ../User folder */
    // home_dir = CElectron.git.locate_repo({org: $("#select_org").val(),repo: $("#select_repo").val(),});
    // iframe_content = iframe_content.replaceAll("../User/", home_dir + "/User/");
    // /* change set_timer so it works in the preview */
    // iframe_content = iframe_content.replaceAll("Phase.set_timer(function(){", "setTimeout(function(){");
    // /* delay any appropriate_message() call so it works in the preview */
    // var regex = /appropriate_message\(([^)]*)\)/g;
    // iframe_content = iframe_content.replace(regex, function(match) {
    //   return `setTimeout(function() { ${match} }, 0)`;
    // });
    // /* change phase_submit to a popup message so it works in the preview */
    // iframe_content = iframe_content.replaceAll("Phase.submit()", "appropriate_message('<b>End of Preview</b><br><br>You would now be moved on to the next task/trial if this was a live experiment')");
    // var html = libraries + iframe_content;


    // editor_grape.setComponents(html);
    editor_grape.setComponents(editor.getValue());
  });

  $("#code-preview-tab").on("click", function () {
    $(this).addClass("active").removeClass("btn-outline-info").addClass("btn-info");
    $('#code_editor-tab').removeClass("active").removeClass("btn-info").addClass("btn-outline-info");
    $('#graphic_editor-tab').removeClass("active").removeClass("btn-info").addClass("btn-outline-info");
    $('#code_preview_fullscreen').show();
    $('#code-preview').addClass('show active').siblings().removeClass('show active');
    $("#ACE_editor").hide();
    $("#graphic_editor").hide();
    $("#code_preview").show();

    /*
     * Everything below deals with the preview 
    */
    iframe_content = editor.getValue();
    
    /* * find and replace items for developmental piloting */
    iframe_variables = eval(iframe_content.split("---development---")[1]);
    if (typeof iframe_variables !== "undefined") {
      iframe_variables.forEach(function (row) {
        var this_key = Object.keys(row);
        if (this_key.length == 0) {
          bootbox.alert("Error: You don't have any keys!");
        } else {
          for (i = 0; i < this_key.length; i++) {
            iframe_content = iframe_content.replaceAll("{{" + this_key[i] + "}}", row[this_key[i]]);
          }
        }
      });
    }
    /* use ../User folder */
    home_dir = CElectron.git.locate_repo({org: $("#select_org").val(),repo: $("#select_repo").val(),});
    iframe_content = iframe_content.replaceAll("../User/", home_dir + "/User/");
    /* change set_timer so it works in the preview */
    iframe_content = iframe_content.replaceAll("Phase.set_timer(function(){", "setTimeout(function(){");
    /* delay any appropriate_message() call so it works in the preview */
    var regex = /appropriate_message\(([^)]*)\)/g;
    iframe_content = iframe_content.replace(regex, function(match) {
      return `setTimeout(function() { ${match} }, 0)`;
    });
    /* change phase_submit to a popup message so it works in the preview */
    iframe_content = iframe_content.replaceAll("Phase.submit()", "appropriate_message('<b>End of Preview</b><br><br>You would now be moved on to the next task/trial if this was a live experiment')");
    doc = document.getElementById("code_preview").contentWindow.document;
    doc.open();
      doc.write(libraries + iframe_content);    
    doc.close();
  });

}

// output html.txt framework to a variable to load into the ACE editor later
var htmlFramework = $.ajax({url: "./PhaseTypes/html.txt", async: false}).responseText;
