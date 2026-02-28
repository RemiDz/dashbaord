Add a brief description/summary below each alert title in the alerts 

section. 



1\. The NOAA alerts API response includes a full "message" field for 

&nbsp;  each alert. Parse the message to extract a useful 1-2 sentence 

&nbsp;  summary explaining what the alert means.



2\. Display layout for each alert:

&nbsp;  - Alert title (current size, orange/red): e.g. "Geomagnetic 

&nbsp;    K-index of 4 expected"

&nbsp;  - Below that: summary text in smaller dimmer font 

&nbsp;    (clamp(11px, 0.9vw, 14px), Cormorant Garamond, 

&nbsp;    rgba(220, 230, 255, 0.5)) explaining the impact, e.g. 

&nbsp;    "Minor geomagnetic storm may cause weak power grid 

&nbsp;    fluctuations and minor impact on satellite operations. 

&nbsp;    Aurora may be visible at high latitudes."



3\. If the NOAA message is too long, truncate the summary to 2-3 

&nbsp;  lines maximum. Extract the most relevant portion — typically 

&nbsp;  the first sentence or the "impacts" section of the alert.



4\. If parsing the message is complex, create a simple lookup map 

&nbsp;  for common alert codes:

&nbsp;  - WARK04 (K-index watch) → "Geomagnetic activity may affect 

&nbsp;    sensitive electronics and auroral visibility at high latitudes."

&nbsp;  - ALTEF3 (Electron flux) → "Elevated radiation levels may affect 

&nbsp;    satellite operations and high-altitude communications."

&nbsp;  - WATA20/30/50 (Geomagnetic storm) → "Solar wind disturbance 

&nbsp;    expected. May cause power grid irregularities and extended 

&nbsp;    aurora visibility."

&nbsp;  - Add mappings for the most common NOAA alert types.



Keep the 30-second rotation between alerts.

