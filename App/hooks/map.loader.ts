import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";

export function loadMap(containerRef: React.RefObject<HTMLDivElement | null>) {
    const mapRef = useRef<maplibregl.Map | null>(null);
    const [mapLoaded, setMapLoaded] = useState(false);

    useEffect(() => {
        if (mapRef.current || !containerRef.current) return;
        console.log(`[ Bubbly v${process.env.NEXT_PUBLIC_VERSION} ]`)
        console.log(`Loading map assets...`)

        const map = new maplibregl.Map({
            container: containerRef.current,
            style: `${process.env.NEXT_PUBLIC_TILESERVER_URL}/styles/${process.env.NEXT_PUBLIC_MAP_STYLE}/style.json`,
            center: [153.028295, -27.474188],
            zoom: 13,
            attributionControl: false,
        });

        map.addControl(new maplibregl.ScaleControl(), "bottom-left");
        map.addControl(
            new maplibregl.AttributionControl({ compact: false, customAttribution: "© Linus Kang" }),
            "bottom-right"
        );

        const geolocateControl = new maplibregl.GeolocateControl({
            positionOptions: { enableHighAccuracy: true },
            trackUserLocation: true,
        });

        map.addControl(geolocateControl);

        const button = document.querySelector(".maplibregl-ctrl-geolocate") as HTMLElement | null;
        if (button) button.style.display = "none";

        map.on("load", () => {
            setMapLoaded(true)
            console.log(`Loaded map!`)
        });

        map.on("error", (e) => console.error("Map error:", e));

        mapRef.current = map;

        return () => {
            map.remove();
            mapRef.current = null;
            setMapLoaded(false);
        };
    }, [containerRef]);

    return { map: mapRef, mapLoaded };
}