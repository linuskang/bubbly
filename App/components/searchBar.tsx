"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Search, X } from "lucide-react"

interface Waypoint {
  id: number
  name?: string
  latitude: number
  longitude: number
  description?: string
  addedby?: string
  isaccessible?: boolean
  dogfriendly?: boolean
  hasbottlefiller?: boolean
  type?: string
}

interface ImprovedSearchProps {
  search: string
  setSearch: (value: string) => void
  matches: Waypoint[]
  setMatches: (matches: Waypoint[]) => void
  selectedWaypoint: Waypoint | null
  setSelectedWaypoint: (waypoint: Waypoint | null) => void
  onSearchSubmit: (e: React.FormEvent) => void
  showRedMarker: (waypoint: Waypoint) => void
  hideRedMarker: () => void
  selectWaypoint: (waypoint: Waypoint) => void
  map: React.MutableRefObject<any>
}

export default function SearchV2({
  search,
  setSearch,
  matches,
  setMatches,
  selectedWaypoint,
  setSelectedWaypoint,
  onSearchSubmit,
  showRedMarker,
  hideRedMarker,
  selectWaypoint,
  map,
}: ImprovedSearchProps) {
  const [isFocused, setIsFocused] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!matches.length) return

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setHighlightedIndex((prev) => (prev < matches.length - 1 ? prev + 1 : 0))
        break
      case "ArrowUp":
        e.preventDefault()
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : matches.length - 1))
        break
      case "Enter":
        e.preventDefault()
        if (highlightedIndex >= 0 && matches[highlightedIndex]) {
          handleWaypointSelect(matches[highlightedIndex])
        } else {
          onSearchSubmit(e)
        }
        break
      case "Escape":
        setIsFocused(false)
        setHighlightedIndex(-1)
        inputRef.current?.blur()
        break
    }
  }

  // Handle waypoint selection
  const handleWaypointSelect = (waypoint: Waypoint) => {
    if (!map.current) return

    map.current.flyTo({
      center: [waypoint.longitude, waypoint.latitude],
      zoom: 16,
    })
    selectWaypoint(waypoint)
    setSearch(waypoint.name || "")
    setMatches([])
    setIsFocused(false)
    setHighlightedIndex(-1)
  }

  // Clear search
  const handleClear = () => {
    setSearch("")
    setMatches([])
    setSelectedWaypoint(null)
    hideRedMarker()
    setIsFocused(false)
    setHighlightedIndex(-1)
    inputRef.current?.focus()
  }

  // Reset highlighted index when matches change
  useEffect(() => {
    setHighlightedIndex(-1)
  }, [matches])

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setIsFocused(false)
        setHighlightedIndex(-1)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <form
      onSubmit={onSearchSubmit}
      className="absolute top-5 left-5 z-20 w-full max-w-sm"
      role="search"
      aria-label="Search for water fountains"
    >
      <div className="relative">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            placeholder="Search for water fountains..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onKeyDown={handleKeyDown}
            className="w-full border-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-base placeholder-gray-600 bg-white rounded-full shadow-md pl-5 pr-12 py-3 transition-shadow"
            aria-expanded={matches.length > 0 && isFocused}
            aria-haspopup="listbox"
            aria-autocomplete="list"
            aria-describedby={matches.length > 0 ? "search-results" : undefined}
          />

          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {search && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            <button
              type="submit"
              className="p-1 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>
        </div>

        {matches.length > 0 && isFocused && (
          <div
            ref={dropdownRef}
            className="absolute top-full left-0 mt-1 w-full max-h-60 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg z-50"
            role="listbox"
            id="search-results"
            aria-label="Search results"
          >
            {matches.map((waypoint, index) => (
              <button
                key={waypoint.id}
                type="button"
                className={`w-full text-left px-4 py-3 transition-colors border-b border-gray-100 last:border-b-0 ${
                  index === highlightedIndex ? "bg-blue-50 text-blue-900" : "hover:bg-gray-50"
                }`}
                role="option"
                aria-selected={index === highlightedIndex}
                onMouseEnter={() => {
                  setHighlightedIndex(index)
                  showRedMarker(waypoint)
                }}
                onMouseLeave={() => {
                  if (!selectedWaypoint || selectedWaypoint.id !== waypoint.id) {
                    hideRedMarker()
                  }
                }}
                onClick={() => handleWaypointSelect(waypoint)}
              >
                <div className="font-medium text-gray-900">{waypoint.name}</div>
              </button>
            ))}
          </div>
        )}
      </div>
    </form>
  )
}
