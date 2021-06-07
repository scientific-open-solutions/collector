project_json = {};

/*
* Objects
*/

online_data_obj = {
  finished_and_stored: false,
  saves_started:0,
  saves_ended:0,
  save_queue:[],
  run_save:function(){
    var this_save = online_data_obj.save_queue.pop();
    this_save();
    console.dir("this_save");
    console.dir(this_save);
    if(online_data_obj.save_queue.length > 0){         //keep going until all saves done.
      online_data_obj.run_save();
    }
  },
  save_queue_add:function(save_queue_item){
    online_data_obj.save_queue.push(save_queue_item);
    if(online_data_obj.save_queue.length == 1){        //need to initiate run_save as it stopped before you added this item
      online_data_obj.run_save();
    }
  }
};

Project = {
  activate_pipe   : function(){
    var this_function = Project.pipeline.shift();
    if(Project.resume == false | Project.start_functions.indexOf(this_function) == -1){
      if(typeof(this_function) !== "undefined"){
        window[this_function]();
      }
    } else {
      Project.activate_pipe();
    }
  },
  get_vars  : {},
  html_code : {},
  pipeline  : [
    "detect_exe",
    "get_htmls",
    "get_gets",
    "start_restart",
    "start_project",
    "select_condition",
    "full_screen",
    "create_project_json_variables",
    "parse_sheets",
    "parse_current_proc",
    "clean_code",
    "insert_start",
    "insert_end_checks",
    "shuffle_start_exp",
    "buffer_phases",
    "process_welcome"
  ],
  resume    : false,

  // start functions are the functions required when NOT resuming
  start_functions : [
    "detect_exe",
    "create_project_json_variables",
    "parse_sheets",
    "parse_current_proc",
    "clean_code",
    "insert_start",
    "insert_end_checks",
    "shuffle_start_exp"
  ],


  /*
  * Phase functions
  */
  detect_context: function(){
    //turn to false to make use of eel and python
  if(document.URL.indexOf("localhost") !== -1){
  if(typeof(parent.dropbox_developer) !== "undefined" &&
  parent.dropbox_developer  ==  true){
    return "github";
  } else {
    return "localhost";
  }
  } else if(document.URL.indexOf("github.io") !== -1) { //assume it's github
    return "github";
  } else if(document.URL.indexOf("gitpod.io") !== -1){
    return "gitpod";
  } else {
    return "server";
  }
  },
  finish_phase: function(go_to_info){
    trial_end_ms = (new Date()).getTime();
    trial_inputs = {};
    $("#experiment_progress").css("width",(100 * project_json.trial_no/(project_json.parsed_proc.length-1))+"%");

    for(var i = 0; i < project_json.inputs.length; i++){
      if($("input[name='"+project_json.inputs[i].name+"']:checked").length == 0){
        trial_inputs[project_json.inputs[i].name]=project_json.inputs[i].value;
      } else {
        if(project_json.inputs[i].checked){
          trial_inputs[project_json.inputs[i].name]=project_json.inputs[i].value;
        }
      }
    }

    this_proc = project_json.parsed_proc[project_json.trial_no];
    if(typeof(project_json.parsed_stim[this_proc.item]) == "undefined"){
      this_stim = {};
    } else {
      this_stim = project_json.parsed_stim[this_proc.item];
    }

    if(this_stim == null){
      this_stim = {};
    }

    var objs = [project_json.this_trial, trial_inputs, this_proc, this_stim],
    response_data =  objs.reduce(function (r, o) {
        Object.keys(o).forEach(function (k) {
            r[k] = o[k];
        });
        return r;
    }, {});

    response_data["post_"+project_json.post_no+"_trial_window_inner_width"]  = window.innerWidth;
    response_data["post_"+project_json.post_no+"_trial_window_inner_height"] = window.innerHeight;
    response_data["post_"+project_json.post_no+"_trial_end_ms"]              = trial_end_ms;
    response_data["post_"+project_json.post_no+"_rt_ms"]                     = trial_end_ms - response_data["post_"+project_json.post_no+"_trial_start_ms"];
    response_data["post_"+project_json.post_no+"_trial_end_date"]            = new Date(parseInt(trial_end_ms, 10)).toString('MM/dd/yy HH:mm:ss');
    response_data.platform = window.navigator.platform;
    response_data.username = $("#participant_code").val();


    Object.keys(project_json.this_condition).forEach(function(condition_item){
      response_data["condition_" + condition_item] = project_json.this_condition[condition_item];
    });

    project_json.this_trial           = response_data;
    response_data.participant_browser = participant_browser;
    response_data.trial_number        = project_json.trial_no;

    var not_final_trial = true;

    if(
      $("#trial"+project_json.trial_no)
        .contents()
        .children()
        .find("iframe").length == project_json.post_no + 1
    ){
      $("#trial"+project_json.trial_no).remove();
      project_json.responses.push(project_json.this_trial);
      if(
        project_json.trial_no == project_json.parsed_proc.length - 1 &
        typeof(go_to_info) == "undefined"
      ){
        not_final_trial = false;
        final_trial();
      } else {
        project_json.this_trial = {};
        project_json.trial_no = parseFloat(project_json.trial_no) + 1;
        project_json.post_no = 0;
        setTimeout(function(){
          var this_index = parseFloat(project_json.trial_no) +
            parseFloat(project_json.this_condition.buffer) - 1;
          write_phase_iframe(this_index);
        });
        Project.start_post(go_to_info);
      }
    } else {
      project_json.post_no++;
      var start_time = (new Date()).getTime();
      project_json.this_trial[
        "post_"+project_json.post_no+"_trial_start_ms"
      ] = (new Date()).getTime();
      project_json.this_trial[
        "post_"+project_json.post_no+"_trial_start_date"
      ] = new Date(parseInt(start_time, 10)).toString('MM/dd/yy HH:mm:ss');

      $("#trial"+project_json.trial_no)
        .contents()
        .children()
        .find("iframe")
        .hide();
      Project.start_post(go_to_info);
    }

    switch(Project.get_vars.platform){
      case "localhost":
        var data_response = Collector.electron.fs.write_data(
          Project.get_vars.location,
            $("#participant_code").val() + "_" +
            $("#completion_code").val()  + ".csv",
            Papa.unparse(Collector.complete_csv(project_json.responses),{
              quotes: false,        //or array of booleans
              header: true,
              skipEmptyLines: true, //or 'greedy',
            }));                    //the data
        if(data_response !== "success"){
          bootbox.alert("Tell the researcher that saving data is broken:" + data_response);
        }
        break;
      case "github":
      case "onlinepreview":
      case "server":
        if(not_final_trial){
          online_data_obj.save_queue_add(
            function(){
              online_save(
                Project.get_vars.location,
                $("#participant_code").val(),
                $("#completion_code").val(),
                $("#prehashed_code").val(),
                JSON.stringify(
                  encrypt(
                    project_json.public_key,
                    JSON.stringify(
                      [project_json.responses[
                        project_json.responses.length - 1
                      ]]
                    )
                  )
                ), //data
                project_json.storage_scripts,
                function(){

                },
                "trial",
                project_json.responses.length - 1
              );
          });
        }
        break;
      case "preview":
        //do nothing - you are not meant to be saving;
        break;
    }
  },

  generate_trial: function(trial_no,post_no){
    if(typeof(project_json.parsed_proc[trial_no]) == "undefined"){
  return false;
  }

  post_no       = post_no == 0 ? "" : "post "+post_no+" ";
  this_proc      = project_json.parsed_proc[trial_no];
  this_trialtype = project_json.code[this_proc[post_no+"code"]];

  //look through all variables and replace with the value

  this_trialtype =  "<scr" + "ipt> Phase = {}; Phase.trial_no = '"+trial_no+"'; Phase.post_no ='"+post_no+"' </scr" + "ipt>" + "<scr" + "ipt src = 'PhaseFunctions.js' ></scr" + "ipt>" + this_trialtype ; //; trial_script +


  this_trialtype = this_trialtype.replace("[trial_no]",trial_no);
  this_trialtype = this_trialtype.replace("[post_no]",post_no);

  if(this_proc.item.toString() !== "0"){

    this_stim = project_json.parsed_stim[this_proc.item];

    variable_list = Object.keys(this_proc).concat(Object.keys(this_stim));
  } else {
    variable_list = Object.keys(this_proc);
  }
  variable_list = variable_list.filter(String);

  //list everything between {{ and }} and transform them into lowercase
  split_trialtype = this_trialtype.split("{{");
  split_trialtype = split_trialtype.map(function(split_part){
    if(split_part.indexOf("}}") !== -1){
      more_split_part = split_part.split("}}");
      more_split_part[0] = more_split_part[0].toLowerCase();
      split_part = more_split_part.join("}}");
    }
    return split_part;
  });
  this_trialtype = split_trialtype.join("{{");

  variable_list.forEach(function(variable,this_index){
  if(typeof(this_proc[variable]) !== "undefined"){
  variable_val = this_proc[variable];
  } else if(typeof(this_stim) !== "undefined" && typeof(this_stim[variable]) !== "undefined"){
  variable_val = this_stim[variable];
  } else {
  if(typeof(this_stim) !== "undefined"){
          console.dir("Not sure whether this means there's a bug or not");
          //bootbox.alert("serious bug, please contact researcher about missing variable");
        }
  }
  this_trialtype = this_trialtype.replaceAll("{{" + variable + "}}", variable_val);
  });
    // in case the user forgets
    this_trialtype = this_trialtype.replaceAll("www.dropbox","dl.dropbox");

    /*
    * Need to detect whether localhost and on mac
    */

    var home_dir;
    var org_repo = project_json
      .location
      .split("/");
    if(
      typeof(Collector.electron) !== "undefined" &&
      window.navigator.platform.toLowerCase().indexOf("mac") !== -1
    ){
       home_dir = Collector
        .electron
        .git
        .locate_repo({
          org:  org_repo[0],
          repo: org_repo[1]
        });
        this_trialtype = this_trialtype.replaceAll(
          "../User/",
          home_dir + "/User/"
        );
    } else if(Project.is_exe){
      home_dir = Collector
        .electron
        .git
        .locate_repo({
          org:  org_repo[0],
          repo: org_repo[1]
        });
      this_trialtype = this_trialtype.replaceAll(
        "../User/",
        home_dir + "/User/"
      );
    }
    return this_trialtype;
  },

  go_to: function(new_trial_no,proc_no){
    if(typeof(proc_no) == "undefined"){
      proc_no = 0;
    }
    Project.finish_phase([new_trial_no - 1, proc_no]);

  },

  start_post: function(go_to_info){
    if(typeof(go_to_info) !== "undefined"){
      project_json.trial_no = go_to_info[0];
      project_json.post_no = go_to_info[1];
      $(".phase_iframe").remove();
      var this_buffer = project_json.this_condition.buffer;
      var trial_no    = project_json.trial_no;
      for(var index = trial_no; index < trial_no + this_buffer; index++){
        write_phase_iframe(index);
      }
    }
  if(typeof(project_json.responses[project_json.trial_no]) == "undefined"){
  project_json.responses[project_json.trial_no] = {};
  }
  project_json.this_trial["post_"+project_json.post_no+"_trial_start_ms"] = (new Date()).getTime();
  if($("#trial"+project_json.trial_no).contents().children().length > 0){
  var this_post_iframe = $("#trial"+project_json.trial_no).contents().children().find("iframe").filter(function(element){
         return element == project_json.post_no;
  })[0];
  this_post_iframe.style.visibility = "visible";

      /*
      * apply zoom
      */
      var these_iframes = document
        .getElementById("trial" + project_json.trial_no)
        .contentWindow
        .document
        .getElementsByClassName("post_iframe");


      $("#trial" + project_json.trial_no)
        .contents()
        .find(".post_iframe")
        .contents()
        .find("body").css("transform-origin","top");



      try{
        for(var i = 0; i < these_iframes.length; i++){
          var this_iframe = these_iframes[i];
          this_iframe_style = this_iframe
            .contentWindow
            .document
            .body
            .style;
          this_iframe_style.zoom = parent.parent.current_zoom;
          this_iframe_style.MozTransform = "scale(" +
            parent.parent.current_zoom +
          ")";

          if(isFirefox){
            this_iframe_style.width  = window.innerWidth / parent.parent.current_zoom;
            this_iframe_style.height = window.innerHeight / parent.parent.current_zoom;
            this_iframe_style.transformOrigin = "left top";
          } else {
            this_iframe_style.width  = "100%";
            this_iframe_style.height = "100%";
          }


        }

      } catch(error){
        //lazy fix for now
      }

  $("#trial"+project_json.trial_no).css("display","inline-block");
  $("#trial"+project_json.trial_no).css("width", "100%");
  $("#trial"+project_json.trial_no).css("height", "100%");
  $("#trial"+project_json.trial_no).css("visibility","visible");
      $("#trial"+project_json.trial_no).contents().find("#post"+project_json.post_no).contents().find("#zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz").focus(); //or anything that no-one would accidentally create.

  //detect if max time exists and start timer
  var post_val;
  if(project_json.post_no == 0){
     post_val = "";
  } else {
    post_val = "post "+project_json.post_no + " ";
  }
  if(typeof(project_json.parsed_proc[project_json.trial_no][post_val + "max time"]) == "undefined"){
    max_time = "user";
  } else {
    var max_time = project_json
      .parsed_proc
      [project_json.trial_no]
      [post_val + "max time"];
  }
  if(max_time !== "" & max_time.toLowerCase() !== "user"){
  var this_trial_no = project_json.trial_no;
  var this_post_no  = project_json.post_no;
        Project.trial_timer = new Collector.timer(function(){
          if(this_trial_no == project_json.trial_no && this_post_no == project_json.post_no){
  Project.finish_phase();
  }
  },parseFloat(max_time) * 1000);
  }
      participant_backup();

      var this_timeout = project_json.time_outs.filter(function(row){
        return row.trial_no == parseFloat(project_json.trial_no);
      });

  if(this_timeout.length !== 0){ //should have  && this_timeout.length == 1 - need to deal with when there are multiple
  this_timeout.forEach(function(spec_timeout){
          setTimeout(function(){
            spec_timeout.this_func();
          }, spec_timeout.duration);
        });
  } else {
  //no timers on this trial?
  }
  }
  }
}


