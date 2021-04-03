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

function update_master(){
  /*
  * studies --> projects
  */
  if(typeof(master.project_mgmt) == "undefined"){
    master.project_mgmt = master.exp_mgmt;
    master.project_mgmt.project = master
      .project_mgmt
      .experiment;
    master.project_mgmt.projects = master
      .project_mgmt
      .experiments;
    delete(master.project_mgmt.experiment);
    delete(master.project_mgmt.experiments);
  }

  /*
  * "trial type" --> "code" for each project
  */

  var projects = Object.keys(master.project_mgmt.projects);
  projects.forEach(function(project){
    var this_project = master.project_mgmt.projects[project];
    var all_procs = Object.keys(this_project.all_procs);
    all_procs.forEach(function(this_proc){
      this_project.all_procs[this_proc] = this_project
        .all_procs[this_proc].replace("trial type,","code,");
    });
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
  if(typeof(master.code.graphic.files) == "undefined"){
    master.code.graphic.files = master.code.graphic.trialtypes;
  }
}

switch(Collector.detect_context()){
  case "gitpod":
  case "server":
  case "github":
    wait_till_exists("check_authenticated");  //check dropbox
    break;
  case "localhost":

    Collector.tests.pass("helper",
                         "startup");          // this can't fail in localhost version
    wait_for_electron = setInterval(function(){
      //alert("hi");
      if(typeof(Collector.electron) !== "undefined"){
        clearInterval(wait_for_electron);
        master = Collector.electron.fs.read_file("","master.json");
        if(master !== ""){
          master = JSON.parse(master);
        } else {
          master = default_master;
          var write_response = Collector.electron.fs.write_file(
            "",
            "master.json",
            JSON.stringify(master, null, 2));
          if(write_response !== "success"){
            bootbox.alert(write_response);
          }
        }
        update_master();
        Collector.start();
      }
    },100);
    break;
}
