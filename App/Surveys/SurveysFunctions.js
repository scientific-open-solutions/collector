function load_default_surveys() {
  var default_survey_files = [
    "autism_quotient.csv",
    "big_five_inventory.csv",
    "consent_sheet_uor.csv",
    "demographics.csv",
    "empathy_quotient_40.csv",
    "info_sheet.csv",
    "info_sheet_uor.csv",
  ];

  function load_survey(list) {
    if (list.length > 0) {
      var this_survey = list.pop();
      $.get(collector_map[this_survey], function (survey_content) {
        master.surveys.default_surveys[this_survey.toLowerCase()] =
          Papa.parse(survey_content).data;
        load_survey(list);
      });
    } else {
      //based on solution by "dule" at https://stackoverflow.com/questions/740195/adding-options-to-a-select-using-jquery
      default_surveys_list = Object.keys(master.surveys.default_surveys).sort();
      $.each(default_surveys_list, function (i, item) {
        $("#survey_select").append(
          $("<option>", {
            value: "default|" + item, //.value,
            text: item, //.text
          })
        );
      });
    }
  }
  switch (Collector.detect_context()) {
    case "localhost":
      default_survey_files.forEach(function (default_survey) {
        survey_content = CElectron.fs.read_default(
          "DefaultSurveys",
          default_survey
        );
        master.surveys.default_surveys[default_survey] =
          Papa.parse(survey_content).data;
        $("#survey_select").append(
          $("<option>", {
            value: "default|" + default_survey, //.value,
            text: default_survey, //.text
          })
        );
      });
      break;
    default:
      load_survey(default_survey_files);
      break;
  }
}

/*
 * Survey functions
 */
var columnHeader;
var survey_HoT;
const nonDeletableColumns_sur = ['item_name', 'text', 'answers', 'values'];
var savedValues = {}; // Object to save the values of protected cells

