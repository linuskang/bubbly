"use client"

import type React from "react"
import type { Feature, Point } from "geojson"
import type { Waypoint } from "@/types"

import maplibregl from "maplibre-gl"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"



import { loadMap } from "@/hooks/map.loader"

import SettingsPanel from "@/components/settingsPopup"
import MagicLinkPopup from "@/components/loginPopup"
import Searchbar from "@/components/map/searchbar.map"

import MapControls from "@/components/map/controls.map"


import AddWaypointModal from "@/components/addWaypoint"
import Waypointinfo from "@/components/map/waypointinfo"
import NavigationSidebar from "@/components/sidebar"
import FountainsPanel from "@/components/recentWaypoints"



export default function WaterMap() {
    const mapContainer = useRef<HTMLDivElement | null>(null)
    const popupRef = useRef<maplibregl.Popup | null>(null)
    const redMarkerRef = useRef<maplibregl.Marker | null>(null)
    const [search, setSearch] = useState("")
    const [waypoints, setWaypoints] = useState<Waypoint[]>([])
    const { map, mapLoaded } = loadMap(mapContainer);
    const { data: session, status } = useSession()
    const [isPopupOpen, setIsPopupOpen] = useState(false)
    const [matches, setMatches] = useState<Waypoint[]>([])
    const [isFocused, setIsFocused] = useState(false)
    const [selectedWaypoint, setSelectedWaypoint] = useState<Waypoint | null>(null)
    const [showSettings, setShowSettings] = useState(false)
    const router = useRouter()
    const [showAddForm, setShowAddForm] = useState(false)
    const addBubblerPopupRef = useRef<maplibregl.Popup | null>(null)
    const userId = session?.user?.id
    const [recentWaypoints, setRecentWaypoints] = useState<Waypoint[]>([])
    const [isFountainsPanelMinimized, setIsFountainsPanelMinimized] = useState(false)

    useEffect(() => {
        if (!map.current || !mapLoaded) return;

        const url = new URL(window.location.href);

        const lng = parseFloat(url.searchParams.get("lng") || "");
        const lat = parseFloat(url.searchParams.get("lat") || "");
        const zoom = parseFloat(url.searchParams.get("zoom") || "");

        if (!isNaN(lng) && !isNaN(lat)) {
            map.current.flyTo({
                center: [lng, lat],
                zoom: !isNaN(zoom) ? zoom : 13,
            });
        }

        const waypointId = url.searchParams.get("waypoint");
        if (waypointId && waypoints.length > 0) {
            const waypoint = waypoints.find(w => w.id === Number.parseInt(waypointId));
            if (waypoint) selectWaypoint(waypoint);
        }
    }, [mapLoaded, waypoints]);


    useEffect(() => {
        fetch("/api/waypoints/recentlyadded?number=3")
            .then((res) => (res.ok ? res.json() : Promise.reject(`HTTP error! status: ${res.status}`)))
            .then(setRecentWaypoints)
            .catch((err) => {
                console.error("Failed to fetch recent waypoints:", err)
            })
    }, [])

    const showAddBubblerMenu = (lngLat: maplibregl.LngLat) => {
        if (addBubblerPopupRef.current) {
            addBubblerPopupRef.current.remove()
            addBubblerPopupRef.current = null
        }

        const popupContent = document.createElement("div")
        popupContent.innerHTML = `
      <button id="add-bubbler-btn" class="bg-blue-600 text-white px-3 py-1 rounded">
        Add Water Fountain
      </button>
    `

        const popup = new maplibregl.Popup({ offset: 25, closeOnClick: true })
            .setLngLat(lngLat)
            .setDOMContent(popupContent)
            .addTo(map.current!)

        popupContent.querySelector("#add-bubbler-btn")?.addEventListener("click", () => {
            popup.remove()
            addBubblerPopupRef.current = null
            openAddBubblerForm(lngLat)
        })

        addBubblerPopupRef.current = popup
    }

    const openAddBubblerForm = (lngLat: maplibregl.LngLat) => {
        if (!session?.user) {
            alert("You must be signed in to add a water fountain.")
            return
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
        })
        setShowAddForm(true)
    }

    useEffect(() => {
        if (!map.current) return

        const updateUrl = () => {
            const center = map.current!.getCenter()
            const zoom = map.current!.getZoom()

            const url = new URL(window.location.href)
            url.searchParams.set("lng", center.lng.toFixed(5))
            url.searchParams.set("lat", center.lat.toFixed(5))
            url.searchParams.set("zoom", zoom.toFixed(2))

            if (selectedWaypoint && selectedWaypoint.id !== -1) {
                url.searchParams.set("waypoint", selectedWaypoint.id.toString())
            }

            window.history.replaceState({}, "", url.toString())
        }

        map.current.on("moveend", updateUrl)

        return () => {
            map.current?.off("moveend", updateUrl)
        }
    }, [map.current, selectedWaypoint])

    useEffect(() => {
        console.log("Fetching waypoints...")
        fetch("/api/waypoints")
            .then((res) => (res.ok ? res.json() : Promise.reject(`HTTP error! status: ${res.status}`)))
            .then(setWaypoints)
            .catch((err) => {
                console.error(err)
                alert("Error fetching waypoints")
            })
    }, [])

    useEffect(() => {
        if (waypoints.length === 0 || !map.current) return

        const url = new URL(window.location.href)
        const waypointId = url.searchParams.get("waypoint")

        if (waypointId) {
            const waypoint = waypoints.find((w) => w.id === Number.parseInt(waypointId))
            if (waypoint) {
                map.current.flyTo({
                    center: [waypoint.longitude, waypoint.latitude],
                    zoom: 16,
                })
                selectWaypoint(waypoint)
            }
        }
    }, [waypoints, mapLoaded])

    useEffect(() => {
        if (status === "loading") return
        if (session?.user && !session.user.username) router.push("/onboarding")
    }, [session, status, router])

    useEffect(() => {
        if (!search) return setMatches([])
        setMatches(waypoints.filter((w) => w.name?.toLowerCase().includes(search.toLowerCase())))
    }, [search, waypoints])

    useEffect(() => {
        if (!map.current) return

        const closePopup = () => {
            if (addBubblerPopupRef.current) {
                addBubblerPopupRef.current.remove()
                addBubblerPopupRef.current = null
            }
        }

        map.current.on("click", closePopup)
        map.current.on("contextmenu", (e) => {
            closePopup()
            showAddBubblerMenu(e.lngLat)
            e.originalEvent.preventDefault()
        })

        return () => {
            map.current?.off("click", closePopup)
            map.current?.off("contextmenu", showAddBubblerMenu)
        }
    }, [mapLoaded])

    useEffect(() => {
        if (!map.current) return

        const handleMapClick = (e: maplibregl.MapMouseEvent) => {
            const features = map.current!.queryRenderedFeatures(e.point, { layers: ["unclustered-point", "clusters"] })

            if (features.length === 0) {
                deselectWaypoint()

                if (popupRef.current) {
                    popupRef.current.remove()
                    popupRef.current = null
                }
                popupRef.current = new maplibregl.Popup({ offset: 10 })
                    .setLngLat(e.lngLat)
                    .setHTML(`<div>Lng: ${e.lngLat.lng.toFixed(5)}<br>Lat: ${e.lngLat.lat.toFixed(5)}</div>`)
                    .addTo(map.current!)
            } else {
                if (popupRef.current) {
                    popupRef.current.remove()
                    popupRef.current = null
                }
            }
        }

        map.current.on("click", handleMapClick)

        map.current.on("contextmenu", (e) => {
            if (addBubblerPopupRef.current) {
                addBubblerPopupRef.current.remove()
                addBubblerPopupRef.current = null
            }
            showAddBubblerMenu(e.lngLat)
            e.originalEvent.preventDefault()
        })

        return () => {
            map.current?.off("click", handleMapClick)
            map.current?.off("contextmenu", showAddBubblerMenu)
        }
    }, [mapLoaded])

    useEffect(() => {
        if (!map.current || !mapLoaded || waypoints.length === 0) return
        if (map.current.getSource("waypoints")) {
            ;["clusters", "cluster-count", "unclustered-point"].forEach((layer) => map.current?.removeLayer(layer))
            map.current.removeSource("waypoints")
        }

        const features: Feature<Point, { id: number; name?: string; description?: string; addedby?: string }>[] =
            waypoints.map((w) => ({
                type: "Feature",
                geometry: { type: "Point", coordinates: [w.longitude, w.latitude] },
                properties: { id: w.id, name: w.name, description: w.description, addedby: w.addedby },
            }))

        map.current.addSource("waypoints", {
            type: "geojson",
            data: { type: "FeatureCollection", features },
            cluster: true,
            clusterMaxZoom: 14,
            clusterRadius: 50,
        })

        map.current.addLayer({
            id: "clusters",
            type: "circle",
            source: "waypoints",
            filter: ["has", "point_count"],
            paint: {
                "circle-color": ["step", ["get", "point_count"], "#3b82f6", 10, "#1d4ed8", 30, "#1e40af"],
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
                "circle-color": "#06b6d4",
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

        map.current.on("mouseenter", "clusters", () => {
            map.current!.getCanvas().style.cursor = "pointer"
        })
        map.current.on("mouseleave", "clusters", () => {
            map.current!.getCanvas().style.cursor = ""
        })
    }, [waypoints, mapLoaded])

    const showRedMarker = (w: Waypoint) => {
        if (!map.current) return
        if (redMarkerRef.current) redMarkerRef.current.remove()
        const el = document.createElement("div")
        el.style.width = "20px"
        el.style.height = "20px"
        el.style.backgroundColor = "#ef4444"
        el.style.border = "3px solid white"
        el.style.borderRadius = "50%"
        el.style.boxShadow = "0 2px 8px rgba(0,0,0,0.3)"
        el.style.cursor = "pointer"
        redMarkerRef.current = new maplibregl.Marker(el).setLngLat([w.longitude, w.latitude]).addTo(map.current)
    }

    const hideRedMarker = () => {
        if (redMarkerRef.current) {
            redMarkerRef.current.remove()
            redMarkerRef.current = null
        }
        if (popupRef.current) {
            popupRef.current.remove()
            popupRef.current = null
        }
    }

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        const first = waypoints.find((w) => w.name?.toLowerCase().includes(search.toLowerCase()))
        if (!first || !map.current) return
        map.current.flyTo({ center: [first.longitude, first.latitude], zoom: 16 })
        selectWaypoint(first)
    }

    const selectWaypoint = (w: Waypoint) => {
        setSelectedWaypoint(w)
        showRedMarker(w)
        setSearch(w.name || "")
        setMatches([])
        setIsFocused(false)
    }

    const deselectWaypoint = () => {
        setSelectedWaypoint(null)
        hideRedMarker()

        const url = new URL(window.location.href)
        url.searchParams.delete("waypoint")
        window.history.replaceState({}, "", url.toString())
    }

    const submitBubbler = async () => {
        if (!selectedWaypoint || !session?.user) return
        try {
            const res = await fetch("/api/waypoints", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...selectedWaypoint,
                    addedby: session.user.username,
                    addedbyuserid: session.user.id,
                }),
            })
            if (!res.ok) throw new Error("Failed to add water fountain")
            const newWaypoint = await res.json()
            setWaypoints((prev) => [...prev, newWaypoint])
            setShowAddForm(false)
        } catch (err) {
            console.error(err)
            alert("Error adding water fountain")
        }
    }

    return (
        <div className="w-screen h-screen bg-gray-50 overflow-hidden grid grid-cols-[48px_1fr] grid-rows-1">
            <NavigationSidebar />

            <div className="relative h-full overflow-hidden">
                <div ref={mapContainer} className="h-full w-full" />

                <Searchbar
                    search={search}
                    setSearch={setSearch}
                    matches={matches}
                    setMatches={setMatches}
                    selectedWaypoint={selectedWaypoint}
                    setSelectedWaypoint={setSelectedWaypoint}
                    onSearchSubmit={handleSearchSubmit}
                    showRedMarker={showRedMarker}
                    hideRedMarker={hideRedMarker}
                    selectWaypoint={selectWaypoint}
                    map={map}
                />

                {selectedWaypoint && (
                    <Waypointinfo
                        selectedWaypoint={selectedWaypoint}
                        setSelectedWaypoint={setSelectedWaypoint}
                        hideRedMarker={hideRedMarker}
                        currentUserId={userId}
                    />
                )}

                <MapControls
                    session={session}
                    setIsPopupOpen={setIsPopupOpen}
                    setShowSettings={setShowSettings}
                    map={map}
                />

                <MagicLinkPopup isOpen={isPopupOpen} onClose={() => setIsPopupOpen(false)} />

                {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}

                {showAddForm && selectedWaypoint && (
                    <AddWaypointModal
                        selectedWaypoint={selectedWaypoint}
                        setSelectedWaypoint={setSelectedWaypoint}
                        setShowAddForm={setShowAddForm}
                        submitBubbler={submitBubbler}
                    />
                )}

                <FountainsPanel recentWaypoints={recentWaypoints} map={map} selectWaypoint={selectWaypoint} isMinimized={isFountainsPanelMinimized} setIsMinimized={setIsFountainsPanelMinimized}/>
            </div>
        </div>
    )
}
