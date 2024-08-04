/*  ========================================================================================
    This controls the WYSIWYG 'Add Item' system on the projects page for the procedure table
    ========================================================================================  */

// Event listeners for dynamic form elements
$("#proc_addRow_btn").on("click", function () {
    /** *** */
    addNewProcRow();
    /** *** */  
});

// Functions

function createInsertRowOption() {
    return `
        <div class="form-group">
            <input type="checkbox" id="specific_row" onchange="toggleRowSelect()">    
            <label for="specific_row" id="specific_row_label">Insert after specific row?</label>
        </div>
        <div class="form-group" id="row_select_container" style="display: none;">
            <label for="row_select" id="row_select_label">Select preceding row</label>
            <select id="row_select" class="form-control form-select">
                <option value="" disabled selected id="row_placeholder">Available Phasetypes</option>
            </select>
        </div>
    `;
}

function toggleRowSelect() {
    var rowSelectContainer = document.getElementById('row_select_container');
    var specificRow = document.getElementById('specific_row').checked;
    if (specificRow) {
        populateRowSelect();
        rowSelectContainer.style.display = 'block';
    } else {
        rowSelectContainer.style.display = 'none';
    }
}

function populateRowSelect() {
    var itemNames = handsOnTable_Procedure.getDataAtCol(1).slice(1).filter(Boolean); // Get all item names from the first column except the first row
    var rowSelect = document.getElementById('row_select');
    rowSelect.innerHTML = `<option value="" disabled selected id="row_placeholder">Available Phasetypes</option>`;
    rowSelect.innerHTML += itemNames.map((name, index) => `<option value="${index}">${name}</option>`).join('');
    
    // If there is only one option, select it and disable the dropdown
    if (itemNames.length === 1) {
        rowSelect.value = 0;
        rowSelect.disabled = true;
    } else {
        rowSelect.disabled = false;
    }
}

function populateStimuliDropdowns() {
    var rowCount = handsOnTable_Stimuli.countRows();
    var stimuliStart = document.getElementById('stimuli_start');
    var stimuliEnd = document.getElementById('stimuli_end');
    
    stimuliStart.innerHTML = '<option value="" disabled selected>Start</option>';
    for (var i = 2; i <= rowCount - 1; i++) {
        stimuliStart.innerHTML += `<option value="${i}">${i}</option>`;
    }

    stimuliEnd.innerHTML = '<option value="" disabled selected>Finish</option>';
    for (var i = 3; i <= rowCount - 1; i++) {
        stimuliEnd.innerHTML += `<option value="${i}">${i}</option>`;
    }
}

