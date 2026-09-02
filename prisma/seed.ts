import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.profile.upsert({
    where: { slug: "astou-diallo" },
    update: {
      firstName: "Astou",
      lastName: "Diallo",
      displayName: "Astou Diallo",
      jobTitle: "CEO et Fondatrice de AODI",
      company: "AODI",
      phone: "+22364763248",
      whatsapp: "https://wa.me/22364763248",
      snapchat: "https://snapchat.com/t/DS5aqTJ0",
      tiktok: "https://www.tiktok.com/@astoudiallo70",
      instagram: null,
      isActive: true,
    },
    create: {
      firstName: "Astou",
      lastName: "Diallo",
      displayName: "Astou Diallo",
      slug: "astou-diallo",
      jobTitle: "CEO et Fondatrice de AODI",
      company: "AODI",
      bio: null,
      profilePhoto: null,
      phone: "+22364763248",
      whatsapp: "https://wa.me/22364763248",
      email: null,
      instagram: null,
      facebook: null,
      linkedin: null,
      tiktok: "https://www.tiktok.com/@astoudiallo70",
      snapchat: "https://snapchat.com/t/DS5aqTJ0",
      website: null,
      address: null,
      isActive: true,
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
