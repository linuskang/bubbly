"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import maplibregl from "maplibre-gl"
import { Button } from "@/components/ui/button"
import { Plus, Navigation, Search } from "lucide-react"

interface Waypoint {
  id: number
  name: string
  latitude: number
  longitude: number
  description?: string
  addedby?: string
  createdAt?: string
}

export default function WaterMap() {
  const mapContainer = useRef<HTMLDivElement | null>(null)
  const map = useRef<maplibregl.Map | null>(null)
  const [search, setSearch] = useState("")
  const [waypoints, setWaypoints] = useState<Waypoint[]>([])
  const [mapLoaded, setMapLoaded] = useState(false)
  const markersRef = useRef<maplibregl.Marker[]>([])

  useEffect(() => {
    if (map.current || !mapContainer.current) return

    console.log("Initializing map...")

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: `${process.env.NEXT_PUBLIC_TILESERVER_URL}/styles/basic-preview/style.json`,
      center: [153.028295, -27.474188],
      zoom: 13,
    });

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
        // Fallback data
        setWaypoints([
          {
            id: 1,
            name: "King George Square Fountain",
            latitude: -27.4687,
            longitude: 153.0235,
            description: "Located near Brisbane City Hall",
            addedby: "city_data",
            createdAt: "2025-08-12T11:19:10.032Z",
          },
        ])
      })
  }, [])

  useEffect(() => {
    if (!map.current || !mapLoaded || waypoints.length === 0) {
      console.log("Not ready to add markers:", {
        mapExists: !!map.current,
        mapLoaded,
        waypointsLength: waypoints.length,
      })
      return
    }

    console.log("Adding markers for waypoints:", waypoints)

    markersRef.current.forEach((marker) => {
      marker.remove()
    })
    markersRef.current = []

    waypoints.forEach((waypoint, index) => {
      console.log(`Adding marker ${index + 1} for ${waypoint.name} at [${waypoint.longitude}, ${waypoint.latitude}]`)

      try {
        const marker = new maplibregl.Marker({ color: "#3B82F6" })
          .setLngLat([waypoint.longitude, waypoint.latitude])
          .setPopup(
            new maplibregl.Popup({ offset: 25 }).setHTML(`
              <div class="p-3">
                <h3 class="font-semibold text-sm mb-1">${waypoint.name}</h3>
                ${waypoint.description ? `<p class="text-xs text-gray-600">${waypoint.description}</p>` : ""}
                <p class="text-xs text-gray-500 mt-1">Lat: ${waypoint.latitude}, Lng: ${waypoint.longitude}</p>
              </div>
            `),
          )
          .addTo(map.current!)

        markersRef.current.push(marker)
        console.log(`Successfully added marker ${index + 1}`)
      } catch (error) {
        console.error(`Error adding marker for ${waypoint.name}:`, error)
      }
    })

    console.log(`Total markers added: ${markersRef.current.length}`)
  }, [waypoints, mapLoaded])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Search for:", search)
  }

  return (
    <div className="relative w-screen h-screen bg-gray-50">
      <div
        ref={mapContainer}
        className="absolute inset-0 w-full h-full"
        style={{ minHeight: "100vh", minWidth: "100vw" }}
      />

      <form
        onSubmit={handleSearchSubmit}
        className="absolute top-5 left-5 z-20 flex items-center bg-white rounded-full shadow-md px-5 py-3 max-w-sm w-full"
      >
        <input
          type="text"
          placeholder="Search for water fountains..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-grow border-none focus:outline-none text-base placeholder-gray-600"
        />
        <button type="submit" className="ml-3 text-gray-500 hover:text-gray-700 transition-colors" aria-label="Search">
          <Search className="w-5 h-5" />
        </button>
      </form>

      <div className="absolute top-5 right-5 z-30 flex items-center">
        <Button
          className="bg-blue-600 hover:bg-blue-700 shadow-lg rounded-lg px-5 py-4 text-white font-semibold cursor-pointer"
          title="Sign in"
        >
          Sign in
        </Button>
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
    </div>
  )
}
