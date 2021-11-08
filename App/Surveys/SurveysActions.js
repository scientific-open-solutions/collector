/*
 * Survey actions (i.e. element triggers)
 */

$("#delete_survey_btn").on("click", function () {
  bootbox.confirm(
    "Are you sure you want to delete this survey?",
    function (confirmed) {
      if (confirmed) {
        var survey_name =
          $("#survey_select")
            .val()
            .split("|")[1]
            .toLowerCase()
            .replace(".csv", "") + ".csv";
        delete master.surveys.user_surveys[survey_name];

        //need to use electron to delete here
        var response = Collector.electron.fs.delete_file(
          "Surveys/" + survey_name.replace(".csv", "") + ".csv"
        );
        if (response === "success") {
          Collector.custom_alert(
            "Succesfully deleted <b>" + survey_name + "</b>"
          );
          $(
            '#survey_select option[value="' + $("#survey_select").val() + '"]'
          ).remove();
          $("#survey_select").val("default|demographics.csv");
          create_survey_HoT(master.surveys.default_surveys["demographics.csv"]);
          $("#save_btn").click();
        } else {
          bootbox.alert(response);
        }
      }
    }
  );
});

$("#new_survey_button").on("click", function () {
  if ($("#survey_select").val() === null) {
    bootbox.alert(
      "Please select a survey that already exists to base the new survey on. To do this, click on the dropdown list that has 'Please select a survey' written in it."
    );
  } else {
    bootbox.confirm(
      "The new survey will be based on the one that you've selected, are you sure you want to confirm",
      function (result) {
        if (result) {
          bootbox.prompt({
            title: "New Survey",
            callback: function (survey_name) {
              if (survey_name) {
                survey_name =
                  survey_name.toLowerCase().replaceAll(".csv", "") + ".csv";
                if (
                  typeof (
                    master.surveys.user_surveys[survey_name] === "undefined"
                  )
                ) {
                  var survey_content = survey_HoT.getData();
                  master.surveys.user_surveys[survey_name] = JSON.parse(
                    JSON.stringify(survey_content)
                  );
                  create_survey_HoT(master.surveys.user_surveys[survey_name]);
                  var survey_value = "user|" + survey_name;
                  $("#survey_select").append(
                    $("<option>", {
                      text: survey_name,
                      value: survey_value,
                      class: "bg-info text-white",
                    })
                  );
                  $("#survey_select").val(survey_value);
                  Collector.custom_alert(
                    "<b>" + survey_name + "</b> created succesfully"
                  );
                } else {
                  bootbox.alert("Survey name already exists");
                }
              }
            },
          });
        }
      }
    );
  }
});

$("#pills-preview-tab").on("click", function () {
  var this_survey = survey_HoT.getData();
  preview_survey(this_survey);
});

$("#rename_survey_btn").on("click", function () {
  var old_survey_name = $("#survey_select").val().split("|")[1];
  if ($("#survey_select").val() === null) {
    bootbox.alert("You haven't selected a survey to rename");
  } else if (
    typeof master.surveys.default_surveys[old_survey_name] !== "undefined"
  ) {
    bootbox.alert("You can't rename default experiments.");
  } else {
    bootbox.prompt(
      "What would you like to call this survey instead?",
      function (new_survey_name) {
        if (new_survey_name) {
          new_survey_name =
            new_survey_name.toLowerCase().replace(".csv", "") + ".csv";
          if (
            typeof master.surveys.default_surveys[new_survey_name] !==
            "undefined"
          ) {
            bootbox.alert("This name clashes with an already existing survey");
          } else if (
            typeof master.surveys.user_surveys[new_survey_name] !== "undefined"
          ) {
            bootbox.alert("This name clashes with an already existing survey");
          } else {
            var write_response = Collector.electron.fs.write_file(
              "Surveys",
              new_survey_name,
              Papa.unparse(master.surveys.user_surveys[old_survey_name])
            );
            if (write_response === "success") {
              master.surveys.user_surveys[new_survey_name] =
                master.surveys.user_surveys[old_survey_name];
              var delete_response = Collector.electron.fs.delete_file(
                "Surveys/" + old_survey_name.replace(".csv", "") + ".csv"
              );

              if (delete_response !== "success") {
                bootbox.alert(delete_response);
              } else {
                delete master.surveys.user_surveys[old_survey_name];
                list_surveys();
                $("#survey_select").val("user|" + new_survey_name);
              }
            } else {
              bootbox.alert(write_response);
            }
          }
        }
      }
    );
  }
});

$("#save_survey_btn").on("click", function () {
  if ($("#survey_select").val() !== null) {
    var survey_data = survey_HoT.getData();

    /*
     * Turn headers into lowercase
     */
    survey_data[0] = survey_data[0].map(function (item) {
      if (item !== null) {
        return item.toLowerCase();
      } else {
        return null;
      }
    });

    var item_name_index = survey_data[0].indexOf("item_name");
    var type_index = survey_data[0].indexOf("type");
    var item_names = [];
    var repetition_alert = false;
    for (var i = 1; i < survey_data.length; i++) {
      /*
       * Check there are no repeated item_names within the survey
       */
      var this_item_name = survey_data[i][item_name_index];
      if (item_names.indexOf(this_item_name) === -1) {
        item_names.push(this_item_name);
      } else {
        repetition_alert = this_item_name;
      }
      if(repetition_alert){
        bootbox.alert(
          "<b>" +
            repetition_alert +
            "</b> appears multiple times in your <b>item_name</b> column. This will result in loss of data unless you fix this"
        );
      }

      /*
       * Turn values in the "type" column to lower case
       */
      if (
        typeof survey_data[i][type_index] !== "undefined" &&
        survey_data[i][type_index] !== null
      ) {
        survey_data[i][type_index] = survey_data[i][type_index].toLowerCase();
      }
    }

    create_survey_HoT(survey_data);

    if (
      ($("#survey_select").val() !== null) &
      (typeof survey_HoT !== "undefined")
    ) {
      var survey_name =
        $("#survey_select").val().split("|")[1].replace(".csv", "") + ".csv";
      var survey_content = Papa.unparse(survey_HoT.getData());
      survey_obj.save(survey_name, survey_content);
    }
  }
});

$("#survey_select").on("change", function () {
  /*
   * use code from trialtypes to save previously edited survey
   */
  var old_survey = $(this).attr("previousValue");

  if (old_survey === "") {
    // not the first selected
    // do nothing
  } else if (
    Object.keys(master.surveys.default_surveys).indexOf(old_survey) === -1
  ) {
    // not a default trialtype
    old_survey = old_survey.split("|")[1].replace(".csv", "") + ".csv";

    var survey_content = Papa.unparse(survey_HoT.getData());
    survey_obj.save(old_survey, survey_content);
  }

  $(this).attr("previousValue", this.value);

  var this_survey = $("#survey_select").val().split("|");
  if (this_survey[0] === "default") {
    $("#survey_select").removeClass("bg-light");
    $("#survey_select").addClass("bg-info");
    $("#survey_select").addClass("text-white");

    create_survey_HoT(master.surveys.default_surveys[this_survey[1]]);
    $("#spreadsheet_preview_tabs").show();
  } else if (this_survey[0] === "user") {
    $("#survey_select").removeClass("bg-info");
    $("#survey_select").removeClass("text-white");
    $("#survey_select").addClass("bg-light");

    create_survey_HoT(master.surveys.user_surveys[this_survey[1]]);
    $("#spreadsheet_preview_tabs").show();
  } else {
    bootbox.alert(
      "It's not clear whether this is supposed to be a default or user survey"
    );
  }
});
