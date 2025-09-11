import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import ReportUserButton from "@/components/reportUser";

const PAGE_SIZE = 5;

type UserProfilePageProps = {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ page?: string | string[] }>;
};

export default async function UserProfilePage({
                                                params,
                                                searchParams,
                                              }: UserProfilePageProps) {
  const { username } = await params;

  const { page: pageParam } = await searchParams;
  const rawPage = Array.isArray(pageParam) ? pageParam[0] : pageParam;
  const page = Number(rawPage) > 0 ? Number(rawPage) : 1;
  const skip = (page - 1) * PAGE_SIZE;

  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      name: true,
      bio: true,
      username: true,
      image: true,
      createdAt: true,
      _count: { select: { bubblers: true } },
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
        skip,
        take: PAGE_SIZE,
      },
    },
  });

  if (!user) notFound();

  const totalPages = Math.ceil(user._count.bubblers / PAGE_SIZE);

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
              {user.bio && (
                  <p className="text-sm text-gray-600 mt-1">{user.bio}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Member since{" "}
                {new Date(user.createdAt).toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
            <ReportUserButton username={username} />
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

          {totalPages > 1 && (
              <div className="flex justify-between items-center pt-4">
                {page > 1 ? (
                    <a
                        href={`?page=${page - 1}`}
                        className="px-3 py-1 border rounded-md text-sm hover:bg-gray-100"
                    >
                      Previous
                    </a>
                ) : (
                    <span />
                )}

                <p className="text-sm text-gray-600">
                  Page {page} of {totalPages}
                </p>

                {page < totalPages ? (
                    <a
                        href={`?page=${page + 1}`}
                        className="px-3 py-1 border rounded-md text-sm hover:bg-gray-100"
                    >
                      Next
                    </a>
                ) : (
                    <span />
                )}
              </div>
          )}
        </div>
      </div>
  );
}
