require("dotenv").config();
const mongoose = require("mongoose");
const Pet = require("./models/Pet");
const Application = require("./models/Application");

// Every photo below was checked by a human. Dogs come from the Dog CEO API
// at seed time, cats from The Cat API, rabbits and birds use fixed URLs.
const FALLBACK_DOG =
  "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800&q=80";
const FALLBACK_CATS = [
  {
    photoUrl:
      "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&q=80",
    breed: "Domestic Shorthair",
  },
  {
    photoUrl:
      "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=800&q=80",
    breed: "British Shorthair",
  },
];

const U = (id) => `https://images.unsplash.com/photo-${id}?w=800&q=80`;

// slug = dog.ceo breed path used to fetch a real photo for that breed
const dogs = [
  {
    name: "Bruno",
    breed: "Labrador",
    slug: "labrador",
    age: 2,
    gender: "male",
    description:
      "A happy goofball who lives for fetch and belly rubs. Great with kids.",
  },
  {
    name: "Sunny",
    breed: "Golden Retriever",
    slug: "retriever/golden",
    age: 1,
    gender: "female",
    description:
      "Gentle, patient and always smiling. Already knows sit and paw.",
  },
  {
    name: "Rex",
    breed: "German Shepherd",
    slug: "germanshepherd",
    age: 3,
    gender: "male",
    description: "Loyal and smart. Needs an active family with space to run.",
  },
  {
    name: "Mimi",
    breed: "Pug",
    slug: "pug",
    age: 4,
    gender: "female",
    description: "A professional lap warmer. Snores a little, loves a lot.",
  },
  {
    name: "Biscuit",
    breed: "Beagle",
    slug: "beagle",
    age: 0.5,
    gender: "male",
    description:
      "A curious puppy nose that follows every interesting smell in the house.",
  },
  {
    name: "Storm",
    breed: "Husky",
    slug: "husky",
    age: 2,
    gender: "female",
    description:
      "Striking blue eyes and endless energy. Best home has a yard and cool shade.",
  },
  {
    name: "Coco",
    breed: "Poodle",
    slug: "poodle",
    age: 5,
    gender: "female",
    description: "Calm, clever and low shedding. A perfect flat companion.",
  },
  {
    name: "Tank",
    breed: "English Bulldog",
    slug: "bulldog/english",
    age: 6,
    gender: "male",
    description:
      "Slow walks, long naps, maximum love. A true gentle giant at heart.",
  },
  {
    name: "Pickle",
    breed: "Dachshund",
    slug: "dachshund",
    age: 1,
    gender: "male",
    description:
      "Small body, huge personality. Follows his humans from room to room.",
  },
  {
    name: "Rocky",
    breed: "Boxer",
    slug: "boxer",
    age: 3,
    gender: "male",
    description:
      "Bouncy, playful and brave. Loves morning jogs and evening cuddles.",
  },
  {
    name: "Maple",
    breed: "Cocker Spaniel",
    slug: "spaniel/cocker",
    age: 0.4,
    gender: "female",
    description:
      "Soft ears, softer heart. A young pup learning the world one toy at a time.",
  },
  {
    name: "Zara",
    breed: "Rottweiler",
    slug: "rottweiler",
    age: 4,
    gender: "female",
    description:
      "Confident and deeply affectionate with her own people. Trained basics done.",
  },
  {
    name: "Pepper",
    breed: "Dalmatian",
    slug: "dalmatian",
    age: 2,
    gender: "male",
    description:
      "Spotty, speedy and full of fun. Needs daily play to stay happy.",
  },
  {
    name: "Kiko",
    breed: "Shiba Inu",
    slug: "shiba",
    age: 3,
    gender: "female",
    description:
      "Independent but loving on her own terms. Fox looks, cat attitude.",
  },
  {
    name: "Skye",
    breed: "Border Collie",
    slug: "collie/border",
    age: 1,
    gender: "female",
    description:
      "The smartest kid in class. Learns tricks in minutes and loves puzzles.",
  },
  {
    name: "Chowder",
    breed: "Chow Chow",
    slug: "chow",
    age: 7,
    gender: "male",
    description:
      "A calm senior lion looking for a quiet sofa to retire on. Very low maintenance.",
  },
];

