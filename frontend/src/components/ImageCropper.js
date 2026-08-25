import React, { useState, useRef } from 'react';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import './ImageCropper.css';

export default function ImageCropper({ source, onCancel, onApply }) {
  const [crop, setCrop] = useState({ unit: '%', width: 80, height: 80, x: 10, y: 10 });
  const [completedCrop, setCompletedCrop] = useState(null);
  const imgRef = useRef(null);
  const [applying, setApplying] = useState(false);

  const onImageLoad = (e) => {
    const image = e.currentTarget;
    imgRef.current = image;
    // ReactCrop reports completed crops in displayed-image pixels.
    setCompletedCrop({
      unit: 'px',
      width: image.width * 0.8,
      height: image.height * 0.8,
      x: image.width * 0.1,
      y: image.height * 0.1
    });
  };

  const applyCrop = async () => {
    if (!completedCrop || !completedCrop.width || !completedCrop.height || !imgRef.current) {
      onApply(source);
      return;
    }
    setApplying(true);
    try {
      const image = imgRef.current;
      const canvas = document.createElement('canvas');
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;
      
      const ctx = canvas.getContext('2d');

      const cropX = completedCrop.x * scaleX;
      const cropY = completedCrop.y * scaleY;
      const cropWidth = completedCrop.width * scaleX;
      const cropHeight = completedCrop.height * scaleY;

      const maxOutputSide = 1600;
      const outputScale = Math.min(1, maxOutputSide / Math.max(cropWidth, cropHeight));
      const outputWidth = Math.max(1, Math.round(cropWidth * outputScale));
      const outputHeight = Math.max(1, Math.round(cropHeight * outputScale));

      canvas.width = outputWidth;
      canvas.height = outputHeight;

      ctx.imageSmoothingQuality = 'high';

      ctx.drawImage(
        image,
        cropX,
        cropY,
        cropWidth,
        cropHeight,
        0,
        0,
        outputWidth,
        outputHeight
      );

      const base64Image = canvas.toDataURL('image/jpeg', 0.85);
      onApply(base64Image);
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
            <p>Draw a rectangle over the image to select exactly what you want to keep.</p>
          </div>
          <button type="button" className="crop-close" onClick={onCancel}>×</button>
        </div>

        <div className="crop-layout" style={{ display: 'flex', justifyContent: 'center', background: '#f1f5f9', padding: '20px', borderRadius: '12px', minHeight: '300px' }}>
          <ReactCrop
            crop={crop}
            onChange={(c) => setCrop(c)}
            onComplete={(c) => setCompletedCrop(c)}
            className="react-crop-container"
          >
            <img 
              src={source} 
              onLoad={onImageLoad} 
              alt="Crop me" 
              style={{ maxHeight: '50vh', maxWidth: '100%', objectFit: 'contain' }} 
            />
          </ReactCrop>
        </div>

        <div className="crop-actions" style={{ marginTop: '20px' }}>
          <button type="button" className="crop-secondary" onClick={onCancel}>Cancel</button>
          <button type="button" className="crop-primary" onClick={applyCrop} disabled={applying}>
            {applying ? 'Cropping...' : 'Apply Crop'}
          </button>
        </div>
      </div>
    </div>
  );
}
