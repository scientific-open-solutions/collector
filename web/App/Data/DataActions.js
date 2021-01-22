$("#fileToLoad").on("change",function(){
  if($("#fileToLoad").val() !== ""){
    loadFileAsText();
  }
});

$("#google_script_btn").on("click",function(){
  $.get("Data/Google/CollectorSave.txt",function(google_script){
    bootbox.alert("//Select and copy the following to a <b>google apps script</b>: <br><br><textarea style='white-space: pre-wrap;' onclick='this.focus();this.select()' readonly='readonly'>" + google_script + "</textarea>");
  })
});

$("#js_decrypt_btn").on("click",function(){
  $("#fileToLoad").val("");
  $("#fileToLoad").click();
});


$("#list_data_btn").on("click",function(){  
  if($("#data_user_email").val() == ""){
    bootbox.alert("Please put in your email address that is registered with the server selected.");
  } else if($("#data_user_password").val() == ""){
    bootbox.alert("Please put in a password.");
  } else if($("#select_data_server").val() == null){
    bootbox.alert("Please select a server");
  } else {
    if(typeof(master_json.data.servers[$("#select_data_server").val()].manage_url) == "undefined"){
      //fix the lack of a manage_url now (perhaps auto click the update );

      // then request list
      request_data_list();

    } else {
      //retrieve the data here
      request_data_list();
    }
  }
});

switch(Collector.detect_context()){
  case "localhost":
    $("#local_data_btn").show(500);
    $("#local_data_btn").on("click", function(){
      var response = Collector.electron.open_folder("Data");
      console.dir(response);
    });
    break;
}
