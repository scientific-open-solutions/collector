function load_default_surveys(){
  var default_survey_files = [
    "autism_quotient.csv",
    "consent_sheet_uor.csv",
    "demographics.csv",
    "empathy_quotient_40.csv",
    "info_sheet.csv",
    "info_sheet_uor.csv"
  ];

  function load_survey(list){
    if(list.length > 0){
      var this_survey = list.pop();
      $.get(collector_map[this_survey],function(survey_content){
        master.surveys.default_surveys[this_survey.toLowerCase()] = Papa.parse(survey_content).data;
        load_survey(list);
      });
    } else {
      //based on solution by "dule" at https://stackoverflow.com/questions/740195/adding-options-to-a-select-using-jquery
      default_surveys_list = Object.keys(master.surveys.default_surveys).sort();
      $.each(default_surveys_list, function (i, item) {
        $('#survey_select').append($('<option>', {
          value: "default|" + item , //.value,
          text : item, //.text
        }));
      });
    }
  }
  switch(Collector.detect_context()){
    case "localhost":
      default_survey_files.forEach(function(default_survey){
        survey_content = Collector.electron.fs.read_default(
          "Surveys",
          default_survey
        );
        master.surveys.default_surveys[default_survey] = Papa.parse(survey_content).data;
        $('#survey_select').append($('<option>', {
          value: "default|" + default_survey , //.value,
          text : default_survey, //.text
        }));
      });
      break;
    default:
      load_survey(default_survey_files);
      break;
  }
}

/*
* Survey functions
*/
function create_survey_HoT(this_survey){
  var container = document.getElementById('survey_HoT');
	$("#survey_HoT").html("");
  survey_HoT = new Handsontable(container, {
		data: this_survey,
		minSpareCols: 1,
		minSpareRows: 1,
		rowHeaders: false,
		colHeaders: false,
		contextMenu: {
			items: {
				"about": { // Own custom option
					name: function () { // `name` can be a string or a function
						return '<b>Edit cell</b>'; // Name can contain HTML
					},
					hidden: function () { // `hidden` can be a boolean or a function
						// Hide the option when the first column was clicked
						return this.getSelectedLast()[0] == 0; // `this` === hot3
					},
					callback: function(key, selection, clickEvent) { // Callback for specific option
						this_sheet = this;
						$('#cell_editor_div').fadeIn();
            this_selection = selection;

						cell_editor.setValue(
              this_sheet.getDataAtCell(
                selection.start.row,
                selection.start.col
              ),-1);

						if($("#help_content").is(":visible")){
							var helper_width = parseFloat($("#help_content").css("width").replace("px",""));

							$("#cell_editor_div").animate({
								"width": window.innerWidth - helper_width
							}, 500,function(){
								cell_editor.resize();
							});
						} else {
							$("#cell_editor_div").animate({
								"width": window.innerWidth
							}, 500,function(){
								cell_editor.resize();
							});
						}
					}
				},
				"---------": {
					name: '---------'
				},
				"row_above": {
					name: 'Insert row above'
				},
        "row_below": {
					name: 'Insert row below'
				},
				"col_left": {
					name: 'Insert column left'
				},
				"col_right": {
					name: 'Insert column right'
				},
				"remove_row": {
					name: 'Remove row'
				},
				"remove_col": {
					name: 'Remove column'
				},
				"undo": {
					name: 'Undo'
				},
				"redo": {
					name: 'Redo'
				},
				"make_read_only": {
					name: 'Read only'
				},
				"alignment": {
					name: 'Alignment'
				},
			}
		},
		colWidths:100,
		rowHeights: 1,
		wordWrap: false,
		observeChanges: true,
		afterSelectionEnd: function(){
			thisCellValue = this.getValue();

			//clearTimeout(disable_cell_timeout);
			var coords        = this.getSelected();
			var column        = this.getDataAtCell(0,coords[1]);
			var thisCellValue = this.getDataAtCell(coords[0],coords[1]);
			thisCellValue = thisCellValue == null ? thisCellValue = "" : thisCellValue;
			column        = column        == null ? column        = "" : column;

			helperActivate(column, thisCellValue,"survey");
		},
		afterChange: function(){

			/*
			* Check if they have just made a change to a default survey
			*/

			var current_survey = $("#survey_select").val()
																							.split("|")[1];

			if(typeof(master.surveys.default_surveys[current_survey]) !== "undefined"){
				Collector.custom_alert("These changes will not be saved, as you are editing a <b>default</b> survey. Please click <b>New Survey</b> to create a new survey");
			}

      var middleColEmpty = 0;
			var middleRowEmpty = 0;
			var postEmptyCol   = 0;
			var postEmptyRow   = 0;

			for (var k = 0; k < this.countCols()-1; k++){
        if(this.getDataAtCell(0,k).toLowerCase() == "shuffle"){
          this.setDataAtCell(0,k,"shuffle_question");
        }

        //Removing Empty middle columns
				if (this.isEmptyCol(k)){
						if (middleColEmpty==0){
								middleColEmpty=1;
						}
				}
				if (!this.isEmptyCol(k) & middleColEmpty==1){
						postEmptyCol =1;
            //delete column that is empty
						this.alter("remove_col",k-1);
						middleColEmpty=0;
				}
			}

			//Same thing for rows
			for (var k=0; k<this.countRows()-1; k++){
				if (this.isEmptyRow(k)){
					if (middleRowEmpty==0){
						middleRowEmpty=1;
					}
				}
				if (!this.isEmptyRow(k) & middleRowEmpty==1){
					postEmptyRow =1;
					this.alter("remove_row",k-1);
					middleRowEmpty=0;
				}
			}
			if(postEmptyCol != 1 ){
				while(this.countEmptyCols()>1){
					this.alter("remove_col",this.countCols);
				}
			}
			if(postEmptyRow != 1){
				while(this.countEmptyRows()>1){
					this.alter("remove_row",this.countRows);
				}
			}
		}
	});
  preview_survey(this_survey);
}

