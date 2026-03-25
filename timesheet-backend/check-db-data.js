
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const projects = await prisma.project.findMany({
        include: {
            client: true
        }
    });
    console.log('📊 Total projects:', projects.length);
    console.log(JSON.stringify(projects, null, 2));

    const clients = await prisma.client.findMany();
    console.log('🏢 Total clients:', clients.length);
    console.log(JSON.stringify(clients, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
