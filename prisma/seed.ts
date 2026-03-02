import { PrismaClient, BadgeCategory } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding badge types...");

  const badgeTypes = [
    // Presence badges
    {
      tokenId: 1,
      name: "Bronze Presence",
      nameIt: "Presenza Bronzo",
      description: "Awarded for completing 15 hours of volunteer service.",
      descriptionIt: "Riconoscimento per 15 ore di servizio volontario completate.",
      category: BadgeCategory.PRESENCE,
      imageUrl: "/badges/bronze.svg",
      hoursRequired: 15,
      sortOrder: 1,
    },
    {
      tokenId: 2,
      name: "Silver Presence",
      nameIt: "Presenza Argento",
      description: "Awarded for completing 50 hours of volunteer service.",
      descriptionIt: "Riconoscimento per 50 ore di servizio volontario completate.",
      category: BadgeCategory.PRESENCE,
      imageUrl: "/badges/silver.svg",
      hoursRequired: 50,
      sortOrder: 2,
    },
    {
      tokenId: 3,
      name: "Gold Presence",
      nameIt: "Presenza Oro",
      description: "Awarded for completing 200 hours of volunteer service.",
      descriptionIt: "Riconoscimento per 200 ore di servizio volontario completate.",
      category: BadgeCategory.PRESENCE,
      imageUrl: "/badges/gold.svg",
      hoursRequired: 200,
      sortOrder: 3,
    },
    // Skill badges
    {
      tokenId: 10,
      name: "SafeHands",
      nameIt: "Mani Sicure",
      description: "Certified in first aid and emergency response procedures.",
      descriptionIt: "Certificazione in primo soccorso e procedure di emergenza.",
      category: BadgeCategory.SKILL,
      imageUrl: "/badges/safehands.svg",
      hoursRequired: null,
      sortOrder: 10,
    },
    {
      tokenId: 11,
      name: "LogisticsPro",
      nameIt: "Logistica Pro",
      description: "Expert in logistics, vehicle management and equipment maintenance.",
      descriptionIt: "Esperto in logistica, gestione mezzi e manutenzione attrezzature.",
      category: BadgeCategory.SKILL,
      imageUrl: "/badges/logistics-pro.svg",
      hoursRequired: null,
      sortOrder: 11,
    },
    {
      tokenId: 12,
      name: "TeamLeader",
      nameIt: "Capo Squadra",
      description: "Proven leadership in coordinating volunteer teams and shifts.",
      descriptionIt: "Comprovata leadership nel coordinamento di squadre e turni.",
      category: BadgeCategory.SKILL,
      imageUrl: "/badges/team-leader.svg",
      hoursRequired: null,
      sortOrder: 12,
    },
    // Special badges
    {
      tokenId: 20,
      name: "Hero Event",
      nameIt: "Evento Eroico",
      description: "Participated in a special emergency mission or disaster response.",
      descriptionIt: "Partecipazione a missione di emergenza speciale o risposta calamita'.",
      category: BadgeCategory.SPECIAL,
      imageUrl: "/badges/hero-event.svg",
      hoursRequired: null,
      sortOrder: 20,
    },
    {
      tokenId: 21,
      name: "Mentor",
      nameIt: "Mentore",
      description: "Recognized for training and mentoring new volunteers.",
      descriptionIt: "Riconoscimento per formazione e tutoraggio nuovi volontari.",
      category: BadgeCategory.SPECIAL,
      imageUrl: "/badges/mentor.svg",
      hoursRequired: null,
      sortOrder: 21,
    },
  ];

  for (const badge of badgeTypes) {
    await prisma.badgeType.upsert({
      where: { tokenId: badge.tokenId },
      update: badge,
      create: badge,
    });
  }

  console.log(`Seeded ${badgeTypes.length} badge types.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
