/*  
 *	PhaseFunctions.js
 *	Collector Kitten/Cat release (2019-2023) © Dr. Anthony Haffey (team@someopen.solutions)
*/

// Collector Phase Functions
if (typeof Phase !== "undefined") {
  Phase.add_response = function (response_obj) {
    // response_obj.inserted_time_ms = new Date().getTime();
    // response_obj.inserted_time_date = new Date().toString("MM/dd/yy HH:mm:ss");
    parent.parent.project_json.responses.push(response_obj);
  };

  Phase.elapsed = function () {
    alert("Don't use this function, as it has an average lag of 10-20ms. This code hasn't been deleted as this might be addressed in the future. Instead, you can use something like \n\n Phase.set_timer(function(){\nbaseline_time_manual = (new Date()).getTime();\n},0);\n\n to capture the time the phase started.");
    if (Phase.post_no == "") {
      Phase.post_no = 0;
    }
    return (
      new Date().getTime() -
      parent.parent.project_json.this_phase[
        "post_" + Phase.post_no + "_phase_start_ms"
      ]
    );
  };
  Phase.get = function (this_name) {
    return parent.parent.project_json.study_vars[this_name];
  };
  Phase.get_proc = function (this_name) {
    // return parent.parent.project_json.all_procs[this_name]; <- this line just inserts the stimuli sheet as a comma separated list
    required_proc_sheet = parent.parent.project_json.all_procs[this_name];
    var required_proc_sheetConverted = csvToArray(required_proc_sheet)
    return required_proc_sheetConverted
    // {CGD} It would be good to make this function swap the loaded procedure sheet so you could alter a study based on prior performance if needed
  };
  Phase.get_stim = function (this_name) {
    // return parent.parent.project_json.all_stims[this_name]; <- this line just inserts the stimuli sheet as a comma separated list
    required_stim_sheet = parent.parent.project_json.all_stims[this_name];
    var required_stim_sheetConverted = csvToArray(required_stim_sheet)
    return required_stim_sheetConverted
    // {CGD} It would be good to make this function swap the loaded stimuli sheet so you could alter a task based on prior performance if needed
  };
  Phase.go_to = function (new_trial_no) {
    parent.parent.Project.go_to(new_trial_no);
  };
  Phase.set = function (this_name, this_content) {
    if (typeof parent.parent.project_json.study_vars == "undefined") {
      parent.parent.project_json.study_vars = {};
    }
    parent.parent.project_json.study_vars[this_name] = this_content;
  };

  /*
   * Make the Phase.setTimeout timer function here
   * based on https://stackoverflow.com/questions/7798680/add-duration-to-js-settimeout-after-the-timer-is-running
   */
  Phase.timer = function (callback, time) {
    this.setTimeout(callback, time);
  };

  Phase.timer.prototype.setTimeout = function (callback, time) {
    var self = this;
    if (this.timer) {
      clearTimeout(this.timer);
    }
    this.finished = false;
    this.callback = callback;
    this.time = time;
    this.timer = setTimeout(function () {
      self.finished = true;
      callback();
    }, time);
    this.start = Date.now();
  };

  Phase.timer.prototype.add = function (time) {
    if (!this.finished) {
      // add time to time left
      time = this.time - (Date.now() - this.start) + time;
      this.setTimeout(this.callback, time);
    }
  };

  Phase.setTimeout = function (this_function, duration) {};
  Phase.set_timer = function (this_function, duration) {
    parent.parent.project_json.time_outs.push({
      phase_no: Phase.phase_no,
      post_no: Phase.post_no,
      duration: duration,
      this_func: this_function,
    });
  };
  Phase.submit = function () {
    parent.parent.project_json.inputs = jQuery("[name]");
    parent.parent.Project.finish_phase();
  };
}

$(window).bind("keydown", function (event) {
  if (event.ctrlKey || event.metaKey) {
    switch (String.fromCharCode(event.which).toLowerCase()) {
      case "s":
        event.preventDefault();
        parent.parent.precrypted_data(
          parent.parent.project_json,
          "What do you want to save this file as?"
        );
        break;
    }
  }
});
function save_csv(filename, data) {
  var blob = new Blob([data], { type: "text/csv" });
  if (window.navigator.msSaveOrOpenBlob) {
    window.navigator.msSaveBlob(blob, filename);
  } else {
    var elem = window.document.createElement("a");
    elem.href = window.URL.createObjectURL(blob);
    elem.download = filename;
    document.body.appendChild(elem);
    elem.click();
    document.body.removeChild(elem);
  }
}

//by qwerty at https://stackoverflow.com/questions/2116558/fastest-method-to-replace-all-instances-of-a-character-in-a-string
String.prototype.replaceAll = function (str1, str2, ignore) {
  return this.replace(
    new RegExp(
      str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g, "\\$&"),
      ignore ? "gi" : "g"
    ),
    typeof str2 == "string" ? str2.replace(/\$/g, "$$$$") : str2
  );
};

// Hidden phase submit
$(window).bind("keydown", function (event) {
  if(event.which == 88 && event.ctrlKey && event.shiftKey) {
    Phase.submit();
  }
  $(document).unbind('keydown');
});

// "csv to array" Function
// - https://github.com/nsebhastian/javascript-csv-array-example/blob/master/index.html
function csvToArray(str, delimiter = ",") {

  // slice from start of text to the first \n index
  // use split to create an array from string by delimiter
  const headers = str.slice(0, str.indexOf("\n")).split(delimiter);

  // slice from \n index + 1 to the end of the text
  // use split to create an array of each csv value row
  const rows = str.slice(str.indexOf("\n") + 1).split("\n");

  // Map the rows
  // split values from each row into an array
  // use headers.reduce to create an object
  // object properties derived from headers:values
  // the object passed as an element of the array
  const arr = rows.map(function (row) {
    const values = row.split(delimiter);
    const el = headers.reduce(function (object, header, index) {
      object[header] = values[index];
      return object;
    }, {});
    return el;
  });

  // return the array
  return arr;
}