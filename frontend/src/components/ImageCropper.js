import React, { useMemo, useState } from 'react';
import './ImageCropper.css';

const ASPECTS = {
  '4:3': { label: 'Product card 4:3', width: 1200, height: 900 },
  '1:1': { label: 'Square 1:1', width: 1000, height: 1000 },
  '16:9': { label: 'Wide 16:9', width: 1280, height: 720 },
};

function loadImage(source) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = source;
  });
}

export default function ImageCropper({ source, onCancel, onApply }) {
  const [zoom, setZoom] = useState(1.08);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [aspect, setAspect] = useState('4:3');
  const [quality, setQuality] = useState(0.88);
  const [applying, setApplying] = useState(false);
  const ratio = useMemo(() => `${ASPECTS[aspect].width} / ${ASPECTS[aspect].height}`, [aspect]);

  const applyCrop = async () => {
    if (!source) return;
    setApplying(true);
    try {
      const image = await loadImage(source);
      const { width, height } = ASPECTS[aspect];
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      const scale = Math.max(width / image.width, height / image.height) * Number(zoom);
      const scaledW = image.width * scale;
      const scaledH = image.height * scale;
      const maxShiftX = Math.max(0, (scaledW - width) / 2);
      const maxShiftY = Math.max(0, (scaledH - height) / 2);
      const dx = (width - scaledW) / 2 + (Number(offsetX) / 100) * maxShiftX;
      const dy = (height - scaledH) / 2 + (Number(offsetY) / 100) * maxShiftY;

      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(image, dx, dy, scaledW, scaledH);
      onApply(canvas.toDataURL('image/jpeg', Number(quality)));
    } catch (error) {
      console.error('Crop failed', error);
      onApply(source);
    } finally {
      setApplying(false);
    }
  };

  if (!source) return null;

  return (
    <div className="crop-modal" role="dialog" aria-modal="true" aria-label="Crop product image">
      <div className="crop-backdrop" onClick={onCancel} />
      <div className="crop-card">
        <div className="crop-head">
          <div>
            <h2>Crop product image</h2>
            <p>Zoom and move the image exactly how you want it to appear on product cards.</p>
          </div>
          <button type="button" className="crop-close" onClick={onCancel}>×</button>
        </div>

        <div className="crop-layout">
          <div className="crop-preview-shell">
            <div className="crop-preview" style={{ aspectRatio: ratio }}>
              <img
                src={source}
                alt="Crop preview"
                style={{ transform: `translate(${offsetX / 3}%, ${offsetY / 3}%) scale(${zoom})` }}
              />
              <span className="crop-grid g1" />
              <span className="crop-grid g2" />
              <span className="crop-grid g3" />
              <span className="crop-grid g4" />
            </div>
          </div>

          <div className="crop-controls">
            <label>
              Aspect ratio
              <select value={aspect} onChange={e => setAspect(e.target.value)}>
                {Object.entries(ASPECTS).map(([key, data]) => (
                  <option key={key} value={key}>{data.label}</option>
                ))}
              </select>
            </label>

            <label>
              Zoom <strong>{Number(zoom).toFixed(2)}x</strong>
              <input type="range" min="1" max="2.4" step="0.01" value={zoom} onChange={e => setZoom(e.target.value)} />
            </label>

            <label>
              Move left / right
              <input type="range" min="-100" max="100" step="1" value={offsetX} onChange={e => setOffsetX(e.target.value)} />
            </label>

            <label>
              Move up / down
              <input type="range" min="-100" max="100" step="1" value={offsetY} onChange={e => setOffsetY(e.target.value)} />
            </label>

            <label>
              Image quality
              <input type="range" min="0.65" max="0.95" step="0.01" value={quality} onChange={e => setQuality(e.target.value)} />
            </label>

            <div className="crop-tips">
              <span>Tip</span>
              <p>Use 4:3 for normal cards. Use Square for products that need centered focus.</p>
            </div>
          </div>
        </div>

        <div className="crop-actions">
          <button type="button" className="crop-secondary" onClick={onCancel}>Cancel</button>
          <button type="button" className="crop-primary" onClick={applyCrop} disabled={applying}>
            {applying ? 'Cropping...' : 'Apply Crop'}
          </button>
        </div>
      </div>
    </div>
  );
}
