Add a 24-hour AQI trend sparkline to the Air Quality section, similar 

to how KP Index and Schumann panels show historical charts.



1\. DATA: Update the Open-Meteo air quality API call to also request 

&nbsp;  hourly data by adding:

&nbsp;  \&hourly=european\_aqi

&nbsp;  

&nbsp;  This returns hourly AQI values. Filter to the last 24 hours.



2\. CHART: Add a sparkline between the horizontal gradient bar and 

&nbsp;  the pollutant row:

&nbsp;  - Shows AQI values over the last 24 hours

&nbsp;  - Use the same Sparkline component as KP/Schumann panels

&nbsp;  - Line colour: match the current AQI status colour (green when 

&nbsp;    good, yellow when moderate, etc.)

&nbsp;  - Area fill underneath

&nbsp;  - Glowing dot on the current (latest) value

&nbsp;  - Keep it compact in height — around 50-60px since this is 

&nbsp;    sharing the card with Tidal

&nbsp;  - Small footer label: "24H AQI TREND"



3\. Make sure the card still fits both Air Quality and Tidal sections 

&nbsp;  without overflow. If space is tight, reduce the sparkline height 

&nbsp;  or tighten padding slightly.

