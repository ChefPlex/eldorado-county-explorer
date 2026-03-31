import { db, markersTable } from "@workspace/db";
import { count } from "drizzle-orm";
import { logger } from "./lib/logger";

const SEED_DATA = [
  // ── WINERIES: RUSSIAN RIVER VALLEY ───────────────────────────────────────
  { name: "Williams Selyem", note: "The benchmark Russian River Pinot. Allocation-heavy, appointment-only, and absolutely worth the effort. Old-vine purity at its finest.", category: "winery", lat: 38.6330, lng: -122.8671 },
  { name: "Kosta Browne", note: "World-class Pinot Noir with a lush, precise house style. Get an appointment if you can — this is a bucket-list tasting.", category: "winery", lat: 38.3979, lng: -122.8261 },
  { name: "Merry Edwards", note: "Old-vine Russian River Pinot royalty. Merry's wines are textbook Sonoma — elegant, cool-climate, endlessly drinkable.", category: "winery", lat: 38.4092, lng: -122.8731 },
  { name: "Lynmar Estate", note: "Stunning Sebastopol estate with impeccable Pinot and Chardonnay. The grounds alone are worth the drive.", category: "winery", lat: 38.3918, lng: -122.8741 },
  { name: "Gary Farrell", note: "Perched above the RRV with sweeping views. Single-vineyard Pinots that show exactly what this appellation can do.", category: "winery", lat: 38.5837, lng: -122.8720 },
  { name: "Freeman Winery", note: "Intimate and unhurried. Redwood grove setting, cool wine cave, and Burgundian-inspired Pinots that reward attention.", category: "winery", lat: 38.4360, lng: -122.8292 },
  { name: "Littorai", note: "Biodynamic, Burgundian, and deeply serious. Ted Lemon's coastal Pinot and Chardonnay are among California's finest.", category: "winery", lat: 38.4050, lng: -122.8501 },
  { name: "Paul Mathew Vineyards", note: "Meet the actual winemakers. Husband-and-wife operation in Graton pouring single-vineyard Pinots with old-world soul.", category: "winery", lat: 38.4443, lng: -122.8902 },
  { name: "Pax Wine Cellars", note: "Downtown Sebastopol gem for Rhône-variety fanatics. The Syrah here is exceptional — buy a bottle and settle in.", category: "winery", lat: 38.4021, lng: -122.8285 },
  { name: "Landmark Vineyards", note: "Historic Kenwood tasting room with estate Chardonnay and Pinot. A reliable, refined stop without the appointment fuss.", category: "winery", lat: 38.4200, lng: -122.5400 },
  { name: "Domaine de la Rivière", note: "Relatively new but already collecting accolades. Pinot Noir and Chardonnay with old-world grace and genuine hospitality.", category: "winery", lat: 38.4794, lng: -122.9003 },

  // ── WINERIES: SONOMA VALLEY ───────────────────────────────────────────────
  { name: "Benziger Family Winery", note: "The essential biodynamic stop in Glen Ellen. The tram tour actually teaches you something, and the setting is gorgeous.", category: "winery", lat: 38.3684, lng: -122.5297 },
  { name: "Imagery Estate Winery", note: "Artist-label wines, a working art gallery, and a patio that doesn't feel like a tourist trap. Underrated and worth it.", category: "winery", lat: 38.3621, lng: -122.5241 },
  { name: "Gundlach Bundschu", note: "California's oldest family winery. \"Gun Bun\" does it right — beautiful grounds, great events, and an underrated Gewürztraminer.", category: "winery", lat: 38.2858, lng: -122.4438 },
  { name: "Scribe Winery", note: "Hacienda vibes near Sonoma Plaza, excellent pét-nat and sparkling, and a food program built around the land.", category: "winery", lat: 38.2810, lng: -122.4231 },
  { name: "Buena Vista Winery", note: "California's first premium winery (1857). The history alone is worth a visit, and the wines hold their own.", category: "winery", lat: 38.2968, lng: -122.4375 },
  { name: "Chateau St. Jean", note: "1920s chateau grandeur in Kenwood. Award-winning wines, manicured grounds, and breathtaking mountain views.", category: "winery", lat: 38.4189, lng: -122.5441 },
  { name: "B. Wise Winery", note: "A cave tasting experience unlike anything else — dramatic barrel-vaulted tunnels in the Moon Mountain District.", category: "winery", lat: 38.3504, lng: -122.4952 },
  { name: "Repris Winery", note: "The Moon Mountain ATV tour is as memorable as the wine. Cabernet planted in the 1880s. Rare and remarkable.", category: "winery", lat: 38.3450, lng: -122.4882 },
  { name: "Three Sticks Wines", note: "Pre-Gold Rush adobe setting from 1842. Designed by Ken Fulk with the ambience of another era. Pinot and Chard.", category: "winery", lat: 38.2925, lng: -122.4542 },
  { name: "Hamel Family Wines", note: "Certified biodynamic, dry-farmed since 2018. Cave tours, library tastings, Bordeaux-style blends. Appointment only.", category: "winery", lat: 38.3094, lng: -122.5083 },
  { name: "Hanzell Vineyards", note: "Founded in 1953 by an ambassador inspired by Burgundy. Bird's-eye Sonoma Valley views and benchmark Chardonnay.", category: "winery", lat: 38.3015, lng: -122.4712 },
  { name: "Viansa Winery", note: "Tuscan-inspired estate with Italian varietals, a deli marketplace, and picnic tables overlooking the valley.", category: "winery", lat: 38.2768, lng: -122.3991 },
  { name: "Mayo Family Winery", note: "Absurd value for a deep-dive tasting in Kenwood. Many wines, attentive pours, zero pretension. A local secret.", category: "winery", lat: 38.4299, lng: -122.5432 },
  { name: "St. Francis Winery", note: "Certified Sustainable family-owned estate. The food and wine pairing experience here is among Sonoma's best.", category: "winery", lat: 38.4422, lng: -122.5419 },
  { name: "Coursey Graves", note: "French-inspired at 1,500 feet on Bennett Mountain. Panoramic views, Monet-style gardens, and luxury private tastings.", category: "winery", lat: 38.4021, lng: -122.5193 },

  // ── WINERIES: DRY CREEK VALLEY ───────────────────────────────────────────
  { name: "Ferrari-Carano Vineyards", note: "Villa grandeur in Dry Creek. Stately rose gardens, early tastings, and a Fumé Blanc that earns its reputation.", category: "winery", lat: 38.6205, lng: -122.8982 },
  { name: "Mauritson Wines", note: "Sixth-generation family Zinfandel. Honest, direct, and exactly what Dry Creek Valley should taste like.", category: "winery", lat: 38.6308, lng: -122.9193 },
  { name: "Truett Hurst", note: "Biodynamic holistic farm with goats, sheep, chickens, and great Zinfandel. The eco-estate tour is a genuine delight.", category: "winery", lat: 38.6400, lng: -122.9302 },
  { name: "Preston Farm & Winery", note: "No tour needed — winemaking operations visible in the courtyard. Feels like a European village bodega. Old-school cool.", category: "winery", lat: 38.6491, lng: -122.9332 },
  { name: "Quivira Vineyards", note: "Biodynamic Dry Creek estate with certified-organic farming and a standout Zinfandel built on Rhône sensibility.", category: "winery", lat: 38.6352, lng: -122.9198 },
  { name: "Dry Creek Vineyard", note: "The original Dry Creek label — and it shows. Consistent, honest, and the Fumé Blanc is a perennial benchmark.", category: "winery", lat: 38.6290, lng: -122.9102 },
  { name: "Mounts Family Winery", note: "Tiny family operation where you might meet the winemaker. Rare varietals, bocce court, local vibes.", category: "winery", lat: 38.6411, lng: -122.9015 },
  { name: "Ridge Lytton Springs", note: "Old-vine Zinfandel from one of California's most respected names. The Lytton Springs site is historic and essential.", category: "winery", lat: 38.6388, lng: -122.8961 },

  // ── WINERIES: ALEXANDER VALLEY ───────────────────────────────────────────
  { name: "Jordan Winery", note: "The Alexander Valley estate that defined restrained California Cabernet. Stunning chateau, impeccable hospitality, and the best library tasting in the county.", category: "winery", lat: 38.7201, lng: -122.8951 },
  { name: "Francis Ford Coppola Winery", note: "Part winery, part resort — pools, bocce, Hollywood memorabilia. Great for groups and a genuinely fun afternoon.", category: "winery", lat: 38.7181, lng: -122.9013 },
  { name: "Stonestreet Estate", note: "Mountain estate Cabernet at its Sonoma best. The Alexander Mountain terroir produces power with elegance.", category: "winery", lat: 38.7342, lng: -122.7882 },
  { name: "Chalk Hill Estate", note: "1,300-acre estate with stunning views, warm hospitality, and terroir-driven Chardonnay that punches above its price.", category: "winery", lat: 38.5387, lng: -122.7864 },
  { name: "Medlock Ames", note: "Modern rural-hipster done right. Founded by two college friends in 1998 with organic farming at the center.", category: "winery", lat: 38.6437, lng: -122.8192 },
  { name: "Banshee Wines", note: "New Alexander Valley tasting room near Healdsburg. Pinot and vinyl — select your record, pour your wine, vibe out.", category: "winery", lat: 38.6102, lng: -122.8695 },

  // ── WINERIES: HEALDSBURG ─────────────────────────────────────────────────
  { name: "Seghesio Family Vineyards", note: "The Healdsburg Zinfandel standard. Multi-generational, Italian-rooted, and pours with the ease of family confidence.", category: "winery", lat: 38.6128, lng: -122.8669 },
  { name: "Locals Tasting Room", note: "One tasting room, seven small producers. The smartest first stop in Healdsburg for scoping what you want to pursue.", category: "winery", lat: 38.7073, lng: -122.8942 },
  { name: "Bricoleur Vineyards", note: "Stunning RRV estate south of Healdsburg. Picnic wagons, bocce, rose gardens, and consistently elegant wines.", category: "winery", lat: 38.5548, lng: -122.8698 },
  { name: "J Vineyards & Winery", note: "Top California sparkling wine producer. The Bubble Room five-course pairing is a legitimate destination dining experience.", category: "winery", lat: 38.6038, lng: -122.8812 },
  { name: "Zina Hyde Cunningham Winery", note: "Sunset patio, fireplace inside, cheese boards, and three Healdsburg-area labels in one spot. The evening wind-down.", category: "winery", lat: 38.6108, lng: -122.8698 },

  // ── WINERIES: CARNEROS / PETALUMA ────────────────────────────────────────
  { name: "The Donum Estate", note: "50+ monumental sculptures on 200 acres plus world-class Pinot and Chardonnay. Art and wine in full Carneros elegance.", category: "winery", lat: 38.2714, lng: -122.4658 },
  { name: "Schug Carneros Estate", note: "German-born winemaker Walter Schug's legacy estate. Benchmark Carneros Pinot and Chardonnay in a quiet setting.", category: "winery", lat: 38.2809, lng: -122.4602 },
  { name: "Region Wine Bar", note: "Downtown Sebastopol's finest pour. 50+ wines by the taste via self-pour machines. The ideal first stop before any winery day.", category: "restaurant", lat: 38.4028, lng: -122.8288 },

  // ── RESTAURANTS: HEALDSBURG ───────────────────────────────────────────────
  { name: "SingleThread", note: "Kyle and Katina Connaughton's 3-Michelin-star omakase — eleven courses built on their farm behind the restaurant. The most serious table in Sonoma County.", category: "restaurant", lat: 38.6105, lng: -122.8699 },
  { name: "Valette", note: "Dustin Valette's flagship on Center Street — the room that put Healdsburg's culinary identity on the map. Deep Sonoma sourcing, honest technique, and hospitality that doesn't feel performed.", category: "restaurant", lat: 38.6097, lng: -122.8693 },
  { name: "Troubadour / Le Dîner", note: "A 7-course Michelin-listed tasting menu hidden inside a 20-seat bakery — SingleThread alumni running an extraordinary Thursday-through-Sunday dinner. Prepaid on Tock, no walk-ins. Book before you leave home.", category: "restaurant", lat: 38.6112, lng: -122.8680 },
  { name: "Juju's — French-Moroccan Pop-Up at Acorn Cafe", note: "Chef Jason Pringle cooking from his 97-year-old grandmother's recipes in a borrowed plaza café Thu–Sun evenings. Lamb shank tagine, poulet rôti with harissa potatoes, cheese cappelletti with beet and Meyer lemon. Nothing else like it in the county right now.", category: "restaurant", lat: 38.6104, lng: -122.8686 },
  { name: "Folia Bar & Kitchen — Appellation Healdsburg", note: "Reed Palmer's three-course prix fixe at one of Wine Country's most striking new resort properties. Mt. Lassen trout, Mary's chicken, estate garden vegetables. The rooftop bar and panoramic plaza views earn a stop on their own.", category: "restaurant", lat: 38.6115, lng: -122.8672 },
  { name: "Bistro Lagniappe", note: "The downtown Healdsburg table that's open seven nights a week — including Mondays when almost nothing else is. French-California comfort in a warm room that feels like it belongs to the town.", category: "restaurant", lat: 38.6100, lng: -122.8697 },
  { name: "The Matheson", note: "Dustin Valette's rooftop bar and restaurant on the plaza — three floors, a wood-fired kitchen, and the best view in downtown Healdsburg. The cocktail program is serious.", category: "restaurant", lat: 38.6103, lng: -122.8694 },
  { name: "Barndiva", note: "A beautiful garden room in the middle of Healdsburg — seasonal farm-to-table cooking in a converted barn with genuine warmth. The Saturday brunch with live music in the garden is one of the better weekend mornings in the county.", category: "restaurant", lat: 38.6099, lng: -122.8698 },
  { name: "Little Saint", note: "The Moshin family's plant-based restaurant and market on the plaza — genuinely inventive cooking that doesn't position itself as a compromise. Good for the table with mixed preferences.", category: "restaurant", lat: 38.6108, lng: -122.8695 },
  { name: "Baci Café & Wine Bar", note: "The one reliable dinner in downtown Healdsburg on a Monday. Italian classics, good pasta, a wine list full of Sonoma County names, and neighborhood ease when nothing else is open.", category: "restaurant", lat: 38.6098, lng: -122.8700 },
  { name: "Acorn Cafe", note: "Breakfast and brunch anchor on the Healdsburg Plaza — the right start for any Healdsburg food day. After hours Thu–Sun it becomes Juju's French-Moroccan pop-up.", category: "restaurant", lat: 38.6104, lng: -122.8687 },
  { name: "Dry Creek Kitchen", note: "Charlie Palmer's flagship Healdsburg restaurant anchoring Hotel Healdsburg — Sonoma sourcing, wine-country ambience, and one of the most reliable kitchens on the plaza.", category: "restaurant", lat: 38.6101, lng: -122.8690 },

  // ── RESTAURANTS: ALEXANDER VALLEY / GEYSERVILLE ───────────────────────────
  { name: "Jimtown Store", note: "The historic 1895 country store tucked into the Alexander Valley vines on Highway 128. Fresh-prepared food, homebaked goods, famous chocolate pudding, and the perfect anchor for any Alexander Valley wine day. Open Mondays — rare on this corridor.", category: "restaurant", lat: 38.6940, lng: -122.8543 },
  { name: "Cyrus", note: "Douglas Keane's multi-act dining experience in Geyserville — champagne and canapés, interactive chef's table, main dining room, and a dessert room with a molten chocolate fountain. The Sunday Family Meal ($55 gochujang fried chicken) and Kisetsu Ramen popup are easier ways in.", category: "restaurant", lat: 38.7073, lng: -122.9016 },
  { name: "Diavola", note: "The loud, delicious Geyserville table for pizza, pasta, and house-cured salumi. Chef Dino Bugica has been making charcuterie and working that wood oven for years without losing the plot. The best stop after a Dry Creek or Alexander Valley wine day.", category: "restaurant", lat: 38.7065, lng: -122.9009 },

  // ── RESTAURANTS: KENWOOD / GLEN ELLEN ────────────────────────────────────
  { name: "Stella", note: "Ari Weiswasser and chef de cuisine Bryant Minuche's Italian-California room in the old Cafe Citti space, opened March 2025. Roman tonnarelli, lumache with spring pea pesto, burrata with 12-year balsamic. Open every night including Mondays — exceptional on this corridor.", category: "restaurant", lat: 38.4190, lng: -122.5427 },
  { name: "Glen Ellen Star", note: "Ari Weiswasser's original wood-fired room in Glen Ellen — the table that put the Sonoma Valley back on the serious food map. Brick chicken, ember-roasted vegetables, produce from the farm behind the restaurant.", category: "restaurant", lat: 38.3742, lng: -122.5105 },
  { name: "Poppy", note: "The Girl & The Fig's Sondra Bernstein and John Toulze transformed the old Fig Café into this French countryside room in May 2025. Crispy poulet rôti, Coquilles Saint-Jacques, asparagus salad with Sonoma strawberries. Wed–Fri prix fixe includes wine.", category: "restaurant", lat: 38.3737, lng: -122.5109 },

  // ── RESTAURANTS: SONOMA TOWN ──────────────────────────────────────────────
  { name: "Enclos", note: "Two Michelin stars and a Green Star in its first year — chef Brian Limoges (Quince, Atelier Crenn) inside a restored 1880 Victorian half a block from Sonoma Plaza. The 11-course tasting menu is grounded in Stone Edge Farm's organic gardens. The hottest reservation in Northern California right now.", category: "restaurant", lat: 38.2916, lng: -122.4528 },
  { name: "Rosso Pizzeria — Sonoma Plaza", note: "The original Rosso on Sonoma Plaza — wood-fired pizza, good salads, and the fried chicken with smashed potatoes that people drive across the county for. A Sonoma institution with honest prices.", category: "restaurant", lat: 38.2920, lng: -122.4542 },

  // ── RESTAURANTS: PETALUMA ─────────────────────────────────────────────────
  { name: "Bijou", note: "Chef Stéphane Saint Louis (Table Culture Provisions) opened this French bistro in the former Easy Rider space in June 2025. Steak frites with sauce au poivre, cod brandade croquettes, and gâteau St. Honoré from pastry chef Sylvain Parsy. Open Mondays — almost unique at this quality level.", category: "restaurant", lat: 38.2343, lng: -122.6378 },
  { name: "Table Culture Provisions", note: "The Michelin-recognized 7-course tasting menu from chefs Stéphane Saint Louis and Steven Vargas — Michelin-level cooking at neighborhood prices. Social Hour Wed–Thu 4–6 PM offers à la carte access. Nothing else like it in the county.", category: "restaurant", lat: 38.2360, lng: -122.6370 },
  { name: "Seared", note: "Petaluma's anchor for steak, seafood, and barrel-aged cocktails — Beeman Ranch beef, line-caught halibut, and a wine list leaning Sonoma County. The hanger steak with truffled parmesan frites is the order.", category: "restaurant", lat: 38.2374, lng: -122.6385 },
  { name: "Della Fattoria", note: "The family-owned Petaluma bakery whose bread shows up on half the menus in the county. The rosemary boule and wood-fired breads are reasons to detour off the 101. Breakfast and lunch daily; dinner Thu–Sat. Eat the bread at the source.", category: "restaurant", lat: 38.2380, lng: -122.6380 },
  { name: "The Shuckery", note: "Bohemian's Best Oyster Room two years running, inside the historic Hotel Petaluma. Chef Matt Meyer and Jazmine Lalicker run an oyster-forward room with a wine list that won Best in Sonoma County. Spring is peak season for Tomales Bay oysters.", category: "restaurant", lat: 38.2368, lng: -122.6373 },
  { name: "Lagunitas Brewing Company", note: "The flagship Lagunitas taproom in Petaluma — open-air seating, live music calendar, rotating one-off brews from the on-site Disorderly House brewhouse. Jumbo Bavarian pretzel and smoked chicken wings are the food orders. Bring the dog. Open daily.", category: "restaurant", lat: 38.2595, lng: -122.6173 },

  // ── RESTAURANTS: SEBASTOPOL / WEST COUNTY ────────────────────────────────
  { name: "Goldfinch", note: "Modern American bistro cooking around an open wood fire in Sebastopol's Livery on Main — chef Rodrigo Mendoza's seasonal, local, polished room. One of the strongest additions to the Sebastopol dining scene in years. Open Mondays.", category: "restaurant", lat: 38.3993, lng: -122.8283 },
  { name: "Acre Pasta", note: "House-made pasta every morning, honest prices, and a rotating menu that takes the produce seriously. Spaghetti with Sunday red sauce at $12. The lumache with porcini cream is the sleeper hit.", category: "restaurant", lat: 38.3991, lng: -122.8278 },
  { name: "Ramen Gaijin", note: "House-made noodles, serious broth, and an izakaya menu built around local ingredients and Japanese technique. Happy hour 2:30–4:30 PM Tue–Sat. The broth tastes like someone spent two days on it.", category: "restaurant", lat: 38.4019, lng: -122.8269 },
  { name: "Fern Bar", note: "Modern American food, genuinely excellent zero-proof cocktails, spirits, and live music in a plant-filled Barlow room. Happy hour daily 3–5 PM. The best long hang in Sebastopol — and the best non-alcoholic cocktail program in the county.", category: "restaurant", lat: 38.3988, lng: -122.8277 },
  { name: "Handline", note: "Sustainable seafood with a seasonal porch that's one of the best outdoor happy-hour spots in West County. A communal table under a giant live oak, soft-serve ice cream, and kids welcome. Smoked trout chowder and fish tacos are the orders.", category: "restaurant", lat: 38.4022, lng: -122.8261 },
  { name: "Underwood Bar and Bistro", note: "The longtime West County anchor in the tiny village of Graton — steak frites, flatbreads, a serious bar. The flat iron steak frites with mushroom-shallot butter and chipotle sauce has earned its place on the permanent menu.", category: "restaurant", lat: 38.4365, lng: -122.8923 },

  // ── RESTAURANTS: SANTA ROSA ───────────────────────────────────────────────
  { name: "Rosso Pizzeria — Santa Rosa", note: "The beloved Sonoma Plaza original expanded to Santa Rosa in fall 2025. Same wood-fired pizza program — and a fried chicken with smashed potatoes and caramelized pancetta that is already among the best casual bites in the county.", category: "restaurant", lat: 38.4384, lng: -122.7145 },
  { name: "Augie's French", note: "Mark and Terri Stark's lively French bistro on 4th Street — steak frites, mussels, classic bistro sauces, and a room built for date nights and small groups. The wine list tilts French and local, which is exactly right.", category: "restaurant", lat: 38.4379, lng: -122.7126 },
  { name: "Bird & The Bottle", note: "The Santa Rosa table for shareable plates, a busy bar, and wood-fired cooking. Best with a group that wants to order widely and pass everything around the table. One of Santa Rosa's most reliable rooms. Open Mondays.", category: "restaurant", lat: 38.4391, lng: -122.7138 },
  { name: "Stark's Steak & Seafood", note: "The Santa Rosa anchor for serious steak — Beeman Ranch beef, a wine list that leans Sonoma, and a happy hour that regulars treat as a standing appointment. The $6 martini on Tuesdays is the local secret.", category: "restaurant", lat: 38.4428, lng: -122.7122 },
  { name: "Grata Italian Eatery", note: "Chef-owner Eric Foster's Italian kitchen — one of the most underappreciated rooms in north Sonoma County. House-made gnudi, burrata with preserved lemon honey, caramelized pear and endive bruschetta. Open Mondays.", category: "restaurant", lat: 38.5399, lng: -122.8137 },

  // ── RESTAURANTS: FORESTVILLE / RUSSIAN RIVER ──────────────────────────────
  { name: "BaSo Annex (Bazaar Sonoma)", note: "After fire hit the original Bazaar Sonoma, chef Sean Quan and Jenny Phan opened an interim café with their best dishes — zhong dumplings with house chili crisp, Taiwan braised pork rice, mapo tofu. Prices $9–$24. One of the most interesting kitchens in the county at the most honest price point.", category: "restaurant", lat: 38.4682, lng: -122.9032 },
  { name: "Farmhouse Inn Restaurant", note: "New à la carte format as of March 2026 under chef Julio Aguilera — upscale casual cooking in one of the RRV's most beautiful properties. Burrata, Caesar, grilled broccolini, steak with pommes purée and lobster butter.", category: "restaurant", lat: 38.4729, lng: -122.9109 },
  { name: "boon eat + drink", note: "Crista Luedtke's farm-to-table California bistro anchoring Guerneville's food scene since 2009. Primarily organic, a house garden, and a menu that genuinely shifts with the season. The anchor of a good Guerneville evening.", category: "restaurant", lat: 38.5005, lng: -122.9989 },

  // ── RESTAURANTS: SONOMA COAST / POINT REYES ───────────────────────────────
  { name: "Terrapin Creek Cafe", note: "Michelin-recognized in Bodega Bay with a kitchen that punches far above its coastal roadside setting. Pan-roasted Hokkaido scallops with sunchoke purée, charred octopus, Mediterranean fish stew. Open Mondays.", category: "restaurant", lat: 38.3263, lng: -123.0468 },
  { name: "Rocker Oysterfeller's", note: "Southern comfort on Highway 1 in Valley Ford — grassfed smashburgers, buttermilk fried chicken with Lagunitas ale and caraway gravy, and Tomales Bay oysters raw or grilled. Dollar Oyster Mondays all day.", category: "restaurant", lat: 38.3422, lng: -122.9932 },
  { name: "Saltwater Oyster Depot", note: "Reservation-only dinners in a small coastal room in Inverness across from Tomales Bay. Tomales Bay oysters and locally sourced seafood, prepared with care and without pretension. Open Mondays for dinner.", category: "restaurant", lat: 38.0748, lng: -122.8740 },
  { name: "Hog Island Oyster Boat Bar", note: "The outdoor oyster table right on the water in Marshall — raw oysters, BBQ oysters, and Tomales Bay as your setting. Reservations required; standby fills fast. No better version of this experience exists in Northern California.", category: "restaurant", lat: 38.1549, lng: -122.8953 },
  { name: "Nick's Cove", note: "Sustainable coastal cooking from Marin and Sonoma farms in one of the best bay settings on the California coast. Live music through spring. Good for a solo lunch, a date dinner, or a group with a shared love of the coastline.", category: "restaurant", lat: 38.1542, lng: -122.8921 },
  { name: "Station House Cafe", note: "The newly renovated community anchor in Point Reyes Station — local, seasonal, and relaxed in the best way. Live music and specials through the spring calendar. A place that actually belongs to its town.", category: "restaurant", lat: 38.0682, lng: -122.8037 },

  // ── FARMSTANDS ────────────────────────────────────────────────────────────
  { name: "Cloverdale Certified Farmers Market", note: "Community-built certified market at the heart of Alexander Valley wine country — Sundays April through November. Local farmers, food purveyors, and craft. CalFresh/Market Match accepted. The most local market in the northern coverage area.", category: "farmstand", lat: 38.8003, lng: -122.9794 },
  { name: "Healdsburg Certified Farmers Market", note: "One of California's original 22 certified markets, running since 1978. Most produce grown within 10 miles of the plaza. Saturdays April–December and Tuesdays May–September. Wild fish, pasture-finished meat, heirloom vegetables, baked goods.", category: "farmstand", lat: 38.6104, lng: -122.8690 },
  { name: "Dry Creek Peach & Produce", note: "The last dedicated organic peach orchard in Dry Creek Valley — thirty-plus varieties of white and yellow peaches, tree-ripened, hand-picked, hand-packed. Open July through early September. Alice Waters named one of their varieties her last-supper pick.", category: "farmstand", lat: 38.6508, lng: -122.9245 },
  { name: "SingleThread Farm Store", note: "Kyle and Katina Connaughton's working farm behind the 3-Michelin-star restaurant — open to the public Thu–Sun. The same produce, flowers, and pantry items grown for the restaurant kitchen. The only place in the county where you can buy what a 3-star kitchen grows.", category: "farmstand", lat: 38.6425, lng: -122.9078 },
  { name: "Front Porch Farm", note: "Organic flower and vegetable farm along the Russian River — sixty-plus flower varieties, u-pick Saturdays, river picnic access with all materials provided. The prettiest u-pick in northern Sonoma County.", category: "farmstand", lat: 38.6012, lng: -122.8884 },
  { name: "Windsor Certified Farmers Market", note: "50-plus vendors on the Town Green — Sundays April through December, plus Thursday Summer Nights June–August. Certified organic produce, artisan bakeries, cheeses, seasonal produce festivals, and live music every week.", category: "farmstand", lat: 38.5399, lng: -122.8142 },
  { name: "Wise Acre Farm — Egg Vending Machine", note: "Tiffany Holbrook's free-range egg farm stocks California's first farm egg vending machine 24/7 with a rainbow of varieties. Grade AA, CA SEFS compliant. Also at Healdsburg Saturday Market in summer. Yes, it's exactly what it sounds like.", category: "farmstand", lat: 38.5395, lng: -122.8110 },
  { name: "Santa Rosa Original Certified Farmers Market", note: "The oldest and largest farmers market in Sonoma County — running continuously since 1967. Sixty-five-plus local farmers every Saturday at the Luther Burbank Center for the Arts. Voted Best Farmers Market in Sonoma County year after year. Slow Food Snail of Approval.", category: "farmstand", lat: 38.4694, lng: -122.7307 },
  { name: "Santa Rosa Community Farmers Market", note: "A second year-round certified market in Santa Rosa at Farmers Lane Plaza — Wednesdays and Saturdays. More relaxed than the Luther Burbank flagship, strong neighborhood following. CalFresh/Market Match accepted.", category: "farmstand", lat: 38.4452, lng: -122.6980 },
  { name: "Tierra Vegetables Farmstand", note: "Wayne and Lee James have farmed this suburban Santa Rosa plot since 1980 and sell only what they grow — 30-plus varieties of heirloom dried beans, masa from heirloom corn, fresh and dried chiles, and pantry staples. The heirloom bean selection alone is worth a special trip.", category: "farmstand", lat: 38.4607, lng: -122.7438 },
  { name: "Sebastopol Certified Farmers Market", note: "Every Sunday regardless of season — the best Sunday morning ritual in West County. First strawberries, snap peas, and asparagus start arriving in March. Sits on the West County Regional Trail. Produce arrives fast and the crowd thins by 11.", category: "farmstand", lat: 38.4026, lng: -122.8245 },
  { name: "Redwood Hill Farm / Capracopia", note: "Regenerative goat dairy with hands-on cheesemaking farm tours — spring is baby goat season, the best time to visit. Small farmstand carries olive oil, goat milk soaps, and cut flowers. The spring tours are legitimately joyful.", category: "farmstand", lat: 38.4182, lng: -122.8668 },
  { name: "Gold Ridge Organic Farms", note: "Heritage apple varieties direct from the orchard, plus fresh-pressed olive oil in fall — watch it flow from the press on-site in October. Annual Apple Blossom Festival in spring. One of the last heritage apple operations in the region.", category: "farmstand", lat: 38.3820, lng: -122.8479 },
  { name: "EARTHseed Farm", note: "California's first Afro-Indigenous permaculture farm, founded by Pandora Thomas. U-pick days, guided farm tours, farm stays, and a seasonal farm store. Celebrates African agricultural traditions through regenerative practices. Unlike any other farm experience in the county.", category: "farmstand", lat: 38.3962, lng: -122.8612 },
  { name: "Forestville Certified Farmers Market", note: "Tuesday evenings June through late August under the oak trees in downtown Forestville — live music, wine, cold beer, and farm-fresh produce alongside the West County Regional Trail. One of the most atmospheric small markets in the county.", category: "farmstand", lat: 38.4682, lng: -122.9024 },
  { name: "Guerneville Certified Farmers Market", note: "Thursday evenings June through August behind St. Hubert's Hall — operated by the same group as the Santa Rosa Original, with the same Slow Food Snail of Approval. The Russian River crowd is its own thing. A summer Thursday here has a completely different energy from any other market in the county.", category: "farmstand", lat: 38.5008, lng: -122.9996 },
  { name: "Occidental Community Farmers Market", note: "Thursday evenings May through October on Main Street in this tiny redwood-hills hamlet — fresh produce, prepared foods, crafts, and live music in a setting unlike any other market in the region. There is no better Thursday evening in West County.", category: "farmstand", lat: 38.4070, lng: -122.9556 },
  { name: "The Fork at Point Reyes Farmstead Cheese", note: "A reservation-only food experience on one of the county's most beautiful working dairy farms. Spring is the best season for fresh chèvre and young cheeses. This is what farm-to-table actually feels like — an actual farm, with cows, a cheese cave, and a story you can eat.", category: "farmstand", lat: 38.0568, lng: -122.8074 },
];

export async function seedIfEmpty() {
  try {
    const [row] = await db.select({ count: count() }).from(markersTable);
    const existing = Number(row?.count ?? 0);

    if (existing > 0) {
      logger.info({ existing }, "Database already seeded — skipping");
      return;
    }

    logger.info("Database is empty — seeding initial data...");
    const result = await db.insert(markersTable).values(SEED_DATA).returning({ name: markersTable.name });
    logger.info({ count: result.length }, "Seed complete");
  } catch (err) {
    logger.error({ err }, "Seed failed — continuing without seeding");
  }
}
