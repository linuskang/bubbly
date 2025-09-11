"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
    const { data: session, status, update } = useSession();
    const router = useRouter();
    const [form, setForm] = useState({
        name: "",
        username: "",
        bio: "",
        image: "",
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [completed, setCompleted] = useState(false); // flag for just finished onboarding

    useEffect(() => {
        if (status !== "loading" && session?.user) {
            const user = session.user as { name?: string; username?: string; bio?: string; image?: string };
            setForm({
                name: user.name || "",
                username: user.username || "",
                bio: user.bio || "",
                image: user.image || "",
            });
        }
    }, [session, status]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        if (!form.name || !form.username) {
            setMessage("Name and username are required.");
            return;
        }

        setLoading(true);
        setMessage("");

        try {
            const res = await fetch("/api/user/update", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
                credentials: "include",
            });

            if (res.ok) {
                setMessage("Profile updated successfully!");
                setCompleted(true); // mark onboarding as just completed
                await update?.();
                setTimeout(() => {
                    router.push("/");
                }, 500);
            } else {
                const text = await res.text();
                setMessage(`Error: ${text}`);
            }
        } catch (err) {
            console.error(err);
            setMessage("Failed to update profile.");
        } finally {
            setLoading(false);
        }
    };

    if (status === "loading") return <p>Loading...</p>;

    return (
        <div className="max-w-md mx-auto p-6">
            <h1 className="text-2xl font-bold mb-4">Complete Your Profile</h1>

            <input
                type="text"
                name="name"
                placeholder="Name"
                className="w-full border rounded px-3 py-2 mb-3"
                value={form.name}
                onChange={handleChange}
            />

            <input
                type="text"
                name="username"
                placeholder="Username"
                className="w-full border rounded px-3 py-2 mb-3"
                value={form.username}
                onChange={handleChange}
            />

            <textarea
                name="bio"
                placeholder="Bio"
                className="w-full border rounded px-3 py-2 mb-3"
                value={form.bio}
                onChange={handleChange}
            />

            <input
                type="text"
                name="image"
                placeholder="Profile Image URL"
                className="w-full border rounded px-3 py-2 mb-3"
                value={form.image}
                onChange={handleChange}
            />

            {message && <p className="text-sm text-red-500 mb-3">{message}</p>}

            <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full py-2 bg-blue-600 text-white rounded"
            >
                {loading ? "Saving..." : "Save Profile"}
            </button>
        </div>
    );
}
