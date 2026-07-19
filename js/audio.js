        // SECTION 2: AUDIO SYSTEM — Pink Floyd-inspired procedural audio
        // ============================================================================

        // Audio system (Pink Floyd-inspired)
        let audioCtx = null;
        let masterGain = null;
        let sfxGain = null;
        let musicGain = null;
        let audioInitialized = false;
        let musicPlaying = false;
        // Music system (Pink Floyd-inspired, 10 progressions)
        const PROGRESSIONS = [
            { // 0: Am Dark — classic Floyd (Shine On)
                chords: [
                    { root: 220, third: 261.63, fifth: 329.63 },
                    { root: 174.61, third: 220, fifth: 261.63 },
                    { root: 130.81, third: 164.81, fifth: 196 },
                    { root: 196, third: 246.94, fifth: 293.66 },
                ],
                subBass: [55, 43.65, 32.70, 49.00],
                arpPattern: [0, 1, 2, 1],
                chordDuration: 480, arpInterval: 90, delayTime: 0.4, feedback: 0.3,
            },
            { // 1: Dm Mellow — warm, floating
                chords: [
                    { root: 293.66, third: 349.23, fifth: 440 },
                    { root: 233.08, third: 293.66, fifth: 349.23 },
                    { root: 174.61, third: 220, fifth: 261.63 },
                    { root: 130.81, third: 164.81, fifth: 196 },
                ],
                subBass: [73.42, 58.27, 43.65, 32.70],
                arpPattern: [0, 2, 3, 2],
                chordDuration: 540, arpInterval: 100, delayTime: 0.45, feedback: 0.35,
            },
            { // 2: Em Cold — spacious, lonely
                chords: [
                    { root: 164.81, third: 196, fifth: 246.94 },
                    { root: 130.81, third: 164.81, fifth: 196 },
                    { root: 98, third: 123.47, fifth: 146.83 },
                    { root: 146.83, third: 185, fifth: 220 },
                ],
                subBass: [41.20, 32.70, 24.50, 36.71],
                arpPattern: [0, 1, 2, 3],
                chordDuration: 540, arpInterval: 110, delayTime: 0.5, feedback: 0.4,
            },
            { // 3: Am Andalusian — flamenco tension
                chords: [
                    { root: 220, third: 261.63, fifth: 329.63 },
                    { root: 196, third: 246.94, fifth: 293.66 },
                    { root: 174.61, third: 220, fifth: 261.63 },
                    { root: 164.81, third: 207.65, fifth: 246.94 },
                ],
                subBass: [55, 49, 43.65, 41.20],
                arpPattern: [2, 1, 0, 1],
                chordDuration: 420, arpInterval: 80, delayTime: 0.35, feedback: 0.25,
            },
            { // 4: Dm Deep — dark undertow
                chords: [
                    { root: 293.66, third: 349.23, fifth: 440 },
                    { root: 220, third: 261.63, fifth: 329.63 },
                    { root: 233.08, third: 293.66, fifth: 349.23 },
                    { root: 174.61, third: 220, fifth: 261.63 },
                ],
                subBass: [73.42, 55, 58.27, 43.65],
                arpPattern: [0, 2, 1, 2],
                chordDuration: 480, arpInterval: 85, delayTime: 0.4, feedback: 0.3,
            },
            { // 5: Gm Heavy — thick, brooding
                chords: [
                    { root: 196, third: 233.08, fifth: 293.66 },
                    { root: 155.56, third: 196, fifth: 233.08 },
                    { root: 116.54, third: 146.83, fifth: 174.61 },
                    { root: 174.61, third: 220, fifth: 261.63 },
                ],
                subBass: [49, 38.89, 29.16, 43.65],
                arpPattern: [1, 0, 2, 0],
                chordDuration: 480, arpInterval: 95, delayTime: 0.42, feedback: 0.32,
            },
            { // 6: Em Circle — flowing, hypnotic
                chords: [
                    { root: 164.81, third: 196, fifth: 246.94 },
                    { root: 220, third: 261.63, fifth: 329.63 },
                    { root: 146.83, third: 185, fifth: 220 },
                    { root: 196, third: 246.94, fifth: 293.66 },
                ],
                subBass: [41.20, 55, 36.71, 49],
                arpPattern: [0, 2, 3, 1],
                chordDuration: 420, arpInterval: 80, delayTime: 0.38, feedback: 0.28,
            },
            { // 7: Cm Vast — cosmic, wide
                chords: [
                    { root: 130.81, third: 155.56, fifth: 196 },
                    { root: 103.83, third: 130.81, fifth: 155.56 },
                    { root: 77.78, third: 98, fifth: 116.54 },
                    { root: 116.54, third: 146.83, fifth: 174.61 },
                ],
                subBass: [32.70, 25.96, 19.45, 29.16],
                arpPattern: [0, 1, 2, 1],
                chordDuration: 540, arpInterval: 100, delayTime: 0.5, feedback: 0.4,
            },
            { // 8: Fm Ethereal — floating, weightless
                chords: [
                    { root: 174.61, third: 207.65, fifth: 261.63 },
                    { root: 138.59, third: 174.61, fifth: 207.65 },
                    { root: 103.83, third: 130.81, fifth: 155.56 },
                    { root: 155.56, third: 196, fifth: 233.08 },
                ],
                subBass: [43.65, 34.65, 25.96, 38.89],
                arpPattern: [2, 0, 1, 0],
                chordDuration: 540, arpInterval: 105, delayTime: 0.48, feedback: 0.38,
            },
            { // 9: Am Tension — dramatic build
                chords: [
                    { root: 220, third: 261.63, fifth: 329.63 },
                    { root: 293.66, third: 349.23, fifth: 440 },
                    { root: 174.61, third: 220, fifth: 261.63 },
                    { root: 164.81, third: 207.65, fifth: 246.94 },
                ],
                subBass: [55, 73.42, 43.65, 41.20],
                arpPattern: [0, 2, 1, 3],
                chordDuration: 400, arpInterval: 75, delayTime: 0.35, feedback: 0.25,
            },
        ];
        let runProgressionIndex = 0;
        let chordIndex = 0;
        let chordTimer = 0;
        let arpTimer = 0;
        let arpNoteIndex = 0;
        // Pad voices
        let padOscs = [];
        let padGains = [];
        let padBus = null;
        // Sub-bass
        let subBassOsc = null;
        let subBassGain = null;
        // Filter sweep
        let filterNode = null;
        let filterLFO = null;
        let filterLFOGain = null;
        // Arpeggio with delay
        let arpOsc = null;
        let arpGain = null;
        let arpDelay = null;
        let arpFeedback = null;
        let arpDelayGain = null;

        function initAudio() {
            if (audioInitialized) return;
            try {
                audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                masterGain = audioCtx.createGain();
                sfxGain = audioCtx.createGain();
                musicGain = audioCtx.createGain();
                const compressor = audioCtx.createDynamicsCompressor();
                
                sfxGain.connect(masterGain);
                musicGain.connect(masterGain);
                masterGain.connect(compressor);
                compressor.connect(audioCtx.destination);
                
                // Restore saved volume levels from profile
                if (activeProfile) {
                    masterGain.gain.value = (activeProfile.audioMaster ?? 80) / 100;
                    sfxGain.gain.value = (activeProfile.audioSfx ?? 80) / 100;
                    musicGain.gain.value = ((activeProfile.audioMusic ?? 15) / 100) * 0.5;
                } else {
                    masterGain.gain.value = 0.8;
                    sfxGain.gain.value = 0.8;
                    musicGain.gain.value = 0.075;
                }
                
                audioInitialized = true;
            } catch (e) {
                console.warn('Audio not supported:', e);
            }
        }

        function resumeAudio() {
            if (audioCtx && audioCtx.state === 'suspended') {
                audioCtx.resume();
            }
        }

        function playSfx(type, opts = {}) {
            if (!audioCtx || !sfxGain) return;
            const now = audioCtx.currentTime;
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(sfxGain);
            
            switch (type) {
                case 'shoot':
                    osc.type = 'sawtooth';
                    osc.frequency.setValueAtTime(880, now);
                    osc.frequency.exponentialRampToValueAtTime(220, now + 0.1);
                    gain.gain.setValueAtTime(0.3, now);
                    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                    osc.start(now);
                    osc.stop(now + 0.1);
                    break;
                case 'explosion':
                    osc.type = 'square';
                    osc.frequency.setValueAtTime(opts.size === 'large' ? 350 : 200, now);
                    osc.frequency.exponentialRampToValueAtTime(50, now + 0.2);
                    gain.gain.setValueAtTime(0.4, now);
                    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
                    osc.start(now);
                    osc.stop(now + 0.25);
                    // Add noise burst
                    const noise = audioCtx.createBufferSource();
                    const buf = audioCtx.createBuffer(1, audioCtx.sampleRate * 0.15, audioCtx.sampleRate);
                    const data = buf.getChannelData(0);
                    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
                    noise.buffer = buf;
                    const noiseGain = audioCtx.createGain();
                    noise.connect(noiseGain);
                    noiseGain.connect(sfxGain);
                    noiseGain.gain.setValueAtTime(0.2, now);
                    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
                    noise.start(now);
                    noise.stop(now + 0.15);
                    break;
                case 'powerup':
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(523, now);
                    osc.frequency.setValueAtTime(784, now + 0.08);
                    osc.frequency.setValueAtTime(1047, now + 0.16);
                    gain.gain.setValueAtTime(0.3, now);
                    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
                    osc.start(now);
                    osc.stop(now + 0.25);
                    break;
                case 'hit':
                    osc.type = 'square';
                    osc.frequency.setValueAtTime(300, now);
                    osc.frequency.exponentialRampToValueAtTime(100, now + 0.25);
                    gain.gain.setValueAtTime(0.4, now);
                    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
                    osc.start(now);
                    osc.stop(now + 0.25);
                    break;
                case 'levelup':
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(523, now);
                    osc.frequency.setValueAtTime(659, now + 0.15);
                    osc.frequency.setValueAtTime(784, now + 0.3);
                    osc.frequency.setValueAtTime(1047, now + 0.45);
                    gain.gain.setValueAtTime(0.3, now);
                    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.7);
                    osc.start(now);
                    osc.stop(now + 0.7);
                    break;
                case 'shop':
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(988, now);
                    osc.frequency.setValueAtTime(1319, now + 0.08);
                    gain.gain.setValueAtTime(0.25, now);
                    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
                    osc.start(now);
                    osc.stop(now + 0.15);
                    break;
                case 'lowhealth':
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(220, now);
                    gain.gain.setValueAtTime(0.2, now);
                    gain.gain.setValueAtTime(0.2, now + 0.05);
                    gain.gain.setValueAtTime(0, now + 0.1);
                    osc.start(now);
                    osc.stop(now + 0.1);
                    break;
                case 'gameover':
                    osc.type = 'sawtooth';
                    osc.frequency.setValueAtTime(440, now);
                    osc.frequency.exponentialRampToValueAtTime(55, now + 1.5);
                    gain.gain.setValueAtTime(0.3, now);
                    gain.gain.exponentialRampToValueAtTime(0.01, now + 1.5);
                    osc.start(now);
                    osc.stop(now + 1.5);
                    break;
            }
        }

        function startMusic() {
            if (!audioCtx || !musicGain || musicPlaying) return;
            musicPlaying = true;
            const prog = PROGRESSIONS[runProgressionIndex];

            // Lowpass filter for slow sweep
            filterNode = audioCtx.createBiquadFilter();
            filterNode.type = 'lowpass';
            filterNode.frequency.value = 400;
            filterNode.Q.value = 2;
            filterNode.connect(musicGain);

            // Filter LFO (0.05Hz = 20s cycle, ±200Hz sweep)
            filterLFO = audioCtx.createOscillator();
            filterLFOGain = audioCtx.createGain();
            filterLFO.type = 'sine';
            filterLFO.frequency.value = 0.05;
            filterLFOGain.gain.value = 200;
            filterLFO.connect(filterLFOGain);
            filterLFOGain.connect(filterNode.frequency);
            filterLFO.start();

            // Pad bus → filter
            padBus = audioCtx.createGain();
            padBus.gain.value = 0.12;
            padBus.connect(filterNode);

            // Pad voices (3 triangle oscillators, slight detuning for warmth)
            const chord = prog.chords[chordIndex];
            const freqs = [chord.root, chord.third, chord.fifth];
            for (let i = 0; i < 3; i++) {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.type = 'triangle';
                osc.frequency.value = freqs[i] + (i === 1 ? 2 : i === 2 ? -2 : 0);
                gain.gain.value = 1;
                osc.connect(gain);
                gain.connect(padBus);
                osc.start();
                padOscs.push(osc);
                padGains.push(gain);
            }

            // Sub-bass (sine, follows chord root)
            subBassOsc = audioCtx.createOscillator();
            subBassGain = audioCtx.createGain();
            subBassOsc.type = 'sine';
            subBassOsc.frequency.value = prog.subBass[chordIndex];
            subBassGain.gain.value = 0.08;
            subBassOsc.connect(subBassGain);
            subBassGain.connect(musicGain);
            subBassOsc.start();

            // Arpeggio: osc → gain → musicGain + delay feedback loop
            arpGain = audioCtx.createGain();
            arpGain.gain.value = 0;
            arpGain.connect(musicGain);

            arpDelay = audioCtx.createDelay(2);
            arpDelay.delayTime.value = prog.delayTime;
            arpFeedback = audioCtx.createGain();
            arpFeedback.gain.value = prog.feedback;
            arpDelayGain = audioCtx.createGain();
            arpDelayGain.gain.value = 0.5;

            arpGain.connect(arpDelay);
            arpDelay.connect(arpFeedback);
            arpFeedback.connect(arpDelay);
            arpDelay.connect(arpDelayGain);
            arpDelayGain.connect(musicGain);

            arpOsc = audioCtx.createOscillator();
            arpOsc.type = 'sine';
            arpOsc.connect(arpGain);
            arpOsc.start();

            chordTimer = prog.chordDuration;
            arpTimer = 180;
        }

        function stopMusic() {
            if (!audioCtx) return;
            musicPlaying = false;
            [filterLFO, subBassOsc, arpOsc, ...padOscs].forEach(o => {
                if (o) { try { o.stop(); } catch(e) {} }
            });
            filterLFO = null; filterLFOGain = null; filterNode = null;
            subBassOsc = null; subBassGain = null;
            padOscs = []; padGains = []; padBus = null;
            arpOsc = null; arpGain = null; arpDelay = null;
            arpFeedback = null; arpDelayGain = null;
            chordIndex = 0; chordTimer = 0; arpTimer = 0; arpNoteIndex = 0;
        }

        function nextChord() {
            if (!audioCtx) return;
            const prog = PROGRESSIONS[runProgressionIndex];
            chordIndex = (chordIndex + 1) % prog.chords.length;
            const chord = prog.chords[chordIndex];
            const now = audioCtx.currentTime;
            const freqs = [chord.root, chord.third, chord.fifth];
            for (let i = 0; i < 3; i++) {
                if (padOscs[i]) padOscs[i].frequency.setTargetAtTime(freqs[i], now, 0.67);
            }
            if (subBassOsc) subBassOsc.frequency.setTargetAtTime(prog.subBass[chordIndex], now, 0.67);
        }

        function updateMusic(dt) {
            if (!musicPlaying || !audioCtx) return;
            const prog = PROGRESSIONS[runProgressionIndex];

            // Chord progression
            chordTimer -= dt;
            if (chordTimer <= 0) {
                chordTimer = prog.chordDuration;
                nextChord();
            }

            // Arpeggio (chord tones through delay)
            arpTimer -= dt;
            if (arpTimer <= 0) {
                arpTimer = prog.arpInterval + Math.random() * 60;
                playArpeggio();
            }

            // Intensity: filter opens with combo
            if (filterNode) {
                const comboOpen = Math.min(combo * 50, 250);
                filterNode.frequency.setTargetAtTime(400 + comboOpen, audioCtx.currentTime, 0.5);
            }

            // Pad volume boost on low health
            if (padBus) {
                const healthBoost = lives <= 1 ? 0.04 : 0;
                padBus.gain.setTargetAtTime(0.12 + healthBoost, audioCtx.currentTime, 0.5);
            }

            // Tension: detune pad voices on low health
            if (padOscs.length === 3) {
                const tension = lives <= 1 ? 4 : 0;
                if (padOscs[1]) padOscs[1].frequency.setTargetAtTime(prog.chords[chordIndex].third + 2 + tension, audioCtx.currentTime, 0.3);
                if (padOscs[2]) padOscs[2].frequency.setTargetAtTime(prog.chords[chordIndex].fifth - 2 + tension, audioCtx.currentTime, 0.3);
            }
        }

        function playArpeggio() {
            if (!audioCtx || !arpGain) return;
            const now = audioCtx.currentTime;
            const prog = PROGRESSIONS[runProgressionIndex];
            const chord = prog.chords[chordIndex];
            const allNotes = [chord.root * 2, chord.third * 2, chord.fifth * 2, chord.fifth * 2];
            const pattern = prog.arpPattern;
            const noteIdx = pattern[arpNoteIndex % pattern.length];
            const note = allNotes[noteIdx];
            arpNoteIndex = (arpNoteIndex + 1) % pattern.length;

            arpOsc.frequency.setValueAtTime(note, now);
            arpGain.gain.cancelScheduledValues(now);
            arpGain.gain.setValueAtTime(0.06, now);
            arpGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
        }

        // Low health warning timer
        let lowHealthTimer = 0;
        const LOW_HEALTH_INTERVAL = 36; // 0.6 seconds at 60fps

        // ============================================================================
