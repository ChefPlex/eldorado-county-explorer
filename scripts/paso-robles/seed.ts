// ============================================================
// Paso Robles / Central Coast — Seed Data
//
// Copy this file to artifacts/api-server/src/seed.ts
// (or run scripts/fork-paso-robles.sh which does it automatically)
//
// REGION LATITUDE BOUNDARIES:
//   North  >= 35.72  — San Miguel, Vineyard Drive North, Creston, Shandon
//   Central 35.52–35.72 — Paso Robles, El Pomar, Templeton Gap, Willow Creek
//   South  < 35.52  — Templeton, Atascadero, Santa Margarita, SLO, Edna Valley
//
// CATEGORY OPTIONS: "winery" | "restaurant" | "farmstand"
//
// GPS VERIFICATION: Use https://geocoding.geo.census.gov/geocoder/locations/address
// to verify coordinates. Do not trust Nominatim — it can be off by miles.
// ============================================================

import { db } from "./db";
import { markersTable } from "../../../lib/db/src/schema/markers";
import { eq, inArray } from "drizzle-orm";

interface SeedMarker {
  name: string;
  note: string;
  category: "winery" | "restaurant" | "farmstand";
  lat: number;
  lng: number;
  website: string;
}

// ── Markers ──────────────────────────────────────────────────────────────────
//
// Add your curated Paso Robles / Central Coast spots below.
// Starter entries are provided to demonstrate the format.
// Replace notes and coordinates with verified, accurate information.
//
const MARKERS: SeedMarker[] = [

  // ── WINERIES ──────────────────────────────────────────────────────────────

  { name: "Epoch Estate Wines", note: "Iconic Paderewski Vineyard on the Westside. Old-vine Zinfandel and Tempranillo on limestone. One of the most historically significant properties in Paso.", category: "winery", lat: 35.6481, lng: -120.7952, website: "https://www.epochwines.com" },
  { name: "Tablas Creek Vineyard", note: "The Rhône Rangers origin story. Beaucastel partnership, estate-grown varietals, and a biodynamic farming program that set the template for Paso's Rhône movement.", category: "winery", lat: 35.6297, lng: -120.8149, website: "https://www.tablascreek.com" },
  { name: "Saxum Vineyards", note: "James Berry Vineyard Westside Paso. World-class GSM blends. Justin Smith's wines consistently land on 'best in California' lists. Worth every bit of the allocation effort.", category: "winery", lat: 35.6502, lng: -120.7845, website: "https://www.saxumvineyards.com" },
  { name: "Halter Ranch", note: "Stunning limestone estate with a restored 1880 Victorian farmhouse. Exceptional Rhône and Bordeaux blends. The Ancestor blend is the flagship.", category: "winery", lat: 35.6578, lng: -120.8029, website: "https://www.halterranch.com" },
  { name: "Cass Winery", note: "Estate Westside winery with an excellent on-site restaurant. The Rockin' One is a consistent crowd favorite. Outdoor dining overlooks the vineyard.", category: "winery", lat: 35.6534, lng: -120.7710, website: "https://www.casswinery.com" },
  { name: "L'Aventure", note: "Stephan Asseo's visionary estate. The Optimus blend defies category — Westside Paso Bordeaux-Rhône fusion done at the highest level.", category: "winery", lat: 35.6389, lng: -120.8041, website: "https://www.aventurewine.com" },
  { name: "Linne Calodo", note: "Matt Trevisan's small-production Westside winery. The Nemesis and Problem Child blends have devoted followings. Appointment only, worth every call.", category: "winery", lat: 35.6234, lng: -120.7885, website: "https://www.linnecalodo.com" },
  { name: "DAOU Family Estates", note: "Mountaintop Westside estate with sweeping views to the Pacific. The DAOU Patrimony Cabernet competes with Napa at a fraction of the posturing.", category: "winery", lat: 35.6601, lng: -120.8312, website: "https://www.daouvineyards.com" },
  { name: "Adelaida Vineyards & Winery", note: "Calcareous limestone soils, biodynamic farming, and one of the oldest Pinot Noir plantings in Paso. The HMR Vineyard is a benchmark property.", category: "winery", lat: 35.6499, lng: -120.8267, website: "https://www.adelaida.com" },
  { name: "Tin City Cider Co.", note: "The anchor of the Tin City corridor. Dry-farmed Central Coast apple cider done with winemaking rigor. The Renegade is bracingly dry and excellent.", category: "winery", lat: 35.6009, lng: -120.6717, website: "https://www.tincitycider.com" },
  { name: "Desparada", note: "Amanda Wittstrom Higgins's small-production Tin City label. Spanish and southern French varieties from old Paso vines. Honest, delicious, zero pretension.", category: "winery", lat: 35.6012, lng: -120.6719, website: "https://www.desparadawines.com" },
  { name: "Vina Robles", note: "Swiss-owned estate on the Eastside with excellent Petite Sirah and Cabernet. The amphitheater hosts some of the best outdoor concerts on the Central Coast.", category: "winery", lat: 35.6173, lng: -120.6024, website: "https://www.vinarobles.com" },
  { name: "Tobin James Cellars", note: "Paso institution. James Shumrick's Ballistic Zinfandel remains one of the most fun bottles in the valley. Saloon-themed tasting room, no pretense.", category: "winery", lat: 35.6382, lng: -120.5301, website: "https://www.tobinjames.com" },
  { name: "Eberle Winery", note: "Gary Eberle is the godfather of Paso Robles wine. Cave tours, estate Cabernet, and a Boar's Night Out tradition that's been running for decades.", category: "winery", lat: 35.6547, lng: -120.5896, website: "https://www.eberlewinery.com" },
  { name: "Justin Vineyards", note: "Isosceles blend put Paso Cabernet on the map. Now a destination resort with Michelin-cited dining at JUST Inn. The Westside estate is the real draw.", category: "winery", lat: 35.6329, lng: -120.8192, website: "https://www.justinwine.com" },
  { name: "Still Waters Vineyards", note: "Family-owned Westside estate with an easy-going tasting room and honest, food-friendly Rhône blends. One of the better-kept Paso secrets.", category: "winery", lat: 35.6411, lng: -120.8078, website: "https://www.stillwatersvineyards.com" },

  // ── RESTAURANTS ───────────────────────────────────────────────────────────

  { name: "Thomas Hill Organics", note: "The farm-to-table anchor of downtown Paso. Market-driven menu, excellent local wine list, and a kitchen that actually knows where its ingredients come from.", category: "restaurant", lat: 35.6258, lng: -120.6907, website: "https://www.thomashillorganics.com" },
  { name: "Il Cortile Ristorante", note: "Italian-rooted farm kitchen downtown. Chef de Domizio built something genuine here — handmade pasta, estate olive oil, and a wine list that showcases Paso Italian varieties.", category: "restaurant", lat: 35.6261, lng: -120.6912, website: "https://www.ilcortileristorante.com" },
  { name: "Artisan Restaurant", note: "Michael Kobayashi's long-running Paso institution. Committed to Central Coast producers and a kitchen that changes with the agricultural calendar.", category: "restaurant", lat: 35.6255, lng: -120.6903, website: "https://www.artisanpasorobles.com" },
  { name: "Cass Café", note: "On-site winery restaurant at Cass Winery. Wood-fired cooking, estate-grown ingredients, and lunch under the oak trees with the vineyard in view.", category: "restaurant", lat: 35.6534, lng: -120.7710, website: "https://www.casswinery.com/casscafe" },
  { name: "Fish Gaucho", note: "Downtown Paso's best for wood-fired Central Coast fish tacos and excellent margaritas. Lively, casual, and more serious about sourcing than it looks.", category: "restaurant", lat: 35.6262, lng: -120.6910, website: "https://www.fishgaucho.com" },
  { name: "McPhee's Grill", note: "Templeton's honest ranch kitchen. Local grass-fed beef, seasonal produce, and a wine list that supports the AVA. The burger is one of the best in SLO County.", category: "restaurant", lat: 35.5499, lng: -120.7065, website: "https://www.mcpheesgrill.com" },
  { name: "La Cosecha Bar + Restaurant", note: "Latin-influenced kitchen focused on Central Coast ingredients. Excellent cocktail program and one of Paso's most interesting menus.", category: "restaurant", lat: 35.6256, lng: -120.6916, website: "https://www.lacosechapasorobles.com" },

  // ── FARMSTANDS & FOOD PRODUCERS ───────────────────────────────────────────

  { name: "Windrose Farm", note: "Bill and Barbara Spencer's Templeton benchmark. Heirloom tomatoes, dry-farmed vegetables, and fruit that chefs from LA to SF have built menus around. The Templeton Farmers Market anchor.", category: "farmstand", lat: 35.5529, lng: -120.7291, website: "https://www.windrosefarm.org" },
  { name: "Rinconada Dairy", note: "Christine Maguire's sheep dairy in Santa Margarita. Lagrima and Pozo Tomme are among California's finest artisan cheeses. Only available at farmers markets and select restaurants.", category: "farmstand", lat: 35.3889, lng: -120.5701, website: "https://www.rinconadadairy.com" },
  { name: "We Olive & Wine Bar", note: "Central Coast olive oil press and tasting bar. Estate-grown Arbequina and Mission olives, plus an excellent selection of local wines and artisan pantry goods.", category: "farmstand", lat: 35.6253, lng: -120.6893, website: "https://www.weolive.com" },
  { name: "Talley Farms Farm Stand", note: "The Talley family has farmed this Arroyo Grande land since 1948. Seasonal vegetables, cut flowers, and strawberries grown on one of the Central Coast's most respected organic operations.", category: "farmstand", lat: 35.1197, lng: -120.5741, website: "https://www.talleyfarms.com" },
  { name: "SLO Thursday Farmers Market", note: "The best farmers market on the Central Coast. Higuera Street shuts down every Thursday evening year-round. Rinconada Dairy, Windrose, local ranchers, and live BBQ smoke filling the street.", category: "farmstand", lat: 35.2797, lng: -120.6630, website: "https://www.downtownslo.com/farmers-market" },
  { name: "Paso Robles Saturday Farmers Market", note: "Downtown Paso's weekly market on City Park. Central Coast producers, Windrose Farm, seasonal stone fruit, olive oil, and local honey. The town's social ritual.", category: "farmstand", lat: 35.6269, lng: -120.6943, website: "https://www.prcity.com/farmersmarket" },

];

