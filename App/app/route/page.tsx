"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";

export default function TestRouteMap() {
    const mapContainer = useRef<HTMLDivElement | null>(null);
    const map = useRef<maplibregl.Map | null>(null);

    const [routeGeojson, setRouteGeojson] = useState<GeoJSON.FeatureCollection<GeoJSON.LineString> | null>(null);
    const [maneuverPoints, setManeuverPoints] = useState<GeoJSON.FeatureCollection<GeoJSON.Point> | null>(null);

    // Brisbane and Gold Coast coordinates [lng, lat]
    const start: [number, number] = [153.0251, -27.4698];
    const end: [number, number] = [153.4000, -28.0167];

    // Fetch route from OSRM
    const fetchRoute = async () => {
        try {
            const res = await fetch(
                `http://192.168.1.114:5000/route/v1/biking/${start[0]},${start[1]};${end[0]},${end[1]}?steps=true&geometries=geojson&overview=full`
            );

            if (!res.ok) throw new Error("Failed to fetch route");

            const data = await res.json();
            const route = data.routes[0];

            setRouteGeojson({
                type: "FeatureCollection",
                features: [{ type: "Feature", geometry: route.geometry, properties: {} }],
            });

            // Extract maneuver points for arrows
            const maneuvers: GeoJSON.Feature<GeoJSON.Point>[] = [];
            route.legs.forEach((leg: any) => {
                leg.steps.forEach((step: any) => {
                    maneuvers.push({
                        type: "Feature",
                        geometry: { type: "Point", coordinates: step.maneuver.location },
                        properties: { modifier: step.maneuver.modifier, type: step.maneuver.type },
                    });
                });
            });

            setManeuverPoints({ type: "FeatureCollection", features: maneuvers });
        } catch (err) {
            console.error(err);
            alert("Failed to fetch route");
        }
    };

    // Initialize map
    useEffect(() => {
        if (!mapContainer.current || map.current) return;

        map.current = new maplibregl.Map({
            container: mapContainer.current,
            style: `${process.env.NEXT_PUBLIC_TILESERVER_URL}/styles/${process.env.NEXT_PUBLIC_MAP_STYLE}/style.json`,
            center: start,
            zoom: 10,
        });

        map.current.addControl(new maplibregl.NavigationControl());

        map.current.on("load", () => {
            new maplibregl.Marker({ color: "green" }).setLngLat(start).addTo(map.current!);
            new maplibregl.Marker({ color: "red" }).setLngLat(end).addTo(map.current!);
            fetchRoute();
        });

        return () => {
            map.current?.remove();
            map.current = null;
        };
    }, []);

    // Draw route and maneuvers
    useEffect(() => {
        if (!map.current || !routeGeojson) return;

        // Add or update route line
        if (map.current.getSource("route")) {
            (map.current.getSource("route") as maplibregl.GeoJSONSource).setData(routeGeojson);
        } else {
            map.current.addSource("route", { type: "geojson", data: routeGeojson });
            map.current.addLayer({
                id: "route-line",
                type: "line",
                source: "route",
                layout: { "line-join": "round", "line-cap": "round" },
                paint: { "line-color": "#3b82f6", "line-width": 5 },
            });
        }
    }, [routeGeojson, maneuverPoints]);

    return <div ref={mapContainer} className="w-screen h-screen" />;
}