function create_survey_HoT(this_survey) {
  var container = document.getElementById("survey_HoT");
  $("#survey_HoT").html("");
  survey_HoT = new Handsontable(container, {
    data: this_survey,
    minSpareCols: 1,
    minSpareRows: 1,
    rowHeaders: true,
    colHeaders: false,
    autoRowSize: true,
    autoColumnSize: true,
    contextMenu: {
      items: {
        about: {
          // Own custom option
          name: function () {
            // `name` can be a string or a function
            return "<b>Edit cell</b>"; // Name can contain HTML
          },
          hidden: function () {
            // `hidden` can be a boolean or a function
            // Hide the option when the first column was clicked
            return this.getSelectedLast()[0] === 0; // `this` === hot3
          },
          callback: function (key, selection, clickEvent) {
            // Callback for specific option
            this_sheet = this;
            $("#cell_editor_div").fadeIn();
            this_selection = selection;

            cell_editor.setValue(this_sheet.getDataAtCell(selection[0].start.row,selection[0].start.col),-1);

            if ($("#help_content").is(":visible")) {
              var helper_width = parseFloat(
                $("#help_content").css("width").replace("px", "")
              );

              $("#cell_editor_div").animate(
                {
                  width: window.innerWidth - helper_width,
                },
                500,
                function () {
                  cell_editor.resize();
                }
              );
            } else {
              $("#cell_editor_div").animate(
                {
                  width: window.innerWidth,
                },
                500,
                function () {
                  cell_editor.resize();
                }
              );
            }
          },
        },
        "---------": {
          name: "---------",
        },
        row_above: {
          name: "Insert row above",
        },
        row_below: {
          name: "Insert row below",
        },
        col_left: {
          name: "Insert column left",
        },
        col_right: {
          name: "Insert column right",
        },
        remove_row: {
          name: "Remove row",
        },
        remove_col: {
          name: "Remove column",
        },
        undo: {
          name: "Undo",
        },
        redo: {
          name: "Redo",
        },
        make_read_only: {
          name: "Read only",
        },
        alignment: {
          name: "Alignment",
        },
      },
    },
    colWidths: 100,
    rowHeights: 1,
    wordWrap: false,
    observeChanges: true,
    cells: function (row, col, prop) {
      var cellProperties = {};
      if (row === 0) {
        cellProperties.renderer = firstRowRenderer;
      } else {
        var thisHeader = this.instance.getDataAtCell(0, col);

        if(thisHeader !== null){
          thisHeader = thisHeader.toLowerCase();
        }
        cellProperties.renderer = Handsontable.renderers.TextRenderer;
      }
      return cellProperties;
    },
    afterSelectionEnd: function () {
      thisCellValue = this.getValue();
      var coords = this.getSelected();
      var column = this.getDataAtCell(0, coords[0][1]);
      column = column === null ? (column = "") : column;
      
      helperActivate(column, thisCellValue, "survey");
      checkTable();
      checkBranchAndType();
      checkItemNameSpaces();
      checkPipeSpaces();
    },
    beforeChange: function (changes, source) {
      changes.forEach(([row, col, oldValue, newValue]) => {
          if (nonDeletableColumns_sur.includes(oldValue) && newValue === '') {
              // Save the current value to restore it later if needed
              savedValues[`${row}_${col}`] = oldValue;
          }
      });
    },
    afterChange: function (changes, source) {
      /*
       * Check if they have just made a change to a default survey
       */
      if (!changes) return;
      changes.forEach(([row, col, oldValue, newValue]) => {
        const cellKey = `${row}_${col}`;
        if (nonDeletableColumns_sur.includes(oldValue) && newValue === '' && savedValues[cellKey]) {
          // Restore the saved value
          this.setDataAtCell(row, col, savedValues[cellKey]);
          bootbox.alert({
            title: 'Required Column',
            message: 'Sorry, you cannot delete this column as it is required for Collector to run your experiment.',
            buttons: { ok: { label: '<i class="fa fa-times"></i> Cancel' } }
          });
        }
      });
    
      var current_survey = $("#survey_select").val().split("|")[1];
    
      if (typeof master.surveys.default_surveys[current_survey] !== "undefined") {
        $('#save_survey_btn, #rename_survey_btn, #delete_survey_btn, #add_survey_item_btn, #branching_btn, #scoring_btn').hide();
        $("#dm_h6_text").show();
        Collector.custom_alert("These changes will not be saved, as you are editing a <b>default</b> survey. Please click <b>New Survey</b> to create a new survey");
      }
    
      var middleColEmpty = 0;
      var middleRowEmpty = 0;
      var postEmptyCol = 0;
      var postEmptyRow = 0;
    
      for (var k = 0; k < this.countCols() - 1; k++) {
        var col_header = this.getDataAtCell(0, k).toLowerCase();
        if (col_header.toLowerCase() !== "text") {
    
          var row_count = this.countRows();
    
          for (var m = 1; m < row_count - 1; m++) {
            var this_item = this.getDataAtCell(m, k);
    
            /*
            * replace "." with "_" to prevent errors from "."s
            */
            if (col_header !== "text" && col_header !== "answers") {
              if (typeof this_item === 'string' && this_item.includes('.')) {
                this.setDataAtCell(m, k, this_item.replace(/\./g, '_'));
              }
            } else {
              // do nothing
            }
          }
        }
    
        if (col_header.indexOf("score") !== -1 && col_header.indexOf(" ") !== -1) {
          this.setDataAtCell(0, k, col_header.replaceAll(" ", ""));
        }
    
        if (col_header === "shuffle") {
          this.setDataAtCell(0, k, "shuffle_question");
        }
    
        //Removing Empty middle columns
        if (this.isEmptyCol(k)) {
          if (middleColEmpty === 0) {
            middleColEmpty = 1;
          }
        }
        if (!this.isEmptyCol(k) & (middleColEmpty === 1)) {
          postEmptyCol = 1;
          //delete column that is empty
          this.alter("remove_col", k - 1);
          middleColEmpty = 0;
        }
      }
    
      //Same thing for rows
      for (var k = 0; k < this.countRows() - 1; k++) {
        if (this.isEmptyRow(k)) {
          if (middleRowEmpty === 0) {
            middleRowEmpty = 1;
          }
        }
        if (!this.isEmptyRow(k) & (middleRowEmpty === 1)) {
          postEmptyRow = 1;
          this.alter("remove_row", k - 1);
          middleRowEmpty = 0;
        }
      }
      if (postEmptyCol !== 1) {
        while (this.countEmptyCols() > 1) {
          this.alter("remove_col", this.countCols);
        }
      }
      if (postEmptyRow !== 1) {
        while (this.countEmptyRows() > 1) {
          this.alter("remove_row", this.countRows);
        }
      }
    },
    beforeRemoveCol: function (index, amount) {
      for (let i = 0; i < amount; i++) {
        const colHeader = this.getDataAtCell(0, index + i);
        if (nonDeletableColumns_sur.includes(colHeader)) {
          bootbox.alert({
            title: 'Required Column',
            message: 'Sorry, you cannot delete this column as it is required for Collector to run your experiment.',
            buttons: {
              ok: {
                label: '<i class="fa fa-times"></i> Cancel'
              }
            }
          });
          return false; // Prevent the deletion
        }
      }
    },
    beforeRemoveRow: function (index, amount) {
      if (index === 0) {
        bootbox.alert({
          title: 'Required Row',
          message: 'Sorry, you cannot delete this row as it is required by Collector.',
          buttons: {
            ok: {
              label: '<i class="fa fa-times"></i> Cancel'
            }
          }
        });
        return false; // Prevent the deletion of the first row
      }
    }
  });
  preview_survey(this_survey);
}

