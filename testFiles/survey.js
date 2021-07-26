/*
 * Retrieving settings
 */

if (typeof settings !== "undefined") {
  settings = [settings];
} else {
  settings = {};
}

/*
 * vertical vs. horizontal tabs
 */

if (
  typeof settings.tab_hor_vert == "undefined" ||
  settings.tab_hor_vert.toLowerCase() == "horizontal"
) {
  settings.tab_hor_vert = "horizontal";
  var please_wait = $("<div>");
  var this_survey = $("<div>");
  var survey_tabs = $("<div>");
  var proceed_btn = $("<input>");
  please_wait.attr("id", "please_wait_div").html("Loading... Please wait");
  this_survey
    .addClass("needs-validation")
    .attr("id", "this_survey_id")
    .attr("novalidate", true);
  survey_tabs
    .attr("id", "survey_tabs")
    .addClass("border-top")
    .addClass("border-primary")
    .css("text-align", "right");
  proceed_btn
    .addClass("btn")
    .addClass("btn-primary")
    .attr("id", "proceed_button")
    .attr("type", "submit")
    .attr("value", "Proceed");
  $("#survey_outline")
    .append(please_wait)
    .append(this_survey)
    .append(survey_tabs)
    .append(proceed_btn);
} else if (settings.tab_hor_vert.toLowerCase() == "vertical") {
  $("#survey_outline").html(
    "<table>" +
      "<tr>" +
      '<td valign="top" class="border-right border-primary">' +
      '<div id="survey_tabs"></div>' +
      "</td>" +
      "<td>" +
      '<div id="please_wait_div">Please wait while survey is downloading</div>' +
      '<div id="this_survey_id" class="needs-validation" novalidate></div>' +
      '<input type="button" value="Proceed" class="btn btn-primary" id="proceed_button">' +
      "</td>" +
      "</tr>" +
      "</table>"
  );
} else if (settings.tab_hor_vert.toLowerCase() == "none") {
  $("#survey_outline").html(
    '<div id="survey_tabs" style="display:none"></div>' +
      '<div id="please_wait_div">Please wait while survey is downloading</div>' +
      '<div id="this_survey_id" class="needs-validation" novalidate></div>'
  );
} else {
  bootbox.alert(
    "If you are the researcher, please check the 'settings for this survey. The input for 'tab_hor_vert' appears to be invalid. Please change it to 'horizontal' or 'vertical' or 'none' or remove 'tab_hot_vert' altogether from the settings, which will make the tabs invisible"
  );
}

/*
 * Defining objects
 */

page_break_management = {
  breaks_remaining: 0,
  breaks_index: 0,
};

proceed_object = {
  type: [],
  name: [],
  break_no: [],
};

scoring_object = {
  scales: [],
  scale_scores: [],
  update_scales: function (this_survey) {
    headers = Object.keys(this_survey[0]);
    this.scales = headers.filter((elm) => elm.includes("score:"));
    var scales_html = "";
    this.scales.forEach(function (element) {
      element = element.replace(": ", ":");
      scales_html +=
        "<input name='" +
        element.replace(/ |:/g, "_") +
        "' class='score_total " +
        element.replace(/ |:/g, "_") +
        "' disabled>";
    });
    $("#scales_span").html(scales_html);
  },
};

survey_obj = {};

/*
 * Element actions
 */

/*
$(function() {
  $( ".datepicker" ).datepicker({
    dateFormat : 'mm/dd/yy',
    changeMonth : true,
    changeYear : true,
    yearRange: '-100y:c+nn',
    maxDate: '-1d'
  });
});
*/

$("#ExperimentContainer").css("transform", "scale(1,1)");

$("#proceed_button").on("click", function () {
  var proceed = true;
  var tabs = document.getElementsByClassName("show_tab active");
  if (tabs.length > 0) {
    var current_tab = document
      .getElementsByClassName("show_tab active")[0]
      .id.replace("_button", "")
      .replace("tab_", "");
    var response_elements = $("#table_" + current_tab).find(
      ".response_element"
    );
  } else {
    response_elements = $(".table_break:visible").find(".response_element");
  }
  for (var i = 0; i < response_elements.length; i++) {
    [row_no, item_name] = retrieve_row_no_item_name(response_elements[i]);
    if (typeof survey_obj.data[row_no].optional !== "undefined") {
      var this_optional = survey_obj.data[row_no].optional.toLowerCase();

      if (this_optional.indexOf("no") !== -1) {
        this_optional = this_optional.split("-"); // find out whether there's a minimal number of responses
        if (this_optional.length == 1) {
          // default is that length needs to be at least 1
          var min_resp_length = 1;
        } else if (this_optional.length == 2) {
          var min_resp_length = this_optional[1];
        } else {
          bootbox.alert(
            "Error - you appear to have too many '-' characters in the 'optional' column"
          );
          return false;
        }
      } else {
        min_resp_length = 0;
      }

      var quest_resp = isJSON($("#" + response_elements[i].id).val());
      if (quest_resp.length < min_resp_length) {
        proceed = false;
        $(
          "#" + response_elements[i].id.replace("response", "question")
        ).removeClass("text-dark");
        $(
          "#" + response_elements[i].id.replace("response", "question")
        ).removeClass("text-success");
        $(
          "#" + response_elements[i].id.replace("response", "question")
        ).addClass("text-danger");
      } else {
        $(
          "#" + response_elements[i].id.replace("response", "question")
        ).removeClass("text-dark");
        $(
          "#" + response_elements[i].id.replace("response", "question")
        ).removeClass("text-danger");
        $(
          "#" + response_elements[i].id.replace("response", "question")
        ).addClass("text-success");
      }
    }
  }

  if (current_tab == survey_obj.tabs && proceed) {
    if (typeof sql_surveys == "undefined") {
      //$(".table_break");
      var next_table_no =
        parseFloat($(".table_break:visible")[0].id.replace("table", "")) + 1;

      if ($(".table_break#table" + next_table_no).length == 0) {
        if (typeof Phase !== "undefined") {
          Phase.submit();
        } else {
          bootbox.alert(
            "You've finished! Click on the preview button to restart."
          );
        }
      } else {
        $(".table_break").hide();
        $(".table_break#table" + next_table_no).show();
      }
    } else {
      $("#survey_outline").html(
        "<h1> You have finished the preview of this survey.</h1>"
      );
    }
  } else if (current_tab < survey_obj.tabs && proceed) {
    current_tab++;
    $("#tab_" + current_tab + "_button").removeClass("btn-secondary");
    $("#tab_" + current_tab + "_button").removeClass("disabled");
    $("#tab_" + current_tab + "_button").addClass("btn-outline-dark");
    $("#tab_" + current_tab + "_button").click();
  } else if (proceed == false) {
    bootbox.alert(
      "You're missing some responses. Please fill in all the answers for the questions in red above."
    );
  } else if (current_tab > survey_obj.tabs) {
    bootbox.alert(
      "Error - please contact Scientific Open Solutions about this problem, error 'Survey_001'."
    );
  }
});

