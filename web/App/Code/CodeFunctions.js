/*  Collector (Garcia, Kornell, Kerr, Blake & Haffey)
    A program for running experiments on the web
    Copyright 2012-2016 Mikey Garcia & Nate Kornell


    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License version 3 as published by
    the Free Software Foundation.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>

		Kitten/Cat release (2019-2021) author: Dr. Anthony Haffey (team@someopen.solutions)
*/
$.ajaxSetup({ cache: false }); // prevents caching, which disrupts $.get calls

code_obj = {
	delete_code:function(){
    var deleted_trialtype = $("#code_select").val();
    master_json.code.file = $("#code_select").val();
		var this_loc = "/code/" + master_json.code.file;
		bootbox.confirm("Are you sure you want to delete this " + this_loc + "?", function(result){
			if(result == true){
				if(typeof(master_json.code.graphic.files[master_json.code.file]) !== "undefined"){
					delete(master_json.code.graphic.files[master_json.code.file]);
				}
				delete(master_json.code.user[master_json.code.file]);
        $("#code_select").attr("previousvalue","");
				$("#code_select option:selected").remove();
				master_json.code.file = $("#code_select").val();
				code_obj.load_file("default_trialtype");
				Collector.custom_alert("Successfully deleted "+this_loc);
				update_master_json();

				switch(Collector.detect_context()){
					case "github":
					case "gitpod":
					case "server":
            // i.e. the user is online and using dropbox
						dbx.filesDelete({path:this_loc+".html"})
							.then(function(returned_data){
								//do nothing more
							})
							.catch(function(error){
								Collector
									.tests
									.report_error("problem deleting a code file",
														 	  "problem deleting a code file");
							});
						break;
					case "localhost":
						Collector
							.electron
              .fs
							.delete_code(deleted_trialtype,
								function(response){
									if(response !== "success"){
										bootbox.alert(response);
									}
								});
						break;
				}
			}
		});
	},
	load_file:function(user_default){
		$("#ACE_editor").show();
		$("#new_code_button").show();
		$("#rename_code_button").show();
		if(user_default == "default_trialtype"){
			$("#delete_code_button").hide();
      $("#default_user_code_span").html("default_trialtype");
      $("#code_select").removeClass("user_trialtype")
                             .addClass("default_trialtype");
        //[0].className = $("#code_select")[0].className.replace("user_","default_");
		} else {
			$("#delete_code_button").show();
		}

		var trialtype = master_json.code.file;

    //python load if localhost
    switch(Collector.detect_context()){
      case "localhost":
        cleaned_trialtype = trialtype.toLowerCase()
                                     .replace(".html","") +
                                     ".html";
				trialtype_content = Collector.electron.fs.read_file(
          "Trialtypes",
					cleaned_trialtype
        )
				if(trialtype_content == ""){
				  editor.setValue(
            master_json.code
						[user_default + "s"]
            [trialtype]
          );
        } else {
				  editor.setValue(trialtype_content);
		    }
        break;
      default:
				var content = master_json.code[user_default+"s"][trialtype];
        editor.setValue(content);
        break;
    }


	},
	save:function(content, name, new_old, graphic_code){
		if(new_old == "new"){
			graphic_editor_obj.clean_canvas();
      editor.setValue("");
		}
		if($('#code_select option').filter(function(){
			return $(this).val() == name;
		}).length == 0){
			$('#code_select').append($("<option>", {
				value: name,
				text : name,
				class: "user_trialtype"
			}));
			$("#code_select").val(name);
			$("#code_select")[0].className = $("#code_select")[0].className.replace("default_","user_");

			if(graphic_code == "code"){
				$("#ACE_editor").show();
			} else if(graphic_code == "graphic"){
				$("#graphic_editor").show();
			}
			$("#trial_type_file_select").show();
			$("#default_user_code_span").html("user_trialtype");
			Collector.custom_alert("success - " + name + " created");
		} else {
			Collector.custom_alert("success - " + name + " updated");
		}
		dbx_obj.new_upload({path:"/trialtypes/"+name+".html",contents:content,mode:"overwrite"},function(result){
			Collector.custom_alert("<b>" + name + "updated on dropbox");
		},function(error){
			bootbox.alert("error: "+error.error+"<br> try saving again after waiting a little");
		},
		"filesUpload");
		if(typeof(Collector.electron) !== "undefined"){
			var write_response = Collector.electron.fs.write_file(
        "Trialtypes",
				name
					.toLowerCase()
					.replace(".html","") + ".html",
				content
      )
			if(write_response !== "success"){
			     bootbox.alert(result);
			}
		}
	},
	synchTrialtypesFolder:function(){
		if(dropbox_check()){
			dbx.filesListFolder({path:"/trialtypes"})
				.then(function(returned_data){
					var trialtypes = returned_data.entries.filter(item => item[".tag"] == "file");
					trialtypes.forEach(function(trialtype){
						trialtype.name = trialtype.name.replace(".html","");
						if(typeof(master_json.code.user[trialtype.name]) == "undefined"){
							dbx.sharingCreateSharedLink({path:trialtype.path_lower})
								.then(function(returned_path_info){
									$.get(returned_path_info.url.replace("www.","dl."),function(content){
										master_json.code.user[trialtype.name] = content;
										$("#code_select").append("<option class='user_trialtype'>"+trialtype.name+"</option>");
									});
								});
						}
					});
				});
		}
	}
}
function list_code(to_do_after){
	//try{
		if(typeof(Collector.electron) !== "undefined"){
      var files = Collector.electron.fs.list_code();
      files = JSON.parse(files);
      files = files.map(item => item.replaceAll(".html",""));
      files.forEach(function(file){
        if(Object.keys(master_json.code.user).indexOf(file) == -1){
          master_json.code.user[file] = Collector
            .electron
            .fs
            .read_file("Code", file + ".html");
        }
      });
		}

    function process_returned(returned_data){

      $("#code_select").empty();
      $("#code_select").append("<option disabled>Select a file</option>");
      $("#code_select").val("Select a file");

      var default_code = JSON.parse(returned_data);
      var user = master_json.code.user;

      master_json.code.default = default_code;
      default_keys = Object.keys(default_code).sort((a, b) => a.localeCompare(b, undefined, {sensitivity: 'base'}));

      user_keys = Object.keys(user).sort((a, b) => a.localeCompare(b, undefined, {sensitivity: 'base'}));

      default_keys.forEach(function(element){
        $("#code_select").append("<option class='default_trialtype'>"+element+"</option>");
      });
      master_json.code.user = user;

      user_keys.forEach(function(element){
        $("#code_select").append("<option class='user_trialtype'>" + element + "</option>");
      });
      code_obj.synchTrialtypesFolder();


      switch(Collector.detect_context()){
        case "server":
        case "gitpod":
        case "github":
				case "localhost":
          // currently do nothing
          if(typeof(to_do_after) !== "undefined"){
            to_do_after();
          }
          break;
      }
    }

    function get_default(list){
      if(list.length > 0){
        var item = list.pop();

        switch(Collector.detect_context()){
          case "localhost":
            var trial_content = Collector.electron.fs.read_default(
              "Code",
              item
            );
            master_json.code.default[
              item.toLowerCase().replace(".html","")
            ] = trial_content;
            get_default(list);
            break;
          default:
              $.get(collector_map[item],function(trial_content){
                master_json.code.default[
                  item.toLowerCase().replace(".html","")
                ] = trial_content;
                get_default(list);
              });
            break;
          }

      } else {
        process_returned(JSON.stringify(master_json.code.default));
      }
    }
    var default_list = Object.keys(isolation_map[".."]["Default"]["DefaultTrialtypes"]);

    get_default(default_list);


    Collector.tests.pass("code",
                         "list");
  /*
  } catch(error){
    Collector.tests.fail("trialtypes",
                         "list",
                         error);
  };
  */
}
