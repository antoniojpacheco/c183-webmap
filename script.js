mapboxgl.accessToken = 'pk.eyJ1IjoiYW50b25pb2pwYWNoZWNvIiwiYSI6ImNtaDljaXpjeTEycmYybnEzaXdrYThnZG8ifQ.xeHV0ObSbpRUSEwukMU97g';

// Initialize map
const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/antoniojpacheco/cmh9cnp3700as01sq5ifrb88c',
  center: [-122.27, 37.87],
  zoom: 9
});

map.on('load', async function () {
  // Fetch and preprocess GeoJSON
  const response = await fetch('https://raw.githubusercontent.com/antoniojpacheco/c183-webmap/refs/heads/main/data/183data.geojson');
  const geojson = await response.json();

  // Add unique IDs + extract year
  geojson.features.forEach((f, i) => {
    f.id = i;
    const match = f.properties["Architect + Date"].match(/\d{4}/);
    f.properties.year = match ? parseInt(match[0]) : 0;
  });

  // Add GeoJSON source
  map.addSource('points-data', {
    type: 'geojson',
    data: geojson
  });

  // Add circle layer
  map.addLayer({
    id: 'points-layer',
    type: 'circle',
    source: 'points-data',
    paint: {
      'circle-color': [
        'case',
        ['boolean', ['feature-state', 'selected'], false], '#0f0',
        ['boolean', ['feature-state', 'hover'], false], '#f00',
        '#4264FB'
      ],
      'circle-radius': [
        'case',
        ['boolean', ['feature-state', 'hover'], false], 10,
        6
      ],
      'circle-stroke-width': 2,
      'circle-stroke-color': '#ffffff'
    }
  });

  let hoveredId = null;
  let selectedId = null;

  // Hover effect
  map.on('mousemove', 'points-layer', (e) => {
    map.getCanvas().style.cursor = 'pointer';
    if (e.features.length > 0) {
      if (hoveredId !== null && hoveredId !== selectedId) {
        map.setFeatureState({ source: 'points-data', id: hoveredId }, { hover: false });
      }
      hoveredId = e.features[0].id;
      if (hoveredId !== selectedId) {
        map.setFeatureState({ source: 'points-data', id: hoveredId }, { hover: true });
      }
    }
  });

  map.on('mouseleave', 'points-layer', () => {
    map.getCanvas().style.cursor = '';
    if (hoveredId !== null && hoveredId !== selectedId) {
      map.setFeatureState({ source: 'points-data', id: hoveredId }, { hover: false });
    }
    hoveredId = null;
  });

  // Click effect + popup
  map.on('click', 'points-layer', (e) => {
    const feature = e.features[0];
    const coordinates = feature.geometry.coordinates.slice();
    const properties = feature.properties;

    // Deselect previous
    if (selectedId !== null) {
      map.setFeatureState({ source: 'points-data', id: selectedId }, { selected: false });
    }

    selectedId = feature.id;
    map.setFeatureState({ source: 'points-data', id: selectedId }, { selected: true });

    // Popup
    const popupContent = `
      <div>
        <h3>${properties.Landmark}</h3>
        <p><strong>Address:</strong> ${properties.Address}</p>
        <p><strong>Architect & Date:</strong> ${properties["Architect + Date"]}</p>
        <p><strong>Designated:</strong> ${properties.Designated}</p>
        ${properties.Link ? `<p><a href="${properties.Link}" target="_blank">More Information</a></p>` : ''}
        ${properties.Notes ? `<p><strong>Notes:</strong> ${properties.Notes}</p>` : ''}
      </div>
    `;

    new mapboxgl.Popup()
      .setLngLat(coordinates)
      .setHTML(popupContent)
      .addTo(map);
  });

  // ------------------------------------------
  // TIMELINE SLIDER FILTER
  // ------------------------------------------
  const slider = document.getElementById('yearRange');
  const yearValue = document.getElementById('yearValue');

  // Initialize display
  yearValue.textContent = slider.value;

  slider.addEventListener('input', (e) => {
    const year = parseInt(e.target.value);
    yearValue.textContent = year;

    // Filter landmarks built before or in the selected year
    map.setFilter('points-layer', ['<=', ['get', 'year'], year]);
  });
});
