// c:\Users\krish\.gemini\antigravity\scratch\Seafarer\SeaRoster\server\src\seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // Clear old data
    await prisma.dailyLog.deleteMany();
    await prisma.crewMember.deleteMany();
    await prisma.user.deleteMany();

    console.log('Cleaned DB');

    // Create Users
    const admin = await prisma.user.create({
        data: {
            email: 'admin@searoster.com',
            password: 'hashedpassword123', // In real app, use bcrypt
            name: 'System Admin',
            role: 'ADMIN'
        }
    });

    const master = await prisma.user.create({
        data: {
            email: 'master@ship.com',
            password: 'password123',
            name: 'Capt. Sparrow',
            role: 'DEPT_HEAD',
            department: 'DECK'
        }
    });

    // Create Crew
    const crewMembers = [
        { firstName: 'Jack', lastName: 'Sparrow', rank: 'Master', department: 'DECK', userId: master.id },
        { firstName: 'Will', lastName: 'Turner', rank: 'Ch. Off', department: 'DECK' },
        { firstName: 'Hector', lastName: 'Barbossa', rank: '2nd Off', department: 'DECK' },
        { firstName: 'Joshamee', lastName: 'Gibbs', rank: 'Bosun', department: 'DECK' },
        { firstName: 'Davy', lastName: 'Jones', rank: 'Ch. Eng', department: 'ENGINE' },
    ];

    for (const c of crewMembers) {
        await prisma.crewMember.create({
            data: c
        });
    }

    console.log('Seeded Users and Crew');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
