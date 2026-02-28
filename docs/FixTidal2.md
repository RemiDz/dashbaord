Two fixes on the Tidal section:



1\. WATER ANIMATION vs CHART MISMATCH: The water wave animation at 

&nbsp;  the bottom shows a low water level, but the chart indicator dot 

&nbsp;  shows the tide is near its peak (4.4m, rising). These need to be 

&nbsp;  connected:

&nbsp;  - The water animation level should be driven by the ACTUAL current 

&nbsp;    tide data — calculate where the current height sits between 

&nbsp;    today's low and high values as a percentage

&nbsp;  - If the tide is at 4.4m and the high is ~5.9m and low is ~0.2m, 

&nbsp;    the water should be visually at about 75% height

&nbsp;  - The water surface animation should rise and fall smoothly as 

&nbsp;    the tide data updates

&nbsp;  - Low tide = water near the bottom of its area

&nbsp;  - High tide = water near the top of its area



2\. CHART SIZE: The tidal chart is too small with wasted empty space 

&nbsp;  around it. Fix:

&nbsp;  - Make the tidal chart taller — it should fill the available 

&nbsp;    vertical space in the Tidal section generously

&nbsp;  - Reduce padding/margins around the chart

&nbsp;  - The chart + water animation combined should fill most of the 

&nbsp;    Tidal section with minimal dead space

&nbsp;  - The H and L threshold lines and time labels should be clearly 

&nbsp;    visible on the larger chart

&nbsp;  - Make sure the NOW indicator dot is prominent and easy to spot



The tidal section should feel full and informative, not like a small 

chart floating in empty space.

