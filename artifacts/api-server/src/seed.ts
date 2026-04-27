import { db, markersTable } from "@workspace/db";
import { count, eq, inArray, sql } from "drizzle-orm";
import { logger } from "./lib/logger";

// Entries removed from the curated list — deleted from DB on every boot
const REMOVED_FROM_SEED: string[] = [
  "Heyday Cafe",              // permanently closed
  "The Farm Table",           // permanently closed (Jan 2026)
  "Cascada",                  // permanently closed (March 2025)
  "Smith Flat House",         // dining room closed Jan 31 2026; events-only venue
  "diVittorio Winery",        // permanently closed 2025
  "Sloan Winters Mountain Orchard", // no web presence; operating status unconfirmed
  "Jodar Vineyards & Winery", // permanently closed
  "Latcham Vineyards",        // permanently closed
  "Fitzpatrick Winery & Lodge", // permanently closed
  "Lava Cap Wine Bar & Bistro", // no evidence this location exists
  "Kids Inc. Apple Ranch",    // no confirmed 2025 operating information
  "Argonaut Farm to Fork Cafe", // renamed — replaced by "Argonaut Coffee & Provisions"
  // Removed after editorial review
  "Crystal Basin Cellars",    // no distinctive story; note was entirely about the collective affiliation
  "E16 Winery",               // no wine story, no producer angle
  "Kehret Vineyards",         // "worth tracking" = not ready to recommend
  "Cantiga Winery",           // note described a category, not this specific winery
  "Château d'Estienne",       // note was views and hours only; no wine angle
  "Busby Cellars",            // note was generic marketing copy; no editorial angle
  "El Dorado County Farmers Market — Placerville", // not a destination; weekly transient event
  "Gold Hill Vineyard Farmstand", // duplicate of Gold Hill Vineyard winery; olive oil detail merged into winery note
  "South Fork Farm",          // CSA/market-only; no visitable location
  "Argyres Orchard",          // open only ~16 days per year (two weekends)
  "Sienna Restaurant",        // suburban Town Center grill; no connection to local food/wine story
  "Milestone Restaurant & Cocktail Bar", // same issue; El Dorado Hills Town Center
  "Windwalker Vineyard & Winery",   // weak note; no shortage of Fair Play wineries
  "Bumgarner Winery",               // "excellent service and reasonable price point" — Yelp summary
  "Medeiros Family Wines",          // Passport Weekend events only; no standalone story
  "Lewis Grace Winery",             // "25 award-winning wines" as lead; no specific wine argument
  "Nello Olivo Winery",             // event-dependent (Godfather once/year); placeholder website
  "Chateau Davell",                 // event venue framing; placeholder website
  "Abel's Acres",                   // generic Larsen Drive farm; no distinction
  "Denver Dan's",                   // same situation as Abel's
  "El Dorado Orchards",             // generic note; "quieter" is not enough
  "Smokey Ridge Farm & Winery",     // thin note; confused category
  "Henry's Steakhouse",             // casino steakhouse; no connection to local food identity
];

