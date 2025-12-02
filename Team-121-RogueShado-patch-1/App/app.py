import sys
import os
import json
import requests
from math import radians, sin, cos, sqrt, atan2
from PyQt5.QtWidgets import QApplication, QWidget, QVBoxLayout, QMessageBox
from PyQt5.QtWebEngineWidgets import QWebEngineView
from PyQt5.QtWebChannel import QWebChannel
from PyQt5.QtCore import pyqtSlot, QObject

data_path = os.path.join('data', 'shelters.json')
os.makedirs('data', exist_ok=True)

default_data = [
    {"name": "Father Joe's Village", "lat": 32.7106, "lon": -117.1570, "category": "Shelter",
     "address": "1501 Imperial Ave, San Diego, CA", "open_times": "24/7", "reviews": "4.8/5"},
    {"name": "San Diego Rescue Mission", "lat": 32.7174, "lon": -117.1650, "category": "Food & Shelter",
     "address": "120 Elm St, San Diego, CA", "open_times": "6:00 AM - 10:00 PM", "reviews": "4.5/5"},
    {"name": "Downtown Clinic", "lat": 32.715, "lon": -117.162, "category": "Clinic",
     "address": "101 Main St, San Diego, CA", "open_times": "9:00 AM - 5:00 PM", "reviews": "4.7/5"},
    {"name": "Hope Shelter", "lat": 32.720, "lon": -117.155, "category": "Shelter",
     "address": "200 5th Ave, San Diego, CA", "open_times": "24/7", "reviews": "4.6/5"},
    {"name": "Community Health Center", "lat": 32.7135, "lon": -117.168, "category": "Clinic",
     "address": "350 Market St, San Diego, CA", "open_times": "8:00 AM - 6:00 PM", "reviews": "4.4/5"}
]

if not os.path.exists(data_path):
    with open(data_path, 'w') as f:
        json.dump(default_data, f, indent=4)

with open(data_path, 'r') as f:
    shelters = json.load(f)

def distance(lat1, lon1, lat2, lon2):
    R = 6371
    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)
    a = sin(dlat/2)**2 + cos(radians(lat1))*cos(radians(lat2))*sin(dlon/2)**2
    c = 2*atan2(sqrt(a), sqrt(1-a))
    return R*c

class Backend(QObject):
    def __init__(self, app):
        super().__init__()
        self.app = app

    @pyqtSlot()
    def pyjsDark(self):
        self.app.toggle_dark()

    @pyqtSlot()
    def pyjsEmergency(self):
        self.app.emergency_call()

    @pyqtSlot()
    def pyjsNearest(self):
        self.app.find_nearest()

    @pyqtSlot(str)
    def pyjsSearch(self, text):
        self.app.search_places(text)

    @pyqtSlot(str)
    def pyjsFilter(self, cat):
        self.app.filter_category(cat)

