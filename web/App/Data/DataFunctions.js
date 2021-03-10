mega_data_obj = {};
var request_modal;

encrypt_obj = {
  _decrypt_request:function(encrypted_content,
                            default_filename,
                            batch_status){
    encrypt_obj.current_batch.push([default_filename, encrypted_content]);
    switch(batch_status){
      case "none":
      case "end":
        bootbox.prompt({
          title: "What is your password? (this will never be saved, but is needed)",
          inputType: "password",
          callback: function(user_password){
            if(user_password){


              //set up a function that can be called recursively, working through each archived keypair until there are none.
              function combine_password_key(keys_list,user_password){
                if(keys_list.length == 0){
                  bootbox.alert("This password isn't working. Are you sure it's the right password, and that you're decrypting the data with the correct installation of Collector? (i.e. do you have multiple versions of Collector you are conducting research with?");
                } else {
                  this_private_key = keys_list.pop();
                  var decrypted_private_key_obj = CryptoJS.AES.decrypt(master_json.keys.encrypted_private_key, user_password);
                  try{
                    var decrypted_private_key = decrypted_private_key_obj.toString(CryptoJS.enc.Utf8);
                  } catch(error) {
                    Collector.custom_alert(error + " trying with an archived private key");
                    combine_password_key(keys_list,user_password);
                  }
                  //try{


                    all_decrypted = [];

                    function recursive_decryption(
                      this_batch,
                      current_pos,
                      max_pos
                    ){

                      if(this_batch.length > 0){
                        //setTimeout(function(){
                          try{
                            var this_row = this_batch.shift();
                            var progress = (100*current_pos/max_pos) + "%";

                            window.requestAnimationFrame(function(){
                              $("#decryption_progress").css("width",progress);
                            });



                            var default_filename = this_row[0];
                            var encrypted_content = this_row[1];

                            console.dir(progress);
                            this_decrypted_message = JSON.parse(
                              encrypt_obj.decrypt(
                                decrypted_private_key,
                                JSON.parse(
                                  encrypted_content
                                )
                              )
                            );

                            this_decrypted_message = this_decrypted_message.map(function(row){
                              try{
      													row["filename"] = default_filename;
      													all_decrypted.push(row);
      												} catch(error){

      												}
                            });
                          } catch(error){
                            //just skip, might give an error message in the future
                          } finally{
                            recursive_decryption(
                              this_batch,
                              current_pos + 1,
                              max_pos
                            );
                          }
                        //},0);
                      } else {
                        if(encrypt_obj.current_batch.length > 1){
                          process_decrypted(all_decrypted,"batch");
                        } else {
                          process_decrypted(all_decrypted,"single");
                        }
                      }
                    }
                    bootbox.alert('<div class="progress"><div class="progress-bar" role="progressbar" style="width: 0%" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100" id="decryption_progress"></div></div>')
                    recursive_decryption(
                      encrypt_obj.current_batch,
                      0,
                      encrypt_obj.current_batch.length
                    )

                    /*
                    encrypt_obj.current_batch.map(function([default_filename,encrypted_content],progress_index){




                    });
                    */
                  /*
                  } catch(error){
                    Collector.custom_alert(error + " trying with an archived private key");
                    combine_password_key(keys_list,user_password);
                  }
                  */
                }
              }

              function process_decrypted(
                this_decrypted_message,
                batch_single
              ){
                var response_headers = [];
                var filenames        = [];
                for(var i = 0; i < this_decrypted_message.length ; i++) {
                  decrypted_data = this_decrypted_message[i];
                  Object.keys(decrypted_data).forEach(function(header){
                    if(response_headers.indexOf(header) == -1){
                      response_headers.push(header);
                    };
                  });
                }

                for(var i = 0; i < this_decrypted_message.length; i++){
                  response_headers.forEach(function(this_header){
                    if(typeof(this_decrypted_message[i][this_header]) == "undefined"){
                      this_decrypted_message[i][this_header] = "";
                    }
                  });
                }

                for(var i = 0; i < this_decrypted_message.length; i++){
                  delete(this_decrypted_message[i][""]);   // Delete blank column if present
                  if(filenames.indexOf(this_decrypted_message[i].filename) == -1){
                    filenames.push(this_decrypted_message[i].filename);
                  }
                }

                if(filenames.length > 1){
                  bootbox.dialog({
                    title:"Would you like to have multiple files or one large file?",
                    message: "There are multiple files - would you like the files to be merged or decrypted separately?",
                    buttons:{
                      merge: {
                        label: "Merge",
                        className: 'btn-primary',
                        callback: function(){
                          //do all participants in one go
                          default_filename = "batch";
                          //download the data file here
                          bootbox.prompt({
                            title: "What would you like to name this file?",
                            value: default_filename.replace(".csv","") + ".csv",
                            callback: function(result) {
                              if(result){
                                var filename = result.toLowerCase().replace(".csv","") + ".csv";
                                Collector.save_data (filename, Papa.unparse(this_decrypted_message,{
                                  quotes: false, //or array of booleans
                                  quoteChar: '"',
                                  escapeChar: '"',
                                  delimiter: ",",
                                  header: true,
                                  newline: "\r\n",
                                  skipEmptyLines: true, //or 'greedy',
                                  columns: null //or array of strings
                                }));
                              }
                            }
                          });
                        }
                      },
                      separate: {
                        label: "Separate",
                        className: 'btn-info',
                        callback: function(){
                          function recursive_username_decryption(
                            filenames
                          ){
                            if(filenames.length > 0){
                              var username = filenames.pop();
                              this_participant_message = this_decrypted_message.filter(
                                row => row.filename == username
                              );

                              console.dir("this_participant_message");
                              console.dir(this_participant_message);

                              bootbox.prompt({
                                title: "What would you like to name this file?",
                                value: username.replace(".csv","") + ".csv",
                                callback: function(result) {
                                  if(result){
                                    var filename = result.toLowerCase().replace(".csv","") + ".csv";
                                    Collector.save_data (filename, Papa.unparse(this_participant_message,{
                                      quotes: false, //or array of booleans
                                      quoteChar: '"',
                                      escapeChar: '"',
                                      delimiter: ",",
                                      header: true,
                                      newline: "\r\n",
                                      skipEmptyLines: true, //or 'greedy',
                                      columns: null //or array of strings
                                    }));
                                    recursive_username_decryption(filenames);
                                  }
                                }
                              });
                            }
                          }
                          recursive_username_decryption(filenames);
                        }
                      },
                    }
                  });
                } else {
                  default_filename = filenames[0];

                  if(this_decrypted_message.length == 0){
                    bootbox.alert("None of the data was succesfully decrypted - perhaps you used an invalid password?")
                  } else {
                    bootbox.prompt({
                      title: "What would you like to name this file?",
                      value: default_filename,
                      callback: function(result) {
                        if(result){
                          var filename = result.toLowerCase().replace(".csv","") + ".csv";
                          Collector.save_data (
                            filename,
                            Papa.unparse(
                              this_decrypted_message,{
                                quotes: false, //or array of booleans
                                quoteChar: '"',
                                escapeChar: '"',
                                delimiter: ",",
                                header: true,
                                newline: "\r\n",
                                skipEmptyLines: true, //or 'greedy',
                                columns: null //or array of strings
                              }
                            )
                          );
                        }
                      }
                    });
                  }
                }
              }
              if(typeof(master_json.keys.archived) == "undefined"){
                master_json.keys.archived = [];
              }
							var all_private_keys = []
              master_json.keys.archived.forEach(function(row){
                all_private_keys.push(row.encrypted_private_key);
              });
              all_private_keys.push(master_json.keys.encrypted_private_key);
              combine_password_key(all_private_keys,user_password);
            };
          }
        });
        break;
      case "add":
        //do nothing
        break;
    }
  },
	add_script: function(){
		bootbox.prompt("Please complete the instructions on how to automatically have your data saved or e-mailed and then copy in the script address below",function(this_url){

			/*
			this functionality will be in version 1
      master_json.data.save_script = this_url;
			*/

    })
	},
  archive_keys:function(){
    var keypair = {
                    public_key : master_json.keys.public_key,
                    encrypted_private_key : master_json.keys.encrypted_private_key
                  };
    master_json.keys.archived.push(keypair);
  },
  change_password:function(){
    bootbox.dialog({
      title:"Are you sure you want to update your password?",
      message: "We will still try to decrypt data that was encrypted with your old password, but make sure to use your new password to decrypt new data.",
      buttons:{
        yes: {
          label: "Okay",
          className: 'btn-primary',
          callback: function(){
            encrypt_obj.archive_keys();
            encrypt_obj.generate_keys();
          }
        },
        cancel: {
          label: "Cancel",
          className: 'btn-secondary',
          callback: function(){
            //nothing
          }
        },
      }
    });
  },
  confirm_keys:function(){
    this_encrypted_message = encrypt_obj.encrypt(receiverPublicKey,"howdy");

    this_encrypted_message = JSON.stringify(this_encrypted_message);
    this_encrypted_message = JSON.parse(this_encrypted_message);

    bootbox.prompt("Let's quadruple check everything is working - if you put in your password you should see the message 'howdy', which has just been encrypted using your public key",function(user_password){
      var decrypted_private_key_obj = CryptoJS.AES.decrypt(master_json.keys.encrypted_private_key, user_password);
      var decrypted_private_key = decrypted_private_key_obj.toString(CryptoJS.enc.Utf8);
      this_decrypted_message = encrypt_obj.decrypt(decrypted_private_key,this_encrypted_message);
      bootbox.alert(this_decrypted_message);
    });
  },
  current_batch:[],
  decrypt: function(receiverSecretKey, encryptedData) {
    const receiverSecretKeyUint8Array = nacl.util.decodeBase64(
        receiverSecretKey
    )
    const nonce = nacl.util.decodeBase64(encryptedData.nonce)
    const ciphertext = nacl.util.decodeBase64(encryptedData.ciphertext)
    const ephemPubKey = nacl.util.decodeBase64(encryptedData.ephemPubKey)
    const decryptedMessage = nacl.box.open(
        ciphertext,
        nonce,
        ephemPubKey,
        receiverSecretKeyUint8Array
    )
    return nacl.util.encodeUTF8(decryptedMessage)
  },
  encrypt: function(receiverPublicKey, msgParams) {  //: string
    const ephemeralKeyPair = nacl.box.keyPair()
    const pubKeyUInt8Array =  nacl.util.decodeBase64(receiverPublicKey)
    const msgParamsUInt8Array = nacl.util.decodeUTF8(msgParams)
    const nonce = nacl.randomBytes(nacl.box.nonceLength)
    const encryptedMessage = nacl.box(
      msgParamsUInt8Array,
      nonce,
      pubKeyUInt8Array,
      ephemeralKeyPair.secretKey
    )
    return {
      ciphertext: nacl.util.encodeBase64(encryptedMessage),
      ephemPubKey: nacl.util.encodeBase64(ephemeralKeyPair.publicKey),
      nonce: nacl.util.encodeBase64(nonce),
      version: "x25519-xsalsa20-poly1305"
    }

  },

  generate_keys:function(){


    //solution at https://medium.com/zinc_work/using-cryptography-tweetnacl-js-to-protect-user-data-intro-tips-tricks-a8e38e1818b5
    var keypair = nacl.box.keyPair();

    receiverPublicKey = nacl.util.encodeBase64(keypair.publicKey);
    receiverSecretKey = nacl.util.encodeBase64(keypair.secretKey)

    if(typeof(master_json.keys) == "undefined"){
      master_json.keys = {
        archived : []
      };
    }

    master_json.keys.public_key = receiverPublicKey;

    //if(typeof(encrypt_dialog) == "undefined"){ //this seems unnecessary (and unhelpful)
      encrypt_dialog = bootbox.prompt("In order to encrypt and decrypt your participants' data, we need a password. Make sure you will remember this password, if you forget it then any data that is encrypted will be lost forever.",function(result){
        if(result){
          bootbox.prompt("Let's type in the password one more time, just to be sure",function(result_2){
            if(result == result_2){

              var encryptedAES = CryptoJS.AES.encrypt(receiverSecretKey, result_2);
              var encryptedAES_string = encryptedAES.toString();
              var decrypted = CryptoJS.AES.decrypt(encryptedAES_string, result_2);
              var plaintext = decrypted.toString(CryptoJS.enc.Utf8);

              if(plaintext == receiverSecretKey){
                master_json.keys.encrypted_private_key = encryptedAES_string;
                encrypt_obj.confirm_keys();
                list_keys();
              } else {
                bootbox.alert("Something went wrong with creating your encryption keys");
              }

            } else {
              bootbox.alert("Erm, your passwords didnt match, do you want to have another go?");
              //update this with the relevant code to clarify whether the user wants to have another go.

            }
          });
        }
      });
    //}
  },
}

