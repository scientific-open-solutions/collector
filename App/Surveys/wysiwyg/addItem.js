/*  =============================================================
    This controls the WYSIWYG 'Add Item' system on the survey page 
    =============================================================  */

// Monitoring for type of item required
function handleButtonPress(buttonPressed) {
    console.log('Button pressed:', buttonPressed);   
    bootbox.hideAll(); // Close the current modal 
    switch(buttonPressed) {
        case 'branching':
            addBranching();
            break;
        case 'checkbox':
            addCheckboxRow();
            break;
        case 'dropdown':
            addDropdownRow();
            break;
        case 'instruct':
            addInstructRow();
            break;
        case 'likert':
            addLikertRow();
            break;
        case 'number':
            addNumberRow();
            break;
        case 'page_break':
            addPageBreakRow();
            break;
        case 'text':
            addTextRow();
            break;
        case 'radio':
            addRadioRow();
            break;
        case 'redcap_pii':
            addRedcapPiiRow();
            break;
        default:
            console.log('Unknown button');
            break;
    }
}

/*  - - - - - - - - - - - - - - - - - -
    Individual items that can be added 
    - - - - - - - - - - - - - - - - - - */

function createInsertRowOption() {
    return `
        <div class="form-group">
            <label for="specific_row">Insert after specific row?</label>
            <input type="checkbox" id="specific_row" onchange="toggleRowSelect()">
        </div>
        <div class="form-group" id="row_select_container" style="display: none;margin-left: 20px;">
            <label for="row_select">Select Row</label>
            <select id="row_select" class="form-control form-select"></select>
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
    var itemNames = survey_HoT.getDataAtCol(0).slice(1).filter(Boolean); // Get all item names from the first column except the first row
    var rowSelect = document.getElementById('row_select');
    rowSelect.innerHTML = itemNames.map((name, index) => `<option value="${index}">${name}</option>`).join('');
}

// Checkboxes
function addCheckboxOptions(callback) {
    bootbox.dialog({
        title: "Enter details for the new 'checkbox' row",
        message: `
        <form id="detailsForm">
            <div class="form-group">
                <label for="item_name">Item name <span style="color: red;">*</span></label>
                <input type="text" class="form-control" id="item_name" required>
            </div>
            <div class="form-group">
                <label for="text">Question text <span style="color: red;">*</span></label>
                <input type="text" class="form-control" id="text" required>
            </div>
            <div class="form-group">
                <label for="answers">Answers (text → separate with |) <span style="color: red;">*</span></label>
                <input type="text" class="form-control" id="answers" required>
            </div>
            <div class="form-group">
                <label for="values">Values (numbers → separate with |) <span style="color: red;">*</span></label>
                <input type="text" class="form-control" id="values" required>
            </div>
            <div class="form-group">
                <label for="direction">Display the checkboxes vertically?</label>
                <input type="checkbox" id="direction">
            </div>
            <div class="form-group">
                <label for="optional">Make this item optional?</label>
                <input type="checkbox" id="optional">
            </div>
            <div class="form-group">
                <label for="shuffle_question">Shuffle the question?</label>
                <input type="checkbox" id="shuffle_question">
            </div>
            <div class="form-group">
                <label for="provide_feedback">Provide feedback?</label>
                <input type="checkbox" id="provide_feedback">
            </div>
            <div id="feedback_fields" style="display:none;margin-left: 20px;">
                <div class="form-group">
                    <label for="feedback_answers">Please enter the text that should be displayed for each response (e.g., Incorrect|Correct → separate with |)<span style="color: red;">*</span></label>
                    <input type="text" class="form-control" id="feedback_answers">
                </div>
                <div class="form-group">
                    <label for="feedback_color">Please specicy colours for each piece of feedback (e.g., red|green → separate with |)) <span style="color: red;">*</span></label>
                    <input type="text" class="form-control" id="feedback_color">
                </div>
                <div class="form-group">
                    <label for="lock_feedback">Lock responses after providing feedback?</label>
                    <input type="checkbox" id="lock_feedback">
                </div>
            </div>
            ${createInsertRowOption()}
        </form>
        `,
        buttons: {
            submit: {
                label: 'Submit',
                className: 'btn-primary',
                callback: function () {
                    var itemName = $('#item_name').val().toLowerCase().replace(/ /g, '_');
                    var text = $('#text').val();
                    var answers = $('#answers').val().replace(/\s*\|\s*/g, '|');
                    var values = $('#values').val().replace(/\s*\|\s*/g, '|');
                    var optional = $('#optional').is(':checked') ? 'yes' : 'no';
                    var direction = $('#direction').is(':checked') ? 'checkbox' : 'checkbox_horizontal';
                    var shuffleQuestion = $('#shuffle_question').is(':checked') ? 'on' : 'off';
                    var specificRow = $('#specific_row').is(':checked');
                    var rowIndex = $('#row_select').val();
                    var provideFeedback = $('#provide_feedback').is(':checked');


                    var missingFields = [];
                    if (!itemName) missingFields.push('Checkbox item name');
                    if (!text) missingFields.push('Question text');
                    if (!answers) missingFields.push('Answers');
                    if (!values) missingFields.push('Values');

                    if (missingFields.length > 0) {
                        bootbox.alert("The following fields are missing: " + missingFields.join(', '));
                        return false;
                    }

                    var answersArray = answers.split('|');
                    var valuesArray = values.split('|');
                    if (answersArray.length !== valuesArray.length) {
                        bootbox.alert("The number of values in 'answers' does not match the number of values in 'values'. Please ensure they match.");
                        return false;
                    }

                    if (provideFeedback) {
                        var feedbackAnswers = $('#feedback_answers').val().replace(/\s*\|\s*/g, '|');
                        var feedbackColor = $('#feedback_color').val().replace(/\s*\|\s*/g, '|').toLowerCase();
                        if (!feedbackAnswers) missingFields.push('Feedback Answers');
                        if (!feedbackColor) missingFields.push('Feedback Color');

                        var lockFeedback = $('#lock_feedback').is(':checked') ? 'yes' : '';
                        var feedbackAnswersArray = feedbackAnswers.split('|');
                        var feedbackColorArray = feedbackColor.split('|');

                        if (answersArray.length !== feedbackAnswersArray.length) {
                            bootbox.alert("The number of values in 'answers' does not match the number of values in 'feedback answers'. Please ensure they match.");
                            return false;
                        }
                        if (feedbackColorArray.length !== feedbackAnswersArray.length) {
                            bootbox.alert("The number of values in 'feedback answers' does not match the number of values in 'feedback colours'. Please ensure they match.");
                            return false;
                        }
                    }

                    callback(itemName, text, answers, values, optional, direction, shuffleQuestion, specificRow ? parseInt(rowIndex) + 1 : null, feedbackAnswers, feedbackColor, lockFeedback);
                    return true;
                }
            },
            cancel: {
                label: 'Cancel',
                className: 'btn-secondary',
                callback: function () {
                    $("#add_item_btn").click();
                }
            }
        }
    });

    $('#provide_feedback').change(function() {
        if ($(this).is(':checked')) {
            $('#feedback_fields').show();
            $('#feedback_answers').prop('required', true);
            $('#feedback_color').prop('required', true);
        } else {
            $('#feedback_fields').hide();
            $('#feedback_answers').prop('required', false);
            $('#feedback_color').prop('required', false);
        }
    });

    window.toggleRowSelect = toggleRowSelect;
}

function addCheckboxRow() {
    addCheckboxOptions(function (itemName, text, answers, values, optional, direction, shuffleQuestion, insertAfterRow, feedbackAnswers, feedbackColor, lockFeedback) {

        var currentData = survey_HoT.getData();
        var colCount = survey_HoT.countCols();
        var firstRow = currentData[0] || []; // Ensure firstRow is an array

        var columnNames = ['item_name', 'text', 'type', 'answers', 'values', 'optional', 'shuffle_question','feedback','feedback_color', 'lock_after_feedback'];

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
                survey_HoT.setDataAtCell(0, insertPos + i, columnsToAdd[i]);
                columnIndices[columnsToAdd[i]] = insertPos + i;
            }
            
            survey_HoT.render();
            colCount = survey_HoT.countCols();
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

            if (columnIndices['type'] !== undefined) newRow[columnIndices['type']] = direction;
            if (columnIndices['item_name'] !== undefined) newRow[columnIndices['item_name']] = itemName;
            if (columnIndices['text'] !== undefined) newRow[columnIndices['text']] = text;
            if (columnIndices['answers'] !== undefined) newRow[columnIndices['answers']] = answers;
            if (columnIndices['values'] !== undefined) newRow[columnIndices['values']] = values;
            if (columnIndices['optional'] !== undefined) newRow[columnIndices['optional']] = optional;
            if (columnIndices['shuffle_question'] !== undefined) newRow[columnIndices['shuffle_question']] = shuffleQuestion;
            if (columnIndices['feedback'] !== undefined) newRow[columnIndices['feedback']] = feedbackAnswers;
            if (columnIndices['feedback_color'] !== undefined) newRow[columnIndices['feedback_color']] = feedbackColor;
            if (columnIndices['lock_after_feedback'] !== undefined) newRow[columnIndices['lock_after_feedback']] = lockFeedback;

            if (insertAfterRow !== null) {
                survey_HoT.alter('insert_row', insertAfterRow);
                survey_HoT.populateFromArray(insertAfterRow, 0, [newRow]);
            } else {
                survey_HoT.populateFromArray(survey_HoT.countRows(), 0, [newRow]);
            }

            survey_HoT.render();
            setTimeout(() => {
                $("#save_survey_btn").click();
            }, 100);
        }

        addRow(insertAfterRow);
    });
}

// Dropdowns
function addDropdownOptions(callback) {
    bootbox.dialog({
        title: "Enter details for the new 'dropdown' row",
        message: `
        <form id="detailsForm">
            <div class="form-group">
                <label for="item_name">Item name <span style="color: red;">*</span></label>
                <input type="text" class="form-control" id="item_name" required>
            </div>
            <div class="form-group">
                <label for="text">Question text <span style="color: red;">*</span></label>
                <input type="text" class="form-control" id="text" required>
            </div>
            <div class="form-group">
                <label for="answers">Answers (text → separate with |) <span style="color: red;">*</span></label>
                <input type="text" class="form-control" id="answers" required>
            </div>
            <div class="form-group">
                <label for="values">Values (numbers → separate with |) <span style="color: red;">*</span></label>
                <input type="text" class="form-control" id="values" required>
            </div>
            <div class="form-group">
                <label for="optional">Make this item optional?</label>
                <input type="checkbox" id="optional">
            </div>
            <div class="form-group">
                <label for="shuffle_question">Shuffle the question?</label>
                <input type="checkbox" id="shuffle_question">
            </div>
            <div class="form-group">
                <label for="provide_feedback">Provide feedback?</label>
                <input type="checkbox" id="provide_feedback">
            </div>
            <div id="feedback_fields" style="display:none;margin-left: 20px;">
                <div class="form-group">
                    <label for="feedback_answers">Please enter the text that should be displayed for each response (e.g., Incorrect|Correct → separate with |)<span style="color: red;">*</span></label>
                    <input type="text" class="form-control" id="feedback_answers">
                </div>
                <div class="form-group">
                    <label for="feedback_color">Please specicy colours for each piece of feedback (e.g., red|green → separate with |)) <span style="color: red;">*</span></label>
                    <input type="text" class="form-control" id="feedback_color">
                </div>
                <div class="form-group">
                    <label for="lock_feedback">Lock responses after providing feedback?</label>
                    <input type="checkbox" id="lock_feedback">
                </div>
            </div>
            ${createInsertRowOption()}
        </form>
        `,
        buttons: {
            submit: {
                label: 'Submit',
                className: 'btn-primary',
                callback: function () {
                    var itemName = $('#item_name').val().toLowerCase().replace(/ /g, '_');
                    var text = $('#text').val();
                    var answers = $('#answers').val().replace(/\s*\|\s*/g, '|');
                    var values = $('#values').val().replace(/\s*\|\s*/g, '|');
                    var optional = $('#optional').is(':checked') ? 'yes' : 'no';
                    var shuffleQuestion = $('#shuffle_question').is(':checked') ? 'on' : 'off';
                    var specificRow = $('#specific_row').is(':checked');
                    var rowIndex = $('#row_select').val();
                    var provideFeedback = $('#provide_feedback').is(':checked');

                    var missingFields = [];
                    if (!itemName) missingFields.push('Dropdown item name');
                    if (!text) missingFields.push('Question text');
                    if (!answers) missingFields.push('Answers');
                    if (!values) missingFields.push('Values');

                    if (missingFields.length > 0) {
                        bootbox.alert("The following fields are missing: " + missingFields.join(', '));
                        return false;
                    }

                    var answersArray = answers.split('|');
                    var valuesArray = values.split('|');
                    if (answersArray.length !== valuesArray.length) {
                        bootbox.alert("The number of values in 'answers' does not match the number of values in 'values'. Please ensure they match.");
                        return false;
                    }

                    if (provideFeedback) {
                        var feedbackAnswers = $('#feedback_answers').val().replace(/\s*\|\s*/g, '|');
                        var feedbackColor = $('#feedback_color').val().replace(/\s*\|\s*/g, '|').toLowerCase();
                        if (!feedbackAnswers) missingFields.push('Feedback Answers');
                        if (!feedbackColor) missingFields.push('Feedback Color');

                        var lockFeedback = $('#lock_feedback').is(':checked') ? 'yes' : '';
                        var feedbackAnswersArray = feedbackAnswers.split('|');
                        var feedbackColorArray = feedbackColor.split('|');

                        if (answersArray.length !== feedbackAnswersArray.length) {
                            bootbox.alert("The number of values in 'answers' does not match the number of values in 'feedback answers'. Please ensure they match.");
                            return false;
                        }
                        if (feedbackColorArray.length !== feedbackAnswersArray.length) {
                            bootbox.alert("The number of values in 'feedback answers' does not match the number of values in 'feedback colours'. Please ensure they match.");
                            return false;
                        }
                    }

                    callback(itemName, text, answers, values, optional, shuffleQuestion, specificRow ? parseInt(rowIndex) + 1 : null, feedbackAnswers, feedbackColor, lockFeedback);
                    return true;
                }
            },
            cancel: {
                label: 'Cancel',
                className: 'btn-secondary',
                callback: function () {
                    console.log('Cancelled');
                    $("#add_item_btn").click();
                }
            }
        }
    });

    $('#provide_feedback').change(function() {
        if ($(this).is(':checked')) {
            $('#feedback_fields').show();
            $('#feedback_answers').prop('required', true);
            $('#feedback_color').prop('required', true);
        } else {
            $('#feedback_fields').hide();
            $('#feedback_answers').prop('required', false);
            $('#feedback_color').prop('required', false);
        }
    });

    window.toggleRowSelect = toggleRowSelect;
}

function addDropdownRow() {
    addDropdownOptions(function (itemName, text, answers, values, optional, shuffleQuestion, insertAfterRow, feedbackAnswers, feedbackColor, lockFeedback) {

        var currentData = survey_HoT.getData();
        var colCount = survey_HoT.countCols();
        var firstRow = currentData[0] || []; // Ensure firstRow is an array

        var columnNames = ['item_name', 'text', 'type', 'answers', 'values', 'optional', 'shuffle_question','feedback','feedback_color', 'lock_after_feedback'];

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
                survey_HoT.setDataAtCell(0, insertPos + i, columnsToAdd[i]);
                columnIndices[columnsToAdd[i]] = insertPos + i;
            }
            
            survey_HoT.render();
            colCount = survey_HoT.countCols();
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

            if (columnIndices['type'] !== undefined) newRow[columnIndices['type']] = 'dropdown';
            if (columnIndices['item_name'] !== undefined) newRow[columnIndices['item_name']] = itemName;
            if (columnIndices['text'] !== undefined) newRow[columnIndices['text']] = text;
            if (columnIndices['answers'] !== undefined) newRow[columnIndices['answers']] = answers;
            if (columnIndices['values'] !== undefined) newRow[columnIndices['values']] = values;
            if (columnIndices['optional'] !== undefined) newRow[columnIndices['optional']] = optional;
            if (columnIndices['shuffle_question'] !== undefined) newRow[columnIndices['shuffle_question']] = shuffleQuestion;
            if (columnIndices['feedback'] !== undefined) newRow[columnIndices['feedback']] = feedbackAnswers;
            if (columnIndices['feedback_color'] !== undefined) newRow[columnIndices['feedback_color']] = feedbackColor;
            if (columnIndices['lock_after_feedback'] !== undefined) newRow[columnIndices['lock_after_feedback']] = lockFeedback;

            if (insertAfterRow !== null) {
                survey_HoT.alter('insert_row', insertAfterRow);
                survey_HoT.populateFromArray(insertAfterRow, 0, [newRow]);
            } else {
                survey_HoT.populateFromArray(survey_HoT.countRows(), 0, [newRow]);
            }

            survey_HoT.render();
            setTimeout(() => {
                $("#save_survey_btn").click();
            }, 100);
        }

        addRow(insertAfterRow);
    });
}

// Instructions
function addInstructOptions(callback) {
    bootbox.dialog({
        title: "Enter details for the new 'instructions' row",
        message: `
        <form id="detailsForm">
            <div class="form-group">
                <label for="item_name">Item name <span style="color: red;">*</span></label>
                <input type="text" class="form-control" id="item_name" required>
            </div>
            <div class="form-group" style="padding-bottom:10px;">
                <label for="text">Text to display <span style="color: red;">*</span></label>
                <textarea class="form-control" id="text" required rows="10" style="width: 100%; min-height:200px;"></textarea>
                <small class="form-text text-muted" style="font-style: italic;"><b>Note:</b> You can style text via HTML</small>
            </div>
            <div class="form-group">
                <label for="shuffle_question">Shuffle the question?</label>
                <input type="checkbox" id="shuffle_question">
            </div>
            ${createInsertRowOption()}
        </form>
        `,
        buttons: {
            submit: {
                label: 'Submit',
                className: 'btn-primary',
                callback: function () {
                    var itemName = $('#item_name').val().toLowerCase().replace(/ /g, '_');
                    var text = $('#text').val();
                    var shuffleQuestion = $('#shuffle_question').is(':checked') ? 'on' : 'off';
                    var specificRow = $('#specific_row').is(':checked');
                    var rowIndex = $('#row_select').val();

                    var missingFields = [];
                    if (!itemName) missingFields.push('Instructions item name');
                    if (!text) missingFields.push('Text to display');

                    if (missingFields.length > 0) {
                        bootbox.alert("The following fields are missing: " + missingFields.join(', '));
                        return false;
                    }

                    callback(itemName, text, shuffleQuestion, specificRow ? parseInt(rowIndex) + 1 : null);
                    return true;
                }
            },
            cancel: {
                label: 'Cancel',
                className: 'btn-secondary',
                callback: function () {
                    $("#add_item_btn").click();
                }
            }
        }
    });

    window.toggleRowSelect = toggleRowSelect;
}

function addInstructRow() {
    addInstructOptions(function (itemName, text, shuffleQuestion, insertAfterRow) {

        var currentData = survey_HoT.getData();
        var colCount = survey_HoT.countCols();
        var firstRow = currentData[0] || []; // Ensure firstRow is an array

        var columnNames = ['item_name', 'text', 'type', 'shuffle_question'];

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
                survey_HoT.setDataAtCell(0, insertPos + i, columnsToAdd[i]);
                columnIndices[columnsToAdd[i]] = insertPos + i;
            }
            
            survey_HoT.render();
            colCount = survey_HoT.countCols();
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

            if (columnIndices['type'] !== undefined) newRow[columnIndices['type']] = 'instruct';
            if (columnIndices['item_name'] !== undefined) newRow[columnIndices['item_name']] = itemName;
            if (columnIndices['text'] !== undefined) newRow[columnIndices['text']] = text;
            if (columnIndices['shuffle_question'] !== undefined) newRow[columnIndices['shuffle_question']] = shuffleQuestion;

            if (insertAfterRow !== null) {
                survey_HoT.alter('insert_row', insertAfterRow);
                survey_HoT.populateFromArray(insertAfterRow, 0, [newRow]);
            } else {
                survey_HoT.populateFromArray(survey_HoT.countRows(), 0, [newRow]);
            }

            survey_HoT.render();
            setTimeout(() => {
                $("#save_survey_btn").click();
            }, 100);
        }

        addRow(insertAfterRow);
    });
}

// Likert
function addLikertOptions(callback) {
    bootbox.dialog({
        title: "Enter details for the new 'likert' row",
        message: `
        <form id="detailsForm">
            <div class="form-group">
                <label for="item_name">Item name <span style="color: red;">*</span></label>
                <input type="text" class="form-control" id="item_name" required>
            </div>
            <div class="form-group">
                <label for="text">Question text <span style="color: red;">*</span></label>
                <input type="text" class="form-control" id="text" required>
            </div>
            <div class="form-group">
                <label for="answers">Answers (text → separate with |) <span style="color: red;">*</span></label>
                <input type="text" class="form-control" id="answers" required>
            </div>
            <div class="form-group">
                <label for="values">Values (numbers → separate with |) <span style="color: red;">*</span></label>
                <input type="text" class="form-control" id="values" required>
            </div>
            <div class="form-group">
                <label for="anchors">Anchoring Text (appears at either end → separate with |)</label>
                <input type="text" class="form-control" id="anchors">
            </div>
            <div class="form-group">
                <label for="btn_width">Button Width</label>
                <input type="number" class="form-control" id="btn_width">
            </div>
            <div class="form-group">
                <label for="optional">Make this item optional?</label>
                <input type="checkbox" id="optional">
            </div>
            <div class="form-group">
                <label for="side_by_side">Position question beside response buttons?</label>
                <input type="checkbox" id="side_by_side">
            </div>
            <div class="form-group">
                <label for="shuffle_question">Shuffle the question?</label>
                <input type="checkbox" id="shuffle_question">
            </div>
            <div class="form-group">
                <label for="provide_feedback">Provide feedback?</label>
                <input type="checkbox" id="provide_feedback">
            </div>
            <div id="feedback_fields" style="display:none;margin-left: 20px;">
                <div class="form-group">
                    <label for="feedback_answers">Please enter the text that should be displayed for each response (e.g., Incorrect|Correct → separate with |)<span style="color: red;">*</span></label>
                    <input type="text" class="form-control" id="feedback_answers">
                </div>
                <div class="form-group">
                    <label for="feedback_color">Please specicy colours for each piece of feedback (e.g., red|green → separate with |)) <span style="color: red;">*</span></label>
                    <input type="text" class="form-control" id="feedback_color">
                </div>
                <div class="form-group">
                    <label for="lock_feedback">Lock responses after providing feedback?</label>
                    <input type="checkbox" id="lock_feedback">
                </div>
            </div>
            ${createInsertRowOption()}
        </form>
        `,
        buttons: {
            submit: {
                label: 'Submit',
                className: 'btn-primary',
                callback: function () {
                    var itemName = $('#item_name').val().toLowerCase().replace(/ /g, '_');
                    var text = $('#text').val();
                    var answers = $('#answers').val().replace(/\s*\|\s*/g, '|');
                    var values = $('#values').val().replace(/\s*\|\s*/g, '|');
                    var anchors = $('#anchors').val().replace(/\s*\|\s*/g, '|');
                    var optional = $('#optional').is(':checked') ? 'yes' : 'no';
                    var btnWidth = $('#btn_width').val(); 
                    if (btnWidth != ""){
                        btnWidth = btnWidth + 'px';
                    } 
                    var sideByside = $('#side_by_side').is(':checked') ? 'yes' : 'no';
                    var shuffleQuestion = $('#shuffle_question').is(':checked') ? 'on' : 'off';
                    var specificRow = $('#specific_row').is(':checked');
                    var rowIndex = $('#row_select').val();
                    var provideFeedback = $('#provide_feedback').is(':checked');


                    var missingFields = [];
                    if (!itemName) missingFields.push('Likert item name');
                    if (!text) missingFields.push('Question text');
                    if (!answers) missingFields.push('Answers');
                    if (!values) missingFields.push('Values');

                    if (missingFields.length > 0) {
                        bootbox.alert("The following fields are missing: " + missingFields.join(', '));
                        return false;
                    }

                    var answersArray = answers.split('|');
                    var valuesArray = values.split('|');
                    if (answersArray.length !== valuesArray.length) {
                        bootbox.alert("The number of values in 'answers' does not match the number of values in 'values'. Please ensure they match.");
                        return false;
                    }

                    if (provideFeedback) {
                        var feedbackAnswers = $('#feedback_answers').val().replace(/\s*\|\s*/g, '|');
                        var feedbackColor = $('#feedback_color').val().replace(/\s*\|\s*/g, '|').toLowerCase();
                        if (!feedbackAnswers) missingFields.push('Feedback Answers');
                        if (!feedbackColor) missingFields.push('Feedback Color');

                        var lockFeedback = $('#lock_feedback').is(':checked') ? 'yes' : '';
                        var feedbackAnswersArray = feedbackAnswers.split('|');
                        var feedbackColorArray = feedbackColor.split('|');

                        if (answersArray.length !== feedbackAnswersArray.length) {
                            bootbox.alert("The number of values in 'answers' does not match the number of values in 'feedback answers'. Please ensure they match.");
                            return false;
                        }
                        if (feedbackColorArray.length !== feedbackAnswersArray.length) {
                            bootbox.alert("The number of values in 'feedback answers' does not match the number of values in 'feedback colours'. Please ensure they match.");
                            return false;
                        }
                    }

                    callback(itemName, text, answers, values, optional, btnWidth, sideByside, shuffleQuestion, anchors, specificRow ? parseInt(rowIndex) + 1 : null, feedbackAnswers, feedbackColor, lockFeedback);
                    return true;
                }
            },
            cancel: {
                label: 'Cancel',
                className: 'btn-secondary',
                callback: function () {
                    console.log('Cancelled');
                    $("#add_item_btn").click();
                }
            }
        }
    });

    $('#provide_feedback').change(function() {
        if ($(this).is(':checked')) {
            $('#feedback_fields').show();
            $('#feedback_answers').prop('required', true);
            $('#feedback_color').prop('required', true);
        } else {
            $('#feedback_fields').hide();
            $('#feedback_answers').prop('required', false);
            $('#feedback_color').prop('required', false);
        }
    });

    window.toggleRowSelect = toggleRowSelect;
}

function addLikertRow() {
    addLikertOptions(function (itemName, text, answers, values, optional, btnWidth, sideByside, shuffleQuestion, anchors, insertAfterRow, feedbackAnswers, feedbackColor, lockFeedback) {

        var currentData = survey_HoT.getData();
        var colCount = survey_HoT.countCols();
        var firstRow = currentData[0] || []; // Ensure firstRow is an array

        var columnNames = ['item_name', 'text', 'type', 'answers', 'values', 'side_text', 'optional', 'btn_width', 'side_by_side', 'shuffle_question','feedback','feedback_color', 'lock_after_feedback'];

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
                survey_HoT.setDataAtCell(0, insertPos + i, columnsToAdd[i]);
                columnIndices[columnsToAdd[i]] = insertPos + i;
            }
            
            survey_HoT.render();
            colCount = survey_HoT.countCols();
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

            if (columnIndices['type'] !== undefined) newRow[columnIndices['type']] = "likert";
            if (columnIndices['item_name'] !== undefined) newRow[columnIndices['item_name']] = itemName;
            if (columnIndices['text'] !== undefined) newRow[columnIndices['text']] = text;
            if (columnIndices['answers'] !== undefined) newRow[columnIndices['answers']] = answers;
            if (columnIndices['values'] !== undefined) newRow[columnIndices['values']] = values;
            if (columnIndices['optional'] !== undefined) newRow[columnIndices['optional']] = optional;
            if (columnIndices['btn_width'] !== undefined) newRow[columnIndices['btn_width']] = btnWidth;
            if (columnIndices['side_by_side'] !== undefined) newRow[columnIndices['side_by_side']] = sideByside;
            if (columnIndices['shuffle_question'] !== undefined) newRow[columnIndices['shuffle_question']] = shuffleQuestion;
            if (columnIndices['side_text'] !== undefined) newRow[columnIndices['side_text']] = anchors;
            if (columnIndices['feedback'] !== undefined) newRow[columnIndices['feedback']] = feedbackAnswers;
            if (columnIndices['feedback_color'] !== undefined) newRow[columnIndices['feedback_color']] = feedbackColor;
            if (columnIndices['lock_after_feedback'] !== undefined) newRow[columnIndices['lock_after_feedback']] = lockFeedback;

            if (insertAfterRow !== null) {
                survey_HoT.alter('insert_row', insertAfterRow);
                survey_HoT.populateFromArray(insertAfterRow, 0, [newRow]);
            } else {
                survey_HoT.populateFromArray(survey_HoT.countRows(), 0, [newRow]);
            }

            survey_HoT.render();
            setTimeout(() => {
                $("#save_survey_btn").click();
            }, 100);
        }

        addRow(insertAfterRow);
    });
}

// Number
function addNumberOptions(callback) {
    bootbox.dialog({
        title: "Enter details for the new 'number' row",
        message: `
        <form id="detailsForm">
            <div class="form-group">
                <label for="item_name">Item name <span style="color: red;">*</span></label>
                <input type="text" class="form-control" id="item_name" required>
            </div>
            <div class="form-group">
                <label for="text">Question text <span style="color: red;">*</span></label>
                <input type="text" class="form-control" id="text" required>
            </div>
            <div class="form-group">
                <label for="optional">Make this item optional?</label>
                <input type="checkbox" id="optional">
            </div>
            <div class="form-group">
                <label for="shuffle_question">Shuffle the question?</label>
                <input type="checkbox" id="shuffle_question">
            </div>
            ${createInsertRowOption()}
        </form>
        `,
        buttons: {
            submit: {
                label: 'Submit',
                className: 'btn-primary',
                callback: function () {
                    var itemName = $('#item_name').val().toLowerCase().replace(/ /g, '_');
                    var text = $('#text').val();
                    var optional = $('#optional').is(':checked') ? 'yes' : 'no';
                    var shuffleQuestion = $('#shuffle_question').is(':checked') ? 'on' : 'off';
                    var specificRow = $('#specific_row').is(':checked');
                    var rowIndex = $('#row_select').val();

                    var missingFields = [];
                    if (!itemName) missingFields.push('Number item name');
                    if (!text) missingFields.push('Question text');

                    if (missingFields.length > 0) {
                        bootbox.alert("The following fields are missing: " + missingFields.join(', '));
                        return false;
                    }

                    callback(itemName, text, optional, shuffleQuestion, specificRow ? parseInt(rowIndex) + 1 : null);
                    return true;
                }
            },
            cancel: {
                label: 'Cancel',
                className: 'btn-secondary',
                callback: function () {
                    $("#add_item_btn").click();
                }
            }
        }
    });

    window.toggleRowSelect = toggleRowSelect;
}

function addNumberRow() {
    addNumberOptions(function (itemName, text, optional, shuffleQuestion, insertAfterRow) {

        var currentData = survey_HoT.getData();
        var colCount = survey_HoT.countCols();
        var firstRow = currentData[0] || []; // Ensure firstRow is an array

        var columnNames = ['item_name', 'text', 'type', 'optional', 'shuffle_question'];

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
                survey_HoT.setDataAtCell(0, insertPos + i, columnsToAdd[i]);
                columnIndices[columnsToAdd[i]] = insertPos + i;
            }
            
            survey_HoT.render();
            colCount = survey_HoT.countCols();
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

            if (columnIndices['type'] !== undefined) newRow[columnIndices['type']] = "number";
            if (columnIndices['item_name'] !== undefined) newRow[columnIndices['item_name']] = itemName;
            if (columnIndices['text'] !== undefined) newRow[columnIndices['text']] = text;
            if (columnIndices['optional'] !== undefined) newRow[columnIndices['optional']] = optional;
            if (columnIndices['shuffle_question'] !== undefined) newRow[columnIndices['shuffle_question']] = shuffleQuestion;

            if (insertAfterRow !== null) {
                survey_HoT.alter('insert_row', insertAfterRow);
                survey_HoT.populateFromArray(insertAfterRow, 0, [newRow]);
            } else {
                survey_HoT.populateFromArray(survey_HoT.countRows(), 0, [newRow]);
            }

            survey_HoT.render();
            setTimeout(() => {
                $("#save_survey_btn").click();
            }, 100);
        }

        addRow(insertAfterRow);
    });
}

// Page break
function addPageBreakOptions(callback) {
    bootbox.dialog({
        title: "Enter details for the new 'page break' row",
        message: `
        <form id="detailsForm">
            <div class="form-group">
                <label for="item_name">Page Break Name <span style="color: red;">*</span></label>
                <input type="text" class="form-control" id="item_name" required>
            </div>
            ${createInsertRowOption()}
        </form>
        `,
        buttons: {
            submit: {
                label: 'Submit',
                className: 'btn-primary',
                callback: function () {
                    var itemName = $('#item_name').val().toLowerCase().replace(/ /g, '_');
                    var specificRow = $('#specific_row').is(':checked');
                    var rowIndex = $('#row_select').val();

                    var missingFields = [];
                    if (!itemName) missingFields.push('Page Break Name');

                    if (missingFields.length > 0) {
                        bootbox.alert("The following fields are missing: " + missingFields.join(', '));
                        return false;
                    }

                    callback(itemName, specificRow ? parseInt(rowIndex) + 1 : null);
                    return true;
                }
            },
            cancel: {
                label: 'Cancel',
                className: 'btn-secondary',
                callback: function () {
                    console.log('Cancelled');
                    $("#add_item_btn").click();
                }
            }
        }
    });

    window.toggleRowSelect = toggleRowSelect;
}

function addPageBreakRow() {
    addPageBreakOptions(function (itemName, insertAfterRow) {
        var currentData = survey_HoT.getData();
        var colCount = survey_HoT.countCols();
        var firstRow = currentData[0] || []; // Ensure firstRow is an array

        var columnNames = ['item_name', 'type'];

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
                survey_HoT.setDataAtCell(0, insertPos + i, columnsToAdd[i]);
                columnIndices[columnsToAdd[i]] = insertPos + i;
            }
            
            survey_HoT.render();
            colCount = survey_HoT.countCols();
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

            if (columnIndices['type'] !== undefined) newRow[columnIndices['type']] = 'page_break';
            if (columnIndices['item_name'] !== undefined) newRow[columnIndices['item_name']] = itemName;

            if (insertAfterRow !== null) {
                survey_HoT.alter('insert_row', insertAfterRow);
                survey_HoT.populateFromArray(insertAfterRow, 0, [newRow]);
            } else {
                survey_HoT.populateFromArray(survey_HoT.countRows(), 0, [newRow]);
            }

            survey_HoT.render();
            setTimeout(() => {
                $("#save_survey_btn").click();
            }, 100);
        }

        addRow(insertAfterRow);
    });
}

// Paragraph & Text Box
function addTextOptions(callback) {
    bootbox.dialog({
        title: "Enter details for the new 'text box' row",
        message: `
        <form id="detailsForm">
            <div class="form-group">
                <label for="item_name">Item name <span style="color: red;">*</span></label>
                <input type="text" class="form-control" id="item_name" required>
            </div>
            <div class="form-group">
                <label for="text">Question text <span style="color: red;">*</span></label>
                <input type="text" class="form-control" id="text" required>
            </div>
            <div class="form-group">
                <label for="paragraph">Make this a multi-line textbox?</label>
                <input type="checkbox" id="paragraph">
            </div>
            <div class="form-group">
                <label for="optional">Make this item optional?</label>
                <input type="checkbox" id="optional">
            </div>
            <div class="form-group">
                <label for="shuffle_question">Shuffle the question?</label>
                <input type="checkbox" id="shuffle_question">
            </div>
            ${createInsertRowOption()}
        </form>
        `,
        buttons: {
            submit: {
                label: 'Submit',
                className: 'btn-primary',
                callback: function () {
                    var itemName = $('#item_name').val().toLowerCase().replace(/ /g, '_');
                    var text = $('#text').val();
                    var optional = $('#optional').is(':checked') ? 'yes' : 'no';
                    var paragraph = $('#paragraph').is(':checked') ? 'para' : 'text';
                    var shuffleQuestion = $('#shuffle_question').is(':checked') ? 'on' : 'off';
                    var specificRow = $('#specific_row').is(':checked');
                    var rowIndex = $('#row_select').val();

                    var missingFields = [];
                    if (!itemName) missingFields.push('Text box item name');
                    if (!text) missingFields.push('Question text');

                    if (missingFields.length > 0) {
                        bootbox.alert("The following fields are missing: " + missingFields.join(', '));
                        return false;
                    }

                    callback(itemName, text, optional, shuffleQuestion, paragraph, specificRow ? parseInt(rowIndex) + 1 : null);
                    return true;
                }
            },
            cancel: {
                label: 'Cancel',
                className: 'btn-secondary',
                callback: function () {
                    $("#add_item_btn").click();
                }
            }
        }
    });

    window.toggleRowSelect = toggleRowSelect;
}

function addTextRow() {
    addTextOptions(function (itemName, text, optional, shuffleQuestion, paragraph, insertAfterRow) {

        var currentData = survey_HoT.getData();
        var colCount = survey_HoT.countCols();
        var firstRow = currentData[0] || []; // Ensure firstRow is an array

        var columnNames = ['item_name', 'text', 'type', 'optional', 'shuffle_question'];

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
                survey_HoT.setDataAtCell(0, insertPos + i, columnsToAdd[i]);
                columnIndices[columnsToAdd[i]] = insertPos + i;
            }
            
            survey_HoT.render();
            colCount = survey_HoT.countCols();
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

            if (columnIndices['type'] !== undefined) newRow[columnIndices['type']] = paragraph;
            if (columnIndices['item_name'] !== undefined) newRow[columnIndices['item_name']] = itemName;
            if (columnIndices['text'] !== undefined) newRow[columnIndices['text']] = text;
            if (columnIndices['optional'] !== undefined) newRow[columnIndices['optional']] = optional;
            if (columnIndices['shuffle_question'] !== undefined) newRow[columnIndices['shuffle_question']] = shuffleQuestion;

            if (insertAfterRow !== null) {
                survey_HoT.alter('insert_row', insertAfterRow);
                survey_HoT.populateFromArray(insertAfterRow, 0, [newRow]);
            } else {
                survey_HoT.populateFromArray(survey_HoT.countRows(), 0, [newRow]);
            }

            survey_HoT.render();
            setTimeout(() => {
                $("#save_survey_btn").click();
            }, 100);
        }

        addRow(insertAfterRow);
    });
}

// Radio Buttons
function addRadioOptions(callback) {
    bootbox.dialog({
        title: "Enter details for the new 'radio' row",
        message: `
        <form id="detailsForm">
            <div class="form-group">
                <label for="item_name">Item name <span style="color: red;">*</span></label>
                <input type="text" class="form-control" id="item_name" required>
            </div>
            <div class="form-group">
                <label for="text">Question text <span style="color: red;">*</span></label>
                <input type="text" class="form-control" id="text" required>
            </div>
            <div class="form-group">
                <label for="answers">Answers (text → separate with |) <span style="color: red;">*</span></label>
                <input type="text" class="form-control" id="answers" required>
            </div>
            <div class="form-group">
                <label for="values">Values (numbers → separate with |) <span style="color: red;">*</span></label>
                <input type="text" class="form-control" id="values" required>
            </div>
            <div class="form-group">
                <label for="direction">Display the radio buttons vertically?</label>
                <input type="checkbox" id="direction">
            </div>
            <div class="form-group">
                <label for="optional">Make this item optional?</label>
                <input type="checkbox" id="optional">
            </div>
            <div class="form-group">
                <label for="provide_feedback">Provide feedback?</label>
                <input type="checkbox" id="provide_feedback">
            </div>
            <div id="feedback_fields" style="display:none;margin-left: 20px;">
                <div class="form-group">
                    <label for="feedback_answers">Please enter the text that should be displayed for each response (e.g., Incorrect|Correct → separate with |)<span style="color: red;">*</span></label>
                    <input type="text" class="form-control" id="feedback_answers">
                </div>
                <div class="form-group">
                    <label for="feedback_color">Please specicy colours for each piece of feedback (e.g., red|green → separate with |)) <span style="color: red;">*</span></label>
                    <input type="text" class="form-control" id="feedback_color">
                </div>
                <div class="form-group">
                    <label for="lock_feedback">Lock responses after providing feedback?</label>
                    <input type="checkbox" id="lock_feedback">
                </div>
            </div>
            <div class="form-group">
                <label for="shuffle_question">Shuffle the question?</label>
                <input type="checkbox" id="shuffle_question">
            </div>
            ${createInsertRowOption()}
        </form>
        `,
        buttons: {
            submit: {
                label: 'Submit',
                className: 'btn-primary',
                callback: function () {
                    var itemName = $('#item_name').val().toLowerCase().replace(/ /g, '_');
                    var text = $('#text').val();
                    var answers = $('#answers').val().replace(/\s*\|\s*/g, '|');
                    var values = $('#values').val().replace(/\s*\|\s*/g, '|');
                    var optional = $('#optional').is(':checked') ? 'yes' : 'no';
                    var direction = $('#direction').is(':checked') ? 'radio' : 'radio_horizontal';
                    var shuffleQuestion = $('#shuffle_question').is(':checked') ? 'on' : 'off';
                    var specificRow = $('#specific_row').is(':checked');
                    var rowIndex = $('#row_select').val();
                    var provideFeedback = $('#provide_feedback').is(':checked');

                    var missingFields = [];
                    if (!itemName) missingFields.push('Radio item name');
                    if (!text) missingFields.push('Question text');
                    if (!answers) missingFields.push('Answers');
                    if (!values) missingFields.push('Values');

                    if (missingFields.length > 0) {
                        bootbox.alert("The following fields are missing: " + missingFields.join(', '));
                        return false;
                    }

                    var answersArray = answers.split('|');
                    var valuesArray = values.split('|');
                    if (answersArray.length !== valuesArray.length) {
                        bootbox.alert("The number of values in 'answers' does not match the number of values in 'values'. Please ensure they match.");
                        return false;
                    }

                    if (provideFeedback) {
                        var feedbackAnswers = $('#feedback_answers').val().replace(/\s*\|\s*/g, '|');
                        var feedbackColor = $('#feedback_color').val().replace(/\s*\|\s*/g, '|').toLowerCase();
                        if (!feedbackAnswers) missingFields.push('Feedback Answers');
                        if (!feedbackColor) missingFields.push('Feedback Color');

                        var lockFeedback = $('#lock_feedback').is(':checked') ? 'yes' : '';
                        var feedbackAnswersArray = feedbackAnswers.split('|');
                        var feedbackColorArray = feedbackColor.split('|');

                        if (answersArray.length !== feedbackAnswersArray.length) {
                            bootbox.alert("The number of values in 'answers' does not match the number of values in 'feedback answers'. Please ensure they match.");
                            return false;
                        }
                        if (feedbackColorArray.length !== feedbackAnswersArray.length) {
                            bootbox.alert("The number of values in 'feedback answers' does not match the number of values in 'feedback colours'. Please ensure they match.");
                            return false;
                        }
                    }

                    callback(itemName, text, answers, values, optional, direction, shuffleQuestion, specificRow ? parseInt(rowIndex) + 1 : null, feedbackAnswers, feedbackColor, lockFeedback);
                    return true;
                }
            },
            cancel: {
                label: 'Cancel',
                className: 'btn-secondary',
                callback: function () {
                    $("#add_item_btn").click();
                }
            }
        }
    });

    $('#provide_feedback').change(function() {
        if ($(this).is(':checked')) {
            $('#feedback_fields').show();
            $('#feedback_answers').prop('required', true);
            $('#feedback_color').prop('required', true);
        } else {
            $('#feedback_fields').hide();
            $('#feedback_answers').prop('required', false);
            $('#feedback_color').prop('required', false);
        }
    });

    window.toggleRowSelect = toggleRowSelect;
}

function addRadioRow() {
    addRadioOptions(function (itemName, text, answers, values, optional, direction, shuffleQuestion, insertAfterRow, feedbackAnswers, feedbackColor, lockFeedback) {

        var currentData = survey_HoT.getData();
        var colCount = survey_HoT.countCols();
        var firstRow = currentData[0] || []; // Ensure firstRow is an array

        var columnNames = ['item_name', 'text', 'type', 'answers', 'values', 'optional', 'shuffle_question','feedback','feedback_color', 'lock_after_feedback'];

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
                survey_HoT.setDataAtCell(0, insertPos + i, columnsToAdd[i]);
                columnIndices[columnsToAdd[i]] = insertPos + i;
            }
            
            survey_HoT.render();
            colCount = survey_HoT.countCols();
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

            if (columnIndices['type'] !== undefined) newRow[columnIndices['type']] = direction;
            if (columnIndices['item_name'] !== undefined) newRow[columnIndices['item_name']] = itemName;
            if (columnIndices['text'] !== undefined) newRow[columnIndices['text']] = text;
            if (columnIndices['answers'] !== undefined) newRow[columnIndices['answers']] = answers;
            if (columnIndices['values'] !== undefined) newRow[columnIndices['values']] = values;
            if (columnIndices['optional'] !== undefined) newRow[columnIndices['optional']] = optional;
            if (columnIndices['shuffle_question'] !== undefined) newRow[columnIndices['shuffle_question']] = shuffleQuestion;
            if (columnIndices['feedback'] !== undefined) newRow[columnIndices['feedback']] = feedbackAnswers;
            if (columnIndices['feedback_color'] !== undefined) newRow[columnIndices['feedback_color']] = feedbackColor;
            if (columnIndices['lock_after_feedback'] !== undefined) newRow[columnIndices['lock_after_feedback']] = lockFeedback;

            if (insertAfterRow !== null) {
                survey_HoT.alter('insert_row', insertAfterRow);
                survey_HoT.populateFromArray(insertAfterRow, 0, [newRow]);
            } else {
                survey_HoT.populateFromArray(survey_HoT.countRows(), 0, [newRow]);
            }

            survey_HoT.render();
            setTimeout(() => {
                $("#save_survey_btn").click();
            }, 100);
        }

        addRow(insertAfterRow);
    });
}

// REDCAP PII
function addRedcapPiiOptions(callback) {
    bootbox.dialog({
        title: "Enter details for the new 'Redcap PII' row",
        message: `
        <form id="detailsForm">
            <div class="form-group">
                <label for="item_name">Item name <span style="color: red;">*</span></label>
                <input type="text" class="form-control" id="item_name" required>
            </div>
            ${createInsertRowOption()}
        </form>
        `,
        buttons: {
            submit: {
                label: 'Submit',
                className: 'btn-primary',
                callback: function () {
                    var itemName = $('#item_name').val().toLowerCase().replace(/ /g, '_');
                    var specificRow = $('#specific_row').is(':checked');
                    var rowIndex = $('#row_select').val();

                    var missingFields = [];
                    if (!itemName) missingFields.push('Redcap PII item name');

                    if (missingFields.length > 0) {
                        bootbox.alert("The following fields are missing: " + missingFields.join(', '));
                        return false;
                    }

                    callback(itemName, specificRow ? parseInt(rowIndex) + 1 : null);
                    return true;
                }
            },
            cancel: {
                label: 'Cancel',
                className: 'btn-secondary',
                callback: function () {
                    $("#add_item_btn").click();
                }
            }
        }
    });

    window.toggleRowSelect = toggleRowSelect;
}

function addRedcapPiiRow() {
    addRedcapPiiOptions(function (itemName, insertAfterRow) {

        var currentData = survey_HoT.getData();
        var colCount = survey_HoT.countCols();
        var firstRow = currentData[0] || []; // Ensure firstRow is an array

        var columnNames = ['item_name', 'type'];

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
                survey_HoT.setDataAtCell(0, insertPos + i, columnsToAdd[i]);
                columnIndices[columnsToAdd[i]] = insertPos + i;
            }
            
            survey_HoT.render();
            colCount = survey_HoT.countCols();
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

            if (columnIndices['type'] !== undefined) newRow[columnIndices['type']] = 'redcap_pii';
            if (columnIndices['item_name'] !== undefined) newRow[columnIndices['item_name']] = itemName;

            if (insertAfterRow !== null) {
                survey_HoT.alter('insert_row', insertAfterRow);
                survey_HoT.populateFromArray(insertAfterRow, 0, [newRow]);
            } else {
                survey_HoT.populateFromArray(survey_HoT.countRows(), 0, [newRow]);
            }

            survey_HoT.render();
            setTimeout(() => {
                $("#save_survey_btn").click();
            }, 100);
        }

        addRow(insertAfterRow);
    });
}
