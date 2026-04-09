#!/usr/bin/env bash
# ============================================================
# fork-paso-robles.sh
#
# Run this script ONCE inside a fresh fork of this Replit
# project to convert the Sonoma app into a Paso Robles /
# Central Coast app.
#
# Usage (from the project root):
#   bash scripts/fork-paso-robles.sh
# ============================================================

set -e

echo ""
echo "=================================================="
echo "  Forking: Sonoma → Paso Robles / Central Coast"
echo "=================================================="
echo ""

# ── 1. app.json ─────────────────────────────────────────────
echo "→ Updating app.json..."
sed -i \
  -e 's/"name": "Sonoma"/"name": "Paso Robles"/' \
  -e 's/"slug": "sonoma-mobile"/"slug": "paso-robles-mobile"/' \
  -e 's/"scheme": "sonoma-mobile"/"scheme": "paso-robles-mobile"/' \
  -e 's/"package": "com.sonomachefapp.sonoma"/"package": "com.pasochefapp.pasorobles"/' \
  -e 's/"version": "1.2.0"/"version": "1.0.0"/' \
  artifacts/sonoma-mobile/app.json

# ── 2. eas.json ──────────────────────────────────────────────
echo "→ Updating eas.json..."
sed -i \
  -e 's/com.sonomachefapp.sonoma/com.pasochefapp.pasorobles/g' \
  artifacts/sonoma-mobile/eas.json 2>/dev/null || true

# ── 3. Mobile: chef screen ───────────────────────────────────
echo "→ Updating chef screen..."
sed -i \
  -e "s/What's in season right now in Sonoma?/What's in season right now on the Central Coast?/" \
  -e "s/Best under-the-radar spots in Healdsburg?/Best under-the-radar spots in Paso Robles?/" \
  -e "s/What makes Dry Creek Kitchen worth it?/What makes a Paso winery worth a detour?/" \
  -e "s/Pair a wine with dry-farmed heirloom tomatoes/Pair a Paso Cab with a wood-fired dish/" \
  -e 's/title: "Sonoma Chef Mobile"/title: "Paso Robles Chef Mobile"/' \
  -e 's/>Sonoma Chef</>Paso Robles Chef</' \
  -e 's/Sonoma Chef<\/Text>/Paso Robles Chef<\/Text>/' \
  -e 's/Ask the Sonoma Chef/Ask the Paso Robles Chef/' \
  -e 's/Ask about wineries, farms, pairings…/Ask about Paso Robles wine, farms, chefs…/' \
  artifacts/sonoma-mobile/app/(tabs)/chef.tsx

# ── 4. Mobile: journal screen ────────────────────────────────
echo "→ Updating journal screen (regions, labels)..."
# Update region labels
sed -i \
  -e 's/North Sonoma/North Central Coast/' \
  -e 's/Central Sonoma/Paso Robles \& Surrounds/' \
  -e 's/Southern Sonoma/South Central Coast/' \
  -e "s|// North  >=.*|// North  >= 35.72:  San Miguel, Vineyard Drive North, Creston, Shandon|" \
  -e "s|// Central 38.*|// Central 35.52-35.72: Paso Robles, El Pomar, Templeton Gap, Willow Creek|" \
  -e "s|// Southern < 38.*|// South   < 35.52:  Templeton, Atascadero, Santa Margarita, SLO, Edna Valley|" \
  artifacts/sonoma-mobile/app/(tabs)/journal.tsx

# Update latitude boundary constants in getRegion()
sed -i \
  -e 's/if (lat >= 38\.55) return "north"/if (lat >= 35.72) return "north"/' \
  -e 's/if (lat >= 38\.35) return "central"/if (lat >= 35.52) return "central"/' \
  artifacts/sonoma-mobile/app/(tabs)/journal.tsx

# ── 5. Mobile: map/index screen ─────────────────────────────
echo "→ Updating map screen labels..."
sed -i \
  -e 's/Sonoma Map/Paso Robles Map/' \
  -e 's/>Sonoma</>Paso Robles</' \
  artifacts/sonoma-mobile/app/(tabs)/index.tsx

# ── 6. Web map: Map.tsx (center coordinates + zoom) ─────────
echo "→ Updating web map center coordinates..."
# Paso Robles center: 35.6274° N, 120.6908° W
sed -i \
  -e 's/center={\[38\.5, -122\.8\]}/center={[35.6274, -120.6908]}/' \
  -e 's/zoom={11}/zoom={11}/' \
  artifacts/sonoma-map/src/components/Map.tsx

# ── 7. Web map: SonomaChef component ────────────────────────
echo "→ Updating web map chef component..."
sed -i \
  -e "s/What's in season right now in Sonoma?/What's in season right now on the Central Coast?/" \
  -e 's/Ask Sonoma Chef/Ask Paso Robles Chef/' \
  -e 's/Sonoma Chef<\/p>/Paso Robles Chef<\/p>/' \
  -e 's/Ask anything about Sonoma.*ecosystem\./Ask anything about Paso Robles wine, farms, and dining./' \
  -e 's/title: "Sonoma Chef Chat"/title: "Paso Robles Chef Chat"/' \
  artifacts/sonoma-map/src/components/SonomaChef.tsx

