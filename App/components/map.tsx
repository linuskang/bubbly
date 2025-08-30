"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import maplibregl from "maplibre-gl"
import { Button } from "@/components/ui/button"
import { Plus, Navigation, Search } from "lucide-react"
import { signIn, signOut, useSession } from "next-auth/react"
import MagicLinkPopup from "@/components/loginPopup"
import type { Feature, Point } from "geojson";

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
  const { data: session } = useSession()
  const [isPopupOpen, setIsPopupOpen] = useState(false)

  useEffect(() => {
    if (map.current || !mapContainer.current) return

    console.log("Initializing map...")

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: `${process.env.NEXT_PUBLIC_TILESERVER_URL}/styles/openstreetmap/style.json`,
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
    if (!map.current || !mapLoaded || waypoints.length === 0) return;

    // Remove previous clustered source/layer if exists
    if (map.current.getSource("waypoints")) {
      map.current.removeLayer("clusters");
      map.current.removeLayer("cluster-count");
      map.current.removeLayer("unclustered-point");
      map.current.removeSource("waypoints");
    }

    const features: Feature<Point, { id: number; name?: string; description?: string; addedby?: string }>[] = 
  waypoints.map(b => ({
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
  }));

    map.current.addSource("waypoints", {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features,
      },
      cluster: true,
      clusterMaxZoom: 14, // Max zoom to cluster points on
      clusterRadius: 50, // Radius of each cluster in pixels
    });

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
    });

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
    });

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
    });

    // Popup on click
    map.current.on("click", "unclustered-point", (e) => {
      const feature = e.features![0];
      const props = feature.properties as any;
      new maplibregl.Popup({ offset: 25 })
        .setLngLat((feature.geometry as any).coordinates)
        .setHTML(`
        <div class="p-3">
          <h3 class="font-semibold text-sm mb-1">${props.name}</h3>
          ${props.description ? `<p class="text-xs text-gray-600">${props.description}</p>` : ""}
          <p class="text-xs text-gray-500 mt-1">Added by: ${props.addedby}</p>
        </div>
      `)
        .addTo(map.current!);
    });

    // Zoom in on cluster click
    map.current.on("click", "clusters", async (e) => {
      const features = map.current!.queryRenderedFeatures(e.point, { layers: ["clusters"] });
      if (!features.length) return;

      const clusterId = features[0].properties!.cluster_id;
      const source = map.current!.getSource("waypoints") as maplibregl.GeoJSONSource;

      try {
        const zoom = await source.getClusterExpansionZoom(clusterId);
        map.current!.easeTo({
          center: (features[0].geometry as any).coordinates,
          zoom,
        });
      } catch (err) {
        console.error("Error expanding cluster:", err);
      }
    });


    map.current.on("mouseenter", "clusters", () => {
      map.current!.getCanvas().style.cursor = "pointer";
    });
    map.current.on("mouseleave", "clusters", () => {
      map.current!.getCanvas().style.cursor = "";
    });
  }, [waypoints, mapLoaded]);


  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Search for:", search)
  }

  return (
    <div className="relative w-screen h-screen bg-gray-50">
      <MagicLinkPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
      />


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
            <Button
              onClick={() => signOut()}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded"
            >
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
    </div>
  )
}
