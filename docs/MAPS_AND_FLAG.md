# Official flag and geographic race map

The app displays the registered Isle of Wight community flag, designed by John Graney and registered on 9 January 2009. The 3:5 blue-and-white design replaces the previous original island mark throughout the header, sidebar, hero and favicon.

- Registry: https://www.flaginstitute.org/wp/flags/isle-of-wight-flag/
- Asset: https://commons.wikimedia.org/wiki/File:Flag_of_the_Isle_of_Wight.svg
- Original SVG: https://upload.wikimedia.org/wikipedia/commons/7/75/Flag_of_the_Isle_of_Wight.svg
- The Flag Institute released the asset into the public domain. Only a scaling `viewBox` was added; the design and colours are unchanged.

The map uses Leaflet 1.9.4 with geographic Web Mercator tiles from OpenStreetMap and optional OpenSeaMap seamarks. Coastlines, streets, towns and marine details can be explored by dragging, zooming and using the Cowes harbour / island overview controls. Attribution remains visible. Boat positions and trails are rendered as local overlays; boat names, crew and imported GPS records are not sent to the tile servers.

- OSM tile policy: https://operations.osmfoundation.org/policies/tiles/
- OSM licence: https://www.openstreetmap.org/copyright
- OpenSeaMap embedding: https://wiki.openseamap.org/wiki/h:En:OpenSeaMap_in_Website
- OpenSeaMap licence: https://www.openseamap.org/index.php?L=1&id=faq

Normal browser caching and Referer behaviour are preserved. Only the viewed area is requested, with a small tile buffer; there is no bulk prefetch or offline downloader. Operators can configure `NEXT_PUBLIC_MAP_TILE_URL` and `NEXT_PUBLIC_SEAMARK_TILE_URL` at build time. If switching providers, update their attribution in `RaceMap.tsx` as well.

Demonstration positions advance by distance along illustrative water routes, rather than the old arbitrary screen positions. Sailing and Solent circuit races use a local route; the offshore race follows Cowes, the western Solent, the Needles area, Poole Bay, south of Portland and Torbay before returning. J/70 has its own local windward/leeward illustration. These are not official race courses or navigation charts. Imported GPS positions use their actual coordinates and recorded headings; replay remains report-based. Wind and tide arrows are clearly marked as samples.
