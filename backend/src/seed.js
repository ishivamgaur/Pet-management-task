require("dotenv").config();
require("./config/dns");

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
  {
    name: "Clover",
    breed: "Netherland Dwarf",
    age: 1,
    gender: "female",
    description:
      "Tiny, tidy and very clever. Uses a litter tray without ever being told.",
    photoUrl: U("1585110396000-c9ffd4e4b308"),
  },
  {
    name: "Bramble",
    breed: "Rex",
    age: 3,
    gender: "male",
    description:
      "Velvet coat, gentle manners. Wants a patient home that lets him settle.",
    photoUrl: U("1535241749838-299277b6305f"),
  },
  {
    name: "Nutmeg",
    breed: "Dutch",
    age: 0.5,
    gender: "female",
    description:
      "A bright little bundle who has already learned to come when called.",
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
  {
    name: "Pip",
    breed: "Cockatiel",
    age: 4,
    gender: "male",
    description:
      "Whistles whole songs. Prefers a home where someone is around most days.",
    photoUrl: U("1555169062-013468b47731"),
  },
  {
    name: "Kiwi",
    breed: "Lovebird",
    age: 1,
    gender: "female",
    description: "Tiny, bright and endlessly curious. Best kept in pairs.",
    photoUrl: U("1522858547137-f1dcec554f55"),
  },
  {
    name: "Mango",
    breed: "Budgerigar",
    age: 0.5,
    gender: "male",
    description: "Young and still learning, but already steps up onto a finger.",
    photoUrl: U("1555169062-013468b47731"),
  },
];

