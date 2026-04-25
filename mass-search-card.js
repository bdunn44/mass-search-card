/**
 * @customElement
 * @cardType mass-search-card
 * @description Search and play media using Music Assistant in Home Assistant
 */

class MassSearchCard extends HTMLElement {
  setConfig(config) {
    if (!config?.entity && !config?.media_player_entity_id) {
      throw new Error('Set `entity` or `media_player_entity_id` in the card config.');
    }

    this.config = {
      limit: 5,
      ...config,
    };

    if (!this.shadowRoot) {
      this.attachShadow({ mode: 'open' });
    }

    this.render();
  }

  set hass(hass) {
    const previousLanguage = this._hass?.language;
    this._hass = hass;

    if (!this.configEntryId && !this.configEntryIdPromise) {
      this.configEntryIdPromise = this.resolveConfigEntryId();
    }

    if (this.shadowRoot) {
      this.updateStaticText(previousLanguage);
    }
  }

  get hass() {
    return this._hass;
  }

  getCardSize() {
    return this.results?.length ? Math.min(8, 2 + this.results.length) : 2;
  }

  get translations() {
    return {
      en: {
        artist_label: 'Artists',
        config_entry_required: 'Set a valid Music Assistant config_entry_id in the card config.',
        no_results: 'No results found.',
        playlist_label: 'Playlists',
        search_placeholder: 'Type your search term here...',
        searching: 'Searching...',
        search_error: 'An error occurred while fetching results.',
        search_required: 'Enter a search term.',
        track_label: 'Tracks',
        player_required: 'Set a media player in the card config.',
        artist_unknown: 'Unknown artist',
      },
      nl: {
        artist_label: 'Artiesten',
        config_entry_required: 'Stel een geldige Music Assistant config_entry_id in binnen de kaartconfiguratie.',
        no_results: 'Geen resultaten gevonden.',
        playlist_label: 'Afspeellijsten',
        search_placeholder: 'Typ hier je zoekterm...',
        searching: 'Zoeken...',
        search_error: 'Er is een fout opgetreden bij het ophalen van de resultaten.',
        search_required: 'Voer een zoekterm in.',
        track_label: 'Nummers',
        player_required: 'Stel een mediaspeler in binnen de kaartconfiguratie.',
        artist_unknown: 'Onbekende artiest',
      },
      sv: {
        artist_label: 'Artister',
        config_entry_required: 'Ange ett giltigt Music Assistant config_entry_id i kortkonfigurationen.',
        no_results: 'Inga resultat funna.',
        playlist_label: 'Spellistor',
        search_placeholder: 'Sök här…',
        searching: 'Söker...',
        search_error: 'Ett fel uppstod när resultat hämtades.',
        search_required: 'Ange en sökterm.',
        track_label: 'Spår',
        player_required: 'Ange en mediaspelare i kortkonfigurationen.',
        artist_unknown: 'Okänd artist',
      },
      cs: {
        artist_label: 'Umělci',
        config_entry_required: 'Nastavte platné Music Assistant config_entry_id v konfiguraci karty.',
        no_results: 'Nebyly nalezeny žádné výsledky.',
        playlist_label: 'Seznamy skladeb',
        search_placeholder: 'Zadejte hledaný výraz...',
        searching: 'Vyhledávání...',
        search_error: 'Při načítání výsledků došlo k chybě.',
        search_required: 'Zadejte hledaný výraz.',
        track_label: 'Skladby',
        player_required: 'Nastavte přehrávač v konfiguraci karty.',
        artist_unknown: 'Neznámý umělec',
      },
      cz: {
        artist_label: 'Umělci',
        config_entry_required: 'Nastavte platné Music Assistant config_entry_id v konfiguraci karty.',
        no_results: 'Nebyly nalezeny žádné výsledky.',
        playlist_label: 'Seznamy skladeb',
        search_placeholder: 'Zadejte hledaný výraz...',
        searching: 'Vyhledávání...',
        search_error: 'Při načítání výsledků došlo k chybě.',
        search_required: 'Zadejte hledaný výraz.',
        track_label: 'Skladby',
        player_required: 'Nastavte přehrávač v konfiguraci karty.',
        artist_unknown: 'Neznámý umělec',
      },
    };
  }

  get t() {
    const language = this.config?.language || this.hass?.language || 'en';
    return this.translations[language] || this.translations.en;
  }

  get mediaPlayerEntityId() {
    return this.config?.entity || this.config?.media_player_entity_id || '';
  }

  render() {
    if (!this.shadowRoot) {
      return;
    }

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
        }

        .card {
          background: var(--ha-card-background, var(--card-background-color));
          border-radius: var(--ha-card-border-radius, 12px);
          box-shadow: var(--ha-card-box-shadow, none);
          padding: 14px 0 8px;
        }

