// MAPBOX MAP SCRIPT
mapboxgl.accessToken = mapToken; // mapToken is defined in "show.ejs" (campgrounds) in a script (bottom)
const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/outdoors-v11', // style URL
    center: campground.geometry.coordinates, // starting position [lng, lat]
    zoom: 8 // starting zoom
});

new mapboxgl.Marker()
    .setLngLat(campground.geometry.coordinates)
    .setPopup(new mapboxgl.Popup({ offset: 25 })
        .setHTML(`<h4>${campground.title}</h4><p>${campground.location}</p>`
        ))
    .addTo(map);

// Add zoom and rotation controls to the map.
const nav = new mapboxgl.NavigationControl({
    showZoom: true,
    visualizePitch: true,
    showCompass: false,
});
map.addControl(nav);