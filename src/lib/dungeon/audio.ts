"use client";

let _actx: AudioContext | null = null;
let _bgmGain: GainNode | null = null;

function getACtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!_actx) {
    const AC =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    _actx = new AC();
  }
  if (_actx.state === "suspended") _actx.resume();
  return _actx;
}

export function playTone(
  freq: number,
  dur: number,
  vol: number,
  type: OscillatorType = "square",
  freqEnd: number | null = null,
  delay = 0
): void {
  try {
    const ac = getACtx();
    if (!ac) return;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.type = type;
    const t = ac.currentTime + delay;
    osc.frequency.setValueAtTime(freq, t);
    if (freqEnd !== null) osc.frequency.exponentialRampToValueAtTime(freqEnd, t + dur * 0.9);
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.start(t);
    osc.stop(t + dur + 0.01);
  } catch {
    // ignore
  }
}

export function sfxHit(): void {
  playTone(180, 0.04, 0.3, "square", 80);
  playTone(260, 0.06, 0.2, "square", 120, 0.02);
}

export function sfxCrit(): void {
  playTone(320, 0.04, 0.35, "square", 160);
  playTone(480, 0.08, 0.25, "square", 200, 0.03);
  playTone(240, 0.1, 0.2, "sawtooth", 120, 0.06);
}

export function sfxMiss(): void {
  playTone(120, 0.08, 0.15, "sine", 90);
}

export function sfxRecv(): void {
  playTone(90, 0.05, 0.4, "sawtooth", 60);
  playTone(70, 0.12, 0.25, "square", 50, 0.04);
}

export function sfxCorrect(): void {
  playTone(523, 0.07, 0.2, "sine");
  playTone(659, 0.07, 0.2, "sine", null, 0.08);
  playTone(784, 0.1, 0.2, "sine", null, 0.16);
}

export function sfxWrong(): void {
  playTone(220, 0.05, 0.2, "sawtooth", 180);
  playTone(160, 0.12, 0.2, "sawtooth", 120, 0.06);
}

export function sfxLevelUp(): void {
  [523, 659, 784, 1047].forEach((f, i) => playTone(f, 0.1, 0.18, "sine", null, i * 0.09));
}

export function sfxStairs(): void {
  [440, 370, 310, 260].forEach((f, i) => playTone(f, 0.07, 0.18, "sine", null, i * 0.07));
}

export function sfxItem(): void {
  playTone(660, 0.06, 0.18, "sine");
  playTone(880, 0.08, 0.16, "sine", null, 0.07);
}

export function startBGM(): void {
  try {
    const ac = getACtx();
    if (!ac) return;
    if (_bgmGain) {
      _bgmGain.gain.setValueAtTime(0.001, ac.currentTime);
      _bgmGain = null;
    }

    _bgmGain = ac.createGain();
    _bgmGain.gain.setValueAtTime(0.08, ac.currentTime);
    _bgmGain.connect(ac.destination);

    const bassNotes = [110, 110, 98, 110, 110, 98, 110, 123, 98, 110, 98, 87, 98, 110, 123, 110];
    const melNotes = [220, 262, 220, 196, 220, 262, 294, 220, 196, 220, 196, 175, 196, 220, 247, 220];
    const beatLen = 0.22;
    const loopLen = bassNotes.length * beatLen;

    const localGain = _bgmGain;

    const scheduleLoop = (startTime: number) => {
      if (!localGain) return;
      const currentAc = getACtx();
      if (!currentAc) return;
      bassNotes.forEach((f, i) => {
        const t = startTime + i * beatLen;
        const osc = currentAc.createOscillator();
        const g = currentAc.createGain();
        osc.connect(g);
        g.connect(localGain);
        osc.type = "square";
        osc.frequency.setValueAtTime(f, t);
        g.gain.setValueAtTime(0.6, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + beatLen * 0.7);
        osc.start(t);
        osc.stop(t + beatLen * 0.8);
      });
      melNotes.forEach((f, i) => {
        const t = startTime + i * beatLen + beatLen * 0.5;
        const osc = currentAc.createOscillator();
        const g = currentAc.createGain();
        osc.connect(g);
        g.connect(localGain);
        osc.type = "triangle";
        osc.frequency.setValueAtTime(f, t);
        g.gain.setValueAtTime(0.4, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + beatLen * 0.6);
        osc.start(t);
        osc.stop(t + beatLen * 0.7);
      });
    }

    let nextLoopTime = ac.currentTime;
    const tick = () => {
      if (!_bgmGain || _bgmGain !== localGain) return;
      const currentAc2 = getACtx();
      if (!currentAc2) return;
      while (nextLoopTime < currentAc2.currentTime + 2.0) {
        scheduleLoop(nextLoopTime);
        nextLoopTime += loopLen;
      }
      setTimeout(tick, 500);
    }
    tick();
  } catch {
    // ignore
  }
}

export function stopBGM(): void {
  try {
    if (_bgmGain) {
      const ac = getACtx();
      if (ac) {
        _bgmGain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.3);
      }
      setTimeout(() => {
        _bgmGain = null;
      }, 400);
    }
  } catch {
    // ignore
  }
}
