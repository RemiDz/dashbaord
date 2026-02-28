Add Air Quality to the TIDAL INTELLIGENCE card — they'll share the 

panel. Air Quality takes the top half, Tidal takes the bottom half.



1\. LAYOUT within the shared card:

&nbsp;  - Top half: AIR QUALITY

&nbsp;  - Subtle glass-style divider

&nbsp;  - Bottom half: TIDAL INTELLIGENCE (keep everything it currently 

&nbsp;    has but make it more compact — the water animation can be shorter)



2\. AIR QUALITY DATA:

&nbsp;  - Use the same browser geolocation that weather already uses so 

&nbsp;    the data is local to the user

&nbsp;  - Fetch from Open-Meteo air quality API:

&nbsp;    https://air-quality-api.open-meteo.com/v1/air-quality?latitude={lat}\&longitude={lon}\&current=european\_aqi,pm10,pm2\_5,nitrogen\_dioxide,ozone\&timezone=auto

&nbsp;  - Add to existing weather API route or create /api/air-quality

&nbsp;  - Refresh every 30 minutes



3\. AIR QUALITY VISUAL — must be instantly understandable at a glance 

&nbsp;  by anyone, even first-time viewers:



&nbsp;  - HERO ELEMENT: A large semicircular gauge/arc meter (think car 

&nbsp;    speedometer style) that shows the AQI level visually:

&nbsp;    - The arc gradient goes from green (left) through yellow, 

&nbsp;      orange to red (right)

&nbsp;    - A needle/indicator dot sits at the current AQI position

&nbsp;    - The AQI number displayed large in the centre of the arc

&nbsp;    - Status word below: "Good", "Fair", "Moderate", "Poor", 

&nbsp;      "Very Poor", "Hazardous"

&nbsp;  

&nbsp;  - COLOUR CODING for the status word and number — match the gauge:

&nbsp;    - 0-20: bright green, "Good"

&nbsp;    - 20-40: yellow-green, "Fair"  

&nbsp;    - 40-60: yellow, "Moderate"

&nbsp;    - 60-80: orange, "Poor"

&nbsp;    - 80-100: red, "Very Poor"

&nbsp;    - 100+: deep red, "Hazardous"

&nbsp;  

&nbsp;  - Below the gauge, show a compact row of key pollutants:

&nbsp;    PM2.5, PM10, NO₂, O₃ — each with its value and a tiny colour 

&nbsp;    dot indicating its individual level

&nbsp;  

&nbsp;  - The gauge should be rendered with canvas or SVG, styled to 

&nbsp;    match the dashboard aesthetic (cool tones, glass feel, the arc 

&nbsp;    colours being the only vivid colours)



4\. LABEL: "AIR QUALITY" panel-label at top + location name from 

&nbsp;  browser geolocation (same as weather shows)



5\. The overall card should feel balanced — air quality gauge fills 

&nbsp;  the top portion naturally, divider, then tidal data and wave 

&nbsp;  animation in the bottom portion. No wasted empty space.



Test at 1920x1080 — both sections must be clearly readable and 

the gauge must be immediately obvious in meaning. Run npm run build.

