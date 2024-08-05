/*  Collector (Garcia, Kornell, Kerr, Blake & Haffey)
    A program for running projects on the web
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

		Kitten/Cat release (2019-2022) author: Dr. Anthony Haffey
*/
var thisCellValue;
var this_sheet;
var this_selection;
function isStimuliHeader(colHeader) {
  var isStimuliCol = false;
  if (colHeader === "stimuli") isStimuliCol = true;
  return isStimuliCol;
}
function isProcedureHeader(colHeader) {
  var isProcedureCol = false;
  if (colHeader === "procedure") isProcedureCol = true;
  return isProcedureCol;
}
function isPhaseTypeHeader(colHeader) {
  var isPhaseTypeCol = false;
  if (colHeader === "phasetype") isPhaseTypeCol = true;
  if (colHeader.substr(0, 5).toLowerCase() === "post " && colHeader.substr(-11) === " trial type") {
    postN = colHeader.substr(5, colHeader.length - 16);
    postN = parseInt(postN);
    if (!isNaN(postN) && postN !== 0) {
      isPhaseTypeCol = true;
    }
  }
  return isPhaseTypeCol;
}
function isNumericHeader(colHeader) {
  var isNum = false;
  if (colHeader.toLowerCase().substr(-4) === "item") isNum = true;
  if (colHeader.toLowerCase().substr(-8) === "max_time") isNum = true;
  if (colHeader.toLowerCase().substr(-8) === "min time") isNum = true;
  return isNum;
}
function isShuffleHeader(colHeader) {
  var isShuffle = false;
  if (colHeader.toLowerCase().indexOf("shuffle") !== -1) isShuffle = true;
  return isShuffle;
}
function isSurveyHeader(colHeader){
  var isSurvey = false;
  if (colHeader.toLowerCase() === "survey") isSurvey = true;
  return isSurvey;
}

function firstRowRenderer(instance, td, row, col, prop, value, cellProperties) {
  Handsontable.renderers.TextRenderer.apply(this, arguments);
  td.style.fontWeight = "bold";
  if (value == "") {
    $(td).addClass("htInvalid");
  }
}
function numericRenderer(instance, td, row, col, prop, value, cellProperties) {
  Handsontable.renderers.TextRenderer.apply(this, arguments);
  if (isNaN(value) || value === "") {
    td.style.background = "#D8F9FF";
  }
}
function shuffleRenderer(instance, td, row, col, prop, value, cellProperties) {
  Handsontable.renderers.TextRenderer.apply(this, arguments);
  if (value === "") {
    td.style.background = "#DDD";
  } else if (
    typeof value === "string" &&
    (value.indexOf("#") !== -1 || value.toLowerCase() === "off")
  ) {
    td.style.background = "#DDD";
  }
}
function trialTypesRenderer(
  instance,
  td,
  row,
  col,
  prop,
  value,
  cellProperties
) {
  Handsontable.renderers.AutocompleteRenderer.apply(this, arguments);
  if (value === "Nothing" || value === "") {
    if (instance.getDataAtCell(0, col) === "trial type") {
      $(td).addClass("htInvalid");
    } else {
      td.style.background = "#DDD";
    }
  }
}

// Used to monitor the number of tables created
var tables = {}; // Global object to store Handsontable instances
const nonDeletableColumns_proj = ['item', 'phasetype', 'max_time', 'shuffle_1', 'name', 'stimuli','procedure','participant_id']; // QWERTY - Add any required columns to this list for projects' tables.
var savedValues = {}; // Object to save the values of protected cells

