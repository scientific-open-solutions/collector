// Code that can probably be deleted:
//const path = require("path");
//require(path.join(__dirname, "./App/libraries/collector/Collector.js"));
//require("./App/libraries/collector/Collector.js");


 // by qwerty at
 // https://stackoverflow.com/questions/2116558/fastest-method-to-replace-all-instances-of-a-character-in-a-string
 
String.prototype.replaceAll = function (str1, str2, ignore) {
  return this.replace(
    new RegExp(
      str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g, "\\$&"),
      ignore ? "gi" : "g"
    ),
    typeof str2 === "string" ? str2.replace(/\$/g, "$$$$") : str2
  );
};
//window.onload = function () {
const ipc = require("electron").ipcRenderer;

const { contextBridge, shell } = require("electron");

if (typeof Collector === "undefined") {

}
contextBridge.exposeInMainWorld(
  "CElectron", {
    fs: {
      delete_project: function (proj_name, file_action) {
        delete_response = ipc.sendSync("fs_delete_project", {
          proj_name: proj_name,
        });
        file_action(delete_response);
      },
      delete_file: function (file_path) {
        return ipc.sendSync("fs_delete_file", {
          file_path: file_path,
        });
      },
      home_dir: function () {
        return ipc.sendSync("fs_home_dir");
      },
      list_phasetypes: function () {
        return ipc.sendSync("fs_list_phasetypes");
      },
      list_projects: function () {
        var projects = JSON.parse(ipc.sendSync("fs_list_projects"));
        projects = projects.filter((item) => item.indexOf(".json") === -1);
        return projects;
      },
      list_surveys: function () {
        return ipc.sendSync("fs_list_surveys");
      },

      load_user: function () {
        return ipc.sendSync("fs_load_user", {});
      },
      read_default: function (user_folder, this_file) {
        file_content = ipc.sendSync("fs_read_default", {
          user_folder: user_folder,
          this_file: this_file,
        });
        return file_content;
      },
      read_dir: function (folder) {
        console.log("Preload Input: " + folder)
        return ipc.sendSync("fs_list_project_files", {
          folder: folder,
        })
      },
      read_file: function (user_folder, this_file) {
        file_content = ipc.sendSync("fs_read_file", {
          user_folder: user_folder,
          this_file: this_file,
        });
        return file_content;
      },
      write_data: function (project_folder, this_file, file_content) {
        write_response = ipc.sendSync("fs_write_data", {
          project_folder: project_folder,
          this_file: this_file,
          file_content: file_content,
        });
        return write_response;
      },
      write_file: function (user_folder, this_file, file_content) {
        write_response = ipc.sendSync("fs_write_file", {
          user_folder: user_folder,
          this_file: this_file,
          file_content: file_content,
        });
        return write_response;
      },
      write_project: function (this_project, file_content, file_action) {
        write_response = ipc.sendSync("fs_write_project", {
          this_project: this_project,
          file_content: file_content,
        });
        file_action(write_response);
      },
      write_user: function (file_content) {
        write_response = ipc.sendSync("fs_write_user", {
          file_content: file_content,
        });
        return write_response;
      },
    },
    find_path: function () {
      return ipc.sendSync("find_path", {});
    },
    open_folder: function (location, folder) {
      return ipc.sendSync("open_folder", {
        location: location,
        folder: folder,
      });
    },
    python: {
      test: function(){
        return ipc.sendSync("python_test", {})
      },
      trial_start: function(){
        return ipc.sendSync("python_trial_start", {})
      },
      image_start: function(){
        return ipc.sendSync("python_image_start", {})
      }
    },
  }
);

//};
