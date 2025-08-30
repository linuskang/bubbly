"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import maplibregl from "maplibre-gl"
import { Button } from "@/components/ui/button"
import {
  Plus,
  Navigation,
  Search,
  X,
  MapPin,
  Clock,
  Phone,
  Globe,
  Star,
  Bookmark,
  Share,
  LucideCaptions as Directions,
} from "lucide-react"
import { signOut, useSession } from "next-auth/react"
import MagicLinkPopup from "@/components/loginPopup"
import type { Feature, Point } from "geojson"

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
  phone?: string
  website?: string
  accessibility?: string
  waterType?: string
  lastMaintenance?: string
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
  const popupRef = useRef<maplibregl.Popup | null>(null)
  const [isFocused, setIsFocused] = useState(false)
  const [selectedWaypoint, setSelectedWaypoint] = useState<Waypoint | null>(null)
  const [showInfoPanel, setShowInfoPanel] = useState(false)
  const redMarkerRef = useRef<maplibregl.Marker | null>(null)

  useEffect(() => {
    if (map.current || !mapContainer.current) return

    console.log("Initializing map...")

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: `${process.env.NEXT_PUBLIC_TILESERVER_URL}/styles/openstreetmap/style.json`,
      center: [153.028295, -27.474188],
      zoom: 13,
    })

    map.current.addControl(new maplibregl.NavigationControl(), "top-right")
    map.current.addControl(new maplibregl.FullscreenControl(), "top-right")
    map.current.addControl(new maplibregl.ScaleControl(), "bottom-left")

    map.current.on("load", () => {
      console.log("Map loaded successfully")
      setMapLoaded(true)
    })

    map.current.on("error", (e) => {
      console.error("Map error:", e)
    })

    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
        setMapLoaded(false)
      }
    }
  }, [])

  const showRedMarker = (waypoint: Waypoint) => {
    if (!map.current) return

    // Remove existing red marker
    if (redMarkerRef.current) {
      redMarkerRef.current.remove()
    }

    // Create red marker element
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

    // Create and add red marker
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

  useEffect(() => {
    if (!search) {
      setMatches([])
      return
    }

    const filtered = waypoints.filter((w) => w.name?.toLowerCase().includes(search.toLowerCase()))
    setMatches(filtered)
  }, [search, waypoints])

  useEffect(() => {
    console.log("Fetching waypoints...")
    fetch("/api/waypoints")
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`)
        }
        return res.json()
      })
      .then((data) => {
        console.log("Fetched waypoints:", data)
        setWaypoints(data)
      })
      .catch((error) => {
        console.error("Error fetching waypoints:", error)
        setWaypoints([
          {
            id: 1,
            name: "King George Square Fountain",
            latitude: -27.4687,
            longitude: 153.0235,
            description: "Located near Brisbane City Hall",
            addedby: "city_data",
            createdAt: "2025-08-12T11:19:10.032Z",
            address: "King George Square, Brisbane City QLD 4000",
            rating: 4.2,
            reviewCount: 156,
            hours: "24 hours",
            accessibility: "Wheelchair accessible",
            waterType: "Filtered drinking water",
            lastMaintenance: "2025-08-01",
          },
        ])
      })
  }, [])

  useEffect(() => {
    if (!map.current || !mapLoaded || waypoints.length === 0) return

    // Remove previous clustered source/layer if exists
    if (map.current.getSource("waypoints")) {
      map.current.removeLayer("clusters")
      map.current.removeLayer("cluster-count")
      map.current.removeLayer("unclustered-point")
      map.current.removeSource("waypoints")
    }

    const features: Feature<Point, { id: number; name?: string; description?: string; addedby?: string }>[] =
      waypoints.map((b) => ({
        type: "Feature", // ✅ must be "Feature"
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
      clusterMaxZoom: 14, // Max zoom to cluster points on
      clusterRadius: 50, // Radius of each cluster in pixels
    })

    // Cluster circles
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

    // Cluster count labels
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

    // Individual unclustered points
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
        setShowInfoPanel(true)
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

    // Find matching waypoints
    const matches = waypoints.filter((w) => w.name?.toLowerCase().includes(search.toLowerCase()))

    if (matches.length === 0) {
      alert("No fountains found")
      return
    }

    // Fly to the first match
    const first = matches[0]
    map.current.flyTo({
      center: [first.longitude, first.latitude],
      zoom: 16,
    })

    // Show detailed info panel instead of popup
    setSelectedWaypoint(first)
    setShowInfoPanel(true)
    showRedMarker(first)
  }

  const closeInfoPanel = () => {
    setShowInfoPanel(false)
    setSelectedWaypoint(null)
    hideRedMarker()
  }

  return (
    <div className="relative w-screen h-screen bg-gray-50">
      <MagicLinkPopup isOpen={isPopupOpen} onClose={() => setIsPopupOpen(false)} />

      <div
        ref={mapContainer}
        className={`absolute inset-0 w-full h-full transition-all duration-300 ${showInfoPanel ? "ml-96" : "ml-0"}`}
        style={{ minHeight: "100vh", minWidth: showInfoPanel ? "calc(100vw - 384px)" : "100vw" }}
      />

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

                    // Show detailed info panel
                    setSelectedWaypoint(w)
                    setShowInfoPanel(true)
                    showRedMarker(w)

                    // Close dropdown
                    setMatches([])
                    setSearch(w.name || "")
                    setIsFocused(false) // <- hide dropdown until user focuses input again
                  }}
                >
                  {w.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </form>

      <div className="absolute top-5 right-5 z-30 flex items-center gap-2">
        {!session ? (
          <Button
            onClick={() => setIsPopupOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 shadow-lg rounded-lg px-5 py-4 text-white font-semibold cursor-pointer"
          >
            Sign in
          </Button>
        ) : (
          <div className="flex items-center gap-2 bg-white rounded-lg shadow px-3 py-2">
            <span className="text-sm font-medium">{session.user?.email}</span>
            <Button onClick={() => signOut()} className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded">
              Sign out
            </Button>
          </div>
        )}
      </div>

      <div className="absolute right-7 bottom-10 z-10 flex flex-col gap-3">
        <Button
          size="icon"
          className="h-14 w-14 bg-blue-600 hover:bg-blue-700 shadow-lg rounded-full"
          title="Add new water fountain"
        >
          <Plus className="w-6 h-6" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-14 w-14 bg-white shadow-lg rounded-full border-gray-200"
          title="Navigation"
        >
          <Navigation className="w-5 h-5" />
        </Button>
      </div>

      <div className="absolute bottom-12 left-2.5 z-20 bg-white/90 rounded-lg p-2 text-xs">
        <div>Map loaded: {mapLoaded ? "✓" : "✗"}</div>
        <div>Waypoints: {waypoints.length}</div>
      </div>

      {showInfoPanel && selectedWaypoint && (
        <div
          className={`fixed left-0 top-0 bottom-0 z-50 w-96 bg-gradient-to-b from-slate-50 to-white shadow-2xl border-r border-gray-200 transform transition-transform duration-300 ease-in-out ${showInfoPanel ? "translate-x-0" : "-translate-x-full"}`}
        >
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
              <h2 className="text-lg font-semibold">Location Details</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={closeInfoPanel}
                className="h-8 w-8 text-white hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6 bg-white">
                <h1 className="text-2xl font-bold text-gray-900 mb-3 leading-tight">{selectedWaypoint.name}</h1>

                {/* Rating */}
                {selectedWaypoint.rating && (
                  <div className="flex items-center gap-2 mb-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <span className="text-xl font-bold text-yellow-700">{selectedWaypoint.rating}</span>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i < Math.floor(selectedWaypoint.rating!)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    {selectedWaypoint.reviewCount && (
                      <span className="text-sm text-yellow-600 font-medium">
                        ({selectedWaypoint.reviewCount.toLocaleString()} reviews)
                      </span>
                    )}
                  </div>
                )}

                <div className="text-sm text-gray-600 mb-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <span className="font-medium text-blue-800">🚰 Water fountain</span> •{" "}
                  {selectedWaypoint.accessibility || "Accessibility info not available"}
                </div>

                <div className="flex gap-3 mb-6">
                  <Button className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md">
                    <Directions className="w-4 h-4 mr-2" />
                    Directions
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 bg-transparent"
                  >
                    <Bookmark className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 bg-transparent"
                  >
                    <Share className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="border-t border-gray-200 bg-gray-50">
                <div className="p-6 space-y-5">
                  {/* Address */}
                  {selectedWaypoint.address && (
                    <div className="flex items-start gap-4 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <MapPin className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-sm text-gray-900 mb-1">Address</div>
                        <div className="text-sm text-gray-600 leading-relaxed">{selectedWaypoint.address}</div>
                      </div>
                    </div>
                  )}

                  {/* Hours */}
                  {selectedWaypoint.hours && (
                    <div className="flex items-start gap-4 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Clock className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-sm text-gray-900 mb-1">Hours</div>
                        <div className="text-sm text-green-700 font-medium">{selectedWaypoint.hours}</div>
                      </div>
                    </div>
                  )}

                  {/* Phone */}
                  {selectedWaypoint.phone && (
                    <div className="flex items-start gap-4 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Phone className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-sm text-gray-900 mb-1">Phone</div>
                        <div className="text-sm text-blue-600 font-medium hover:underline cursor-pointer">
                          {selectedWaypoint.phone}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Website */}
                  {selectedWaypoint.website && (
                    <div className="flex items-start gap-4 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <Globe className="w-5 h-5 text-orange-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-sm text-gray-900 mb-1">Website</div>
                        <div className="text-sm text-blue-600 font-medium hover:underline cursor-pointer">
                          {selectedWaypoint.website}
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedWaypoint.waterType && (
                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-lg border border-blue-200">
                      <div className="font-semibold text-sm text-blue-900 mb-1">💧 Water Type</div>
                      <div className="text-sm text-blue-800 font-medium">{selectedWaypoint.waterType}</div>
                    </div>
                  )}

                  {selectedWaypoint.lastMaintenance && (
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                      <div className="font-semibold text-sm text-green-900 mb-1">🔧 Last Maintenance</div>
                      <div className="text-sm text-green-800 font-medium">
                        {new Date(selectedWaypoint.lastMaintenance).toLocaleDateString()}
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  {selectedWaypoint.description && (
                    <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                      <div className="font-semibold text-sm text-gray-900 mb-2">Description</div>
                      <div className="text-sm text-gray-600 leading-relaxed">{selectedWaypoint.description}</div>
                    </div>
                  )}

                  <div className="text-xs text-gray-500 pt-4 border-t border-gray-300 bg-white p-4 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>
                        Added by <span className="font-medium">{selectedWaypoint.addedby}</span>
                      </span>
                    </div>
                    {selectedWaypoint.createdAt && (
                      <div className="mt-1 ml-4">
                        {new Date(selectedWaypoint.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
