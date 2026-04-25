# Mass Search Card

The **Mass Search Card** is a simplified search card for Home Assistant and Music Assistant. It keeps only the search bar, shows grouped search results for artists, tracks, and playlists, and starts playback when you click a result.

## Features

- Minimal search-only UI.
- Shows grouped results for artists, tracks, and playlists.
- Clicking a result plays it immediately.
- Enables `radio_mode` only for tracks.
- Multi-language support (English, Dutch, Czech, Swedish, Slovak).
- Easy integration with Music Assistant.

## Screenshots

<div style="display: flex; align-items: flex-start; gap: 20px;"> <img src="https://github.com/user-attachments/assets/25025169-a99e-4536-b930-e7b71fbe40a9" alt="Search Panel" width="50%"> <img src="https://github.com/user-attachments/assets/ce10cadf-bada-444a-87ea-a9d05f0a41db" alt="Search Results" width="50%"> </div>

## Installation

### HACS (Home Assistant Community Store)
1. Ensure HACS is installed in your Home Assistant setup.
2. Add this repository via HACS:
   - Go to **HACS > Integrations** and click on **+**.
   - Add the GitHub URL of this repository. (https://github.com/fastxl2024/mass-search-card.git)
3. Search for `Mass Search Card` and install the card.
4. Add the following line to your `Lovelace` resources:
   ```yaml
   resources:
     - url: /hacsfiles/mass-search-card/mass-search-card.js
       type: module

# Manual Installation
1. Download the mass-search-card.js file from this repository.
2. Place the file in the /www folder of your Home Assistant configuration.
3. Add the following line to your Lovelace resources:
   ```yaml
   resources:
     - url: /local/mass-search-card.js
       type: module

# Usage and configuration
   ````yaml
      type: custom:mass-search-card
      entity: media_player.ma_living_room_receiver
      language: en
      limit: 5
      # Optional if auto-discovery does not find Music Assistant:
      # config_entry_id: 01K21ASBJDW3W3D0F0B5AFZE9A
   ````
   **Configuration:**
   ````yaml
      entity: Required. The media player that should receive playback.
      media_player_entity_id: Alternative to entity.
      language: Optional. Supported languages: cz, cs, en, nl, sv.
      limit: Optional. Search result limit. Default: 5.
      config_entry_id: Optional. Music Assistant config entry id.
   ````

**Feel free to add some languages!**

**Known bugs:** 
- scaling of card
- no "icon" when item is in library
