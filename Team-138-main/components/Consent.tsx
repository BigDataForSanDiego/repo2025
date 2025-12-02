"use client";
import { useState } from "react";

export function Consent({ onAccept }: { onAccept: () => void }) {
  const [checked, setChecked] = useState(false);
  return (
    <div className="card">
      <h2 className="h2">Telehealth Consent</h2>
      <p className="mt-2 text-sm text-gray-700">
        By continuing, I agree to receive telehealth services from licensed providers. I understand risks and benefits of telehealth, how my information is used, and that I can stop at any time. I consent to be contacted by SMS about my care. <strong>If this is an emergency, call 911 or 988.</strong>
      </p>
      <label className="mt-3 flex items-center gap-2 text-sm">
        <input type="checkbox" checked={checked} onChange={(e) => setChecked(e.target.checked)} />
        I agree
      </label>
      <button className="btn btn-primary mt-3" disabled={!checked} onClick={onAccept}>Continue</button>
    </div>
  );
}

