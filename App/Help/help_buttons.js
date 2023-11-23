   /* Buttons for cycling through "general tips"
  ********************************************* */
  // First we create some empty variables outside a fuction to ensure they are accessible throughout
  var tipNum;
  var count;
  var oldTip;

  $('#prevTip, #nextTip').prop('disabled', true);

  // Then we work out how long the list of help options is and capture which one is currently showing - the associated integers are then stored in our previous variables
  // Note: this is delayed due to the need to wait for the html compenents earlier to exist before we can capture them
  setTimeout(() => {
    count = $("#generalTips .general_tip").length;
    $('#prevTip, #nextTip').prop('disabled', false);
    setTimeout(() => {
      for (let i = 0; i <= count; i++) {
        // if ($('.tip'+i).is(":visible")) {
          if ($('.tip'+i).css("display") == "block") {
          tipNum = i;
        }
      }
      count = count - 1
      oldTip = tipNum
    }, 500);
  }, 1500);

  // If a user presses "Next" this checks if we're at the end (and restarts the loop if we are) or moves us 1 place up the list
  $('#nextTip').click(function() {
    if (tipNum === count) {
      $(".tip" + count).hide()
      $(".tip0").show()
      tipNum = 0;
    } else if (tipNum < count)  {
      oldTip = tipNum;
      $(".tip" + oldTip).hide()
      oldTip = tipNum;  
      tipNum = tipNum + 1;
      $(".tip" + tipNum).show()
    }
  });
  
  // If a user presses "Previous" this checks if we're at the start (and moves us to the end of the loop if we are) or moves us 1 place down the list
  $('#prevTip').click(function() {
    if (tipNum === 0) {
      $(".tip" + count).show()
      $(".tip0").hide()
      tipNum = count;
    } else if (tipNum <= count)  {
      oldTip = tipNum;
      $(".tip" + oldTip).hide()
      tipNum = tipNum - 1;
      $(".tip" + tipNum).show()
    }
  });

  // If you want to add more help items into this list - they go in "../Help/MainHelp.json"