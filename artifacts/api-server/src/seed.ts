import { db, markersTable } from "@workspace/db";
import { count, eq, inArray, sql } from "drizzle-orm";
import { logger } from "./lib/logger";

// Entries removed from the curated list — deleted from DB on every boot
const REMOVED_FROM_SEED: string[] = [];

const SEED_DATA = [
  // ── WINERIES: EL DORADO AVA ───────────────────────────────────────────────
  { name: "Boeger Winery", city: "Placerville", note: "The benchmark. Greg Boeger planted the first vines in 1972, making this the oldest producing winery in El Dorado County. Planted on a historic Gold Rush homestead on Carson Road, the property has its own 1872 pear orchard still bearing fruit. The Barbera and Zinfandel are grown at 2,600 feet on decomposed granite. Tasting room open daily — walk-ins welcome, no appointment needed. This is where El Dorado mountain viticulture begins.", category: "winery", lat: 38.7207, lng: -120.6884, website: "https://www.boegerwinery.com" },
  { name: "Lava Cap Winery", city: "Placerville", note: "Family estate on Fruitridge Road at 2,600 feet. The volcanic basalt soils here — the 'lava cap' — drain fast and stress the vines just enough. Barbera, Zinfandel, Petite Sirah, and a Muscat that earns its place. Tasting room open Thu–Mon with sweeping views into the valley. The Petite Sirah is among the most structured in the county.", category: "winery", lat: 38.7440, lng: -120.6729, website: "https://www.lavacap.com" },
  { name: "Miraflores Winery", city: "Placerville", note: "Estate vineyard on Four Springs Trail at 2,200 feet, planted on a historic apple orchard site. Known for Spanish varieties — Tempranillo, Garnacha, Monastrell — alongside mountain Zinfandel and Barbera. Small-production, family-run, and one of the quieter gems in the El Dorado AVA. The cellar cave tastings are worth booking.", category: "winery", lat: 38.7095, lng: -120.6971, website: "https://www.mirafloreswinery.com" },
  { name: "Gold Hill Vineyard", city: "Placerville", note: "Estate winery on Vineyard Lane at 2,400 feet, with a separate farmstand carrying wine, olive oil, and vineyard eggs. The Zinfandel is planted on old vines with granitic loam soils. A working farm that also makes wine — the format here rewards lingering. One of the friendliest stops in the El Dorado AVA corridor.", category: "winery", lat: 38.6982, lng: -120.7003, website: "https://www.goldhillvineyard.com" },
  { name: "Sierra Vista Vineyards", city: "Placerville", note: "Forty-plus-year estate on Pleasant Valley Road at 2,900 feet — one of the highest-elevation tasting rooms in El Dorado County. The Rhône program here is serious: Syrah, Viognier, Grenache, and a Syrah-Grenache blend that shows what Fair Play-adjacent elevations can do. Walk-in tastings available weekends; check the calendar for harvest events.", category: "winery", lat: 38.6140, lng: -120.6915, website: "https://www.sierravistawinery.com" },

  // ── WINERIES: FAIR PLAY AVA ───────────────────────────────────────────────
  { name: "Holly's Hill Vineyards", city: "Camino", note: "The Rhône specialists of El Dorado County. Planted entirely to Rhône varieties — Grenache, Syrah, Mourvèdre, Counoise, Roussanne, Viognier — on decomposed granite at 2,700 feet in the Fair Play AVA. The Patriarche Rhône blend is what serious California Rhône looks like. Family-owned, estate fruit only. Open Fri–Sun; limited walk-ins.", category: "winery", lat: 38.5938, lng: -120.7044, website: "https://www.hollyshill.com" },
  { name: "Cedarville Vineyard", city: "Somerset", note: "Jonathan and Susan Lacey's estate on Fair Play Road — a reference point for what this high-elevation appellation can produce. Syrah, Grenache, Zinfandel, and Viognier from dry-farmed organically managed vines. Appointment-only tastings; small allocation. One of the wines people drive to Fair Play specifically to find.", category: "winery", lat: 38.5892, lng: -120.6880, website: "https://cedarvillevineyard.com" },
  { name: "Skinner Vineyards", city: "Somerset", note: "Fair Play AVA estate named for the Skinner family who farmed this land during the Gold Rush. The winery revives that heritage with mountain Zinfandel, Barbera, and Rhône-style blends. The tasting room has views across the appellation and the team pours honestly — no upsell, just wine. Check the event calendar for barrel tastings and harvest dinners.", category: "winery", lat: 38.5968, lng: -120.7128, website: "https://www.skinnervineyards.com" },
  { name: "Fitzpatrick Winery & Lodge", city: "Somerset", note: "Organic estate winery and lodge on Fairplay Road — one of the few certified organic operations in El Dorado County. Brian Fitzpatrick has farmed this land for decades without synthetic inputs. The lodge makes it a destination: a weekend here in fall harvest season, with the county's mountain Zinfandel on the table, is as good as it gets. Walk-in tastings available; lodging by reservation.", category: "winery", lat: 38.6093, lng: -120.7007, website: "https://www.fitzpatrickwinery.com" },
  { name: "Narrow Gate Vineyards", city: "Somerset", note: "High-elevation Fair Play estate on Perry Creek Road — serious Rhône wines, mountain Barbera, and a Tempranillo that punches above its appellation's profile. Family-run with limited production. The tasting room has the kind of unhurried quality that rewards a visit over an afternoon, not a drive-by.", category: "winery", lat: 38.5847, lng: -120.6867, website: "https://www.narrowgatevineyards.com" },
  { name: "Latcham Vineyards", city: "Somerset", note: "Estate winery on Omo Ranch Road in the Fair Play appellation. Zinfandel, Barbera, Cabernet, and estate olive oil from vines that have been farmed since the 1970s. One of the area's longest-running family operations. Tasting room open weekends, unpretentious and community-grounded.", category: "winery", lat: 38.6085, lng: -120.7015, website: "https://www.latcham.com" },
  { name: "Windwalker Vineyard & Winery", city: "Somerset", note: "Twenty-plus-acre estate at 2,500 feet on Perry Creek Road. Mountain Zinfandel and Rhône-style wines made from estate-grown fruit. The Gold Rush Gold blend and Zinfandel are consistent performers. Tasting room open Thu–Sun; the setting is quiet and genuinely beautiful in harvest season.", category: "winery", lat: 38.5899, lng: -120.6992, website: "https://windwalkerwinery.com" },

  // ── APPLE HILL / FARMSTANDS ───────────────────────────────────────────────
  { name: "High Hill Ranch", city: "Camino", note: "The iconic Apple Hill destination — 60-plus apple varieties on a 40-acre ranch at 3,000 feet on High Hill Road. Fresh-pressed cider, apple pies, caramel apples, and a petting zoo. The crowds on October weekends are real — arrive before 10 AM. Open late July through December; peak season August through November. One of the most visited destinations in El Dorado County.", category: "farmstand", lat: 38.7070, lng: -120.6258, website: "https://www.highhillranch.com" },
  { name: "Boa Vista Orchards", city: "Placerville", note: "One of Apple Hill's oldest farms — 50-plus apple varieties, pears, Asian pears, and a full farm store on Carson Road. Known for exceptional fresh apple cider, homemade pies, and the kind of farm stand that hasn't been sanitized for tourism. The gift shop carries local honeys and jams. Open August through December.", category: "farmstand", lat: 38.7126, lng: -120.6408, website: "https://www.boavistaorchards.com" },
  { name: "Rainbow Orchards", city: "Camino", note: "U-pick apples on Larsen Drive — Galas, Fujis, Jonagolds, and heirloom varieties on a working family orchard. The u-pick experience here is genuine: you bag your own fruit, weigh it at the barn. Cider doughnuts on weekends. A good choice when you want to pick your own rather than buying from a farm store. Open late August through December.", category: "farmstand", lat: 38.7150, lng: -120.6315, website: "https://www.rainboworchards.net" },
  { name: "Abel's Acres", city: "Camino", note: "Small family apple farm on Larsen Drive — Galas, Fujis, Braeburns, Honeycrisps, and Jonagolds plus a seasonal pumpkin patch. No crowds, no Instagram moments — just a working orchard on a back road. Call ahead. Open weekends late August through October.", category: "farmstand", lat: 38.7152, lng: -120.6280, website: "https://www.applebill.com" },
  { name: "Denver Dan's", city: "Placerville", note: "Apple Hill classic on Carson Road — caramel apples, fresh-pressed cider, apple butter, and pies. Unpretentious, generous, and reliably good. A consistent stop on the Apple Hill loop when you want to stock the car before heading back down the mountain. Open August through late December.", category: "farmstand", lat: 38.7100, lng: -120.6380, website: "https://www.applebill.com" },
  { name: "El Dorado County Farmers Market — Placerville", city: "Placerville", note: "The central Placerville farmers market. Seasonal produce, local honey, foothill olive oil, and produce from working farms in the county. Saturday mornings. A reliable source for what's actually in season in El Dorado County, rather than trucked-in produce.", category: "farmstand", lat: 38.7296, lng: -120.7985, website: "https://www.eldoradofarmersmarkets.com" },
  { name: "Gold Hill Vineyard Farmstand", city: "Placerville", note: "The farm-side operation at Gold Hill Vineyard — estate olive oil cold-pressed on-site, vineyard eggs, seasonal vegetables, and a few bottles of wine to take home. Open the same hours as the tasting room. The olive oil is made from trees on the estate and worth bringing home.", category: "farmstand", lat: 38.6979, lng: -120.7000, website: "https://www.goldhillvineyard.com" },
  { name: "Kids Inc. Apple Ranch", city: "Camino", note: "Family-friendly Apple Hill farm on Larsen Drive with u-pick apples, pony rides, and a farm store. A popular choice for families during the fall harvest season. The apple selection runs from early-season Galas through late Fujis and Braeburns. Open late August through November weekends.", category: "farmstand", lat: 38.7149, lng: -120.6310, website: "https://www.applebill.com" },

  // ── PRODUCERS ─────────────────────────────────────────────────────────────
  { name: "Jack Russell Farm Brewery", city: "Camino", note: "Farm brewery and cider house on American River Trail in Apple Hill — draught ales and hard ciders made from estate-grown apples and barley. The cider operation is central to what this place does, and in fall season they're pressing fresh juice from the orchard. Outdoor seating among the apple trees. The most interesting producer stop on the Apple Hill loop. Open daily in season.", category: "producer", lat: 38.7037, lng: -120.6311, website: "https://www.jackrussellfarm.com" },
  { name: "Jodar Vineyards & Winery", city: "Camino", note: "Family-owned producer on Carson Road making estate wines and olive oil. The olive grove is certified organic, cold-pressed on-site in late November and early December. A working farm that treats the olive oil with the same seriousness as the wine. Worth stopping for the oil alone during harvest.", category: "producer", lat: 38.7092, lng: -120.6551, website: "https://jodarvineyards.com" },

  // ── RESTAURANTS ───────────────────────────────────────────────────────────
  { name: "Heyday Cafe", city: "Placerville", note: "The anchor of Placerville's downtown dining scene on Main Street — genuine farm-to-table cooking in a Gold Rush-era building. Menu built around what's available from the region: Sierra foothills produce, local meats, and seasonal ingredients that actually change. Breakfast and lunch daily; dinner service on weekends. The best casual meal in Placerville.", category: "restaurant", lat: 38.7294, lng: -120.7981, website: "https://www.heydaycafe.com" },
  { name: "Cascada", city: "Placerville", note: "Placerville's most reliable dinner destination on Center Street — locally sourced cooking in a warm room a block off Main. The kitchen takes El Dorado County's proximity to good ranching and farming seriously. A solid choice for date nights and longer meals after a day on the wine trail. Call ahead on weekends.", category: "restaurant", lat: 38.7298, lng: -120.7984, website: "https://www.cascadarestaurant.com" },
  { name: "Poor Red's Bar-B-Q", city: "El Dorado", note: "A Gold Rush-era landmark on El Dorado Road that has been serving barbecue and stiff drinks since 1945. The Golden Cadillac cocktail is a California institution. Honest, unpretentious, and exactly what it has always been. Not a destination for the food — a destination for what it is: eighty-plus years of foothill hospitality. Open for lunch and dinner.", category: "restaurant", lat: 38.6745, lng: -120.8620, website: "https://www.poorredsbarbq.com" },
  { name: "Lava Cap Wine Bar & Bistro", city: "El Dorado Hills", note: "The valley-side tasting room from Lava Cap Winery — estate wines by the glass, small plates, and charcuterie boards in El Dorado Hills Town Center. A lower-elevation option for those who want access to the mountain wines without making the drive to Fruitridge Road. Good for introducing someone to the El Dorado appellation before heading up the hill.", category: "restaurant", lat: 38.6929, lng: -121.0614, website: "https://www.lavacap.com" },
];

// ─── Seed logic ──────────────────────────────────────────────────────────────

async function correctCoordinates() {
  // No coordinate corrections needed for initial El Dorado seed
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

    await correctCoordinates();
  } catch (err) {
    logger.error({ err }, "Seed failed");
  }
}