function list_surveys(){
  try{
    $("#survey_select").empty();
    $("#survey_select").append(
      "<option disabled>Select a survey</option>"
    );
    $("#survey_select").val("Select a survey");

    if(typeof(master.surveys) == "undefined" ||
      typeof(master.surveys.user_surveys) == "undefined"){
      master.surveys = {
        preview         : false,
        user_surveys    : {}
      }
    }
    master.surveys = typeof(master.surveys) == "undefined" ? {} : master.surveys;
    master.surveys.default_surveys = {};

    master.surveys.user_surveys = typeof(master.surveys.user_surveys) == "undefined" ? {} : master.surveys.user_surveys;
    master.surveys.default_surveys = Collector.clean_obj_keys(master.surveys.default_surveys);

    var def_survey_list  = Object.keys(master.surveys.default_surveys).sort();
    var user_survey_list = Object.keys(master.surveys.user_surveys).sort();

    load_default_surveys();
    user_survey_list.forEach(function(user_survey){
      $("#survey_select").append($("<option>",{
        text:user_survey,
        value:"user|" + user_survey,
        class:"bg-white text-dark"
      }));
    });
    Collector.tests.pass("surveys", "list");

  } catch(error){
    /* muting this error for now

    Collector.tests.fail("surveys",
                         "list",
                         error);
                         */
  }
}

function preview_survey(this_survey){
  master.surveys.preview = true;
	$("#survey_preview").css("height",window.innerHeight - 100)
	if($("#help_content").is(":visible")){
		var helper_width = parseFloat($("#help_content").css("width").replace("px",""));

		if($("#help_content").is(":visible")){
			var helper_width = parseFloat($("#help_content").css("width").replace("px",""));

			$("#survey_preview").animate({
				"width": window.innerWidth - helper_width
			}, 500,function(){
				cell_editor.resize();
			});
		} else {
			$("#survey_preview").animate({
				"width": window.innerWidth
			}, 500,function(){
				cell_editor.resize();
			});
		}


	} else {
		$("#survey_preview").css("width",window.innerWidth);
	}

  survey_template = Collector.electron.fs.read_default(
    "Code",
    "survey.html"
  );
  survey_template = survey_template.replace(
    '"{{survey}}"',
    JSON.stringify(
      this_survey
    )
  );

  doc = document.getElementById('survey_preview')
    .contentWindow
    .document;
	doc.open();
	doc.write('<scr' + 'ipt src="libraries/jquery-3.6.0.min.js"></scr' + 'ipt>' +
	'<scr' + 'ipt src= "libraries/bootstrap-5.0.1-dist/js/bootstrap.min.js"></scr' + 'ipt>' +
	'<scr' + 'ipt src= "libraries/bootbox.5.4.min.js"></scr' + 'ipt>' +
	'<scr' + 'ipt src= "libraries/popper.min.js"></scr' + 'ipt>' +
	'<lin' + 'k rel="stylesheet" type="text/css" href="libraries/bootstrap-5.0.1-dist/css/bootstrap.min.css">' +
	'<lin' + 'k rel="stylesheet" type="text/css" href="libraries/bootbox.fix.css">' +
	'<scr' + 'ipt src= "libraries/papaparse.4.3.6.min.js"></scr' + 'ipt>' +	survey_template);

}