/*
* Functions
*/

function buffer_phases(){
  var this_buffer = project_json.this_condition.buffer;
  var trial_no    = project_json.trial_no;
  for(var index = trial_no; index < trial_no + this_buffer; index++){
  write_phase_iframe(index);
  };
  if(trial_no >= project_json.parsed_proc.length){
  $("#project_div").html("<h1>You have already completed this experiment</h1>");
  }
  Project.activate_pipe();
}

function cancelFullscreen(){
  if (document.cancelFullScreen) {
  document.cancelFullScreen();
  } else if (document.mozCancelFullScreen) {
  document.mozCancelFullScreen();
  } else if (document.webkitCancelFullScreen) {
  document.webkitCancelFullScreen();
  }
}

function clean_this_condition(this_cond){
  this_cond.download         = clean_var(this_cond.download,"on");
  this_cond.participant_id   = clean_var(this_cond.participant_id,"on");
  if(typeof(this_cond.buffer) == "undefined"){
  this_cond.buffer = 5;
  }
  return this_cond;
}

function clean_code(){
  project_json.parsed_proc.forEach(function(row,row_index){
    //identify code columns
    var tt_cols = Object.keys(row).filter(this_key => this_key.indexOf("code") !== -1);
    tt_cols.forEach(function(tt_col){
      project_json.parsed_proc[row_index][tt_col] = project_json.parsed_proc[row_index][tt_col].toLowerCase();
    });
  });
  Project.activate_pipe();
}