function addNewProcOptions(callback) {
    // Mapping dropdowns to phasetypes and surveys.
    const phaseTypesOptions = $.map($("#phasetype_select option"), function(option) {
        if (option.value.toLowerCase() !== "select a file") {
            return option.value;
        }
    });

    const surveySheetOptions = $.map($("#survey_select option"), function(option) {
        if (option.value.toLowerCase() !== "select a survey") {
            return option.value.replace("default|", "").replace("user|", "");
        }
    });

    bootbox.dialog({
        title: "Enter details for the new 'procedure' row",
        message: `
            <form id="addItemForm">
                <p>This form allows you to add a new row to the <em>procedure</em> spreadsheet.</p>
                <div class="mb-3">
                    <label for="phaseTypes" id="phaseTypes_label"> Please select a phasetypes to use</label><span style="color: red;"> *</span>
                        <select id="phaseTypes" class="form-select" required>
                            <option value="" disabled selected id="pt_placeholder">Select phasetype</option>
                            ${phaseTypesOptions.map(option => `<option value="${option}">${option}</option>`).join('')}
                    </select>
                </div>
                <div class="mb-3">
                    <label id="use_surveySheet_label"><input type="checkbox" id="use_surveySheet"> Include a survey?</label>
                        <select id="surveySheet_select" class="form-select" required>
                            <option value="" disabled selected id="surveySheet_placeholder">Select survey</option>
                            ${surveySheetOptions.map(option => `<option value="${option}">${option}</option>`).join('')}
                        </select>
                </div>
                <div class="mb-3">
                    <label id="present_stimuli_label"><input type="checkbox" id="present_stimuli"> Present stimuli from <em>'Stimuli'</em> sheet during phase?</label>
                    <div id="stimuli_options" style="display: none;">
                        <div class="d-inline-block mr-2">
                            <label for="stimuli_start">Start</label>
                            <select id="stimuli_start" class="form-select" required></select>
                        </div>
                        <div class="d-inline-block">
                            <label for="stimuli_end">Finish</label>
                            <select id="stimuli_end" class="form-select" required></select>
                        </div>
                        <br>
                        <small class="form-text text-muted" style="font-style: italic;">Please select the required stimuli row numbers to present.</small>
                    </div>
                </div>
                <div class="mb-3">
                <div class="mb-3">
                    <label id="finish_after_time_label"><input type="checkbox" id="finish_after_time"> Finish phase after a set time?</label>
                </div>
                <div id="set_time_input" style="display: none;" class="input-group mb-3">
                    <input type="number" id="set_time" class="form-control" style="max-width: 250px!important;" placeholder="Phase length" required >
                    <div class="input-group-append" style="display: flex;">
                        <span class="input-group-text" id="set_time_append" style="width: 80px!important;border-radius: 0 5px 5px 0;">seconds</span>
                        <span class="ml-3" style="display: flex; align-items: center;">
                            <label id="hide_timer_label" class="mb-0" style="margin-left: 10px; width: 100px;">
                                <input type="checkbox" id="hide_timer"> Hide timer?
                            </label>
                        </span>
                    </div>
                </div>
                <div class="mb-3">
                    <label id="dynamic_text_label"><input type="checkbox" id="dynamic_text"> Set variable text accessible through {{text}}</label>
                    <div id="dynamic_text_input" style="display: none;">
                        <textarea id="dynamic_textarea" class="form-control" required rows="10" style="width: 100%; min-height:200px;"></textarea>
                        <small class="form-text text-muted" style="font-style: italic;"><b>Note:</b> You can style text via HTML</small>
                    </div>
                </div>
                <div class="mb-3">
                    <label id="notes_label"><input type="checkbox" id="notes"> Notes</label>
                    <div id="notes_input" style="display: none;">
                        <textarea id="notes_textarea" class="form-control" required rows="10" style="width: 100%; min-height:200px;"></textarea>
                        <small class="form-text text-muted" style="font-style: italic;"><b>Note:</b> You can access these notes via {{notes}}</small>
                    </div>
                </div>
                <div class="mb-3">
                    <label id="weight_phase_label"><input type="checkbox" id="weight_phase"> Weight phase</label>
                    <div id="weight_phase_input" style="display: none;">
                        <label><input type="radio" name="weight_option" value="0" required> Hide</label>
                        <label><input type="radio" name="weight_option" value="2" required> Repeat</label>
                    </div>
                </div>
                <div class="mb-3">
                    <label id="hide_progress_bar_label"><input type="checkbox" id="hide_progress_bar"> Hide progress bar</label>
                </div>
                ${createInsertRowOption()}
            </form>`,
        buttons: {
            submit: {
                label: 'Add',
                className: 'btn-primary',
                callback: function () {

                    var stimuli = $('#present_stimuli').is(':checked') ?  `${$('#stimuli_start').val()} to ${$('#stimuli_end').val()}` : '0';
                    var phaseType = $('#use_surveySheet').is(':checked') ? 'survey' : $('#phaseTypes').val();               
                    var surveySheet = $('#use_surveySheet').is(':checked') ? $('#surveySheet_select').val() : '';
                    var finishAfterTime = $('#finish_after_time').is(':checked') ? $('#set_time').val() : 'user';
                    var hideTimer = $('#finish_after_time').is(':checked') && $('#hide_timer').is(':checked') ? 'display:none;' : '';
                    var dynamicText = $('#dynamic_text').is(':checked') ? $('#dynamic_textarea').val() : '';
                    var notes = $('#notes').is(':checked') ? $('#notes_textarea').val() : '';
                    var weightPhase = $('#weight_phase').is(':checked') ? $('input[name="weight_option"]:checked').val() : '';
                    var hideProgressBar = $('#hide_progress_bar').is(':checked') ? 'yes' : '';
                    var specificRow = $('#specific_row').is(':checked');
                    var rowIndex = $('#row_select').val();

                    var missingFields = [];

                    if (!phaseType) {
                        missingFields.push("Phasetype selection");
                        $('#phaseTypes_label').css('color', 'red');
                    }
                    if ($('#use_surveySheet').is(':checked') && !surveySheet) {
                        missingFields.push("Survey selection");
                        $('#use_surveySheet_label').css('color', 'red');
                    }
                    if ($('#present_stimuli').is(':checked') && (!$('#stimuli_start').val() || !$('#stimuli_end').val())) {
                        missingFields.push("Stimuli presentation values");
                        $('#present_stimuli_label').css('color', 'red');
                    }
                    if ($('#finish_after_time').is(':checked') && !$('#set_time').val()) {
                        missingFields.push("Finish phase time");
                        $('#finish_after_time_label').css('color', 'red');
                    }
                    if ($('#dynamic_text').is(':checked') && !$('#dynamic_textarea').val()) {
                        missingFields.push("Variable text");
                        $('#dynamic_text_label').css('color', 'red');
                    }
                    if ($('#notes').is(':checked') && !$('#notes_textarea').val()) {
                        missingFields.push("Notes");
                        $('#notes_label').css('color', 'red');
                    }
                    if ($('#weight_phase').is(':checked') && !$('input[name="weight_option"]:checked').val()) {
                        missingFields.push("Phase weight");
                        $('#weight_phase_label').css('color', 'red');
                    }
                    if ($('#specific_row').is(':checked') && !rowIndex) {
                        missingFields.push("Row to add new procedure after");
                        $('#row_select_label').css('color', 'red');
                        $('#specific_row_label').css('color', 'red');
                    }

                    if (missingFields.length > 0) {
                        bootbox.alert("The following fields are missing: " + missingFields.join(', '));
                        return false;
                    }

                    callback(stimuli, phaseType, surveySheet, finishAfterTime, hideTimer, dynamicText, notes, weightPhase, hideProgressBar, specificRow ? parseInt(rowIndex) + 2 : null);
                    return true;
                }
            },
            cancel: {
                label: 'Cancel',
                className: 'btn-secondary'
            }
        }
    });

    // Check for single option in dropdowns and disable them if necessary
    function checkAndDisableSingleOption(selectId) {
        var selectElement = document.getElementById(selectId);
        if (selectElement && selectElement.options.length === 2) { // One real option + one placeholder
            selectElement.selectedIndex = 1;
            selectElement.disabled = true;
        }
    }

    checkAndDisableSingleOption('phaseTypes');
    checkAndDisableSingleOption('surveySheet_select');

    // Populate the stimuli dropdowns with row numbers
    populateStimuliDropdowns();

    // Move event listeners call here so it runs after the Bootbox dialog is created
    event_listeners();

    window.toggleRowSelect = toggleRowSelect;
}