//by qwerty at https://stackoverflow.com/questions/2116558/fastest-method-to-replace-all-instances-of-a-character-in-a-string
String.prototype.replaceAll = function (str1, str2, ignore) {
  return this.replace(
    new RegExp(
      str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g, "\\$&"),
      ignore ? "gi" : "g"
    ),
    typeof str2 == "string" ? str2.replace(/\$/g, "$$$$") : str2
  );
};

/*
 * Functions
 */

function clean_item(this_item) {
  if ((this_item.indexOf("'") !== -1) | (this_item.indexOf('"') !== -1)) {
    bootbox.alert(
      "Please avoid apostraphes or quote marks in the responses the participant can give. These cause problems with smooth running of surveys. This occurs when you wrote:<br><br>" +
        this_item
    );
  }
  return this_item;
}

function generate_feedback_string(
  feedback_array,
  this_index,
  feedback_color,
  row
) {
  if (feedback_array) {
    //i.e. if it's not null
    if (feedback_array.length > 1) {
      return (
        "<div class='feedback_span_multiple " +
        row["item_name"].toLowerCase() +
        "_feedback' style='color:" +
        feedback_color[this_index] +
        "'>" +
        feedback_array[this_index] +
        "</div>"
      );
    } else {
      return (
        "<div class='feedback_span_single " +
        row["item_name"].toLowerCase() +
        "_feedback' style='color:" +
        feedback_color[this_index] +
        "'>" +
        feedback_array[this_index] +
        "</div>"
      );
    }
  } else {
    return "";
  }
}

function get_feedback(row) {
  if (typeof row["feedback"] !== "undefined" && row["feedback"] !== "") {
    feedback_array = row["feedback"].split("|");
    if (typeof row["feedback_color"] == "undefined") {
      bootbox.alert(
        "The color for the feedback options has not been set. If you created this questionnaire, please add a column 'feedback_color' to your survey and separate the colors by a pipe (|) character."
      );
    }
    feedback_color = row["feedback_color"].split("|");
  } else {
    feedback_array = null;
    feedback_color = "";
  }
  return [feedback_array, feedback_color];
}

function isJSON(str) {
  try {
    return JSON.parse(str);
  } catch (e) {
    return str;
  }
}

function likert_update(this_element) {
  [row_no, item_name] = retrieve_row_no_item_name(this_element);

  $(".row_" + row_no).removeClass("active");
  $(".row_" + row_no).removeClass("btn-primary");
  $(".row_" + row_no).addClass("btn-outline-primary");
  $(this_element).removeClass("btn-outline-primary");
  $(this_element).addClass("btn-primary");
  $("#survey_" + item_name + "_response").val(this_element.value);
  response_check(this_element);
}

function load_survey(survey) {
  /*
   * are we in preview?
   */
  if (typeof parent.collector_survey_preview !== "undefined") {
    survey_content = survey;
  } else if (
    typeof parent.master !== "undefined" &&
    parent.master.surveys.preview
  ) {
    survey_content = survey;
    survey_obj.mods = parent.master.mods;
  } else {
    survey = survey.toLowerCase().replace(".csv", "") + ".csv";

    if (
      typeof parent.parent.project_json.surveys !== "undefined" &&
      typeof parent.parent.project_json.surveys[survey] !== "undefined"
    ) {
      survey_content = parent.parent.project_json.surveys[survey];
      survey_obj.mods = parent.parent.project_json.mods;
    } else if (
      typeof parent.parent.project_json.surveys !== "undefined" &&
      typeof parent.parent.project_json.surveys[survey.replace(".csv", "")]
    ) {
      survey_content =
        parent.parent.project_json.surveys[survey.replace(".csv", "")];
      survey_obj.mods = parent.parent.project_json.mods;
    } else {
      bootbox.alert("Survey " + survey + " doesn't appear to exist");
    }
  }
  process_returned_questionnaire(survey_content);
}

