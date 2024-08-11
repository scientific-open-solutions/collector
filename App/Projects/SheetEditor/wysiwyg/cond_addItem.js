/*  ==============================================================================================
    This controls the WYSIWYG 'Add Condition' system on the projects page for the conditions table
    ==============================================================================================  */

// Event listeners for dynamic form elements
$("#cond_addRow_btn").on("click", function () {
    /** *** */
    addNewCondRow();
    /** *** */
});

// Functions

function createInsertRowOption_cond() {
    return `
        <div class="form-group">
            <input type="checkbox" id="specific_row_cond" onchange="toggleRowSelect_cond()">    
            <label for="specific_row_cond" id="specific_row_cond_label">Insert after specific row?</label>
        </div>
        <div class="form-group" id="row_select_container_cond" style="display: none;">
            <label for="row_select" id="row_select_label_cond">Select preceding row</label>
            <select id="row_select_cond" class="form-control form-select">
                <option value="" disabled selected id="row_placeholder_cond">Existing <em>condition</em> rows</option>
            </select>
        </div>
    `;
}

function toggleRowSelect_cond() {
    var rowSelectContainer = $('#row_select_container_cond');
    var specificRow = $('#specific_row_cond').is(':checked');
    
    if (specificRow) {
        populateRowSelect_cond();
        rowSelectContainer.show();
    } else {
        rowSelectContainer.hide();
    }
}

function populateRowSelect_cond() {
    var itemNames = handsOnTable_Conditions.getDataAtCol(0).slice(1).filter(Boolean); // Get all item names from the first column except the first row
    var $rowSelect = $('#row_select_cond');
    
    $rowSelect.html(`<option value="" disabled selected id="row_placeholder_cond">Available Conditions</option>`);
    
    itemNames.forEach(function(name, index) {
        $rowSelect.append(`<option value="${index}">${name}</option>`);
    });

    if (itemNames.length === 1) {
        $rowSelect.val(0).prop('disabled', true);
        $('#specific_row_cond').prop('disabled', true);  // Disable the checkbox
        $('#specific_row_cond_label').css('color', 'lightgrey');  // Change the label color to light grey
        $('#specific_row_cond_label').attr('title', "There is only one existing row so this will be automatically added below");
    } else {
        $('#specific_row_cond').prop('disabled', false);  // Enable the checkbox if there are more than one options
        $('#specific_row_cond_label').css('color', '');  // Reset the label color to its default
    }
}

