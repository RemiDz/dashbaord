The scrolling ticker is too fast to read. Replace it with a static 

alert display area below the solar wind chart.



Remove the scrolling news ticker completely. Instead:



1\. ALERT CONTAINER: Add a fixed alert display area below the solar 

&nbsp;  wind chart that fills the remaining space in the card:



&nbsp;  - Header line: "ALERTS" label on the left + alert count badge 

&nbsp;    on the right (e.g. "2" in a small circle/pill)

&nbsp;  

&nbsp;  - Below that: a text container that shows ONE alert at a time

&nbsp;  - Each alert displays:

&nbsp;    - Alert type/title in a slightly brighter colour (e.g. 

&nbsp;      "Geomagnetic K-index of 4 expected")

&nbsp;    - Brief summary text below if available, dimmer

&nbsp;  

&nbsp;  - ROTATION: Cycle through alerts one at a time, switching every 

&nbsp;    10 seconds with a smooth fade transition (fade out current, 

&nbsp;    fade in next)

&nbsp;  

&nbsp;  - A small dot indicator row at the bottom showing which alert 

&nbsp;    is currently displayed (like carousel dots) — e.g. ● ○ for 

&nbsp;    2 alerts, first one active



2\. WHEN NO ALERTS: Show "No active alerts" with a subtle green 

&nbsp;  dot indicator. Keep the space — don't collapse it.



3\. ALERT STYLING:

&nbsp;  - Container has a very subtle border or slightly different 

&nbsp;    background tint to distinguish it from the data above

&nbsp;  - Alert text in warm/orange tones for warnings, red for 

&nbsp;    severe alerts

&nbsp;  - The fade transition should be smooth (0.5s ease)



4\. Also add the solar wind threshold lines to the chart if they 

&nbsp;  weren't added yet:

&nbsp;  - 400 km/s dashed line labelled "Normal"

&nbsp;  - 500 km/s dashed line labelled "Elevated"



This way alerts are always readable and the card layout is 

completely stable.

