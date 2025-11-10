mapboxgl.accessToken = 'pk.eyJ1IjoiYW50b25pb2pwYWNoZWNvIiwiYSI6ImNtaDljaXpjeTEycmYybnEzaXdrYThnZG8ifQ.xeHV0ObSbpRUSEwukMU97g';

// Initialize the map
const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/antoniojpacheco/cmh9cnp3700as01sq5ifrb88c',
  center: [-122.27, 37.87],
  zoom: 9
});

map.on('load', function () {
  // Add GeoJSON source
  map.addSource('points-data', {
    type: 'geojson',
    data: 'https://raw.githubusercontent.com/antoniojpacheco/c183-webmap/refs/heads/main/data/183data.geojson'
  });

  // Add circle layer with hover and click styling
  map.addLayer({
    id: 'points-layer',
    type: 'circle',
    source: 'points-data',
    paint: {
      'circle-color': [
        'case',
        ['boolean', ['feature-state', 'selected'], false], '#0f0', // green if clicked
        ['boolean', ['feature-state', 'hover'], false], '#f00',     // red on hover
        '#4264FB'                                                   // default
      ],
      'circle-radius': [
        'case',
        ['boolean', ['feature-state', 'hover'], false], 10, // bigger on hover
        6                                                 // default
      ],
      'circle-stroke-width': 2,
      'circle-stroke-color': '#ffffff'
    }
  });

  // Track hover and selection states
  let hoveredId = null;
  let selectedId = null;

  // -----------------------------
  // Hover effect
  // -----------------------------
  map.on('mousemove', 'points-layer', (e) => {
    map.getCanvas().style.cursor = 'pointer';

    if (e.features.length > 0) {
      // Reset previous hover if not selected
      if (hoveredId !== null && hoveredId !== selectedId) {
        map.setFeatureState(
          { source: 'points-data', id: hoveredId },
          { hover: false }
        );
      }

      hoveredId = e.features[0].id;

      // Apply hover state if not selected
      if (hoveredId !== selectedId) {
        map.setFeatureState(
          { source: 'points-data', id: hoveredId },
          { hover: true }
        );
      }
    }
  });

  map.on('mouseleave', 'points-layer', () => {
    map.getCanvas().style.cursor = '';
    if (hoveredId !== null && hoveredId !== selectedId) {
      map.setFeatureState(
        { source: 'points-data', id: hoveredId },
        { hover: false }
      );
    }
    hoveredId = null;
  });

  // -----------------------------
  // Click effect + popup
  // -----------------------------
  map.on('click', 'points-layer', (e) => {
    const feature = e.features[0];
    const coordinates = feature.geometry.coordinates.slice();
    const properties = feature.properties;

    // Deselect previous
    if (selectedId !== null) {
      map.setFeatureState(
        { source: 'points-data', id: selectedId },
        { selected: false }
      );
    }

    // Select clicked feature
    selectedId = feature.id;
    map.setFeatureState(
      { source: 'points-data', id: selectedId },
      { selected: true }
    );

    // Build popup content
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

    // Show popup
    new mapboxgl.Popup()
      .setLngLat(coordinates)
      .setHTML(popupContent)
      .addTo(map);
  });
});
