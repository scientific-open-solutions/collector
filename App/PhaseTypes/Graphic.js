/*
 * Graphics.js
 */

 /* 
  * graphic_editor_obj works in the following order: (1) Load Canvas; (2); Clean Canvas; (3) Update Timeline (4) Update Main Timeline; (5) Update Settings; (6) Compile Graphics; 
  * When you make a change to anything, it runs' graphic_editor_obj.compile_graphics' to update the graphic canvas.
 */

doc = document.getElementById("graphic_canvas").contentWindow.document;
doc.open();
doc.write(
  '<link rel="stylesheet" href="libraries/bootstrapCollector.css">' +
    '<script src="libraries/jquery.min.js"></script>' +
    '<script src="libraries/popper.min.js"></script>' +
    '<script src="libraries/bootstrap.min.js"></script>' +
    '<style>'+
      '.selected_element{font-weight:bold;}\n'+
      '.selected_element:hover, .graphic_element:hover{cursor:pointer;}\n'+
      '.btn{white-space:normal !important; word-wrap: break-word; }\n' +
      '::-webkit-scrollbar {width: 14px; height: 18px;background-color: transparent;}\n' +
      '::-webkit-scrollbar-thumb {height: 6px;border: 4px solid rgba(0, 0, 0, 0);background-clip: padding-box;-webkit-border-radius: 7px;background-color: rgba(0, 102, 153, 0.5);-webkit-box-shadow: inset -1px -1px 0px rgba(0, 0, 0, 0.05),inset 1px 1px 0px rgba(0, 0, 0, 0.05);}\n' +
      '::-webkit-scrollbar-thumb:hover {background-color: rgba(0, 102, 153, 1);}\n' +
      '::-webkit-scrollbar-corner {background-color: transparent;}\n' +
      '#trial_contents_canvas{border: 1px black solid; top:0; bottom:0; right:0; left:0;margin:auto;position:absolute;\n'+
    '</style>'+
    '<script>' +
    '//Rebuilding CTRL-S Functionality\n'+
    '$(window).bind("keydown", function (event) {\n'+
      '  if (event.ctrlKey || event.metaKey) {\n'+
      '    switch (String.fromCharCode(event.which).toLowerCase()) {\n'+
      '      case "s":\n'+
      '      event.preventDefault();\n'+
      '      parent.$("#save_phasetype_btn").click();\n'+
      '    }\n'+ 
      '  }\n'+
    '});\n'+
    '</script>'
);
doc.close();

/* ****************
   GLOBAL VARIABLES
   **************** */
  var color;
  // var opacity;
  // var rgbaCol;
  var body_width = 0;
  var body_height = 0;
  var trialtype;
  var this_trialtype;
  var new_editor = false;
  var aspect_ratio = "lg";
  var aspect_units = "px";
  var aspect_width = 0;
  var aspect_height = 0;
  var position_marker = "absolute";
  var $gphCnvs = $("#graphic_canvas");
  var $gphCnvs_contents = $("#graphic_canvas").contents();
  var new_element_flag;
  var phasetype_object;

/* *******
   ACTIONS
   ******* */
   //#region 

/* BY CLASS */

$(".canvas_btn").click(function () { // These are the new element buttons (renaming them breaks the code for some strange reason!)
  if ($(".canvas_btn").hasClass("active_canvas_btn")) {
      if ($(this).text() == "Text"){
        $(this).removeClass("btn-primary").addClass("btn-outline-primary").removeClass("active_canvas_btn");
      } else if ($(this).text() == "Audio"){
        $(this).removeClass("btn-secondary").addClass("btn-outline-secondary").removeClass("active_canvas_btn");
      } else if ($(this).text() == "Image"){
        $(this).removeClass("btn-success").addClass("btn-outline-success").removeClass("active_canvas_btn");
      } else if ($(this).text() == "Video"){
        $(this).removeClass("btn-danger").addClass("btn-outline-danger").removeClass("active_canvas_btn");
      } else if ($(this).text() == "Input"){
        $(this).removeClass("btn-dark").addClass("btn-outline-dark").removeClass("active_canvas_btn");
      } else {
        $(this).removeClass("btn-primary").addClass("btn-outline-primary").removeClass("active_canvas_btn");
      }
  } else {
    if ($(this).text() == "Text"){
      $(this).removeClass("btn-outline-primary").addClass("btn-primary").addClass("active_canvas_btn");
    } else if ($(this).text() == "Audio"){
      $(this).removeClass("btn-outline-secondary").addClass("btn-secondary").addClass("active_canvas_btn");
    } else if ($(this).text() == "Image"){
      $(this).removeClass("btn-outline-success").addClass("btn-success").addClass("active_canvas_btn");
    } else if ($(this).text() == "Video"){
      $(this).removeClass("btn-outline-danger").addClass("btn-danger").addClass("active_canvas_btn");
    } else if ($(this).text() == "Input"){
      $(this).removeClass("btn-outline-dark").addClass("btn-dark").addClass("active_canvas_btn");
    } else {
      $(this).removeClass("btn-outline-primary").addClass("btn-primary").addClass("active_canvas_btn");
    }
  }
});
$(".keyboard_setting").on("input change", function () {
  //only for valid keys at the moment though.
  var keyboard_prop = this.id.replace("keyboard_", "");
  this_trialtype.keyboard[keyboard_prop] = this.value;
  // graphic_editor_obj.compile_phasetype_file();
});

/* BY ID */

$("#add_mod_btn").click(function () {
  bootbox.prompt("What would you like to call this mod?", function (mod) {
    if (!parent.parent.functionIsRunning) {
      parent.parent.functionIsRunning = true;
      if (mod != null) {
        parent.parent.functionIsRunning = false;
        if (mod.length == 0) {
          bootbox.alert("Sorry, you need to enter a name for this mod", function () {
            $("#add_mod_btn").click();
          });
        } else {
          if (this_trialtype.mods[mod] != null) {
            bootbox.alert("The name <b>" + mod + "</b> already exists. Please come up with a unique name for this mod.");
          } else {
            this_trialtype.mods[mod] = {
              type: "",
              settings: {},
            };
            var index = $("#trial_mod_settings").find(".setting_header").length;
            new_card_html =
              '<div class="card-header bg-primary setting_header" id="mod' + index + '" data-toggle="collapse" data-target="#collapse_mod_' + index + '" aria-expanded="true" aria-controls="collapse_mod_' + index + '">' +
                '<h4 class="mb-0 text-white">' + mod + "</h4>" +
              "</div>" +
              '<div id="collapse_mod_' + index + '" class="collapse show" aria-labelledby="mod' + index + '" data-parent="#trial_mod_settings">' + 
                '<div class="card-body">' + 
                  '<select class="form-control select_mod" id="mod_select_' + mod +'">' +
                    "<option>--select mod--</option>";
                    Object.keys(master.mods).forEach(function (mod_type) {
                        new_card_html += 
                      '<option title="' + mod + '">' + mod_type + "</option>";
                    });
                    new_card_html +=
                  "</select>" +
                "</div>" +
              "</div>";
            $("#trial_mod_settings").append(new_card_html);

            $(".select_mod").off();
            select_mod_on();
          }
        }
      } else {
        parent.parent.functionIsRunning = false;
      }
    }
  });
});
$("#element_timeline_btn").click(function () {
  if ($("#element_timelines").is(":visible")) {
    $("#element_timeline_btn").removeClass("btn-primary");
    $("#element_timeline_btn").addClass("btn-outline-primary");
    $("#element_timelines").hide(500);
  } else {
    $("#element_timeline_btn").addClass("btn-primary");
    $("#element_timeline_btn").removeClass("btn-outline-primary");
    $("#element_timelines").show(500);
  }
});
$("#keyboard_end_press").on("input change", function () {
  var keyboard_element = $("#keyboard_variable").val();
  this_trialtype.keyboard.end_press = $(this)[0].checked;
});
$("#keyboard_valid_keys").click(function () {
  helperActivate("Keyboard", $(this).val(), "keyboard");
});
$("#keyboard_variable").click(function () {
  bootbox.prompt(
    "What would you like to rename this keyboard response to?",
    function (new_name) {
      if (new_name) {
        //i.e. not cancel
        var old_name = $("#keyboard_variable").val();
        if (this_trialtype.keyboard[new_name] == null) {
          this_trialtype.keyboard[new_name] = 
            this_trialtype.keyboard[old_name];
          delete this_trialtype.keyboard[old_name];
          $("#keyboard_variable").val(new_name);
        }
      }
    }
  );
});
$("#mouse_visible").change(function () {
  this_trialtype["mouse_visible"] = $(this)[0].checked;
});
$("#required_screen_lg").click(function () {
  aspect_units = "px";
  // console.log(aspect_units);
  elements = this_trialtype.elements;
  Object.keys(elements).forEach(function (element) {
    $gphCnvs_contents.find("body").find("#"+element).css("position","absolute");
  })
  $('#trial_bg_selector').hide()
  this_trialtype["trial_contents_bg-color"] = this_trialtype["background-color"];
  remove_trial_contents_div();
  if (aspect_ratio == "flex") {
    aspect_ratio = "lg";
    update_screen_sizes(screen.width, screen.height);  
  } else {
    aspect_ratio = "lg";
  }
  width = $("#trial_width").val();
  height = $("#trial_height").val();
  update_screen_sizes(width, height);
  change_bg_colours("body");
  aspect_units = "px";
  graphic_editor_obj.compile_phasetype_file();
});
$("#required_screen_sm").click(function () {
  aspect_units = "px";
  // console.log(aspect_units);
  elements = this_trialtype.elements;
  Object.keys(elements).forEach(function (element) {
    $gphCnvs_contents.find("body").find("#"+element).css("position","absolute");
  })
  $('#trial_bg_selector').hide()
  if (aspect_ratio == "flex") {
    aspect_ratio = "sm";
    update_screen_sizes(screen.width, screen.height);  
  } else {
    aspect_ratio = "sm";
  }
  width = $("#trial_width").val();
  height = $("#trial_height").val();
  update_screen_sizes(width, height);  
  this_trialtype["trial_contents_bg-color"] = this_trialtype["background-color"];
  remove_trial_contents_div();
  change_bg_colours("body");
  graphic_editor_obj.compile_phasetype_file();
});
$("#required_screen_flex").click(function () {
  aspect_units = "%";
  // console.log(aspect_units);
  elements = this_trialtype.elements;
  Object.keys(elements).forEach(function (element) {
    $gphCnvs_contents.find("body").find("#"+element).css("position","relative");
  })
  $('#trial_bg_selector').hide()
  aspect_ratio = "flex";
  update_screen_sizes(screen.width, screen.height);
  remove_trial_contents_div();
  this_trialtype["trial_contents_bg-color"] = this_trialtype["background-color"];
  change_bg_colours("body");
  graphic_editor_obj.compile_phasetype_file();
});
$("#required_screen_cstm").click(function () {
  aspect_units = "px";
  // console.log(aspect_units);
  $gphCnvs.ready(function () {
    position_marker = "absolute";
    elements = this_trialtype.elements;
    Object.keys(elements).forEach(function (element) {
      $gphCnvs_contents.find("body").find("#"+element).css("position","absolute").css("display","block");
    })
    $('#trial_bg_selector').show()
    if (aspect_ratio == "flex") {
      aspect_ratio = "ctsm";
      update_screen_sizes(screen.width, screen.height);  
      create_trial_contents_div();
    } else {
      aspect_ratio = "cstm";
      width = this_trialtype.trial_width;
      height = this_trialtype.trial_height;
      update_screen_sizes(width, height);
      create_trial_contents_div();
    }  
    change_bg_colours("stim");
    change_bg_colours("body");
    graphic_editor_obj.compile_phasetype_file();      
  });
});
$("#toggle_canvas_grid").click(function () {
  if ($("#toggle_canvas_grid").hasClass("btn-secondary")) {
    $gphCnvs_contents.find("body").removeClass("canvas_grid").css("background-size","").css("background-image","");
    $("#toggle_canvas_grid").addClass("btn-outline-secondary").removeClass("btn-secondary");
  } else {
    $gphCnvs_contents.find("body").css("background-size","29px 27px").css("background-image","linear-gradient(to right, grey 1px, transparent 1px),linear-gradient(to bottom, grey 1px, transparent 1px)");
    $("#toggle_canvas_grid").addClass("btn-secondary").removeClass("btn-outline-secondary");
  }
});
$("#trial_width").on("input change", function () {
  width = $("#trial_width").val();
  height = $("#trial_height").val();
  update_screen_sizes(width,height);
    $gphCnvs.ready(function () {
      width = $("#trial_width").val();
      height = $("#trial_height").val();
      update_screen_sizes(width, height);
    });
});
$("#trial_height").on("input change", function () {
  height = $("#trial_height").val();
  update_screen_sizes(width,height);
    $gphCnvs.ready(function () {
      width = $("#trial_width").val();
      height = $("#trial_height").val();
      update_screen_sizes(width, height);
    })
});
$("#view_graphic_code_btn").click(function () {
  required_code_name = $("#phasetype_select").val();
  bootbox.alert({
    title: "Current HTML code for: <b>" + required_code_name + "</b>",
    message: '<xmp>'+ master.phasetypes.user[required_code_name] +'</xmp>',
    size: 'extra-large'
    }).off("shown.bs.modal").modal("show");
});