const SEED_DATA = [
  // ── WINERIES: EL DORADO AVA ───────────────────────────────────────────────
  { name: "Boeger Winery", city: "Placerville", note: "The benchmark. Greg Boeger planted the first vines in 1972, making this the oldest producing winery in El Dorado County. Planted on a historic Gold Rush homestead on Carson Road, the property has its own 1872 pear orchard still bearing fruit. The Barbera and Zinfandel are grown at 2,600 feet on decomposed granite. Tasting room open daily — walk-ins welcome, no appointment needed. This is where El Dorado mountain viticulture begins.", category: "winery", lat: 38.7207, lng: -120.6884, website: "https://www.boegerwinery.com" },
  { name: "Lava Cap Winery", city: "Placerville", note: "Family estate on Fruitridge Road at 2,600 feet. The volcanic basalt soils here — the 'lava cap' — drain fast and stress the vines just enough. Barbera, Zinfandel, Petite Sirah, and a Muscat that earns its place. Tasting room open Thu–Mon with sweeping views into the valley. The Petite Sirah is among the most structured in the county.", category: "winery", lat: 38.7440, lng: -120.6729, website: "https://www.lavacap.com" },
  { name: "Madrona Vineyards", city: "Camino", note: "Three family-owned vineyards at mountain elevation — one in Apple Hill, two in Pleasant Valley — producing an unusually wide range of Rhône and Bordeaux varietals. Winemakers Paul and Maggie Bush. The Dry Riesling is a signature; the Tempranillo and Viognier are equally serious. Own-rooted vines in deep Aiken clay loam soils. Sit-down tasting experiences with reservations recommended. The most complete estate experience in El Dorado County.", category: "winery", lat: 38.7068, lng: -120.6258, website: "https://www.madronavineyards.com" },
  { name: "Holly's Hill Vineyards", city: "Placerville", note: "The Rhône specialists of El Dorado County. Planted entirely to Rhône varieties — Grenache, Syrah, Mourvèdre, Counoise, Roussanne, Viognier — on decomposed granite at 2,700 feet. Co-winemaker and brewer Josh also makes artisanal craft beers on site, including experimental hybrids. The Patriarche Rhône blend is a regional benchmark — Mourvedre, Syrah, Grenache, Counoise together. The best combination of winery, brewery, and food in the county.", category: "winery", lat: 38.5938, lng: -120.7044, website: "https://www.hollyshill.com" },
  { name: "Narrow Gate Vineyards", city: "Placerville", note: "The most philosophically compelling winery in El Dorado County. The entire 86-acre farm is Demeter-certified biodynamic — certified since 2010, organic since 2007. Winemaker Frank Hildebrand composts from grape skins, cow manure, and biodynamic preparations. Whole-berry fermentation, native yeasts, hand punch-downs. The tasting room is a candlelit cellar with outdoor patio, cheese and charcuterie boards, and seasonal pairing events. Seek the Syrah-Viognier co-ferment and port-style Chocolate Splash. The Slow Food ideal in a bottle.", category: "winery", lat: 38.5847, lng: -120.6867, website: "https://www.narrowgatevineyards.com" },
  { name: "Miraflores Winery", city: "Placerville", note: "Estate vineyard on Four Springs Trail at 2,200 feet, planted on a historic apple orchard site. Known for Spanish varieties — Tempranillo, Garnacha, Monastrell — alongside mountain Zinfandel and Barbera. Small-production, family-run, and one of the quieter gems in the El Dorado AVA. The cellar cave tastings are worth booking.", category: "winery", lat: 38.7095, lng: -120.6971, website: "https://www.mirafloreswinery.com" },
  { name: "Gold Hill Vineyard", city: "Placerville", note: "Estate winery on Vineyard Lane at 2,400 feet — a working farm that also makes wine. The Zinfandel is planted on old vines in granitic loam soils. The on-site farmstand carries estate olive oil cold-pressed on the property, vineyard eggs, and seasonal vegetables alongside bottles to take home. One of the friendliest stops in the El Dorado AVA corridor, and one of the few places where you can taste the wine and bring home the oil pressed from the same land.", category: "winery", lat: 38.6982, lng: -120.7003, website: "https://www.goldhillvineyard.com" },
  { name: "Sierra Vista Vineyards", city: "Placerville", note: "Forty-plus-year estate on Pleasant Valley Road at 2,900 feet — one of the highest-elevation tasting rooms in El Dorado County. The Rhône program here is serious: Syrah, Viognier, Grenache, and a Syrah-Grenache blend that shows what Fair Play-adjacent elevations can do. Walk-in tastings available weekends; check the calendar for harvest events.", category: "winery", lat: 38.6140, lng: -120.6915, website: "https://www.sierravistawinery.com" },
  { name: "Toogood Estate Winery", city: "Somerset", note: "Two distinct tasting experiences: the sprawling Fair Play estate on Fairplay Road and a conveniently located downtown Placerville tasting room. Girl Scout Cookie pairings in February are a perennial sellout. Solid range of Rhône and Bordeaux varietals at both locations. Estate open daily 11am–6pm; downtown Thurs–Mon 1–8pm.", category: "winery", lat: 38.6055, lng: -120.7092, website: "https://www.toogoodwinery.com" },
  { name: "David Girard Vineyards", city: "Placerville", note: "Located near Coloma in the South Fork American River Valley — a scenic setting outside the usual Apple Hill and Fair Play corridors. Elegant, food-oriented wines made for the table. Weekend tastings Fri–Sun 11am–5pm; plan ahead as the drive requires intention. A quieter, more intimate discovery than the main wine trail stops.", category: "winery", lat: 38.8018, lng: -120.8822, website: "https://www.davidgirardvineyards.com" },
  { name: "Starfield Vineyards & Winery", city: "Placerville", note: "Boutique winery in the heart of Apple Hill with full food service — light bites, lunch, and dinner by reservation until 7pm. Mountain views, outdoor dining, and consistently reviewed as one of the best winery dining experiences in the county. Daily 11am–5pm; dinner until 7pm by reservation. Sat–Sun reservations recommended.", category: "winery", lat: 38.736853, lng: -120.755874, website: "https://www.starfieldvineyards.com" },
  { name: "Fenton Herriott Vineyards", city: "Placerville", note: "Estate winery at the gateway to Apple Hill — the property sits on what was once the old Pony Express Route, giving it a historical layer that most Apple Hill stops lack. Founded in 2002 on volcanic soil in the Northern Sierra Foothills. The naturally balanced growing conditions produce wines the winemaker describes as well-structured yet complex. Open daily 11am–5pm, one of the most accessible tasting rooms in the Apple Hill corridor.", category: "winery", lat: 38.7409887, lng: -120.7597792, website: "https://www.fentonherriott.com" },

  // ── WINERIES: FAIR PLAY AVA ───────────────────────────────────────────────
  { name: "Cedarville Vineyard", city: "Somerset", note: "Jonathan and Susan Lacey's estate on Fair Play Road — a reference point for what this high-elevation appellation can produce. Syrah, Grenache, Zinfandel, and Viognier from dry-farmed organically managed vines. Appointment-only tastings; small allocation. One of the wines people drive to Fair Play specifically to find.", category: "winery", lat: 38.5892, lng: -120.6880, website: "https://cedarvillevineyard.com" },
  { name: "Skinner Vineyards", city: "Somerset", note: "Fair Play AVA estate named for the Skinner family who farmed this land during the Gold Rush. The winery revives that heritage with mountain Zinfandel, Barbera, and Rhône-style blends. The tasting room has views across the appellation and the team pours honestly — no upsell, just wine. Check the event calendar for barrel tastings and harvest dinners.", category: "winery", lat: 38.5968, lng: -120.7128, website: "https://www.skinnervineyards.com" },
  { name: "Mellowood Vineyard", city: "Somerset", note: "Owned and operated by a Kenyan transplant winemaker in the Fair Play AVA — one of the most distinctive producer stories in the entire Sierra Foothills. Award-winning wines paired with KK's Kenyan BBQ and Kachumbari salad prepared with imported East African spices on beautiful patios overlooking the oak grove and vineyard. Genuinely unusual and worth making the drive to Fair Play specifically for.", category: "winery", lat: 38.5921, lng: -120.7155, website: "https://www.mellowoodvineyard.com" },
  { name: "Gwinllan Estate", city: "Somerset", note: "The sparkling wine specialist of the Fair Play AVA — a Welsh-named estate on Fairplay Road making Blanc de Noirs, Brut, and a late-disgorged sparkling that has won Best Sparkling at the Foothill Wine Competition four consecutive years. A genuinely rare thing: serious, traditional-method sparkling wine made at elevation in the Sierra foothills. Small production, appointment-preferred, and worth planning ahead for.", category: "winery", lat: 38.6125, lng: -120.6958, website: "https://www.gwinllanestate.com" },
  { name: "Cielo Sulla Terra", city: "Somerset", note: "Italian-inspired estate on Perry Creek Road — 'sky above the earth,' planted with Primitivo (a Zinfandel clone), Sangiovese, Barbera, and Vermentino. The 2024 Rosé of Primitivo 'Primarosa' won Best of Show at the Foothill Wine Competition 2025. Thoughtfully made small-production wines from a family that takes the Italian-Californian connection seriously. Open Fri–Sun, 8061 Perry Creek Rd.", category: "winery", lat: 38.5828, lng: -120.6855, website: "https://cielosullaterra.com" },
  { name: "Element 79 Vineyards", city: "Somerset", note: "Fair Play AVA estate at 2,400 feet on Fairplay Road — consistently one of the top-rated wineries in El Dorado County. Open seven days a week (11am–5pm, Mon–Wed from noon), which makes it one of the most accessible tasting rooms in the AVA. A well-regarded stop for visitors who want to spend a full week in the Fair Play wine country without planning around weekend-only hours.", category: "winery", lat: 38.6040, lng: -120.7100, website: "https://www.element79vineyards.com" },
  { name: "Saluti Cellars", city: "Somerset", note: "A hidden gem tucked into a 250-acre canyon on Grizzly Flat Road in the heart of the Fair Play AVA. Owner Randy Rossi makes small-production wines in a setting that feels genuinely off the beaten path — the canyon and the views reward the extra miles on the back roads. Open Sat–Sun 11am–5pm. One of those wineries that regulars keep to themselves.", category: "winery", lat: 38.6334, lng: -120.6242, website: "https://www.saluticellars.com" },
  { name: "José Wine Caves", city: "Garden Valley", note: "A family-owned boutique winery in Garden Valley, north of Placerville on the Hwy 193 corridor — the tasting room is built into natural wine caves overlooking the historic Coloma Valley. Founded by the Elena family. Hand-tended vines, cool cave aging, and a setting unlike anything else in El Dorado County. Open Sat–Sun 10am–5pm. Worth the drive north if you want a genuinely different wine country experience.", category: "winery", lat: 38.8485, lng: -120.8290, website: "https://josewinecaves.com" },

  // ── APPLE HILL / FARMSTANDS ───────────────────────────────────────────────
  { name: "High Hill Ranch", city: "Camino", note: "The iconic Apple Hill destination — 60-plus apple varieties on a 40-acre ranch at 3,000 feet on High Hill Road. Fresh-pressed cider, apple pies, caramel apples, and a petting zoo. The crowds on October weekends are real — arrive before 10 AM. Open late July through December; peak season August through November. One of the most visited destinations in El Dorado County.", category: "farmstand", lat: 38.7155, lng: -120.6234, website: "https://www.highhillranch.com" },
  { name: "Boa Vista Orchards", city: "Placerville", note: "One of Apple Hill's oldest farms — 50-plus apple varieties, pears, Asian pears, and a full farm store on Carson Road. Known for exceptional fresh apple cider, homemade pies, and the kind of farm stand that hasn't been sanitized for tourism. The gift shop carries local honeys and jams. Open August through December.", category: "farmstand", lat: 38.7126, lng: -120.6408, website: "https://www.boavistaorchards.com" },
  { name: "Rainbow Orchards", city: "Camino", note: "U-pick apples on Larsen Drive — Galas, Fujis, Jonagolds, and heirloom varieties on a working family orchard. The u-pick experience here is genuine: you bag your own fruit, weigh it at the barn. Cider doughnuts on weekends. A good choice when you want to pick your own rather than buying from a farm store. Open late August through December.", category: "farmstand", lat: 38.7150, lng: -120.6315, website: "https://www.rainboworchards.net" },
  { name: "Delfino Farms", city: "Camino", note: "Home of Joan's Apple Bakery — one of Apple Hill's most beloved stops. Fresh-baked apple pies, apple butter, cider doughnuts, and seasonal baked goods made on-site at 3205 North Canyon Road. The pies are what people drive up the hill for: made from tree-picked apples, baked throughout the day. Open late August through December. A farm with genuine warmth behind it.", category: "farmstand", lat: 38.7180, lng: -120.6300, website: "https://delfinofarms.com" },
  { name: "American River Cherry Co.", city: "Placerville", note: "Natural-grown (not certified organic) fruit farm on Dias Drive north of Placerville — cherries, blackberries, blueberries, boysenberries, figs, lavender, raspberries, persimmons, and honey from farm hives. U-pick and already-picked. Cherry season in May–June is one of the foothills' great seasonal pleasures. A quieter, more intimate experience than the Apple Hill crowds. Picnic area on site.", category: "farmstand", lat: 38.7390, lng: -120.7815, website: "https://www.americanrivercherryco.com" },
  { name: "24 Carrot Farm", city: "Placerville", note: "CERTIFIED ORGANIC for all crops — apples, pumpkins, and honey from farm hives on Jacquier Road in the Apple Hill area. Chemical-free operation, formerly Willow Pond Farm. A conscientious choice when you want to buy produce from a farm operating with serious agricultural values. Daily 10am–5pm, seasonal.", category: "farmstand", lat: 38.7200, lng: -120.6343, website: "https://www.24carrotfarms.com" },
  { name: "Larsen Apple Barn", city: "Camino", note: "Founded in the 1860s — the oldest continuously family-owned and operated farm in Apple Hill. On Larsen Drive, the heart of the Apple Hill corridor. Apples harvested from trees that have produced fruit for over 150 years. Open seasonally Labor Day through late November, Mon–Fri and Sunday 9am–5pm. The historical weight of this farm is real: the family has been working this land longer than the Gold Rush is from today.", category: "farmstand", lat: 38.7524, lng: -120.6809, website: "https://www.larsenapplebarn.com" },

  { name: "Goldbud Farms", city: "Placerville", note: "One of the few farms in the Apple Hill corridor focused on stone fruit: mountain-grown peaches, nectarines, plums, pluots, and apples, alongside wine grapes on the same property. On Carson Road, open daily 10am–5pm from mid-July through October. The peaches harvested at peak maturity at this elevation have more intensity than valley-floor stone fruit — a genuine seasonal reason to come early in the Apple Hill season before the fall apple crowds arrive.", category: "farmstand", lat: 38.7122, lng: -120.6420, website: "https://goldbudfarms.com" },

  // ── ARTISANS ──────────────────────────────────────────────────────────────
  { name: "Jack Russell Farm Brewery", city: "Camino", note: "Farm brewery and cider house on American River Trail in Apple Hill — draught ales and hard ciders made from estate-grown apples and barley. The cider operation is central to what this place does, and in fall season they're pressing fresh juice from the orchard. Outdoor seating among the apple trees. The most interesting producer stop on the Apple Hill loop. Open daily in season.", category: "artisan", lat: 38.7037, lng: -120.6311, website: "https://www.jackrussellfarm.com" },
  { name: "Dry Diggings Distillery", city: "El Dorado Hills", note: "Focused on locally produced farm fruit, grains, and wine for vodka, whiskey, brandy, and bourbon. Works with local El Dorado farmers, vintners, and breweries. The tasting room captures Gold Rush-era aesthetic with genuine historical elements — tours and tastings available. The brandy program, drawing on local wine grapes, is the most interesting product for food-and-wine travelers.", category: "artisan", lat: 38.6854, lng: -121.0622, website: "https://www.drydiggingsdistillery.com" },
  { name: "Collina di Mela", city: "Placerville", note: "The ONLY certified organic olive oil producer in the Apple Hill Growers Association — a small farm at approximately 2,400 feet elevation on Carson Road. First harvest in November 2009 earned a Gold Medal at the Los Angeles International Extra Virgin Olive Oil Competition. Has continued producing award-winning EVOO since. A quintessential Slow Food producer — single family, specific place, specific craft, with hardware to show for it.", category: "artisan", lat: 38.7108, lng: -120.6504, website: "http://www.collinadimelaoliveoil.com" },

  // ── RESTAURANTS ───────────────────────────────────────────────────────────
  { name: "The Independent Restaurant and Bar", city: "Placerville", note: "Voted Best Overall Restaurant in the Sierra Foothills 11 years in a row — the anchor dining destination for El Dorado County. Rustic-chic dining room with fireplace patio, farm-to-table New American fare: Buttermilk Fried Chicken, CAB Marbled Rib Eye, Lemon Caper Salmon, house-ground Burgers. The truffle macaroni and cheese is a local institution. Craft cocktail program is serious — the 'Sea of Tranquility' is a benchmark. Reservations recommended weekends.", category: "restaurant", lat: 38.7304, lng: -120.7955, website: "https://www.theindependentplacerville.com" },
  { name: "Sweetie Pie's Restaurant & Bakery", city: "Placerville", note: "The beloved breakfast and brunch institution on Main Street — voted Best Breakfast AND Best Brunch in El Dorado County. Massive biscuits, house-baked pastries, eggs done carefully, and the kind of morning cooking that earns its reputation without pretense. Locals queue for it. Plan to wait on weekends. 577 Main St. Opens early.", category: "restaurant", lat: 38.7294, lng: -120.7963, website: "https://sweetiepiesplacerville.com" },
  { name: "Bricks Eats & Drinks", city: "Placerville", note: "The neighborhood anchor at 482 Main Street — American cooking done without fanfare, strong burger program, good local beer selection, and a room that fills up for good reason. Not a tourist destination; a place locals eat. Consistently good, honestly priced, unpretentious. If you're spending a day in Placerville, this is a reliable lunch stop.", category: "restaurant", lat: 38.7285, lng: -120.7974, website: "https://www.bricksonmainstreet.com" },
  { name: "Poor Red's Bar-B-Q", city: "El Dorado", note: "A Gold Rush-era landmark on El Dorado Road that has been serving barbecue and stiff drinks since 1945. The Golden Cadillac cocktail is a California institution. Honest, unpretentious, and exactly what it has always been. Not a destination for the food — a destination for what it is: eighty-plus years of foothill hospitality. Open for lunch and dinner.", category: "restaurant", lat: 38.6745, lng: -120.8620, website: "https://www.poorredsbarbq.com" },
  { name: "Amore Mio Italian Bistro", city: "Placerville", note: "Italian fusion with a devoted local following at 451 Main St. The Piemontese Bagna Cauda flatbread — crispy outside, doughy inside — is described by regulars as the best flatbread in El Dorado County, without hyperbole. Earns word-of-mouth the old-fashioned way: by being genuinely good and not overextending.", category: "restaurant", lat: 38.7272, lng: -120.7989, website: "https://amoremioitalianbistro.com" },
  { name: "Argonaut Coffee & Provisions", city: "Coloma", note: "Inside Marshall Gold Discovery State Historic Park on Hwy 49 — a café under new ownership that keeps its farm-to-fork mission intact. Organic and locally sourced ingredients, with Bee Love Farms (one of California's oldest pioneer farms) supplying heirloom greens, tomatoes, edible flowers, and fruit. Overlooks the American River. Dog-friendly patio, espresso bar, breakfast and lunch. One of the few dining destinations in El Dorado County that pairs a significant food story with a genuinely beautiful setting.", category: "restaurant", lat: 38.7978, lng: -120.8890, website: "https://www.argonautcafe.com" },
  { name: "Annabelle's Chocolate Lounge", city: "El Dorado", note: "Award-winning artisan chocolate shop and wine bar on Pleasant Valley Road — the same road that leads to Narrow Gate Vineyards. Seventy-five varieties of chocolate, all made without waxes or preservatives. The wine-and-chocolate flight pairs four El Dorado and Amador County wines with chocolates and tasting notes. Open Mon–Sat 11am–6pm. The kind of stop that earns a cult foundation for doing one thing very well.", category: "artisan", lat: 38.6710, lng: -120.8220, website: "https://www.annabelleschocolate.com" },
];

