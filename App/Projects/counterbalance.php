<?php
/* Change '$csvFile' below to the location of the CSV file you created in Collector.
 * (this needs to be on the same server as this PHP file and the location should be local to it, do not include the full http://...)
*/
$csvFile = 'change_this_to_the_location_of_the_procedures_list.csv';

/* ******************************************************************* */ 
/* ^ ^ ^ ^ ^ ^ ^ Make sure you update the location above ^ ^ ^ ^ ^ ^ ^ */
/* ******************************************************************* */ 

/* ******************************************************************* */ 
/* x x x  x x x x x x DO NOT CHANGE ANYTHING BELOW x x x x x x x x x x */
/* ******************************************************************* */ 

// Function to get the contents of the CSV file as an array
function getCsvArray($csvFile) {
    if (!file_exists($csvFile)) {
        return [];
    }
    $file = fopen($csvFile, 'r');
    $data = fgetcsv($file);
    fclose($file);
    return $data;
}

// Function to save the array back to the CSV file
function saveCsvArray($csvFile, $data) {
    $file = fopen($csvFile, 'w');
    fputcsv($file, $data);
    fclose($file);
}

// Check if the request method is POST and the action parameter is set
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action'])) {
    $action = $_POST['action'];
    $data = getCsvArray($csvFile);

    if ($action == 'location') {
        // Return the first value and move it to the end of the list
        $firstValue = array_shift($data);
        array_push($data, $firstValue);
        saveCsvArray($csvFile, $data);
        echo $firstValue;
    } elseif ($action == 'reset') {
        // Return "reset" and move the last item to the beginning of the list
        $lastValue = array_pop($data);
        array_unshift($data, $lastValue);
        saveCsvArray($csvFile, $data);
        echo "reset";
    }
} else {
    echo "ERROR 404 : File Not Found.";
}
?>