function process_question(row, row_no) {
  //row.values = row.values == "" ? row.answers : row.values;
  if (row_check("page_break", row)) {
    page_break_management.breaks_remaining++;
    question_td =
      "</tr></table><table id='table" +
      page_break_management.breaks_remaining +
      "' style='display:none' class='table_break'></tr>";
  } else {
    if (
      (typeof row["values"] !== "undefined") &
      (typeof row["values"] !== "function")
    ) {
      //to address microsoft edge issue.
      value_array = row["values"].split("|");
    } else {
      value_array = "";
    }

    if (row["item_name"].indexOf(" ") !== -1) {
      bootbox.alert(
        "Please note that the 'item name' '" +
          row["item_name"] +
          "' is invalid because it has at least one space. Please use underscores instead of spaces. If you're not the creator of this task, please contact the person who created it."
      );
    }

    /*
     * class for scoring
     */

    var this_class = "";
    for (var i = 0; i < scoring_object.scales.length; i++) {
      if (row[scoring_object.scales[i].toLowerCase()] == "1") {
        this_class +=
          scoring_object.scales[i]
            .toLowerCase()
            .replace("score: ", "")
            .replace(/ |-/, "") + " ";
      }
      if (row[scoring_object.scales[i].toLowerCase()] == "r1") {
        this_class +=
          scoring_object.scales[i]
            .toLowerCase()
            .replace("score: ", "")
            .replace(" ", "_") + "-r1 ";
      }
    }

    /*
     * adding to row to help with "write" function
     */
    var row_x = JSON.parse(JSON.stringify(row));
    row_x["row_no"] = row_no;
    row_x["this_class"] = this_class;

    [feedback_array, feedback_color] = get_feedback(row);

    question_td =
      '<input type="hidden" class="response_element row_' +
      row_no +
      '" id="survey_' +
      row["item_name"].toLowerCase() +
      '_response" name="survey_' +
      row["item_name"].toLowerCase() +
      '_response" value="">';

    /*
     * Survey settings
     */
    [row_ques_perc, row_resp_perc] = row_perc(row["question_width"]);

    if (typeof settings.feedback_before_response == "undefined") {
      settings.feedback_before_response = true;
    }

    if (typeof settings.lock_after_feedback == "undefined") {
      settings.lock_after_feedback = false;
    }

    if (typeof row["type"] == "undefined") {
      return false;
    }

    if (
      typeof survey_obj.mods !== "undefined" &&
      typeof survey_obj.mods[row.type] !== "undefined"
    ) {
      var mod_html = survey_obj.mods[row.type].contents;

      Object.keys(row).forEach(function (attribute) {
        mod_html = mod_html.replaceAll("{{" + attribute + "}}", row[attribute]);
      });
      question_td += mod_html;
    } else {
      switch (row["type"].toLowerCase()) {
        case "page_start":
          var tabs_html = $("#survey_tabs").html();
          if (settings.tab_hor_vert == "horizontal") {
            span_div = "span";
          } else if (settings.tab_hor_vert == "vertical") {
            span_div = "div";
          }
          if (typeof survey_obj.tabs == "undefined") {
            survey_obj.tabs = 0;
          } else {
            survey_obj.tabs++;
          }
          if (survey_obj.tabs == 0) {
            //i.e. is the first tab
            active_button = "btn-outline-primary active";
          } else {
            active_button = "btn-secondary disabled";
          }
          if (settings.tab_hor_vert == "vertical") {
            var vert_btn_block = "btn-block";
          } else {
            var vert_btn_block = "";
          }

          tabs_html +=
            "<" +
            span_div +
            ' class="btn-group-toggle" data-toggle="buttons">' +
            '<label id="tab_' +
            survey_obj.tabs +
            '_button" class="btn show_tab ' +
            active_button +
            " " +
            vert_btn_block +
            '">' +
            '<input type="checkbox" checked autocomplete="off">' +
            row["text"] +
            "</label>" +
            "</" +
            span_div +
            ">";

          $("#survey_tabs").html(tabs_html);

          page_break_indexes = [];
          survey_obj.data.forEach(function (row, this_index) {
            if (
              typeof row.type !== "undefined" &&
              row.type.toLowerCase() == "page_start"
            ) {
              page_break_indexes.push(this_index);
            }
          });

          if (survey_obj.tabs > 0) {
            question_td +=
              "</td><td></td></tr></table></div><div class='survey_page' id='tab_" +
              survey_obj.tabs +
              "' style='display:none'><table id='table_" +
              survey_obj.tabs +
              "' class='table_break'><tr>";
          } else {
            question_td +=
              "</td><td></td></tr></table><div class='survey_page' id='tab_" +
              survey_obj.tabs +
              "' ><table id='table_" +
              survey_obj.tabs +
              "' class='table_break'><tr>";
          }
          break;
        case "checkbox":
        case "checkbox_vertical":
          question_td += write("checkbox_vertical", row_x);
          break;
        case "checkbox_horizontal":
          question_td += write("checkbox_horizontal", row_x);
          break;
        case "checkbox_single":
          question_td += write("checkbox_single", row_x);
          break;
        case "date":
          question_td += write("date", row_x);
          break;
        case "dropdown":
        case "select":
          question_td += write("dropdown", row_x);
          break;
        case "email":
          question_td += write("email", row_x);
          break;
        case "google_slide":
        case "jumbled":
        case "instruct":
          // these are defined elsewhere to take the whole row
          break;
        case "likert":
          question_td += write("likert", row_x);
          break;
        case "number":
          question_td += write("number", row_x);
          break;
        case "para":
          question_td += write("para", row_x);
          break;
        case "radio":
        case "radio_vertical":
          question_td += write("radio_vertical", row_x);
          break;
        case "radio_horizontal":
          question_td += write("radio_horizontal", row_x);
          break;

        case "report_score":
          question_td +=
            "<input disabled class='form-control score_" +
            row["item_name"] +
            " " +
            row["item_name"] +
            "_item row_" +
            row_no +
            "' type='text' name='survey_" +
            row["item_name"].toLowerCase() +
            "'>";
          break;

        case "text":
          question_td += write("text", row_x);
          break;
      }
    }
    if (feedback_array) {
      question_td +=
        "<button class='btn btn-outline-info feedback_btn " +
        row["item_name"] +
        "_item row_" +
        row_no +
        "' id='reveal_" +
        row["item_name"].toLowerCase() +
        "_feedback' onclick='reveal_answers(this)'>Show</button>";
    }
  }
  if (typeof row["type"] == "undefined") {
    return "";
  } else {
    if (row["type"].toLowerCase() == "instruct") {
      row_html = write("instruct", row);
    } else if (row["type"].toLowerCase() == "jumbled") {
      //row_html  = question_td + write("jumbled",row); <-- this is better, but being paused for placement work Anthony is doing
      row_html = write("jumbled", row);
    } else if (row["type"].toLowerCase() == "likert") {
      if (
        typeof row["side_by_side"] !== "undefined" &&
        row["side_by_side"].toLowerCase() == "yes"
      ) {
        var row_html =
          "<td class='text-primary' id='survey_" +
          row["item_name"].toLowerCase().replace(" ", "_") +
          "_question' style='width:" +
          row_ques_perc +
          "; text-align:right'>" +
          row["text"] +
          "</td><td>" +
          question_td +
          "</label></td>";
      } else {
        var row_html =
          "<tr>" +
          "<td colspan='2'>" +
          row["text"] +
          "</td>" +
          "</tr>" +
          "<tr>" +
          "<td colspan='2' align='center'>" +
          question_td +
          "</td>" +
          "</tr>";
      }
    } else if (row["type"].toLowerCase() == "google_slide") {
      var row_html = "<td colspan='2'>" + row["text"] + "</label></td>";
    } else if (
      typeof row["no_text"] !== "undefined" &&
      row["no_text"] == "on"
    ) {
      var row_html = "<td colspan='2'>" + question_td + "</td>";
    } else {
      if (
        (row["text"].toLowerCase() == "page_start") |
        (row["type"].toLowerCase() == "page_start")
      ) {
        row_html = question_td;
      } else {
        var row_html =
          "<td class='text-primary' id='survey_" +
          row["item_name"].toLowerCase().replace(" ", "_") +
          "_question' style='width:" +
          row_ques_perc +
          "; text-align:right'>" +
          row["text"] +
          "</td><td>" +
          question_td +
          "</label></td>";
      }
    }
    if (typeof row["optional"] !== "undefined") {
      if (row["optional"].toLowerCase() == "no") {
        proceed_object.name.push(row["item_name"]);
        proceed_object.type.push(row["type"]);
        proceed_object.break_no.push(page_break_management.breaks_remaining);
      }
    }
    if (
      typeof row["shuffle_question"] == "undefined" ||
      row["shuffle_question"].toLowerCase() == "off"
    ) {
      this_shuffle = "none";
    } else {
      this_shuffle = row["shuffle_question"];
    }
    return [row_html, this_shuffle];
  }
}

