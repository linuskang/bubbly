import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import ReportUserButton from "@/components/reportUser";

interface Params {
  username: string;
}

export default async function UserProfilePage({ params }: { params: Params }) {
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
      {/* User Info */}
      <div className="flex items-center space-x-4">
        <Avatar className="h-20 w-20">
          <AvatarImage src={user.image || ""} />
          <AvatarFallback>{user.name?.[0]}</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-2xl font-semibold">{user.name || user.username}</p>
          <p className="text-sm text-muted-foreground">@{user.username}</p>
          <p className="text-xs text-muted-foreground">
            Joined {new Date(user.createdAt).toLocaleDateString()}
          </p>
          <ReportUserButton username={user.username!} />
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
