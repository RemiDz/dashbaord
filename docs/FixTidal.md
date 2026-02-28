Fix the shared Air Quality / Tidal card for clarity:



1\. VISUAL SEPARATION: Add a stronger divider between Air Quality 

&nbsp;  and Tidal sections:

&nbsp;  - Use a full-width glass divider line (not just subtle — make it 

&nbsp;    clearly visible as a section break)

&nbsp;  - Add more vertical padding/margin around the divider (12-16px 

&nbsp;    above and below)

&nbsp;  - The two sections must feel like clearly separate zones within 

&nbsp;    the same card



2\. TIDAL HEADER LAYOUT: Move the "RISING" badge so it can't be 

&nbsp;  confused with Air Quality:

&nbsp;  - Put "TIDAL" label on the left and the RISING/FALLING badge 

&nbsp;    directly next to it on the same line, NOT floating on the 

&nbsp;    far right where it visually sits between the two sections

&nbsp;  - Layout: "TIDAL ▲ RISING" as one connected header line

&nbsp;  - The current tide height (4.4m) goes below that on the next line



3\. TIDAL CHART — Add high/low reference lines like lunata.app:

&nbsp;  - Add a dashed horizontal line at the HIGH tide level with a 

&nbsp;    small "H" label on the right edge

&nbsp;  - Add a dashed horizontal line at the LOW tide level with a 

&nbsp;    small "L" label on the right edge

&nbsp;  - Use dim styling for the lines (rgba(255,255,255,0.15)) and 

&nbsp;    labels (same dim label colour)

&nbsp;  - Add a vertical "NOW" indicator line or glowing dot on the 

&nbsp;    tidal curve showing current position in the cycle

&nbsp;  - This way users can instantly see: where we are now, how far 

&nbsp;    to the next high, how far to the next low

&nbsp;  - The H and L values from the data (e.g. 5.9m and 0.2m) should 

&nbsp;    appear next to their respective lines



4\. HIGH/LOW TIMES: Keep the "HIGH 13:01" and "LOW 19:40" but make 

&nbsp;  them feel connected to the chart — position them near the chart 

&nbsp;  or label the peaks/troughs on the chart itself.



The goal: someone looking at this card for the first time can 

instantly tell that the top section is air quality and the bottom 

is tidal, with no visual confusion between them.