// ─── Seed logic ──────────────────────────────────────────────────────────────

async function correctData() {
  // Fix city values for entries that were seeded with wrong city
  const cityCorrections: { name: string; city: string }[] = [
    { name: "Holly's Hill Vineyards", city: "Placerville" },
    { name: "Narrow Gate Vineyards", city: "Placerville" },
  ];
  for (const { name, city } of cityCorrections) {
    await db
      .update(markersTable)
      .set({ city })
      .where(eq(markersTable.name, name));
  }

  // Fix category for Fenton Herriott Vineyards (was incorrectly seeded as "producer")
  await db
    .update(markersTable)
    .set({ category: "winery" })
    .where(eq(markersTable.name, "Fenton Herriott Vineyards"));

  // Rename "producer" → "artisan" category across all existing records
  await db
    .update(markersTable)
    .set({ category: "artisan" })
    .where(eq(markersTable.category, "producer"));
}

export async function seedMarkers() {
  try {
    logger.info("Starting marker seed check...");

    // Remove entries that are no longer in the curated list
    if (REMOVED_FROM_SEED.length > 0) {
      const deleted = await db
        .delete(markersTable)
        .where(inArray(markersTable.name, REMOVED_FROM_SEED))
        .returning({ name: markersTable.name });
      if (deleted.length > 0) {
        logger.info(`Removed ${deleted.length} markers: ${deleted.map(d => d.name).join(", ")}`);
      }
    }

    const [{ total }] = await db
      .select({ total: count() })
      .from(markersTable);

    if (Number(total) === 0) {
      logger.info("Empty database — seeding all markers...");
      await db.insert(markersTable).values(SEED_DATA);
      logger.info(`Seeded ${SEED_DATA.length} markers`);
    } else {
      // Upsert: add any new markers not yet in the DB
      const existingNames = await db
        .select({ name: markersTable.name })
        .from(markersTable);
      const existingSet = new Set(existingNames.map(r => r.name));
      const newEntries = SEED_DATA.filter(m => !existingSet.has(m.name));
      if (newEntries.length > 0) {
        await db.insert(markersTable).values(newEntries);
        logger.info(`Added ${newEntries.length} new markers`);
      } else {
        logger.info(`Database has ${total} markers — nothing new to seed`);
      }
    }

    await correctData();
  } catch (err) {
    logger.error({ err }, "Seed failed");
  }
}
