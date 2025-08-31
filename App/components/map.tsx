"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import maplibregl from "maplibre-gl"
import { signOut, useSession } from "next-auth/react"
import type { Feature, Point } from "geojson"

import {
  Plus,
  Navigation,
  Search,
} from "lucide-react"

import UserAvatarDropdown from "@/components/avatarDropdown"
import { Button } from "@/components/ui/button"
import SettingsPanel from "@/components/settingsPopup"
import MagicLinkPopup from "@/components/loginPopup"

interface Waypoint {
  id: number
  name: string
  latitude: number
  longitude: number
  description?: string
  addedby?: string
  createdAt?: string
  address?: string
  rating?: number
  reviewCount?: number
  hours?: string
  website?: string
  accessibility?: string
}

export default function WaterMap() {
  const mapContainer = useRef<HTMLDivElement | null>(null)
  const map = useRef<maplibregl.Map | null>(null)
  const [search, setSearch] = useState("")
  const [waypoints, setWaypoints] = useState<Waypoint[]>([])
  const [mapLoaded, setMapLoaded] = useState(false)
  const markersRef = useRef<maplibregl.Marker[]>([])
  const { data: session } = useSession()
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const [matches, setMatches] = useState<Waypoint[]>([])
  const [isFocused, setIsFocused] = useState(false)
  const [selectedWaypoint, setSelectedWaypoint] = useState<Waypoint | null>(null)
  const redMarkerRef = useRef<maplibregl.Marker | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (map.current || !mapContainer.current) return
    console.log("[WaterNearMe] Initializing map...")

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
    });

    map.current.addControl(new maplibregl.ScaleControl(), "bottom-left")
    map.current.addControl(geolocateControl);

    const button = document.querySelector('.maplibregl-ctrl-geolocate') as HTMLElement | null;
    if (button) button.style.display = 'none';

    map.current.on("load", () => { console.log("[WaterNearMe] Map data loaded successfully"); setMapLoaded(true) })
    map.current.on("error", (e) => { console.error("[ERROR] Failed to load map data:", e) })

    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
        setMapLoaded(false)
      }
    }
  }, [])

  useEffect(() => {
    console.log("[WaterNearMe] Fetching waypoints...")
    fetch("/api/waypoints")
      .then((res) => {
        if (!res.ok) { throw new Error(`HTTP error! status: ${res.status}`) }
        return res.json()
      })
      .then((data) => {
        console.log("Fetched waypoints:", data)
        setWaypoints(data)
      })
      .catch((error) => {
        console.error("Error fetching waypoints:", error)
        alert("Error fetching waypoints. Please try again later.")
      })
  }, [])

    useEffect(() => {
    if (status === "loading") return
    if (session?.user && !session.user.username) {
      alert("You need to set a username before using the site.")
      router.push("/api/settings")
    }
  }, [session, status, router])

  useEffect(() => {
    if (!search) {
      setMatches([])
      return
    }

    const filtered = waypoints.filter((w) => w.name?.toLowerCase().includes(search.toLowerCase()))
    setMatches(filtered)
  }, [search, waypoints])

  useEffect(() => {
    if (!map.current || !mapLoaded || waypoints.length === 0) return
    if (map.current.getSource("waypoints")) {
      map.current.removeLayer("clusters")
      map.current.removeLayer("cluster-count")
      map.current.removeLayer("unclustered-point")
      map.current.removeSource("waypoints")
    }

    const features: Feature<Point, { id: number; name?: string; description?: string; addedby?: string }>[] =
      waypoints.map((b) => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [b.longitude, b.latitude],
        },
        properties: {
          id: b.id,
          name: b.name,
          description: b.description,
          addedby: b.addedby,
        },
      }))

    map.current.addSource("waypoints", {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features,
      },
      cluster: true,
      clusterMaxZoom: 14,
      clusterRadius: 50,
    })

    // Fountain Clusters
    map.current.addLayer({
      id: "clusters",
      type: "circle",
      source: "waypoints",
      filter: ["has", "point_count"],
      paint: {
        "circle-color": "#3B82F6",
        "circle-radius": ["step", ["get", "point_count"], 15, 100, 20, 750, 25],
        "circle-stroke-width": 1,
        "circle-stroke-color": "#fff",
      },
    })

    // Fountain Cluster Label
    map.current.addLayer({
      id: "cluster-count",
      type: "symbol",
      source: "waypoints",
      filter: ["has", "point_count"],
      layout: {
        "text-field": "{point_count_abbreviated}",
        "text-font": ["Arial Unicode MS Bold"],
        "text-size": 12,
      },
    })

    // Fountain points
    map.current.addLayer({
      id: "unclustered-point",
      type: "circle",
      source: "waypoints",
      filter: ["!", ["has", "point_count"]],
      paint: {
        "circle-color": "#3B82F6",
        "circle-radius": 7,
        "circle-stroke-width": 1,
        "circle-stroke-color": "#fff",
      },
    })

    map.current.on("click", "unclustered-point", (e) => {
      const feature = e.features![0]
      const props = feature.properties as any
      const waypoint = waypoints.find((w) => w.id === props.id)
      if (waypoint) {
        setSelectedWaypoint(waypoint)
        showRedMarker(waypoint)
      }
    })

    // Zoom in on cluster click
    map.current.on("click", "clusters", async (e) => {
      const features = map.current!.queryRenderedFeatures(e.point, { layers: ["clusters"] })
      if (!features.length) return

      const clusterId = features[0].properties!.cluster_id
      const source = map.current!.getSource("waypoints") as maplibregl.GeoJSONSource

      try {
        const zoom = await source.getClusterExpansionZoom(clusterId)
        map.current!.easeTo({
          center: (features[0].geometry as any).coordinates,
          zoom,
        })
      } catch (err) {
        console.error("Error expanding cluster:", err)
      }
    })

    map.current.on("mouseenter", "clusters", () => {
      map.current!.getCanvas().style.cursor = "pointer"
    })
    map.current.on("mouseleave", "clusters", () => {
      map.current!.getCanvas().style.cursor = ""
    })
  }, [waypoints, mapLoaded])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!map.current) return
    const matches = waypoints.filter((w) => w.name?.toLowerCase().includes(search.toLowerCase()))
    const first = matches[0]
    map.current.flyTo({
      center: [first.longitude, first.latitude],
      zoom: 16,
    })
    setSelectedWaypoint(first)
    showRedMarker(first)
  }

    const showRedMarker = (waypoint: Waypoint) => {
    if (!map.current) return

    if (redMarkerRef.current) {
      redMarkerRef.current.remove()
    }

    const el = document.createElement("div")
    el.className = "red-marker"
    el.style.cssText = `
      width: 20px;
      height: 20px;
      background-color: #ef4444;
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      cursor: pointer;
    `
    redMarkerRef.current = new maplibregl.Marker(el)
      .setLngLat([waypoint.longitude, waypoint.latitude])
      .addTo(map.current)
  }

  const hideRedMarker = () => {
    if (redMarkerRef.current) {
      redMarkerRef.current.remove()
      redMarkerRef.current = null
    }
  }

  return (
    <div className="relative w-screen h-screen bg-gray-50">

      {/* Map */}
      <div
        ref={mapContainer}
        className="absolute inset-0 w-full h-full transition-all duration-300"
        style={{ minHeight: "100vh", minWidth: "100vw" }}
      />

      {/*Top left search bar*/}
      <form onSubmit={handleSearchSubmit} className="absolute top-5 left-5 z-20 w-full max-w-sm">
        <div className="relative">
          <input
            type="text"
            placeholder="Search for water fountains..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setIsFocused(true)} // Show dropdown on focus
            onBlur={() => setTimeout(() => setIsFocused(false), 150)} // Delay to allow click
            className="w-full border-none focus:outline-none text-base placeholder-gray-600 bg-white rounded-full shadow-md px-5 py-3"
          />
          <button
            type="submit"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Search"
          >
            <Search className="w-5 h-5" />
          </button>

          {matches.length > 0 && isFocused && (
            <div className="absolute top-full left-0 mt-1 w-full max-h-60 overflow-y-auto bg-white border border-gray-200 rounded-md shadow-lg z-50">
              {matches.map((w) => (
                <button
                  key={w.id}
                  className="w-full text-left px-4 py-2 hover:bg-blue-100 transition-colors"
                  onMouseEnter={() => showRedMarker(w)}
                  onMouseLeave={() => {
                    if (!selectedWaypoint || selectedWaypoint.id !== w.id) {
                      hideRedMarker()
                    }
                  }}
                  onClick={() => {
                    if (!map.current) return

                    map.current.flyTo({
                      center: [w.longitude, w.latitude],
                      zoom: 16,
                    })
                    setSelectedWaypoint(w)
                    showRedMarker(w)
                    setMatches([])
                    setSearch(w.name || "")
                    setIsFocused(false)
                  }}
                >
                  {w.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </form>
      
      {/*Top right buttons*/}
      <div className="absolute top-5 right-5 z-30 flex items-center gap-2">
        {!session ? (
          <button
            onClick={() => setIsPopupOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 transition"
          >
            Sign In
          </button>
        ) : (
          <UserAvatarDropdown
            session={session}
            onSettingsClick={() => setShowSettings(true)}
          />
        )}
      </div>

      {/*Bottom right buttons*/}
      <div className="absolute right-7 bottom-10 z-10 flex flex-col gap-3">
        <Button
          size="icon"
          className="h-14 w-14 bg-blue-600 hover:bg-blue-700 shadow-lg rounded-full"
          title="Add new water fountain"
        ><Plus className="w-6 h-6" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          className="h-14 w-14 bg-white shadow-lg rounded-full border-gray-200"
          title="Show my location"
          onClick={() => {
            const geolocateControl = map.current?._controls.find(
              (c: any) => c instanceof maplibregl.GeolocateControl
            );
            if (geolocateControl) {
              geolocateControl.trigger();
            }
          }}
        ><Navigation className="w-5 h-5" />
        </Button>
      </div>
      
      {/* Popups */}
      <MagicLinkPopup isOpen={isPopupOpen} onClose={() => setIsPopupOpen(false)} />
      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
    </div>
  )
}