// Extra dogs beyond the main list. Same shape as `dogs`, so they go
// through the same breed photo lookup.
const moreDogs = [
  {
    name: "Rocco",
    breed: "Doberman",
    slug: "doberman",
    age: 2,
    gender: "male",
    description: "Lean, clever and devoted. Wants a home that will train him.",
  },
  {
    name: "Pumpkin",
    breed: "Dachshund",
    slug: "dachshund",
    age: 6,
    gender: "female",
    description: "Short legs, long opinions. Burrows under blankets without asking.",
  },
  {
    name: "Atlas",
    breed: "Great Dane",
    slug: "greatdane",
    age: 1,
    gender: "male",
    description: "Will grow to a hundred pounds. Currently thinks he is a lap dog.",
  },
  {
    name: "Wren",
    breed: "Whippet",
    slug: "whippet",
    age: 2,
    gender: "female",
    description: "Runs like the wind, sleeps like a rock. Sweet and quiet.",
  },
  {
    name: "Frankie",
    breed: "Chihuahua",
    slug: "chihuahua",
    age: 4,
    gender: "male",
    description: "All attitude in a very small package. Fine with older children.",
  },
  {
    name: "Olive",
    breed: "Cocker Spaniel",
    slug: "cocker",
    age: 7,
    gender: "female",
    description: "A calm senior lady who wants a sofa and a person nearby.",
  },
  {
    name: "Bandit",
    breed: "Australian Shepherd",
    slug: "australian",
    age: 3,
    gender: "male",
    description: "Works hard, plays hard. Not suited to a quiet, sedentary home.",
  },
  {
    name: "Nyx",
    breed: "Husky",
    slug: "husky",
    age: 2,
    gender: "female",
    description: "Talks constantly, escapes often, loves snow and everyone.",
  },
  {
    name: "Mocha",
    breed: "Cavapoo",
    slug: "cavapoo",
    age: 1,
    gender: "female",
    description: "A soft, easy puppy who has already picked her favourite person.",
  },
  {
    name: "Rogue",
    breed: "Rottweiler",
    slug: "rottweiler",
    age: 4,
    gender: "male",
    description: "Calm and steady with structure. Needs an experienced home.",
  },
  {
    name: "Gus",
    breed: "Saint Bernard",
    slug: "stbernard",
    age: 5,
    gender: "male",
    description: "A mountain of a dog with a surprisingly gentle temperament.",
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
  {
    name: "Shadow",
    age: 4,
    gender: "male",
    description: "Reserved for the first month, then completely devoted.",
  },
  {
    name: "Willow",
    age: 6,
    gender: "female",
    description: "Calm, tidy and low maintenance. Content to watch the world go by.",
  },
  {
    name: "Jasper",
    age: 2,
    gender: "male",
    description: "Chirps at birds. Would very much like to catch one, so secure screens please.",
  },
  {
    name: "Mittens",
    age: 1,
    gender: "female",
    description: "A little menace who will steal anything left on the counter.",
  },
  {
    name: "Salem",
    age: 3,
    gender: "male",
    description: "Black coat, white paw, enormous personality.",
  },
  {
    name: "Cleo",
    age: 0.5,
    gender: "female",
    description: "One leg, endless energy. Special needs adopter wanted.",
  },
  {
    name: "Tofu",
    age: 2,
    gender: "male",
    description: "Floofy, unbothered and extremely photogenic.",
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
// That API caps a response at 10 images however large limit is, so more
// cats means walking pages, not asking for a bigger page.
async function catList(wanted = catNames.length) {
  const images = [];
  for (let page = 1; images.length < wanted && page <= 4; page++) {
    try {
      const res = await fetch(
        `https://api.thecatapi.com/v1/images/search?has_breeds=1&limit=10&page=${page}`,
      );
      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) break;
      images.push(...data);
    } catch (e) {
      console.log("  cat API unreachable, using fallback cats");
      break;
    }
  }

  if (images.length) {
    return images.slice(0, wanted).map((c, i) => ({
      ...catNames[i],
      breed: c.breeds?.[0]?.name || "Domestic Shorthair",
      photoUrl: c.url,
    }));
  }

  return FALLBACK_CATS.map((c, i) => ({ ...catNames[i], ...c }));
}

// A realistic mix rather than everything "available", so the status
// filters and the admin status selector have something to work with.
// Deterministic so repeated runs give the same spread.
function statusFor(index) {
  if (index % 9 === 4) return "adopted";
  if (index % 4 === 1) return "pending";
  return "available";
}

async function seed() {
  const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/pet_adoption";
  await mongoose.connect(uri);

  // Seeding used to wipe everything, which silently destroyed real
  // applications. Now it only inserts what is missing, so it is safe to
  // run against a database you care about. Pass --reset to wipe anyway.
  if (process.argv.includes("--reset")) {
    await Application.deleteMany({});
    await Pet.deleteMany({});
    console.log("--reset given, cleared pets and applications");
  }

  const existing = new Set((await Pet.find({}, { name: 1 })).map((p) => p.name));
  const seen = new Set();
  let added = 0;
  let skipped = 0;

  async function add(pet) {
    // Guard against duplicates inside this catalogue too, not just against
    // what is already in the database.
    if (seen.has(pet.name) || existing.has(pet.name)) {
      skipped++;
      return;
    }
    seen.add(pet.name);
    await Pet.create({ ...pet, status: statusFor(added + skipped) });
    added++;
  }

  for (const d of [...dogs, ...moreDogs]) {
    const { slug, ...rest } = d;
    await add({ ...rest, species: "dog", photoUrl: await dogPhoto(slug) });
  }

  for (const c of await catList()) {
    await add({ ...c, species: "cat" });
  }

  for (const r of rabbits) await add({ ...r, species: "rabbit" });
  for (const b of birds) await add({ ...b, species: "bird" });

  const total = await Pet.countDocuments();
  const byStatus = await Pet.aggregate([{ $group: { _id: "$status", n: { $sum: 1 } } }]);
  console.log(`\nAdded ${added} pets, skipped ${skipped} already present.`);
  console.log(`Database now holds ${total} pets.`);
  byStatus.forEach((s) => console.log(`  ${s._id}: ${s.n}`));
  await mongoose.disconnect();
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
