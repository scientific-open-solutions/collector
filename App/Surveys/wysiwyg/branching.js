/*  =============================================================
    This controls the WYSIWYG Branching system on the survey page 
    =============================================================  */

// Button click handler to show modal
function addBranching(callback) {
    var selectedChildAnswers = {};
    var selectedDropdownValues = {};
    var assignedLetters = {};
    var checkedParents = [];

    function createDropdown(id, answers, existingValue, parentLetter, parentName) {
        var dropdown = `<select class="form-control answer-dropdown form-select" id="dropdown_${id}">
                            <option class="text-secondary" value="" disabled selected>Branching from: ${parentName}</option>
                            <option value="none">No branching: always display</option>`;
        answers.forEach((answer, index) => {
            var letterNumber = parentLetter + (index + 1);
            var selected = letterNumber === existingValue ? 'selected' : '';
            dropdown += `<option value="${letterNumber}" ${selected} data-letter="${letterNumber}">Display upon: ${answer}</option>`;
        });
        dropdown += `</select>`;
        return dropdown;
    }

    function updateDropdowns(startIndex, selectedAnswers, parentLetter, parentName) {
        $(".dropdown-container").each(function() {
            var id = parseInt($(this).attr("id").split("_")[1]);
            if (id > startIndex) {
                var existingValue = selectedDropdownValues[itemNames[id]] || 'none';
                var dropdown = createDropdown(id, selectedAnswers, existingValue, parentLetter, parentName);
                $(this).html(dropdown).show();
            }
        });
    }

    function clearDropdowns(startIndex) {
        $(".dropdown-container").each(function() {
            var id = parseInt($(this).attr("id").split("_")[1]);
            if (id > startIndex) {
                $(this).html('').show();
            }
        });
    }

    function formatSelectedAnswers(totalAnswers, selectedAnswers, parentLetter) {
        return totalAnswers.map((answer, index) => {
            const selectedIndex = selectedAnswers.indexOf(answer);
            return selectedIndex !== -1 ? `${parentLetter}${selectedIndex + 1}` : '';
        }).join('|');
    }

    function captureData() {
        var branchingData = [];
        $(".branch-checkbox:checked").each(function() {
            var parentItemName = $(this).val();
            var parentIndex = itemNames.indexOf(parentItemName);
            var selectedAnswers = selectedChildAnswers[parentItemName] || [];
            var totalAnswers = answers[parentIndex] ? answers[parentIndex].split('|') : [];
            var parentLetter = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[checkedParents.indexOf(parentItemName)];

            if (selectedAnswers.length > 0) {
                var formattedAnswers = formatSelectedAnswers(totalAnswers, selectedAnswers, parentLetter);
                branchingData.push({
                    parentItem: parentItemName,
                    formattedAnswers: formattedAnswers
                });
            }
        });

        updateHandsontable(branchingData, 'branch');
    }

    function updateHandsontable(branchingData, columnType) {
        var hotData = survey_HoT.getData();
        var columnIndex = hotData[0].indexOf(columnType);

        if (columnIndex === -1) {
            survey_HoT.alter('insert_col', hotData[0].length);
            columnIndex = hotData[0].length - 1;
            hotData[0][columnIndex] = columnType;
        }

        branchingData.forEach(function(data) {
            for (var i = 1; i < hotData.length; i++) {
                if (hotData[i][itemNameColIndex] === data.parentItem) {
                    hotData[i][columnIndex] = data.formattedAnswers;
                    break;
                }
            }
        });

        survey_HoT.populateFromArray(0, 0, hotData);
        survey_HoT.render();

        if (columnType === 'branch') {
            updateBlockColumn();
        }
    }

    function updateBlockColumn() {
        var hotData = survey_HoT.getData();
        var blockColIndex = hotData[0].indexOf('block');

        if (blockColIndex === -1) {
            survey_HoT.alter('insert_col', hotData[0].length);
            blockColIndex = hotData[0].length - 1;
            hotData[0][blockColIndex] = 'block';
        }

        for (var i = 1; i < hotData.length; i++) {
            var itemName = hotData[i][itemNameColIndex];
            var selectedDropdownValue = selectedDropdownValues[itemName];
            if (selectedDropdownValue) {
                hotData[i][blockColIndex] = selectedDropdownValue !== 'none' ? selectedDropdownValue : '';
            }
        }

        survey_HoT.populateFromArray(0, 0, hotData);
        survey_HoT.render();
        setTimeout(() => {
            $("#save_survey_btn").click();
        }, 100);
    }

    function prepopulateSelections() {
        var hotData = survey_HoT.getData();
        var branchColIndex = hotData[0].indexOf('branch');
        var blockColIndex = hotData[0].indexOf('block');
        var itemNameColIndex = hotData[0].indexOf('item_name');
        
        if (branchColIndex !== -1) {
            for (var i = 1; i < hotData.length; i++) {
                var itemName = hotData[i][itemNameColIndex];
                if (hotData[i][branchColIndex]) {
                    var formattedAnswers = hotData[i][branchColIndex];
                    var parentIndex = itemNames.indexOf(itemName);
                    var totalAnswers = answers[parentIndex] ? answers[parentIndex].split('|') : [];
                    var selectedAnswers = [];
        
                    formattedAnswers.split('|').forEach((letter, index) => {
                        if (letter) {
                            selectedAnswers.push(totalAnswers[index]);
                        }
                    });
        
                    selectedChildAnswers[itemName] = selectedAnswers;
        
                    if (!checkedParents.includes(itemName)) {
                        checkedParents.push(itemName);
                    }
                    
                    var checkbox = $(`input.form-check-input[value='${itemName}']`);
                    if (checkbox.length > 0) {
                        checkbox.prop('checked', true);
                    }
                }
            }
        }
        
        if (blockColIndex !== -1) {
            for (var i = 1; i < hotData.length; i++) {
                var itemName = hotData[i][itemNameColIndex];
                if (hotData[i][blockColIndex]) {
                    selectedDropdownValues[itemName] = hotData[i][blockColIndex];
                }
            }
        }
        
        var displayDropdowns = false;
        itemNames.forEach((itemName, i) => {
            var answersValues = answers[itemNames.indexOf(itemName)] ? answers[itemNames.indexOf(itemName)].split('|') : [];
            var answersDiv = $(`#answers_${itemName}`);
            var dropdownContainer = $(`#dropdown_${i}`);
        
            if (selectedChildAnswers[itemName]) {
                answersDiv.empty();
                answersValues.forEach((answer, j) => {
                    var isChecked = selectedChildAnswers[itemName].includes(answer) ? 'checked' : '';
                    answersDiv.append(
                        `<div class="form-check">
                            <input class="form-check-input block-checkbox" type="checkbox" value="${answer}" id="answer_${itemName}_${j}" ${isChecked}>
                            <label class="form-check-label" for="answer_${itemName}_${j}">
                                ${answer}
                            </label>
                        </div>`
                    );
                });
                answersDiv.prepend('<span>Please select answer(s) to show blocks</span>');
                answersDiv.show();
                displayDropdowns = true;
            }
        
            if (displayDropdowns) {
                populateDropdowns();
            }
        });
    }

    function populateDropdowns() {
        var hotData = survey_HoT.getData();
        var branchColIndex = hotData[0].indexOf('branch');
        var blockColIndex = hotData[0].indexOf('block');
        var itemNameColIndex = hotData[0].indexOf('item_name');
        var answersColIndex = hotData[0].indexOf('answers');
        
        if (branchColIndex !== -1) {
            var branchData = [];
            var branchParents = [];
    
            // First pass: Collect branch data
            for (var i = 1; i < hotData.length; i++) {
                if (hotData[i][branchColIndex]) {
                    var branchValues = hotData[i][branchColIndex].split('|');
                    var answersValues = hotData[i][answersColIndex].split('|');
                    var itemName = hotData[i][itemNameColIndex];
    
                    branchData.push({ itemName, branchValues, answersValues });
                    branchParents.push(itemName);
                }
            }
    
            // Second pass: Populate dropdowns with only checked answers
            for (var i = 0; i < branchData.length; i++) {
                var parentItemName = branchData[i].itemName;
                var branchValues = branchData[i].branchValues;
                var answersValues = branchData[i].answersValues;
                var parentIndex = itemNames.indexOf(parentItemName);
    
                for (var j = parentIndex + 1; j < itemNames.length; j++) {
                    if (branchParents.includes(itemNames[j])) break; // Stop if another branch parent is found
                    
                    var dropdownContainer = $(`#dropdown_${j}`);
                    var dropdown = `<select class="form-control answer-dropdown form-select" id="dropdown_${j}">
                                        <option class="text-secondary" value="" disabled>Branching from: ${parentItemName}</option>
                                        <option value="none" selected>No branching: always display</option>`;
    
                    for (var k = 0; k < branchValues.length; k++) {
                        if (branchValues[k]) {
                            dropdown += `<option value="${branchValues[k]}" data-letter="${branchValues[k]}">Display upon: ${answersValues[k]}</option>`;
                        }
                    }
    
                    dropdown += `</select>`;
                    dropdownContainer.html(dropdown).show();
                }
            }
        }
    
        // Display dropdowns for checked parent elements
        for (var i = 0; i < branchData.length; i++) {
            var parentItemName = branchData[i].itemName;
            var parentItemName2 = (i > 0) ? branchData[i-1].itemName : branchData[i].itemName;
            var branchValues = (i > 0) ? branchData[i-1].branchValues : branchData[i].branchValues;
            // var branchValues = branchData[i].branchValues;
            var answersValues = branchData[i].answersValues;
            var parentIndex = itemNames.indexOf(parentItemName);
        
            var dropdownContainer = $(`#dropdown_${parentIndex}`);
        
            if (i > 0) { // Skip the first element
                var dropdown = `<select class="form-control answer-dropdown form-select" id="dropdown_${parentIndex}">
                                <option class="text-secondary" value="" disabled>Branching from: ${parentItemName2}</option>
                                <option value="none" selected>No branching: always display</option>`
        
                for (var k = 0; k < branchValues.length ; k++) {
                    if (branchValues[k]) {
                        dropdown += `<option value="${branchValues[k]}" data-letter="${branchValues[k]}">Display upon: ${answersValues[k]}</option>`;
                    }
                }
        
                dropdown += `</select>`;
                dropdownContainer.html(dropdown).show();
            } else {
                dropdownContainer.html('').hide(); // Hide the dropdown for the first element
            }
        }
        
    
        // Third pass: Set selected options based on block column
            for (var i = 0; i < hotData.length; i++) {
                if (hotData[i][blockColIndex]) {
                    var selectedBlockValue = hotData[i][blockColIndex];
                    var dropdownContainer = $(`#dropdown_${i - 1}`); // Corrected to target the correct row
                    var dropdown = dropdownContainer.find('select');
    
                    if (dropdown.length) {
                        dropdown.val(selectedBlockValue);
                    }
                }
            }
    }

    var hotData = survey_HoT.getData();
    var itemNames = [];
    var answers = [];
    var types = [];
    
    var itemNameColIndex = hotData[0].indexOf('item_name');
    var answersColIndex = hotData[0].indexOf('answers');
    var typeColIndex = hotData[0].indexOf('type');

    for (var i = 1; i < hotData.length; i++) {
        if (hotData[i][itemNameColIndex] !== '' && hotData[i][typeColIndex] !== 'redcap_pii') {
            itemNames.push(hotData[i][itemNameColIndex]);
            answers.push(hotData[i][answersColIndex]);
            types.push(hotData[i][typeColIndex]);
        }
    }

    var validTypes = ['radio', 'radio_horizontal', 'radio_vertical', 'dropdown', 'likert'];

    var modalContent = '<div id="itemList"><p>Please select an item to branch from. Disabled items cannot act as branching questions.</p>';
    itemNames.forEach((itemName, i) => {
        var sanitizedItemName = itemName;
        var isChecked = selectedChildAnswers[sanitizedItemName] ? 'checked' : '';
        var displayStyle = isChecked ? 'block' : 'none';
        var isDisabled = !validTypes.includes(types[i]) ? 'disabled' : '';
        modalContent += 
            `<div class="form-check">
                <input class="form-check-input branch-checkbox" type="checkbox" value="${itemName}" id="item_${i}" ${isDisabled} ${isChecked}>
                <label class="form-check-label" for="item_${i}">
                    ${itemName}
                </label>
                <div class="answers answers_${i}" id="answers_${sanitizedItemName}" style="display: ${displayStyle};"></div>
                <div id="dropdown_${i}" class="dropdown-container" style="display: ${displayStyle};"></div>
            </div>`;
    });
    modalContent += '</div>';

    bootbox.dialog({
        title: 'Branching Editor',
        message: modalContent,
        buttons: {
            ok: {
                label: 'OK',
                className: 'btn-primary',
                callback: function() {
                    captureData();
                }
            },
            close: {
                label: 'Close',
                className: 'btn-secondary'
            }
        }
    });

    itemNames.forEach((itemName, i) => {
        var sanitizedItemName = itemName;
        var answersDiv = $(`#answers_${sanitizedItemName}`);
        var dropdownContainer = $(`#dropdown_${i}`);
        var answersValues = answers[itemNames.indexOf(sanitizedItemName)] ? answers[itemNames.indexOf(sanitizedItemName)].split('|') : [];

        if (selectedChildAnswers[sanitizedItemName]) {
            answersDiv.empty();
            answersValues.forEach((answer, j) => {
                var isChecked = selectedChildAnswers[sanitizedItemName].includes(answer) ? 'checked' : '';
                answersDiv.append(
                    `<div class="form-check">
                        <input class="form-check-input block-checkbox" type="checkbox" value="${answer}" id="answer_${sanitizedItemName}_${j}" ${isChecked}>
                        <label class="form-check-label" for="answer_${sanitizedItemName}_${j}">
                            ${answer}
                        </label>
                    </div>`
                );
            });
            answersDiv.prepend('<span>Please select answer(s) to show blocks</span>');
            answersDiv.show();
        }

        if (selectedDropdownValues[sanitizedItemName]) {
            var existingValue = selectedDropdownValues[sanitizedItemName] || 'none';
            var parentLetter = checkedParents.includes(sanitizedItemName) ? 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[checkedParents.indexOf(sanitizedItemName)] : '';
            dropdownContainer.html(createDropdown(i, answersValues, existingValue, parentLetter, sanitizedItemName)).show();
        }
    });

    $(document).on('change', '.branch-checkbox', function() {
        var itemName = $(this).val();
        var index = parseInt($(this).attr('id').split('_')[1]);
        var sanitizedItemName = itemName;
        var answersDiv = $(`#answers_${sanitizedItemName}`);
        var answersValues = answers[itemNames.indexOf(itemName)] ? answers[itemNames.indexOf(itemName)].split('|') : [];

        if ($(this).is(':checked')) {
            checkedParents.push(itemName);
            answersDiv.empty();
            answersValues.forEach((answer, j) => {
                answersDiv.append(
                    `<div class="form-check">
                        <input class="form-check-input block-checkbox" type="checkbox" value="${answer}" id="answer_${sanitizedItemName}_${j}">
                        <label class="form-check-label" for="answer_${sanitizedItemName}_${j}">
                            ${answer}
                        </label>
                    </div>`
                );
            });
            answersDiv.prepend('<span>Please select answer(s) to show blocks</span>');
            answersDiv.show();
            clearDropdowns(index);
        } else {
            var parentIndex = checkedParents.indexOf(itemName);
            if (parentIndex > -1) {
                checkedParents.splice(parentIndex, 1);
            }
            answersDiv.hide();
            clearDropdowns(index);
        }
    });

    $(document).on('change', '.block-checkbox', function() {
        var parentItemName = $(this).closest('.answers').attr('id').split('answers_')[1].replace(/__/g, "_");
        var parentIndex = itemNames.indexOf(parentItemName);
        var parentLetter = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[checkedParents.indexOf(parentItemName)];
        var selectedAnswers = [];
        var totalAnswers = answers[parentIndex] ? answers[parentIndex].split('|') : [];

        $(`.answers_${parentIndex} .block-checkbox:checked`).each(function() {
            selectedAnswers.push($(this).val());
        });

        selectedChildAnswers[parentItemName] = selectedAnswers;

        if (selectedAnswers.length > 0) {
            updateDropdowns(parentIndex, selectedAnswers, parentLetter, parentItemName);
        } else {
            clearDropdowns(parentIndex);
        }
    });

    $(document).on('change', '.answer-dropdown', function() {
        var dropdownId = parseInt($(this).attr('id').split('_')[1]);
        var itemName = itemNames[dropdownId];
        selectedDropdownValues[itemName] = $(this).val();
    });

    prepopulateSelections();
}