function createHoT(container, data, sheet_name, tableId) {
  // Create the Handsontable instance
  var table = new Handsontable(container, {
    data: data,
    minSpareCols: 1,
    minSpareRows: 1,

    /*
     * Functions
    */
    beforeChange: function (changes, source) {
      changes.forEach(([row, col, oldValue, newValue]) => {
        if (nonDeletableColumns_proj.includes(oldValue) && newValue === '') {
          // Save the current value to restore it later if needed
          savedValues[`${row}_${col}`] = oldValue;
        }
      });
    },
    afterChange: function (changes, source) {
      if (!changes) return;

      // Function to check for duplicates in row 1 of another table
      function checkForDuplicates(newValue, otherTable) {
        if (newValue === '') {
          return false; // Exclude empty values
        }

        // Ignore the last column of the tables
        if ($(otherTable.container).is(":visible")) {
          for (let col = 0; col < otherTable.countCols() - 1; col++) {
            if (otherTable.getDataAtCell(0, col) === newValue) {
              console.log(`Duplicate found in ${otherTable === proceduresTable ? 'handsOnTable_Procedure' : 'handsOnTable_Stimuli'} at column ${col}`);
              return true;
            }
          }
        }
        return false;
      }

      // Function to log row 1 values
      function logRow1Values(table1, table2) {
        if ($(table1.container).is(":visible")) {
          console.log("handsOnTable_Procedure row 1 values: ", table1.getDataAtRow(0));
        }
        if ($(table2.container).is(":visible")) {
          console.log("handsOnTable_Stimuli row 1 values: ", table2.getDataAtRow(0));
        }
      }

      // Get references to the other tables
      var proceduresTable = tables['handsOnTable_Procedure'];
      var stimuliTable = tables['handsOnTable_Stimuli'];

      changes.forEach(([row, col, oldValue, newValue]) => {
        console.log(`Change detected at row ${row}, col ${col}: ${oldValue} -> ${newValue}`);
        const cellKey = `${row}_${col}`;
        if (nonDeletableColumns_proj.includes(oldValue) && newValue === '' && savedValues[cellKey]) {
          // Restore the saved value
          console.log(`Restoring saved value for cell ${cellKey}: ${savedValues[cellKey]}`);
          this.setDataAtCell(row, col, savedValues[cellKey]);
          bootbox.alert({
            title: 'Required Column',
            message: 'Sorry, you cannot delete this column as it is required for Collector to run your experiment.',
            buttons: { ok: { label: '<i class="fa fa-times"></i> Cancel' } }
          });
        }

        // Check for duplicates if the change is in the first row
        if (row === 0) {
          logRow1Values(proceduresTable, stimuliTable); // Logging current state
          if (this === proceduresTable && checkForDuplicates(newValue, stimuliTable)) {
            bootbox.prompt({
              title: 'Duplicate Name',
              message: 'The name already exists in the first row of the Stimuli table. Please enter a new name:',
              callback: function (result) {
                if (result) {
                  table.setDataAtCell(row, col, result);
                }
              }
            });
          } else if (this === stimuliTable && checkForDuplicates(newValue, proceduresTable)) {
            bootbox.prompt({
              title: 'Duplicate Name',
              message: 'The name already exists in the first row of the Procedures table. Please enter a new name:',
              callback: function (result) {
                if (result) {
                  table.setDataAtCell(row, col, result);
                }
              }
            });
          }
        }
      });

      // Existing code logic
      var middleColEmpty = 0;
      var middleRowEmpty = 0;
      var postEmptyCol = 0; //identify if there is a used col after empty one
      var postEmptyRow = 0; // same for rows

      //identify if repetition has occurred and adjusting value
      var topRow = [];
      for (var k = 0; k < this.countCols() - 1; k++) {
        // loop through columns (for identical headers)
        cellValue = this.getDataAtCell(0, k); // store the current column header
        topRow[k] = this.getDataAtCell(0, k); // add the current column header to topRow array
        for (l = 0; l < k; l++) {
          // loop through all the columns before the current one
          if (this.getDataAtCell(0, k) === this.getDataAtCell(0, l)) {
            // if another column has the same header:
            if (this.isEmptyCol(k)) {
              // check if it's a blank column
              this.alter("remove_col", k); // delete the column
            } else {
              // otherwise we assume it's matching a previous header
              this.setDataAtCell(0, k, this.getDataAtCell(0, k) + "*"); // add a star to the title to avoid identical titles
              Collector.custom_alert(
                "You have identical headers for two columns '" + // let the user know the change has happened
                  this.getDataAtCell(0, k) +
                  "', we have added a * to address this"
              );
            }
          }
        }
      }     
      // go through each column
      for (var k = 0; k < this.countCols() - 1; k++) {
        // if the loop has gone past the last column then stop looping through the columns
        if (k >= this.countCols()) {
          break;
        }

        if (this.getDataAtCell(0, k).toLowerCase().indexOf("shuffle ") !== -1 ) {
          this.setDataAtCell(0, k, this.getDataAtCell(0, k).toLowerCase().replace("shuffle ", "shuffle_"));
        }

        if (this.getDataAtCell(0, k).toLowerCase() === "max time") {
          this.setDataAtCell(0, k, "max_time");
        }
        if (this.getDataAtCell(0, k).toLowerCase() === "code") {
          this.setDataAtCell(0, k, "phasetype");
        }
        if (this.getDataAtCell(0, k).toLowerCase() === "trial type") {
          this.setDataAtCell(0, k, "phasetype");
        }
        // checking for invalid item number (i.e. one)
        if (this.getDataAtCell(0, k).toLowerCase() === "item") {
          // loop through each row
          for (m = 0; m < this.countRows() -1; m++) {
            // if the value in the row is one
            if (this.getDataAtCell(m, k) === 1) {
              bootbox.alert(
                "Warning: 1 does not refer to any row in the Stimuli sheet! The first row is row 2 (as row 1 is the header). Fix row " +
                  (m + 1) +
                  "in your Procedure's Item column."
              );
            }
            // if the value is something
            if (this.getDataAtCell(m, k) !== null) {
              // check if the user is using a ":" (deprecated)
              if (this.getDataAtCell(m, k).indexOf(":") !== -1) {
                this.setDataAtCell(
                  m,
                  k,
                  this.getDataAtCell(m, k).replace(":", " to ")
                );
              }
              if (this.getDataAtCell(m, k).indexOf("-") !== -1) {
                this.setDataAtCell(
                  m,
                  k,
                  this.getDataAtCell(m, k).replace("-", " to ")
                );
              }
            }            
          }
          for (var m = 1; m < this.countRows() - 1; m++) {  // Skip the first and last row
            var cellValue = this.getDataAtCell(m, k);
            if (cellValue === "") {
              this.setDataAtCell(m, k, "0");
            }
          }
        }
        // if this is an empty middle column
        if (this.isEmptyCol(k) && !nonDeletableColumns_proj.includes(this.getDataAtCell(0, k))) {
          // remove this empty middle column
          this.alter("remove_col", k);
          // and then check this column number again
          k--;
        }
      }
      // go through each row
      for (var k = 0; k < this.countRows() - 1; k++) {
        // if the loop has gone past the last row then stop looping through the rows
        if (k >= this.countRows()) {
          break;
        }

        if (this.isEmptyRow(k)) {
          // if the row is empty delete row
          this.alter("remove_row", k);

          // and then check this row number again.
          k--;
        }
      }

      var project = $("#project_list").val();
      var this_proj = master.projects.projects[project];

      if (sheet_name.toLowerCase() === "conditions.csv") {
        this_proj.conditions = this.getData();
      } else {
        if (typeof this_proj.all_stims[sheet_name] !== "undefined") {
          this_proj.all_stims[sheet_name] = Papa.unparse(this.getData());
        } else if (typeof this_proj.all_procs[sheet_name] !== "undefined") {
          this_proj.all_procs[sheet_name] = Papa.unparse(this.getData());
        } else {
          alert("error - " + sheet_name + " not found in " + project);
        }
      }
    },
    afterInit: function () {

    },
    afterCreateCol: function () {

    },
    afterRemoveCol: function () {
      // This just forces a change into the table to ensure that the removal sticks after saving, as you need a cell change to re-render the table
      const totalColumns = this.countCols();

      if (totalColumns > 0) {
        const rowIndex = 0;

        const colIndex = totalColumns - 1;

        this.setDataAtCell(rowIndex, colIndex, '');

        setTimeout(() => {
          this.setDataAtCell(rowIndex, colIndex, null);
        }, 1);  
      }
    },
    afterRemoveRow: function () {
      // This just forces a change into the table to ensure that the removal sticks after saving, as you need a cell change to re-render the table
      const totalColumns = this.countCols();

      if (totalColumns > 0) {
        const rowIndex = 0;

        const colIndex = totalColumns - 1;

        this.setDataAtCell(rowIndex, colIndex, '');

        setTimeout(() => {
          this.setDataAtCell(rowIndex, colIndex, null);
        }, 1);  
      }
    },

    afterSelectionEnd: function () {
      thisCellValue = this.getValue();

      var coords = this.getSelected();
      var column = this.getDataAtCell(0, coords[0][1]);

      // thisCellValue =
      //   thisCellValue === null ? (thisCellValue = "") : thisCellValue;
      column = column === null ? (column = "") : column;
      window["Current HoT Coordinates"] = coords;
      helperActivate(column, thisCellValue, sheet_name);
    },

    cells: function (row, col, prop) {
      var cellProperties = {};
      if (row === 0) {
        cellProperties.renderer = firstRowRenderer;
      } else {
        var thisHeader = this.instance.getDataAtCell(0, col);

        if(thisHeader !== null){
          thisHeader = thisHeader.toLowerCase();
        }
        if (typeof thisHeader === "string" && thisHeader !== "") {
          if ((thisHeader === "code") | (thisHeader === "trialtype")) {
            thisHeader = "phasetype";
            this.instance.setDataAtCell(0, col, thisHeader);
          }
          if (isProcedureHeader(thisHeader)) {
            cellProperties.type = "dropdown";
            cellProperties.visibleRows = 10;
            cellProperties.source = $.map(
              $("#proc_select option"), function(option){
                if(option.value.toLowerCase() !== "select a procedure"){
                  return option.value;
                }
              }
            );
            cellProperties.trimDropdown = false;
            //cellProperties.renderer = trialTypesRenderer;
          } else if (isStimuliHeader(thisHeader)) {
            cellProperties.type = "dropdown";
            cellProperties.visibleRows = 10;
            cellProperties.source = $.map(
              $("#stim_select option"), function(option){
                if(option.value.toLowerCase() !== "select a stimuli"){
                  return option.value;
                }
              }
            );
            cellProperties.trimDropdown = false;
            //cellProperties.renderer = trialTypesRenderer;
          } else if (isPhaseTypeHeader(thisHeader)) {
            cellProperties.type = "dropdown";
            cellProperties.visibleRows = 10;
            cellProperties.source = $.map(
              $("#phasetype_select option"), function(option){
                if(option.value.toLowerCase() !== "select a file"){
                  return option.value;
                }
              }
            );
            cellProperties.trimDropdown = false;
            //cellProperties.renderer = trialTypesRenderer;
          } else if(isSurveyHeader(thisHeader)){
            cellProperties.type = "dropdown";
            cellProperties.visibleRows = 10;
            cellProperties.source = $.map(
              $("#survey_select option"), function(option){
                if(option.value.toLowerCase() !== "select a survey"){
                  return option.value
                    .replace("default|", "")
                    .replace("user|", "");
                }
              }
            );
            cellProperties.trimDropdown = false;
            //cellProperties.renderer = trialTypesRenderer;
          } else {
            cellProperties.type = "text";
            if (isNumericHeader(thisHeader)) {
              cellProperties.renderer = numericRenderer;
            } else if (isShuffleHeader(thisHeader)) {
              cellProperties.renderer = shuffleRenderer;
            } else {
              cellProperties.renderer = Handsontable.renderers.TextRenderer;
            }
          }
        } else {
          cellProperties.renderer = Handsontable.renderers.TextRenderer;
        }
      }
      return cellProperties;
    },

    wordWrap: false,
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

            cell_editor_obj.content_before = this_sheet.getDataAtCell(
              selection[0].start.row,
              selection[0].start.col
            );

            cell_editor.setValue(
              this_sheet.getDataAtCell(
                selection[0].start.row,
                selection[0].start.col
              ),
              -1
            );

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
    rowHeaders: true,
    colHeaders: false,
    beforeRemoveCol: function (index, amount) {
      for (let i = 0; i < amount; i++) {
        const colHeader = this.getDataAtCell(0, index + i);
        if (nonDeletableColumns_proj.includes(colHeader)) {
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

  // Store the table instance in the global object
  tables[tableId] = table;
  return table;
}


//https://stackoverflow.com/a/28353499/4490801
function insertAtCaret(areaId, text) {
  var txtarea = document.getElementById(areaId);
  var scrollPos = txtarea.scrollTop;
  var caretPos = txtarea.selectionStart;

  var front = txtarea.value.substring(0, caretPos);
  var back = txtarea.value.substring(
    txtarea.selectionEnd,
    txtarea.value.length
  );
  txtarea.value = front + text + back;
  caretPos = caretPos + text.length;
  txtarea.selectionStart = caretPos;
  txtarea.selectionEnd = caretPos;
  txtarea.focus();
  txtarea.scrollTop = scrollPos;
}
