"use client"

import React from "react"
import maplibregl from "maplibre-gl"
import { Navigation } from "lucide-react"
import { Button } from "@/components/ui/button"
import UserAvatarDropdown from "@/components/avatarDropdown"

interface MapControlsProps {
    session: any
    setIsPopupOpen: (open: boolean) => void
    setShowSettings: (open: boolean) => void
    map: React.MutableRefObject<maplibregl.Map | null>
}

export default function MapControls({
                                        session,
                                        setIsPopupOpen,
                                        setShowSettings,
                                        map,
                                    }: MapControlsProps) {
    return (
        <>
            <div className="absolute top-5 right-5 z-30 flex items-center gap-2">
                {!session ? (
                    <button
                        onClick={() => setIsPopupOpen(true)}
                        className="px-4 py-2 bg-blue-700 text-white shadow-lg hover:bg-blue-800 rounded-full transition cursor-pointer"
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

            <div className="absolute right-7 bottom-10 z-10 flex flex-col gap-3">
                <Button
                    variant="outline"
                    size="icon"
                    className="h-14 w-14 bg-white shadow-lg rounded-full border-gray-200 cursor-pointer"
                    title="Show my location"
                    onClick={() => {
                        const geolocateControl = map.current?._controls.find(
                            (c: any) => c instanceof maplibregl.GeolocateControl
                        )
                        if (geolocateControl) geolocateControl.trigger()
                    }}
                >
                    <Navigation className="w-5 h-5" />
                </Button>
            </div>
        </>
    )
}