function addNewCondOptions(callback) {
    // Mapping dropdowns to phasetypes and surveys.
    const procedureOptions = $.map($("#proc_select option"), function(option) {
        if (option.value.toLowerCase() !== "") {
            return option.value;
        }
    });

    const stimuliOptions = $.map($("#stim_select option"), function(option) {
        if (option.value.toLowerCase() !== "") {
            return option.value.replace("default|", "").replace("user|", "");
        }
    });

    var procedureRowCount = handsOnTable_Procedure.countRows();
    var stimuliRowCount = handsOnTable_Stimuli.countRows();
    var totalAvailableTrials = (procedureRowCount - 2) + (stimuliRowCount - 3);

    bootbox.dialog({
        title: "Enter details for the new 'conditions' row",
        message: `
        <style>.qualcheck{margin-left:20px;}</style>
            <form id="addItemForm">
                <p>This form allows you to add a new row to the <em>conditions</em> spreadsheet.</p>
                <div class="mb-3">
                    <label for="item_name" id="item_name_label">Condition name </label><span style="color: red;">*</span>
                    <input type="text" class="form-control" id="item_name" placeholder="Please enter a name for this condition row" required>
                </div>
                <div class="mb-3">
                    <label for="procedure" id="procedure_label"> Please select a procedure sheet to use <span style="color: red;">*</span></label>
                        <select id="procedure" class="form-select" required>
                        <option value="" disabled selected id="proc_placeholder">Available procedure sheets</option>
                        ${procedureOptions.map(option => `<option value="${option}">${option}</option>`).join('')}
                    </select>
                </div>
                <div class="mb-3">
                    <label for="stimuli" id="stimuli_label"> Please select a stimuli sheet to use</label> <span style="color: red;">*</span>
                        <select id="stimuli" class="form-select" required>
                        <option value="" disabled selected id="stim_placeholder">Available stimuli sheets</option>
                        ${stimuliOptions.map(option => `<option value="${option}">${option}</option>`).join('')}
                    </select>
                </div>
                <div class="mb-3">
                  <label for="participantID" id="participantID_label"> Please select a participant ID style to use</label> <span style="color: red;">*</span>
                    <select name="participantID" class="form-select" id="participantID" required>
                        <option value="" disabled selected>Available styles</option>
                        <option value="on">Require participants enter an ID upon starting</option>
                        <option value="random">Automatically assign participants a random ID</option>
                        <option value="off">Do not use participant IDs</option>
                    </select>
                </div>

                <div class="mb-3">
                    <label id="progressBar_label"> How do you want the progress bar to advance?</label> <span style="color: red;">*</span>
                        <select name="progressBar" class="form-select" id="progressBar" required>
                            <option value="" disabled selected>Available progressions styles</option>
                            <option value="row">Increase upon <em>procedure</em> row completion</option>
                            <option value="trial">Increase upon every trial completion</option>
                            <option value="off">Hidden</option>
                        </select>
                </div>

                <div class="mb-3">
                    <label id="notes_label"><input type="checkbox" id="notes_cond"> Add a note?</label>
                    <div id="notes_input" style="display: none;">
                        <textarea id="notes_textarea" class="form-control" required rows="10" style="width: 100%; min-height:200px;"></textarea>
                        <small class="form-text text-muted" style="font-style: italic;"><b>Note:</b> this will only be visible to you within Collector</small>
                    </div>
                </div>
                <div class="mb-3">
                <label id="start_message_label"><input type="checkbox" id="start_message"> Set a start message?</label>
                <div id="start_message_input" style="display: none;">
                <textarea id="start_message_textarea" class="form-control" required rows="10" style="width: 100%; min-height:200px;"></textarea>
                <small class="form-text text-muted" style="font-style: italic;"><b>Note:</b> You can style text via HTML</small>
                </div>
                </div>
                <div class="mb-3">
                <label id="end_message_label"><input type="checkbox" id="end_message"> Set an end message?</label>
                <div id="end_message_input" style="display: none;">
                <textarea id="end_message_textarea" class="form-control" required rows="10" style="width: 100%; min-height:200px;"></textarea>
                <small class="form-text text-muted" style="font-style: italic;"><b>Note:</b> You can style text via HTML</small>
                </div>
                </div>
                
                <div class="mb-3">
                <label id="fullscreen_label"><input type="checkbox" id="fullscreen"> Request fullscreen?</label>
                </div>

                <div class="mb-3">
                <label id="skipQuality_label"><input type="checkbox" id="skipQuality"> Skip initial data quality check questions?</label>
                </div>

                <div class="mb-3 qualcheck">
                    <label id="welcome_label"><input type="checkbox" id="welcome"> Change the welcome message?</label>
                    <div id="welcome_input" style="display: none;">
                        <textarea id="welcome_textarea" class="form-control" required rows="10" style="width: 100%; min-height:200px;"></textarea>
                        <small class="form-text text-muted" style="font-style: italic;"><b>Note:</b> You can style text via HTML</small>
                    </div>
                </div>

                <div class="mb-3 qualcheck">
                <label id="ageCheck_label"><input type="checkbox" id="ageCheck"> Skip initial age check question?</label>
                </div>                
                
                <div class="mb-3 qualcheck">
                <label id="zoomCheck_label"><input type="checkbox" id="zoomCheck"> Skip initial page zoom level check?</label>
                </div>

                <div class="mb-3 qualcheck">
                <label id="detailsWarning_label"><input type="checkbox" id="detailsWarning"> Skip initial warning about providing sensitive data?</label>
                </div>

                <div class="mb-3  qualcheck">
                    <label id="audioVisualCheck_label"><input type="checkbox" id="audioVisualCheck"> Include an audio or visual check?</label>
                </div>
                <div class="mb-3 audiovisual_check" id="audioVisualDropdown_container" style="display: none;">
                    <select id="audioVisualDropdown" class="form-select">
                        <option value="" disabled selected>Please select the required check</option>
                        <option value="audio">Audio</option>
                        <option value="video">Video</option>
                        <option value="both">Both</option>
                    </select>
                </div>
    
                <div class="mb-3">
                    <label id="mobileCheck_label"><input type="checkbox" id="mobileCheck"> Allow condition to be completed on a mobile phone?</label>
                </div>

                <div class="mb-3">
                    <label id="downloadData_label"><input type="checkbox" id="downloadData"> Stop participants from downloading data at the end?</label>
                </div>

                <div class="mb-3">
                    <label id="forwardAtEnd_label"><input type="checkbox" id="forwardAtEnd_checkbox"> Display forwarding URL to participants upon completion?</label>
                </div>
                <div id="forwardAtEnd_input" style="display: none;" class="input-group mb-3">
                    <div class="input-group-prepend" style="display: flex;">
                        <span class="input-group-text" id="forwardAtEnd_append" style="width: 85px!important;border-radius: 5px 0 0 5px;">https://</span>
                    </div>
                    <input type="text" id="forwardAtEnd" class="form-control" placeholder="www.url_to_display_at_end.com" required >
                </div>

                <div class="mb-3">
                    <label id="bufferTrials_label"><input type="checkbox" id="bufferTrials_checkbox"> Change default buffer level?</label>
                </div>
                <div id="bufferTrials_input" style="display: none;margin-bottom: 40px!important;" class="input-group mb-3">
                    <input type="number" id="bufferTrials" class="form-control" style="max-width: 250px!important;" placeholder="Number of trials to preload" required >
                    <div class="input-group-prepend" style="display: flex;">
                        <span class="input-group-text" id="bufferTrials_prepend" style="width: 80px!important;border-radius: 0 5px 5px 0;">trials</span>
                    </div>
                    <small class="form-text text-muted" style="font-style: italic;"><b>Note:</b> The current total number of trials in the experiment is: <b>${totalAvailableTrials}</b></small>
                </div>

                <div class="mb-3">
                    <label id="REDCap_label"><input type="checkbox" id="REDCap_checkbox"> Store experimental data in REDCap?</label>
                </div>
                <div id="REDCap_input" style="display: none;" class="input-group mb-3">
                    <div class="input-group-prepend" style="display: flex;">
                        <span class="input-group-text" id="REDCap_prepend" style="width: 85px!important;border-radius: 5px 0 0 5px;">https://</span>
                    </div>
                    <input type="text" id="REDCap_url" class="form-control" placeholder="location of REDCap PHP file" required >
                </div>
                ${createInsertRowOption_cond()}
            </form>`,
        buttons: {
            submit: {
                label: 'Add',
                className: 'btn-primary',
                callback: function () {
                    var cond_name = $('#item_name').val();               
                    var procedureSheet = $('#procedure').val();               
                    var stimuliSheet = $('#stimuli').val();
                    var participantID = $('#participantID').val();                 
                    var progressBar = $('#progressBar').val();

                    var notes_cond = $('#notes_cond').is(':checked') ? $('#notes_textarea').val() : '';
                    var welcomeText = $('#welcome').is(':checked') ? $('#welcome_textarea').val() : '';
                    var startText = $('#start_message').is(':checked') ? $('#start_message_textarea').val() : '';
                    var endText = $('#end_message').is(':checked') ? $('#end_message_textarea').val() : '';
                    var fullscreen = $('#fullscreen').is(':checked') ? 'on' : '';
                    var ageCheck = $('#ageCheck').is(':checked') ? 'no' : '';
                    var skipQuality = $('#skipQuality').is(':checked') ? 'yes' : '';
                    var detailsWarning = $('#detailsWarning').is(':checked') ? 'no' : '';
                    var zoomCheck = $('#zoomCheck').is(':checked') ? 'no' : '';
                    var mobileCheck = $('#mobileCheck').is(':checked') ? '' : 'no';
                    var downloadData = $('#downloadData').is(':checked') ? 'off' : '';
                    var forwardAtEnd = $('#forwardAtEnd_checkbox').is(':checked') ? `https://${$('#forwardAtEnd').val()}` : '';
                    var bufferTrials = $('#bufferTrials_checkbox').is(':checked') ? $('#bufferTrials').val() : '5';
                    var audioVisual = $('#audioVisualCheck').is(':checked') ? $('#audioVisualDropdown').val() : 'none';
                    
                    var REDCap_url = $('#REDCap_checkbox').is(':checked') ? `https://${$('#REDCap_url').val()}` : '';
                    
                    var specificRow = $('#specific_row_cond').is(':checked');
                    var rowIndex = $('#row_select_cond').val();

                    var missingFields = [];

                    if (!cond_name) {
                        missingFields.push("Condition name");
                        $('#item_name_label').css('color', 'red');
                    }
                    if (!procedureSheet) {
                        missingFields.push("Procedure sheet selection");
                        $('#procedure_label').css('color', 'red');
                    }
                    if (!stimuliSheet) {
                        missingFields.push("Stimuli sheet selection");
                        $('#stimuli_label').css('color', 'red');
                    }
                    if (!participantID) {
                        missingFields.push("Participant ID use");
                        $('#participantID_label').css('color', 'red');
                    }
                    if (!progressBar) {
                        missingFields.push("Progress bar type");
                        $('#progressBar_label').css('color', 'red');
                    }

                    if ($('#forwardAtEnd_checkbox').is(':checked') && !$('#forwardAtEnd').val()) {
                        missingFields.push("Forward at end URL");
                        $('#forwardAtEnd_label').css('color', 'red');
                    }
                    if ($('#bufferTrials_checkbox').is(':checked') && !$('#bufferTrials').val()) {
                        missingFields.push("Number of trials to buffer");
                        $('#bufferTrials_label').css('color', 'red');
                    }
                    if ($('#REDCap_checkbox').is(':checked') && !$('#REDCap_url').val()) {
                        missingFields.push("REDCap URL");
                        $('#REDCap_label').css('color', 'red');
                    }
                    if ($('#notes_cond').is(':checked') && !$('#notes_textarea').val()) {
                        missingFields.push("Additional notes");
                        $('#notes_label').css('color', 'red');
                    }
                    if ($('#welcome').is(':checked') && !$('#welcome_textarea').val()) {
                        missingFields.push("Welcome message text");
                        $('#welcome_label').css('color', 'red');
                    }
                    if ($('#audioVisualCheck').is(':checked') && !$('#audioVisualDropdown').val()) {
                        missingFields.push("Required audio/visual check text");
                        $('#audioVisualCheck_label').css('color', 'red');
                    }
                    if ($('#start_message').is(':checked') && !$('#start_message_textarea').val()) {
                        missingFields.push("Start message text");
                        $('#start_message_label').css('color', 'red');
                    }
                    if ($('#end_message').is(':checked') && !$('#end_message_textarea').val()) {
                        missingFields.push("End message text");
                        $('#end_message_label').css('color', 'red');
                    }

                    if ($('#specific_row_cond').is(':checked') && !rowIndex) {
                        missingFields.push("Row to add data after");
                        $('#row_select_label_cond').css('color', 'red');
                        $('#specific_row_cond_label').css('color', 'red');
                    }

                    if (missingFields.length > 0) {
                        bootbox.alert("The following fields are missing: " + missingFields.join(', '));
                        return false;
                    }

                    if (parseInt(bufferTrials) > totalAvailableTrials) {
                        bootbox.alert("You are buffering more trials than you currently have. The total number of trials available is " + totalAvailableTrials + ".");
                        return false;
                    }

                    callback(ageCheck, audioVisual, detailsWarning, downloadData, endText, forwardAtEnd, fullscreen, mobileCheck, notes_cond, participantID, progressBar, REDCap_url, startText, welcomeText, skipQuality,zoomCheck, bufferTrials, cond_name, stimuliSheet, procedureSheet, specificRow ? parseInt(rowIndex) + 2 : null);
                    return true;
                }
            },
            cancel: {
                label: 'Cancel',
                className: 'btn-secondary'
            }
        }
    });

    // Move event listeners call here so it runs after the Bootbox dialog is created
    cond_event_listeners();

    window.toggleRowSelect_cond = toggleRowSelect_cond;

    // Auto-select and disable dropdowns if they have only one option
    function autoSelectAndDisableSingleOption(selectElementId) {
        var selectElement = document.getElementById(selectElementId);
        var options = selectElement.getElementsByTagName('option');
        var enabledOptions = Array.from(options).filter(option => !option.disabled);
        if (enabledOptions.length === 1) {
            selectElement.value = enabledOptions[0].value;
            selectElement.disabled = true;
        }
    }

    autoSelectAndDisableSingleOption('procedure');
    autoSelectAndDisableSingleOption('stimuli');
    autoSelectAndDisableSingleOption('participantID');
    autoSelectAndDisableSingleOption('progressBar');
}

