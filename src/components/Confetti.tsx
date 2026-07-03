import { useEffect, useState } from "react";

const colors = ["#7c3aed", "#a855f7", "#c084fc", "#f59e0b", "#10b981", "#3b82f6", "#ec4899"];

const Confetti = ({ show }: { show: boolean }) => {
  const [pieces] = useState(() =>
    Array.from({ length: 40 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 2,
      duration: 2 + Math.random() * 3,
      size: 6 + Math.random() * 8,
    }))
  );

  if (!show) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[100]">
      {pieces.map(p => (
        <div
          key={p.id}
          className="absolute top-0"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: Math.random() > 0.5 ? "50%" : "2px",
            animation: `confetti-fall ${p.duration}s ease-in ${p.delay}s forwards`,
          }}
        />
      ))}
    </div>
  );
};

export default Confetti;
