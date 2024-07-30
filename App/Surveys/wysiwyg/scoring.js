/*  ===========================================================
    This controls the WYSIWYG Scoring system on the survey page 
    ===========================================================  */

    $("#scoring_btn").on("click", function () {
        // Function to check for the presence of 'reversed' column
        function checkReversedColumn() {
            var currentData = survey_HoT.getData();
            var firstRow = currentData[0] || []; // Ensure firstRow is an array
            return firstRow.includes('reversed');
        }
    
        // Function to check if a scoring name already exists
        function scoringNameExists(scoringName) {
            var currentData = survey_HoT.getData();
            var firstRow = currentData[0] || []; // Ensure firstRow is an array
            var formattedName = "score:" + scoringName;
            return firstRow.includes(formattedName);
        }
    
        // Function to get existing scores
        function getExistingScores() {
            var currentData = survey_HoT.getData();
            var firstRow = currentData[0] || []; // Ensure firstRow is an array
            return firstRow.filter(cell => typeof cell === 'string' && cell.startsWith("score:")).map(cell => cell.slice(6));
        }
    
        // Function to check for conflicts
        function checkForConflicts(includedItems, reversedItems, currentScoreName) {
            var currentData = survey_HoT.getData();
            var firstRow = currentData[0] || [];
            var itemIndex = firstRow.indexOf('item_name');
            var reversedColumnIndex = firstRow.indexOf('reversed');
            var conflicts = [];
            var conflictDetails = {};
    
            includedItems.forEach(item => {
                for (var i = 1; i < currentData.length; i++) {
                    if (currentData[i][itemIndex] === item) {
                        var existingReversedValue = currentData[i][reversedColumnIndex];
                        var existingScoreName = getScoreNameForItem(item);
                        if (existingScoreName && existingScoreName !== currentScoreName) {
                            if ((reversedItems.includes(item) && existingReversedValue === 'no') || 
                                (!reversedItems.includes(item) && existingReversedValue === 'yes')) {
                                conflicts.push(item);
                                conflictDetails[item] = existingScoreName;
                            }
                        }
                    }
                }
            });
    
            return { conflicts, conflictDetails };
        }
    
        // Function to get the score name for a specific item
        function getScoreNameForItem(item) {
            var currentData = survey_HoT.getData();
            var firstRow = currentData[0] || [];
            var itemIndex = firstRow.indexOf('item_name');
            for (var colIndex = 0; colIndex < firstRow.length; colIndex++) {
                if (typeof firstRow[colIndex] === 'string' && firstRow[colIndex].startsWith("score:")) {
                    for (var rowIndex = 1; rowIndex < currentData.length; rowIndex++) {
                        if (currentData[rowIndex][itemIndex] === item && currentData[rowIndex][colIndex]) {
                            return firstRow[colIndex].slice(6); // Remove "score:" prefix
                        }
                    }
                }
            }
            return null;
        }
    
        // Function to create the scoring system modal content
        function createScoringSystemModal(existingScore) {
            var currentData = survey_HoT.getData();
            var firstRow = currentData[0] || [];
            var itemIndex = firstRow.indexOf('item_name');
            var typeIndex = firstRow.indexOf('type');
            var colCount = survey_HoT.countCols();
            var rowCount = survey_HoT.countRows();
    
            // Find rows with specific types
            var validTypes = ['likert', 'radio', 'radio_horizontal', 'dropdown', 'checkbox', 'checkbox_horizontal'];
            var rows = currentData.filter(row => validTypes.includes(row[typeIndex]));
    
            // Create table content
            var tableRows = rows.map((row, i) => `
                <tr>
                    <td class="item-name">${row[itemIndex]}</td>
                    <td class="text-center"><input type="checkbox" class="include-checkbox" data-item="${row[itemIndex]}"></td>
                    <td class="text-center"><input type="checkbox" class="reverse-checkbox" data-item="${row[itemIndex]}"></td>
                </tr>
            `).join('');
    
            var modalContent = `
                <form id="scoringForm">
                    <div class="form-group" style="padding-bottom: 15px;">
                        <label for="scoring_name">Please enter the name of your scale/subscale <span style="color: red;">*</span></label>
                        <input type="text" class="form-control" id="scoring_name" required>
                    </div>
                    <div class="table-responsive" style="width: 65%;">
                        <table class="table table-bordered" style="table-layout: fixed; width: 100%;">
                            <thead style="background-color: #f7f7f7; color: var(--collector_blue);">
                                <tr>
                                    <th style="width: auto;">Item Name</th>
                                    <th style="width: 100px; text-align: center;">Include</th>
                                    <th style="width: 100px; text-align: center;">Reverse</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${tableRows}
                            </tbody>
                        </table>
                    </div>
                </form>
            `;
    
            // Open the modal
            var dialogInstance = bootbox.dialog({
                title: existingScore ? "Modify Scoring System" : "Create Scoring System",
                message: modalContent,
                size: 'large',
                buttons: {
                    submit: {
                        label: "Submit",
                        className: 'btn-primary',
                        callback: function () {
                            var scoringName = $('#scoring_name').val().toLowerCase().replace(/ /g, '_');
    
                            // Check if the scoring name already exists
                            if (!existingScore && scoringNameExists(scoringName)) {
                                bootbox.alert("Sorry, the scoring name already exists. Please enter a new name.");
                                return false; // Prevent the modal from closing
                            }
    
                            var includedItems = [];
                            var reversedItems = [];
    
                            $('.include-checkbox:checked').each(function () {
                                includedItems.push($(this).data('item'));
                            });
    
                            $('.reverse-checkbox:checked').each(function () {
                                reversedItems.push($(this).data('item'));
                            });
    
                            // Check if at least one item is included
                            if (includedItems.length === 0 || !scoringName) {
                                bootbox.alert("You must include at least one item and provide a scoring name.");
                                return false; // Prevent the modal from closing
                            }
    
                            // Check for conflicts
                            var { conflicts, conflictDetails } = checkForConflicts(includedItems, reversedItems, existingScore || scoringName);
                            if (conflicts.length > 0) {
                                var conflictMessage = "Conflicts found for the following items:<br>";
                                conflicts.forEach(item => {
                                    conflictMessage += `- ${item} (Clashes with scale score: ${conflictDetails[item]})<br>`;
                                });
                                conflictMessage += "<br>This occurs when one scale score reverses an item and another doesn't. Do you want to accept the clash or return to the modal to fix it?";
    
                                bootbox.dialog({
                                    title: "Conflict Detected",
                                    message: conflictMessage,
                                    buttons: {
                                        accept: {
                                            label: "Accept Clash",
                                            className: 'btn-primary',
                                            callback: function () {
                                                submitScoringSystem(scoringName, includedItems, reversedItems, existingScore);
                                                dialogInstance.modal('hide');
                                            }
                                        },
                                        return: {
                                            label: "Fix Conflicts",
                                            className: 'btn-secondary',
                                            callback: function () {
                                                conflicts.forEach(item => {
                                                    $(`td.item-name`).filter(function() {
                                                        return $(this).text() === item;
                                                    }).css('color', 'red');
                                                });
                                                dialogInstance.modal('show');
                                            }
                                        }
                                    }
                                });
    
                                return false; // Prevent the modal from closing
                            }
    
                            submitScoringSystem(scoringName, includedItems, reversedItems, existingScore);
                            return true;
                        }
                    },
                    cancel: {
                        label: "Cancel",
                        className: 'btn-secondary',
                        callback: function () {
                            console.log('Cancelled');
                        }
                    }
                }
            });
    
            // Automatically check the include box if the reverse box is checked
            $(document).on('change', '.reverse-checkbox', function () {
                if ($(this).is(':checked')) {
                    $(this).closest('tr').find('.include-checkbox').prop('checked', true);
                }
            });
    
            // Populate form if modifying an existing score
            if (existingScore) {
                $('#scoring_name').val(existingScore);
    
                var scoreColumnIndex = firstRow.indexOf("score:" + existingScore);
                for (var i = 1; i < rowCount; i++) {
                    var itemName = currentData[i][itemIndex];
                    var scoreValue = currentData[i][scoreColumnIndex];
                    if (scoreValue === '1' || scoreValue === 'r1') {
                        $(`.include-checkbox[data-item="${itemName}"]`).prop('checked', true);
                    }
                    if (scoreValue === 'r1') {
                        $(`.reverse-checkbox[data-item="${itemName}"]`).prop('checked', true);
                    }
                }
            }
        }
    
        // Function to submit the scoring system
        function submitScoringSystem(scoringName, includedItems, reversedItems, existingScore) {
            var currentData = survey_HoT.getData();
            var firstRow = currentData[0] || [];
            var itemIndex = firstRow.indexOf('item_name');
            var colCount = survey_HoT.countCols();
            var rowCount = survey_HoT.countRows();
    
            var scoreColumnIndex;
            var reversedColumnIndex = firstRow.indexOf("reversed");
    
            // Create new columns if not modifying an existing score
            if (!existingScore) {
                scoreColumnIndex = firstRow.indexOf("score:" + scoringName);
                if (scoreColumnIndex === -1) {
                    scoreColumnIndex = colCount - 1;
                    survey_HoT.setDataAtCell(0, scoreColumnIndex, "score:" + scoringName);
                }
                if (reversedColumnIndex === -1) {
                    reversedColumnIndex = colCount;
                    survey_HoT.setDataAtCell(0, reversedColumnIndex, "reversed");
                }
            } else {
                scoreColumnIndex = firstRow.indexOf("score:" + existingScore);
            }
    
            for (var i = 1; i < rowCount; i++) {
                var itemName = currentData[i][itemIndex];
                if (includedItems.includes(itemName)) {
                    if (reversedItems.includes(itemName)) {
                        survey_HoT.setDataAtCell(i, scoreColumnIndex, 'r1');
                        survey_HoT.setDataAtCell(i, reversedColumnIndex, 'yes');
                    } else {
                        survey_HoT.setDataAtCell(i, scoreColumnIndex, '1');
                        survey_HoT.setDataAtCell(i, reversedColumnIndex, 'no');
                    }
                } else if (!existingScore) {
                    // Only clear the value if we are creating a new score and the item is not included
                    survey_HoT.setDataAtCell(i, scoreColumnIndex, '');
                }
            }
    
            // Update the reversed column only for included items
            for (var i = 1; i < rowCount; i++) {
                var itemName = currentData[i][itemIndex];
                if (includedItems.includes(itemName)) {
                    if (reversedItems.includes(itemName)) {
                        survey_HoT.setDataAtCell(i, reversedColumnIndex, 'yes');
                    } else {
                        survey_HoT.setDataAtCell(i, reversedColumnIndex, 'no');
                    }
                }
            }
    
            survey_HoT.render();
            setTimeout(() => {
                $("#save_survey_btn").click();
            }, 100);
            // Process the included and reversed items as needed
            console.log("Scoring Name:", scoringName);
            console.log("Included Items:", includedItems);
            console.log("Reversed Items:", reversedItems);
        }
    
        // Check for 'reversed' column and open modal if it doesn't exist
        if (!checkReversedColumn()) {
            createScoringSystemModal();
        } else {
            bootbox.dialog({
                title: "Scoring Editor",
                message: "Do you want to create a new scale/subscale score or modify an existing one?",
                closeButton: true, // Add close button here
                buttons: {
                    create: {
                        label: "Create New",
                        className: 'btn-primary',
                        callback: function () {
                            createScoringSystemModal();
                        }
                    },
                    modify: {
                        label: "Modify Existing",
                        className: 'btn-primary',
                        callback: function () {
                            var existingScores = getExistingScores();
                            var options = existingScores.map(score => `<option value="${score}">${score}</option>`).join('');
                            var modalContent = `
                                <form id="selectScoreForm">
                                    <div class="form-group" style="padding-bottom: 15px;">
                                        <label for="existing_scores">Select an existing score to modify</label>
                                        <select class="form-control form-select" id="existing_scores" required>
                                            <option value="">Select...</option>
                                            ${options}
                                        </select>
                                    </div>
                                </form>
                            `;
    
                            bootbox.dialog({
                                title: "Modify Existing Score",
                                message: modalContent,
                                closeButton: true, // Add close button here
                                buttons: {
                                    submit: {
                                        label: "Submit",
                                        className: 'btn-primary',
                                        callback: function () {
                                            var selectedScore = $('#existing_scores').val();
                                            if (selectedScore) {
                                                createScoringSystemModal(selectedScore);
                                            } else {
                                                bootbox.alert("You must select a score to modify.");
                                                return false; // Prevent the modal from closing
                                            }
                                        }
                                    },
                                    cancel: {
                                        label: "Cancel",
                                        className: 'btn-secondary',
                                        callback: function () {
                                            console.log('Cancelled');
                                        }
                                    }
                                }
                            });
                        }
                    },
                    cancel: {
                        label: "Cancel",
                        className: 'btn-secondary',
                        callback: function () {
                            console.log('Cancelled');
                        }
                    } 
                }
            });
        }
    });