function clean_var(this_variable,default_value){
  if(typeof(this_variable) == "undefined"){
  this_variable = default_value;
  } else {
  this_variable = this_variable.toLowerCase();
  }
  return this_variable;
}

function create_project_json_variables(){
  if(typeof(project_json.trial_no) == "undefined"){
  project_json.this_trial = {};
  project_json.uninitiated_stims = [];
  project_json.uninitiated_stims_sum = 0;
  project_json.initiated_stims = 0;
  project_json.time_outs = [];
  project_json.inputs = [];
  project_json.progress_bar_visible = true; //not doing anything at the moment
  project_json.trial_no = 0;
  project_json.post_no  = 0;
  if(typeof(project_json.responses) == "undefined"){
  project_json.responses = [];
  }
  }
  Project.activate_pipe();
}

function detect_exe(){
  $.get("../User/master.json",function(result){
    Project.is_exe = false;
    Project.activate_pipe();
  }).catch(function(error){
    Project.is_exe = true;
    Project.activate_pipe();
  });
}

function final_trial(){
  switch(Project.get_vars.platform){
    case "github":
    case "onlinepreview":
    case "server":
  online_data_obj.save_queue_add(
  function(){
  online_save(
            Project.get_vars.location,
            $("#participant_code").val(),
            $("#completion_code").val(),
            $("#prehashed_code").val(),
            JSON.stringify(
              encrypt(
                //the public key
                project_json.public_key,
                //the data
                JSON.stringify(project_json.responses)
              )
            ),
    project_json.storage_scripts,
            function(returned_data){
              message_data = returned_data.split(" encrypted data = ");
              if(message_data.length == 1){
                //retrieve researcher e-mail address
                precrypted_data(project_json,"Problem encrypting: <b>"+ message_data +"</b>, we'll try again every 10 seconds, but in case it fails, please download and e-mail this file. What do you want to save this file as? (you will get this message each time we fail to e-mail your data to the researcher)");
                setTimeout(function(){
                  final_trial();
                },10000);
              } else {
                $("#participant_country").show();
                $("#participant_country").load("ParticipantCountry.html");

                encrypted_data = message_data[1];

                $("#project_div").html("<h1 class='text-primary'>" + message_data[0] + " <br><br> You can download the encrypted version of your data <span id='encrypt_click' class='text-success'>here</span> <br><br>or an unencrypted version <span id='raw_click' class='text-success'>here</span></h1>");

                $("#encrypt_click").on("click",function(){
                  bootbox.prompt({
                    title:"What do you want to save this file as?",
                    value:$("#participant_code").val()+"_encrypted.txt",
                    callback:function(result){
                      var blob = new Blob([encrypted_data], {type: 'text/csv'});
                      if(window.navigator.msSaveOrOpenBlob) {
                        window.navigator.msSaveBlob(blob, result);
                      } else {
                        var elem = window.document.createElement('a');
                        elem.href = window.URL.createObjectURL(blob);
                        elem.download = result;
                        document.body.appendChild(elem);
                        elem.click();
                        document.body.removeChild(elem);
                      }
                    }
                  });
                });
                $("#raw_click").on("click",function(){
                  precrypted_data(project_json,"What do you want to save this file as?");
                });
                online_data_obj.finished_and_stored = true;
              }
            },
            "all",
            project_json.responses.length
          );
  }
  );
  var download_at_end = project_json.this_condition.download_at_end;
  if(download_at_end == undefined){
  download_at_end = "on";
  }
  if(typeof(project_json.this_condition.end_message) !== "undefined" && project_json.this_condition.end_message !== ""){
  $("#project_div").html("<h3 class='text-primary'>"+project_json.this_condition.end_message+"</h3>");
  } else {
  $("#project_div").html("");
  }
  $("#project_div").append("<div id='download_div'></div>");

  if(download_at_end == "on"){
  $("#download_div").html("<h1 class='text-danger'>" +
          "Please wait while we confirm that all your data has been saved" +
          "</h1>" +
          '<div class="progress">' +
            '<div id="google_progress" class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" aria-valuenow="75" aria-valuemin="0" aria-valuemax="100" style="width: 75%">' +
            '</div>' +
          '</div>' +
  "<h3 class='text-primary'>Please do not close this window until it has been confirmed that the researcher has been e-mailed your data (or you have downloaded the data yourself that you will e-mail the researcher). If you do not get a prompt to do this within 30 seconds, press CTRL-S and you should be able to directly download your data.</h3>");


  } else if(download_at_end == "off") {
  // do nothing
  }
      function online_save_check(){
        setTimeout(function(){
          if(online_data_obj.saves_started <= online_data_obj.saves_ended){
            online_data_obj.finished_and_stored = true;
            $("#google_progress").css("width","100%");
            setTimeout(function(){
  if(typeof(project_json.this_condition.forward_at_end) !== "undefined" &&
  project_json.this_condition.forward_at_end  !== ""){
  bootbox.alert("The next phase of your experiment is <a class='btn btn-primary' style='margin:2px' href='"+ project_json.this_condition.forward_at_end +"' target='_blank'>here</a> - please continue there.");
  }
              if(project_json.this_condition.download_at_end !== "off"){
                var download_at_end_html = " If you'd like to download your raw data <span id='download_json'>click here</span></h1>";
              } else {
                var download_at_end_html = "";
              }
              $("#project_div").html("<h1>Thank you for participating." + download_at_end_html);
              $("#download_json").on("click",function(){
                precrypted_data(project_json,"What do you want to save this file as?");
              });
              $("#participant_country").show();
              $("#participant_country").load("ParticipantCountry.html");
              window.localStorage.removeItem("project_json");
              window.localStorage.removeItem("username");
              window.localStorage.removeItem("completion_code");
              window.localStorage.removeItem("prehashed_code");
            },1000);
          } else {
            var google_prog_perc = (100*online_data_obj.saves_ended/online_data_obj.saves_started) + "%";
            $("#google_progress").css("width",google_prog_perc);
            online_save_check();
          }
        },1000);
      }
      online_save_check();
      break;
    case "localhost":
    case "preview":
      online_data_obj.finished_and_stored = true;
      if(project_json.this_condition.download_at_end !== "off"){
        download_message = "You can download the data by clicking <b><span id='download_json'>here</span></b>.";
      } else {
        download_message = "";
      }
      $("#project_div").html("<h1>You have finished. " + download_message + "</h1>");
      $("#download_json").on("click",function(){
        precrypted_data(project_json,"What do you want to save this file as?");
      });
      window.localStorage.removeItem("project_json");
      window.localStorage.removeItem("username");
      window.localStorage.removeItem("completion_code");
      window.localStorage.removeItem("prehashed_code");
      break
  }
}

