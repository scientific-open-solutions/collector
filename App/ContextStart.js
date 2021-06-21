/*
* this is a hack to deal with asynchronous order of parts of the page loading
*/
function wait_till_exists(this_function){
  if(typeof(window[this_function]) == "undefined"){
    setTimeout(function(){
      wait_till_exists(this_function);
    },100);
  } else {
    window[this_function]();
  }
}

/*
* Start Collector
*/
$_GET = window.location.href.substr(1).split("&").reduce((o,i)=>(u=decodeURIComponent,[k,v]=i.split("="),o[u(k)]=v&&u(v),o),{});

Collector.tests.run();
Collector.start = function(){
  user = JSON.parse(Collector.electron.fs.load_user());
  if(typeof(user.current) == "undefined" || typeof(user.current.path) == "undefined"){
    var github_dialog_exists = setInterval(function(){
      if($("#github_dialog").length == 1){
        clearInterval(github_dialog_exists);
        $("#github_dialog").show();
        bootbox.alert("It looks like you haven't yet included any github repositories for your projects. You need to have a github account and organisation to create a project. Once you've done that (see our <a href='https://docs.google.com/document/d/1SKYIJF1dAjMDS6EHUIwfZm2KQVOzx17S6LbU_oSGxdE/edit?usp=sharing' target='_blank'>documents</a>) you can use Collector to build your projects.");
      }
    },1000);
  } else {
    correct_master();
    correct_user();
    list_repos();
    wait_till_exists("list_projects");
    wait_till_exists("list_graphics");
    wait_till_exists("list_code");
    wait_till_exists("initiate_actions");
    wait_till_exists("list_keys");
    wait_till_exists("list_data_servers");
    wait_till_exists("list_servers");
    wait_till_exists("list_surveys");
    wait_till_exists("list_pathways");
  }
};

function correct_master(){
  /*
  * studies --> projects
  */

  if(typeof(master.project_mgmt) == "undefined"){
    master.project_mgmt = master.exp_mgmt;
    master.project_mgmt.project  = master.project_mgmt.experiment;
    master.project_mgmt.projects = master.project_mgmt.experiments;
    delete(master.project_mgmt.experiment);
    delete(master.project_mgmt.experiments);
  }

  var projects = Object.keys(master.project_mgmt.projects);
  projects.forEach(function(project){

    try{
      var this_project = master.project_mgmt.projects[project];


      /*
      * "trial type" --> "code" for each project
      */
      var all_procs = Object.keys(this_project.all_procs);
      all_procs.forEach(function(this_proc){
        if(typeof(this_project.all_procs[this_proc]) == "object"){
          this_project.all_procs[this_proc] = Papa.unparse(this_project.all_procs[this_proc]);
        }
        this_project.all_procs[this_proc] = this_project
          .all_procs[this_proc].replace("trial type,","code,");

        this_project.all_procs[this_proc] = Collector.PapaParsed(this_project.all_procs[this_proc]);

      });
      if(typeof(this_project.trialtypes) !== "undefined"){
        this_project.code = this_project.trialtypes;
        delete(this_project.trialtypes);
      }
    } catch(error){
      console.log("skipping this");
    }

  });

  /*
  * "trialtype" --> code for master
  */
  if(typeof(master.trialtypes) !== "undefined"){
    master.code         = master.trialtypes;
    master.code.default = master.code.default_trialtypes;
    master.code.file    = master.code.file;
    master.code.user    = master.code.user_codes;
    delete(master.trialtype);
    delete(master.trialtypes);
    delete(master.code.default_trialtypes);
    delete(master.code.user_codes);
  }
  if(typeof(master.code.default) == "undefined"){
    master.code.default = {};
  }
  if(typeof(master.code.user) == "undefined"){
    master.code.user = {};
  }

  if(typeof(master.code.user_trialtypes) !== "undefined"){
    Object.keys(master.code.user_trialtypes).forEach(function(item){
      if(typeof(master.code.user[item]) == "undefined"){
        master.code.user[item] = master.code.user_trialtypes[item];
      }
    });
  }


  if(typeof(master.code.graphic.files) == "undefined"){
    master.code.graphic.files = master.code.graphic.trialtypes;
  }


  /*
  * remove any duplicates of default code fiels in the user
  */
  var default_code_files = Object.keys(master.code.default);
  default_code_files.forEach(function(default_file){
    delete(master.code.user[default_file]);
  });
}
function correct_user(){
  if(typeof(user.data_folder) == "undefined" || user.data_folder == ""){
    bootbox.confirm("You don't (yet) have a folder where we'll put your data <b>when you test participants <u>on this device</u></b>. You're about to be asked where you would like this data to go. Please think carefully about this to make sure that your participant data is secure.", function(result){
      if(result){
        var data_folder = Collector.electron.find_path()[0];
        if(data_folder){
          user.data_folder = data_folder;
          $("#local_data_folder").val(data_folder);
          Collector.save_user();
        }
      }
    });
  } else {
    $("#local_data_folder").val(user.data_folder);
  }
}
switch(Collector.detect_context()){
  case "gitpod":
  case "server":
  case "github":
    wait_till_exists("check_authenticated");  //check dropbox
    break;
  case "localhost":

    Collector.tests.pass(
      "helper",
      "startup"
    );          // this can't fail in localhost version
    wait_for_electron = setInterval(function(){
      if(typeof(Collector.electron) !== "undefined"){
        clearInterval(wait_for_electron);        
        Collector.start();
      }
    },100);
    break;
}
