"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import maplibregl from "maplibre-gl"
import { useSession } from "next-auth/react"
import type { Feature, Point } from "geojson"

import { Plus, Navigation, Search } from "lucide-react"

import UserAvatarDropdown from "@/components/avatarDropdown"
import { Button } from "@/components/ui/button"

import SettingsPanel from "@/components/settingsPopup"
import MagicLinkPopup from "@/components/loginPopup"
import CommandDeck from "@/components/commandDeck"

interface Waypoint {
  id: number
  name?: string
  latitude: number
  longitude: number
  description?: string
  addedby?: string
  addedbyuserid?: string
  verified?: boolean
  isaccessible?: boolean
  dogfriendly?: boolean
  hasbottlefiller?: boolean
  createdAt?: string
  type?: string
}


export default function WaterMap() {
  const mapContainer = useRef<HTMLDivElement | null>(null)
  const map = useRef<maplibregl.Map | null>(null)
  const popupRef = useRef<maplibregl.Popup | null>(null)
  const redMarkerRef = useRef<maplibregl.Marker | null>(null)
  const [search, setSearch] = useState("")
  const [waypoints, setWaypoints] = useState<Waypoint[]>([])
  const [mapLoaded, setMapLoaded] = useState(false)
  const [showCommandDeck, setShowCommandDeck] = useState(false)
  const { data: session, status } = useSession()
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const [matches, setMatches] = useState<Waypoint[]>([])
  const [isFocused, setIsFocused] = useState(false)
  const [selectedWaypoint, setSelectedWaypoint] = useState<Waypoint | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const router = useRouter()
  const [showAddForm, setShowAddForm] = useState(false);
  const addBubblerPopupRef = useRef<maplibregl.Popup | null>(null);

  const showAddBubblerMenu = (lngLat: maplibregl.LngLat) => {
  // Remove previous popup if it exists
  if (addBubblerPopupRef.current) {
    addBubblerPopupRef.current.remove();
    addBubblerPopupRef.current = null;
  }

  const popupContent = document.createElement("div");
  popupContent.innerHTML = `
    <button id="add-bubbler-btn" class="bg-blue-600 text-white px-3 py-1 rounded">
      Add Water Fountain
    </button>
  `;

  const popup = new maplibregl.Popup({ offset: 25, closeOnClick: true })
    .setLngLat(lngLat)
    .setDOMContent(popupContent)
    .addTo(map.current!);

  popupContent.querySelector("#add-bubbler-btn")?.addEventListener("click", () => {
    popup.remove();
    addBubblerPopupRef.current = null;
    openAddBubblerForm(lngLat);
  });

  addBubblerPopupRef.current = popup;
};

const openAddBubblerForm = (lngLat: maplibregl.LngLat) => {
    if (!session?.user) {
    alert("You must be signed in to add a water fountain.");
    return;
  }
  setSelectedWaypoint({
    id: -1,
    latitude: lngLat.lat,
    longitude: lngLat.lng,
    name: "",
    description: "",
    addedby: session?.user?.username || "",
    addedbyuserid: session?.user?.id || "",
    isaccessible: false,
    dogfriendly: false,
    hasbottlefiller: false,
    type: "fountain",
  });
  setShowAddForm(true); // opens the actual form modal
};


  useEffect(() => {
    console.log("[ WaterNearMe", process.env.NEXT_PUBLIC_VERSION,"]");

    if (map.current || !mapContainer.current) return
    console.log("Loading map data...")

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: `${process.env.NEXT_PUBLIC_TILESERVER_URL}/styles/${process.env.NEXT_PUBLIC_MAP_STYLE}/style.json`,
      center: [153.028295, -27.474188],
      zoom: 13,
    })

    const geolocateControl = new maplibregl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: true,
      showAccuracyCircle: true,
      showUserLocation: true,
    })

    map.current.addControl(new maplibregl.ScaleControl(), "bottom-left")
    map.current.addControl(geolocateControl)

    const button = document.querySelector('.maplibregl-ctrl-geolocate') as HTMLElement | null
    if (button) button.style.display = 'none'

    map.current.on("load", () => {
      setMapLoaded(true);
      console.log("Map data loaded");
    });

    map.current.on("error", (e) => console.error("[ERROR] Failed to load map data:", e))

    return () => {
      if (map.current) map.current.remove()
      map.current = null
      setMapLoaded(false)
    }
  }, [])

  // Fetch waypoints
  useEffect(() => {
    console.log("Fetching waypoints...")
    fetch("/api/waypoints")
      .then(res => res.ok ? res.json() : Promise.reject(`HTTP error! status: ${res.status}`))
      .then(setWaypoints)
      .catch(err => { console.error(err); alert("Error fetching waypoints") })
  }, [])

  // Redirect if no username
  useEffect(() => {
    if (status === "loading") return
    if (session?.user && !session.user.username) router.push("/api/settings")
  }, [session, status, router])

  useEffect(() => {
    if (!search) return setMatches([])
    setMatches(waypoints.filter(w => w.name?.toLowerCase().includes(search.toLowerCase())))
  }, [search, waypoints])