// ── Entries to remove from DB if they were previously seeded ──────────────
const REMOVED_FROM_SEED: string[] = [
  // Add names here if you need to remove markers from the database
  // Example: "Old Placeholder Winery",
];

// ── Core seed + correction function ──────────────────────────────────────────
export async function correctCoordinates() {
  try {
    for (const m of MARKERS) {
      const existing = await db
        .select()
        .from(markersTable)
        .where(eq(markersTable.name, m.name))
        .limit(1);

      if (existing.length === 0) {
        await db.insert(markersTable).values({
          name: m.name,
          note: m.note,
          category: m.category,
          lat: m.lat,
          lng: m.lng,
          website: m.website,
        });
        console.log(`[seed] Inserted: ${m.name}`);
      } else {
        await db
          .update(markersTable)
          .set({
            note: m.note,
            category: m.category,
            lat: m.lat,
            lng: m.lng,
            website: m.website,
          })
          .where(eq(markersTable.name, m.name));
        console.log(`[seed] Updated: ${m.name}`);
      }
    }

    if (REMOVED_FROM_SEED.length > 0) {
      await db
        .delete(markersTable)
        .where(inArray(markersTable.name, REMOVED_FROM_SEED));
      console.log(`[seed] Removed: ${REMOVED_FROM_SEED.join(", ")}`);
    }

    console.log(`[seed] Done. ${MARKERS.length} markers seeded.`);
  } catch (err) {
    console.error("[seed] Error during seed:", err);
  }
}
