doc = document.getElementById("graphic_canvas").contentWindow.document;
doc.open();
doc.write(
  "<li" +
    'nk rel="stylesheet" href="libraries/bootstrapCollector.css">' +
    "<scr" +
    'ipt src="libraries/jquery.min.js"></sc' +
    "ript>" +
    "<scr" +
    'ipt src="libraries/popper.min.js"></scr' +
    "ipt>" +
    "<scr" +
    'ipt src="libraries/bootstrap.min.js"></scr' +
    "ipt>" +
    "<style>" +
    ".selected_element{" +
    "font-weight:bold;" +
    "}" +
    ".btn{" +
    "white-space:normal !important;" +
    "word-wrap: break-word;" +
    "}" +
    "</style>" +
    "<sc" +
    "ript>" +
    //CTRL-S
    "$(window).bind('keydown', function(event) {" +
    "	if (event.ctrlKey || event.metaKey) {" +
    "		switch (String.fromCharCode(event.which).toLowerCase()) {" +
    "			case 's':" +
    "				event.preventDefault();" +
    "				parent.$('#save_btn').click();" +
    "			break;" +
    "		}" +
    "	}" +
    "});" +
    "</scr" +
    "ipt>"
);
doc.close();

//actions
/////////

// actions by class
///////////////////
$(".canvas_btn").on("click", function () {
  $(".canvas_btn").removeClass("btn-primary");
  $(".canvas_btn").addClass("btn-outline-primary");
  $(this).removeClass("btn-outline-primary");
  $(this).addClass("btn-primary");
});

$(".keyboard_setting").on("input change", function () {
  //only for valid keys at the moment though.
  var trialtype = master.phasetypes.file;
  var this_trialtype = master.phasetypes.graphic.files[trialtype];
  var keyboard_prop = this.id.replace("keyboard_", "");
  this_trialtype.keyboard[keyboard_prop] = this.value;
  graphic_editor_obj.compile_graphics();
});

// by element
/////////////

$("#add_mod_btn").on("click", function () {
  bootbox.prompt("What would you like to call this mod?", function (mod) {
    // add mod to the trialtype in graphic part
    var trialtype = master.phasetypes.file;
    var this_trialtype = master.phasetypes.graphic.files[trialtype];
    if (typeof this_trialtype.mods == "undefined") {
      this_trialtype.mods = {};
    }
    if (typeof this_trialtype.mods[mod] !== "undefined") {
      bootbox.alert(
        "The name <b>" +
          mod +
          "</b> already exists. Please come up with a unique name for this mod."
      );
    } else {
      this_trialtype.mods[mod] = {
        type: "",
        settings: {},
      };
      var index = $("#trial_mod_settings").find(".setting_header").length;
      new_card_html =
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
        '<select class="form-control select_mod" id="mod_select_' +
        mod +
        '">' +
        "<option>--select mod--</option>";
      Object.keys(master.mods).forEach(function (mod_type) {
        new_card_html +=
          '<option title="' + mod + '">' + mod_type + "</option>";
      });
      new_card_html += "</select>" + "</div>" + "</div>";
      $("#trial_mod_settings").append(new_card_html);

      $(".select_mod").off();
      select_mod_on();
    }
  });
});

