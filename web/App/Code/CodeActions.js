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

    Kitten/Cat release (2019-2021) author: Dr. Anthony Haffey (team@someopen.solutions)
*/
function initiate_actions(){
  function protected_name_check(this_name){
    protected_names = ["start_experiment"];
    if(protected_names.indexOf(this_name) == -1){
      return true;
    } else {
      bootbox.alert("Please do not use <b>" + this_name + "</b>, it is protected");
    }
  }
  function valid_new_name(this_name){
    if(this_name){
      this_name = this_name.toLowerCase();

      /*
      * check it's in the list of quality checks
      */
      var quality_checks = [
        "quality_age_check",
        "quality_calibration_zoom",
        "quality_details_warning",
        "quality_participant_commitment",
        "end_checks_experiment"
      ];

      if(quality_checks.indexOf(this_name) !== -1){
        bootbox.alert("<b>" +
          this_name + "</b>" +
          " is protected, please choose another name"
        );
        return false;
      } else {
        return this_name;
      }
    } else {
      return false;
    }

    var current_code = Object.keys(master.code.user)
      .concat(Object.keys(master.code.default));
    current_code = Array.from(new Set(current_code));
    if(current_code.indexOf(this_name.toLowerCase()) == -1){
      return true;
    } else {
      bootbox.alert("There is a trialtype with the name <b>" + this_name + "</b> - please choose a unique name");
      return false;
    }
  }
  $("#ACE_editor").on("keyup input",function(){
    var ace_content = editor.getValue();
    var code_file   = master.code.file;
    if(typeof(master.code.user[code_file]) == "undefined"){
      master.code.user[code_file] = {
        files : {}
      }
    }
    master.code.user[code_file].updated = true;
    master.code.user[code_file]= ace_content;
  });

  $("#delete_code_button").on("click",function(){
    code_obj.delete_code();
  });

  $("#new_code_button").on("click",function(){
    var dialog = bootbox.dialog({
      show: false,
      title: 'What would you like to name this new code file?',
      message:  "<p><input class='form-control' id='new_code_name' autofocus='autofocus'></p>",
      buttons: {
        cancel: {
          label: "Cancel",
          className: 'btn-secondary',
          callback: function(){
            //none
          }
        },
        code: {
          label: "Using Code",
          className: 'btn-primary',
          callback: function(){
            var new_name = $("#new_code_name").val().toLowerCase();
            if(protected_name_check(new_name)){
              if(valid_new_name(new_name)){
                var content = "";
                master.code.user[new_name] = content;
                master.code.file = new_name;
                code_obj.save(content,new_name,"new","code");
                editor.textInput.getElement().onkeydown = "";
              }
            }
          }
        },
        graphic: {
          label: "Using Graphics",
          className: 'btn-primary',
          callback: function(){
            var new_name = $("#new_code_name").val().toLowerCase();
              if(protected_name_check(new_name)){
                if(valid_new_name(new_name)){
                  content = "";
                  master.code.user[new_name] = content;
                  master.code.file = new_name;
                  code_obj.save(content,new_name,"new","graphic");
                  $("#graphic_editor").show();
                  editor.setOption("readOnly",true);
                  editor.textInput.getElement().onkeydown = graphic_editor_obj.graphic_warning;
                  master.code.graphic.files[new_name] = {
                    elements: {}
                  };
                  master.code.graphic.files[new_name].width = "600";
                  master.code.graphic.files[new_name].height = "600";
                  master.code.graphic.files[new_name]["background-color"] = "white";
                  master.code.graphic.files[new_name].mouse_visible = true;
                  master.code.graphic.files[new_name].keyboard = {
                    valid_keys: '',
                    end_press: true
                  };
                  master.code.file = new_name;
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
                }
              }
          }
        }
      }
    })
    .off("shown.bs.modal")
    .on("shown.bs.modal", function() {
      $("#new_code_name").focus();
    })
    .modal("show");
  });

  $("#rename_code_button").on("click",function(){
    var trialtype_selected = $("#code_select").val();

    if(typeof(master.code.default[trialtype_selected]) !== "undefined"){
      bootbox.alert("You can't rename a default trialtype");
    } else {
      bootbox.prompt("What would you like to rename the Phasetype to?",function(new_name){
        if(new_name == null){
          // close the window
        } else if($("#code_select").text().indexOf(new_name) !== -1){
          bootbox.alert("You already have a trialtype with this name");
        } else {
          var original_name = $("#code_select").val();
          master.code.user[new_name] = master.code.user[original_name];
          delete(master.code.user[original_name]);

          $("#code_select").attr("previousvalue","");


          var response = Collector.electron.fs.write_file(
            "Phasetypes",
            new_name.replace(".html","") + ".html",
            master
              .trialtypes
              .user
              [new_name]
          )
          if(write_response == "success"){
            Collector.electron.fs.delete_code(
              original_name,
              function(response){
                if(response == "success"){
                  list_code(function(){
                    $("#code_select").val(new_name);
                    $("#code_select").change();
                  });
                } else {
                  bootbox.alert(response);
                }
              }
            )
          }
        }
      });
    }
  });
  $("#save_code_button").on("click",function(){
    if($("#code_select").val() !== null){
      var content = editor.getValue()
      var name  = $("#code_select").val();
      if(typeof(master.code.default[name]) == "undefined"){
        code_obj.save(content,name,"old");
      } else {
        Collector.custom_alert("You cannot overwrite default trialtypes. Would you like to create a new trialtype? Copy the code from <b>" + name + "</b> to a new trialtype if you want to make changes");
      }
    }
  });
  $("#code_select").on("change",function(){
    var old_code = ($(this).attr('previousValue'));
    if(old_code !== "" &
      Object.keys(master.code.default).indexOf(old_code) == -1){ code_obj.save(master.code.user[old_code],old_code,"old");
    }
    $(this).attr('previousValue', this.value);
    var code_file = this.value;

    if(typeof(master.code.graphic.files[code_file]) !== "undefined"){
      master.code.file = code_file;
      editor.textInput.getElement().onkeydown = graphic_editor_obj.graphic_warning;

      //clear canvas
      graphic_editor_obj.load_canvas(master.code.graphic.files[code_file].elements);
      graphic_editor_obj.clean_canvas();

      load_trialtype_mods();

      $("#view_code_btn").removeClass("btn-outline-primary");
      $("#view_code_btn").addClass("btn-primary");
      $("#ACE_editor").show();
      $("#view_graphic_btn").removeClass("btn-outline-primary");
      $("#view_graphic_btn").addClass("btn-primary");
      $("#graphic_editor").show();

    } else {
      editor.setOption("readOnly",false);
      $("#graphic_editor").hide();
      $("#view_graphic_btn").removeClass("btn-primary");
      $("#view_graphic_btn").addClass("btn-outline-primary");

      editor.textInput.getElement().onkeydown = "";
      $("#ACE_editor").show();
      master.code.file = code_file;


      if(typeof(master.code.default[code_file]) == "undefined"){
        user_default = "user";
      } else {
        user_default = "default";
      }

      $("#code_select").removeClass("user_code");
      $("#code_select").removeClass("default_trialtype");
      if(user_default == "user"){
        $("#code_select").addClass("user_code");
      } else {
        $("#code_select").addClass("default_trialtype");
      }
      code_obj.load_file(user_default);
    }
  });

  $("#view_code_btn").on("click",function(){
    if($("#view_code_btn").hasClass("btn-primary")){  // then hide
      $("#view_code_btn").addClass("btn-outline-primary");
      $("#view_code_btn").removeClass("btn-primary");
      $("#ACE_editor").hide();
    } else {
      $("#view_code_btn").removeClass("btn-outline-primary");
      $("#view_code_btn").addClass("btn-primary");
      $("#ACE_editor").show();
    }
  });
  $("#view_graphic_btn").on("click",function(){
    var trialtype = master.code.file;
    if(typeof(master.code.graphic.files[trialtype]) == "undefined"){
      bootbox.alert("This trialtype was not created using the graphic editor, so cannot be edited with it");
    } else {
      if($("#view_graphic_btn").hasClass("btn-primary")){  // then hide
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
