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
$.ajaxSetup({ cache: false }); // prevents caching, which disrupts $.get calls

code_obj = {
  delete_code: function () {
    var deleted_code = $("#code_select").val();
    master.code.file = $("#code_select").val();
    var this_loc = "/code/" + master.code.file;
    bootbox.confirm(
      "Are you sure you want to delete this " + this_loc + "?",
      function (result) {
        if (result == true) {
          if (
            typeof master.code.graphic.files[master.code.file] !== "undefined"
          ) {
            delete master.code.graphic.files[master.code.file];
          }
          delete master.code.user[master.code.file];
          $("#code_select").attr("previousvalue", "");
          $("#code_select option:selected").remove();
          master.code.file = $("#code_select").val();
          code_obj.load_file("default");
          Collector.custom_alert("Successfully deleted " + this_loc);
          Collector.electron.fs.delete_code(deleted_code, function (response) {
            if (response !== "success") {
              bootbox.alert(response);
            }
          });
        }
      }
    );
  },
  load_file: function (user_default) {
    $("#ACE_editor").show();
    $("#new_code_button").show();
    $("#rename_code_button").show();
    if (user_default == "default") {
      $("#delete_code_button").hide();
      $("#code_select").removeClass("user_code").addClass("default_code");
    } else {
      $("#delete_code_button").show();
    }

    var this_file = master.code.file;

    //python load if localhost
    switch (Collector.detect_context()) {
      case "localhost":
        cleaned_code = this_file.toLowerCase().replace(".html", "") + ".html";
        this_content = Collector.electron.fs.read_file("Code", cleaned_code);
        if (this_content == "") {
          editor.setValue(master.code[user_default][this_file]);
        } else {
          editor.setValue(this_content);
        }
        break;
      default:
        var content = master.code[user_default][this_file];
        editor.setValue(content);
        break;
    }
  },
  save: function (content, name, new_old, graphic_code) {
    if (new_old == "new") {
      graphic_editor_obj.clean_canvas();
      editor.setValue("");
    }
    if (
      $("#code_select option").filter(function () {
        return $(this).val() == name;
      }).length == 0
    ) {
      $("#code_select").append(
        $("<option>", {
          value: name,
          text: name,
          class: "user_code",
        })
      );
      $("#code_select").val(name);
      $("#code_select")[0].className = $("#code_select")[0].className.replace(
        "default_",
        "user_"
      );

      if (graphic_code == "code") {
        $("#ACE_editor").show();
      } else if (graphic_code == "graphic") {
        $("#graphic_editor").show();
      }
      $("#trial_type_file_select").show();
      Collector.custom_alert("success - " + name + " created");
    } else {
      Collector.custom_alert("success - " + name + " updated");
    }
    if (typeof Collector.electron !== "undefined") {
      var write_response = Collector.electron.fs.write_file(
        "Code",
        name.toLowerCase().replace(".html", "") + ".html",
        content
      );
      if (write_response !== "success") {
        bootbox.alert(write_response);
      }
    }
  },
};

function list_code(to_do_after) {
  //try{
  if (typeof Collector.electron !== "undefined") {
    var files = Collector.electron.fs.list_code();
    files = JSON.parse(files);
    files = files.map((item) => item.replaceAll(".html", ""));
    files.forEach(function (file) {
      if (Object.keys(master.code.user).indexOf(file) == -1) {
        master.code.user[file] = Collector.electron.fs.read_file(
          "Code",
          file + ".html"
        );
      }
    });
  }

  function process_returned(returned_data) {
    $("#code_select").empty();
    $("#code_select").append("<option disabled>Select a file</option>");
    $("#code_select").val("Select a file");

    var default_code = JSON.parse(returned_data);
    var user = master.code.user;

    master.code.default = default_code;
    default_keys = Object.keys(default_code).sort((a, b) =>
      a.localeCompare(b, undefined, { sensitivity: "base" })
    );

    user_keys = Object.keys(user).sort((a, b) =>
      a.localeCompare(b, undefined, { sensitivity: "base" })
    );

    default_keys.forEach(function (element) {
      $("#code_select").append(
        "<option class='default_code'>" + element + "</option>"
      );
    });
    master.code.user = user;

    user_keys.forEach(function (element) {
      $("#code_select").append(
        "<option class='user_code'>" + element + "</option>"
      );
    });

    if (typeof to_do_after !== "undefined") {
      to_do_after();
    }
  }

  function get_default(list) {
    if (list.length > 0) {
      var item = list.pop();

      switch (Collector.detect_context()) {
        case "localhost":
          var trial_content = Collector.electron.fs.read_default("DefaultCode", item);
          master.code.default[item.toLowerCase().replace(".html", "")] =
            trial_content;
          get_default(list);
          break;
        default:
          $.get(collector_map[item], function (trial_content) {
            master.code.default[item.toLowerCase().replace(".html", "")] =
              trial_content;
            get_default(list);
          });
          break;
      }
    } else {
      process_returned(JSON.stringify(master.code.default));
    }
  }
  var default_list = Object.keys(isolation_map[".."]["Default"]["DefaultCode"]);

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
