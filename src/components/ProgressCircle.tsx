import { useRef, useCallback } from 'react';

interface CircularProgressProps {
  value?: number; // 0–100
  onChange: (value: number) => void;
  size?: number;
  strokeWidth?: number;
}

export const CircularProgress = ({
  value,
  onChange,
  size = 96,
  strokeWidth = 8,
}: CircularProgressProps) => {
  // Sanitize: undefined / NaN / out-of-range all become 0
  const safe = Math.min(100, Math.max(0, typeof value === 'number' && !isNaN(value) ? value : 0));

  const svgRef = useRef<SVGSVGElement>(null);
  const isDragging = useRef(false);
  const prevAngle = useRef(0);
  // Keep a mutable copy so the drag closure always reads the latest value
  const liveValue = useRef(safe);

  if (!isDragging.current) {
    liveValue.current = safe;
  }

  const cx = size / 2;
  const cy = size / 2;
  const knobRadius = strokeWidth * 0.75;
  const padding = knobRadius + 2;

  const radius = (size / 2) - strokeWidth;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (safe / 100) * circumference;
  

  const progress = safe / 100;

  const hue = 120;

  const lightness = 75 - progress * 45;

  const color = `hsl(${hue}, 70%, ${lightness}%)`;

  const track = `hsl(0, 0%, 85%)`;

  // Knob position
  const knobRad = ((safe / 100) * 360 - 90) * (Math.PI / 180);
  const knobX = cx + radius * Math.cos(knobRad);
  const knobY = cy + radius * Math.sin(knobRad);

  const getAngle = useCallback((e: MouseEvent | TouchEvent): number => {
    if (!svgRef.current) return 0;
    const rect = svgRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    let deg = Math.atan2(clientY - (rect.top + rect.height / 2), clientX - (rect.left + rect.width / 2)) * (180 / Math.PI) + 90;
    if (deg < 0) deg += 360;
    return deg;
  }, []);

  const startDrag = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      isDragging.current = true;
      e.preventDefault();

      const startAngle = getAngle(e.nativeEvent as MouseEvent | TouchEvent);
      prevAngle.current = startAngle;

      const initialValue = (startAngle / 360) * 100;
      liveValue.current = initialValue;
      onChange(Math.round(initialValue));

      const onMove = (ev: MouseEvent | TouchEvent) => {
        if (!isDragging.current) return;
        const newAngle = getAngle(ev);
        let delta = newAngle - prevAngle.current;
        if (delta > 180) delta -= 360;
        if (delta < -180) delta += 360;
        prevAngle.current = newAngle;
        const next = Math.min(
          100,
          Math.max(0, liveValue.current + (delta / 360) * 100)
        );

        liveValue.current = next;

        onChange(Math.round(next));
      };
      

      const onUp = () => {
        isDragging.current = false;
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
        window.removeEventListener('touchmove', onMove);
        window.removeEventListener('touchend', onUp);
      };

      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
      window.addEventListener('touchmove', onMove, { passive: false });
      window.addEventListener('touchend', onUp);
    },
    [getAngle, onChange]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const step = e.shiftKey ? 10 : 1;
      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
        e.preventDefault();
        onChange(Math.min(100, safe + step));
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
        e.preventDefault();
        onChange(Math.max(0, safe - step));
      }
    },
    [safe, onChange]
  );

  return (
    <svg
      ref={svgRef}
      width={size}
      height={size}
      viewBox={`-${padding} -${padding} ${size + padding * 2} ${size + padding * 2}`}
      role="slider"
      aria-label="Progress"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={safe}
      tabIndex={0}
      onMouseDown={startDrag}
      onTouchStart={startDrag}
      onKeyDown={handleKeyDown}
      style={{
        cursor: 'grab',
        userSelect: 'none',
        outline: 'none',
        flexShrink: 0,
        display: 'block',
        touchAction: 'none',
      }}
    >
      {/* Track */}
      <circle cx={cx} cy={cy} r={radius} fill="none" stroke={track} strokeWidth={strokeWidth} style={{ transition: 'stroke 0.3s' }} />

      {/* Progress arc */}
      <circle
        cx={cx} cy={cy} r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${cx} ${cy})`}
        style={{ transition: 'stroke 0.3s, stroke-dashoffset 0.05s' }}
      />

            {/* Knob / Completed Check */}
      {safe >= 100 ? (
        <g>
          <circle
            cx={cx}
            cy={cy}
            r={strokeWidth * 1.1}
            fill="none"
            stroke="white"
            strokeWidth={2}
          />

          <path
            d={`
              M ${cx - 9} ${cy}
              L ${cx - 3} ${cy + 7}
              L ${cx + 9} ${cy - 8}
            `}
            fill="white"
            stroke="#168317"
            strokeWidth={5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      ) : (
        <circle
          cx={knobX}
          cy={knobY}
          r={strokeWidth * 0.75}
          fill={color}
          stroke="white"
          strokeWidth={2}
          style={{ transition: 'fill 0.3s' }}
        />
      )}

      {/* Percentage label 
      <text
        x={cx} y={cy}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={size * 0.2}
        fontWeight="700"
        fill={color}
        style={{ transition: 'fill 0.3s', fontFamily: 'inherit', letterSpacing: '-0.5px', pointerEvents: 'none' }}
      >
        {Math.round(safe)}%
      </text>
      */}
    </svg>
  );
};