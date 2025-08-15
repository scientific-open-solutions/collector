if(typeof(window.localStorage.local_online) === "undefined"){
  window.localStorage.local_online = "local";  
}
if(window.localStorage.local_online == "online"){
  $("#local_online_switch").html("online");
}
$("#local_online_switch").on("click", function(){
  if(window.localStorage.local_online === "local"){
    window.localStorage.local_online = "online";    
  } else if(window.localStorage.local_online === "online") {
    window.localStorage.local_online = "local";    
  } else {
    alert("something is wrong with window.localStorage.local_online");
  }
  $("#local_online_switch").html(window.localStorage.local_online);
});
function load_online(){
  $("#github_logo").hide();
  $("#top_tab_Data").hide();
  if(typeof(window.localStorage.your_stuff) === "undefined"){
    your_stuff = {
      "phasetypes": {
        "default": {},
        "file": "",
        "filetype": "",
        "graphic": {
          "files": []
        },
        "user": {},
        "version": 0
      },
      "data": {
        "servers": {}
      },
      "projects": {
        "any_loaded": false,
        "authenticated": false,
        "current_manager": "",
        "project": "",
        "projects": {},
        "incomp_process": false,
        "pipe_position": 0,
        "pipe_direction": "",
        "versions": []
      },
      "github": {
        "organization": "",
        "repository": "",
        "organizations": {}
      },
      "mods": {},
      "surveys": {}
    } 
    window.localStorage.your_stuff = JSON.stringify(your_stuff);
  } else {
    your_stuff = JSON.parse(window.localStorage.your_stuff);
  } 
  //correct_your_stuff();
  //correct_user();
  //list_repos();
  list_projects();
  list_graphics();
  list_phasetypes();
  initiate_actions();
  //list_keys();
  //list_data_servers();
  list_surveys();
};