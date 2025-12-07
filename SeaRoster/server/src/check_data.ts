
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("--- Checking Database Content ---");

    const crew = await prisma.crewMember.findMany();
    console.log(`Crew Members: ${crew.length}`);
    crew.forEach(c => console.log(` - ${c.firstName} ${c.lastName} (${c.id})`));

    const logs = await prisma.dailyLog.findMany();
    console.log(`\nDaily Logs: ${logs.length}`);
    logs.forEach(l => console.log(` - Crew: ${l.crewId} | Date: ${l.date} | Grid: ${l.grid.substring(0, 10)}...`));

    if (logs.length === 0) {
        console.log("\nWARNING: No logs found in the database. Client sync might be failing.");
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
