var map;
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 34.8543784, lng: -111.7951384},
    zoom: 10
  });
}