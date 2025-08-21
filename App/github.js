/*
 * Hide github dialog if user presses escape
 */
document.onkeydown = function (evt) {
  evt = evt || window.event;
  var isEscape = false;
  if ("key" in evt) {
    isEscape = evt.key === "Escape" || evt.key === "Esc";
  } else {
    isEscape = evt.keyCode === 27;
  }
  if (isEscape) {
    $("#github_dialog").fadeOut();
  }
};


$("#fadeout_github").on("click", function () {
  if ($("#select_repo").val() == "select a repository") {
    $("#select_repo").val(user.current.repo);
  }
  $("#github_dialog").fadeOut();
});

$("#find_repo_btn").on("click", function () {
  //resume here
  var response = CElectron.open_folder("repo", "");
  console.dir(response);
});