useEffect(() => {
  if (!map.current) return;

  const closePopup = () => {
    if (addBubblerPopupRef.current) {
      addBubblerPopupRef.current.remove();
      addBubblerPopupRef.current = null;
    }
  };

  map.current.on("click", closePopup);
  map.current.on("contextmenu", (e) => {
    closePopup(); // remove existing popup before showing new one
    showAddBubblerMenu(e.lngLat);
    e.originalEvent.preventDefault();
  });

  return () => {
    map.current?.off("click", closePopup);
    map.current?.off("contextmenu", showAddBubblerMenu);
  };
}, [mapLoaded]);

const submitBubbler = async () => {
  if (!selectedWaypoint || !session?.user) return;
  try {
    const res = await fetch("/api/waypoints", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...selectedWaypoint,
        addedby: session.user.username,
        addedbyuserid: session.user.id,
      }),
    });
    if (!res.ok) throw new Error("Failed to add water fountain");
    const newWaypoint = await res.json();
    setWaypoints(prev => [...prev, newWaypoint]);
    setShowAddForm(false);
  } catch (err) {
    console.error(err);
    alert("Error adding water fountain");
  }
};



  // Map markers & clusters
  useEffect(() => {
    if (!map.current || !mapLoaded || waypoints.length === 0) return
    if (map.current.getSource("waypoints")) {
      ["clusters", "cluster-count", "unclustered-point"].forEach(layer => map.current?.removeLayer(layer))
      map.current.removeSource("waypoints")
    }

    const features: Feature<Point, { id: number; name?: string; description?: string; addedby?: string }>[] =
      waypoints.map(w => ({
        type: "Feature",
        geometry: { type: "Point", coordinates: [w.longitude, w.latitude] },
        properties: { id: w.id, name: w.name, description: w.description, addedby: w.addedby },
      }))

    map.current.addSource("waypoints", { type: "geojson", data: { type: "FeatureCollection", features }, cluster: true, clusterMaxZoom: 14, clusterRadius: 50 })

    map.current.addLayer({
      id: "clusters",
      type: "circle",
      source: "waypoints",
      filter: ["has", "point_count"],
      paint: {
        "circle-color": [
          "step",
          ["get", "point_count"],
          "#3b82f6", // blue-500
          10,
          "#1d4ed8", // blue-700
          30,
          "#1e40af", // blue-800
        ],
        "circle-radius": ["step", ["get", "point_count"], 18, 100, 24, 750, 30],
        "circle-stroke-width": 2,
        "circle-stroke-color": "#ffffff",
        "circle-opacity": 0.9,
      },
    })

    map.current.addLayer({
      id: "cluster-count",
      type: "symbol",
      source: "waypoints",
      filter: ["has", "point_count"],
      layout: {
        "text-field": "{point_count_abbreviated}",
        "text-font": ["Arial Unicode MS Bold"],
        "text-size": 13,
      },
      paint: {
        "text-color": "#ffffff",
      },
    })

     map.current.addLayer({
      id: "unclustered-point",
      type: "circle",
      source: "waypoints",
      filter: ["!", ["has", "point_count"]],
      paint: {
        "circle-color": "#06b6d4", // cyan-500 for individual points
        "circle-radius": 8,
        "circle-stroke-width": 2,
        "circle-stroke-color": "#ffffff",
        "circle-opacity": 0.9,
      },
    })

    map.current.on("click", "unclustered-point", (e) => {
      const feature = e.features![0]
      const props = feature.properties as any
      const waypoint = waypoints.find((w) => w.id === props.id)
      if (waypoint) selectWaypoint(waypoint)
    })

    map.current.on("click", "clusters", async (e) => {
      const features = map.current!.queryRenderedFeatures(e.point, { layers: ["clusters"] })
      if (!features.length) return
      const clusterId = features[0].properties!.cluster_id
      const source = map.current!.getSource("waypoints") as maplibregl.GeoJSONSource
      const zoom = await source.getClusterExpansionZoom(clusterId)
      map.current!.easeTo({ center: (features[0].geometry as any).coordinates, zoom })
    })

    map.current.on("mouseenter", "clusters", () => { map.current!.getCanvas().style.cursor = "pointer" })
    map.current.on("mouseleave", "clusters", () => { map.current!.getCanvas().style.cursor = "" })
  }, [waypoints, mapLoaded])