function list_data_servers(){
  var select_server_html = "<select class='form-control' id='select_data_server'>" +
                                "<option disabled selected>--Please select a server--</option>";
  Object.keys(master_json.data.servers).forEach(function(this_server){
    var this_server_info = master_json.data.servers[this_server];

    if(typeof(this_server_info.registration_url) !== "undefined"){

      select_server_html += "<option>" + this_server + "</option>";

    }
  });
  select_server_html += "</select>";
  $("#select_server").html(select_server_html);

}

function list_keys(){
  if(typeof(master_json.keys) !== "undefined" &&
     typeof(master_json.keys.public_key) !== "undefined" &&
     master_json.keys.public_key !== ""){
    $("#public_key").val(master_json.keys.public_key);
    $("#private_key").val(master_json.keys.encrypted_private_key);
  } else {
    encrypt_obj.generate_keys();
  }
}

function loadFileAsText(){
	encrypt_obj.current_batch = [];
  function batch_no_batch(batch_no){
    if(batch_no == -1){
      batch_no = 0;
    }
    if(document.getElementById("fileToLoad").files.length > batch_no + 1){
			batch_proc   = true;
      var batch_status = "add";
    } else {
			batch_proc   = false;
      var batch_status = "end";
    }
    var fileToLoad = document.getElementById("fileToLoad").files[batch_no];
    var default_filename = document.getElementById("fileToLoad")
      .files[batch_no]
      .name
      .toLowerCase()
      .replace(".txt","");
    var fileReader = new FileReader();
    fileReader.onload = function(fileLoadedEvent){
        var textFromFileLoaded = fileLoadedEvent.target.result;
        encrypt_obj._decrypt_request(textFromFileLoaded,        //file_content
                                     default_filename,
                                     batch_status);

    };

    fileReader.readAsText(fileToLoad, "UTF-8");
    if(batch_proc){
      batch_no++;
      batch_no_batch(batch_no);
    }
  }
	if(document.getElementById("fileToLoad").files.length > 1){
    batch_no_batch(0);
  } else {
		batch_no_batch(-1);
  }
}