class MapApp(QWidget):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Nearby Help Finder")
        self.setGeometry(50, 50, 1200, 800)

        layout = QVBoxLayout(self)
        self.setLayout(layout)

        self.view = QWebEngineView()
        layout.addWidget(self.view)

        self.user_lat = 32.712
        self.user_lon = -117.160
        self.dark_mode = False
        self.selected_category = "All"
        self.search_text = ""

        self.channel = QWebChannel()
        self.backend = Backend(self)
        self.channel.registerObject("backend", self.backend)
        self.view.page().setWebChannel(self.channel)

        self.load_map()

    def load_map(self):
        shelters_js = json.dumps(shelters)
        tile_url = "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" if not self.dark_mode else "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"

        html = rf"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Nearby Help Finder</title>
            <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
            <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css"/>
            <script src="qrc:///qtwebchannel/qwebchannel.js"></script>
            <style>
                html, body {{ height:100%; margin:0; padding:0; }}
                #map {{ width:100%; height:100%; }}
                #glassPanel {{
                    position:absolute; top:20px; left:20px; background: rgba(255,255,255,0.4);
                    backdrop-filter: blur(10px); border-radius:15px; padding:15px; z-index:1000;
                }}
                button, select, input {{border:none;border-radius:8px;padding:6px 10px;margin:3px;font-size:14px;cursor:pointer;}}
                button:hover {{background-color: rgba(0,0,0,0.1);}}
                #suggestions {{
                    position:absolute; top:60px; left:25px; background: rgba(255,255,255,0.9); border-radius:8px;
                    max-height:150px; overflow-y:auto; z-index:1001; display:none;
                }}
                #suggestions div {{ padding:5px; cursor:pointer; }}
                #suggestions div:hover {{ background-color: rgba(0,0,0,0.1); }}
            </style>
        </head>
        <body>
            <div id="map"></div>
            <div id="glassPanel">
                <button onclick="pyjsNearest()">📍 Nearest</button>
                <input id="searchInput" placeholder="Search..." oninput="updateSuggestions(this.value)"/>
                <select id="categorySelect" onchange="createMarkers()">
                    <option value="All">All</option>
                    <option value="Shelter">Shelter</option>
                    <option value="Food & Shelter">Food & Shelter</option>
                    <option value="Clinic">Clinic</option>
                </select>
                <button onclick="pyjsDark()">🌙 Dark Mode</button>
                <button onclick="pyjsEmergency()">🚨 Emergency</button>
            </div>
            <div id="suggestions"></div>

            <script>
                var map = L.map('map').setView([{self.user_lat},{self.user_lon}],15);
                L.tileLayer('{tile_url}', {{maxZoom:19}}).addTo(map);
                var userMarker = L.circleMarker([{self.user_lat},{self.user_lon}],{{radius:8,color:'blue',fillColor:'blue',fillOpacity:1}}).addTo(map).bindPopup("You are here");

                var shelters = {shelters_js};
                var markers = [];
                var colorMap = {{'Shelter':'green','Food & Shelter':'orange','Clinic':'red'}};

                function createMarkers(){{
                    markers.forEach(m=>map.removeLayer(m));
                    markers = [];
                    var selectedCat = document.getElementById('categorySelect').value;
                    var searchText = document.getElementById('searchInput').value.toLowerCase();

                    shelters.forEach(function(s){{
                        var name = s.name || "Unknown";
                        var address = s.address || "N/A";
                        var category = s.category || "Shelter";
                        var open_times = s.open_times || "24/7";
                        var reviews = s.reviews || "4.8/5";

                        if(selectedCat !== 'All' && category.toLowerCase() !== selectedCat.toLowerCase()) return;
                        if(searchText && !name.toLowerCase().includes(searchText)) return;

                        var color = colorMap[category] || 'blue';
                        var popup = `<b>${{name}}</b><br>${{address}}<br>Category: ${{category}}<br>Open: ${{open_times}}<br>Reviews: ${{reviews}}`;
                        var m = L.circleMarker([s.lat,s.lon], {{radius:8,color:color,fillColor:color,fillOpacity:0.8}}).addTo(map).bindPopup(popup);
                        markers.push(m);
                    }});
                }}

                createMarkers();

                var suggestionsDiv = document.getElementById('suggestions');
                function updateSuggestions(text){{
                    createMarkers();
                    suggestionsDiv.innerHTML = '';
                    if(text.length < 1) {{ suggestionsDiv.style.display='none'; return; }}
                    var matches = shelters.filter(s=>s.name.toLowerCase().includes(text.toLowerCase()));
                    matches.forEach(function(s){{
                        var div = document.createElement('div');
                        div.innerText = s.name;
                        div.onclick = function(){{
                            map.setView([s.lat,s.lon],18);
                            suggestionsDiv.style.display='none';
                            document.getElementById('searchInput').value = s.name;
                            createMarkers();
                        }};
                        suggestionsDiv.appendChild(div);
                    }});
                    suggestionsDiv.style.display = matches.length>0?'block':'none';
                }}

                new QWebChannel(qt.webChannelTransport, function(channel){{
                    window.backend = channel.objects.backend;
                    window.pyjsDark = function(){{ backend.pyjsDark(); }};
                    window.pyjsEmergency = function(){{ backend.pyjsEmergency(); }};
                    window.pyjsNearest = function(){{ backend.pyjsNearest(); }};
                    window.pyjsSearch = function(text){{ backend.pyjsSearch(text); }};
                    window.pyjsFilter = function(cat){{ createMarkers(); }};
                }});
            </script>
        </body>
        </html>
        """
        self.view.setHtml(html)

    @pyqtSlot()
    def toggle_dark(self):
        self.dark_mode = not self.dark_mode
        self.load_map()

    @pyqtSlot()
    def emergency_call(self):
        QMessageBox.information(self, "Emergency", "Dialing 911 or local hotline...")

    @pyqtSlot()
    def find_nearest(self):
        nearest = min(shelters, key=lambda s: distance(self.user_lat,self.user_lon,s.get('lat',0),s.get('lon',0)))
        try:
            url = f"http://router.project-osrm.org/route/v1/foot/{self.user_lon},{self.user_lat};{nearest.get('lon',0)},{nearest.get('lat',0)}?overview=full&geometries=geojson"
            resp = requests.get(url).json()
            coords = [[c[1],c[0]] for c in resp["routes"][0]["geometry"]["coordinates"]]
            js_coords = json.dumps(coords)
            self.view.page().runJavaScript(f"""
                var polyline = L.polyline({js_coords}, {{color: 'blue', weight:5}}).addTo(map);
                map.fitBounds(polyline.getBounds());
            """)
        except:
            QMessageBox.warning(self, "Routing Error", "Could not calculate route.")

    @pyqtSlot(str)
    def search_places(self, text):
        self.search_text = text
        self.load_map()

    @pyqtSlot(str)
    def filter_category(self, cat):
        self.selected_category = cat
        self.load_map()

if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = MapApp()
    window.show()
    sys.exit(app.exec_())
