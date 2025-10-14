const ipc = require("electron").ipcMain;


ipc.on("python_test", (event, args) => {
  var myPythonScript = "python_test.py";
  var pythonExecutable = "python";
  var uint8arrayToString = function(data) {
      return String.fromCharCode.apply(null, data);
  };
  const spawn = require('child_process').spawn;
  // The '-u' tells Python to flush every time
  const scriptExecution = spawn(pythonExecutable, ['-u', myPythonScript]);
  scriptExecution.stdout.on('data', (data) => {
      console.log(uint8arrayToString(data));
  }); 
  event.returnValue = "success";
});

ipc.on("python_trial_start", (event, arg) => {
  var myPythonScript = "python_trial_start.py";
  var pythonExecutable = "python";
  var uint8arrayToString = function(data) {
      return String.fromCharCode.apply(null, data);
  };
  const spawn = require('child_process').spawn;
  // The '-u' tells Python to flush every time
  const scriptExecution = spawn(pythonExecutable, ['-u', myPythonScript]);
  scriptExecution.stdout.on('data', (data) => {
      console.log(uint8arrayToString(data));
  }); 
  event.returnValue = "success";
});

ipc.on("python_image_start", (event, arg) => {
  var myPythonScript = "python_image_start.py";
  var pythonExecutable = "python";
  var uint8arrayToString = function(data) {
      return String.fromCharCode.apply(null, data);
  };
  const spawn = require('child_process').spawn;
  // The '-u' tells Python to flush every time
  const scriptExecution = spawn(pythonExecutable, ['-u', myPythonScript]);
  scriptExecution.stdout.on('data', (data) => {
      console.log(uint8arrayToString(data));
  }); 
  event.returnValue = "success";
});