function process_score(
  row_no,
  values_col,
  this_response,
  item,
  values_reverse
) {
  item_values = survey_obj.data[row_no][values_col].split("|");
  if (typeof values_reverse !== "undefined" && values_reverse == "r") {
    item_values.reverse();
  }
  item_answers = survey_obj.data[row_no]["values"].split("|");
  var this_value = item_values[item_answers.indexOf(this_response)];
  $("#survey_" + item + "_score").val(this_value);
  if (typeof this_value !== "undefined") {
    return parseFloat(this_value);
  }
}

function process_returned_questionnaire(data) {
  /*
   * trim the data if it has a blank final row
   */
  if (data[data.length - 1].length < data[0].length) {
    data.pop();
  }

  survey_obj.data = data;
  survey_obj.data = Papa.unparse(survey_obj.data);
  survey_obj.data = parent.parent.Collector.PapaParsed(survey_obj.data);

  survey_obj.scales = {};
  var col_headers = Object.keys(survey_obj.data[0]);
  col_headers.forEach(function (header) {
    if (header.indexOf("score:") == 0) {
      var original_header = header;
      header = header.replace("score: ", "");
      header = header.replace("score:", "");
      survey_obj.scales[header] = {};
      survey_obj.scales[header].questions = {};

      for (var i = 1; i < survey_obj.data.length; i++) {
        row = survey_obj.data[i];
        if (
          row[original_header] !== "" &&
          typeof row[original_header] !== "undefined"
        ) {
          survey_obj.scales[header].questions[i] = row[original_header];
        }
      }
    }
  });
  write_survey(survey_obj.data, "this_survey_id");
  $("#please_wait_div").hide();
  $("#proceed_button").show();
  $("html, body").animate(
    {
      scrollTop: $("#survey_outline").offset().top,
    },
    1000
  );
}

function row_perc(this_rat) {
  if (typeof this_rat == "undefined") {
    row_resp_perc = "50%";
    row_ques_perc = "50%";
  } else {
    row_resp_perc = parseFloat(100 - this_rat.replace("%", "")) + "%";
    row_ques_perc = parseFloat(this_rat.replace("%", "")) + "%";
  }
  return [row_ques_perc, row_resp_perc];
}

