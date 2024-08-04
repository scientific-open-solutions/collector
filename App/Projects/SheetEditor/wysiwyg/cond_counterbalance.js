function updateButtonState() {
    var optionCount = $('#proc_select option').length;
    if (optionCount > 1) {
        $('#cond_counterbalance_btn').show();
    } else {
        $('#cond_counterbalance_btn').hide();
    }
}

updateButtonState();

$('#cond_counterbalance_btn').on('click', function () {
    function getColumnValues(headerName) {
        const data = handsOnTable_Conditions.getData();
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

    const conditions = getColumnValues('name');
    const counterbalanceValues = getColumnValues('counterbalance');

    let tableHtml = `<p>This modal allows you to set up counterbalancing across the conditions within the experiment.</p>
                     <table class="table table-bordered" style="table-layout: fixed; width: 100%;">
                        <thead style="background-color: #f7f7f7; color: var(--collector_blue);">
                            <tr>
                                <th style="width: auto;">Conditions to counterbalance</th>
                                <th style="width: 75px; text-align: center;">Select?</th>
                                <th style="width: 250px; text-align: center; display:none;" class="php-file-location-header">PHP File Location</th>
                                <th style="width: 105px; text-align: center; display:none;" class="procedures-header">.CSV List</th>
                            </tr>
                        </thead>
                        <tbody>`;

    conditions.forEach((condition, index) => {
        const isChecked = counterbalanceValues[index] ? 'checked' : '';
        const phpFileLocation = counterbalanceValues[index] || '';

        tableHtml += `<tr>
                        <td>${condition}</td>
                        <td style="text-align: center;"><input type="checkbox" class="counterbalance-checkbox" data-row-index="${index}" ${isChecked}></td>
                        <td style="display:none;" class="php-file-location-cell"><input type="text" class="form-control" value="${phpFileLocation}" placeholder="www.url_of_php_file.com"></td>
                        <td style="display:none;" class="procedures-cell"><button class="btn btn-primary proc-button">Generate</button></td>
                    </tr>`;
    });

    tableHtml += `</tbody></table>
                  <p>You can generate the PHP file required by clicking the button below. The PHP file will contain the words "hello user!"</p>
                  <button id="generate_php_file_btn" class="btn btn-secondary">Generate PHP File</button>`;

    const mainModal = bootbox.dialog({
        title: 'Counterbalance System',
        message: tableHtml,
        size: 'large',
        buttons: {
            ok: {
                label: 'Save',
                className: 'btn-primary',
                callback: function () {
                    const data = handsOnTable_Conditions.getData();
                    const headerRow = data[0];
                    let counterbalanceIndex = headerRow.indexOf('counterbalance');

                    if (counterbalanceIndex === -1) {
                        counterbalanceIndex = headerRow.length - 1;
                        headerRow[counterbalanceIndex] = 'counterbalance';
                    }

                    let valid = true;

                    function isValidUrlFormat(string) {
                        const pattern = new RegExp(
                            '^(https?:\\/\\/)?' + // protocol
                            '((([a-zA-Z\\d]([a-zA-Z\\d-]*[a-zA-Z\\d])*)\\.)+[a-zA-Z]{2,}|' + // domain name
                            'localhost|' + // OR localhost
                            '\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}|' + // OR ip (v4) address
                            '\\[?[a-fA-F\\d:]+\\]?)' + // OR ip (v6) address
                            '(\\:\\d+)?(\\/[-a-zA-Z\\d%_.~+]*)*' + // port and path
                            '(\\?[;&a-zA-Z\\d%_.~+=-]*)?' + // query string
                            '(\\#[-a-zA-Z\\d_]*)?$',
                            'i'
                        );
                        return pattern.test(string);
                    }

                    $('.counterbalance-checkbox:checked').each(function () {
                        const rowIndex = $(this).data('row-index');
                        let phpFileLocation = $(this).closest('tr').find('.php-file-location-cell input').val();

                        if (!isValidUrlFormat(phpFileLocation)) {
                            valid = false;
                            bootbox.alert("Please check the URL format. It should be a valid URL in the format 'example.com'.");
                            return false; // Break the loop
                        }

                        // Ensure URL starts with 'https://'
                        if (!phpFileLocation.includes('://')) {
                            phpFileLocation = 'https://' + phpFileLocation;
                        } else {
                            phpFileLocation = phpFileLocation.replace(/^[^:]+:\/\//, 'https://');
                        }

                        data[rowIndex + 1][counterbalanceIndex] = phpFileLocation || "";
                    });

                    if (!valid) {
                        return false; // Prevent closing the modal if validation fails
                    }

                    handsOnTable_Conditions.populateFromArray(0, 0, data);
                    handsOnTable_Conditions.render();
                    // Save the survey data
                    setTimeout(() => {
                        $("#save_btn").click();
                    }, 100);
                    return true;
                }
            },
            cancel: {
                label: 'Cancel',
                className: 'btn-secondary',
                callback: function () {}
            }
        }
    });

    // Pre-show the PHP File Location and Procedures columns if there are pre-existing counterbalance values
    $('.counterbalance-checkbox').each(function () {
        const row = $(this).closest('tr');
        if (this.checked) {
            row.find('.php-file-location-cell, .procedures-cell').show();
        }
    });

    if ($('.counterbalance-checkbox:checked').length > 0) {
        $('.php-file-location-header, .procedures-header').show();
    }

    // Add click event for the Generate PHP File button
    $('#generate_php_file_btn').on('click', function () {
        const projectListValue = $('#project_list').val();
        const phpFileName = `counterbalance_${projectListValue}.php`;
        const phpContent = "hello user!";

        const blob = new Blob([phpContent], { type: 'text/php' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = phpFileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
});

// Show/hide columns based on checkbox state
$(document).on('change', '.counterbalance-checkbox', function () {
    const row = $(this).closest('tr');
    if (this.checked) {
        row.find('.php-file-location-cell, .procedures-cell').show();
    } else {
        row.find('.php-file-location-cell, .procedures-cell').hide();
    }

    // Show/hide table headers based on any checkboxes being checked
    if ($('.counterbalance-checkbox:checked').length > 0) {
        $('.php-file-location-header, .procedures-header').show();
    } else {
        $('.php-file-location-header, .procedures-header').hide();
    }
});

// Handle 'Procedures' button click in the table
$(document).on('click', '.proc-button', function () {
    const optionsHtml = $('#proc_select option').map(function () {
        return `<tr>
                    <td>${$(this).text()}</td>
                    <td style="text-align: center;"><input type="checkbox" class="proc-checkbox" value="${$(this).val()}"></td>
                    <td style="text-align: center; display: none;" class="weight-cell"><input type="number" class="form-control weight-input" value="1" min="1" disabled></td>
                </tr>`;
    }).get().join('');

    const proceduresModalHtml = `
        <div>
            <p class="text-left">Please select the procedure sheets that you wish to counterbalance. If you want to include more instances of one procedure compared to another, increase the weighting. When ready, click 'Save' to save the .csv file to your computer. Please do not rename it.</p>
            <table class="table table-bordered" style="table-layout: fixed; width: 100%;">
                <thead style="background-color: #f7f7f7; color: var(--collector_blue);">
                    <tr>
                        <th style="width: auto;">Procedure</th>
                        <th style="width: 75px; text-align: center;">Select?</th>
                        <th style="width: 100px; text-align: center; display: none;" class="weight-header">Weight</th>
                    </tr>
                </thead>
                <tbody>
                    ${optionsHtml}
                </tbody>
            </table>
            <div style="text-align: right; margin-top: 10px;">
                <button id="save_procedures_btn" class="btn btn-primary" disabled>Save</button>
                <button id="cancel_procedures_btn" class="btn btn-secondary">Cancel</button>
            </div>
        </div>
    `;

    const proceduresModal = bootbox.dialog({
        message: proceduresModalHtml,
        title: "Create Procedures .csv",
        closeButton: false // Disable default close button
    });

    // Enable save button and show weight column if 2 or more checkboxes are checked
    $(document).on('change', '.proc-checkbox', function () {
        const checkedCount = $('.proc-checkbox:checked').length;
        $('#save_procedures_btn').prop('disabled', checkedCount < 2);
        if (checkedCount > 0) {
            $('.weight-header, .weight-cell').show();
        } else {
            $('.weight-header, .weight-cell').hide();
        }
        $('.proc-checkbox').each(function() {
            const row = $(this).closest('tr');
            const weightInput = row.find('.weight-input');
            if (this.checked) {
                weightInput.prop('disabled', false);
            } else {
                weightInput.prop('disabled', true);
            }
        });
    });

    // Save selected procedures
    $(document).on('click', '#save_procedures_btn', function () {
        const selectedProcedures = $('.proc-checkbox:checked').map(function () {
            const row = $(this).closest('tr');
            const weight = parseInt(row.find('.weight-input').val(), 10);
            return Array(weight).fill($(this).val());
        }).get().flat();

        // Convert selected procedures to CSV format
        const csvContent = 'data:text/csv;charset=utf-8,' + selectedProcedures.join(',');

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', 'selected_procedures.csv');
        document.body.appendChild(link); // Required for FF

        link.click();
        document.body.removeChild(link);

        // Close only the procedures modal
        proceduresModal.modal('hide'); // Close the procedures modal without affecting the main modal
    });

    // Handle 'Cancel' button click in the procedures modal
    $(document).on('click', '#cancel_procedures_btn', function () {
        proceduresModal.modal('hide'); // Close the procedures modal without affecting the main modal
    });
});

// Monitor changes to the number of options in the proc_select dropdown
const observer = new MutationObserver(updateButtonState);

observer.observe(document.getElementById('proc_select'), { childList: true });
