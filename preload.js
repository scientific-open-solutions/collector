window.onload=function(){
  const ipc      = require('electron').ipcRenderer;

  wait_for_collector = setInterval(function(){
    if(typeof(Collector) !== "undefined"){
      clearInterval(wait_for_collector);
      Collector.electron = {
        fs: {
          delete_experiment: function(
            proj_name,
            file_action
          ){
            delete_response = ipc.sendSync('fs_delete_project',{
              "proj_name" : proj_name
            });
            file_action(delete_response);
          },
          delete_file: function(
            file_path
          ){
            return ipc.sendSync(
              'fs_delete_file',{
                "file_path": file_path
              }
            );
          },
          delete_survey: function(
            survey_name,
            file_action
          ){
            return ipc.sendSync('fs_delete_survey',{
              "survey_name" : survey_name
            });
          },
          delete_code: function(
            proj_name,
            file_action
          ){
            delete_response = ipc.sendSync('fs_delete_code',{
              "code_filename" : proj_name
            });
            file_action(delete_response);
          },
          home_dir: function(){
            return ipc.sendSync('fs_home_dir');
          },
          list_code: function(){
            return ipc.sendSync('fs_list_code');
          },
          list_projects: function(){
            var projects = JSON.parse(ipc.sendSync(
              'fs_list_projects'
            ));
            projects = projects.filter(
              item => item.indexOf(".json") == -1
            );
            return projects;
          },
          load_user: function(){
            return ipc.sendSync('fs_load_user', {});
          },
          read_default: function(
            user_folder,
            this_file
          ){
            file_content = ipc.sendSync('fs_read_default',{
              "user_folder" : user_folder,
              "this_file"   : this_file
            });
            return file_content;
          },
          read_file: function(
            user_folder,
            this_file
          ){
            file_content = ipc.sendSync('fs_read_file',{
              "user_folder" : user_folder,
              "this_file"   : this_file
            });
            return file_content;
          },
          write_data: function(
            project_folder,
            this_file,
            file_content
          ){
            write_response = ipc.sendSync('fs_write_data',{
              "project_folder"  : project_folder,
              "this_file"          : this_file,
              "file_content"       : file_content
            });
            return write_response;
          },
          write_project: function(
            this_project,
            file_content,
            file_action
          ){
            write_response = ipc.sendSync('fs_write_project',{
              "this_project" : this_project,
              "file_content"    : file_content
            });
            file_action(write_response);
          },
          write_file: function(
            user_folder,
            this_file,
            file_content
          ){
            write_response = ipc.sendSync('fs_write_file',{
              "user_folder"  : user_folder,
              "this_file"    : this_file,
              "file_content" : file_content
            });
            return write_response;
          },
          write_user: function(
            file_content
          ){
            write_response = ipc.sendSync('fs_write_user',{
              "file_content" : file_content
            });
            return write_response;
          }
        },
        git:{
          add_repo: function(repo_info){
            return ipc.sendSync(
              'git_add_repo',
              repo_info
            );
          },
          add_token: function(auth_token){
            return ipc.sendSync(
              'git_add_token',{
              "auth_token": auth_token
            });
          },
          exists: function(){
            return ipc.sendSync('git_exists');
          },
          pages: function(repo_info){
            return ipc.sendSync(
              'git_pages',
              repo_info
            );
          },
          pull: function(repo_info){
            return ipc.sendSync(
              'git_pull',
              repo_info
            );
          },
          push: function(path){
            return ipc.sendSync(
              'git_push',
              path
            );
          },
          repo_info: function(path){
            return ipc.sendSync(
              'git_repo_info',
              {
                path: path
              }
            );
          },
          set_email: function(email){
            return ipc.sendSync(
              'git_set_email',
              {
                email: email
              }
            );
          },
          set_name: function(name){
            return ipc.sendSync(
              'git_set_name',
              {
                name: name
              }
            );
          },
          status: function(repo_info){
            return ipc.sendSync('git_status', {
              organization: repo_info.organization,
              repository: repo_info.repository
            });
          },
          token_exists: function(){
            return ipc.sendSync(
              'git_token_exists',
              {}
            );
          },
          valid_org: function(repo_info){
            return ipc.sendSync(
              'git_valid_org',
              repo_info
            );
          }
        },
        find_path: function(){
          return ipc.sendSync('find_path', {});
        },
        open_folder: function(location,folder){
          return ipc.sendSync(
            'open_folder',
            {
              location: location,
              folder: folder
            }
          );
        }
      };
    }
  },100);
};