function response_check(submitted_element) {
  switch (submitted_element.type) {
    case "checkbox":
      var checked_responses = $(
        "[name='" + submitted_element.name + "']:checked"
      );
      if (checked_responses.length) {
        //i.e. more than 0
        var values = [];
        for (var i = 0; i < checked_responses.length; i++) {
          values.push(checked_responses[i].value);
        }
        $("#" + submitted_element.name + "_response").val(
          JSON.stringify(values)
        );
      } else {
        $("#" + submitted_element.name + "_response").val("");
      }

      break;

    case "button":
      $("#" + submitted_element.name + "_response").val(
        submitted_element.value
      );
      break;

    case "number":
    case "radio":
    case "select-one":
    case "text":
    case "textarea":
      $("#" + submitted_element.name + "_response").val(
        submitted_element.value
      );
      break;
  }
  update_score();
}

function retrieve_row_no_item_name(this_element) {
  var these_classes = this_element.className.split(" ");
  var row_no;
  var item_name;
  these_classes.forEach(function (this_class) {
    if (this_class.indexOf("row_") > -1) {
      row_no = this_class.replace("row_", "");
    }
    if (this_class.indexOf("_item") > -1) {
      item_name = this_class.replace("_item", "").toLowerCase();
    }
  });
  return [row_no, item_name];
}

function reveal_answers(this_element) {
  var this_response = $(
    "#" +
      this_element.id
        .replace("reveal_", "survey_")
        .replace("_feedback", "_response")
  ).val();
  response_present = this_response == "" ? false : true;

  if (settings.feedback_before_response == false && response_present == false) {
    bootbox.alert("Please respond before trying reveal the feedback.");
  } else {
    if ($("#" + this_element.id).hasClass("btn-outline-info")) {
      $("." + this_element.id.replace("reveal_", "")).show(500);
      if (settings.lock_after_feedback) {
        var item_class = this_element.id
          .replace("_feedback", "_item")
          .replace("reveal_", "");
        $("." + item_class).prop("disabled", true);
        document.getElementsByClassName(item_class).title =
          "The person creating this content has set it so that your answers are locked in once you have chosen to see the feedback";
        $("#" + this_element.id).addClass("btn-info");
        $("#" + this_element.id).removeClass("btn-outline-info");
        $("#" + this_element.id).html("Locked");
        document.getElementById(this_element.id).title =
          "The person creating this content has set it so that your answers are locked in once you have chosen to see the feedback";
        $("#" + this_element.id).addClass("disabled");
      } else {
        $("#" + this_element.id).html("Hide");
        $("#" + this_element.id).removeClass("btn-outline-info");
        $("#" + this_element.id).addClass("btn-info");
      }
    } else {
      $("#" + this_element.id).html("Show");
      $("." + this_element.id.replace("reveal_", "")).hide(500);
      $("#" + this_element.id).addClass("btn-outline-info");
      $("#" + this_element.id).removeClass("btn-info");
    }
  }
}

function row_check(type, row) {
  if ((type = "page_break")) {
    return (
      typeof row["text"] !== "undefined" &&
      typeof row["type"] !== "undefined" &&
      (row["text"].toLowerCase() == "page_break") |
        (row["type"].toLowerCase() == "page_break")
    );
  } else if ((type = "")) {
  }
}

// http://stackoverflow.com/questions/962802#962890
function shuffle(array) {
  var tmp,
    current,
    top = array.length;
  if (top)
    while (--top) {
      current = Math.floor(Math.random() * (top + 1));
      tmp = array[current];
      array[current] = array[top];
      array[top] = tmp;
    }
  return array;
}

function shuffle_answers(row) {
  if (
    typeof row["shuffle_answers"] !== "undefined" &&
    row["shuffle_answers"].toLowerCase() == "yes"
  ) {
    var answers = row["answers"].split("|");
    order = shuffle([...Array(answers.length).keys()]);

    var ordered_answers = order.map(function (position) {
      return answers[position];
    });
    row["answers"] = ordered_answers.join("|");

    if (row["values"].indexOf("|") !== -1) {
      var values = row["values"].split("|");
      var ordered_values = order.map(function (position) {
        return values[position];
      });
      row["values"] = ordered_values.join("|");
    }
  }
  return row;
}

function update_score() {
  var scales = Object.keys(survey_obj.scales);
  scales.forEach(function (scale) {
    this_scale = survey_obj.scales[scale];
    var questions = Object.keys(this_scale.questions);
    var this_score = 0;
    complete_score = true;

    questions.forEach(function (row_no) {
      var item = survey_obj.data[row_no].item_name.toLowerCase();
      var this_response = $("#survey_" + item + "_response").val();
      var normal_reverse = this_scale.questions[row_no];

      if (normal_reverse.indexOf("-") == -1) {
        var multiplier = parseFloat(normal_reverse.replace("r", ""));
        if (normal_reverse.indexOf("r") == 0) {
          //reverse the values

          this_value = process_score(
            row_no,
            "values",
            this_response,
            item,
            "r"
          );
        } else {
          this_value = process_score(row_no, "values", this_response, item);
        }
      } else {
        values_reverse = normal_reverse.split("-");
        values_col = values_reverse[0].toLowerCase();
        normal_reverse = values_reverse[1];
        var multiplier = parseFloat(normal_reverse.replace("r", ""));

        if (normal_reverse.indexOf("r") == 0) {
          //reverse the values
          this_value = process_score(
            row_no,
            values_col,
            this_response,
            item,
            "r"
          );
        } else {
          this_value = process_score(row_no, values_col, this_response, item);
        }
      }
      if (typeof this_value !== "undefined") {
        this_score += multiplier * this_value;
      } else {
        complete_score = false;
      }
    });
    if (complete_score) {
      $(".score_" + scale).addClass("bg-success");
      $(".score_" + scale).removeClass("bg-danger");
      $(".score_" + scale).addClass("text-light");
      document.getElementsByClassName("score_" + scale).title =
        "All relevant questions have been answered";
    } else {
      $(".score_" + scale).removeClass("text-success");
      $(".score_" + scale).addClass("bg-danger");
      $(".score_" + scale).addClass("text-light");
      document.getElementsByClassName("score_" + scale).title =
        "At least one relevant questions has NOT been answered";
    }
    $(".score_" + scale).val(this_score);
  });
}

