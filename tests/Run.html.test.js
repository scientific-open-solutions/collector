global.window = window;
global.$ = require("../App/libraries/jquery.min.js");
const fs = require("fs");
const path = require("path");
const run_html = fs.readFileSync(
  path.resolve(__dirname, "../App/Run.html"),
  "utf8"
);
const run_js = require("../App/Run.js");
//const survey_html = require('../Default/DefaultCode/survey.html');

const survey_html = fs.readFileSync(
  path.resolve(__dirname, "../testFiles/survey.html"),
  "utf8"
);
const survey_js = require("../testFiles/survey.js");

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
    document.body.innerHTML = survey_html;

    expect(howdy_value).toStrictEqual("brap");
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