/* BY SELECTOR */
$gphCnvs_contents.click(function () {
  //make sure that the ace editor isn't blocking the view
    var helper_width = parseFloat($("#help_content").css("width").replace("px", ""));
    var graphic_width = parseFloat($("#graphic_settings").css("width").replace("px", ""));
    var max_width = Math.max(helper_width, graphic_width);
    $("#ace_div").animate({
      width: window.innerWidth - max_width,
    },500,function () {
      editor.resize();
    });    

    var element_type = $(".canvas_btn.active_canvas_btn").val(); 
    $("#new_text_btn").addClass("btn-outline-primary").removeClass("btn-primary").removeClass("active_canvas_btn");
    $("#new_audio_btn").addClass("btn-outline-secondary").removeClass("btn-secondary").removeClass("active_canvas_btn");
    $("#new_image_btn").addClass("btn-outline-success").removeClass("btn-success").removeClass("active_canvas_btn");
    $("#new_video_btn").addClass("btn-outline-danger").removeClass("btn-danger").removeClass("active_canvas_btn");
    $("#new_input_btn").addClass("btn-outline-dark").removeClass("btn-dark").removeClass("active_canvas_btn");
    $("#canvas_click_btn").addClass("btn-outline-primary").removeClass("btn-primary").removeClass("active_canvas_btn");

    if (element_type != null && element_type !== "Click") {
      graphic_editor_obj.create_element(element_type);
      $("#canvas_click_btn").click();
    } else {
      if (master.phasetypes.graphic.hovered_element != null && master.phasetypes.graphic.hovered_element !== "") {
        var element_id = master.phasetypes.graphic.hovered_element;
        $gphCnvs_contents.find(".graphic_element").removeClass("selected_element");
        $gphCnvs_contents.find("#" + element_id).addClass("selected_element").removeClass("hovered_element");

        master.phasetypes.graphic.element_id = element_id;
        graphic_editor_obj.update_element_settings(element_id);

        //click on the timeline button with the relevant value
        $(".during_timeline[value=" + element_id + "]").click();
      } else {
        $gphCnvs_contents.find(".graphic_element").removeClass("selected_element");
        $("#graphic_settings").html("");
        $("#graphic_general_settings").show();

        for (var i = 0; i < $(".during_timeline").length; i++) {
          document.getElementById($(".during_timeline")[i].id).className = document.getElementById($(".during_timeline")[i].id).className.replace("btn-outline-", "btn-");
          document.getElementById($(".during_timeline")[i].id).className = document.getElementById($(".during_timeline")[i].id).className.replace("btn-", "btn-outline-");
        }
      }
    }
    $(".input-group-text").filter(function() { return ($(this).text() === 'color') }).text("font-color")
    $('.input-group-text').each(function() { var text = $(this).text().replace('-color', ' colour').replace('border-', 'border ').replace('font-', 'font '); $(this).text(text); });
});
$gphCnvs_contents.mousemove(function (event) {
  graphic_editor_obj._mouseX = event.clientX;
  graphic_editor_obj._mouseY = event.clientY;
});
// #endregion

/* *********
   FUNCTIONS
   ********* */
   //#region 