function write(type, row) {
  var this_html = "";
  [feedback_array, feedback_color] = get_feedback(row);
  row = shuffle_answers(row);
  row["item_name"] = row["item_name"].toLowerCase();

  if (type == "checkbox_horizontal") {
    var options = row["answers"].split("|");
    var this_table = $("<table>");
    this_row = this_table[0].insertRow();
    for (var i = 0; i < options.length; i++) {
      var this_cell = this_row.insertCell();
      var this_div = $("<div>");
      this_div.addClass("custom-control");
      this_div.addClass("custom-checkbox");
      var this_input = $("<input>");
      this_input[0].type = "checkbox";
      this_input[0].id = row["item_name"] + i;
      this_input[0].name = "survey_" + row["item_name"];
      this_input
        .addClass("custom-control-input")
        .addClass("response")
        .addClass(row["this_class"])
        .addClass(row["custom-control"])
        .addClass(row["custom-checkbox"])
        .addClass(row["item_name"] + "_item")
        .addClass("row_" + row["row_no"]);
      var this_label = $("<label>");
      this_label[0].htmlFor = row["item_name"] + i;
      this_label[0].innerText = options[i];
      this_label.addClass("custom-control-label");
      this_div.append(this_input).append(this_label);
      this_cell.innerHTML = this_div[0].outerHTML;
    }

    this_html += this_table[0].outerHTML;
  } else if (type == "checkbox_single") {
    var this_div = $("<div>");
    this_div.attr("data-toggle", "buttons");
    this_div.addClass("btn-group-toggle");
    var this_label = $("<label>");
    this_label.addClass("btn");
    this_label.addClass("btn-outline-primary");
    this_label.html(row["answers"]);
    var this_checkbox = $("<input>");
    this_checkbox[0].id = row["item_name"];
    this_checkbox[0].name = "survey_" + row["item_name"].toLowerCase();
    this_checkbox[0].type = "checkbox";
    this_checkbox.attr("checked", true);
    this_checkbox
      .addClass("response")
      .addClass(row["item_name"] + "_item row_" + row["row_no"]);
    this_div.append(this_label);
    this_label.append(this_checkbox);
    this_html += this_div[0].outerHTML;
  } else if (type == "checkbox_vertical") {
    var options = row["answers"].split("|");
    var values = row["values"].split("|");
    for (var i = 0; i < options.length; i++) {
      feedback_string = generate_feedback_string(
        feedback_array,
        i,
        feedback_color,
        row
      );
      var this_div = $("<div>");
      this_div.addClass("custom-control").addClass("custom-checkbox");
      var this_checkbox = $("<input>");
      this_checkbox[0].id = row["item_name"] + i;
      this_checkbox[0].value = options[i];
      this_checkbox[0].type = "checkbox";
      this_checkbox[0].name = "survey_" + row["item_name"].toLowerCase();
      this_checkbox
        .addClass("custom-control-input")
        .addClass(row["this_class"])
        .addClass("custom-control")
        .addClass("custom-checkbox")
        .addClass("response")
        .addClass(row["item_name"] + "_item_row");
      var this_label = $("<label>");
      this_label[0].htmlFor = row["item_name"] + i;
      this_label[0].innerHTML = options[i];
      this_label.addClass("custom-control-label");
      this_div.append(this_checkbox).append(this_label);

      this_html += this_div[0].outerHTML;
    }
    if (
      typeof row["other"] !== "undefined" &&
      row["other"].toLowerCase() == "yes"
    ) {
      var this_div = $("<div>");
      this_div.addClass("custom-control").addClass("custom-checkbox");
      var this_checkbox = $("<input>");
      this_checkbox[0].id = row["item_name"] + "_other";
      this_checkbox[0].value = "Other";
      this_checkbox[0].type = "checkbox";
      this_checkbox[0].name = "survey_" + row["item_name"].toLowerCase();
      this_checkbox
        .addClass("custom-control-input")
        .addClass(row["this_class"])
        .addClass("custom-control")
        .addClass("custom-checkbox")
        .addClass("response")
        .addClass(row["item_name"] + "_item_row");
      var this_label = $("<label>");
      this_label[0].htmlFor = row["item_name"] + "_other";
      this_label[0].innerHTML = "Other";
      this_label.addClass("custom-control-label");
      this_div.append(this_checkbox).append(this_label);

      this_html += this_div[0].outerHTML;

      var text_input = $("<input>");
      text_input.addClass("form-control");
      text_input.attr(
        "placeholder",
        "(Please specify if you selected 'Other')"
      );
      text_input[0].name =
        "survey_" + row["item_name"].toLowerCase() + "_other";
      this_html += text_input[0].outerHTML;
    }
  } else if (type == "date") {
    var input = $("<input>");
    input
      .addClass("response")
      .addClass("custom-control")
      .addClass("datepicker")
      .addClass("date")
      .addClass(row["item_name"] + "_item")
      .addClass("row_" + row["row_no"])
      .attr("name", "survey_" + row["item_name"])
      .attr("type", "text");
  } else if (type == "dropdown") {
    var options = row["answers"].split("|");
    var this_dropdown = $("<select>");
    this_dropdown
      .addClass("form-select")
      .addClass("response")
      .addClass("txt-primary")
      .addClass(row["item_name"] + "_item")
      .addClass("row_" + row["row_no"])
      .addClass("collector_button")
      .attr("name", "survey_" + row["item_name"])
      .css("margin", "0px")
      .css("width", "auto");

    /* this will be necessary to tidy up jumbled sentences
    if(typeof(row["item_name_old"]) !== "undefined"){
      this_dropdown.addClass(row["item_name_old"] + "_item");
    }
    */

    this_dropdown.append(
      "<option selected disabled hidden>-- no option selected --</option>"
    );
    options.forEach(function (this_option) {
      this_dropdown.append("<option>" + this_option + "</option>");
    });
    var this_html = this_dropdown[0].outerHTML;
  } else if (type == "email") {
    var this_input = $("<input>");
    this_input
      .addClass("form-control")
      .addClass("response")
      .addClass(row["item_name"] + "_item row_" + row["row_no"])
      .attr("type", "email")
      .attr("name", "survey_" + row["item_name"]);
  } else if (type == "instruct") {
    this_html += "<td colspan='2'>" + row["text"] + "</td>";
  } else if (type == "jumbled") {
    var this_td = $("<td>");
    this_td.attr("colspan", 2);

    var this_div = $("<div>");
    this_div
      .addClass("form-inline")
      .addClass("bg-secondary")
      .addClass("text-white")
      .css("width", "100%")
      .css("padding", "20px")
      .css("margin", "20px")
      .css("border-radius", "5px");

    var question = row["text"].split("|");
    questions_html = question
      .map(function (text, index) {
        if (index == question.length - 1) {
          return text;
        } else {
          var row_x = row;
          row_x["item_name_old"] = row_x["item_name"];
          row_x["item_name"] = row_x["item_name"] + "_" + index;
          var row_html =
            text +
            write("dropdown", row_x).replace("margin: 0px", "margin: 5px");
          row_x["item_name"] = row_x["item_name_old"];
          return row_html;
        }
      })
      .join("");

    this_td.append(this_div);
    this_div.append(questions_html);

    this_html = this_td[0].outerHTML;
  } else if (type == "likert") {
    // set styles
    if (typeof row["btn_width"] == "undefined") {
      row["btn_width"] = "auto";
    }
    if (typeof row["side_width"] == "undefined") {
      var side_width = "auto";
    }

    // create and build these elements
    var this_div = $("<div>");
    if (typeof row["side_text"] !== "undefined" && row["side_text"] !== "") {
      side_text = row["side_text"].split("|");
      side_text = side_text.map(function (this_side) {
        var this_span = $("<span>");
        this_span
          .css("width", side_width)
          .css("padding", "20px")
          .addClass("text-primary")
          .html("<b>" + this_side + "</b>");
        return this_span[0].outerHTML;
      });
    } else {
      side_text = ["", ""];
    }

    this_div
      .addClass("btn-group")
      .addClass("btn-group-toggle")
      .append(side_text[0])
      .attr("data-togle", "buttons");

    var options = row["answers"].split("|");
    var values = row["values"].split("|");
    for (var i = 0; i < options.length; i++) {
      var this_button = $("<button>");
      this_button
        .attr("autocomplete", "off")
        .attr("id", "likert_" + row["row_no"] + "_" + i)
        .attr("onclick", "likert_update(this)")
        .attr("value", values[i])
        .addClass("btn")
        .addClass("btn-outline-primary")
        .addClass("survey_btn")
        .addClass(row["item_name"] + "_item row_" + row["row_no"])
        .css("width", row["btn_width"])
        .html(clean_item(options[i]));
      this_div.append(this_button);
    }
    this_div.append(side_text[1]);
    this_html += this_div[0].outerHTML;
  } else if (type == "number") {
    var this_input = $("<input>");
    this_input[0].type = "number";
    this_input[0].name = "survey_" + row["item_name"];
    this_input
      .addClass("response")
      .addClass("form-control")
      .addClass(row["item_name"] + "_item row_" + row["row_no"]);
    this_html += this_input[0].outerHTML;
  } else if (type == "para") {
    var this_textarea = $("<textarea>");
    this_textarea[0].name = "survey_" + row["item_name"];
    this_textarea
      .addClass(row["item_name"] + "_item row_" + row["row_no"])
      .addClass("response");
    this_textarea.css("width", "100%").css("height", "200px");
    this_html += this_textarea[0].outerHTML;
  } else if (type == "radio_horizontal") {
    var options = row["answers"].split("|");
    var this_table = $("<table>");
    this_row = this_table[0].insertRow();
    for (var i = 0; i < options.length; i++) {
      var this_cell = this_row.insertCell();
      var this_div = $("<div>");
      this_div.addClass("custom-control");
      this_div.addClass("custom-radio");
      var this_input = $("<input>");
      this_input[0].type = "radio";
      this_input[0].id = row["item_name"] + i;
      this_input[0].name = "survey_" + row["item_name"];
      this_input
        .addClass("custom-control-input")
        .addClass("response")
        .addClass(row["this_class"])
        .addClass(row["custom-control"])
        .addClass(row["custom-radio"])
        .addClass(row["item_name"] + "_item")
        .addClass("row_" + row["row_no"]);
      var this_label = $("<label>");
      this_label[0].htmlFor = row["item_name"] + i;
      this_label[0].innerText = options[i];
      this_label.addClass("custom-control-label");
      this_div.append(this_input).append(this_label);
      this_cell.innerHTML = this_div[0].outerHTML;
    }
    this_html += this_table[0].outerHTML;
  } else if (type == "radio_vertical") {
    var options = row["answers"].split("|");
    var values = row["values"].split("|");
    for (var i = 0; i < options.length; i++) {
      feedback_string = generate_feedback_string(
        feedback_array,
        i,
        feedback_color,
        row
      );
      var this_div = $("<div>");
      this_div.addClass("custom-control").addClass("custom-radio");
      var this_input = $("<input>");
      this_input[0].type = "radio";
      this_input[0].id = row["item_name"] + i;
      this_input[0].value = options[i];
      this_input[0].name = "survey_" + row["item_name"];
      this_input
        .addClass("custom-control-input")
        .addClass(row["this_class"])
        .addClass("custom-control")
        .addClass("custom-radio")
        .addClass("response")
        .addClass(row["item_name"] + "_item_row_" + row["row_no"]);
      var this_label = $("<label>");
      this_label[0].htmlFor = row["item_name"] + i;
      this_label.addClass("custom-control-label");
      this_label.html(options[i]);
      this_div.append(this_input).append(this_label).append(feedback_string);
      this_html += this_div[0].outerHTML;
    }
  } else if (type == "text") {
    var this_input = $("<input>");
    this_input[0].type = "text";
    this_input[0].name = "survey_" + row["item_name"];
    this_input
      .addClass("form-control")
      .addClass(row["item_name"] + "_item row_" + row["row_no"])
      .addClass("response");
    this_html += this_input[0].outerHTML;
  }

  switch (type) {
    case "checkbox_vertical":
    case "radio_vertical":
      // do nothing
      break;
    default:
      this_html += generate_feedback_string(
        feedback_array,
        0,
        feedback_color,
        row
      );
      break;
  }

  return this_html;
}