function full_screen(){
  if(typeof(project_json.this_condition.fullscreen) !== "undefined"){
    if(project_json.this_condition.fullscreen == "on"){
      var elem = $(document.body);

      if((window.fullScreen) ||
         (window.innerWidth == screen.width && window.innerHeight == screen.height)) {
        // don't need to ask
      } else {
        bootbox.confirm("The researcher would like to run this in full screen, are you okay with that?",function(response){
          if(response){
            requestFullScreen(document.documentElement);
          }
        });
      }
    }
  }
  Project.activate_pipe();
}

//solution to retrieve get values from url by weltraumpirat at https://stackoverflow.com/questions/5448545/how-to-retrieve-get-parameters-from-javascript/5448635#5448635
function get_gets() {
  function transformToAssocArray( prmstr ) {
    var params = {};
    var prmarr = prmstr.split("&");
    for ( var i = 0; i < prmarr.length; i++) {
      var tmparr = prmarr[i].split("=");
      params[tmparr[0]] = tmparr[1];
    }
    return params;
  }
  var prmstr = window.location.search.substr(1);
  Project.get_vars = prmstr != null && prmstr != "" ? transformToAssocArray(prmstr) : {};

  // maybe the following is left over from the simulator?
  if(typeof(Project.get_vars["name"]) !== "undefined"){
    exp_condition = Project.get_vars["name"];
  } else {
    exp_condition = "";
  }
  if(Project.get_vars.platform == "preview"){

    online_data_obj.finished_and_stored = true;
  }
  Project.activate_pipe();
}

function get_htmls(){

  var htmls = [{
    "name": "Timer",
    "path": "libraries/collector/Timer.html"
  }];



  /*
  project_json.code should loop through trialtypes and get them from the Code folder. This location will depend on whether this is on the researcher's computer or not...
  */









  function loop_htmls(html_list){
    var this_html = html_list.pop();
    $.get(this_html.path, function(this_code){
      Project.html_code[this_html.name] = this_code;
      if(html_list.length > 0){
        loop_htmls(html_list)
      } else {
        Project.activate_pipe();
      }
    });
  }
  loop_htmls(htmls);
}

function insert_end_checks(){
  var this_proc  = project_json.parsed_proc;
  var this_proc_end = {
    item: 0,
    max_time: "",
    text: "",
    "code": "end_checks_experiment"
  }
  var shuffle_levels = Object.keys(project_json.parsed_proc[0]).filter(item => item.indexOf("shuffle") !== -1);
  shuffle_levels.forEach(function(shuffle_level){
    this_proc_end[shuffle_level] = "off";
  });

  this_proc = this_proc.push(this_proc_end);
  Project.activate_pipe();
}
function insert_start(){

  function add_to_start(current_procedure, code){
    var this_trialtype_info = {
      item:0,
      max_time:"",
      text:"",
      "code": code
    }
    var shuffle_levels = Object.keys(project_json.parsed_proc[0]).filter(item => item.indexOf("shuffle") !== -1);
    shuffle_levels.forEach(function(shuffle_level){
      this_trialtype_info[shuffle_level] = "off";
    });
    current_procedure.unshift(this_trialtype_info);
    return current_procedure;
  }

  function load_quality_checks(quality_list){
    var this_check = quality_list.pop();
    $.get(this_check.url,function(this_check_html){
      project_json.code[this_check.name] = this_check_html;
      if(quality_list.length > 0){
        load_quality_checks(quality_list);
      } else {
        Project.activate_pipe();
      }
    });
  }


  var this_proc  = project_json.parsed_proc;
  if(Project.get_vars.platform == "preview"){
    this_proc = add_to_start(this_proc, "quality_preview_start");
    load_quality_checks([{
      url: "Quality/PreviewStart.html",
      name: "quality_preview_start"
    }]);
  } else {
    /*
    * These quality checks are in reverse order
    */
    this_proc = add_to_start(this_proc, "quality_calibration_zoom");
    this_proc = add_to_start(this_proc, "quality_details_warning");

    if(
      typeof(project_json.this_condition.age_check) !== "undefined" &&
      project_json.this_condition.age_check.toLowerCase() == "no"
    ){
      //skip this
    } else {
      this_proc = add_to_start(this_proc, "quality_age_check");
    }

    this_proc = add_to_start(this_proc, "quality_participant_commitment");


    /*
    * Load the code for the quality checks that will
    * occur at the start and end of the experiment
    */

    var quality_checks = [{
      url: "Quality/AgeCheck.html",
      name: "quality_age_check"
    },{
      url: "Quality/Calibration.html",
      name: "quality_calibration_zoom"
    },{
      url: "Quality/DetailsWarning.html",
      name: "quality_details_warning"
    },{
      url: "Quality/ParticipantCommitment.html",
      name: "quality_participant_commitment"
    },{
      url: "Quality/Problems.html",
      name: "end_checks_experiment"
    }];

    load_quality_checks(quality_checks);
  }
}