function populate_data_div(
  data_div_id,
  data_obj,
  bootstrap_class
){

  // summarise experiments
  var experiments = data_obj.reduce(function(a,b){
    if(typeof(a[b.experiment_id]) == "undefined"){
      a[b.experiment_id] = [b];
    } else {
      a[b.experiment_id].push(b);
    }
    return a;
  },{});
  console.dir("experiments");
  console.dir(experiments);

  server_data_html = '<div class="accordion" id="accordion' + data_div_id + '">';

  Object.keys(experiments).forEach(function(experiment_name, collapse_no){
    server_data_html += '<div class="card" type="button" data-toggle="collapse" data-target="#' + data_div_id + '_' + collapse_no +'" aria-expanded="true" aria-controls="collapseOne">' +
      '<div class="card-header text-white bg-' + bootstrap_class +'">' +
        '<h5 class="mb-0">' +
          experiment_name +
        '</h5>' +
      '</div>' +
      '<div id="' + data_div_id + '_' + collapse_no +'" class="collapse" aria-labelledby="headingOne" data-parent="#accordion' + data_div_id + '">' +
        '<div class="card-body">';
          experiments[experiment_name].forEach(function(this_pp){

            var this_status = this_pp[data_div_id.replace("_data","_status")];
            if(this_status == "f"){
              var file_info = "complete";
            } else if(this_status == "e"){
              var file_info = "error occurred";
            } else if(this_status == "p"){
              var file_info = "incomplete";
            } else {
              var file_info = "unexplained error occurred, please contact your admin";
            }


            server_data_html +=
              "<div class='data_item'>" +
                "<b class='text-" + bootstrap_class + "'>" + this_pp.hashed_user_id + "</b>" +
                "<br>"+
                "<em>" +
                  this_pp.filesize +" bytes " +
                "</em>" +
                "<b class='text-" + bootstrap_class + "'>" +
                  this_pp.date +
                "</b>(" + file_info + ")" +
                "<br>" +

                "<button class='btn btn-" +
                  bootstrap_class +
                  " download_" +
                  data_div_id +
                  "_btn'>Download<span style='display:none'>" + experiment_name +
                  "_____" +
                  this_pp.hashed_user_id +
                  "_____" +
                  file_info +
                  "</span></button>" +
                "<button class='btn btn-danger delete_" + data_div_id + "_btn'>Delete<span style='display:none'>" + experiment_name + "_____" + this_pp.hashed_user_id  + "_____" + file_info + "</span></button>" +
              "</div>";

          });

    server_data_html +=     '</div>' +
                          '</div>' +
                        '</div>';
  });

  $("#" + data_div_id).html(server_data_html);
  $("#" + data_div_id).find(".collapse").on("click", function(e){
    e.preventDefault(); e.stopPropagation()
  });
  $("#" + data_div_id).find(".collapse").find("button").on("click", function(e){
    e.preventDefault(); e.stopPropagation()
  });
}

