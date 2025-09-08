"use client"
import { Home, Info, Bookmark, Shield, FileText } from "lucide-react"

interface NavigationSidebarProps {
    onNavigate?: (section: string) => void
}

export default function NavigationSidebar({ onNavigate }: NavigationSidebarProps) {
    const handleClick = (section: string) => {
        onNavigate?.(section)
        console.log(section)
    }

    return (
        <div className="h-full w-12 bg-white/90 backdrop-blur-sm border-r border-gray-200 shadow-lg z-30 flex flex-col">
            <div className="flex flex-col pt-4 space-y-2">
                <button
                    onClick={() => handleClick("home")}
                    className="w-10 h-10 mx-1 flex items-center justify-center rounded-lg hover:bg-blue-100 transition-colors group"
                    title="Home"
                >
                    <Home className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
                </button>

                <button
                    onClick={() => handleClick("about")}
                    className="w-10 h-10 mx-1 flex items-center justify-center rounded-lg hover:bg-blue-100 transition-colors group"
                    title="About"
                >
                    <Info className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
                </button>

                <button
                    onClick={() => handleClick("bookmarks")}
                    className="w-10 h-10 mx-1 flex items-center justify-center rounded-lg hover:bg-blue-100 transition-colors group"
                    title="Bookmarks"
                >
                    <Bookmark className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
                </button>
            </div>
            <div className="flex-1" />
            <div className="flex flex-col pb-4 space-y-2">
                <button
                    onClick={() => handleClick("privacy")}
                    className="w-10 h-10 mx-1 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors group"
                    title="Privacy Policy"
                >
                    <Shield className="w-4 h-4 text-gray-500 group-hover:text-gray-700" />
                </button>

                <button
                    onClick={() => handleClick("terms")}
                    className="w-10 h-10 mx-1 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors group"
                    title="Terms of Service"
                >
                    <FileText className="w-4 h-4 text-gray-500 group-hover:text-gray-700" />
                </button>
            </div>
        </div>
    )
}
