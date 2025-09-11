import { prisma } from "@/lib/prisma";

export const LEVELS = [
    { level: 1, requiredXP: 0 },
    { level: 2, requiredXP: 50 },
    { level: 3, requiredXP: 100 },
    { level: 4, requiredXP: 150 },
    { level: 5, requiredXP: 200 },
    { level: 6, requiredXP: 250 },
    { level: 7, requiredXP: 300 },
    { level: 8, requiredXP: 350 },
    { level: 9, requiredXP: 400 },
    { level: 10, requiredXP: 450 },
];

export const XP_REWARDS = {
    ADD_REVIEW: 10,
    EDIT_WAYPOINT: 20,
    ADD_WAYPOINT: 30,
};

export function getLevelFromXP(xp: number) {
    let level = 1;
    for (const lvl of LEVELS) {
        if (xp >= lvl.requiredXP) level = lvl.level;
        else break;
    }
    return level;
}

export async function getUserXP(userId: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { xp: true, level: true },
    });
    if (!user) throw new Error("User not found");
    return user;
}

export async function giveXP(userId: string, xpToAdd: number) {
    const user = await getUserXP(userId);

    const newXP = user.xp + xpToAdd;
    const newLevel = getLevelFromXP(newXP);
    const leveledUp = newLevel > user.level;

    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { xp: newXP, level: newLevel },
    });

    return updatedUser;
}

export async function removeXP(userId: string, xpToRemove: number) {
    const user = await getUserXP(userId);
    const newXP = Math.max((user.xp ?? 0) - xpToRemove, 0);
    const newLevel = getLevelFromXP(newXP);

    return prisma.user.update({
        where: { id: userId },
        data: { xp: newXP, level: newLevel },
    });
}