const rabbits = [
  {
    name: "Snowy",
    breed: "White Mix",
    age: 1,
    gender: "female",
    description:
      "A quiet little cloud who loves coriander and gentle head rubs.",
    photoUrl: U("1585110396000-c9ffd4e4b308"),
  },
  {
    name: "Cookie",
    breed: "Lop Mix",
    age: 0.5,
    gender: "male",
    description:
      "Floppy ears, big appetite for hay and cuddles. Litter trained.",
    photoUrl: U("1535241749838-299277b6305f"),
  },
  {
    name: "Peaches",
    breed: "Mini Lop",
    age: 2,
    gender: "female",
    description: "Soft as a slipper and twice as sweet. Happy in a calm home.",
    photoUrl: U("1591382386627-349b692688ff"),
  },
];

const birds = [
  {
    name: "Rio",
    breed: "Sun Conure",
    age: 2,
    gender: "male",
    description:
      "A loud little rainbow who learns words fast and loves shoulder rides.",
    photoUrl: U("1555169062-013468b47731"),
  },
  {
    name: "Sky",
    breed: "Budgerigar",
    age: 1,
    gender: "male",
    description: "Chatty, tame and hand friendly. Comes with cage and toys.",
    photoUrl: U("1522858547137-f1dcec554f55"),
  },
];

const catNames = [
  {
    name: "Luna",
    age: 1,
    gender: "female",
    description: "A playful young cat who chases every sunbeam in the house.",
  },
  {
    name: "Oliver",
    age: 3,
    gender: "male",
    description: "A calm cuddle expert. Purrs the moment you sit down.",
  },
  {
    name: "Bella",
    age: 0.4,
    gender: "female",
    description: "A tiny kitten with a huge appetite for play and affection.",
  },
  {
    name: "Simba",
    age: 2,
    gender: "male",
    description:
      "Brave, curious and always first to greet visitors at the door.",
  },
  {
    name: "Nala",
    age: 5,
    gender: "female",
    description:
      "A gentle senior lady looking for a sunny window seat to call hers.",
  },
  {
    name: "Oreo",
    age: 1,
    gender: "male",
    description:
      "Half mischief, half marshmallow. Keeps the whole house laughing.",
  },
];

async function dogPhoto(slug) {
  try {
    const res = await fetch(`https://dog.ceo/api/breed/${slug}/images/random`);
    const data = await res.json();
    if (data.status === "success") return data.message;
  } catch (e) {
    console.log(`  photo fetch failed for ${slug}, using fallback`);
  }
  return FALLBACK_DOG;
}

// Real cat photos with matching breed names from The Cat API.
async function catList() {
  try {
    const res = await fetch(
      "https://api.thecatapi.com/v1/images/search?has_breeds=1&limit=6",
    );
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      return data.slice(0, 6).map((c, i) => ({
        ...catNames[i % catNames.length],
        breed: c.breeds?.[0]?.name || "Domestic Shorthair",
        photoUrl: c.url,
      }));
    }
  } catch (e) {
    console.log("  cat API unreachable, using fallback cats");
  }
  return FALLBACK_CATS.map((c, i) => ({ ...catNames[i], ...c }));
}

async function seed() {
  const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/pet_adoption";
  await mongoose.connect(uri);

  await Application.deleteMany({});
  await Pet.deleteMany({});
  console.log("Cleared old pets and applications");

  for (const d of dogs) {
    const photoUrl = await dogPhoto(d.slug);
    const { slug, ...rest } = d;
    await Pet.create({
      ...rest,
      species: "dog",
      photoUrl,
      status: "available",
    });
    console.log(`Added ${d.name} (dog, ${d.breed})`);
  }

  for (const c of await catList()) {
    await Pet.create({ ...c, species: "cat", status: "available" });
    console.log(`Added ${c.name} (cat, ${c.breed})`);
  }

  for (const r of rabbits) {
    await Pet.create({ ...r, species: "rabbit", status: "available" });
    console.log(`Added ${r.name} (rabbit, ${r.breed})`);
  }

  for (const b of birds) {
    await Pet.create({ ...b, species: "bird", status: "available" });
    console.log(`Added ${b.name} (bird, ${b.breed})`);
  }

  const total = await Pet.countDocuments();
  console.log(`Done. ${total} pets across 4 species, all available.`);
  await mongoose.disconnect();
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