function aspects(){
  saved_aspect = this_trialtype.aspect;
  if (saved_aspect == "lg") {
    $("#required_screen_lg").click();
  } else if (saved_aspect == "sm") {
    $("#required_screen_sm").click();
  } else if (saved_aspect == "flex") {
    $("#required_screen_flex").click();
  } else {
    $("#required_screen_cstm").click();
  }
}
function remove_trial_contents_div() {
  elements = $gphCnvs_contents.find("body").find(".graphic_element");
  trial_contents_canvas = $gphCnvs_contents.find("body").find("#trial_contents_canvas");
  if (trial_contents_canvas.length > 0){
    elements.unwrap();
  }
}
function create_trial_contents_div() {
  setTimeout(() => {
    $gphCnvs_contents.find("body").find(".graphic_element").wrapAll("<div id='trial_contents_canvas'></div>");
  }, 10);
}
function change_bg_colours(arg) {
  type = arg;
  if (type == "body") {
    $("#trial_background_color").on("input", function () {
      color = $(this).val();
      this_trialtype["background-color"] = color;
      $gphCnvs_contents.find("body").css("background-color", color);
      graphic_editor_obj.compile_phasetype_file(); 
    });
  } else if (type == "stim"){
    $("#stim_background_color").val(this_trialtype["trial_contents_bg-color"]).on("input", function () {
      color = $(this).val();
      this_trialtype["trial_contents_bg-color"] = color;
      $gphCnvs_contents.find("body").find("#trial_contents_canvas").css("background-color", color);
      graphic_editor_obj.compile_phasetype_file(); 
    });
  }
}
// function change_bg_opacities() {
//   $("#trial_background_opacity").on("input", function () {
//     opacity = $("input[type=range]").val();
//     this_trialtype["opacity"] = opacity;
//     color = this_trialtype["background-color"];
//     rgbaCol = 'rgba(' + parseInt(color.slice(-6, -4), 16) + ',' + parseInt(color.slice(-4, -2), 16) + ',' + parseInt(color.slice(-2), 16) + ',' + opacity + ')';
//     $gphCnvs_contents.find("body").css("background-color", rgbaCol);
//   });
// }
function load_code_mods() {
  // deal with list of mods here - can be an array in graphics and then this array when compiled adds the mods at the bottom of the script
  if (this_trialtype.mods == null) {
    this_trialtype.mods = {};
  }
  //if mods exist, list them
  $("#mod_div").html("");
  current_mods_html = '<div class="accordion" id="trial_mod_settings">';

  Object.keys(this_trialtype.mods).forEach(function (mod, index) {
    current_mods_html +=
      '<div class="card" id="graphic_editor_options">' +
      '<div class="card-header bg-primary setting_header" id="mod' +
      index +
      '" data-toggle="collapse" data-target="#collapse_mod_' +
      index +
      '" aria-expanded="true" aria-controls="collapse_mod_' +
      index +
      '">' +
      '<h4 class="mb-0 text-white">' +
      mod +
      "</h4>" +
      "</div>" +
      '<div id="collapse_mod_' +
      index +
      '" class="collapse show" aria-labelledby="mod' +
      index +
      '" data-parent="#trial_mod_settings">' +
      '<div class="card-body">' +
      '<button class="btn btn-primary delete_mod" value="' +
      mod +
      '">Delete</button>';

    mod_settings = Object.keys(this_trialtype.mods[mod].settings);
    mod_settings.forEach(function (mod_setting) {
      if (this_trialtype.mods[mod].settings[mod_setting] != null) {
        var this_mod_value = this_trialtype.mods[mod].settings[mod_setting];
      } else {
        var this_mod_value = "";
      }
      current_mods_html +=
        "<select class='form-control select_mod' id='mod_select_" +
        mod +
        "'>";
      current_mods_html += "  <option>--select mod--</option>";
      Object.keys(master.mods).forEach(function (mod_type) {
        if (mod_type == this_trialtype.mods[mod].type) {
          var selected = "selected";
        } else {
          var selected = "";
        }
        
          
        current_mods_html +=
          "  <option " +
          selected +
          " title='" +
          mod +
          "'>" +
          mod_type +
          "</option>";
      });
      current_mods_html += "</select>";
      current_mods_html +=
        '<div class="input-group mb-3">' +
        '<div class="input-group-prepend">' +
        '<span class="input-group-text" >' +
        mod_setting +
        "</span>" +
        "</div>" +
        '<input class="form-control mod_setting" id="mod_setting_' +
        mod +
        "_|_" +
        mod_setting +
        '" value="' +
        this_mod_value +
        '">' +
        "</div>";
    });
    current_mods_html += "</div>" + "</div>" + "</div>";
  });
  $("#current_mods").html(current_mods_html);
  $(".mod_setting").off();
  $(".mod_setting").on("change input", function () {
    var mod_setting = this.id.replace("mod_setting_", "").split("_|_");
    var mod = mod_setting[0];
    var setting = mod_setting[1];
    this_trialtype.mods[mod].settings[setting] = this.value;
  });
  select_mod_on();
}
function list_graphics() {
  if (master.phasetypes.graphic == null) {
    master.phasetypes.graphic = {
      trialtype: "",
      trialtypes: {},
      hovered_element: "",
    };
  }
  master.phasetypes.graphic.relevant_styles = [
    "background-color",
    "border-color",
    "border-radius",
    "border-style",
    "border-width",
    "color",
    "font-size",
    "height",
    "left",
    // "font-opacity",
    // "opacity",
    "top",
    "width",
    "z-index",
  ];
}
function select_mod_on() {
  $(".delete_mod").on("click", function () {
    var mod = this.value;
    bootbox.confirm(
      "Are you sure you want to delete the mod <b>" +
        this.value +
        "</b> for this trialtype?",
      function (response) {
        if (response) {
          delete this_trialtype.mods[mod];
          load_code_mods();
        }
      }
    );
  });
  $(".select_mod").on("change", function () {
    var mod_html = master.mods[$(this).val()];
    var variables = [];

    split_trialtype = mod_html.split("{{");
    split_trialtype = split_trialtype.map(function (split_part) {
      if (split_part.indexOf("}}") !== -1) {
        more_split_part = split_part.split("}}");
        variables.push(more_split_part[0].toLowerCase());
        more_split_part[0] = more_split_part[0].toLowerCase();
        split_part = more_split_part.join("}}");
      }
      return split_part;
    });
    mod_html = split_trialtype.join("{{");

    mod_variables = variables.filter(
      (variable) => variable.indexOf("mod.") == 0
    );
    mod_variables = mod_variables.map((mod_variable) =>
      mod_variable.replace("mod.", "")
    );
    mod_settings_html = "";

    var mod = this.id.replace("mod_select_", "");

    this_trialtype.mods[mod].type = $(this).val();
    mod_variables.forEach(function (mod_variable) {
      if (this_trialtype.mods[mod].settings[mod_variable] != null) {
        var this_mod_value = this_trialtype.mods[mod].settings[mod_variable];
      } else {
        var this_mod_value = "";
      }

      mod_settings_html +=
        '<div class="input-group mb-3">' +
        '<div class="input-group-prepend">' +
        '<span class="input-group-text" >' +
        mod_variable +
        "</span>" +
        "</div>" +
        '<input class="form-control mod_setting" id="mod_setting_' +
        mod +
        "_|_" +
        mod_variable +
        '" value="' +
        this_mod_value +
        '">' +
        "</div>";
    });
    $("#mod_settings").html(mod_settings_html);
    $(".mod_setting").off();
    $(".mod_setting").on("change input", function () {
      var mod_setting = this.id.replace("mod_setting_", "").split("_|_");
      var mod = mod_setting[0];
      var setting = mod_setting[1];
      this_trialtype.mods[mod].settings[setting] = this.value;
    });
  });
}
function update_screen_sizes(width, height) {
  if (aspect_ratio == "lg"){
    if (aspect_width === 0) {aspect_width = screen.width;} else {aspect_width = width;}
    aspect_height = Math.round((aspect_width / 16) * 9);
    $('#element_timeline_btn').css("right","-378px");
    $('#trial_width_prep').html("Phase Width");
    $('#trial_height_prep').html("Phase Height");
    $("#trial_width").val(aspect_width).removeAttr('disabled');
    $("#trial_height").val(aspect_height).attr("disabled", true);
    // $("#trial_width_unit, #trial_height_unit").html(aspect_units);
    $("#required_screen_sm, #required_screen_flex, #required_screen_cstm").removeClass('btn-primary').addClass('btn-outline-primary');
    $("#required_screen_lg").removeClass('btn-outline-primary').addClass('btn-primary');
    $gphCnvs.css("width","1350px").css("height","760px");
    $("#pageboundary").css("width","168%");
    this_trialtype.width = aspect_width;
    this_trialtype.height = aspect_height;
    this_trialtype["trial_width"] = aspect_width;
    this_trialtype["trial_height"] = aspect_height;
  } else if (aspect_ratio == "sm"){
    if (aspect_width === 0) {aspect_width = screen.width;} else {aspect_width = width;}
    aspect_height = Math.round((aspect_width / 4) * 3);
    $('#element_timeline_btn').css("right","-227px");
    $('#trial_width_prep').html("Phase Width");
    $('#trial_height_prep').html("Phase Height");
    $("#trial_width").val(aspect_width).removeAttr('disabled');
    $("#trial_height").val(aspect_height).attr("disabled", true);
    // $("#trial_width_unit, #trial_height_unit").html(aspect_units);
    $("#required_screen_lg, #required_screen_flex, #required_screen_cstm").removeClass('btn-primary').addClass('btn-outline-primary');
    $("#required_screen_sm").removeClass('btn-outline-primary').addClass('btn-primary');
    $gphCnvs.css("width","1200px").css("height","900px");
    $("#pageboundary").css("width","153%");
    this_trialtype.width = aspect_width;
    this_trialtype.height = aspect_height;
    this_trialtype["trial_width"] = aspect_width;
    this_trialtype["trial_height"] = aspect_height;
  } else if (aspect_ratio == "flex") {
    flex_aspect = screen.width / screen.height;
    flex_canvas_height = 1350 / flex_aspect;
    $gphCnvs.css("width","1350px").css("height",flex_canvas_height);
    $('#element_timeline_btn').css("right","-378px");
    $("#pageboundary").css("width","168%");
    $('#trial_width_prep').html("Phase Width");
    $('#trial_height_prep').html("Phase Height");
    // $("#trial_width_unit, #trial_height_unit").html(aspect_units);
    $("#trial_width").val("100").attr('disabled',true);
    $("#trial_height").val("100").attr('disabled',true);
    $("#required_screen_lg, #required_screen_sm, #required_screen_cstm").removeClass('btn-primary').addClass('btn-outline-primary');
    $("#required_screen_flex").removeClass('btn-outline-primary').addClass('btn-primary');
    this_trialtype.width = screen.width;
    this_trialtype.height = screen.height;
    this_trialtype["trial_width"] = screen.width;
    this_trialtype["trial_height"] = screen.height;
  } else {
    if (aspect_width === 0) {aspect_width = this_trialtype.trial_width;} else {aspect_width = width;}
    if (aspect_height === 0) {aspect_height = this_trialtype.trial_height;} else {aspect_height = height;}
    flex_aspect = screen.width / screen.height;
    flex_canvas_height = 1350 / flex_aspect;
    $gphCnvs.css("width","1350px").css("height",flex_canvas_height);
    $('#element_timeline_btn').css("right","-378px");
    $("#pageboundary").css("width","168%");
    $('#trial_width_prep').html("Stim Width");
    $('#trial_height_prep').html("Stim Height");
    // $("#trial_width_unit, #trial_height_unit").html(aspect_units);
    $("#trial_width").val(aspect_width).removeAttr('disabled');
    $("#trial_height").val(height).removeAttr('disabled');
    $("#required_screen_lg, #required_screen_flex, #required_screen_sm").removeClass('btn-primary').addClass('btn-outline-primary');
    $("#required_screen_cstm").removeClass('btn-outline-primary').addClass('btn-primary');
    this_trialtype["trial_width"] = aspect_width;
    this_trialtype["trial_height"] = aspect_height;
    this_trialtype.width = screen.width;
    this_trialtype.height = screen.height;
    // console.log("AW " + aspect_width)
    // console.log("AH " + aspect_height)
    // console.log("SW " + screen.width)
    // console.log("SH " + screen.height)
    
    canvas_element_width = aspect_width * (1350 / screen.width);
    canvas_element_height = aspect_height * (flex_canvas_height / screen.height);

    if ( canvas_element_width > 1350 || canvas_element_height > flex_canvas_height) {
      if (!parent.parent.functionIsRunning) {
        parent.parent.functionIsRunning = true;
          bootbox.alert("The stimuli window is bigger than screen, please reduce its size", function (){
            parent.parent.functionIsRunning = false;
          })
      }
    } 

    // console.log("CEW " + canvas_element_width)
    // console.log("CEH " + canvas_element_height)
    setTimeout(() => {
      $gphCnvs_contents.find("body").find("#trial_contents_canvas").css("height",canvas_element_height + "px").css("width",canvas_element_width + "px").css("background-color",this_trialtype["trial_contents_bg-color"]);  
      $gphCnvs_contents.find("body").css("background-color",this_trialtype["background-color"]);
    }, 15);
  }

}
// #endregion

/* ******
   OBJECT
   ****** */
   //#region 