function addNewProcRow() {
    addNewProcOptions(function (stimuli, phaseType, surveySheet, finishAfterTime, hideTimer, dynamicText, notes, weightPhase, hideProgressBar, insertAfterRow) {

        var currentData = handsOnTable_Procedure.getData();
        var colCount = handsOnTable_Procedure.countCols();
        var firstRow = currentData[0] || []; // Ensure firstRow is an array

        var columnNames = ['item', 'phasetype', 'max_time', 'shuffle_1', 'weight'];
        if (dynamicText) columnNames.push('text');
        if (surveySheet) columnNames.push('surveySheet');
        if (notes) columnNames.push('notes');
        if (hideTimer) columnNames.push('timer_style');
        if (hideProgressBar) columnNames.push('no_progress');
        if (weightPhase) columnNames.push('weight');

        var columnIndices = {};

        function getColumnPositions() {
            for (var i = 0; i < colCount; i++) {
                if (firstRow[i] != null) { // Ensure firstRow[i] is not null
                    columnIndices[firstRow[i]] = i;
                }
            }
        }
        getColumnPositions();

        var existingColumns = new Set(firstRow.filter(Boolean)); // Filter out null/undefined values
        
        var columnsToAdd = columnNames.filter(name => !existingColumns.has(name));

        if (columnsToAdd.length > 0) {
            var insertPos = colCount - 1; // Insert before the last column, which is always blank
            for (var i = 0; i < columnsToAdd.length; i++) {
                handsOnTable_Procedure.setDataAtCell(0, insertPos + i, columnsToAdd[i]);
                columnIndices[columnsToAdd[i]] = insertPos + i;
            }
            
            handsOnTable_Procedure.render();
            colCount = handsOnTable_Procedure.countCols();
            getColumnPositions();
        }

        // Check for duplicate item_name
        var itemNameColIndex = columnIndices['item_name'];
        if (itemNameColIndex !== undefined) {
            var itemNameExists = currentData.some(row => row[itemNameColIndex] === itemName);
            if (itemNameExists) {
                bootbox.prompt({
                    title: "The item_name is not unique. Please enter a new item_name:",
                    callback: function(newItemName) {
                        if (newItemName !== null) { // If the user provided a new item name
                            itemName = newItemName.toLowerCase().replace(/ /g, '_');
                            addRow(insertAfterRow);
                        }
                    }
                });
                return;
            }
        }

        function addRow(insertAfterRow) {
            var newRow = Array(colCount).fill('');

            if (columnIndices['item'] !== undefined) newRow[columnIndices['item']] = stimuli;
            if (columnIndices['phasetype'] !== undefined) newRow[columnIndices['phasetype']] = phaseType;
            if (columnIndices['survey'] !== undefined) newRow[columnIndices['survey']] = surveySheet;
            if (columnIndices['max_time'] !== undefined) newRow[columnIndices['max_time']] = finishAfterTime;
            if (columnIndices['shuffle_1'] !== undefined) newRow[columnIndices['shuffle_1']] = 'off';
            if (columnIndices['timer_style'] !== undefined && hideTimer) newRow[columnIndices['timer_style']] = hideTimer;
            if (columnIndices['text'] !== undefined) newRow[columnIndices['text']] = dynamicText;
            if (columnIndices['notes'] !== undefined && notes) newRow[columnIndices['notes']] = notes;
            if (columnIndices['weight'] !== undefined) newRow[columnIndices['weight']] = weightPhase;
            if (columnIndices['no_progress'] !== undefined && hideProgressBar) newRow[columnIndices['no_progress']] = hideProgressBar;

            if (insertAfterRow !== null) {
                handsOnTable_Procedure.alter('insert_row', insertAfterRow);
                handsOnTable_Procedure.populateFromArray(insertAfterRow, 0, [newRow]);
            } else {
                handsOnTable_Procedure.populateFromArray(handsOnTable_Procedure.countRows(), 0, [newRow]);
            }

            handsOnTable_Procedure.render();
            setTimeout(() => {
                $("#save_btn").click();
            }, 100);
        }

        addRow(insertAfterRow);
    });
}