function addNewCondRow() {
    addNewCondOptions(function (ageCheck, audioVisual, detailsWarning, downloadData, endText, forwardAtEnd, fullscreen, mobileCheck, notes_cond, participantID, progressBar, REDCap_url, startText, welcomeText, skipQuality, zoomCheck, bufferTrials, cond_name, stimuliSheet, procedureSheet, insertAfterRow) {

        var currentData = handsOnTable_Conditions.getData();
        var colCount = handsOnTable_Conditions.countCols();
        var firstRow = currentData[0] || []; // Ensure firstRow is an array

        var columnNames = ['name', 'stimuli', 'procedure', 'participant_id', 'buffer'];
        if (ageCheck) columnNames.push('age_check');
        if (downloadData) columnNames.push('download_at_end');
        if (endText) columnNames.push('end_message');
        if (forwardAtEnd) columnNames.push('forward_at_end');
        if (fullscreen) columnNames.push('fullscreen');
        if (mobileCheck) columnNames.push('mobile');
        if (notes_cond) columnNames.push('notes');
        if (progressBar) columnNames.push('progress_bar');
        if (REDCap_url) columnNames.push('redcap_url');
        if (skipQuality) columnNames.push('skip_quality');
        if (startText) columnNames.push('start_message');
        if (zoomCheck) columnNames.push('zoom_check');
        if (welcomeText) columnNames.push('welcome');
        if (detailsWarning) columnNames.push('details_warning');
        if (audioVisual) columnNames.push('audio_visual');

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
                handsOnTable_Conditions.setDataAtCell(0, insertPos + i, columnsToAdd[i]);
                columnIndices[columnsToAdd[i]] = insertPos + i;
            }
            
            handsOnTable_Conditions.render();
            colCount = handsOnTable_Conditions.countCols();
            getColumnPositions();
        }

        // Check for duplicate item_name
        var itemNameColIndex = columnIndices['name'];
        if (itemNameColIndex !== undefined) {
            var itemNameExists = currentData.some(row => row[itemNameColIndex] === cond_name);
            if (itemNameExists) {
                bootbox.prompt({
                    title: "The name is not unique. Please enter a new name:",
                    callback: function(newItemName) {
                        if (newItemName !== null) { // If the user provided a new item name
                            cond_name = newItemName.toLowerCase().replace(/ /g, '_');
                            addRow(insertAfterRow);
                        }
                    }
                });
                return;
            }
        }

        function addRow(insertAfterRow) {
            var newRow = Array(colCount).fill('');

            if (columnIndices['age_check'] !== undefined) newRow[columnIndices['age_check']] = ageCheck;
            if (columnIndices['buffer'] !== undefined) newRow[columnIndices['buffer']] = bufferTrials;
            if (columnIndices['download_at_end'] !== undefined) newRow[columnIndices['download_at_end']] = downloadData;
            if (columnIndices['end_message'] !== undefined) newRow[columnIndices['end_message']] = endText;
            if (columnIndices['forward_at_end'] !== undefined) newRow[columnIndices['forward_at_end']] = forwardAtEnd;
            if (columnIndices['fullscreen'] !== undefined) newRow[columnIndices['fullscreen']] = fullscreen;
            if (columnIndices['mobile'] !== undefined) newRow[columnIndices['mobile']] = mobileCheck;
            if (columnIndices['name'] !== undefined) newRow[columnIndices['name']] = cond_name;
            if (columnIndices['notes'] !== undefined) newRow[columnIndices['notes']] = notes_cond;
            if (columnIndices['participant_id'] !== undefined) newRow[columnIndices['participant_id']] = participantID;
            if (columnIndices['procedure'] !== undefined) newRow[columnIndices['procedure']] = procedureSheet;
            if (columnIndices['progress_bar'] !== undefined) newRow[columnIndices['progress_bar']] = progressBar;
            if (columnIndices['redcap_url'] !== undefined) newRow[columnIndices['redcap_url']] = REDCap_url;
            if (columnIndices['skip_quality'] !== undefined) newRow[columnIndices['skip_quality']] = skipQuality;
            if (columnIndices['start_message'] !== undefined) newRow[columnIndices['start_message']] = startText;
            if (columnIndices['stimuli'] !== undefined) newRow[columnIndices['stimuli']] = stimuliSheet;
            if (columnIndices['zoom_check'] !== undefined) newRow[columnIndices['zoom_check']] = zoomCheck;
            if (columnIndices['welcome'] !== undefined) newRow[columnIndices['welcome']] = welcomeText;
            if (columnIndices['details_warning'] !== undefined) newRow[columnIndices['details_warning']] = detailsWarning;
            if (columnIndices['audio_visual'] !== undefined) newRow[columnIndices['audio_visual']] = audioVisual;

            if (insertAfterRow !== null) {
                handsOnTable_Conditions.alter('insert_row', insertAfterRow);
                handsOnTable_Conditions.populateFromArray(insertAfterRow, 0, [newRow]);
            } else {
                handsOnTable_Conditions.populateFromArray(handsOnTable_Conditions.countRows(), 0, [newRow]);
            }

            handsOnTable_Conditions.render();
            setTimeout(() => {
                $("#save_btn").click();
            }, 100);
        }

        addRow(insertAfterRow);
    });
}