        .search-row {
          display: flex;
          align-items: center;
          gap: 8px;
          border: 1px solid var(--primary-color);
          border-radius: 999px;
          margin: 0 16px;
          padding: 2px 2px 2px 16px;
        }

        .search-input {
          flex: 1;
          border: 0;
          outline: 0;
          background: transparent;
          color: var(--primary-text-color);
          font: inherit;
          min-width: 0;
        }

        .search-button {
          border: 0;
          background: transparent;
          color: var(--primary-color);
          cursor: pointer;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .search-button:hover {
          background: rgba(var(--rgb-primary-color), 0.12);
        }

        .status {
          margin: 12px 16px 0;
          color: var(--secondary-text-color);
          font-size: 14px;
        }

        .results {
          margin-top: 0;
          display: grid;
          gap: 0;
        }

        .section-label {
          font-size: 15px;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: var(--primary-text-color);
          opacity: 0.72;
          padding: 2px 18px;
        }

        .result {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          border: 0;
          border-top: 1px solid rgba(var(--rgb-primary-text-color), 0.14);
          border-radius: 0;
          background: transparent;
          color: var(--primary-text-color);
          padding: 3px 18px;
          cursor: pointer;
          text-align: left;
          transition: background-color 120ms ease;
        }

        .result:hover {
          background: rgba(var(--rgb-primary-text-color), 0.04);
        }

        .result:focus-visible {
          outline: none;
          background: rgba(var(--rgb-primary-text-color), 0.06);
        }

        .thumb {
          width: 48px;
          height: 48px;
          border-radius: 6px;
          object-fit: cover;
          background: var(--divider-color);
          flex: 0 0 48px;
        }

        .thumb-fallback {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: var(--secondary-text-color);
          font-size: 12px;
          font-weight: 700;
        }

        .meta {
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 1px;
        }

        .name {
          font-weight: 500;
          font-size: 15px;
          line-height: 1.2;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .subtext {
          color: var(--secondary-text-color);
          font-size: 13px;
          line-height: 1.25;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        @media (max-width: 600px) {
          .card {
            padding: 12px 0 6px;
          }
        }
      </style>
      <ha-card>
        <div class="card">
          <div class="search-row">
            <input class="search-input" type="text" />
            <button class="search-button" type="button" aria-label="Search">
              <ha-icon icon="mdi:magnify"></ha-icon>
            </button>
          </div>
          <div class="status" hidden></div>
          <div class="results"></div>
        </div>
      </ha-card>
    `;

    this.inputEl = this.shadowRoot.querySelector('.search-input');
    this.searchButtonEl = this.shadowRoot.querySelector('.search-button');
    this.statusEl = this.shadowRoot.querySelector('.status');
    this.resultsEl = this.shadowRoot.querySelector('.results');

    this.inputEl.placeholder = this.t.search_placeholder;
    this.inputEl.value = this.query || '';

    this.inputEl.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        this.performSearch();
      }
    });

    this.searchButtonEl.addEventListener('click', () => this.performSearch());

    this.updateResults();
  }

  async resolveConfigEntryId() {
    if (!this.hass) {
      return '';
    }

    if (this.config?.config_entry_id) {
      this.configEntryId = String(this.config.config_entry_id).trim();
      return this.configEntryId;
    }

    const entries = await this.hass.callApi('GET', 'config/config_entries/entry');
    const musicAssistantEntries = entries.filter((entry) => entry.domain === 'music_assistant');
    const loadedMusicAssistantEntry = musicAssistantEntries.find((entry) => entry.state === 'loaded');
    const setupMusicAssistantEntry = musicAssistantEntries.find((entry) => entry.state === 'setup_complete');
    const preferredEntry = loadedMusicAssistantEntry || setupMusicAssistantEntry || musicAssistantEntries[0];

    this.configEntryId = preferredEntry?.entry_id || '';
    return this.configEntryId;
  }

  sanitizeSearchTerm(value) {
    return String(value || '')
      .normalize('NFKC')
      .replace(/[\u0000-\u001F\u007F]/g, ' ')
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/[\u201C\u201D]/g, '"')
      .replace(/\s+/g, ' ')
      .trim();
  }

  setStatus(message = '') {
    if (!this.statusEl) {
      return;
    }

    this.statusEl.textContent = message;
    this.statusEl.hidden = !message;
  }

  updateStaticText(previousLanguage) {
    if (!this.inputEl) {
      return;
    }

    this.inputEl.placeholder = this.t.search_placeholder;

    if (previousLanguage && previousLanguage !== this.hass?.language && this.results?.length) {
      this.updateResults();
    }
  }

  normalizeResults(response) {
    const payload = response?.response || response || {};
    const sections = [
      { key: 'artists', type: 'artist', label: this.t.artist_label },
      { key: 'tracks', type: 'track', label: this.t.track_label },
      { key: 'playlists', type: 'playlist', label: this.t.playlist_label },
    ];

    return sections.flatMap((section) =>
      (payload[section.key] || []).map((item) => ({
        ...item,
        media_type: section.type,
        sectionLabel: section.label,
      }))
    );
  }

  renderFallbackThumb(type) {
    const fallback = document.createElement('div');
    fallback.className = 'thumb thumb-fallback';
    fallback.textContent = type.slice(0, 1).toUpperCase();
    return fallback;
  }

  renderThumb(item) {
    if (!item.image) {
      return this.renderFallbackThumb(item.media_type);
    }

    const image = document.createElement('img');
    image.className = 'thumb';
    image.src = item.image;
    image.alt = item.name || item.media_type;
    image.loading = 'lazy';
    image.addEventListener('error', () => {
      image.replaceWith(this.renderFallbackThumb(item.media_type));
    }, { once: true });
    return image;
  }

  buildSubtext(item) {
    if (item.media_type === 'track') {
      const artists = (item.artists || []).map((artist) => artist.name).filter(Boolean).join(', ');
      const album = item.album?.name || '';
      return [artists || this.t.artist_unknown, album].filter(Boolean).join(' • ');
    }

    if (item.media_type === 'playlist') {
      return this.t.playlist_label;
    }

    return '';
  }

  updateResults() {
    if (!this.resultsEl) {
      return;
    }

    this.inputEl.placeholder = this.t.search_placeholder;
    this.resultsEl.innerHTML = '';

    if (!this.results?.length) {
      return;
    }

    let currentSection = '';

    this.results.forEach((item) => {
      if (item.sectionLabel !== currentSection) {
        currentSection = item.sectionLabel;
        const section = document.createElement('div');
        section.className = 'section-label';
        section.textContent = currentSection;
        this.resultsEl.appendChild(section);
      }

      const button = document.createElement('button');
      button.className = 'result';
      button.type = 'button';
      button.setAttribute('aria-label', item.name || item.media_type);

      const meta = document.createElement('div');
      meta.className = 'meta';

      const name = document.createElement('div');
      name.className = 'name';
      name.textContent = item.name || '';

      const subtext = this.buildSubtext(item);
      meta.appendChild(name);
      if (subtext) {
        const sub = document.createElement('div');
        sub.className = 'subtext';
        sub.textContent = subtext;
        meta.appendChild(sub);
      }

      button.appendChild(this.renderThumb(item));
      button.appendChild(meta);
      button.addEventListener('click', () => this.playItem(item));

      this.resultsEl.appendChild(button);
    });
  }

  async performSearch() {
    if (!this.hass) {
      return;
    }

    const query = this.sanitizeSearchTerm(this.inputEl?.value || '');
    this.query = query;
    if (this.inputEl) {
      this.inputEl.value = query;
    }

    if (!query) {
      this.results = [];
      this.updateResults();
      this.setStatus(this.t.search_required);
      return;
    }

    this.setStatus(this.t.searching);

    try {
      const configEntryId = await (this.configEntryIdPromise || this.resolveConfigEntryId());
      if (!configEntryId) {
        this.results = [];
        this.updateResults();
        this.setStatus(this.t.config_entry_required);
        return;
      }

      const response = await this.hass.connection.sendMessagePromise({
        type: 'call_service',
        domain: 'music_assistant',
        service: 'search',
        service_data: {
          config_entry_id: configEntryId,
          name: query,
          limit: this.config.limit,
        },
        return_response: true,
      });

      this.results = this.normalizeResults(response);
      this.updateResults();
      this.setStatus(this.results.length ? '' : this.t.no_results);
    } catch (error) {
      this.results = [];
      this.updateResults();
      this.setStatus(this.t.search_error);
      console.error('Mass Search Card search failed:', {
        configEntryId: this.configEntryId,
        error,
      });
    }
  }

  async playItem(item) {
    if (!this.hass) {
      return;
    }

    const entityId = this.mediaPlayerEntityId;
    if (!entityId) {
      this.setStatus(this.t.player_required);
      return;
    }

    try {
      await this.hass.callService(
        'music_assistant',
        'play_media',
        {
          media_id: item.uri,
          radio_mode: item.media_type === 'track',
          enqueue: 'replace',
        },
        {
          entity_id: entityId,
        }
      );
      this.setStatus('');
    } catch (error) {
      this.setStatus(this.t.search_error);
      console.error('Mass Search Card play failed:', error);
    }
  }
}

customElements.define('mass-search-card', MassSearchCard);
