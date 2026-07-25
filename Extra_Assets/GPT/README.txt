Slot machine web audio asset pack
Generated source: synthetic/instrumental, no voice or speech samples.
Technical target: 44,100 Hz. Mono for SFX; stereo for ambient/music loops. Source generated with 16-bit-safe headroom, then encoded to MP3 and OGG from identical audio arrays.
MP3 encoding: MPEG Layer III, constant bitrate mode, high quality setting targeting 320 kbps CBR via libsndfile. OGG encoding: Vorbis quality setting 10-equivalent/highest quality available via libsndfile compression setting.
Mix note: SFX peaks are intentionally below full scale to preserve headroom when multiple sounds layer during reel stops or win celebrations.

Assets:
- reel_spin: Mechanical rising whir for reel spin. Designed to loop acceptably while held. Duration 0.85s, mono. Files: reel_spin.mp3 and reel_spin.ogg.
- reel_stop: Firm mechanical click and short thud. Layer for individual reel stops. Duration 0.36s, mono. Files: reel_stop.mp3 and reel_stop.ogg.
- reel_slow: Decelerating ratchet/catching sound before stop. Duration 0.55s, mono. Files: reel_slow.mp3 and reel_slow.ogg.
- win_small: Warm two-note chime for under 5x bet. Duration 0.85s, mono. Files: win_small.mp3 and win_small.ogg.
- win_medium: Bright ascending chime for 5x to 20x bet. Duration 1.25s, mono. Files: win_medium.mp3 and win_medium.ogg.
- win_big: Celebratory fanfare for 20x to 100x bet. Duration 2.10s, mono. Files: win_big.mp3 and win_big.ogg.
- win_huge: Extended crescendo fanfare for 100x plus outcomes. Duration 4.00s, mono. Files: win_huge.mp3 and win_huge.ogg.
- win_jingle: Loopable fast coin-drip ding pattern for win overlay. Duration 2.60s, mono. Files: win_jingle.mp3 and win_jingle.ogg.
- btn_click: Crisp tactile arcade-style button click. Duration 0.16s, mono. Files: btn_click.mp3 and btn_click.ogg.
- btn_disabled: Polite soft bump for unavailable action. Duration 0.22s, mono. Files: btn_disabled.mp3 and btn_disabled.ogg.
- bet_change: Quick lighter tick for bet up/down adjustments. Duration 0.13s, mono. Files: bet_change.mp3 and bet_change.ogg.
- toggle_on: Subtle upward switch sound. Duration 0.18s, mono. Files: toggle_on.mp3 and toggle_on.ogg.
- toggle_off: Subtle downward switch sound. Duration 0.18s, mono. Files: toggle_off.mp3 and toggle_off.ogg.
- wild_land: Ethereal shimmer when a wild symbol lands. Duration 0.45s, mono. Files: wild_land.mp3 and wild_land.ogg.
- scatter_land: Crystal ping when a scatter symbol lands. Duration 0.42s, mono. Files: scatter_land.mp3 and scatter_land.ogg.
- bonus_land: Dramatic deeper flourish when a bonus symbol lands. Duration 0.50s, mono. Files: bonus_land.mp3 and bonus_land.ogg.
- fs_trigger: Build-up and payoff for free spins awarded; no voice. Duration 2.60s, mono. Files: fs_trigger.mp3 and fs_trigger.ogg.
- fs_bg_loop: Loopable free-spins background: tense but positive. Duration 8.00s, stereo. Files: fs_bg_loop.mp3 and fs_bg_loop.ogg.
- fs_retrigger: Shorter free-spins retrigger sound for extra spins. Duration 1.70s, mono. Files: fs_retrigger.mp3 and fs_retrigger.ogg.
- fs_end: Resolution sound for completion of free spins round. Duration 1.40s, mono. Files: fs_end.mp3 and fs_end.ogg.
- jp_card_flip: Quick flip sound for jackpot card reveal. Duration 0.32s, mono. Files: jp_card_flip.mp3 and jp_card_flip.ogg.
- jp_card_reveal: Suspense release tone peaking at card value reveal. Duration 0.65s, mono. Files: jp_card_reveal.mp3 and jp_card_reveal.ogg.
- jp_win: Triumphant jackpot payoff, biggest non-voice win sound. Duration 3.20s, mono. Files: jp_win.mp3 and jp_win.ogg.
- jp_count: Loopable rapid digit tick for jackpot amount counting animation. Duration 2.40s, mono. Files: jp_count.mp3 and jp_count.ogg.
- bg_ambient: Loopable low-volume casino floor texture; keep under gameplay audio. Duration 18.00s, stereo. Files: bg_ambient.mp3 and bg_ambient.ogg.
- spin_idle: Loopable very low ready-to-spin hum; felt more than heard. Duration 2.60s, stereo. Files: spin_idle.mp3 and spin_idle.ogg.

Layering notes:
- reel_stop is short and dry so five reel stops can be played in close succession without muddy buildup.
- win_jingle and jp_count are loopable utility loops; start/stop underneath celebration overlays and fade out in the app if needed.
- bg_ambient, fs_bg_loop, and spin_idle are stereo loops at lower levels; place them under SFX and duck them during large wins.
- All assets avoid long reverb tails and leave headroom for simultaneous browser playback.

File size validation:
- reel_spin: MP3 35.7 KB, OGG 24.6 KB
- reel_stop: MP3 16.3 KB, OGG 6.9 KB
- reel_slow: MP3 24.5 KB, OGG 16.9 KB
- win_small: MP3 35.7 KB, OGG 8.0 KB
- win_medium: MP3 51.0 KB, OGG 11.8 KB
- win_big: MP3 84.7 KB, OGG 15.8 KB
- win_huge: MP3 159.2 KB, OGG 24.5 KB
- win_jingle: MP3 104.1 KB, OGG 24.9 KB
- btn_click: MP3 9.2 KB, OGG 6.8 KB
- btn_disabled: MP3 11.2 KB, OGG 9.6 KB
- bet_change: MP3 7.1 KB, OGG 6.6 KB
- toggle_on: MP3 9.2 KB, OGG 5.2 KB
- toggle_off: MP3 9.2 KB, OGG 5.0 KB
- wild_land: MP3 20.4 KB, OGG 6.5 KB
- scatter_land: MP3 19.4 KB, OGG 6.3 KB
- bonus_land: MP3 22.4 KB, OGG 5.9 KB
- fs_trigger: MP3 104.1 KB, OGG 19.8 KB
- fs_bg_loop: MP3 315.3 KB, OGG 277.8 KB
- fs_retrigger: MP3 69.4 KB, OGG 13.7 KB
- fs_end: MP3 57.1 KB, OGG 8.2 KB
- jp_card_flip: MP3 15.3 KB, OGG 11.7 KB
- jp_card_reveal: MP3 27.5 KB, OGG 6.8 KB
- jp_win: MP3 127.5 KB, OGG 80.4 KB
- jp_count: MP3 95.9 KB, OGG 69.8 KB
- bg_ambient: MP3 706.1 KB, OGG 421.7 KB
- spin_idle: MP3 104.1 KB, OGG 40.0 KB
