import React, { useState, useRef, useEffect } from 'react';
import { Palette, Upload, CheckCircle2, XCircle, Sparkles } from 'lucide-react';
import ModuleLayout from '../../components/ModuleLayout';
import AudioPlayer from '../../components/AudioPlayer';
import { processModuleAI } from '../../utils/api';
import { useAccessibility } from '../../context/AccessibilityContext';

function hexToRgb(hex) {
  const cleaned = hex.replace('#', '');
  const bigint = parseInt(cleaned, 16);
  if (isNaN(bigint)) return { r: 0, g: 0, b: 0 };
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
}

function getLuminance({ r, g, b }) {
  const a = [r, g, b].map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

function getContrastRatio(hex1, hex2) {
  const lum1 = getLuminance(hexToRgb(hex1));
  const lum2 = getLuminance(hexToRgb(hex2));
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return ((brightest + 0.05) / (darkest + 0.05)).toFixed(2);
}

export default function ColorIdModule() {
  const { announce } = useAccessibility();
  const [fgHex, setFgHex] = useState('#1E3A8A');
  const [bgHex, setBgHex] = useState('#FFFFFF');
  const [cvdType, setCvdType] = useState('Deuteranopia (Red-Green Common)');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const canvasRef = useRef(null);

  const ratio = parseFloat(getContrastRatio(fgHex, bgHex));
  const passAA = ratio >= 4.5;
  const passAALarge = ratio >= 3.0;
  const passAAA = ratio >= 7.0;

  // Draw default color spectrum on HTML5 Canvas for interactive pixel sampling
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createLinearGradient(0, 0, canvas.width, 0);
    grad.addColorStop(0, '#1E3A8A');
    grad.addColorStop(0.25, '#047857');
    grad.addColorStop(0.5, '#FACC15');
    grad.addColorStop(0.75, '#B91C1C');
    grad.addColorStop(1, '#6D28D9');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      announce('Image loaded onto Canvas. Click any point on the canvas to sample its exact color.');
    };
    img.src = URL.createObjectURL(file);
  };

  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor(((e.clientX - rect.left) / rect.width) * canvas.width);
    const y = Math.floor(((e.clientY - rect.top) / rect.height) * canvas.height);
    const ctx = canvas.getContext('2d');
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    const hex =
      '#' +
      [pixel[0], pixel[1], pixel[2]]
        .map((c) => c.toString(16).padStart(2, '0'))
        .join('')
        .toUpperCase();
    setFgHex(hex);
    announce(`Sampled pixel color ${hex}`);
  };

  const handleAnalyzeAI = async () => {
    setLoading(true);
    try {
      const res = await processModuleAI(
        'color-id',
        `Foreground: ${fgHex}, Background: ${bgHex}, Contrast Ratio: ${ratio}:1`,
        {
          foregroundHex: fgHex,
          backgroundHex: bgHex,
          contrastRatio: `${ratio}:1`,
          cvdType,
        }
      );
      setResult(res.data);
      announce(`Color identification complete. Contrast ratio is ${ratio} to 1.`);
    } catch {
      announce('Could not run AI color description');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModuleLayout
      title="Color Identification & WCAG Contrast Checker"
      category="Vision & Surroundings"
      description="Uses HTML5 Canvas pixel inspection and Gemini AI to identify precise natural-language color names and verify WCAG 2.1 AA/AAA contrast ratios."
      icon={Palette}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-6 hc-card bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-slate-800 hc-accent">
                Interactive HTML5 Canvas Eyedropper (Click to Sample Color)
              </span>
              <label
                htmlFor="color-img-upload"
                className="hc-card inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold cursor-pointer hover:bg-slate-100"
              >
                <Upload className="w-3.5 h-3.5 text-blue-700 hc-accent" aria-hidden="true" />
                <span>Load Photo to Sample</span>
                <input
                  id="color-img-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="sr-only"
                />
              </label>
            </div>
            <canvas
              ref={canvasRef}
              width={480}
              height={150}
              onClick={handleCanvasClick}
              aria-label="Interactive color sampling canvas. Click anywhere to inspect pixel hex code."
              className="w-full h-36 rounded-xl border-2 border-slate-300 cursor-crosshair"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="fg-color-input"
                className="block text-xs font-bold uppercase text-slate-600 hc-accent mb-1"
              >
                Foreground / Text Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  aria-label="Foreground color picker"
                  value={fgHex}
                  onChange={(e) => setFgHex(e.target.value.toUpperCase())}
                  className="w-12 h-10 rounded cursor-pointer border border-slate-300"
                />
                <input
                  id="fg-color-input"
                  type="text"
                  value={fgHex}
                  onChange={(e) => setFgHex(e.target.value.toUpperCase())}
                  className="hc-input flex-1 px-3 py-2 rounded-xl border border-slate-300 font-mono text-sm font-bold"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="bg-color-input"
                className="block text-xs font-bold uppercase text-slate-600 hc-accent mb-1"
              >
                Background Surface Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  aria-label="Background color picker"
                  value={bgHex}
                  onChange={(e) => setBgHex(e.target.value.toUpperCase())}
                  className="w-12 h-10 rounded cursor-pointer border border-slate-300"
                />
                <input
                  id="bg-color-input"
                  type="text"
                  value={bgHex}
                  onChange={(e) => setBgHex(e.target.value.toUpperCase())}
                  className="hc-input flex-1 px-3 py-2 rounded-xl border border-slate-300 font-mono text-sm font-bold"
                />
              </div>
            </div>
          </div>

          {/* Live Contrast Preview Box */}
          <div
            style={{ backgroundColor: bgHex, color: fgHex }}
            className="p-5 rounded-2xl border-2 border-slate-300 text-center space-y-1"
          >
            <p className="text-xl font-extrabold">
              Live Contrast Preview ({ratio}:1)
            </p>
            <p className="text-sm font-medium">
              The quick brown fox jumps over the lazy dog.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold">
            <div
              className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 ${
                passAA ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-red-50 border-red-300 text-red-900'
              }`}
            >
              {passAA ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
              <span>WCAG AA (4.5:1)</span>
            </div>
            <div
              className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 ${
                passAALarge ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-red-50 border-red-300 text-red-900'
              }`}
            >
              {passAALarge ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
              <span>AA Large (3.0:1)</span>
            </div>
            <div
              className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 ${
                passAAA ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-red-50 border-red-300 text-red-900'
              }`}
            >
              {passAAA ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
              <span>WCAG AAA (7.0:1)</span>
            </div>
          </div>

          <div>
            <label
              htmlFor="cvd-select"
              className="block text-xs font-bold uppercase text-slate-600 hc-accent mb-1"
            >
              Color Vision Deficiency Lens
            </label>
            <select
              id="cvd-select"
              value={cvdType}
              onChange={(e) => setCvdType(e.target.value)}
              className="hc-input w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold"
            >
              <option>Deuteranopia (Red-Green Common)</option>
              <option>Protanopia (Red-Weak)</option>
              <option>Tritanopia (Blue-Yellow)</option>
              <option>Achromatopsia (Monochromacy)</option>
            </select>
          </div>

          <button
            type="button"
            onClick={handleAnalyzeAI}
            disabled={loading}
            className="hc-button-primary w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-700 text-white font-bold hover:bg-blue-800"
          >
            <Sparkles className="w-5 h-5" aria-hidden="true" />
            <span>
              {loading ? 'Describing Colors...' : 'Get AI Descriptive Color Names & CVD Guidance'}
            </span>
          </button>
        </section>

        <section
          aria-live="polite"
          className="lg:col-span-6 hc-card bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4"
        >
          <h2 className="text-lg font-extrabold text-slate-900 hc-accent">
            Natural-Language Color Description & Safe Pairings
          </h2>

          {!result ? (
            <p className="text-sm text-slate-600 hc-accent">
              Sample any color from the canvas or pick two hex codes, then click the button to hear rich sensory color descriptions and safe high-contrast pairings.
            </p>
          ) : (
            <div className="space-y-4">
              <AudioPlayer
                text={`Contrast ratio is ${ratio} to 1. ${result.colorBlindGuidance}`}
                title="Listen to Color Analysis"
              />

              {Array.isArray(result.dominantColors) && (
                <div className="space-y-2.5">
                  {result.dominantColors.map((c, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 hc-card flex items-center gap-3"
                    >
                      <span
                        style={{ backgroundColor: c.hex }}
                        className="w-10 h-10 rounded-lg border border-slate-400 shrink-0"
                      />
                      <div>
                        <p className="text-sm font-extrabold text-slate-900 hc-accent">
                          {c.preciseName} ({c.hex})
                        </p>
                        <p className="text-xs text-slate-600 hc-accent">
                          {c.naturalDescription} • {c.colorFamily}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {result.colorBlindGuidance && (
                <div className="p-4 rounded-xl bg-pink-50 border border-pink-200 hc-card text-xs font-semibold text-slate-900 hc-accent">
                  {result.colorBlindGuidance}
                </div>
              )}

              {Array.isArray(result.accessiblePairings) && (
                <div>
                  <h3 className="text-xs font-bold uppercase text-slate-500 hc-accent mb-2">
                    Recommended AAA High-Contrast Pairings
                  </h3>
                  <div className="space-y-2">
                    {result.accessiblePairings.map((pair, i) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-lg border border-slate-200 hc-card text-xs flex items-center justify-between"
                      >
                        <span className="font-mono font-bold">
                          BG {pair.background} / Text {pair.text}
                        </span>
                        <span className="font-semibold text-emerald-700 hc-accent">
                          {pair.ratio}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </ModuleLayout>
  );
}

