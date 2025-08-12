if(typeof(window.localStorage.local_online) === "undefined"){
  window.localStorage.local_online = "local";
  load_local();
}
if(window.localStorage.local_online == "online"){
  $("#local_online_switch").html("online");
  load_online();
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
   
  your_stuff = {};
};