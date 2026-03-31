import { db, markersTable as markers } from "@workspace/db";

const wineries = [
  // RUSSIAN RIVER VALLEY
  {
    name: "Williams Selyem",
    note: "The benchmark Russian River Pinot. Allocation-heavy, appointment-only, and absolutely worth the effort. Old-vine purity at its finest.",
    category: "winery" as const,
    lat: 38.6330,
    lng: -122.8671,
  },
  {
    name: "Kosta Browne",
    note: "World-class Pinot Noir with a lush, precise house style. Get an appointment if you can — this is a bucket-list tasting.",
    category: "winery" as const,
    lat: 38.3979,
    lng: -122.8261,
  },
  {
    name: "Merry Edwards",
    note: "Old-vine Russian River Pinot royalty. Merry's wines are textbook Sonoma — elegant, cool-climate, endlessly drinkable.",
    category: "winery" as const,
    lat: 38.4092,
    lng: -122.8731,
  },
  {
    name: "Lynmar Estate",
    note: "Stunning Sebastopol estate with impeccable Pinot and Chardonnay. The grounds alone are worth the drive.",
    category: "winery" as const,
    lat: 38.3918,
    lng: -122.8741,
  },
  {
    name: "Gary Farrell",
    note: "Perched above the RRV with sweeping views. Single-vineyard Pinots that show exactly what this appellation can do.",
    category: "winery" as const,
    lat: 38.5837,
    lng: -122.8720,
  },
  {
    name: "Freeman Winery",
    note: "Intimate and unhurried. Redwood grove setting, cool wine cave, and Burgundian-inspired Pinots that reward attention.",
    category: "winery" as const,
    lat: 38.4360,
    lng: -122.8292,
  },
  {
    name: "Littorai",
    note: "Biodynamic, Burgundian, and deeply serious. Ted Lemon's coastal Pinot and Chardonnay are among California's finest.",
    category: "winery" as const,
    lat: 38.4050,
    lng: -122.8501,
  },
  {
    name: "Paul Mathew Vineyards",
    note: "Meet the actual winemakers. Husband-and-wife operation in Graton pouring single-vineyard Pinots with old-world soul.",
    category: "winery" as const,
    lat: 38.4443,
    lng: -122.8902,
  },
  {
    name: "Pax Wine Cellars",
    note: "Downtown Sebastopol gem for Rhône-variety fanatics. The Syrah here is exceptional — buy a bottle and settle in.",
    category: "winery" as const,
    lat: 38.4021,
    lng: -122.8285,
  },
  {
    name: "Landmark Vineyards",
    note: "Historic Kenwood tasting room with estate Chardonnay and Pinot. A reliable, refined stop without the appointment fuss.",
    category: "winery" as const,
    lat: 38.4200,
    lng: -122.5400,
  },
  {
    name: "Domaine de la Rivière",
    note: "Relatively new but already collecting accolades. Pinot Noir and Chardonnay with old-world grace and genuine hospitality.",
    category: "winery" as const,
    lat: 38.4794,
    lng: -122.9003,
  },

  // SONOMA VALLEY
  {
    name: "Benziger Family Winery",
    note: "The essential biodynamic stop in Glen Ellen. The tram tour actually teaches you something, and the setting is gorgeous.",
    category: "winery" as const,
    lat: 38.3684,
    lng: -122.5297,
  },
  {
    name: "Imagery Estate Winery",
    note: "Artist-label wines, a working art gallery, and a patio that doesn't feel like a tourist trap. Underrated and worth it.",
    category: "winery" as const,
    lat: 38.3621,
    lng: -122.5241,
  },
  {
    name: "Gundlach Bundschu",
    note: "California's oldest family winery. \"Gun Bun\" does it right — beautiful grounds, great events, and an underrated Gewürztraminer.",
    category: "winery" as const,
    lat: 38.2858,
    lng: -122.4438,
  },
  {
    name: "Scribe Winery",
    note: "Hacienda vibes near Sonoma Plaza, excellent pét-nat and sparkling, and a food program built around the land.",
    category: "winery" as const,
    lat: 38.2810,
    lng: -122.4231,
  },
  {
    name: "Buena Vista Winery",
    note: "California's first premium winery (1857). The history alone is worth a visit, and the wines hold their own.",
    category: "winery" as const,
    lat: 38.2968,
    lng: -122.4375,
  },
  {
    name: "Chateau St. Jean",
    note: "1920s chateau grandeur in Kenwood. Award-winning wines, manicured grounds, and breathtaking mountain views.",
    category: "winery" as const,
    lat: 38.4189,
    lng: -122.5441,
  },
  {
    name: "B. Wise Winery",
    note: "A cave tasting experience unlike anything else — dramatic barrel-vaulted tunnels in the Moon Mountain District.",
    category: "winery" as const,
    lat: 38.3504,
    lng: -122.4952,
  },
  {
    name: "Repris Winery",
    note: "The Moon Mountain ATV tour is as memorable as the wine. Cabernet planted in the 1880s. Rare and remarkable.",
    category: "winery" as const,
    lat: 38.3450,
    lng: -122.4882,
  },
  {
    name: "Three Sticks Wines",
    note: "Pre-Gold Rush adobe setting from 1842. Designed by Ken Fulk with the ambience of another era. Pinot and Chard.",
    category: "winery" as const,
    lat: 38.2925,
    lng: -122.4542,
  },
  {
    name: "Hamel Family Wines",
    note: "Certified biodynamic, dry-farmed since 2018. Cave tours, library tastings, Bordeaux-style blends. Appointment only.",
    category: "winery" as const,
    lat: 38.3094,
    lng: -122.5083,
  },
  {
    name: "Hanzell Vineyards",
    note: "Founded in 1953 by an ambassador inspired by Burgundy. Bird's-eye Sonoma Valley views and benchmark Chardonnay.",
    category: "winery" as const,
    lat: 38.3015,
    lng: -122.4712,
  },
  {
    name: "Viansa Winery",
    note: "Tuscan-inspired estate with Italian varietals, a deli marketplace, and picnic tables overlooking the valley.",
    category: "winery" as const,
    lat: 38.2768,
    lng: -122.3991,
  },
  {
    name: "Mayo Family Winery",
    note: "Absurd value for a deep-dive tasting in Kenwood. Many wines, attentive pours, zero pretension. A local secret.",
    category: "winery" as const,
    lat: 38.4299,
    lng: -122.5432,
  },
  {
    name: "St. Francis Winery",
    note: "Certified Sustainable family-owned estate. The food and wine pairing experience here is among Sonoma's best.",
    category: "winery" as const,
    lat: 38.4422,
    lng: -122.5419,
  },
  {
    name: "Coursey Graves",
    note: "French-inspired at 1,500 feet on Bennett Mountain. Panoramic views, Monet-style gardens, and luxury private tastings.",
    category: "winery" as const,
    lat: 38.4021,
    lng: -122.5193,
  },

  // DRY CREEK VALLEY
  {
    name: "Ferrari-Carano Vineyards",
    note: "Villa grandeur in Dry Creek. Stately rose gardens, early tastings, and a Fumé Blanc that earns its reputation.",
    category: "winery" as const,
    lat: 38.6205,
    lng: -122.8982,
  },
  {
    name: "Mauritson Wines",
    note: "Sixth-generation family Zinfandel. Honest, direct, and exactly what Dry Creek Valley should taste like.",
    category: "winery" as const,
    lat: 38.6308,
    lng: -122.9193,
  },
  {
    name: "Truett Hurst",
    note: "Biodynamic holistic farm with goats, sheep, chickens, and great Zinfandel. The eco-estate tour is a genuine delight.",
    category: "winery" as const,
    lat: 38.6400,
    lng: -122.9302,
  },
  {
    name: "Preston Farm & Winery",
    note: "No tour needed — winemaking operations visible in the courtyard. Feels like a European village bodega. Old-school cool.",
    category: "winery" as const,
    lat: 38.6491,
    lng: -122.9332,
  },
  {
    name: "Quivira Vineyards",
    note: "Biodynamic Dry Creek estate with certified-organic farming and a standout Zinfandel built on Rhône sensibility.",
    category: "winery" as const,
    lat: 38.6352,
    lng: -122.9198,
  },
  {
    name: "Dry Creek Vineyard",
    note: "The original Dry Creek label — and it shows. Consistent, honest, and the Fumé Blanc is a perennial benchmark.",
    category: "winery" as const,
    lat: 38.6290,
    lng: -122.9102,
  },
  {
    name: "Mounts Family Winery",
    note: "Tiny family operation where you might meet the winemaker. Rare varietals, bocce court, local vibes.",
    category: "winery" as const,
    lat: 38.6411,
    lng: -122.9015,
  },
  {
    name: "Ridge Lytton Springs",
    note: "Old-vine Zinfandel from one of California's most respected names. The Lytton Springs site is historic and essential.",
    category: "winery" as const,
    lat: 38.6388,
    lng: -122.8961,
  },

  // ALEXANDER VALLEY
  // Skipping Jordan Winery — already in database
  {
    name: "Francis Ford Coppola Winery",
    note: "Part winery, part resort — pools, bocce, Hollywood memorabilia. Great for groups and a genuinely fun afternoon.",
    category: "winery" as const,
    lat: 38.7181,
    lng: -122.9013,
  },
  {
    name: "Stonestreet Estate",
    note: "Mountain estate Cabernet at its Sonoma best. The Alexander Mountain terroir produces power with elegance.",
    category: "winery" as const,
    lat: 38.7342,
    lng: -122.7882,
  },
  {
    name: "Chalk Hill Estate",
    note: "1,300-acre estate with stunning views, warm hospitality, and terroir-driven Chardonnay that punches above its price.",
    category: "winery" as const,
    lat: 38.5387,
    lng: -122.7864,
  },
  {
    name: "Medlock Ames",
    note: "Modern rural-hipster done right. Founded by two college friends in 1998 with organic farming at the center.",
    category: "winery" as const,
    lat: 38.6437,
    lng: -122.8192,
  },
  {
    name: "Banshee Wines",
    note: "New Alexander Valley tasting room near Healdsburg. Pinot and vinyl — select your record, pour your wine, vibe out.",
    category: "winery" as const,
    lat: 38.6102,
    lng: -122.8695,
  },

  // HEALDSBURG
  {
    name: "Seghesio Family Vineyards",
    note: "The Healdsburg Zinfandel standard. Multi-generational, Italian-rooted, and pours with the ease of family confidence.",
    category: "winery" as const,
    lat: 38.6128,
    lng: -122.8669,
  },
  {
    name: "Locals Tasting Room",
    note: "One tasting room, seven small producers. The smartest first stop in Healdsburg for scoping what you want to pursue.",
    category: "winery" as const,
    lat: 38.7073,
    lng: -122.8942,
  },
  {
    name: "Bricoleur Vineyards",
    note: "Stunning RRV estate south of Healdsburg. Picnic wagons, bocce, rose gardens, and consistently elegant wines.",
    category: "winery" as const,
    lat: 38.5548,
    lng: -122.8698,
  },
  {
    name: "J Vineyards & Winery",
    note: "Top California sparkling wine producer. The Bubble Room five-course pairing is a legitimate destination dining experience.",
    category: "winery" as const,
    lat: 38.6038,
    lng: -122.8812,
  },
  {
    name: "Zina Hyde Cunningham Winery",
    note: "Sunset patio, fireplace inside, cheese boards, and three Healdsburg-area labels in one spot. The evening wind-down.",
    category: "winery" as const,
    lat: 38.6108,
    lng: -122.8698,
  },

  // CARNEROS / PETALUMA
  {
    name: "The Donum Estate",
    note: "50+ monumental sculptures on 200 acres plus world-class Pinot and Chardonnay. Art and wine in full Carneros elegance.",
    category: "winery" as const,
    lat: 38.2714,
    lng: -122.4658,
  },
  {
    name: "Schug Carneros Estate",
    note: "German-born winemaker Walter Schug's legacy estate. Benchmark Carneros Pinot and Chardonnay in a quiet setting.",
    category: "winery" as const,
    lat: 38.2809,
    lng: -122.4602,
  },
  {
    name: "Region Wine Bar",
    note: "Downtown Sebastopol's finest pour. 50+ wines by the taste via self-pour machines. The ideal first stop before any winery day.",
    category: "restaurant" as const,
    lat: 38.4028,
    lng: -122.8288,
  },
];

async function seed() {
  console.log(`Inserting ${wineries.length} spots...`);
  const result = await db.insert(markers).values(wineries).returning({ name: markers.name });
  console.log(`Seeded ${result.length} spots:`);
  result.forEach(r => console.log(`  ✓ ${r.name}`));
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