function parse_sheets(){
  var proc_sheet_name = project_json.this_condition.procedure
      .toLowerCase()
      .replace(".csv","") + ".csv";
  var stim_sheet_name = project_json.this_condition.stimuli
      .toLowerCase()
      .replace(".csv","") + ".csv"
  proc_stim_loaded = [];

  switch(Project.get_vars.platform){
    case "localhost":
    case "onlinepreview":
    case "preview":
      var folder = "Projects/"+ Project.get_vars.location;
      var proc_sheet_content = Collector.electron.fs.read_file(
        folder,
        proc_sheet_name
      );
      var stim_sheet_content = Collector.electron.fs.read_file(
        folder,
        stim_sheet_name
      );
      project_json.parsed_proc = Collector
        .PapaParsed(proc_sheet_content);
      project_json.parsed_stim = [null,null].concat(
        Collector.PapaParsed(stim_sheet_content)
      );
      Project.activate_pipe();
      break;
    case "github":
      if(typeof(Project.get_vars.dropbox) !== "undefined" && Project.get_vars.dropbox){
        project_json.parsed_proc = Collector.PapaParsed(project_json.all_procs[proc_sheet_name]);
        project_json.parsed_stim = [null,null].concat(Collector.PapaParsed(project_json.all_stims[stim_sheet_name]));
        Project.activate_pipe();
      } else {
        var proc_url = "../User/Projects/" +
          Project.get_vars.location +
          "/" +
          proc_sheet_name;
        $.get(proc_url, function(proc_sheet_content){
          project_json.parsed_proc = Collector.PapaParsed(proc_sheet_content);
          proc_stim_loaded[1] = "procedure";
          if(proc_stim_loaded.join("-") == "stimuli-procedure"){
            Project.activate_pipe();
          }
        });
        var stim_url = "../User/Projects/"  +
          Project.get_vars.location +
          "/" +  stim_sheet_name;
        $.get(stim_url,function(stim_sheet_content){
          project_json.parsed_stim = [null,null].concat(Collector.PapaParsed(stim_sheet_content));
          proc_stim_loaded[0] = "stimuli";
          if(proc_stim_loaded.join("-") == "stimuli-procedure"){
            Project.activate_pipe();
          }
        });
      }
      break;
    case "server":
      proc_stim_loaded[1] = "procedure";
      project_json.parsed_proc = Collector.PapaParsed(project_json.all_procs[proc_sheet_name]);
      if(proc_stim_loaded.join("-") == "stimuli-procedure"){
        Project.activate_pipe();
      }
      project_json.parsed_stim = [null,null].concat(Collector.PapaParsed(project_json.all_stims[stim_sheet_name]));
      proc_stim_loaded[0] = "stimuli";
      if(proc_stim_loaded.join("-") == "stimuli-procedure"){
        Project.activate_pipe();
      }
      break;
  }
}

function parse_current_proc(){
  function proc_apply_repeats(){
    var this_proc = project_json.parsed_proc;
    repeat_cols = ["weight","frequency","freq","repeat"];
    var repeat_cols_pres = [];
    Object.keys(this_proc[0]).forEach(function(header){
      if(repeat_cols.indexOf(header) !== -1){
        repeat_cols_pres.push(header);
      }
    });

    if(repeat_cols_pres.length > 1){
      bootbox.alert("There are multiple columns that do the same thing, please only use one of them: " + repeat_cols_pres.join(" , ") + ". If you are a participant, please contact the researcher and tell them about this problem.");
    }

    /*
    * fill in repeats
    */
    var filled_proc = [];
    for(var i = 0; i < this_proc.length; i++){
      var this_row = this_proc[i];

      this_row.repeat = typeof(this_row.weight)     !== "undefined" ? this_row.weight : typeof(this_row.frequency) !== "undefined" ? this_row.frequency : typeof(this_row.freq)   !== "undefined" ? this_row.freq : typeof(this_row.repeat)       !== "undefined" ? this_row.repeat : "";

      if(typeof(this_row.repeat) !== "undefined" && this_row.repeat !== ""){
        for(var k = 0; k < this_row.repeat; k ++){
          filled_proc.push(this_row);
        }
      } else {
        filled_proc.push(this_row);
      }
    }
    project_json.parsed_proc = filled_proc;
  }
  function proc_fill_items(){
    var this_proc   = project_json.parsed_proc;
    var filled_proc = [];

    for(var j = 0; j < this_proc.length; j++){
      var row = this_proc[j];
      if(row.item.indexOf(" to ") == -1 && row.item.indexOf(",") == -1){
        filled_proc.push(row);
      } else {
        var items_array = row.item.split(",");
        var complete_items_array = [];
        items_array.forEach(function(item){
          if(item.indexOf(" to ") == -1){
            complete_items_array.push(item);
          } else {
            item_start_end = item.split(" to ");

            if(item_start_end.length > 2){
              bootbox.alert("There is a problem with the procedure sheet - see the row in which the item column value is " +row.item + ", there is more than 1 ':' which is not allowed. If you are not the researcher, can you please send this message to them.");
            }
            var item_start = parseFloat(item_start_end[0]);
            var item_end   = parseFloat(item_start_end[1]) +1;
            for(var this_item = item_start ; this_item < item_end ; this_item++){
              complete_items_array.push(this_item);
            }
          }
        });

        complete_items_array.forEach(function(item){
          var this_row_with_this_item  = JSON.parse(
            JSON.stringify(row)
          );
          this_row_with_this_item.item = item;
          filled_proc.push(this_row_with_this_item);
        });
      }
    }
    project_json.parsed_proc = filled_proc;
  }
  project_json.parsed_proc = project_json.parsed_proc.filter( function(row){
    return Object.keys(row).every(function(x) { return row[x]===''||row[x]===null;}) === false;
  });
  proc_fill_items();
  proc_apply_repeats();
  Project.activate_pipe();
}

function participant_backup(){
  window.localStorage.setItem("project_json",JSON.stringify(project_json));
  window.localStorage.setItem("username",$("#participant_code").val());
}

function post_welcome(participant_code,id_error){
  var completion_code = Math.random().toString(36).substr(2, 10);
  window.localStorage.setItem("completion_code",completion_code);
  $("#completion_code").val(completion_code);
  var prehashed_code = Math.random().toString(36).substr(2, 10);
  window.localStorage.setItem("prehashed_code",prehashed_code);
  $("#prehashed_code").val(prehashed_code);
  switch(Project.get_vars.platform){
    case "server":
    case "github":
    case "onlinepreview":
    case "localhost":
    case "preview":
      id_error = "skip";
      post_welcome_data("blank");
      break;
  }
}

