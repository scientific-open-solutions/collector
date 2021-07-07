/*
* can I remove the "run" const?
*/
window.$  = require("../App/libraries/jquery.min.js");
const run = require('../App/Run.js');

/*
* clean_code
*/
test('Does clean_var turn a variable to lowercase?', () => {
  expect(run.clean_var("Hi there")).toBe("hi there");
});

/*
* clean_this_condition
*/
test('Does clean_this_condition assert appropriate defaults?', () => {
  expect(
    run.clean_this_condition({
      beep: "bop"
    })
  ).toStrictEqual({
    beep:           "bop",
    buffer:         5,
    download:       "on",
    participant_id: "on"
  });
});