function write_survey(this_survey, this_id) {
  scoring_object.update_scales(this_survey);
  survey_html = "<table class='table_break' id='table0'>";
  this_survey_object = {
    content: [],
    shuffle_question: [],
    content_new_order: [],
    shuffled_content: [],
    shuffled_arrays: {},
  };

  survey_html += "<tr>";
  for (i = 0; i < this_survey.length; i++) {
    row = this_survey[i];
    row_html = process_question(row, i);
    this_survey_object.content.push(row_html[0]);
    this_survey_object.shuffle_question.push(row_html[1]);
  }

  unique_shuffles = this_survey_object.shuffle_question.filter(
    (v, i, a) => a.indexOf(v) == i
  ); //by Camilo Martin on https://stackoverflow.com/questions/1960473/unique-values-in-an-array

  for (var i = 0; i < unique_shuffles.length; i++) {
    if (
      typeof unique_shuffles[i] !== "undefined" &&
      unique_shuffles[i] !== "none" &&
      unique_shuffles[i] !== ""
    ) {
      shuffled_content = this_survey_object.shuffle_question
        .map(function (element, index) {
          if (
            typeof element !== "undefined" &&
            element.toLowerCase() !== "none" &&
            element.toLowerCase() == unique_shuffles[i]
          ) {
            return this_survey_object.content[index];
          }
        })
        .filter((elm) => typeof elm !== "undefined");
      new_order = shuffle(shuffled_content);
      this_survey_object.shuffled_arrays[unique_shuffles[i]] = new_order; // add new array with dynamic name
    }
  }

  for (var i = 0; i < this_survey_object.content.length; i++) {
    var this_index = Object.keys(this_survey_object.shuffled_arrays).indexOf(
      this_survey_object.shuffle_question[i]
    );
    if (this_index !== -1) {
      //take first item off relevant list and delete item
      var this_item =
        this_survey_object.shuffled_arrays[
          Object.keys(this_survey_object.shuffled_arrays)[this_index]
        ].shift();
      this_survey_object.content_new_order[i] = this_item;
    } else {
      this_survey_object.content_new_order[i] = this_survey_object.content[i];
    }
  }

  qs_in_order = this_survey_object.content_new_order.join("</tr><tr>");
  qs_in_order += "</tr>";

  survey_html += qs_in_order;
  survey_html += "</table>";

  $("#" + this_id).html(survey_html);

  $(".response").on("change", function () {
    response_check(this);
  });

  $("#" + this_id).show(1000); //scroll to top

  $(".show_tab").on("click", function () {
    if (this.className.indexOf("disabled") == -1) {
      $(".show_tab").removeClass("active");
      $(".survey_page").hide();
      $("#" + this.id.replace("_button", "")).show();
    } else {
      bootbox.alert(
        "You have not yet unlocked this tab - maybe try clicking on <b>Proceed</b>?"
      );
    }
  });
}

/*
 * Load survey
 */
current_survey = "{{survey}}";
if (typeof Phase !== "undefined") {
  Phase.set_timer(function () {
    load_survey(current_survey);
  }, 100);
} else {
  load_survey(current_survey);
}