$("#element_timeline_btn").on("click", function () {
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
$("#graphic_canvas")
  .contents()
  .on("click", function () {
    //make sure that the ace editor isn't blocking the view
    var helper_width = parseFloat(
      $("#help_content").css("width").replace("px", "")
    );
    var graphic_width = parseFloat(
      $("#graphic_settings").css("width").replace("px", "")
    );
    var max_width = Math.max(helper_width, graphic_width);
    $("#ace_div").animate(
      {
        width: window.innerWidth - max_width,
      },
      500,
      function () {
        editor.resize();
      }
    );

    var element_type = $(".canvas_btn.btn-primary").val();

    if (typeof element_type !== "undefined" && element_type !== "Click") {
      graphic_editor_obj.create_element(element_type);
      $("#canvas_click_btn").click();
    } else {
      if (
        typeof master.phasetypes.graphic.hovered_element !== "undefined" &&
        master.phasetypes.graphic.hovered_element !== ""
      ) {
        var element_id = master.phasetypes.graphic.hovered_element;
        var trialtype = master.phasetypes.file;

        $("#graphic_canvas")
          .contents()
          .find(".graphic_element")
          .removeClass("selected_element");
        $("#graphic_canvas")
          .contents()
          .find("#" + element_id)
          .addClass("selected_element");
        $("#graphic_canvas")
          .contents()
          .find("#" + element_id)
          .removeClass("hovered_element");

        master.phasetypes.graphic.element_id = element_id;
        graphic_editor_obj.update_settings(element_id);
        //click on the timeline button with the relevant value

        $(".during_timeline[value=" + element_id + "]").click();
      } else {
        $("#graphic_canvas")
          .contents()
          .find(".graphic_element")
          .removeClass("selected_element");
        $("#graphic_settings").html("");
        $("#graphic_general_settings").show();

        for (var i = 0; i < $(".during_timeline").length; i++) {
          document.getElementById($(".during_timeline")[i].id).className =
            document
              .getElementById($(".during_timeline")[i].id)
              .className.replace("btn-outline-", "btn-");
          document.getElementById($(".during_timeline")[i].id).className =
            document
              .getElementById($(".during_timeline")[i].id)
              .className.replace("btn-", "btn-outline-");
        }
      }
    }
  });
$("#graphic_canvas")
  .contents()
  .mousemove(function (event) {
    graphic_editor_obj._mouseX = event.clientX;
    graphic_editor_obj._mouseY = event.clientY;
  });
$("#keyboard_end_press").on("change input", function () {
  var trialtype = master.phasetypes.file;
  var this_trialtype = master.phasetypes.graphic.files[trialtype];
  var keyboard_element = $("#keyboard_variable").val();
  this_trialtype.keyboard.end_press = $(this)[0].checked;
  graphic_editor_obj.compile_graphics();
});
$("#keyboard_valid_keys").on("click", function () {
  helperActivate("Keyboard", $(this).val(), "keyboard");
});
$("#keyboard_variable").on("click", function () {
  bootbox.prompt(
    "What would you like to rename this keyboard response to?",
    function (new_name) {
      if (new_name) {
        //i.e. not cancel
        var trialtype = master.phasetypes.file;
        var this_trialtype = master.phasetypes.graphic.files[trialtype];
        var old_name = $("#keyboard_variable").val();
        if (typeof this_trialtype.keyboard[new_name] == "undefined") {
          this_trialtype.keyboard[new_name] =
            this_trialtype.keyboard[old_name];
          delete this_trialtype.keyboard[old_name];
          $("#keyboard_variable").val(new_name);
          graphic_editor_obj.compile_graphics();
        }
      }
    }
  );
});
$("#mouse_visible").on("change", function () {
  var trialtype = master.phasetypes.file;
  master.phasetypes.graphic.files[trialtype]["mouse_visible"] =
    $(this)[0].checked;
  graphic_editor_obj.compile_graphics();
});
$("#trial_background_color").on("input change", function () {
  $("#graphic_canvas")
    .contents()
    .find("body")
    .css("background-color", $(this).val());
  var trialtype = master.phasetypes.file;
  master.phasetypes.graphic.files[trialtype]["background-color"] =
    $(this).val();
  graphic_editor_obj.compile_graphics();
});
$("#trial_height").on("input change", function () {
  $("#graphic_canvas").css("height", $(this).val());
  var trialtype = master.phasetypes.file;
  master.phasetypes.graphic.files[trialtype].height = $(this).val();
  graphic_editor_obj.compile_graphics();
});
$("#trial_width").on("input change", function () {
  $("#graphic_canvas").css("width", $(this).val());
  var trialtype = master.phasetypes.file;
  master.phasetypes.graphic.files[trialtype].width = $(this).val();
  graphic_editor_obj.compile_graphics();
});

// mod
////////

function load_code_mods() {
  // deal with list of mods here - can be an array in graphics and then this array when compiled adds the mods at the bottom of the script
  var trialtype = master.phasetypes.file;
  var this_trialtype = master.phasetypes.graphic.files[trialtype];
  if (typeof this_trialtype.mods == "undefined") {
    this_trialtype.mods = {};
  }
  //if mods exist, list them
  $("#mod_div").html("");
  current_mods_html = '<div class="accordion" id="trial_mod_settings">';

  Object.keys(this_trialtype.mods).forEach(function (mod, index) {
    current_mods_html +=
      '<div class="card">' +
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
      if (
        typeof this_trialtype.mods[mod].settings[mod_setting] !== "undefined"
      ) {
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
        var selected =
          mod_type == this_trialtype.mods[mod].type ? "selected" : "";
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
    graphic_editor_obj.compile_graphics();
  });
  select_mod_on();
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
          var trialtype = master.phasetypes.file;
          var this_trialtype = master.phasetypes.graphic.files[trialtype];
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

    var trialtype = master.phasetypes.file;
    var this_trialtype = master.phasetypes.graphic.files[trialtype];

    var mod = this.id.replace("mod_select_", "");

    this_trialtype.mods[mod].type = $(this).val();
    mod_variables.forEach(function (mod_variable) {
      if (
        typeof this_trialtype.mods[mod].settings[mod_variable] !== "undefined"
      ) {
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
      graphic_editor_obj.compile_graphics();
    });
  });
}

function list_graphics() {
  if (typeof master.phasetypes.graphic == "undefined") {
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
    "top",
    "width",
    "z-index",
  ];
}

graphic_editor_obj = {
  activate_settings: function () {
    //in alphabetical order
    ///////////////////////

    $("#delete_element_btn").on("click", function () {
      bootbox.confirm(
        "Are you sure you want to delete this element?",
        function (result) {
          if (result) {
            var element_id = $("#element_name").val();
            var trialtype = master.phasetypes.file;
            $("#graphic_canvas")
              .contents()
              .find("#" + element_id)
              .remove();
            delete master.phasetypes.graphic.files[trialtype].elements[
              element_id
            ];
            $("#graphic_settings").html("");
            $("#graphic_general_settings").show();
          }
        }
      );
    });

    $("#element_name").on("click", function () {
      graphic_editor_obj.rename_element();
    });

    $("#graphic_canvas")
      .contents()
      .find(".graphic_element")
      .hover(
        function () {
          master.phasetypes.graphic.hovered_element = this.id;
          if (this.id !== master.phasetypes.graphic.element_id) {
            $(this).addClass("hovered_element");
          }
        },
        function () {
          $(this).removeClass("hovered_element");
          master.phasetypes.graphic.hovered_element = "";
        }
      );

    // update relevant styles
    /////////////////////////

    var relevant_styles = master.phasetypes.graphic.relevant_styles;
    relevant_styles.forEach(function (relevant_style) {
      $("#setting_" + relevant_style).on("input change", function () {
        //input
        var element_id = master.phasetypes.graphic.element_id;
        $("#graphic_canvas")
          .contents()
          .find("#" + element_id)
          .css(relevant_style, $(this).val());
        graphic_editor_obj.update_trialtype_element(
          element_id,
          relevant_style,
          $(this).val()
        );
        if (relevant_style == "height") {
          $("#graphic_canvas")
            .contents()
            .find("#" + element_id)
            .css("line-height", $(this).val());
        }
      });
    });

    // update other settings
    ////////////////////////

    $("#setting_controls").on("change", function () {
      var element_id = master.phasetypes.graphic.element_id;
      graphic_editor_obj.update_trialtype_element(
        element_id,
        "controls",
        $(this)[0].checked
      );
    });

    $("#setting_delay").on("focus", function () {
      helperActivate("delay", $(this).val(), "delay");
    });

    $("#setting_end_click").on("click", function () {
      var element_id = master.phasetypes.graphic.element_id;
      graphic_editor_obj.update_trialtype_element(
        element_id,
        "end_click",
        $(this)[0].checked
      );
    });
    $("#setting_html").on("input change", function () {
      var element_id = master.phasetypes.graphic.element_id;
      $("#graphic_canvas")
        .contents()
        .find("#" + element_id)
        .html($(this).val());
    });
    $("#setting_placeholder").on("input change", function () {
      var element_id = master.phasetypes.graphic.element_id;
      $("#graphic_canvas")
        .contents()
        .find("#" + element_id)
        .attr("placeholder", $(this).val());
    });
    $("#setting_value").on("input change", function () {
      var element_id = master.phasetypes.graphic.element_id;
      $("#graphic_canvas")
        .contents()
        .find("#" + element_id)
        .val($(this).val());
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
        graphic_editor_obj.update_trialtype_element(
          element_id,
          update_value,
          $(this).val()
        );
      });
    });
  },
  clean_canvas: function (new_canvas_code) {
    $("#element_timelines").html("");
    $("#graphic_canvas").contents().find(".graphic_element").remove();
    var $iframe = $("#graphic_canvas");
    $iframe.ready(function () {
      //reset general settings
      $("#graphic_settings").html("");
      $("#trial_width").val("600");
      $("#graphic_canvas").css("width", "600");
      $("#trial_height").val("600");
      $("#graphic_canvas").css("height", "600");
      $("#trial_background_color").val("white");
      $("#graphic_canvas")
        .contents()
        .find("body")
        .css("background-color", "white");
      $("#graphic_general_settings").show();
      if (new_canvas_code) {
        //i.e. skip if null
        new_canvas_code();
      }
    });
  },
  compile_graphics: function () {
    var trialtype = master.phasetypes.file;
    var this_trialtype = master.phasetypes.graphic.files[trialtype];
    var elements = this_trialtype.elements;

    // css
    //////

    var this_code = "<style>\n";
    this_code +=
      ".update_name:focus{\n" +
      "  border:0;\n" +
      "}\n" +
      "#trial_contents{\n" +
      "  position: absolute;\n" +
      "  top:0;\n" +
      "  bottom: 0;\n" +
      "  left: 0;\n" +
      "  right: 0;\n" +
      "  margin:auto;\n" +
      "  width:" +
      this_trialtype.width +
      ";\n" +
      "  height:" +
      this_trialtype.height +
      ";\n" +
      "}\n" +
      "body{\n" +
      "  background-color:" +
      this_trialtype["background-color"] +
      ";\n";
    if (this_trialtype.mouse_visible == false) {
      this_code += "  cursor: none;\n";
    }
    this_code += "}\n";

    var relevant_styles = master.phasetypes.graphic.relevant_styles;
    Object.keys(elements).forEach(function (element) {
      this_code += "#" + element + "{\n";
      this_code += "  position:absolute;\n";
      if (
        (elements[element].show.value !== 0) &
        (elements[element].show.value !== "")
      ) {
        this_code += "  display:none;\n";
      }
      var element_props = elements[element];
      relevant_styles.forEach(function (relevant_style) {
        if (typeof element_props[relevant_style] !== "undefined") {
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

    // html
    ///////

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
            "  <button id='" +
            element +
            "' value='" +
            elements[element].value.value +
            "' class='" +
            onclick_class +
            elements[element].name.value +
            " update_name' style='border:0; background-color:transparent'>\n" +
            "    <audio " +
            controls_html +
            " style='object-fit: fill; width:100%; height:100%'>\n" +
            "      <source src='" +
            elements[element].src.value +
            "'>\n" +
            "    </audio>\n" +
            "  </button>\n";
          break;
        case "image":
          if (elements[element].end_click.value == true) {
            onclick_class = "end_trial ";
          } else {
            onclick_class = "";
          }
          this_code +=
            "  <button id='" +
            element +
            "' value='" +
            elements[element].value.value +
            "' class='" +
            onclick_class +
            elements[element].name.value +
            " update_name' style='border:0; background-color:transparent'><img style='width:100%;height:100%' src='" +
            elements[element].src.value +
            "'></button>\n";
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
            "  <button id='" +
            element +
            "' value='" +
            elements[element].value.value +
            "' class='" +
            onclick_class +
            elements[element].name.value +
            " update_name' style='border:0; background-color:transparent'><span style='width:100%;height:100%'>" +
            elements[element].html.value +
            "</span></button>\n";
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
            "  <button id='" +
            element +
            "' value='" +
            elements[element].value.value +
            "' class='" +
            onclick_class +
            elements[element].name.value +
            " update_name' style='border:0; background-color:transparent'>\n" +
            "    <video " +
            controls_html +
            " style='object-fit: fill; width:100%; height:100%'>\n" +
            "      <source src='" +
            elements[element].src.value +
            "'>\n" +
            "    </video>\n" +
            "  </button>\n";
          break;
      }
    });
    this_code += "</div>\n";

    // add hidden inputs for each name
    //////////////////////////////////
    var input_names = [];
    Object.keys(elements).forEach(function (element) {
      if (typeof elements[element].name !== "undefined") {
        if (input_names.indexOf(elements[element].name.value) == -1) {
          input_names.push(elements[element].name.value);
        }
      }
    });

    input_names.forEach(function (input_name) {
      this_code += "<input type='hidden' name='" + input_name + "' />\n";
    });

    ////////////////
    // javascript //
    ////////////////
    this_code += "<sc" + "ript>\n";

    // update name and end_trial function
    /////////////////////////////////////
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
      this_code += graphic_editor_obj.parse_script(
        elements[element],
        element
      );
    });

    if (typeof this_trialtype.keyboard !== "undefined") {
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
    this_code += "</sc" + "ript>\n";

    // mods
    /////////

    //replace mod.variable_names
    if (typeof this_trialtype.mods !== "undefined") {
      Object.keys(this_trialtype.mods).forEach(function (mod) {
        var this_mod = this_trialtype.mods[mod];
        var mod_html = master.mods[this_mod.type];

        //replace each of the variables
        Object.keys(this_mod.settings).forEach(function (mod_setting) {
          console.dir(mod_setting);
          mod_html = mod_html.replaceAll(
            "{{mod." + mod_setting + "}}",
            this_mod.settings[mod_setting]
          );
        });
        this_code += mod_html + "\n";
      });
    }

    // add code to Ace editor and update the user_code
    ///////////////////////////////////////////////////////
    editor.setValue(this_code);
    master.phasetypes.user[trialtype] = this_code;
  },
  create_element: function (element_type) {
    var x_coord = this._mouseX;
    var y_coord = this._mouseY;

    var trialtype = master.phasetypes.file;
    var element_no = Object.keys(
      master.phasetypes.graphic.files[trialtype].elements
    ).length;

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
        master.phasetypes.graphic.files[trialtype].elements[element_id] =
          element_props;
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

        master.phasetypes.graphic.files[trialtype].elements[element_id] =
          element_props;
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
                type: "text",
                value: "black",
              };
              element_props["background-color"] = {
                type: "text",
                value: "transparent",
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
                    value: "",
                  };
                  element_props["border-color"] = {
                    type: "text",
                    value: "",
                  };
                  element_props["border-radius"] = {
                    type: "text",
                    value: "",
                  };
                  element_props["end_click"] = {
                    type: "checkbox",
                    value: false,
                  };
                  master.phasetypes.graphic.files[trialtype].elements[
                    element_id
                  ] = element_props;
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
                  master.phasetypes.graphic.files[trialtype].elements[
                    element_id
                  ] = element_props;
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
          type: "text",
          value: "black",
        };
        element_props["background-color"] = {
          type: "text",
          value: "transparent",
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
          value: "",
        };
        element_props["border-color"] = {
          type: "text",
          value: "",
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
        master.phasetypes.graphic.files[trialtype].elements[element_id] =
          element_props;
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
        master.phasetypes.graphic.files[trialtype].elements[element_id] =
          element_props;
        this.update_timeline();
        this.draw_video(element_props, element_id);
        break;
    }
  },
  draw_audio: function (element_props, element_id) {
    var $iframe = $("#graphic_canvas");
    $iframe.ready(function () {
      $iframe
        .contents()
        .find("body")
        .append(
          "<button class='btn btn-outline-secondary audio_element graphic_element' id='" +
            element_id +
            "'></button>"
        );
      $("#graphic_canvas")
        .contents()
        .find("#" + element_id)
        .html(element_id);
      $("#graphic_canvas")
        .contents()
        .find("#" + element_id)
        .css("position", "absolute");
      var image_props = ["width", "height", "top", "left", "z-index"];
      image_props.forEach(function (image_prop) {
        $("#graphic_canvas")
          .contents()
          .find("#" + element_id)
          .css(image_prop, element_props[image_prop].value);
      });
      $("#graphic_canvas")
        .contents()
        .find(".graphic_element")
        .removeClass("selected_element");
      $("#graphic_canvas")
        .contents()
        .find("#" + element_id)
        .addClass("selected_element");
      var trialtype = master.phasetypes.file;
      master.phasetypes.graphic.element_id = element_id;
      graphic_editor_obj.update_settings(element_id);
    });
  },
  draw_image: function (element_props, element_id) {
    var $iframe = $("#graphic_canvas");
    $iframe.ready(function () {
      $iframe
        .contents()
        .find("body")
        .append(
          "<button class='btn btn-outline-success image_element graphic_element' id='" +
            element_id +
            "'></button>"
        );
      $("#graphic_canvas")
        .contents()
        .find("#" + element_id)
        .html(element_id);
      $("#graphic_canvas")
        .contents()
        .find("#" + element_id)
        .css("position", "absolute");
      var image_props = ["width", "height", "top", "left", "z-index"];
      image_props.forEach(function (image_prop) {
        $("#graphic_canvas")
          .contents()
          .find("#" + element_id)
          .css(image_prop, element_props[image_prop].value);
      });
      $("#graphic_canvas")
        .contents()
        .find(".graphic_element")
        .removeClass("selected_element");
      $("#graphic_canvas")
        .contents()
        .find("#" + element_id)
        .addClass("selected_element");
      var trialtype = master.phasetypes.file;
      master.phasetypes.graphic.element_id = element_id;
      graphic_editor_obj.update_settings(element_id);
    });
  },
  draw_input: function (element_props, element_id) {
    var type = element_props.input_type.value;
    var $iframe = $("#graphic_canvas");
    $iframe.ready(function () {
      switch (type.toLowerCase()) {
        case "button":
          input_html =
            "<input type='button' class='btn btn-outline-dark graphic_element' id='" +
            element_id +
            "'>";
          break;
        case "text":
          input_html =
            "<input type='text' placeholder='" +
            element_props.placeholder.value +
            "' class='form-control graphic_element' id='" +
            element_id +
            "'>";
          break;
      }
      $iframe.contents().find("body").append(input_html);
      if (typeof element_props.value !== "undefined") {
        $("#graphic_canvas")
          .contents()
          .find("#" + element_id)
          .val(element_props.value.value);
      }
      $("#graphic_canvas")
        .contents()
        .find("#" + element_id)
        .css("position", "absolute");
      var image_props = ["width", "height", "top", "left", "z-index"];
      image_props.forEach(function (image_prop) {
        $("#graphic_canvas")
          .contents()
          .find("#" + element_id)
          .css(image_prop, element_props[image_prop].value);
      });
      $("#graphic_canvas")
        .contents()
        .find(".graphic_element")
        .removeClass("selected_element");
      $("#graphic_canvas")
        .contents()
        .find("#" + element_id)
        .addClass("selected_element");
      var trialtype = master.phasetypes.file;
      master.phasetypes.graphic.element_id = element_id;
      graphic_editor_obj.update_settings(element_id);
    });
  },
  draw_text: function (element_props, element_id) {
    var $iframe = $("#graphic_canvas");
    $iframe.ready(function () {
      $iframe
        .contents()
        .find("body")
        .append(
          "<span class='text_element graphic_element' id='" +
            element_id +
            "'></span>"
        );
      $("#graphic_canvas")
        .contents()
        .find("#" + element_id)
        .html(element_props.html.value);
      $("#graphic_canvas")
        .contents()
        .find("#" + element_id)
        .css("position", "absolute");
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
        $("#graphic_canvas")
          .contents()
          .find("#" + element_id)
          .css(text_prop, element_props[text_prop].value);
      });
      $("#graphic_canvas")
        .contents()
        .find(".graphic_element")
        .removeClass("selected_element");
      $("#graphic_canvas")
        .contents()
        .find("#" + element_id)
        .addClass("selected_element");
      var trialtype = master.phasetypes.file;
      master.phasetypes.graphic.element_id = element_id;
      graphic_editor_obj.update_settings(element_id);
    });
  },
  draw_video: function (element_props, element_id) {
    var $iframe = $("#graphic_canvas");
    $iframe.ready(function () {
      $iframe
        .contents()
        .find("body")
        .append(
          "<button class='btn btn-outline-danger video_element graphic_element' id='" +
            element_id +
            "'></button>"
        );
      $("#graphic_canvas")
        .contents()
        .find("#" + element_id)
        .html("video: " + element_id);
      $("#graphic_canvas")
        .contents()
        .find("#" + element_id)
        .css("position", "absolute");
      var image_props = ["width", "height", "top", "left", "z-index"];
      image_props.forEach(function (image_prop) {
        $("#graphic_canvas")
          .contents()
          .find("#" + element_id)
          .css(image_prop, element_props[image_prop].value);
      });
      $("#graphic_canvas")
        .contents()
        .find(".graphic_element")
        .removeClass("selected_element");
      $("#graphic_canvas")
        .contents()
        .find("#" + element_id)
        .addClass("selected_element");
      var trialtype = master.phasetypes.file;
      master.phasetypes.graphic.element_id = element_id;
      graphic_editor_obj.update_settings(element_id);
    });
  },
  graphic_warning: function () {
    bootbox.alert(
      "For graphic trialtypes you cannot edit the code directly. If you want to insert code into the trialtype, you can do this by either including a <b>mod</b>, or by copying the whole text (select all and then right click with your mouse to copy) into a new trialtype which you create using the <b>code</b> rather than <b>graphic</b> editor."
    );
  },
  load_canvas: function (these_elements) {
    graphic_editor_obj.clean_canvas(function () {
      Object.keys(these_elements).forEach(function (element) {
        switch (these_elements[element].type.toLowerCase()) {
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
      $("#graphic_editor").show();
      graphic_editor_obj.update_timeline();
      graphic_editor_obj.update_main_settings();

      var trialtype = master.phasetypes.file;
      var this_trialtype = master.phasetypes.graphic.files[trialtype];
      console.dir(this_trialtype);
    });
  },
  order_settings: function (this_settings) {
    ordered_settings = {
      main: {},
      style: {},
      javascript: {},
    };
    switch (this_settings.type.toLowerCase()) {
      case "audio":
        //main
        ordered_settings.main.src = this_settings.src;

        // style
        ordered_settings.style["controls"] = this_settings["controls"];
        ordered_settings.style["top"] = this_settings["top"];
        ordered_settings.style["left"] = this_settings["left"];
        ordered_settings.style["height"] = this_settings["height"];
        ordered_settings.style["width"] = this_settings["width"];
        ordered_settings.style["z-index"] = this_settings["z-index"];

        // javascript
        ordered_settings.javascript.delay = this_settings.delay;
        ordered_settings.javascript.show = this_settings.show;
        ordered_settings.javascript.hide = this_settings.hide;
        ordered_settings.javascript.name = this_settings.name;
        ordered_settings.javascript.value = this_settings.value;
        ordered_settings.javascript.end_click = this_settings.end_click;
        break;
      case "image":
        //main
        ordered_settings.main.src = this_settings.src;

        // style
        ordered_settings.style["top"] = this_settings["top"];
        ordered_settings.style["left"] = this_settings["left"];
        ordered_settings.style["height"] = this_settings["height"];
        ordered_settings.style["width"] = this_settings["width"];
        ordered_settings.style["z-index"] = this_settings["z-index"];

        // javascript
        ordered_settings.javascript.show = this_settings.show;
        ordered_settings.javascript.hide = this_settings.hide;
        ordered_settings.javascript.name = this_settings.name;
        ordered_settings.javascript.value = this_settings.value;
        ordered_settings.javascript.end_click = this_settings.end_click;
        break;
      case "input":
        if (this_settings.input_type.value == "button") {
          //main
          ordered_settings.main.value = this_settings.value;

          // style
          ordered_settings.style["top"] = this_settings["top"];
          ordered_settings.style["left"] = this_settings["left"];
          ordered_settings.style["color"] = this_settings["color"];
          ordered_settings.style["background-color"] =
            this_settings["background-color"];
          ordered_settings.style["height"] = this_settings["height"];
          ordered_settings.style["width"] = this_settings["width"];
          ordered_settings.style["border-color"] =
            this_settings["border-color"];
          ordered_settings.style["border-style"] =
            this_settings["border-style"];
          ordered_settings.style["border-radius"] =
            this_settings["border-radius"];
          ordered_settings.style["font-size"] = this_settings["font-size"];
          ordered_settings.style["z-index"] = this_settings["z-index"];

          // javascript
          ordered_settings.javascript.show = this_settings.show;
          ordered_settings.javascript.hide = this_settings.hide;
          ordered_settings.javascript.name = this_settings.name;
          ordered_settings.javascript.value = this_settings.value;
          ordered_settings.javascript.end_click = this_settings.end_click;
        } else if (this_settings.input_type.value == "text") {
          //main
          ordered_settings.main.placeholder = this_settings.placeholder;

          // style
          ordered_settings.style["top"] = this_settings["top"];
          ordered_settings.style["left"] = this_settings["left"];
          ordered_settings.style["color"] = this_settings["color"];
          ordered_settings.style["background-color"] =
            this_settings["background-color"];
          ordered_settings.style["height"] = this_settings["height"];
          ordered_settings.style["width"] = this_settings["width"];
          ordered_settings.style["font-size"] = this_settings["font-size"];
          ordered_settings.style["z-index"] = this_settings["z-index"];

          // javascript
          ordered_settings.javascript.show = this_settings.show;
          ordered_settings.javascript.hide = this_settings.hide;
          ordered_settings.javascript.name = this_settings.name;
        }

        break;
      case "text":
        // main
        ordered_settings.main.html = this_settings.html;

        // style
        ordered_settings.style["font-size"] = this_settings["font-size"];
        ordered_settings.style["top"] = this_settings["top"];
        ordered_settings.style["left"] = this_settings["left"];
        ordered_settings.style["color"] = this_settings["color"];
        ordered_settings.style["background-color"] =
          this_settings["background-color"];
        ordered_settings.style["height"] = this_settings["height"];
        ordered_settings.style["width"] = this_settings["width"];
        ordered_settings.style["border-width"] =
          this_settings["border-width"];
        ordered_settings.style["border-style"] =
          this_settings["border-style"];
        ordered_settings.style["border-color"] =
          this_settings["border-width"];
        ordered_settings.style["border-radius"] =
          this_settings["border-width"];
        ordered_settings.style["z-index"] = this_settings["z-index"];

        // javascript
        ordered_settings.javascript.show = this_settings.show;
        ordered_settings.javascript.hide = this_settings.hide;
        ordered_settings.javascript.name = this_settings.name;
        ordered_settings.javascript.value = this_settings.value;
        ordered_settings.javascript.end_click = this_settings.end_click;
        break;
      case "video":
        //main
        ordered_settings.main.src = this_settings.src;

        // style
        ordered_settings.style["controls"] = this_settings["controls"];
        ordered_settings.style["top"] = this_settings["top"];
        ordered_settings.style["left"] = this_settings["left"];
        ordered_settings.style["height"] = this_settings["height"];
        ordered_settings.style["width"] = this_settings["width"];
        ordered_settings.style["z-index"] = this_settings["z-index"];

        // javascript
        ordered_settings.javascript.delay = this_settings.delay;
        ordered_settings.javascript.show = this_settings.show;
        ordered_settings.javascript.hide = this_settings.hide;
        ordered_settings.javascript.name = this_settings.name;
        ordered_settings.javascript.value = this_settings.value;
        ordered_settings.javascript.end_click = this_settings.end_click;
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
        return (
          "<input id='" +
          element_id +
          "' class='" +
          onclick_class +
          element_info.name.value +
          " update_name' type='button' value='" +
          element_info.value.value +
          "' />"
        );
        break;
      case "text":
        return (
          "<input id='" +
          element_id +
          "' class='" +
          element_info.name.value +
          " update_name' type='text'/>"
        );
    }
  },
  parse_script: function (element_info, element_id) {
    set_timer_comment =
      "//Phase.set_timer is a Collector function required because of buffering (which prevents the use of setTimeout)";

    //show and hide
    var new_code = "";
    if ((element_info.show.value !== 0) & (element_info.show.value !== "")) {
      new_code +=
        "Phase.set_timer(function(){$('#" +
        element_id +
        "').show()},'" +
        element_info.show.value +
        "'); " +
        set_timer_comment +
        " \n";
    }
    if ((element_info.hide.value !== 0) & (element_info.hide.value !== "")) {
      new_code +=
        "Phase.set_timer(function(){$('#" +
        element_id +
        "').hide()},'" +
        element_info.hide.value +
        "'); " +
        set_timer_comment +
        " \n";
    }
    if (
      typeof element_info.delay !== "undefined" &&
      element_info.delay.value !== "-1"
    ) {
      //assuming this element is a video that needs to start automatically after xxx ms
      new_code +=
        "Phase.set_timer(function(){$('#" +
        element_id +
        "').find('" +
        element_info.type +
        "')[0].play()},'" +
        element_info.delay.value +
        "');" +
        set_timer_comment +
        "\n";
    }
    return new_code;
  },
  rename_element: function () {
    bootbox.prompt(
      "What would you like to call the element?",
      function (new_name) {
        if (
          (new_name == "trial_contents") |
          (new_name == "keyboard_response")
        ) {
          bootbox.alert(
            "<b> " +
              new_name +
              " </b> is a protected element name - please come up with another one"
          );
        } else if (new_name !== null) {
          var trialtype = master.phasetypes.file;
          var elements = master.phasetypes.graphic.files[trialtype].elements;
          if (typeof elements[new_name] == "undefined") {
            var old_element_name = master.phasetypes.graphic.element_id;
            elements[new_name] = JSON.parse(
              JSON.stringify(elements[old_element_name])
            );
            delete elements[old_element_name];
            master.phasetypes.graphic.element_id = new_name;
            $("#element_name").val(new_name);
            $("#graphic_canvas")
              .contents()
              .find("#" + old_element_name)
              .attr("id", new_name);
            switch (elements[new_name].type) {
              case "audio":
              case "image":
                $("#graphic_canvas")
                  .contents()
                  .find("#" + new_name)
                  .html(new_name);
                break;
              case "video":
                $("#graphic_canvas")
                  .contents()
                  .find("#" + new_name)
                  .html(elements[new_name].type + " : " + new_name);
                break;
            }
            graphic_editor_obj.compile_graphics();
            graphic_editor_obj.update_timeline();
          } else {
            bootbox.alert(
              "This element name already exists - please choose a unique one"
            );
          }
        }
      }
    );
  },
  update_main_settings: function () {
    var trialtype = master.phasetypes.file;
    var this_trialtype = master.phasetypes.graphic.files[trialtype];
    $("#trial_width").val(parseFloat(this_trialtype.width));
    $("#trial_height").val(this_trialtype.height);
    $("#trial_background_color").val(this_trialtype["background-color"]);
    $("#keyboard_valid_keys").val(this_trialtype.keyboard.valid_keys);
    $("#keyboard_end_press")[0].checked = this_trialtype.keyboard.end_press;
    $("#mouse_visible")[0].checked = this_trialtype.mouse_visible;
  },
  update_settings: function (element_id) {
    var trialtype = master.phasetypes.file;
    var this_settings = this.order_settings(
      master.phasetypes.graphic.files[trialtype].elements[element_id]
    );
    $("#graphic_general_settings").hide();
    $("#graphic_settings").html("");

    graphic_settings_html =
      '<table><tr><td><input type="text" class="form-control text-primary" id="element_name" style="background-color: white;" readonly value="' +
      element_id +
      '"></td>' +
      '<td><button class="btn btn-primary" id="delete_element_btn" >Delete</button></td></tr></table><br>';

    if (typeof this_settings.main.html !== "undefined") {
    }

    Object.keys(this_settings.main).forEach(function (main_setting) {
      main_setting = main_setting.toLowerCase();
      if (main_setting == "html") {
        graphic_settings_html +=
          '<div class="form-group">' +
          '<textarea class="form-control" id="setting_html" rows="3" placeholder="Html here please">' +
          this_settings.main.html.value +
          "</textarea>" +
          "</div>";
      } else {
        graphic_settings_html +=
          '<div class="input-group mb-3">' +
          '<div class="input-group-prepend">' +
          '<span class="input-group-text" >' +
          main_setting +
          "</span>" +
          "</div>" +
          '<input class="form-control" id="setting_' +
          main_setting +
          '" value="' +
          this_settings.main[main_setting].value +
          '">' +
          "</div>";
      }
    });

    graphic_settings_html +=
      '<div class="accordion" id="element_settings">' +
      '<div class="card">' +
      '<div class="card-header bg-primary setting_header" id="headingOne" data-toggle="collapse" data-target="#collapseStyle" aria-expanded="true" aria-controls="collapseStyle">' +
      '<h4 class="mb-0 text-white">How it looks</h4>' +
      "</div>" +
      '<div id="collapseStyle" class="collapse show" aria-labelledby="headingOne" data-parent="#element_settings">' +
      '<div class="card-body">';
    Object.keys(this_settings.style).forEach(function (setting) {
      if (this_settings.style[setting].type == "checkbox") {
        var setting_details = this_settings.style[setting];
        switch (setting) {
          case "controls":
            var setting_text = "Controls (i.e. play, pause, etc.)";
            break;
        }
        var checked_unchecked = setting_details.value ? "checked" : "";
        graphic_settings_html +=
          '<div class="custom-control custom-checkbox">' +
          '<input type="checkbox" class="custom-control-input" id="setting_' +
          setting +
          '" ' +
          checked_unchecked +
          ">" +
          '<label class="custom-control-label" for="setting_' +
          setting +
          '">' +
          setting_text +
          "</label>" +
          "</div>";
      } else if (setting !== "type") {
        var setting_details = this_settings.style[setting];
        graphic_settings_html +=
          '<div class="input-group mb-3">' +
          '<div class="input-group-prepend">' +
          '<span class="input-group-text" >' +
          setting +
          "</span>" +
          "</div>" +
          '<input id="setting_' +
          setting +
          '" type="' +
          setting_details.type +
          '" class="form-control" placeholder="" value="' +
          setting_details.value +
          '" aria-describedby="basic-addon1">' +
          "</div>";
      }
    });
    graphic_settings_html +=
      "</div>" +
      "</div>" +
      "</div>" +
      '<div class="card">' +
      '<div class="card-header bg-primary setting_header" id="headingOne" data-toggle="collapse" data-target="#collapseJS" aria-expanded="true" aria-controls="collapseJS">' +
      '<h4 class="mb-0 text-white">Interactivity</h4>' +
      "</div>" +
      '<div id="collapseJS" class="collapse show" aria-labelledby="headingOne" data-parent="#element_settings">' +
      '<div class="card-body">';
    Object.keys(this_settings.javascript).forEach(function (setting) {
      if ((setting == "show") | (setting == "hide")) {
        //note (ms) below
        var setting_details = this_settings.javascript[setting];
        graphic_settings_html +=
          '<div class="input-group mb-3">' +
          '<div class="input-group-prepend">' +
          '<span class="input-group-text" >' +
          setting +
          " (ms)</span>" +
          "</div>" +
          '<input id="setting_' +
          setting +
          '" type="' +
          setting_details.type +
          '" class="form-control" placeholder="" value="' +
          setting_details.value +
          '" aria-describedby="basic-addon1">' +
          "</div>";
      } else if (this_settings.javascript[setting].type == "checkbox") {
        var setting_details = this_settings.javascript[setting];
        switch (setting) {
          case "end_click":
            var setting_text = "End trial on click?";
            break;
        }
        var checked_unchecked = setting_details.value ? "checked" : "";
        graphic_settings_html +=
          '<div class="custom-control custom-checkbox">' +
          '<input type="checkbox" class="custom-control-input" id="setting_' +
          setting +
          '" ' +
          checked_unchecked +
          ">" +
          '<label class="custom-control-label" for="setting_' +
          setting +
          '">' +
          setting_text +
          "</label>" +
          "</div>";
      } else if (setting !== "type") {
        var setting_details = this_settings.javascript[setting];
        graphic_settings_html +=
          '<div class="input-group mb-3">' +
          '<div class="input-group-prepend">' +
          '<span class="input-group-text" >' +
          setting +
          "</span>" +
          "</div>" +
          '<input id="setting_' +
          setting +
          '" type="' +
          setting_details.type +
          '" class="form-control" placeholder="" value="' +
          setting_details.value +
          '" aria-describedby="basic-addon1">' +
          "</div>";
      }
    });
    graphic_settings_html += "</div>" + "</div>" + "</div>" + "</div>";

    $("#graphic_settings").html(graphic_settings_html);

    $(".setting_header").hover(
      function () {
        $(this).removeClass("bg-primary");
        $(this).addClass("bg-secondary");
      },
      function () {
        $(this).addClass("bg-primary");
        $(this).removeClass("bg-secondary");
      }
    );

    this.activate_settings();
    graphic_editor_obj.compile_graphics();
  },
  update_timeline: function () {
    var trialtype = master.phasetypes.file;
    var this_trialtype = master.phasetypes.graphic.files[trialtype];
    var these_elements = this_trialtype.elements;
    var element_timeline_html = "<table style='width:100%'>";

    var max_value = 0;
    var endless_element = false;
    Object.keys(these_elements).forEach(function (element) {
      max_value =
        these_elements[element].hide.value > max_value
          ? parseFloat(these_elements[element].hide.value)
          : max_value;
      max_value =
        these_elements[element].show.value > max_value
          ? parseFloat(these_elements[element].show.value)
          : max_value;
      if (these_elements[element].hide.value == "") {
        endless_element = true;
      }
    });

    if (endless_element) {
      max_value += 500;
    }

    // calculate max duration
    /////////////////////////
    var time_step = max_value / 5;
    var time_array = [0];
    var time_html =
      "<span style='width:20%; display:inline-block;'>0 ms</span>";
    if (max_value == 0) {
      max_value = 5000;
      solid_dotted = "solid black";
    } else {
      max_value = max_value;
      solid_dotted = "dashed blue";
      for (var i = 1; i < 4; i++) {
        time_array.push(time_array[i - 1] + time_step);
        time_html +=
          "<span style='width:20%; display:inline-block'>" +
          time_array[i] +
          "ms</span>";
      }
      time_html +=
        "<span style='display:inline-block'>" +
        (time_array[3] + time_step) +
        "ms</span>";
    }

    // draw time-course
    ///////////////////
    var time_line =
      "<span style='width:20%; height:12px; display:inline-block; border-left:2px " +
      solid_dotted +
      "; border-top:2px " +
      solid_dotted +
      "'></span>" +
      "<span style='width:20%; height:12px; display:inline-block; border-left:2px " +
      solid_dotted +
      "; border-top:2px " +
      solid_dotted +
      "'></span>" +
      "<span style='width:20%; height:12px; display:inline-block; border-left:2px " +
      solid_dotted +
      "; border-top:2px " +
      solid_dotted +
      "'></span>" +
      "<span style='width:20%; height:12px; display:inline-block; border-left:2px " +
      solid_dotted +
      "; border-top:2px " +
      solid_dotted +
      "'></span>" +
      "<span style='width:20%; height:12px; display:inline-block; border-left:2px " +
      solid_dotted +
      "; border-top:2px " +
      solid_dotted +
      "'></span>";

    element_timeline_html +=
      "<tr>" +
      "<td></td>" +
      "<td>" +
      time_html +
      "</td>" +
      "</tr>" +
      "<tr>" +
      "<td></td>" +
      "<td>" +
      time_line +
      "</td>" +
      "</tr>";

    Object.keys(these_elements).forEach(function (element, element_index) {
      var element_type = these_elements[element].type;
      if (typeof these_elements[element].delay !== "undefined") {
        start_time = these_elements[element].delay.value;
      } else {
        start_time = these_elements[element].show.value;
      }

      var start_time =
        start_time == 0
          ? 0
          : start_time == ""
          ? 0
          : start_time.indexOf("{{") !== -1
          ? 0
          : start_time;

      var end_time =
        these_elements[element].hide.value == 0
          ? max_value
          : these_elements[element].hide.value == ""
          ? max_value
          : these_elements[element].hide.value.indexOf("{{") !== -1
          ? max_value
          : these_elements[element].hide.value;

      pre_show_width = (100 * start_time) / max_value;
      show_hide_width = (100 * (end_time - start_time)) / max_value;
      post_end_width = (100 * (max_value - end_time)) / max_value;

      var element_class =
        element_type == "text"
          ? "info"
          : element_type == "audio"
          ? "secondary"
          : element_type == "image"
          ? "success"
          : element_type == "video"
          ? "danger"
          : element_type == "input"
          ? "dark"
          : "";

      element_timeline_html +=
        "<tr style='width:100%'><td style='width:10%' class='text-" +
        element_class +
        "'>" +
        element +
        "</td>" +
        "<td style='width:90%'>" +
        "<span class='pre_timeline' style=' width:" +
        pre_show_width +
        "%'></span>" + //line starting and ending before "start" time
        "<button id='timeline_" +
        element_index +
        "' class='during_timeline btn btn-outline-" +
        element_class +
        "' style=' width:" +
        show_hide_width +
        "%' value='" +
        element +
        "'>" +
        element_type +
        "</button>" + //the length of the element
        "<span class='post_timeline' style='width:" +
        show_hide_width +
        "%'></span>" + //the length of the element
        "</td></tr>";
    });
    $("#element_timelines").html(element_timeline_html);
    $(".during_timeline").on("click", function () {
      // Update buttons
      for (var i = 0; i < $(".during_timeline").length; i++) {
        document.getElementById($(".during_timeline")[i].id).className =
          document
            .getElementById($(".during_timeline")[i].id)
            .className.replace("btn-outline-", "btn-");
        document.getElementById($(".during_timeline")[i].id).className =
          document
            .getElementById($(".during_timeline")[i].id)
            .className.replace("btn-", "btn-outline-");
      }
      document.getElementById(this.id).className = document
        .getElementById(this.id)
        .className.replace("btn-outline", "btn");

      graphic_editor_obj.update_settings(this.value);
    });
  },
  update_trialtype_element: function (element_id, prop, value) {
    var trialtype = master.phasetypes.file;
    master.phasetypes.graphic.files[trialtype].elements[element_id][
      prop
    ].value = value;
    graphic_editor_obj.update_timeline();
    graphic_editor_obj.compile_graphics();
  },
};
graphic_editor_obj.clean_canvas();
loading_scripts("Graphic.js");
