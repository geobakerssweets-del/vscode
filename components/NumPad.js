'use client';
// On-screen number pad for PIN / password fields. Keeps focus in the input so the keyboard still works.
const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'];
export const applyKey = (value, k, max = 12) => (k === 'C' ? '' : k === '⌫' ? value.slice(0, -1) : (value + k).slice(0, max));
export default function NumPad({ onKey }) {
  return (
    <div className="npad" role="group" aria-label="Number pad">
      {KEYS.map((k) => (
        <button key={k} type="button" tabIndex={-1} aria-label={k === '⌫' ? 'Backspace' : k === 'C' ? 'Clear' : k}
          onMouseDown={(e) => e.preventDefault()} onClick={() => onKey(k)}>{k}</button>
      ))}
    </div>
  );
}