function cond_event_listeners() {

    // Toggle visibility of audioVisualDropdown based on audioVisualCheck checkbox
    $(document).on('change', '#audioVisualCheck', function() {
        $('#audioVisualDropdown_container').toggle(this.checked);
    });
    
    // Trigger the function initially to ensure the correct state is set based on the initial form values
    $('#audioVisualDropdown_container').toggle($('#audioVisualCheck').is(':checked'));
    
    // Function to handle enabling/disabling checkboxes based on participantID selection
    function handleParticipantIDChange() {
        const participantID = $('#participantID').val();
        const isDisabled = participantID === 'random' || participantID === 'off';
        
        $('#start_message').prop('disabled', isDisabled);
        $('#end_message').prop('disabled', isDisabled);

        const tooltipText = "Sorry, you cannot use these with your current ID setting";

        if (isDisabled) {
            $('#start_message_label').attr('title', tooltipText);
            $('#end_message_label').attr('title', tooltipText);
            $('#end_message_label, #start_message_label').css('color', 'lightgrey');
            // $('#end_message_label, #start_message_label').hide();
        } else {
            $('#start_message_label').removeAttr('title');
            $('#end_message_label').removeAttr('title');
            $('#end_message_label, #start_message_label').css('color', 'black');
            // $('#end_message_label, #start_message_label').show();
        }
    }

    // Function to handle enabling/disabling checkboxes based on skipQuality selection
    function handleSkipQualityChange() {
        const isSkipQualityChecked = $('#skipQuality').is(':checked');

        $('#welcome').prop('disabled', isSkipQualityChecked);
        $('#ageCheck').prop('disabled', isSkipQualityChecked);
        $('#zoomCheck').prop('disabled', isSkipQualityChecked);
        $('#detailsWarning').prop('disabled', isSkipQualityChecked);
        $('#audioVisualCheck').prop('disabled', isSkipQualityChecked);

        const tooltipText = "Sorry, you cannot use this if you skip quality controls";

        if (isSkipQualityChecked) {
            $('#welcome_label').attr('title', tooltipText);
            $('#ageCheck_label').attr('title', tooltipText);
            $('#zoomCheck_label').attr('title', tooltipText);
            $('#detailsWarning').attr('title', tooltipText);
            $('#audioVisualCheck').attr('title', tooltipText);
            $('#welcome_label, #ageCheck_label,#zoomCheck_label,#detailsWarning_label, #audioVisualCheck_label').css('color', 'lightgrey');
            // $('#welcome_label, #ageCheck_label,#zoomCheck_label, #detailsWarning_label, #audioVisualCheck_label').hide(); // This would hide rather than grey out the above
        } else {
            $('#welcome_label').removeAttr('title');
            $('#ageCheck_label').removeAttr('title');
            $('#zoomCheck_label').removeAttr('title');
            $('#detailsWarning').removeAttr('title');
            $('#audioVisualCheck').removeAttr('title');
            $('#welcome_label, #ageCheck_label,#zoomCheck_label,#detailsWarning_label,#audioVisualCheck_label').css('color', 'black');
            // $('#welcome_label, #ageCheck_label,#zoomCheck_label, #detailsWarning_label, #audioVisualCheck_label').show(); // This would show rather than reactivate the above
        }
    }

    // Event listener for participantID changes
    $(document).on('change', '#participantID', handleParticipantIDChange);

    // Event listener for skipQuality changes
    $(document).on('change', '#skipQuality', handleSkipQualityChange);

    // Trigger the functions initially to ensure the correct state is set based on the initial form values
    handleParticipantIDChange();
    handleSkipQualityChange();
    populateRowSelect_cond();

    // Existing event listeners
    $(document).on('change', '#REDCap_checkbox', function() {
        $('#REDCap_input').toggle(this.checked);
        if (this.checked) {
            $('#REDCap_url').attr('required', true);
        } else {
            $('#REDCap_url').removeAttr('required');
        }
    });

    $(document).on('change', '#bufferTrials_checkbox', function() {
        $('#bufferTrials_input').toggle(this.checked);
        if (this.checked) {
            $('#bufferTrials').attr('required', true);
        } else {
            $('#bufferTrials').removeAttr('required');
        }
    });

    $(document).on('change', '#forwardAtEnd_checkbox', function() {
        $('#forwardAtEnd_input').toggle(this.checked);
        if (this.checked) {
            $('#forwardAtEnd').attr('required', true);
        } else {
            $('#forwardAtEnd').removeAttr('required');
        }
    });

    $(document).on('change', '#notes_cond', function() {
        $('#notes_input').toggle(this.checked);
        if (this.checked) {
            $('#notes_textarea').attr('required', true);
        } else {
            $('#notes_textarea').removeAttr('required');
        }
    });

    $(document).on('change', '#audioVisualCheck', function() {
        if (this.checked) {
            $('#audioVisualDropdown').attr('required', true);
        } else {
            $('#audioVisualDropdown').removeAttr('required');
        }
    });

    $(document).on('change', '#welcome', function() {
        $('#welcome_input').toggle(this.checked);
        if (this.checked) {
            $('#welcome_textarea').attr('required', true);
        } else {
            $('#welcome_textarea').removeAttr('required');
        }
    });

    $(document).on('change', '#start_message', function() {
        $('#start_message_input').toggle(this.checked);
        if (this.checked) {
            $('#start_message_textarea').attr('required', true);
        } else {
            $('#start_message_textarea').removeAttr('required');
        }
    });

    $(document).on('change', '#end_message', function() {
        $('#end_message_input').toggle(this.checked);
        if (this.checked) {
            $('#end_message_textarea').attr('required', true);
        } else {
            $('#end_message_textarea').removeAttr('required');
        }
    });
}