function list_surveys() {
  try {
    $("#survey_select").empty();
    $("#survey_select").append("<option disabled>Select a survey</option>");
    $("#survey_select").val("Select a survey");

    if (
      typeof master.surveys === "undefined" ||
      typeof master.surveys.user_surveys === "undefined"
    ) {
      master.surveys = {
        preview: false,
        user_surveys: {},
      };
    }
    master.surveys =
      typeof master.surveys === "undefined" ? {} : master.surveys;
    master.surveys.default_surveys = {};

    master.surveys.user_surveys =
      typeof master.surveys.user_surveys === "undefined"
        ? {}
        : master.surveys.user_surveys;
    master.surveys.default_surveys = Collector.clean_obj_keys(
      master.surveys.default_surveys
    );

    var survey_files = JSON.parse(CElectron.fs.list_surveys());

    survey_files.forEach(function (survey_file) {
      var survey_csv = Papa.parse(
        CElectron.fs.read_file("Surveys", survey_file)
      ).data;

      master.surveys.user_surveys[survey_file] = survey_csv;
    });

    var user_survey_list = Object.keys(master.surveys.user_surveys).sort();

    load_default_surveys();
    user_survey_list.forEach(function (user_survey) {
      $("#survey_select").append(
        $("<option>", {
          text: user_survey,
          value: "user|" + user_survey,
          class: "bg-white text-dark",
        })
      );
    });
// setTimeout(function(){
//   $('#survey_select :nth-child(7)').after("<option disabled>--- User Surveys ---</option>");
// },500);
  
    Collector.tests.pass("surveys", "list");
  } catch (error) {
    /* muting this error for now

    Collector.tests.fail("surveys",
                         "list",
                         error);
                         */
  }
}

function preview_survey(this_survey) {
  master.surveys.preview = true;

  survey_template = CElectron.fs.read_default(
    "DefaultPhaseTypes",
    "survey.html"
  );
  survey_template = survey_template.replace('"{{survey}}"',JSON.stringify(this_survey));
  doc = document.getElementById("survey_preview").contentWindow.document;
  doc.open();
  doc.write(libraries + survey_template);
  doc.close();
};

function checkTable() {
  const headers = survey_HoT.getDataAtRow(0);
  const itemNameIndex = headers.indexOf('item_name');
  const typeIndex = headers.indexOf('type');
  const blockIndex = headers.indexOf('block');

  if (itemNameIndex === -1 || typeIndex === -1) {
      console.error("Could not find required columns in the table header.");
      return;
  }

  // // Check if page breaks exist
  // let pageBreakExists = false;
  // const rowCount = survey_HoT.countRows();

  // for (let rowIndex = 1; rowIndex < rowCount; rowIndex++) { // Start from 1 to skip the header row
  //     const itemNameCell = survey_HoT.getDataAtCell(rowIndex, itemNameIndex);
  //     const typeCell = survey_HoT.getDataAtCell(rowIndex, typeIndex);

  //     if (itemNameCell === 'page_break' || typeCell === 'page_break') {
  //         pageBreakExists = true;
  //         break;
  //     }
  // }

  // // Check if the block column exists when page_breaks are being used.
  // if (pageBreakExists) { //CHRISDOBSON
  //     if (blockIndex === -1) {
  //       console.log("All good: 'block' column does not exist.");
  //     } else {
  //       bootbox.alert("Warning: At the moment you cannot use page breakes when branching the survey. We've deleted the row automatically for you.");
  //       deletePageBreakRows();
  //       $("#save_btn").click();
  //     }
  // } else {
  //     console.log("No 'page_break' found.");
  // }
};

