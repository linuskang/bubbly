"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import { Button } from "@/components/ui/button";
import { Plus, Navigation, Search } from "lucide-react";

export default function WaterMap() {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (map.current) return;
    if (mapContainer.current) {
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: "http://192.168.10.87:8080/styles/basic-preview/style.json",
        center: [153.028295, -27.474188],
        zoom: 13,
      });
    }
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Search for:", search);
  };

  return (
    <div className="relative w-screen h-screen bg-gray-50">
      <div ref={mapContainer} className="absolute inset-0" />

      <form
        onSubmit={handleSearchSubmit}
        className="absolute top-5 left-5 z-20 flex items-center bg-white rounded-full shadow-md px-5 py-3 max-w-sm w-full"
      >
        <input
          type="text"
          placeholder="Search Google Maps"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-grow border-none focus:outline-none text-base placeholder-gray-600"
        />
        <button type="submit" className="ml-3 text-gray-500 hover:text-gray-700 transition-colors" aria-label="Search">
          <Search className="w-5 h-5" />
        </button>
      </form>

      <div className="absolute right-5 bottom-5 z-10 flex flex-col gap-3">
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
    </div>
  );
}