function post_welcome_data(returned_data){
  if(returned_data == "blank"){
    id_error = "skip";
  }

  if(
    returned_data == "blank" |
    returned_data.indexOf("error") !== -1
  ){
    if(id_error == "skip"){
      $("#welcome_div").hide();
      $("#post_welcome").show();
      $("#project_div").show();
      full_screen();
    } else if(id_error == "random"){
      var this_code = Math.random().toString(36).substr(2, 16);
      post_welcome(this_code,"random");

    } else if(id_error == false){
      bootbox.confirm(returned_data,function(response){
        if(response){
          $("#welcome_div").hide();
          $("#post_welcome").show();
          $("#project_div").show();
          full_screen();
        }
      });
    }
  }
}

function precrypted_data(decrypted_data,message){
  responses_csv = decrypted_data.responses;
  response_headers = [];
  responses_csv.forEach(function(row){
    Object.keys(row).forEach(function(item){
      if(response_headers.indexOf(item) == -1){
        response_headers.push(item);
      };
    });
  });
  this_condition    = decrypted_data.this_condition;
  condition_headers = Object.keys(this_condition).filter(function(item){
    return item !== "_empty_";
  });

  table_headers      = response_headers.concat(condition_headers);
  downloadable_csv = [table_headers];
  responses_csv.forEach(function(row,row_no){
    downloadable_csv.push([]);
    table_headers.forEach(function(item,item_no){
      if(typeof(row[item]) !== "undefined"){
        downloadable_csv[row_no+1][item_no] = row[item];
      } else if (condition_headers.indexOf(item) !== -1){
        downloadable_csv[row_no+1][item_no] = this_condition[item];
      } else {
        downloadable_csv[row_no+1][item_no] = "";
      }
    });
  });

  bootbox.prompt({
    title:message,
    value:$("#participant_code").val()+".csv",
    callback:function(result){
      if(result !== null){
        save_csv(result,Papa.unparse(downloadable_csv));
      }
    }
  });
}

function process_welcome(){
  if(document.getElementById("loading_project_json") !== null) {
    /*
    * skip participant id? (and thus start_message)
    */

    if(Project.get_vars.platform == "preview"){
      var pp_id_setting = "random";
    } else {
      var pp_id_setting = project_json.this_condition.participant_id;
    }

  if(pp_id_setting == "off"){                                // put in a participant ID that is clearly not unique (e.g. "notUnique").
  $("#participant_code").val("notUnique");
  post_welcome("notUnique","skip");                       //"skip" means that it will automatically accept non unique ids
  } else if(pp_id_setting == "random"){
      var this_code = Math.random().toString(36).substr(2, 16)
  $("#participant_code").val(this_code);
      post_welcome(this_code,"random");
  } else if(pp_id_setting  == "on"){
  $("#loading_project_json").fadeOut(500);
  $("#researcher_message").fadeIn(2000);
  $("#participant_id_div").show(1000);
  }  else {
  bootbox.alert("It's not clear if the researcher wants you to give them a user id - please contact them before proceeding.");
  }

  if(project_json.this_condition.start_message !== ""){
  $("#researcher_message").html(project_json.this_condition.start_message);
  } else {
  def_start_msg = "<h1 class='text-primary'> Collector</h1>"+
        "<br><br>" +
        "<h4>It's very important to read the following before starting!</h1>" +
        "<div class='text-danger'>If you complete multiple Collector experiments at the same time, your completion codes may be messed up. Please do not do this!</div>" +
        "<br>" +
        "<div class='text-danger'>If you participate in this experiment, your progress in it will be stored on your local machine to avoid you losing your progress if the window or tab closes or freezes. This data will be cleared from your computer once you have completed the task. <b>However, if you do not want this website to store your progress on your computer, DO NOT PROCEED.</b></div>"+
  "<br>" +
  "<div class='text-danger'>If the experiment freezes, try pressing <b>CTRL-S</b> to save your data so far. </div>";
  $("#researcher_message").html(def_start_msg);
  }
  }
}

function requestFullScreen(element) {
    // Supports most browsers and their versions.
    var requestMethod = element.requestFullScreen || element.webkitRequestFullScreen || element.mozRequestFullScreen || element.msRequestFullScreen;

    if (requestMethod) { // Native full screen.
      requestMethod.call(element);
    } else if (typeof window.ActiveXObject !== "undefined") { // Older IE.
        var wscript = new ActiveXObject("WScript.Shell");
        if (wscript !== null) {
            wscript.SendKeys("{F11}");
        }
    }
}

function select_condition(){
  var conditions = Collector.PapaParsed(project_json.conditions);
  project_json.this_condition = conditions.filter(function(row){
    return row.name == Project.get_vars.name;
  })[0];

  /*
  * Check if use of mobile devices is off
  */
  if(
    typeof(project_json.this_condition.mobile) !== "undefined" &&
    project_json.this_condition.mobile.toLowerCase() == "no" &&
    window.mobilecheck()
  ){
    alert("This experiment will not run on a mobile device. Please complete it on a laptop or desktop (using google chrome if possible).");
  } else{
    Project.activate_pipe();
  }
}

//by Laurens Holst on https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array?utm_medium=organic&utm_source=google_rich_qa&utm_campaign=google_rich_qa
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1));
  [array[i], array[j]] = [array[j], array[i]]; // eslint-disable-line no-param-reassign
  }
}

/* Some code that suggests the above shuffleArray function is NOT biased
freq_object = {
  1:[0,0,0,0],
  2:[0,0,0,0],
  3:[0,0,0,0],
  4:[0,0,0,0]
}
for(var i = 0; i < 100000; i++){
  a = [1,2,3,4]
  shuffleArray(a)
  freq_object[a[0]][0]++;
  freq_object[a[1]][1]++;
  freq_object[a[2]][2]++;
  freq_object[a[3]][3]++;
}
console.dir(freq_object)
*/


//solution by Tom Wadley at https://stackoverflow.com/questions/5767325/how-can-i-remove-a-specific-item-from-an-array
function removeItemAll(arr, value) {
  var i = 0;
  while (i < arr.length) {
  if(arr[i] === value) {
  arr.splice(i, 1);
  } else {
  ++i;
  }
  }
  return arr;
}

