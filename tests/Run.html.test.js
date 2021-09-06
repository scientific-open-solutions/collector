/**
 * @jest-environment jsdom
 */

global.window = window;
global.$ = require("../App/libraries/jquery.min.js");
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
  path.resolve(__dirname, "../Default/DefaultPhaseTypes/survey.html"),
  "utf8"
);

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
      path.resolve(__dirname, "../Default/DefaultSurveys/autism_quotient.csv"),
      "utf8"
    );

    aq_survey = Papa.parse(aq_survey, {
      beforeFirstChunk: function (chunk) {
        var rows = chunk.split(/\r\n|\r|\n/);
        var headings = rows[0].toLowerCase();
        rows[0] = headings;
        return rows.join("\r\n");
      },
      header: true,
      skipEmptyLines: true,
    }).data;

    document.body.innerHTML = survey_html;
    $("#survey_outline").html("hi");

    survey_js.load_survey(aq_survey, "survey_outline");

    /*
     * click on a range of AQ responses and then check the expected score with the actual score
     */

    $("#likert_1_0").click();
    $("#likert_2_3").click();
    $("#likert_3_1").click();
    $("#likert_4_3").click();
    $("#likert_5_2").click();
    $("#likert_6_1").click();
    $("#likert_7_0").click();
    $("#likert_8_1").click();
    $("#likert_9_1").click();
    $("#likert_10_3").click();
    $("#likert_11_2").click();
    $("#likert_12_1").click();
    $("#likert_13_0").click();
    $("#likert_14_1").click();
    $("#likert_15_2").click();
    $("#likert_16_3").click();
    $("#likert_17_2").click();
    $("#likert_18_1").click();
    $("#likert_19_0").click();
    $("#likert_20_1").click();
    $("#likert_21_2").click();
    $("#likert_22_3").click();
    $("#likert_23_2").click();
    $("#likert_24_1").click();
    $("#likert_25_0").click();
    $("#likert_26_1").click();
    $("#likert_27_2").click();
    $("#likert_28_3").click();
    $("#likert_29_2").click();
    $("#likert_30_1").click();
    $("#likert_31_0").click();
    $("#likert_32_1").click();
    $("#likert_33_2").click();
    $("#likert_34_3").click();
    $("#likert_35_2").click();
    $("#likert_36_1").click();
    $("#likert_37_0").click();
    $("#likert_38_1").click();
    $("#likert_39_2").click();
    $("#likert_40_1").click();
    $("#likert_41_2").click();
    $("#likert_42_1").click();
    $("#likert_43_0").click();
    $("#likert_44_1").click();
    $("#likert_45_2").click();
    $("#likert_46_3").click();
    $("#likert_47_2").click();
    $("#likert_48_1").click();
    $("#likert_49_0").click();
    $("#likert_50_1").click();

    var aq_total = $("input[name=score_aq_test]").val();
    expect(aq_total).toStrictEqual("20");

    var soc_sk_total = $("input[name=score_social_skill]").val();
    expect(soc_sk_total).toStrictEqual("4");

    var as_total = $("input[name=score_attention_switching]").val();
    expect(as_total).toStrictEqual("3");

    var com_total = $("input[name=score_communication]").val();
    expect(com_total).toStrictEqual("5");

    var imag_total = $("input[name=score_imagination]").val();
    expect(imag_total).toStrictEqual("2");

    var ad_total = $("input[name=score_attention_to_detail]").val();
    expect(ad_total).toStrictEqual("6");
  });
});