// This funtion is used to remove page break rows if someone sets up branching so they don't clash
function deletePageBreakRows() {
  const headers = survey_HoT.getDataAtRow(0);
  const itemNameIndex = headers.indexOf('item_name');
  const typeIndex = headers.indexOf('type');
  const rowCount = survey_HoT.countRows();

  for (let rowIndex = rowCount - 1; rowIndex > 0; rowIndex--) { // Iterate in reverse order to avoid index shifting issues
      const itemNameCell = survey_HoT.getDataAtCell(rowIndex, itemNameIndex);
      const typeCell = survey_HoT.getDataAtCell(rowIndex, typeIndex);

      if (itemNameCell === 'page_break' || typeCell === 'page_break') {
        survey_HoT.alter('remove_row', rowIndex);
      }
  }
  
};

// Function to check that people are only trying to use fields that can branch to brach
function checkBranchAndType() {
  const headers = survey_HoT.getDataAtRow(0);
  const branchIndex = headers.indexOf('branch');
  const typeIndex = headers.indexOf('type');

  if (branchIndex === -1) {
      console.log("'branch' column does not exist.");
      return;
  }

  const allowedTypes = ['likert', 'dropdown', 'radio', 'radio_horizontal'];
  const rowCount = survey_HoT.countRows();

  for (let rowIndex = 1; rowIndex < rowCount; rowIndex++) { // Start from 1 to skip the header row
      const branchCell = survey_HoT.getDataAtCell(rowIndex, branchIndex);
      const typeCell = survey_HoT.getDataAtCell(rowIndex, typeIndex);

      if (branchCell && branchCell.trim() !== '' && !allowedTypes.includes(typeCell)) {
          bootbox.prompt({
              title: "Invalid type value. Please select a new type:",
              message: "<em>Sorry. You can only branch from likert, dropdown, or radio types.</em><br>",
              inputType: 'radio',
              inputOptions: [
                  { text: 'Likert', value: 'likert' },
                  { text: 'Dropdown', value: 'dropdown' },
                  { text: 'Horizontal Radio', value: 'radio_horizontal' },
                  { text: 'Vertical Radio', value: 'radio' }
              ],
              callback: function(result) {
                  if (result) {
                      survey_HoT.setDataAtCell(rowIndex, typeIndex, result);
                      setTimeout(() => {
                        $("#save_btn").click();
                      }, 10);
                  }
              }
          });
      }
  }
}

// check if item_name has a space in it
function checkItemNameSpaces() {
  const headers = survey_HoT.getDataAtRow(0);
  const itemNameIndex = headers.indexOf('item_name');
  const rowCount = survey_HoT.countRows();

  for (let rowIndex = 1; rowIndex < rowCount; rowIndex++) { // Start from 1 to skip the header row
      let itemNameCell = survey_HoT.getDataAtCell(rowIndex, itemNameIndex);
      if (itemNameCell && itemNameCell.trim() !== '' && itemNameCell.includes(" ")) {      
        const updatedItemNameCell = itemNameCell.replace(/\s+/g, '_');
        survey_HoT.setDataAtCell(rowIndex, itemNameIndex, updatedItemNameCell);
        bootbox.alert("<b>Sorry. Item name's cannot contain spaces.</b><br><br>The item name: " + itemNameCell + " has been automatically converted to " + updatedItemNameCell);
        setTimeout(() => {$("#save_btn").click();}, 10);
      }
  }
};

function checkPipeSpaces() {
  const headers = survey_HoT.getDataAtRow(0);
  const rowCount = survey_HoT.countRows();
  const answersColIndex = headers.indexOf('answers');
  const valuesColIndex = headers.indexOf('values');

  for (let rowIndex = 1; rowIndex < rowCount; rowIndex++) { // Start from 1 to skip the header row
      let answersCell = survey_HoT.getDataAtCell(rowIndex, answersColIndex);
      if (answersCell && answersColIndex !== -1 && / \| |\| | \|/.test(answersCell)) {
        const updatedAnswersCell = answersCell.replace(/\s*\|\s*/g, '|');
        survey_HoT.setDataAtCell(rowIndex, answersColIndex, updatedAnswersCell);
        setTimeout(() => {$("#save_btn").click();}, 10);
      } 
      
      let valuesCell = survey_HoT.getDataAtCell(rowIndex, valuesColIndex);
      if (valuesCell && valuesColIndex !== -1 && / \| |\| | \|/.test(valuesCell)) {
        const updatedValuesCell = valuesCell.replace(/\s*\|\s*/g, '|');
        survey_HoT.setDataAtCell(rowIndex, valuesColIndex, updatedValuesCell);
        setTimeout(() => {$("#save_btn").click();}, 10);
      }
  }
};