graphic_editor_obj = {
  load_canvas: function (these_elements) { // You can ignore this as everything happens afterwards
    console.log("1. Load Canvas");
    remove_trial_contents_div() // First we want to remove the trial_contents_div if necessary
    trialtype = master.phasetypes.file;
    this_trialtype = master.phasetypes.graphic.files[trialtype];
    graphic_editor_obj.create_canvas(function () {
      Object.keys(these_elements).forEach(function (element) {
        switch (these_elements[element].type.toLowerCase()) {
          case "audio":
            graphic_editor_obj.draw_audio(these_elements[element], element);
            break;
          case "image":
            graphic_editor_obj.draw_image(these_elements[element], element);
            break;
          case "input":
            graphic_editor_obj.draw_input(these_elements[element], element);
            break;
          case "text":
            graphic_editor_obj.draw_text(these_elements[element], element);
            break;
          case "video":
            graphic_editor_obj.draw_video(these_elements[element], element);
            break;
        }
      });
      graphic_editor_obj.update_timeline();
      graphic_editor_obj.update_page_settings();
    });
    // console.log(master.phasetypes.graphic.files)
  },
    create_canvas: function (new_canvas_code) { // You can ignore this as everything happens afterwards
      console.log("2. Create Canvas");
      $gphCnvs_contents.find(".graphic_element").remove();
        $gphCnvs.ready(function () {
          if(this_trialtype != null) {
            color = this_trialtype["background-color"];
            // opacity = this_trialtype["opacity"];
            // rgbaCol = 'rgba(' + parseInt(color.slice(-6, -4), 16) + ',' + parseInt(color.slice(-4, -2), 16) + ',' + parseInt(color.slice(-2), 16) + ',' + opacity + ')';
            $gphCnvs_contents.find("body").css("background-color",this_trialtype["background-color"]).css("overflow", "overlay");
            // change_bg_opacities();
            aspects();
          } else {
            //do nothing
          }
          if (new_editor) {
            new_editor = false ;
            $("#graphic_general_settings").show();
          } else {
            if (new_canvas_code) { 
              $("#graphic_general_settings").show();
              new_canvas_code(); // <-------- I don't understand this, it literally doesn't exist anywhere else, and yet you cannot create the editor without it!
            } else {
              //do nothing
            }
          }
      
          // Check if any elements actually exist and show the timeline if true 
          existing_elements = this_trialtype.elements;
          if (jQuery.isEmptyObject(existing_elements)) {
            $('#element_timelines').html('<h6 id="empty_timeline" class="text-primary">Please create an elements to see the timeline</h6>')
            $("#element_timeline_btn").hide();
          } else {
            $("#element_timeline_btn").show();
          }
        });
    },
      draw_audio: function (element_props, element_id) {//qwerty
        $gphCnvs.ready(function () {
          $gphCnvs_contents.find("body").append("<button class='btn btn-outline-secondary audio_element graphic_element' id='" + element_id + "'></button>");
          $gphCnvs_contents.find("#" + element_id).html(element_id);
          $gphCnvs_contents.find("#" + element_id).css("position", position_marker);
          var image_props = ["width", "height", "top", "left", "z-index"];
          image_props.forEach(function (image_prop) {
            $gphCnvs_contents.find("#" + element_id).css(image_prop, element_props[image_prop].value);
          });
          $gphCnvs_contents.find(".graphic_element").removeClass("selected_element");
          $gphCnvs_contents.find("#" + element_id).addClass("selected_element");
          master.phasetypes.graphic.element_id = element_id;
          graphic_editor_obj.update_element_settings(element_id);
        });
      },
      draw_image: function (element_props, element_id) {
        $gphCnvs.ready(function () {
          $gphCnvs_contents.find("body").append(
              "<button class='btn btn-outline-success image_element graphic_element' id='" +
                element_id +
                "'></button>"
            );
          $gphCnvs_contents.find("#" + element_id).html(element_id);
          $gphCnvs_contents.find("#" + element_id).css("position", position_marker);
          var image_props = ["width", "height", "top", "left", "z-index"];
          image_props.forEach(function (image_prop) {
            $gphCnvs_contents.find("#" + element_id).css(image_prop, element_props[image_prop].value);
          });
          $gphCnvs_contents.find(".graphic_element").removeClass("selected_element");
          $gphCnvs_contents.find("#" + element_id).addClass("selected_element");
          master.phasetypes.graphic.element_id = element_id;
          graphic_editor_obj.update_element_settings(element_id);
        });
      },
      draw_input: function (element_props, element_id) {
        var type = element_props.input_type.value;
        $gphCnvs.ready(function () {
          switch (type.toLowerCase()) {
            case "button":
              input_html = "<input type='button' class='btn btn-outline-dark graphic_element' id='" + element_id + "'>";
              break;
            case "text":
              input_html = "<input type='text' placeholder='" + element_props.placeholder.value + "' class='form-control graphic_element' id='" + element_id + "'>";
              break;
          }
          $gphCnvs_contents.find("body").append(input_html);
          if (element_props.value != null) {
            $gphCnvs_contents.find("#" + element_id).val(element_props.value.value);
          }
          $gphCnvs_contents.find("#" + element_id).css("position", position_marker);
          var image_props = ["width", "height", "top", "left", "z-index"];
          image_props.forEach(function (image_prop) {
            $gphCnvs_contents.find("#" + element_id).css(image_prop, element_props[image_prop].value);
          });
          $gphCnvs_contents.find(".graphic_element").removeClass("selected_element");
          $gphCnvs_contents.find("#" + element_id).addClass("selected_element");
          master.phasetypes.graphic.element_id = element_id;
          graphic_editor_obj.update_element_settings(element_id);
        });
      },
      draw_text: function (element_props, element_id) {
        $gphCnvs.ready(function () {
          $gphCnvs_contents.find("body").append("<span class='text_element graphic_element' id='" +element_id +"'></span>");
          $gphCnvs_contents.find("#" + element_id).html(element_props.html.value);
          $gphCnvs_contents.find("#" + element_id).css("position", position_marker);
          var text_props = [
            "width",
            "height",
            "top",
            "left",
            "color",
            "background-color",
            "border-style",
            "border-width",
            "border-color",
            "border-radius",
            "z-index",
          ];
          text_props.forEach(function (text_prop) {
            $gphCnvs_contents.find("#" + element_id).css(text_prop, element_props[text_prop].value);
          });
          master.phasetypes.graphic.element_id = element_id;
          $('#graphic_general_settings').hide();
          graphic_editor_obj.update_element_settings(element_id);

          // Set the new
          setTimeout(() => {
              $gphCnvs_contents.find("#" + element_id).click();
          }, 5);          
        });
      },
      draw_video: function (element_props, element_id) {
        $gphCnvs.ready(function () {
          $gphCnvs_contents.find("body").append("<button class='btn btn-outline-danger video_element graphic_element' id='" +element_id +"'></button>"
            );
          $gphCnvs_contents.find("#" + element_id).html("video: " + element_id);
          $gphCnvs_contents.find("#" + element_id).css("position", position_marker);
          var image_props = ["width", "height", "top", "left", "z-index"];
          image_props.forEach(function (image_prop) {
            $gphCnvs_contents.find("#" + element_id).css(image_prop, element_props[image_prop].value);
          });
          $gphCnvs_contents.find(".graphic_element").removeClass("selected_element");
          $gphCnvs_contents.find("#" + element_id).addClass("selected_element");
          master.phasetypes.graphic.element_id = element_id;
          graphic_editor_obj.update_element_settings(element_id);
        });
      },
    update_timeline: function () {
      console.log("3. Update Timeline");
      // This section is all about working out the maximum duration set

      // Set up the variables to test
      var these_elements = this_trialtype.elements;
      var element_timeline_html = "<table style='width:100%'>";
      var max_value = 0;

      // Check whether a total trial duration already exists
      Object.keys(these_elements).forEach(function (element) {

        // Check 1 - is any "hide" value greater than 0
        if (these_elements[element].hide.value > max_value) {
          max_value = parseFloat(these_elements[element].hide.value);
        } else {
          max_value;
        }

        // Check 2 - is any "show" value greater than 0
        if (these_elements[element].show.value > max_value) {
          max_value = parseFloat(these_elements[element].show.value);
        } else {
          max_value;
        }

        if (these_elements[element].hide.value == "") {
          endless_element = true;
        }
      });

      // Check 3 - is any "hide" value empty, if so extend max_value by 500
      if (max_value == 0 || endless_element) {
        max_value = max_value += 500;
        endless_timeline = true;
      } else {
        endless_timeline = false;
      }   

      // Calculate the timeline marker text values
      var time_step = max_value / 5;
      var time_array = [0];
      var time_html = "<td style='width:20%; display:inline-block; text-align: left;'>0 ms</td>";
      
      if (max_value == 500 && endless_timeline) {
        max_value = 5000;
        border_color_style = "solid black";
        time_html = "<td style='width:100%; display:inline-block; text-align: left;'>0 ms"+
        "<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='currentColor' class='bi bi-infinity' viewBox='0 0 16 16' style='float: right;'>"+
          '<path d="M5.68 5.792 7.345 7.75 5.681 9.708a2.75 2.75 0 1 1 0-3.916ZM8 6.978 6.416 5.113l-.014-.015a3.75 3.75 0 1 0 0 5.304l.014-.015L8 8.522l1.584 1.865.014.015a3.75 3.75 0 1 0 0-5.304l-.014.015L8 6.978Zm.656.772 1.663-1.958a2.75 2.75 0 1 1 0 3.916L8.656 7.75Z"/>'+
        '</svg></td>';
      } else {
        max_value = max_value;
        border_color_style = "dashed blue";
        for (var i = 1; i < 4; i++) {
          time_array.push(time_array[i - 1] + time_step);
          time_html += "<td style='width:20%; display:inline-block; text-align: left;'>" + time_array[i] + "ms</td>";
        }
        time_html += "<td style='width:20%; display:inline-block; text-align: left;'>" + (time_array[3] + time_step) + "ms</td>";
      }

      // Setup the timeline marker axis
      var time_line =
        "<span style='width:20%; height:12px; display:inline-block;"+ 
          "border-left:2px " + border_color_style +";"+
          "border-top:2px " + border_color_style + ";'>"+
        "</span>" +
        "<span style='width:20%; height:12px; display:inline-block;"+
          "border-left:2px " + border_color_style + ";"+
          "border-top:2px " + border_color_style +";'>" +
        "</span>" +
        "<span style='width:20%; height:12px; display:inline-block;"+
          "border-left:2px " + border_color_style + ";"+
          "border-top:2px " + border_color_style + ";'>"+
        "</span>" +
        "<span style='width:20%; height:12px; display:inline-block;"+
          "border-left:2px " + border_color_style + ";"+
          "border-top:2px " + border_color_style + ";'>"+
        "</span>" +
        "<span style='width:20%; height:12px; display:inline-block;"+
          "border-left:2px " + border_color_style + ";"+
          "border-top:2px " + border_color_style + ";'>"+
        "</span>";

      // Draw the tineline marker text and axis
      element_timeline_html +=
        "<tr>" + 
          "<td></td>" +
          time_html +
        "</tr>" +
        "<tr>" +
          "<td></td>" +
          "<td id='hello2'>" +
            time_line +
          "</td>" +
        "</tr>";

      // Setup the required elements one by one
      Object.keys(these_elements).forEach(function (element, element_index) {
        var element_type = these_elements[element].type;
        
        // Set required start by (and check for any required delay)
        if (these_elements[element].delay != null) {
          start_time = these_elements[element].delay.value;
        } else {
          start_time = these_elements[element].show.value;
        }

        //Set start time to 0 unless a value is set or a delay is required
        if (start_time == 0) {
          start_time = 0;
        } else if (start_time == "") {
          start_time = 0;
        } else if (start_time.indexOf("{{") !== -1) {
          start_time = 0;
        } else {
          start_time = start_time;
        }
          
        // Set end time to 0 unless a value is set or a delay is required
        if (these_elements[element].hide.value == 0){
          end_time = max_value;
        } else if (these_elements[element].hide.value == "") {
          end_time = max_value;
        } else if (these_elements[element].hide.value.indexOf("{{") !== -1) {
          end_time = max_value;
        } else {
          end_time = these_elements[element].hide.value;
        }

        if (start_time > max_value) { 
          if (!parent.parent.functionIsRunning) {
            parent.parent.functionIsRunning = true;
            bootbox.alert("The element's start time is beyond the end of the timelime. Your task will still work, even though the timeline below will now look odd",function(){
              parent.parent.functionIsRunning = false;
            })
          }
          end_time = start_time * 2;
          max_value = start_time * 2;
        } else {
          // max_value = end_time;
        }

        pre_show_width = (100 * start_time) / max_value; // Sets the button start indent, if a time is set (as %)
        show_hide_width = (100 * (end_time - start_time)) / max_value; // Sets the button length between the start/end points (as %)
        post_end_width = (100 * (max_value - end_time)) / max_value; // Sets the button end indent, if a time is set (as %)

        // Set the colour of the timeline button based on the element type
        if (element_type == "text") {
          element_class = "info";
        } else if (element_type == "audio") {
          element_class = "secondary";
        } else if (element_type == "image") {
          element_class = "success";
        } else if (element_type == "video") {
          element_class = "danger";
        } else if (element_type == "input") {
          element_class = "dark";
        } else {
          element_class = "";
        }

        element_timeline_html +=
          "<tr style='width:100%'>"+
            "<td style='width:10%' class='text-" + element_class +" timeline_text_indent'>" +
              element +
            "</td>" +
            "<td style='width:90%'>" +
              "<span class='pre_timeline' style=' width:" + pre_show_width +"%'></span>" + 
              "<button id='timeline_" + element_index + "' class='during_timeline btn btn-outline-" + element_class + "' style=' width:" +show_hide_width + "%' value='" + element + "'>" +
                element_type + 
              "</button>" +
              "<span class='post_timeline' style='width:" + show_hide_width + "%'></span>" +
            "</td>"+
          "</tr>";
      });

      $("#element_timelines").html(element_timeline_html);

      // This function manages the clicking of the timeline to activate the element/sidebar options
      $(".during_timeline").click(function () {
        $("#graphic_general_settings").hide();
        $("#graphic_settings").show();
        element_id = this.value;

        // Update the timeline buttons so the clicked button is active
        for (var i = 0; i < $(".during_timeline").length; i++) {
          document.getElementById($(".during_timeline")[i].id).className = document.getElementById($(".during_timeline")[i].id).className.replace("btn-outline-", "btn-");
          document.getElementById($(".during_timeline")[i].id).className = document.getElementById($(".during_timeline")[i].id).className.replace("btn-", "btn-outline-");
        }

        $gphCnvs_contents.find(".graphic_element").removeClass("selected_element");
        $gphCnvs_contents.find("#" + element_id).addClass("selected_element")//.addClass("graphic_element");
        document.getElementById(this.id).className = document .getElementById(this.id).className.replace("btn-outline", "btn");
        graphic_editor_obj.update_element_settings(this.value);
      });
    },
    update_page_settings: function () {
      console.log("4. Update Page Settings");
      if (aspect_ratio == "cstm") {
        $("#trial_width").val(this_trialtype.trial_height);
        $("#trial_height").val(this_trialtype.trial_height);
      } else {
        $("#trial_width").val(this_trialtype.width);
        $("#trial_height").val(this_trialtype.height);
      }
      $("#trial_background_color").val(this_trialtype["background-color"]);
      $("#keyboard_valid_keys").val(this_trialtype.keyboard.valid_keys);
      $("#keyboard_end_press")[0].checked = this_trialtype.keyboard.end_press;
      $("#mouse_visible")[0].checked = this_trialtype.mouse_visible;
    },
    update_element_settings: function (element_id) {
      console.log("5. Update Element Settings");
      var this_settings = this.order_element_settings(this_trialtype.elements[element_id]);
      /* Let's see if this is the first time the phasetype has been displayed and show the page settings if true
       * This is needed because the way the canvas is created causes any placed elements to be treated as active hiding it
      */

      $("#graphic_settings").html("");
  
      // This styles the element header to display name and type icon 
      if(this_settings.content.type == "text") {
        graphic_settings_html = '<h4 id="element_header" class="text-primary"><i class="bi bi-type"></i> '+element_id + '</h4>';
      }  else if(this_settings.content.type == "audio") {
        graphic_settings_html = '<h4 id="element_header" class="text-primary"><i class="bi bi-music-note"></i> '+element_id + '</h4>';
      }  else if(this_settings.content.type == "image") {
        graphic_settings_html = '<h4 id="element_header" class="text-primary"><i class="bi bi-file-image"></i> '+element_id + '</h4>';
      }  else if(this_settings.content.type == "video") {
        graphic_settings_html = '<h4 id="element_header" class="text-primary"><i class="bi bi-film"></i> '+element_id + '</h4>';
      } else {
        graphic_settings_html = '<h4 id="element_header" class="text-primary"><i class="bi bi-input-cursor-text"></i> '+element_id + '</h4>';
      }
  
      // This creates the element options accordion
      graphic_settings_html +=
      '<div class="accordion" id="accordionSettings">'+
        // Accordian Item One
        '<div class="accordion-item">' +
          '<div class="accordion-header" id="headingOne">' +
            '<button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne">' +
              '<h5>Content</h5>' +
            '</button>' +
          '</div>' +
          '<div id="collapseOne" class="accordion-collapse collapse show" aria-labelledby="headingOne" data-bs-parent="#accordionSettings">' +
            '<div class="accordion-body">';
              graphic_settings_html += 
              '<div class="input-group mb-3">'+
                '<input type="text" class="form-control text-primary" id="element_name" style="background-color: #ffffff;" readonly value="' + element_id + '">' +
                '<div class="input-group-append">'+
                  '<button class="btn btn-primary" id="delete_element_btn"><i class="bi bi-trash"></i></button>'+
                '</div>'+
              '</div>';
              if (this_settings.content.html != null) {/* This does nothing and could be delete?*/}
              Object.keys(this_settings.content).forEach(function (main_setting) {
                main_setting = main_setting.toLowerCase();
                if (main_setting === "type") {
                  // Do nothing - this just stops the "type" being listed in the general settings
                } else if (main_setting === "html") {
                  graphic_settings_html +=
                  '<div class="form-group">' +
                    '<textarea class="form-control" id="setting_html" rows="3" placeholder="Html here please">' +
                      this_settings.content.html.value +
                    "</textarea>" +
                  "</div>"
                } else {
                  graphic_settings_html +=
                  '<div class="input-group mb-3">' +
                    '<div class="input-group-prepend">' +
                      '<span class="input-group-text" >' + main_setting + '</span>' +
                    '</div>' +
                    '<input class="form-control" id="setting_' + main_setting + '" value="' + this_settings.content[main_setting].value +'">' +
                  "</div>";
                }
              });
              graphic_settings_html +=
            "</div>" +
          "</div>" +
        "</div>" +
        // Accordian Item Two
          '<div class="accordion-item">' +
              '<div class="accordion-header" id="headingTwo">' +
                '<button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo">' +
                  '<h5>Styling</h5>' +
                '</button>' +
              '</div>' +
              '<div id="collapseTwo" class="accordion-collapse collapse" aria-labelledby="headingTwo" data-bs-parent="#accordionSettings">' +
                '<div class="accordion-body">';
                  Object.keys(this_settings.style).forEach(function (setting) {
                    if (this_settings.style[setting].type == "checkbox") {
                      var setting_details = this_settings.style[setting];
                      switch (setting) {
                        case "controls":
                          var setting_text = "Controls (i.e. play, pause, etc.)";
                          break;
                      }
                      if (setting_details.value) {
                        checked_unchecked = "checked";
                      } else {
                        checked_unchecked = "";
                      }
                      graphic_settings_html +=
                        '<div class="custom-control custom-checkbox">' +
                          '<input type="checkbox" class="custom-control-input" id="setting_' + setting + '" ' + checked_unchecked + ">" +
                          '<label class="custom-control-label" for="setting_' + setting + '">' + setting_text + "</label>" +
                        "</div>";
                    } else if (setting !== "type") {
                      var setting_details = this_settings.style[setting];
                      graphic_settings_html +=
                        '<div class="input-group mb-3">' +
                          '<div class="input-group-prepend">' +
                            '<span class="input-group-text" >' + setting + "</span>" + 
                          "</div>" +
                          '<input id="setting_' + setting + '" type="' + setting_details.type + '" class="form-control" placeholder="" value="' + setting_details.value + '" aria-describedby="basic-addon1">';
                      // if (setting_details.type == "text") {
                      //   graphic_settings_html +=
                      //   '<div class="input-group-append">' +
                      //     '<span class="input-group-text" id="trial_width_unit">' + aspect_units + '</span>'+
                      //   '</div>'+
                      // "</div>";
                      // } else {
                        graphic_settings_html += "</div>";
                      // }
                    }
                  });
                  graphic_settings_html +=
                "</div>" +
              "</div>" +
            "</div>" +
          // Accordian Item Three
          '<div class="accordion-item">' +
            '<div class="accordion-header" id="headingThree">' +
              '<button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseThree" aria-expanded="false" aria-controls="collapseThree">' +
                '<h5>Interactivity</h5>' +
              '</button>' +
            '</div>' +
            '<div id="collapseThree" class="accordion-collapse collapse" aria-labelledby="headingThree" data-bs-parent="#accordionSettings">' +
              '<div class="accordion-body">';
                Object.keys(this_settings.interactivity).forEach(function (setting) {
                    if ((setting == "show") | (setting == "hide")) {
                      //note (ms) below
                      var setting_details = this_settings.interactivity[setting];
                      graphic_settings_html +=
                        '<div class="input-group mb-3">' +
                          '<div class="input-group-prepend">' +
                            '<span class="input-group-text" >' + setting + " (ms)</span>" +
                          "</div>" +
                          '<input id="setting_' + setting + '" type="' + setting_details.type + '" class="form-control" placeholder="" value="' + setting_details.value + '" aria-describedby="basic-addon1">' +
                        "</div>";
                    } else if (this_settings.interactivity[setting].type == "checkbox") {
                      var setting_details = this_settings.interactivity[setting];
                      switch (setting) {
                        case "end_click":
                          var setting_text = "End trial on click?";
                          break;
                      }
                      if (setting_details.value) {
                        var checked_unchecked = "checked";
                      } else {
                        var checked_unchecked = "";
                      }
                      graphic_settings_html +=
                        '<div class="custom-control custom-checkbox">' +
                          '<input type="checkbox" class="custom-control-input" id="setting_' + setting + '" ' + checked_unchecked + ">" + 
                          '<label class="custom-control-label" for="setting_' + setting + '">' + setting_text + "</label>" +
                        "</div>";
                    } else if (setting !== "type") {
                      var setting_details = this_settings.interactivity[setting];
                      graphic_settings_html +=
                        '<div class="input-group mb-3">' +
                          '<div class="input-group-prepend">' +
                            '<span class="input-group-text" >' + setting + "</span>" +
                          "</div>" +
                          '<input id="setting_' + setting + '" type="' + setting_details.type + '" class="form-control" placeholder="" value="' + setting_details.value + '" aria-describedby="basic-addon1">' +
                        "</div>";
                    }
                });
                graphic_settings_html += 
              "</div>" +
            "</div>" +
          "</div>" +
        "</div>";
  
      $("#graphic_settings").html(graphic_settings_html);
  
      $gphCnvs_contents.find(".graphic_element").hover(function () {
        master.phasetypes.graphic.hovered_element = this.id;
        if (this.id !== master.phasetypes.graphic.element_id) {
          $(this).addClass("hovered_element");
        }
      }, function () {
        $(this).removeClass("hovered_element");
        master.phasetypes.graphic.hovered_element = "";
      });

      this.element_content_settings();
      graphic_editor_obj.compile_phasetype_file();
    },
    compile_phasetype_file: function () { // This controls the HTML output for the phasetype file
      console.log("6. Compile PhaseType File");

      trial_height = this_trialtype.height;
      
      var elements = this_trialtype.elements;
  
      //QWERTY
      if (aspect_ratio == "flex") {
        trial_contents_width = "100%"
        trial_contents_height = "100%"
      } else {
        trial_contents_width =  this_trialtype.trial_width + "px";
        trial_contents_height = this_trialtype.trial_height + "px";
      }
      body_width = this_trialtype.width + "px";
      body_height = this_trialtype.height + "px";
      trial_bg_color = this_trialtype["trial_contents_bg-color"];
  
      // ----------------------
      // Set up the CSS styling
      // ----------------------
  
      var this_code = "<html>\n";
      this_code +=
      "<style>\n" +
      "  .update_name:focus {\n" +
      "    border:0;\n" +
      "  }\n" +
      "  #trial_contents {\n" +
      "    position: absolute;\n" +
      "    top:0;\n" +
      "    bottom: 0;\n" +
      "    left: 0;\n" +
      "    right: 0;\n" +
      "    margin:auto;\n" +
      "    width:" + trial_contents_width + ";\n" +
      "    height:" + trial_contents_height + ";\n" +
      "    background-color:" + trial_bg_color + ";\n" +
      "  }\n" +
      "body {\n" +
      "    background-color:" + this_trialtype["background-color"] + ";\n" + 
      "    width:" + body_width + ";\n" + 
      "    height:" + body_height + ";\n" + 
      "\n";
      if (this_trialtype.mouse_visible == false) {
        this_code += "  cursor: none;\n";
      }
      this_code += "}\n";
  
      var relevant_styles = master.phasetypes.graphic.relevant_styles;
      Object.keys(elements).forEach(function (element) {
        this_code += "#" + element + "{\n";
        this_code += "  position:"+position_marker+";\n";
  
        if (
          (elements[element].show.value !== 0) &
          (elements[element].show.value !== "")
        ) {
          this_code += "  display:none;\n";
        }
        var element_props = elements[element];
        relevant_styles.forEach(function (relevant_style) {
          if (element_props[relevant_style] != null) {
            this_code +=
              "  " +
              relevant_style +
              ":" +
              element_props[relevant_style].value +
              ";\n";
          }
        });
        this_code += "}\n";
      });
      this_code += "</style>\n";
  
      // --------------------
      // Set up the HTML code
      // --------------------
  
      // keyboard response
      this_code +=
        "<input type='hidden' id='keyboard_response' name='keyboard_response'/>\n";
  
      // write elements onto page
      this_code += "<div id='trial_contents'>\n";
        Object.keys(elements).forEach(function (element) {
          switch (elements[element].type) {
            case "audio":
              if (elements[element].end_click.value == true) {
                onclick_class = "end_trial ";
              } else {
                onclick_class = "";
              }
              if (elements[element].controls.value) {
                controls_html = "controls ";
              } else {
                controls_html = "";
              }
  
              this_code +=
                "<button id='" + element + "' value='" + elements[element].value.value + "' class='" + onclick_class + elements[element].name.value + " update_name' style='border:0; background-color:transparent'>\n" +
                "  <audio " + controls_html + " style='object-fit: fill; width:100%; height:100%'>\n" + 
                "    <source src='" + elements[element].src.value + "'>\n" +
                "  </audio>\n" +
                "</button>\n";
              break;
            case "image":
              if (elements[element].end_click.value == true) {
                onclick_class = "end_trial ";
              } else {
                onclick_class = "";
              }
              this_code +=
                "<button id='" + element + "' value='" + elements[element].value.value + "' class='" + onclick_class + elements[element].name.value +" update_name' style='border:0; background-color:transparent'>"+
                "  <img style='width:100%;height:100%' src='" + elements[element].src.value +"'>"+
                "</button>\n";
              break;
            case "input":
              this_code +=
                "  " +
                graphic_editor_obj.parse_input(elements[element], element) +
                "\n";
              break;
            case "text":
              if (elements[element].end_click.value == true) {
                onclick_class = "end_trial ";
              } else {
                onclick_class = "";
              }
              this_code +=
                "<button id='" + element + "' value='" + elements[element].value.value + "' class='" + onclick_class + elements[element].name.value + " update_name' style='background-color:transparent'>"+
                "  <span style='width:100%;height:100%'>" +elements[element].html.value + "</span>"+
                "</button>\n";
              break;
            case "video":
              if (elements[element].end_click.value) {
                onclick_class = "end_trial ";
              } else {
                onclick_class = "";
              }
              if (elements[element].controls.value) {
                controls_html = "controls ";
              } else {
                controls_html = "";
              }
  
              this_code +=
                "<button id='" + element + "' value='" + elements[element].value.value + "' class='" + onclick_class + elements[element].name.value + " update_name' style='border:0; background-color:transparent'>\n" +
                "  <video " + controls_html + " style='object-fit: fill; width:100%; height:100%'>\n" + 
                "    <source src='" + elements[element].src.value + "'>\n" +
                "  </video>\n" +
                "</button>\n";
              break;
          }
        });
      this_code += "</div>\n";
  
      // add hidden inputs for all the elements to store any associated values in the data
      var input_names = [];
  
      // Add the name of all the elements into an array
      Object.keys(elements).forEach(function (element) {
        if (elements[element].name != null) {
          if (input_names.indexOf(elements[element].name.value) == -1) {
            input_names.push(elements[element].name.value);
          }
        }
      });
  
      input_names.forEach(function (input_name) {
        this_code += "<input type='hidden' name='" + input_name + "' />\n";
      });
  
      // -----------------------------
      // Setup the required javascript
      // -----------------------------
  
      this_code += "<script>\n";
  
      // this functionality changes the body width and height to the users screen size if the page was created using a 'flex' aspect ratio
      console.log("aspect ratio = "+aspect_ratio)
      if (aspect_ratio == "flex"){
        this_code +=
        '  $("body").css("width",screen.width).css("height",screen.height);\n'
      } else {
        //do nothing
      }
  
      // This manages ending the trial when a user clicks on a required element
      this_code +=
        "$('.update_name').on('click',function(){\n" +
        "  var class_list = this.className.split(' ');\n" +
        "  var end_trial = false;\n" +
        "  if(class_list.indexOf('end_trial') !== -1){\n" +
        "    end_trial = true;\n" +
        "	 }\n" +
        "  class_list.splice(class_list.indexOf('end_trial'),1);\n" +
        "  class_list.splice(class_list.indexOf('update_name'),1);\n" +
        "  $('input[name = \"' + class_list + '\"]').val(this.value);\n" +
        "  if(end_trial){\n" +
        "    Phase.submit();\n" +
        "  }\n" +
        "});\n";
  
      Object.keys(elements).forEach(function (element) {
        this_code += graphic_editor_obj.parse_script(elements[element],element);
      });
  
      if (this_trialtype.keyboard != null) {
        if (this_trialtype.keyboard.valid_keys !== "") {
          if (this_trialtype.keyboard.start == "") {
            this_trialtype.keyboard.start = 0;
          }
          this_code +=
            "$(window).bind('keydown', function(event) {\n" +
            "  switch (String.fromCharCode(event.which).toLowerCase()) {\n";
          var valid_keys = this_trialtype.keyboard.valid_keys;
          for (var i = 0; i < valid_keys.length; i++) {
            this_code += "    case '" + valid_keys[i] + "':\n";
          }
          this_code +=
            '      $("#keyboard_response").val(String.fromCharCode(event.which).toLowerCase());\n';
  
          if (this_trialtype.keyboard.end_press) {
            this_code += "      Phase.submit();\n";
          }
          this_code += "      break;\n" + "  }\n" + "});\n";
        }
      }
      this_code += "</script>\n</html>";
  
      // Add any user Mods to the code
  
      //replace mod.variable_names
      // if (this_trialtype.mods != null) {
      //   Object.keys(this_trialtype.mods).forEach(function (mod) {
      //     var this_mod = this_trialtype.mods[mod];
      //     var mod_html = master.mods[this_mod.type];
  
      //     //replace each of the variables
      //     Object.keys(this_mod.settings).forEach(function (mod_setting) {
      //       mod_html = mod_html.replaceAll(
      //         "{{mod." + mod_setting + "}}",
      //         this_mod.settings[mod_setting]
      //       );
      //     });
      //     this_code += mod_html + "\n";
      //   });
      // }
  
      // Write the final code output into the html object to be saved
      master.phasetypes.user[trialtype] = this_code;
    },

  // Other editor object functions...

  element_content_settings: function () {

    // Content settings
      $("#delete_element_btn").click(function () {
        if (!parent.parent.functionIsRunning) {
          parent.parent.functionIsRunning = true;
          var element_id = $("#element_name").val();
          bootbox.confirm({
            message: "Are you sure you want to delete the element: <b>" + element_id + "</b>?",
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
                      $gphCnvs_contents.find("#" + element_id).remove();
                      // $(".during_timeline[value=" + element_id + "]").remove();
                      // $(".timeline_text_indent[text=" + element_id + "]").remove();
                      $("#element_timelines").find("td:contains('"+element_id+"')").closest('tr').remove();
                      delete this_trialtype.elements[element_id];
                      $("#graphic_settings").html("");
                      $("#graphic_general_settings").show();
                    }
                  }
                });
              }
            }
          });
        }
      });
      $("#element_name").click(function () {
        graphic_editor_obj.rename_element();
      });
      $("#setting_placeholder").on("input change", function () { // Only used for input elements
        var element_id = master.phasetypes.graphic.element_id;
        $gphCnvs_contents.find("#" + element_id).attr("placeholder", $(this).val());
      });

    // Styling Settings
      var relevant_styles = master.phasetypes.graphic.relevant_styles;
      relevant_styles.forEach(function (relevant_style) {
        $("#setting_" + relevant_style).on("input change", function () {
          if (relevant_style == "top" || relevant_style == "left") {
            var new_value = $(this).val().replace("px", "");
            // new_value = new_value +"px";
            var element_id = master.phasetypes.graphic.element_id;
            $gphCnvs_contents.find("#" + element_id).css(relevant_style, new_value);
            graphic_editor_obj.update_trialtype_element(element_id,relevant_style,$(this).val());
            graphic_editor_obj.compile_phasetype_file(element_id);
          } else {
            //input
            var element_id = master.phasetypes.graphic.element_id;
            $gphCnvs_contents.find("#" + element_id).css(relevant_style, $(this).val());
            graphic_editor_obj.update_trialtype_element(element_id,relevant_style,$(this).val());
            graphic_editor_obj.compile_phasetype_file(element_id);
            if (relevant_style == "height") {
              $gphCnvs_contents.find("#" + element_id).css("line-height", $(this).val());
            }
          }
        });
      });

    // Interactivity Settings

    $("#setting_controls").change(function () {
      var element_id = master.phasetypes.graphic.element_id;
      graphic_editor_obj.update_trialtype_element(element_id,"controls",$(this)[0].checked);
      graphic_editor_obj.compile_phasetype_file(element_id);
    });
    $("#setting_delay").focus(function () {
      helperActivate("delay", $(this).val(), "delay");
    });
    $("#setting_end_click").click(function () {
      var element_id = master.phasetypes.graphic.element_id;
      graphic_editor_obj.update_trialtype_element(element_id,"end_click",$(this)[0].checked);
      graphic_editor_obj.compile_phasetype_file(element_id);
    });
    $("#setting_html").on("input change", function () {
      var element_id = master.phasetypes.graphic.element_id;
      $gphCnvs_contents.find("#" + element_id).html($(this).val());
    });
    $("#setting_value").on("input change", function () {
      var element_id = master.phasetypes.graphic.element_id;
      $gphCnvs_contents.find("#" + element_id).val($(this).val());
    });

    var setting_update_values = [
      "delay",
      "end",
      "hide",
      "html",
      "name",
      "src",
      "show",
      "value",
    ];
    setting_update_values.forEach(function (update_value) {
      $("#setting_" + update_value).on("input change", function () {
        var element_id = master.phasetypes.graphic.element_id;
        graphic_editor_obj.update_trialtype_element(element_id,update_value,$(this).val());
        graphic_editor_obj.compile_phasetype_file(element_id);
      });
    });
  },
  create_element: function (element_type) {
    var x_coord = this._mouseX;
    var y_coord = this._mouseY;

    var element_no = Object.keys(this_trialtype.elements).length;

    var element_id = "canvas_element_" + element_no;
    
    var element_props = {
      left: {
        type: "text",
        value: x_coord + "px",
      },
      top: {
        type: "text",
        value: y_coord + "px",
      },
      "z-index": {
        type: "number",
        value: 0,
      },
      show: {
        type: "text",
        value: 0,
      },
      hide: {
        type: "text",
        value: "",
      },
    };

    switch (element_type.toLowerCase()) {
      case "audio":
        element_props.type = "audio";
        element_props.src = {
          type: "text",
          value: "",
        };
        element_props.delay = {
          type: "text",
          value: "0",
        };
        element_props.width = {
          type: "text",
          value: "200px",
        };
        element_props.height = {
          type: "text",
          value: "100px",
        };
        element_props.name = {
          type: "text",
          value: "audio_response",
        };
        element_props.value = {
          type: "text",
          value: "",
        };
        element_props.end_click = {
          type: "checkbox",
          value: false,
        };
        element_props.controls = {
          type: "checkbox",
          value: false,
        };
        this_trialtype.elements[element_id] = element_props;
        this.update_timeline();
        this.draw_audio(element_props, element_id);
        break;

      case "image":
        element_props.type = "image";
        element_props.src = {
          type: "text",
          value: "",
        };
        element_props.width = {
          type: "text",
          value: "200px",
        };
        element_props.height = {
          type: "text",
          value: "200px",
        };
        element_props.name = {
          type: "text",
          value: "image_response",
        };
        element_props.value = {
          type: "text",
          value: "",
        };
        element_props.end_click = {
          type: "checkbox",
          value: false,
        };

        this_trialtype.elements[element_id] = element_props;
        this.update_timeline();
        this.draw_image(element_props, element_id);
        break;
      case "input":
        bootbox.confirm({
          title: "Type of Input?",
          message:
            "<p>What type of input would you like?" +
            "<select class='form-control' id='select_input_type'>" +
            "<option> Button </option>" +
            "<option>  Text  </option>" +
            "</select>" +
            "</p>",
          callback: function (result) {
            if (result) {
              //i.e. not cancel
              var input_type = $("#select_input_type").val();

              //universal input properties
              ////////////////////////////
              element_props.type = "input";
              element_props.color = {
                type: "color",
                value: "#000000",
              };
              element_props["background-color"] = {
                type: "color",
                value: "#ffffff",
              };

              // input type specific properties
              /////////////////////////////////
              switch (input_type.toLowerCase()) {
                case "button":
                  element_props.value = {
                    type: "text",
                    value: element_id + " value",
                  };
                  element_props["font-size"] = {
                    type: "text",
                    value: "12px",
                  };
                  element_props.input_type = {
                    type: "text",
                    value: "button",
                  };
                  element_props["name"] = {
                    type: "text",
                    value: "button_response",
                  };
                  element_props.width = {
                    type: "text",
                    value: "100px",
                  };
                  element_props.height = {
                    type: "text",
                    value: "100px",
                  };
                  element_props["border-style"] = {
                    type: "text",
                    value: "",
                  };
                  element_props["border-width"] = {
                    type: "text",
                    value: "0",
                  };
                  element_props["border-color"] = {
                    type: "color",
                    value: "#ffffff",
                  };
                  element_props["border-radius"] = {
                    type: "text",
                    value: "",
                  };
                  element_props["end_click"] = {
                    type: "checkbox",
                    value: false,
                  };
                  this_trialtype.elements[element_id] = element_props;
                  graphic_editor_obj.update_timeline();
                  graphic_editor_obj.draw_input(element_props, element_id);

                  break;
                case "select":
                  break;
                case "text":
                  element_props.input_type = {
                    type: "text",
                    value: "text",
                  };
                  element_props.width = {
                    type: "text",
                    value: "200px",
                  };
                  element_props.height = {
                    type: "text",
                    value: "50px",
                  };
                  element_props["name"] = {
                    type: "text",
                    value: "--CHANGE ME--",
                  };
                  element_props["placeholder"] = {
                    type: "text",
                    value: "this will disappear when the user starts typing",
                  };
                  element_props["font-size"] = {
                    type: "text",
                    value: "12px",
                  };
                  this_trialtype.elements[element_id] = element_props;
                  graphic_editor_obj.update_timeline();
                  graphic_editor_obj.draw_input(element_props, element_id);
                  break;
              }
            }
          },
        });
        break;
      case "text":
        element_props.type = "text";
        element_props.html = {
          type: "text",
          value: element_id + " html",
        };
        element_props["font-size"] = {
          type: "text",
          value: "20px",
        };
        element_props.color = {
          type: "color",
          value: "#000000",
        };
        // element_props["font-opacity"] = {
        //   type: "text",
        //   value: "1",
        // };
        element_props["background-color"] = {
          type: "color",
          value: "#ffffff",
        };
        element_props.width = {
          type: "text",
          value: "50px",
        };
        element_props.height = {
          type: "text",
          value: "50px",
        };
        element_props["border-style"] = {
          type: "text",
          value: "",
        };
        element_props["border-width"] = {
          type: "text",
          value: "0",
        };
        element_props["border-color"] = {
          type: "color",
          value: "#ffffff",
        };
        element_props["border-radius"] = {
          type: "text",
          value: "",
        };
        element_props.end_click = {
          type: "checkbox",
          value: false,
        };
        element_props.name = {
          type: "text",
          value: "",
        };
        element_props.value = {
          type: "text",
          value: "",
        };
        this_trialtype.elements[element_id] = element_props;
        this.update_timeline();
        this.draw_text(element_props, element_id);
        break;
      case "video":
        element_props.type = "video";
        element_props.src = {
          type: "text",
          value: "",
        };
        element_props.width = {
          type: "text",
          value: "200px",
        };
        element_props.height = {
          type: "text",
          value: "200px",
        };
        element_props.delay = {
          type: "text",
          value: "0",
        };
        element_props.name = {
          type: "text",
          value: "video_response",
        };
        element_props.value = {
          type: "text",
          value: "",
        };
        element_props.end_click = {
          type: "checkbox",
          value: false,
        };
        element_props.controls = {
          type: "checkbox",
          value: false,
        };
        this_trialtype.elements[element_id] = element_props;
        this.update_timeline();
        this.draw_video(element_props, element_id);
        break;
    }
    $(".during_timeline[value=" + element_id + "]").click();
  },
  // graphic_warning: function () {
  //   bootbox.alert(
  //     "For graphic trialtypes you cannot edit the code directly. If you want to insert code into the trialtype, you can do this by either including a <b>mod</b>, or by copying the whole text (select all and then right click with your mouse to copy) into a new trialtype which you create using the <b>code</b> rather than <b>graphic</b> editor."
  //   );
  // },
  order_element_settings: function (this_settings) {
    ordered_settings = {
      content: {},
      style: {},
      interactivity: {},
    };
    switch (this_settings.type.toLowerCase()) {
      case "audio":
        //main
        ordered_settings.content.src = this_settings.src;
        ordered_settings.content.type = "audio";

        // style
        ordered_settings.style["controls"] = this_settings["controls"];
        ordered_settings.style["top"] = this_settings["top"];
        ordered_settings.style["left"] = this_settings["left"];
        ordered_settings.style["height"] = this_settings["height"];
        ordered_settings.style["width"] = this_settings["width"];
        ordered_settings.style["z-index"] = this_settings["z-index"];

        // javascript
        ordered_settings.interactivity.delay = this_settings.delay;
        ordered_settings.interactivity.show = this_settings.show;
        ordered_settings.interactivity.hide = this_settings.hide;
        ordered_settings.interactivity.name = this_settings.name;
        ordered_settings.interactivity.value = this_settings.value;
        ordered_settings.interactivity.end_click = this_settings.end_click;
        break;
      case "image":
        //main
        ordered_settings.content.src = this_settings.src;
        ordered_settings.content.type = "image";

        // style
        ordered_settings.style["top"] = this_settings["top"];
        ordered_settings.style["left"] = this_settings["left"];
        ordered_settings.style["height"] = this_settings["height"];
        ordered_settings.style["width"] = this_settings["width"];
        ordered_settings.style["z-index"] = this_settings["z-index"];

        // javascript
        ordered_settings.interactivity.show = this_settings.show;
        ordered_settings.interactivity.hide = this_settings.hide;
        ordered_settings.interactivity.name = this_settings.name;
        ordered_settings.interactivity.value = this_settings.value;
        ordered_settings.interactivity.end_click = this_settings.end_click;
        break;
      case "input":
        if (this_settings.input_type.value == "button") {
          //main
          ordered_settings.content.value = this_settings.value;
          ordered_settings.content.type = "input";

          // style
          ordered_settings.style["top"] = this_settings["top"];
          ordered_settings.style["left"] = this_settings["left"];
          ordered_settings.style["color"] = this_settings["color"];
          ordered_settings.style["background-color"] = this_settings["background-color"];
          ordered_settings.style["height"] = this_settings["height"];
          ordered_settings.style["width"] = this_settings["width"];
          ordered_settings.style["border-color"] = this_settings["border-color"];
          ordered_settings.style["border-style"] = this_settings["border-style"];
          ordered_settings.style["border-radius"] = this_settings["border-radius"];
          ordered_settings.style["font-size"] = this_settings["font-size"];
          ordered_settings.style["z-index"] = this_settings["z-index"];

          // javascript
          ordered_settings.interactivity.show = this_settings.show;
          ordered_settings.interactivity.hide = this_settings.hide;
          ordered_settings.interactivity.name = this_settings.name;
          ordered_settings.interactivity.value = this_settings.value;
          ordered_settings.interactivity.end_click = this_settings.end_click;
        } else if (this_settings.input_type.value == "text") {
          //main
          ordered_settings.content.placeholder = this_settings.placeholder;
          ordered_settings.content.type = "input";

          // style
          ordered_settings.style["top"] = this_settings["top"];
          ordered_settings.style["left"] = this_settings["left"];
          ordered_settings.style["color"] = this_settings["color"];
          ordered_settings.style["background-color"] = this_settings["background-color"];
          ordered_settings.style["height"] = this_settings["height"];
          ordered_settings.style["width"] = this_settings["width"];
          ordered_settings.style["font-size"] = this_settings["font-size"];
          ordered_settings.style["z-index"] = this_settings["z-index"];

          // javascript
          ordered_settings.interactivity.show = this_settings.show;
          ordered_settings.interactivity.hide = this_settings.hide;
          ordered_settings.interactivity.name = this_settings.name;
        }

        break;
      case "text":
        // main
        ordered_settings.content.html = this_settings.html;
        ordered_settings.content.type = "text";

        // style
        ordered_settings.style["font-size"] = this_settings["font-size"];
        ordered_settings.style["top"] = this_settings["top"];
        ordered_settings.style["left"] = this_settings["left"];
        ordered_settings.style["color"] = this_settings["color"];
        // ordered_settings.style["font-opacity"] = this_settings["font-opacity"];
        ordered_settings.style["background-color"] = this_settings["background-color"];
        ordered_settings.style["height"] = this_settings["height"];
        ordered_settings.style["width"] = this_settings["width"];
        ordered_settings.style["border-width"] = this_settings["border-width"];
        ordered_settings.style["border-style"] = this_settings["border-style"];
        ordered_settings.style["border-color"] = this_settings["border-color"];
        ordered_settings.style["border-radius"] = this_settings["border-radius"];
        ordered_settings.style["z-index"] = this_settings["z-index"];

        // javascript
        ordered_settings.interactivity.show = this_settings.show;
        ordered_settings.interactivity.hide = this_settings.hide;
        ordered_settings.interactivity.name = this_settings.name;
        ordered_settings.interactivity.value = this_settings.value;
        ordered_settings.interactivity.end_click = this_settings.end_click;
        break;
      case "video":
        //main
        ordered_settings.content.src = this_settings.src;
        ordered_settings.content.type = "video";

        // style
        ordered_settings.style["controls"] = this_settings["controls"];
        ordered_settings.style["top"] = this_settings["top"];
        ordered_settings.style["left"] = this_settings["left"];
        ordered_settings.style["height"] = this_settings["height"];
        ordered_settings.style["width"] = this_settings["width"];
        ordered_settings.style["z-index"] = this_settings["z-index"];

        // javascript
        ordered_settings.interactivity.delay = this_settings.delay;
        ordered_settings.interactivity.show = this_settings.show;
        ordered_settings.interactivity.hide = this_settings.hide;
        ordered_settings.interactivity.name = this_settings.name;
        ordered_settings.interactivity.value = this_settings.value;
        ordered_settings.interactivity.end_click = this_settings.end_click;
        break;
    }

    return ordered_settings;
  },
  parse_input: function (element_info, element_id) {
    switch (element_info.input_type.value.toLowerCase()) {
      case "button":
        if (element_info.end_click.value == true) {
          onclick_class = "end_trial ";
        } else {
          onclick_class = "";
        }
        return ("<input id='" + element_id + "' class='" + onclick_class + element_info.name.value + " update_name' type='button' value='" + element_info.value.value + "' />");
        // break;
      case "text":
        return ("<input id='" + element_id + "' class='" + element_info.name.value + " update_name' type='text'/>" );
    }
  },
  parse_script: function (element_info, element_id) {
    set_timer_comment =
      "//Phase.set_timer is a Collector function required because of buffering (which prevents the use of setTimeout)";

    //show and hide
    var new_code = "";
    if ((element_info.show.value !== 0) & (element_info.show.value !== "")) {
      new_code +=
        "Phase.set_timer(function(){$('#" + element_id + "').show()},'" + element_info.show.value + "'); " + set_timer_comment + " \n";
    }
    if ((element_info.hide.value !== 0) & (element_info.hide.value !== "")) {
      new_code +=
        "Phase.set_timer(function(){$('#" + element_id + "').hide()},'" + element_info.hide.value + "'); " + set_timer_comment + " \n";
    }
    if (element_info.delay != null && element_info.delay.value !== "-1") {
      //assuming this element is a video that needs to start automatically after xxx ms
      new_code +=
        "Phase.set_timer(function(){$('#" + element_id + "').find('" + element_info.type + "')[0].play()},'" + element_info.delay.value + "');" + set_timer_comment + "\n";
    }
    return new_code;
  },
  rename_element: function () {
    bootbox.prompt(
      "What would you like to rename the <b>element</b> to?",
      function (new_name) {
        if ((new_name == "trial_contents") || (new_name == "keyboard_response")) {
          bootbox.alert("<b> " + new_name + " </b> is a protected element name - please chose a different name");
        } else if (new_name != null) {
          var elements = this_trialtype.elements;
          var old_header_html = $("#element_header").html();
          var old_header_text = $("#element_header").text();
          if (elements[new_name] == null) {
            var old_element_name = master.phasetypes.graphic.element_id;
            elements[new_name] = JSON.parse(JSON.stringify(elements[old_element_name]));
            delete elements[old_element_name];
            master.phasetypes.graphic.element_id = new_name;
            $("#element_name").val(new_name);
            $gphCnvs_contents.find("#" + old_element_name).attr("id", new_name);
            switch (elements[new_name].type) {
              case "audio":
              case "image":
                $gphCnvs_contents.find("#" + new_name).html(new_name);
                break;
              case "video":
                $gphCnvs_contents.find("#" + new_name).html(elements[new_name].type + " : " + new_name);
                break;
            }
            graphic_editor_obj.compile_phasetype_file();
            graphic_editor_obj.update_timeline();
            var new_header_text = old_header_html.replace(old_header_text,new_name);
            $("#element_header").html(new_header_text);
          } else {
            bootbox.alert("This element name already exists - please choose a unique one", function(){
              graphic_editor_obj.rename_element();
            });
          }
        }
      }
    );
  },
  update_trialtype_element: function (element_id, prop, value) {
    if (value == null || value == 0) {
      value = 0;
    } else {
      value = value;
    }
    this_trialtype.elements[element_id][prop].value = value;
    graphic_editor_obj.update_timeline();
    // graphic_editor_obj.update_element_settings();
  },
};
// #endregion

loading_scripts("Graphic.js");
