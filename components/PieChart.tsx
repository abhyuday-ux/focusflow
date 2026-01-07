
import React, { useEffect, useRef } from 'react';

interface PieChartProps {
  data: {
    label: string;
    value: number;
    color: string;
  }[];
}

export const PieChart: React.FC<PieChartProps> = ({ data }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const total = data.reduce((sum, item) => sum + item.value, 0);
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    // Scale for high DPI displays
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) * 0.85;

    ctx.clearRect(0, 0, width, height);

    let currentAngle = -Math.PI / 2;

    // Draw slices
    data.forEach(item => {
      const sliceAngle = (item.value / total) * 2 * Math.PI;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
      ctx.closePath();

      // Gradient fill for depth
      const gradient = ctx.createRadialGradient(centerX, centerY, radius * 0.5, centerX, centerY, radius);
      gradient.addColorStop(0, item.color);
      gradient.addColorStop(1, item.color); // Could adjust for subtle shading
      
      ctx.fillStyle = gradient;
      ctx.fill();

      // Divider lines
      ctx.strokeStyle = '#0f172a'; // Match background
      ctx.lineWidth = 4;
      ctx.stroke();

      currentAngle += sliceAngle;
    });

    // Donut hole
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.72, 0, 2 * Math.PI);
    ctx.fillStyle = '#0f172a';
    ctx.fill();
    
    // Inner ring border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Center Text
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 24px Inter';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Split', centerX, centerY - 12);
    
    ctx.font = '12px Inter';
    ctx.fillStyle = '#64748b';
    ctx.fillText('SUBJECTS', centerX, centerY + 14);

  }, [data]);

  return (
    <canvas 
      ref={canvasRef} 
      style={{ width: '300px', height: '300px' }}
      className="max-w-full drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-transform hover:scale-105 duration-700"
    />
  );
};
