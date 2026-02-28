The Air Quality sparkline looks out of place compared to the other 

charts on the dashboard. Make it consistent with the Schumann, KP, 

and Weather chart styles:



1\. CHART LINE: Use the same subtle thin style as the weather hourly 

&nbsp;  chart and KP/Schumann sparklines:

&nbsp;  - Line thickness: 2-2.5px (same as other sparklines, not thicker)

&nbsp;  - Line colour: use a single cool tone that matches the dashboard 

&nbsp;    palette — rgba(120, 180, 255, 0.7) or similar blue-white, NOT 

&nbsp;    the green/yellow AQI status colour. The status colour belongs 

&nbsp;    on the number and gradient bar, not on the chart line.

&nbsp;  - Area fill: very subtle, same low opacity as other sparklines

&nbsp;  - Glowing endpoint dot: same style as other charts



2\. GRADIENT BAR: The horizontal AQI gradient bar currently looks a 

&nbsp;  bit heavy. Make it thinner (4-5px) and reduce opacity to about 

&nbsp;  30-35% so it's more of a subtle reference scale, with only the 

&nbsp;  position marker dot being bright.



3\. POLLUTANT ROW: Make it dimmer — these are secondary data. Reduce 

&nbsp;  opacity on the values so they don't compete with the main AQI 

&nbsp;  number and the Tidal section below.



4\. Overall the Air Quality section should feel like it belongs to 

&nbsp;  the same visual family as Weather and KP — cool tones, thin 

&nbsp;  elegant lines, restrained colour. The ONLY vivid colour should 

&nbsp;  be the AQI number itself and the marker dot on the gradient bar.



Keep the same data, just unify the visual treatment.