function shuffle_start_exp(){


  //perhaps also have "shuffle" works as shuffle 1
  //perhaps also have "block shuffle 1" as shuffle 2, etc.

  var shuffle_levels = Object.keys(project_json.parsed_proc[0]).filter(item => item.indexOf("shuffle") !== -1);
  shuffle_levels = shuffle_levels.sort()
   .reverse();

  shuffle_levels.forEach(function(shuffle_level){
  for(var i = 0; i < project_json.parsed_proc.length; i++){
  if(project_json.parsed_proc[i][shuffle_level] == ""){
  project_json.parsed_proc[i][shuffle_level] = "off";
  }
  }

  if(shuffle_level !== "shuffle 1"){

  //split project_json.parsed_proc into chunks based on this_level
  //off rows don't change their order
  var shuffle_block_names = [project_json.parsed_proc[0][shuffle_level]];
  var shuffle_block_rows  = [[project_json.parsed_proc[0]]];

  for(var i = 1; i < project_json.parsed_proc.length; i++){
  if(project_json.parsed_proc[i][shuffle_level] !== project_json.parsed_proc[i-1][shuffle_level] ||
   project_json.parsed_proc[i][shuffle_level] == "off"){
  shuffle_block_names.push(project_json.parsed_proc[i][shuffle_level]);
  shuffle_block_rows.push([project_json.parsed_proc[i]]);
  } else {
  shuffle_block_rows[shuffle_block_rows.length-1].push(project_json.parsed_proc[i]);
  }
  }
  var shuffled_block_names = JSON.parse(JSON.stringify(shuffle_block_names));

  //create a list of names to be randomised
  unique_shuffle_block_names = Array.from(new Set(shuffle_block_names));
  unique_shuffle_block_names = removeItemAll(unique_shuffle_block_names,"off");

  //randomise order of unique_shuffle_block_names;



  //replace original index with numbers
  unique_shuffle_block_names.forEach(function(this_name,name_no){
  shuffled_block_names.forEach(function(item,item_no){
  if(item == this_name){
  shuffled_block_names[item_no] = name_no;
  }
  });
  });

  shuffled_unique_shuffle_block_names = unique_shuffle_block_names.sort(function(){return 0.5-Math.random()});

  unique_shuffle_block_names.forEach(function(this_name,name_no){
  shuffled_block_names.forEach(function(item,item_no){
  if(item == name_no){
  shuffled_block_names[item_no] = this_name;
  }
  });
  });


  var shuffled_row_blocks = [];
  //now loop through the shuffled_block_names to reorder the blocks
  shuffled_block_names.forEach(function(this_name,row_no){
  shuffled_row_blocks[row_no] = shuffle_block_rows[shuffle_block_names.indexOf(this_name)];
  });

  var all_rows = [];
  shuffled_row_blocks.forEach(function(block){
  block.forEach(function(row){
  all_rows.push(row);
  });
  });

  project_json.parsed_proc.forEach(function(row, row_no){
  if(row[shuffle_level] !== "off"){
  project_json.parsed_proc[row_no] = all_rows[row_no];
  }
  });
  }
  });

  shuffle_array = {};
  project_json.parsed_proc.forEach(function(row,index){
  var this_shuffle = row["shuffle 1"];
  if(typeof(shuffle_array[this_shuffle]) == "undefined"){
  shuffle_array[this_shuffle] = [index];
  } else {
  shuffle_array[this_shuffle].push(index);
  }
  });
  delete shuffle_array.off;
  Object.keys(shuffle_array).forEach(function(key){
  shuffleArray(shuffle_array[key]);
  });
  //apply shuffle to project_json.parsed_proc
  new_proc = project_json.parsed_proc.map(function(row,original_index){
  if(row["shuffle 1"] !== "off" & row["shuffle 1"] !== ""){
  this_shuffle = row["shuffle 1"];
  var this_pos = shuffle_array[this_shuffle].pop();
  return project_json.parsed_proc[this_pos];
  }
  if(row["shuffle 1"] == "off"){
  return project_json.parsed_proc[original_index];
  }
  });
  project_json.parsed_proc = new_proc;
  if(typeof(project_json.responses) == "undefined"){
  project_json.responses    = [];
  }

  project_json.wait_to_proc  = false;
  Project.activate_pipe();
}

function start_restart(){
  if(isSafari){
    bootbox.alert("This experiment will not run in safari. Please close and use another browser");
  } else if(window.localStorage.getItem("project_json") !== null &
     Project.get_vars.platform !== "preview"){

    bootbox.dialog({
      title:"Resume or Restart?",
      message: "It looks like you have already started this experiment, would you like to resume or restart?",
      buttons: {
        local:{
          label: "Resume",
          className: 'btn-primary',
          callback: function(){
            project_json = JSON.parse(window.localStorage.getItem("project_json"));

            var participant_code = window.localStorage.getItem("username");
            var completion_code = window.localStorage.getItem("completion_code");
            var prehashed_code = window.localStorage.getItem("prehashed_code");
            $("#completion_code").val(completion_code);
            $("#prehashed_code").val(prehashed_code);
            if(participant_code == ""){
              bootbox.prompt("What ID did you use?", function(this_participant_code){
                participant_code = this_participant_code;
                $("#participant_code").val(participant_code);
                post_welcome_data("blank");
              });
            } else {
              $("#participant_code").val(participant_code);
              post_welcome_data("blank");
            }
          }
        },
        start: {
          label: "Restart",
          className: 'btn-danger',
          callback: function(){
            Project.activate_pipe();
          }
        },
        cancel: {
          label: "Cancel",
          className: 'btn-secondary',
          callback: function(){
            //nada;
          }
        }
      }
    });
  } else {
    Project.activate_pipe();
  }
}

function start_project(){
  /*
  * Try to at least center the experiment window if the browser isn't maximised
  */
  window.moveTo(0, 0);
  window.resizeTo(screen.availWidth, screen.availHeight);

  //detect if resuming

  if(Object.keys(project_json) == 0){
  switch(Project.get_vars.platform){
      case "onlinepreview":
      case "localhost":
      case "preview":
        electron_wait = setInterval(function(){
          if(typeof(Collector.electron.fs.read_file) !== "undefined"){
            clearInterval(electron_wait);
            project_json = JSON.parse(
              Collector
                .electron
                .fs
                .read_file(
                  "Projects",
                  Project
                  .get_vars
                  .location + ".json"
                )
            );
            Project.activate_pipe();
          }
        },100);
  break;

  case "github":
  if(typeof(Project.get_vars.dropbox) !== "undefined" && Project.get_vars.dropbox){
  $.get(Project.get_vars.dropbox.replace("www.","dl."),function(result){
  project_json = JSON.parse(result);
  Project.activate_pipe();
  });
  } else {
          /*
          * wrap into function that will automatically keep trying until you have succesfully loaded the experiment!
          */
          function recursive_load_experiment(random_code){
            if(typeof(random_code) == "undefined"){
              random_code = "";
            }
            $.get("../User/Projects/" + Project.get_vars.location + ".json?randomcode=" + random_code,function(result){
              project_json = result;
              Project.activate_pipe();
            })
            .catch(function(error){
              bootbox.confirm("It looks like the experiment you're trying to load isn't there (yet) - click OK if you'd like to try to load the experiment again (clicking OK can be quicker than constantly refreshing the page)?", function(result){
                if(result){
                  recursive_load_experiment(Collector.makeid(5));
                }
              });
              console.dir(error);
            });
          }
          recursive_load_experiment();
  }
  break;
  default:
  if(typeof(Project.get_vars.location) !== "undefined" && Project.get_vars.location !== ""){
    if(Project.get_vars.location.indexOf("www.dropbox") !== -1){
      get_location = Project.get_vars.location.replace("www.","dl.");
    } else {
      get_location = Project.get_vars.location;
    }
    $.get(get_location,function(this_project){
      project_json = JSON.parse(this_project);
      Project.activate_pipe();
    });
  }
  break;
  }
  } else {
  Project.activate_pipe();
  }
}

