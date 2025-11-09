import json
import requests
import time

# Load your existing GeoJSON
with open("183data.geojson", "r") as f:
    data = json.load(f)

# Base URL for OpenStreetMap Nominatim geocoder
GEOCODE_URL = "https://nominatim.openstreetmap.org/search"

for feature in data["features"]:
    props = feature.get("properties", {})
    address = props.get("Address")

    # Skip features that already have geometry
    if feature.get("geometry") and feature["geometry"]["type"] == "Point":
        continue

    # Only geocode features that have an address
    if address:
        print(f"Geocoding: {address}")
        params = {"q": address + ", Berkeley, CA", "format": "json", "limit": 1}
        response = requests.get(GEOCODE_URL, params=params, headers={"User-Agent": "geojson-fixer"})
        results = response.json()

        if results:
            lat = float(results[0]["lat"])
            lon = float(results[0]["lon"])
            feature["geometry"] = {"type": "Point", "coordinates": [lon, lat]}
            print(f" → Found coords: {lon}, {lat}")
        else:
            print(f" ⚠️ No coordinates found for {address}")

        time.sleep(1)  # Be polite — Nominatim requires 1 second delay between requests

# Save new file
with open("183data_geocoded.geojson", "w") as f:
    json.dump(data, f, indent=2)

print("✅ Done! Saved as 183data_geocoded.geojson")