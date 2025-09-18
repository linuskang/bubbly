"use client"

import { useState, useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Droplets, Map, Plus, Sparkles, ArrowRight, ArrowLeft, Laptop } from "lucide-react"

export default function Welcome({ onClose }: { onClose: () => void }) {
    const [step, setStep] = useState(0)
    const [show, setShow] = useState(false)

    useEffect(() => {
        const hasSeenWelcome = sessionStorage.getItem("hasSeenWelcome")
        if (!hasSeenWelcome) setShow(true)
    }, [])

    const handleClose = () => {
        sessionStorage.setItem("hasSeenWelcome", "true")
        setShow(false) // triggers exit animation
    }

    const steps = [
        {
            title: "Welcome to Bubbly",
            subtitle: "Mapping Australia's water fountains, one by one.",
            text: "Join our community in mapping water fountains and helping everyone stay hydrated on the go.",
            icon: <Droplets className="w-12 h-12 text-blue-600" />,
        },
        {
            title: "Explore the Map",
            subtitle: "Find fountains nearby",
            text: "Pan, zoom, and discover water fountains in your area. Tap any marker to see details, photos, and reviews.",
            icon: <Map className="w-12 h-12 text-blue-600" />,
        },
        {
            title: "Contribute to the data",
            subtitle: "Help grow our database of fountains",
            text: "Found a fountain that's not on the map, or want to edit some information? Right-click anywhere to add it and help fellow water seekers.",
            icon: <Plus className="w-12 h-12 text-blue-600" />,
        },
        {
            title: "View our Github Repo",
            subtitle: "Check out our open sourced code",
            text: (
                <a
                    href="https://github.com/linuskang/bubbly"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 transition-colors"
                >
                    @linuskang/bubbly
                </a>
            ),
            icon: <Laptop className="w-12 h-12 text-blue-600" />,
        },
        {
            title: "Ready to Start?",
            subtitle: "Join the water mapping revolution",
            text: "Sign in to start contributing, save your favorite spots, and be part of the clean water community.",
            icon: <Sparkles className="w-12 h-12 text-blue-600" />,
        },
    ]

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md px-4"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                        className="bg-white/95 backdrop-blur-xl w-full max-w-md rounded-3xl shadow-2xl border border-gray-200/50 overflow-hidden relative"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-blue-400/5 pointer-events-none" />

                        <div className="relative p-8 text-center">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={step}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.3, ease: "easeInOut" }}
                                    className="space-y-6"
                                >
                                    <div className="flex justify-center">
                                        <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                                            {steps[step].icon}
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <h2 className="text-2xl font-bold text-gray-900 text-balance">
                                            {steps[step].title}
                                        </h2>
                                        <p className="text-sm font-medium text-blue-600">{steps[step].subtitle}</p>
                                        <p className="text-gray-600 leading-relaxed text-pretty">{steps[step].text}</p>
                                    </div>
                                </motion.div>
                            </AnimatePresence>

                            <div className="flex justify-center gap-2 my-8">
                                {steps.map((_, i) => (
                                    <motion.div
                                        key={i}
                                        className={`h-1.5 rounded-full transition-all duration-300 ${
                                            i === step ? "bg-blue-500 w-8" : i < step ? "bg-blue-500/60 w-1.5" : "bg-gray-300 w-1.5"
                                        }`}
                                        layout
                                    />
                                ))}
                            </div>

                            <div className="flex justify-between items-center gap-4">
                                {step > 0 ? (
                                    <button
                                        onClick={() => setStep((s) => s - 1)}
                                        className="flex items-center cursor-pointer gap-2 px-4 py-2.5 text-sm font-medium rounded-xl border border-gray-300 bg-gray-100/50 text-gray-700 hover:bg-gray-100 transition-all duration-200 hover:scale-105"
                                    >
                                        <ArrowLeft className="w-4 h-4" />
                                        Back
                                    </button>
                                ) : (
                                    <div />
                                )}

                                {step < steps.length - 1 ? (
                                    <button
                                        onClick={() => setStep((s) => s + 1)}
                                        className="flex cursor-pointer items-center gap-2 px-6 py-2.5 text-sm font-medium rounded-xl bg-blue-500 text-white shadow-lg shadow-blue-500/25 hover:bg-blue-600 transition-all duration-200 hover:scale-105"
                                    >
                                        Next
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleClose}
                                        className="flex cursor-pointer items-center gap-2 px-6 py-2.5 text-sm font-medium rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-200 hover:scale-105"
                                    >
                                        Start exploring!
                                        <Sparkles className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