# Rename the component file itself
if [ -f "artifacts/sonoma-map/src/components/SonomaChef.tsx" ]; then
  mv artifacts/sonoma-map/src/components/SonomaChef.tsx \
     artifacts/sonoma-map/src/components/PasoChef.tsx
  # Update the export name inside the file
  sed -i 's/export function SonomaChef/export function PasoChef/' \
    artifacts/sonoma-map/src/components/PasoChef.tsx
  echo "   Renamed SonomaChef.tsx → PasoChef.tsx"
fi

# ── 8. Web map: Sidebar ──────────────────────────────────────
echo "→ Updating web map sidebar..."
sed -i \
  -e 's/Sonoma Journal/Paso Robles Journal/' \
  -e 's/Ask Sonoma Chef below/Ask Paso Robles Chef below/' \
  artifacts/sonoma-map/src/components/Sidebar.tsx

# ── 9. Web map: home.tsx import ──────────────────────────────
echo "→ Updating web map home page import..."
sed -i \
  -e 's|import { SonomaChef } from "@/components/SonomaChef"|import { PasoChef } from "@/components/PasoChef"|' \
  -e 's/<SonomaChef \/>/<PasoChef \/>/' \
  artifacts/sonoma-map/src/pages/home.tsx

# ── 10. API server: AI persona ───────────────────────────────
echo "→ Replacing AI persona with Paso Robles persona..."
# The persona is a const in artifacts/api-server/src/routes/openai/index.ts
# We replace it wholesale by swapping in the template persona.
PERSONA_FILE="scripts/paso-robles/persona.ts"
if [ -f "$PERSONA_FILE" ]; then
  # Extract just the const block and replace SONOMA_CHEF_SYSTEM_PROMPT
  python3 -c "
import re, sys

with open('artifacts/api-server/src/routes/openai/index.ts', 'r') as f:
    content = f.read()

with open('$PERSONA_FILE', 'r') as f:
    new_persona = f.read().strip()

# Replace the old const block
content = re.sub(
    r'const SONOMA_CHEF_SYSTEM_PROMPT = \`.*?\`;',
    new_persona,
    content,
    flags=re.DOTALL
)

# Replace all references to the old const name
content = content.replace('SONOMA_CHEF_SYSTEM_PROMPT', 'PASO_CHEF_SYSTEM_PROMPT')

with open('artifacts/api-server/src/routes/openai/index.ts', 'w') as f:
    f.write(content)
print('Done.')
"
  echo "   Persona replaced."
else
  echo "   ⚠  scripts/paso-robles/persona.ts not found — persona NOT updated."
  echo "      Replace SONOMA_CHEF_SYSTEM_PROMPT in:"
  echo "      artifacts/api-server/src/routes/openai/index.ts"
fi

# ── 11. API server: seed data ────────────────────────────────
echo "→ Replacing seed data with Paso Robles template..."
SEED_FILE="scripts/paso-robles/seed.ts"
if [ -f "$SEED_FILE" ]; then
  cp "$SEED_FILE" artifacts/api-server/src/seed.ts
  echo "   Seed replaced."
else
  echo "   ⚠  scripts/paso-robles/seed.ts not found — seed NOT replaced."
  echo "      Clear artifacts/api-server/src/seed.ts and add your Paso Robles markers."
fi

# ── 12. Package.json names (optional cosmetic) ───────────────
echo "→ Updating package names..."
sed -i 's/"name": "@workspace\/sonoma-mobile"/"name": "@workspace\/paso-robles-mobile"/' \
  artifacts/sonoma-mobile/package.json 2>/dev/null || true

# ── Done ─────────────────────────────────────────────────────
echo ""
echo "=================================================="
echo "  Done. Remaining manual steps:"
echo "=================================================="
echo ""
echo "  1. SEED DATA"
echo "     Fill in artifacts/api-server/src/seed.ts with"
echo "     your Paso Robles wineries, restaurants, and farms."
echo "     See scripts/paso-robles/seed.ts for the template."
echo ""
echo "  2. AI PERSONA"  
echo "     Review scripts/paso-robles/persona.ts — edit it"
echo "     to match the voice and focus you want for the"
echo "     Paso Robles Chef AI."
echo ""
echo "  3. MAP DEFAULT VIEW"
echo "     Web map center is now set to Paso Robles (35.6274, -120.6908)."
echo "     Adjust zoom level in artifacts/sonoma-map/src/components/Map.tsx"
echo "     if needed (default: zoom=11)."
echo ""
echo "  4. TESTFLIGHT / EAS"
echo "     Bundle ID is now: com.pasochefapp.pasorobles"
echo "     Version reset to: 1.0.0"
echo "     Run: eas build --platform ios --profile production"
echo ""
echo "  5. RESTART SERVERS"
echo "     The Replit workflows will restart automatically."
echo "     If not, restart 'API Server' and 'expo' manually."
echo ""
