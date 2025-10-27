mapboxgl.accessToken = 'pk.eyJ1IjoiYW50b25pb2pwYWNoZWNvIiwiYSI6ImNtaDljaXpjeTEycmYybnEzaXdrYThnZG8ifQ.xeHV0ObSbpRUSEwukMU97g';
const map = new mapboxgl.Map({
  container: 'map', // container ID
  style: 'mapbox://styles/antoniojpacheco/cmh9cnp3700as01sq5ifrb88c', // your Style URL goes here
  center: [-122.27, 37.87], // starting position [lng, lat]. Note that lat must be set between -90 and 90
  zoom: 9 // starting zoom
    });