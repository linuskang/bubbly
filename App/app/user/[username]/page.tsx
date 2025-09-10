import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import ReportUserButton from "@/components/reportUser";

export default async function UserProfilePage({ params }: { params: any }) {
  const username = params.username;

  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      name: true,
      username: true,
      image: true,
      createdAt: true,
      bubblers: {
        select: {
          id: true,
          name: true,
          description: true,
          latitude: true,
          longitude: true,
          verified: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!user) notFound();

  return (
    <div className="max-w-2xl mx-auto py-10 px-4 space-y-6">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user.image || ""} />
            <AvatarFallback className="bg-blue-600 text-white text-lg font-medium">
              {user.name?.[0] || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="font-medium text-gray-900">{user.name}</h3>
            <p className="text-xs font-medium text-gray-900">@{user.username}</p>
            <p className="text-xs text-gray-500 mt-1">
              Member since{" "}
              {new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Water Fountains Added</h2>
        {user.bubblers.length === 0 ? (
          <p className="text-sm text-muted-foreground">No fountains added yet.</p>
        ) : (
          <ul className="space-y-3">
            {user.bubblers.map((bubbler) => (
              <li
                key={bubbler.id}
                className="border rounded-lg p-3 shadow-sm hover:shadow-md transition"
              >
                <p className="font-medium">{bubbler.name}</p>
                {bubbler.description && (
                  <p className="text-sm text-gray-600">{bubbler.description}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  {bubbler.verified ? "Verified" : ""} • Added{" "}
                  {new Date(bubbler.createdAt).toLocaleDateString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