function write_phase_iframe(index){

  if(typeof(project_json.parsed_proc[index]) == "undefined"){
  return null;
  }

  var phase_iframe = $("<iframe>");

      phase_iframe.addClass("phase_iframe")
                  .attr("frameBorder", "0")
                  .attr("id", "trial" + index)
                  .attr("scrolling", "no");

  $("#project_div").append(phase_iframe);


  this_proc = project_json.parsed_proc[index];

  var post_code =  Object.keys(this_proc).filter(function(key) {
  return /code/.test(key);
  });
  phase_events = post_code.filter(function(post_phase){
    return this_proc[post_phase] !== "";
  });
  phase_iframe_code = '';

  // write an iframe with the required number of sub_iframes
  for(var i = 0; i < phase_events.length; i++){
  if(this_proc[phase_events[i]] !== ""){
      var post_iframe = $("<iframe>");
          post_iframe.addClass("post_iframe")
                     .attr("frameBorder", "0")
                     .attr("id", "post" + i)
                     .css("height", "100%")
                     .css("width", "100%")

      phase_iframe_code += post_iframe[0].outerHTML;
  }
  }
  doc = document
    .getElementById('trial'+index)
    .contentWindow
    .document;
  doc.open();
  try{
    doc.write(phase_iframe_code);
  } catch(error){
    alert("failed to write the trial_code");
    alert(error);
  }
  doc.close();

  for(var i = 0; i < phase_events.length; i++){
  var phase_content = Project.generate_trial(index,i);
        phase_content += "<button style='opacity:0; filter: alpha(opacity=0)' id='zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz'></button>";

  doc = document
      .getElementById('trial'+index)
      .contentWindow
      .document
      .getElementById('post'+i)
      .contentWindow;
  doc.document.open();

    /*
    * New attempt to check if images have loaded succesfully
    */
    var img_check_code =  '<scr' + 'ipt src="libraries/collector/StimuliChecks.js"></scr' + 'ipt>';

    if(typeof(this_proc["max time"]) !== "undefined" &&
       this_proc["max time"] !== "user" &&
       this_proc["max time"] !== ""){
      var timer_code = Project.html_code["Timer"];
      if(typeof(this_proc["timer_style"]) !== "undefined" && this_proc["timer_style"] !== ""){
        timer_code = timer_code.replace(
          "#collector_trial_timer{",
          "#collector_trial_timer{" + this_proc["timer_style"] + ";"
        )
      }
    } else {
      var timer_code = "";
    }
    doc.document.write(
      libraries +
      phase_content +
      timer_code +
      img_check_code
    );
  doc.document.close();

    //autoscroll to top of iframe (in case the trial runs over)
    doc.scrollTo(0,0);

  var no_images = (phase_content.match(/<img/g) || []).length;
  project_json.uninitiated_stims.push(no_images);
  project_json.uninitiated_stims_sum = project_json.uninitiated_stims.reduce(function(acc,val){return acc + val });

  if(typeof(stim_interval) == "undefined"){
  //need code here to deal with "buffering" when there are no images.
  stim_interval = setInterval(function(){
  project_json.initiated_stims = 0;
  for(var j = project_json.trial_no; j < project_json.trial_no + project_json.this_condition.buffer; j++){
  if($("#trial"+j).contents().children().find("iframe").contents().children().find("img").prop("complete")){
  //if($("#trial"+j).contents().find('img').prop('complete') == true){
  project_json.initiated_stims += $("#trial"+j).contents().children().find("iframe").contents().children().find("img").length;
  }
  }
  var completion = 100-project_json.initiated_stims/project_json.uninitiated_stims_sum;
  $("#stim_listing").css("width",completion+"%");
  if(completion == 100 | project_json.uninitiated_stims_sum == 0){
  clearInterval(stim_interval);
  $("#loading_div").hide();
  $("#stim_progress").fadeOut(1000);
  if($("#calibrate_div").is(':visible') == false){
  $("#project_div").fadeIn(500);
  }
  if(project_json.wait_to_proc){
  bootbox.alert("It looks like you have closed the window midway through an experiment. Please press OK when you are ready to resume the experiment!", function(){
  Project.start_post();
  });
  } else {
  Project.start_post();
  }
  }
  },10);
  }
  }
}

/*
* allow participant to save part way
*/
$(window).bind('keydown', function(event) {
  if (event.ctrlKey || event.metaKey) {
  switch (String.fromCharCode(event.which).toLowerCase()) {
  case 's':
  event.preventDefault();
  precrypted_data(project_json,"What do you want to save this file as?");
  break;
  }
  }
});

//prevent closing without warning
window.onbeforeunload = function() {
  switch(Project.get_vars.platform){
    case "onlinepreview":
    case "localhost":
      break;
    default:
      if(online_data_obj.finished_and_stored == false){
        bootbox.confirm("Would you like to leave the experiment early? If you didn't just download your data there's a risk of you losing your progress.",function(result){
          if(result){
            online_data_obj.finished_and_stored = true; //even though it's not
          }
        });
        precrypted_data(project_json,"It looks like you're trying to leave the experiment before you're finished (or at least before the data has been e-mailed to the researcher. Please choose a filename to save your data as and e-mail it to the researcher. It should appear in your downloads folder.");

        return "Please do not try to refresh - you will have to restart if you do so.";
      }
      break;
  }
};
$("body").css("text-align","center");
$("body").css("margin","auto");

//by qwerty at https://stackoverflow.com/questions/2116558/fastest-method-to-replace-all-instances-of-a-character-in-a-string
String.prototype.replaceAll = function(str1, str2, ignore){
  return this.replace(new RegExp(str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g,"\\$&"),(ignore?"gi":"g")),(typeof(str2)=="string")?str2.replace(/\$/g,"$$$$"):str2);
};

/*
* exports for testing
*/
if(typeof(module) !== "undefined"){
  module.exports = {
    clean_var:            clean_var,
    clean_this_condition: clean_this_condition
  };
}
