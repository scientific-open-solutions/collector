/**
 * @jest-environment jsdom
 */

global.window = window;
global.$ = require("../App/libraries/jquery.min.js");
//eval("../App/libraries/bootbox.min.js");
const fs = require("fs");
const path = require("path");
Papa = require("../App/libraries/papaparse.min.js");
const Collector = require("../App/libraries/collector/Collector.js");
const run_html = fs.readFileSync(
  path.resolve(__dirname, "../App/Run.html"),
  "utf8"
);
const run_js = require("../App/Run.js");
const survey_js = require("../Default/DefaultPhaseTypes/survey.js");

String.prototype.replaceAll = function (str1, str2, ignore) {
  return this.replace(
    new RegExp(
      str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g, "\\$&"),
      ignore ? "gi" : "g"
    ),
    typeof str2 === "string" ? str2.replace(/\$/g, "$$$$") : str2
  );
};


var survey_html = fs.readFileSync(
  path.resolve(
    __dirname,
    "../Default/DefaultPhaseTypes/survey.html"
  ),
  "utf8"
);

/*
test('the data is peanut butter', done => {
  function callback(data) {
    try {
      expect(data).toBe('peanut butter');
      done();
    } catch (error) {
      done(error);
    }
  }

  fetchData(callback);
});


jest
  .dontMock('fs');

/*
test('displays a user after a click', () => {
  // Set up our document body
  document.body.innerHTML =
    '<div>' +
    '  <span id="username" />' +
    '  <button id="button" />' +
    '</div>';

  // This module has a side-effect
  require('../displayUser');

  const $ = require('jquery');
  const fetchCurrentUser = require('../fetchCurrentUser');

  // Tell the fetchCurrentUser mock function to automatically invoke
  // its callback with some data
  fetchCurrentUser.mockImplementation(cb => {
    cb({
      fullName: 'Johnny Cash',
      loggedIn: true,
    });
  });

  // Use jquery to emulate a click on our button
  $('#button').click();

  // Assert that the fetchCurrentUser function was called, and that the
  // #username span's inner text was updated as we'd expect it to.
  expect(fetchCurrentUser).toBeCalled();
  expect($('#username').text()).toEqual('Johnny Cash - Logged In');
});
*/
describe("Running projects", function () {
  beforeEach(() => {
    //document.body.innerHTML = run_html; //.toString()
  });

  afterEach(() => {
    // restore the original func after test
    jest.resetModules();
  });

  it("Checking aq scoring", function () {
    // global.window = window;

    var aq_survey = fs.readFileSync(
      path.resolve(
        __dirname,
        "../Default/DefaultSurveys/autism_quotient.csv"
      ),
      "utf8"
    );

    aq_survey = Papa.parse(aq_survey,{
      beforeFirstChunk: function(chunk) {
        var rows = chunk.split( /\r\n|\r|\n/ );
        var headings = rows[0].toLowerCase();
        rows[0] = headings;
        return rows.join("\r\n");
      },
      header:true,
      skipEmptyLines:true
    }).data;

    document.body.innerHTML = survey_html;
    $("#survey_outline").html("hi");

    survey_js.load_survey(aq_survey, "survey_outline");

    var test_value = $('#likert_1_0').val();
    expect(test_value).toStrictEqual("0");

    /*
    * click on a range of AQ responses and then check the expected score with the actual score
    */

    



        /*
        var survey_js = fs.readFileSync(
          path.resolve(
            __dirname,
            "../Default/DefaultPhaseTypes/survey.js"
          ),
          "utf8"
        )

          .replace("{{survey}}", Collector.PapaParsed(aq_survey))
          .replaceAll("bootbox.alert", "console.log");
        */


        //survey_js.load_survey(aq_survey);

    /*
    * load AQ specifically
    */

    /*
    * Click on a series of responses
    */



    /*
      var test_value = $('#proc_button').val();
      expect(test_value).toStrictEqual("Understood");
      /*
      expect(
        run_js.clean_this_condition({
          beep: "bop"
        })
      ).toStrictEqual({
        beep:           "bop",
        buffer:         5,
        download:       "on",
        participant_id: "on"
      });


        expect(document.getElementById('post_welcome')).toBeTruthy();
        */
  });
});
