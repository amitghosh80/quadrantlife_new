import { useEffect, useState } from 'react';

interface Balloon {
  id: number;
  left: number;
  delay: number;
  duration: number;
  color: string;
}

export function Balloons() {
  const [balloons, setBalloons] = useState<Balloon[]>([]);

  useEffect(() => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'];
    const newBalloons: Balloon[] = [];

    for (let i = 0; i < 15; i++) {
      newBalloons.push({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.5,
        duration: 3 + Math.random() * 2,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    setBalloons(newBalloons);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {balloons.map((balloon) => (
        <div
          key={balloon.id}
          className="absolute bottom-0 animate-float-up"
          style={{
            left: `${balloon.left}%`,
            animationDelay: `${balloon.delay}s`,
            animationDuration: `${balloon.duration}s`,
          }}
        >
          <div className="relative">
            <div
              className="w-12 h-14 rounded-full shadow-lg"
              style={{
                background: `radial-gradient(circle at 30% 30%, ${balloon.color}dd, ${balloon.color})`,
                animation: 'sway 2s ease-in-out infinite',
              }}
            />
            <div
              className="absolute top-full left-1/2 w-0.5 h-8 bg-gray-400 origin-top"
              style={{
                transform: 'translateX(-50%)',
              }}
            />
          </div>
        </div>
      ))}
      <style>{`
        @keyframes float-up {
          0% {
            transform: translateY(0) translateX(0);
            opacity: 1;
          }
          100% {
            transform: translateY(-100vh) translateX(20px);
            opacity: 0;
          }
        }

        @keyframes sway {
          0%, 100% {
            transform: rotate(-5deg);
          }
          50% {
            transform: rotate(5deg);
          }
        }

        .animate-float-up {
          animation: float-up 4s ease-in forwards;
        }
      `}</style>
    </div>
  );
}