function event_listeners() {
    $(document).on('change', '#present_stimuli', function() {
        $('#stimuli_options').toggle(this.checked);
        if (this.checked) {
            $('#stimuli_start, #stimuli_end').attr('required', true);
            populateStimuliDropdowns(); // Populate dropdowns when the option is checked
        } else {
            $('#stimuli_start, #stimuli_end').removeAttr('required');
        }
    });

    $(document).on('change', '#use_surveySheet', function() {
        if (this.checked) {
            $('#phaseTypes').val('survey').prop('disabled', true).attr('required', true);
            $('#surveySheet_select').attr('required', true);
            $('#surveySheet_options').show();
        } else {
            $('#phaseTypes').prop('disabled', false).attr('required', true);
            $('#phaseTypes').val('').change(); // Reset to placeholder
            $('#surveySheet_select').removeAttr('required');
            $('#surveySheet_options').hide();
        }
    });

    $(document).on('change', '#phaseTypes', function() {
        if ($(this).val() === 'surveySheet') {
            $('#use_surveySheet').prop('checked', true);
            $('#surveySheet_options').show();
            $('#surveySheet_select').attr('required', true);
            $(this).prop('disabled', true);
        } else {
            $('#use_surveySheet').prop('checked', false);
            $('#surveySheet_options').hide();
            $('#surveySheet_select').removeAttr('required');
            $(this).prop('disabled', false);
        }
    });

    $(document).on('change', '#finish_after_time', function() {
        $('#set_time_input').toggle(this.checked);
        if (this.checked) {
            $('#set_time').attr('required', true);
        } else {
            $('#set_time').removeAttr('required');
        }
    });

    $(document).on('change', '#dynamic_text', function() {
        $('#dynamic_text_input').toggle(this.checked);
        if (this.checked) {
            $('#dynamic_textarea').attr('required', true);
        } else {
            $('#dynamic_textarea').removeAttr('required');
        }
    });

    $(document).on('change', '#notes', function() {
        $('#notes_input').toggle(this.checked);
        if (this.checked) {
            $('#notes_textarea').attr('required', true);
        } else {
            $('#notes_textarea').removeAttr('required');
        }
    });

    $(document).on('change', '#weight_phase', function() {
        $('#weight_phase_input').toggle(this.checked);
        if (this.checked) {
            $('input[name="weight_option"]').attr('required', true);
        } else {
            $('input[name="weight_option"]').removeAttr('required');
        }
    });
}
