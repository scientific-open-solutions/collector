/*  ===============================================================================
    This controls the WYSIWYG Scoring system on the projects page for the procedure
    ===============================================================================  */

    $("#proc_shuffle_btn").on("click", function () {
        /** *** */
    
        // Function to get column values by header name
        function getColumnValues(headerName) {
            const data = handsOnTable_Procedure.getData();
            const headerRow = data[0];
            const columnIndex = headerRow.indexOf(headerName);
    
            if (columnIndex === -1) {
                return [];
            }
    
            const columnValues = [];
            for (let i = 1; i < data.length - 1; i++) { // Include all rows after the header except the last empty row
                const value = data[i][columnIndex];
                columnValues.push(value);
            }
            return columnValues;
        }
    
        const phasetypeValues = getColumnValues('phasetype');
        const shuffle1Values = getColumnValues('shuffle_1');
        const shuffle2Values = getColumnValues('shuffle_2');
    
        // Determine if there are any existing values to show headers
        const hasShuffle1Values = shuffle1Values.some(value => value !== "" && value !== "off");
    
        let formHtml = `<table class="table table-bordered" style="table-layout: fixed; width: 100%;">
                        <thead style="background-color: #f7f7f7; color: var(--collector_blue);">
                            <tr>   
                                <th style="width: auto;">Trial</th>
                                <th style="width: 80px; text-align: center;">Shuffle?</th>
                                <th style="width: 140px; text-align: center; ${hasShuffle1Values ? '' : 'display:none;'}" class="within-block-header">Within Block</th>
                                <th style="width: 140px; text-align: center; ${hasShuffle1Values ? '' : 'display:none;'}" class="between-block-header">Between Block</th>
                            </tr>
                        </thead>
                        <tbody>`;
        phasetypeValues.forEach((value, index) => {
            const withinBlockValue = shuffle1Values[index] || "";
            const betweenBlockValue = shuffle2Values[index] || "";
            const isChecked = (withinBlockValue !== "" && withinBlockValue !== "off") || (betweenBlockValue !== "" && betweenBlockValue !== "off");
    
            formHtml += `<tr>
                            <td class="phasetype-cell" data-row-index="${index}">${value}</td>
                            <td style="text-align: center;"><input type="checkbox" class="block-toggle text-center" data-row-index="${index}" ${isChecked ? "checked" : ""}></td>
                            <td style="display:${isChecked ? "table-cell" : "none"};" class="within-block-cell" data-row-index="${index}"><input type="text" class="form-control within-block-input" placeholder="Block name" data-row-index="${index}" value="${withinBlockValue !== "off" ? withinBlockValue : ''}"></td>
                            <td style="display:${isChecked ? "table-cell" : "none"};" class="between-block-cell" data-row-index="${index}"><input type="text" class="form-control between-block-input" placeholder="Block name" data-row-index="${index}" value="${betweenBlockValue !== "off" ? betweenBlockValue : ''}"></td>
                        </tr>`;
        });
        formHtml += '</tbody></table>';
    
        bootbox.dialog({
            title: 'Shuffle Configuration',
            message: formHtml,
            size: 'large',
            buttons: {
                confirm: {
                    label: "Save",
                    className: 'btn-primary',
                    callback: function () {
                        let allValid = true;
                        let missingValues = [];
                        let betweenBlockCount = 0;
                        let uniqueBetweenBlockValues = new Set();
    
                        $('.block-toggle:checked').each(function() {
                            const rowIndex = $(this).data('row-index');
                            const withinInput = $(`.within-block-input[data-row-index="${rowIndex}"]`);
                            const withinValue = withinInput.val() ? withinInput.val().trim() : "";
                            const betweenInput = $(`.between-block-input[data-row-index="${rowIndex}"]`);
                            const betweenValue = betweenInput.val() ? betweenInput.val().trim() : "";
                            const phasetypeValue = $(`.phasetype-cell[data-row-index="${rowIndex}"]`).text().trim();
    
                            if (withinValue === "") {
                                allValid = false;
                                missingValues.push(phasetypeValue);
                                $(`.phasetype-cell[data-row-index="${rowIndex}"]`).css('color', 'red');
                            } else {
                                $(`.phasetype-cell[data-row-index="${rowIndex}"]`).css('color', '');
                            }
    
                            if (betweenValue !== "") {
                                betweenBlockCount++;
                                uniqueBetweenBlockValues.add(betweenValue);
                            }
                        });
    
                        if (!allValid) {
                            bootbox.alert("Missing within block shuffle values for: " + missingValues.join(", "));
                            return false;
                        }
    
                        if (betweenBlockCount > 0 && betweenBlockCount < 2) {
                            bootbox.alert("There must be at least two rows with values in the between block column.");
                            return false;
                        }
    
                        if (betweenBlockCount >= 2 && uniqueBetweenBlockValues.size < 2) {
                            bootbox.alert("There must be at least two unique values in the between block column.");
                            return false;
                        }
    
                        // Get the current data from the handsontable
                        const currentData = handsOnTable_Procedure.getData();
                        const newData = currentData.map(row => row.slice()); // Deep copy the current data
    
                        const headerRow = newData[0];
                        const shuffle1Index = headerRow.indexOf("shuffle_1");
                        const shuffle2Index = headerRow.indexOf("shuffle_2");
    
                        // Update existing columns if they exist
                        if (shuffle1Index === -1) {
                            headerRow.push("shuffle_1");
                        }
                        if (shuffle2Index === -1) {
                            headerRow.push("shuffle_2");
                        }
    
                        $('.block-toggle:checked').each(function() {
                            const rowIndex = $(this).data('row-index');
                            const withinValue = $(`.within-block-input[data-row-index="${rowIndex}"]`).val().trim();
                            const betweenValue = $(`.between-block-input[data-row-index="${rowIndex}"]`).val().trim();
    
                            // Update or add the new values to the corresponding row in the data
                            if (shuffle1Index !== -1) {
                                newData[rowIndex + 1][shuffle1Index] = withinValue || "";
                            } else {
                                newData[rowIndex + 1].push(withinValue || "");
                            }
    
                            if (shuffle2Index !== -1) {
                                newData[rowIndex + 1][shuffle2Index] = betweenValue || "";
                            } else {
                                newData[rowIndex + 1].push(betweenValue || "");
                            }
                        });
    
                        handsOnTable_Procedure.populateFromArray(0, 0, newData);
                        handsOnTable_Procedure.render();
    
                        // Save the survey data
                        setTimeout(() => {
                            $("#save_btn").click();
                        }, 100);
    
                        return true;
                    }
                },
                cancel: {
                    label: "Cancel",
                    className: 'btn-secondary',
                    callback: function () {}
                }
            }
        });
    
        $(document).on('change', '.block-toggle', function() {
            const rowIndex = $(this).data('row-index');
            const isChecked = $(this).is(':checked');
    
            if (isChecked) {
                $(`.within-block-cell[data-row-index="${rowIndex}"]`).show();
                $(`.between-block-cell[data-row-index="${rowIndex}"]`).show();
                $(`.within-block-header`).show();
                $(`.between-block-header`).show();
            } else {
                $(`.within-block-cell[data-row-index="${rowIndex}"]`).hide();
                $(`.between-block-cell[data-row-index="${rowIndex}"]`).hide();
                if ($('.block-toggle:checked').length === 0) {
                    $(`.within-block-header`).hide();
                    $(`.between-block-header`).hide();
                }
            }
        });
    
        // Add event listeners for input event on within-block and between-block inputs
        $(document).on('input', '.within-block-input, .between-block-input', function() {
            const rowIndex = $(this).data('row-index');
            if ($(this).hasClass('within-block-input')) {
                const withinValue = $(this).val().trim();
            } else if ($(this).hasClass('between-block-input')) {
                const betweenValue = $(this).val().trim();
            }
        });
    
        /** *** */
    });
