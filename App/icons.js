  // This adds the custom icons to buttons
  
function nav_bar_icons() {
  console.log("nav bar icons loaded")

  // ZOOM LEVEL ICON
  var zoom_svg = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" style="margin-right: 5px; transform: translateY(-2px);" fill="#ffffff"><path d="M19.435,17.039l-4.554-4.555c0.774-1.232,1.223-2.688,1.223-4.251c0-4.421-3.584-8.004-8.004-8.004 S0.096,3.813,0.096,8.233c0,4.421,3.583,8.004,8.004,8.004c1.701,0,3.276-0.532,4.572-1.435l4.5,4.5 c0.313,0.312,0.723,0.468,1.132,0.468c0.41,0,0.819-0.156,1.133-0.468C20.061,18.677,20.061,17.664,19.435,17.039z M8.1,13.644c-2.988,0-5.41-2.422-5.41-5.41S5.112,2.823,8.1,2.823c2.988,0,5.41,2.422,5.41,5.411S11.088,13.644,8.1,13.644z"/></svg>`;

  var $button = $('#zoomLevel_btn');
  var buttonText = $button.contents().filter(function() {
    return this.nodeType === 3; // Node.TEXT_NODE
  }).text();

  // Clear the text nodes to prevent duplication
  $button.contents().filter(function() {
    return this.nodeType === 3; // Node.TEXT_NODE
  }).remove();

  var wrappedText = $('<span>').addClass('content_name').text(buttonText);

  // Add the SVG and the wrapped text
  $button.prepend(zoom_svg + ' ').append(wrappedText);

  // RECAP ICON
  $('#top_tab_RedCap').prepend('<svg id="Redcap-icon" xmlns="http://www.w3.org/2000/svg" width="35" height="22" viewBox="0 0 15 10.601" style="transform: translate(-5px, -1px);">'+
  '<path fill="#ffffff" d="m.585,9.633c.985.647,2.508-.202,3.425-.919.488.251,1.05.553,1.716.919,1.409.776,3.094,1.317,4.589.703,1.35-.551,1.955-1.793,2.14-2.276.541.101,1.657.23'+
  '4,2.14-.028.052-.026.091-.073.11-.129,1.022-2.974-.708-6.148-3.657-6.959.04-.462-.279-.837-.701-.902l-.18-.03c-.443-.07-.856.216-.952.64-.005,0-.806-.098-.832-.103-1.91-.239-'+
  '3.715.919-4.294,2.754l-.827,2.625c-.884.483-2.039,1.111-2.103,1.151,0,0-.002,0-.005.002-1.081.72-1.662,1.831-.57,2.553ZM8.186,1c-.895.488-1.58,1.303-1.896,2.304l-.755,2.388c'+
  '-.537-.007-1.207.012-1.737.094l.738-2.344c.497-1.575,2.016-2.581,3.65-2.442Zm3.427.647c2.299,1.027,3.443,3.617,2.684,5.998-.18.052-.698.143-1.685-.033.455-2.051.094-4.175-.'+
  '998-5.965ZM1.895,7.209l1.636-.893c2.768-.476,7.158.635,8.487,1.573-.347.863-.999,1.653-1.882,2.014-1.123.459-2.531.23-4.186-.682-1.088-.598-2.899-1.577-4.055-2.011Z"/></svg>');
}



// function add_items_icons() {

// }