const selectWaypoint = (w: Waypoint) => {
  if (!map.current) return
  setSelectedWaypoint(w)
  showRedMarker(w)

  if (popupRef.current) popupRef.current.remove()

  const htmlContent = `
    <div class="max-w-xs relative space-y-1 text-sm">
      <button id="close-popup" class="absolute top-0 right-0 text-gray-500 hover:text-gray-700 font-bold px-2">×</button>
      <h3 class="font-bold text-blue-600 text-lg">${w.name || "Unknown"}</h3>
      ${w.description ? `<p><strong>Description:</strong> ${w.description}</p>` : ""}
      ${w.addedby ? `<p><strong>Added by:</strong> ${w.addedby}</p>` : ""}
      ${w.addedbyuserid ? `<p><strong>Added by UserID:</strong> ${w.addedbyuserid}</p>` : ""}
      ${w.verified !== undefined ? `<p><strong>Verified:</strong> ${w.verified ? "Yes" : "No"}</p>` : ""}
      ${w.isaccessible !== undefined ? `<p><strong>Accessible:</strong> ${w.isaccessible ? "Yes" : "No"}</p>` : ""}
      ${w.dogfriendly !== undefined ? `<p><strong>Dog Friendly:</strong> ${w.dogfriendly ? "Yes" : "No"}</p>` : ""}
      ${w.hasbottlefiller !== undefined ? `<p><strong>Bottle Filler:</strong> ${w.hasbottlefiller ? "Yes" : "No"}</p>` : ""}
      ${w.createdAt ? `<p><strong>Created at:</strong> ${new Date(w.createdAt).toLocaleString()}</p>` : ""}
    </div>
  `

  popupRef.current = new maplibregl.Popup({ offset: 25, closeOnClick: false, closeButton: false })
    .setLngLat([w.longitude, w.latitude])
    .setHTML(htmlContent)
    .addTo(map.current)

  // Close button handler
  const closeBtn = document.getElementById("close-popup")
  closeBtn?.addEventListener("click", () => {
    if (popupRef.current) {
      popupRef.current.remove()
      popupRef.current = null
      setSelectedWaypoint(null)
      hideRedMarker()
    }
  })
}


  const showRedMarker = (w: Waypoint) => {
    if (!map.current) return
    if (redMarkerRef.current) redMarkerRef.current.remove()
    const el = document.createElement("div")
    el.className = "red-marker"
    el.style.cssText = `
      width: 20px; height: 20px; background-color: #ef4444;
      border: 3px solid white; border-radius: 50%;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3); cursor: pointer;
    `
    redMarkerRef.current = new maplibregl.Marker(el).setLngLat([w.longitude, w.latitude]).addTo(map.current)
  }

  const hideRedMarker = () => {
    if (redMarkerRef.current) { redMarkerRef.current.remove(); redMarkerRef.current = null }
    if (popupRef.current) { popupRef.current.remove(); popupRef.current = null }
  }
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const first = waypoints.find(w => w.name?.toLowerCase().includes(search.toLowerCase()))
    if (!first || !map.current) return
    map.current.flyTo({ center: [first.longitude, first.latitude], zoom: 16 })
    selectWaypoint(first)
  }
  return (
    <div className="relative w-screen h-screen bg-gray-50">
      <div ref={mapContainer} className="absolute inset-0 w-full h-full" />
      
      {/* Search */}
      <form onSubmit={handleSearchSubmit} className="absolute top-5 left-5 z-20 w-full max-w-sm">
        <div className="relative">
          <input
            type="text"
            placeholder="Search for water fountains..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 150)}
            className="w-full border-none focus:outline-none text-base placeholder-gray-600 bg-white rounded-full shadow-md px-5 py-3"
          />
          <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
            <Search className="w-5 h-5" />
          </button>

          {matches.length > 0 && isFocused && (
            <div className="absolute top-full left-0 mt-1 w-full max-h-60 overflow-y-auto bg-white border border-gray-200 rounded-md shadow-lg z-50">
              {matches.map(w => (
                <button
                  key={w.id}
                  className="w-full text-left px-4 py-2 hover:bg-blue-100 transition-colors"
                  onMouseEnter={() => showRedMarker(w)}
                  onMouseLeave={() => {
                    if (!selectedWaypoint || selectedWaypoint.id !== w.id) hideRedMarker()
                  }}
                  onClick={() => {
                    if (!map.current) return
                    map.current.flyTo({ center: [w.longitude, w.latitude], zoom: 16 })
                    selectWaypoint(w)
                    setMatches([]); setSearch(w.name || ""); setIsFocused(false)
                  }}
                >{w.name}</button>
              ))}
            </div>
          )}
        </div>
      </form>

      {/* Buttons */}
      <div className="absolute top-5 right-5 z-30 flex items-center gap-2">
        {!session ? (
          <button onClick={() => setIsPopupOpen(true)} className="px-4 py-2 bg-blue-600 text-white shadow hover:bg-blue-700 rounded-full">
            Sign In
          </button>
        ) : (
          <UserAvatarDropdown session={session} onSettingsClick={() => setShowSettings(true)} />
        )}
      </div>

      <div className="absolute right-7 bottom-10 z-10 flex flex-col gap-3">
        <Button
          size="icon"
          className="h-14 w-14 bg-blue-600 hover:bg-blue-700 shadow-lg rounded-full cursor-pointer"
          title="Contribute"
          onClick={() => setShowCommandDeck(true)}
        >
          <Plus className="w-6 h-6" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          className="h-14 w-14 bg-white shadow-lg rounded-full border-gray-200 cursor-pointer"
          title="Show my location"
          onClick={() => {
            const geolocateControl = map.current?._controls.find((c: any) => c instanceof maplibregl.GeolocateControl)
            if (geolocateControl) geolocateControl.trigger()
          }}
        >
          <Navigation className="w-5 h-5" />
        </Button>
      </div>

      {/* Popups */}
      <MagicLinkPopup isOpen={isPopupOpen} onClose={() => setIsPopupOpen(false)} />
      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}

      <CommandDeck
        isOpen={showCommandDeck}
        onClose={() => setShowCommandDeck(false)}
        onAction={(action) => {
          console.log(action)
          // TODO: handle the action
        }}
      />

   {showAddForm && selectedWaypoint && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
    <div className="bg-white rounded-lg p-6 w-96 shadow-lg space-y-4 max-h-[90vh] overflow-y-auto">
      <h2 className="text-lg font-bold">Add Water Fountain</h2>

      {/* Name */}
      <input
        type="text"
        placeholder="Name"
        className="w-full border rounded px-3 py-2"
        value={selectedWaypoint.name || ""}
        onChange={e =>
          setSelectedWaypoint(prev => prev ? { ...prev, name: e.target.value } : prev)
        }
      />

      {/* Description */}
      <textarea
        placeholder="Description"
        className="w-full border rounded px-3 py-2"
        value={selectedWaypoint.description || ""}
        onChange={e =>
          setSelectedWaypoint(prev => prev ? { ...prev, description: e.target.value } : prev)
        }
      />

      {/* Type */}
      <select
        className="w-full border rounded px-3 py-2"
        value={selectedWaypoint.type || "fountain"}
        onChange={e =>
          setSelectedWaypoint(prev => prev ? { ...prev, type: e.target.value } : prev)
        }
      >
        <option value="fountain">Fountain</option>
        <option value="bubbler">Bubbler</option>
        <option value="tap">Tap</option>
      </select>

      {/* Accessible */}
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={selectedWaypoint.isaccessible || false}
          onChange={e =>
            setSelectedWaypoint(prev => prev ? { ...prev, isaccessible: e.target.checked } : prev)
          }
        />
        Accessible
      </label>

      {/* Dog Friendly */}
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={selectedWaypoint.dogfriendly || false}
          onChange={e =>
            setSelectedWaypoint(prev => prev ? { ...prev, dogfriendly: e.target.checked } : prev)
          }
        />
        Dog Friendly
      </label>

      {/* Bottle Filler */}
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={selectedWaypoint.hasbottlefiller || false}
          onChange={e =>
            setSelectedWaypoint(prev => prev ? { ...prev, hasbottlefiller: e.target.checked } : prev)
          }
        />
        Bottle Filler
      </label>

      <div className="flex justify-end gap-2 mt-4">
        <button
          onClick={() => setShowAddForm(false)}
          className="px-4 py-2 rounded border"
        >
          Cancel
        </button>
        <button
          onClick={submitBubbler}
          disabled={!selectedWaypoint.name}
          className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
        >
          Submit
        </button>
      </div>
    </div>
  </div>
)}


    </div>
  )
}