function request_data_list(){

  request_bootbox = bootbox.alert(
    "<h3 class='text-info' id='listing_data_h3'>" +
      "Your data is being listed " +
      '<span class="spinner-border text-primary" role="status" id="listing_data_spinner">' +
        '<span class="sr-only">Loading...</span>' +
      '</span>' +
    "</h3>"
  );
  var timed_out = true;
  setTimeout(function(){
    if(timed_out){
      bootbox.alert("The server doesn't seem to be responding (or is being quite slow). Please double check your server information is set up correctly. If you are using SOS servers you should be able to press the <b>Update SOS servers info</b> button in the storage panel <span class='btn btn-primary bi-server' id='bootbox_storage_btn'></span>");
      $("#bootbox_storage_btn").on("click", function(){
        $("#data_storage_logo").click();
      });
    }
  },10000);

  $.post(master_json.data.servers[$("#select_data_server").val()].registration_url,{
    email:    $("#data_user_email").val(),
    password: $("#data_user_password").val(),
    action:   "list_data"
  },function(result){
      timed_out = false;
    //try{

      var data_obj = JSON.parse(result);

      mega_data_obj.server_data_obj = data_obj.participants.filter(
        row => row.server_status !== "d"
      );

      mega_data_obj.storage_data_obj = data_obj.participants.filter(
        row => row.storage_status !== "d"
      );

      mega_data_obj.backup_data_obj = data_obj.participants.filter(
        row => row.backup_status !== "d"
      );

      var server_data_size = mega_data_obj.server_data_obj.reduce(function(a, b){
        return a + parseFloat(b["filesize"]);
      }, 0)/1000000;

      var storage_data_size = mega_data_obj.storage_data_obj.reduce(function(a, b){
        return a + parseFloat(b["filesize"]);
      }, 0)/1000000000;

      var backup_data_size = mega_data_obj.backup_data_obj.reduce(function(a, b){
        return a + parseFloat(b["filesize"]);
      }, 0)/1000000000;


      $("#used_server_space").html(server_data_size + " MB");
      $("#used_storage_space").html(storage_data_size + " GB");
      $("#used_backup_space").html(backup_data_size + " GB");

      $("#max_server_space").html(data_obj.max_server_space_mb + " MB");
      $("#max_storage_space").html(
        data_obj.max_storage_space_gb + " GB"
      );
      $("#max_backup_space").html(
        data_obj.max_storage_space_gb + " GB"
      );

      /*
      * Visualise that this has succeeded
      */
      $("#listing_data_h3").removeClass("text-info");
      $("#listing_data_h3").addClass("text-primary");
      $("#listing_data_h3").html("Process complete");
      $("#listing_data_spinner").fadeOut();
      setTimeout(function(){
        request_bootbox.modal("hide");
      },500);


      populate_data_div(
        "server_data",
        mega_data_obj.server_data_obj,
        "primary"
      );

      populate_data_div(
        "storage_data",
        mega_data_obj.storage_data_obj,
        "success"
      );

      populate_data_div(
        "backup_data",
        mega_data_obj.backup_data_obj,
        "info"
      );


      $(".delete_server_data_btn").unbind();
      $(".delete_server_data_btn").on("click",function(){
        var this_folder = $(this).find("span")[0].innerHTML;
        var data_server = $("#select_data_server").val();
        $(this).closest("div").remove();
        $.post(master_json.data.servers[data_server].registration_url,{
          email:       $("#data_user_email").val(),
          password:    $("#data_user_password").val(),
          action:      "delete_server_data",
          this_folder: this_folder
        },function(result){
          Collector.custom_alert(result);
          mega_data_obj.server_data_obj = mega_data_obj.server_data_obj.filter(
            row => row.hashed_user_id !== this_folder
          );
        });
      });
      $(".download_server_data_btn").unbind();
      $(".download_server_data_btn").on("click",function(){
        var this_folder = $(this).find("span")[0].innerHTML;
        $.post(master_json.data.servers[$("#select_data_server").val()].registration_url,{
          email:       $("#data_user_email").val(),
          password:    $("#data_user_password").val(),
          action:      "download_server_data",
          this_folder: this_folder
        },function(result){
          if(result == "verification of user and password failed"){
            bootbox.alert("verification of user and password failed");
          } else {
            var encrypted_data = JSON.parse(result);
            var listed_data = [];
            Object.keys(encrypted_data).forEach(function(row_name){
              listed_data.push(JSON.parse(encrypted_data[row_name]));
            });
            encrypt_obj.current_batch = [];
            //var textFromFileLoaded = listed_data.pop();
            for(var i = 0; i < listed_data.length; i++){
              if(i == listed_data.length - 1){
                encrypt_obj._decrypt_request(JSON.stringify(listed_data[i]),        //file_content
                                             this_folder.split("_____")[1],
                                             "none");
              } else {
                encrypt_obj._decrypt_request(JSON.stringify(listed_data[i]),        //file_content
                                             this_folder.split("_____")[1],
                                             "add");
              }
            }
          }
        });
      });
      $(".download_storage_data_btn").unbind();
      $(".download_storage_data_btn").on("click",function(){
        var this_folder = $(this).find("span")[0].innerHTML;
        $.post(master_json.data.servers[$("#select_data_server").val()].registration_url,{
          email:       $("#data_user_email").val(),
          password:    $("#data_user_password").val(),
          action:      "download_storage_data",
          this_folder: this_folder,
          storage_backup: "storage"
        },function(result){
          console.dir(result);
          var encrypted_data = JSON.parse(result);
          var listed_data = [];
          Object.keys(encrypted_data).forEach(function(row_name){
            Object.keys(encrypted_data[row_name]).forEach(function(trial_row){
              listed_data.push(JSON.parse(encrypted_data[row_name][trial_row]));
            });
          });

          encrypt_obj.current_batch = [];                                         // reset the current batch
          for(var i = 0; i < listed_data.length; i++){
            if(i == listed_data.length - 1){
              encrypt_obj._decrypt_request(JSON.stringify(listed_data[i]),        //file_content
                                           this_folder.split("_____")[1],
                                           "none");
            } else {
              encrypt_obj._decrypt_request(JSON.stringify(listed_data[i]),        //file_content
                                           this_folder.split("_____")[1],
                                           "add");
            }
          }
        });
      });
      $(".delete_storage_data_btn").unbind();
      $(".delete_storage_data_btn").on("click",function(){
        $(this).closest("div").remove();
        var this_folder = $(this).find("span")[0].innerHTML;
        $.post(master_json.data.servers[$("#select_data_server").val()].registration_url,{
          email:       $("#data_user_email").val(),
          password:    $("#data_user_password").val(),
          action:      "delete_storage_data",
          this_folder: this_folder,
          storage_backup: "storage"
        },function(result){
          Collector.custom_alert(result);
          //$("#list_data_btn").click();
        });
      });


      /*
      * Backup data buttons
      */
      $(".download_backup_data_btn").unbind();
      $(".download_backup_data_btn").on("click",function(){
        var this_folder = $(this).find("span")[0].innerHTML;
        $.post(master_json.data.servers[$("#select_data_server").val()].registration_url,{
          email:       $("#data_user_email").val(),
          password:    $("#data_user_password").val(),
          action:      "download_storage_data",
          this_folder: this_folder,
          storage_backup: "backup"
        },function(result){
          console.dir(result);
          var encrypted_data = JSON.parse(result);
          var listed_data = [];
          Object.keys(encrypted_data).forEach(function(row_name){
            Object.keys(encrypted_data[row_name]).forEach(function(trial_row){
              listed_data.push(JSON.parse(encrypted_data[row_name][trial_row]));
            });
          });

          // reset the current batch
          encrypt_obj.current_batch = [];
          for(var i = 0; i < listed_data.length; i++){
            if(i == listed_data.length - 1){
              encrypt_obj._decrypt_request(JSON.stringify(listed_data[i]),        //file_content
                                           this_folder.split("_____")[1],
                                           "none");
            } else {
              encrypt_obj._decrypt_request(JSON.stringify(listed_data[i]),        //file_content
                                           this_folder.split("_____")[1],
                                           "add");
            }
          }
        });
      });
      $(".delete_backup_data_btn").unbind();
      $(".delete_backup_data_btn").on("click",function(){
        $(this).closest("div").remove();
        var this_folder = $(this).find("span")[0].innerHTML;
        $.post(master_json.data.servers[$("#select_data_server").val()].registration_url,{
          email:       $("#data_user_email").val(),
          password:    $("#data_user_password").val(),
          action:      "delete_storage_data",
          this_folder: this_folder,
          storage_backup: "backup"
        },function(result){
          Collector.custom_alert(result);
          //$("#list_data_btn").click();
        });
      });

    /*
    } catch(error){
      bootbox.alert("Failed to retrieve a list of your files - please double check your password and email address");
    }
    */
  });
}
