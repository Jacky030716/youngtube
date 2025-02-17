import { db } from "@/db/drizzle";
import { categories } from "@/db/schema";

const categoryNames = [
  "Car and vehicles",
  "Comedy",
  "Education",
  "Gaming",
  "Entertainment",
  "Film and Animation",
  "Music",
  "News and Politics",
  "Pets and Animals",
  "Science and Technology",
  "Sports",
  "Trading and Investment",
  "Travel and Events",
];

async function main() {
  console.log("Seeding categories...");

  try {
    for (const category of categoryNames) {
      await db.insert(categories).values({
        name: category,
        description: `All ${category.toLowerCase()} videos`,
      });
    }

    console.log("Categories seeded successfully!");
  } catch (error) {
    console.error("Error seeding categories:", error);
    process.exit(1);
  }
}

main();
