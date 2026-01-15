import { useState, useEffect } from 'react';

export function LampToggle() {
  const [isDark, setIsDark] = useState(true);
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);

  useEffect(() => {
    // Check for saved preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const handlePull = () => {
    setIsPulling(true);
    setPullDistance(40);

    // Animate the pull
    setTimeout(() => {
      setPullDistance(0);
      setIsPulling(false);
      
      const newIsDark = !isDark;
      setIsDark(newIsDark);
      
      if (newIsDark) {
        document.documentElement.classList.remove('light');
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
        localStorage.setItem('theme', 'light');
      }
    }, 300);
  };

  return (
    <div className="fixed top-20 right-8 z-40 flex flex-col items-center select-none">
      {/* Ceiling mount */}
      <div className="w-6 h-3 bg-gradient-to-b from-muted to-muted-foreground/30 rounded-b-sm" />
      
      {/* Cord */}
      <div 
        className="w-0.5 bg-gradient-to-b from-muted-foreground/50 to-muted-foreground/30 transition-all duration-300 ease-out"
        style={{ 
          height: `${60 + pullDistance}px`,
        }}
      />
      
      {/* Pull chain bulb/bead */}
      <button
        onClick={handlePull}
        className={`
          relative w-8 h-10 rounded-full cursor-pointer
          transition-all duration-300 ease-out
          hover:scale-110 active:scale-95
          ${isPulling ? 'translate-y-2' : ''}
        `}
        style={{
          background: isDark 
            ? 'linear-gradient(180deg, hsl(var(--muted)) 0%, hsl(var(--charcoal)) 100%)'
            : 'linear-gradient(180deg, hsl(var(--gold-light)) 0%, hsl(var(--gold)) 100%)',
          boxShadow: isDark 
            ? '0 4px 15px hsl(var(--muted) / 0.3)'
            : '0 4px 25px hsl(var(--gold) / 0.6), 0 0 40px hsl(var(--gold) / 0.3)',
        }}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {/* Bulb highlight */}
        <div 
          className={`
            absolute top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full
            transition-all duration-500
            ${isDark 
              ? 'bg-muted-foreground/20' 
              : 'bg-white/60 shadow-[0_0_10px_hsl(var(--gold-light))]'
            }
          `}
        />
        
        {/* Light rays when ON */}
        {!isDark && (
          <div className="absolute inset-0 flex items-center justify-center">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute w-0.5 h-3 bg-gold-light/40 animate-pulse"
                style={{
                  transform: `rotate(${i * 60}deg) translateY(-14px)`,
                  animationDelay: `${i * 100}ms`,
                }}
              />
            ))}
          </div>
        )}
      </button>
      
      {/* Pull string end decoration */}
      <div 
        className={`
          w-4 h-4 rounded-full border-2 mt-1
          transition-all duration-300
          ${isDark 
            ? 'border-muted-foreground/40 bg-transparent' 
            : 'border-gold bg-gold/20 shadow-[0_0_10px_hsl(var(--gold)/0.4)]'
          }
        `}
      />
      
      {/* Tooltip */}
      <div 
        className={`
          absolute -left-20 top-1/2 -translate-y-1/2
          px-3 py-1.5 rounded-md text-xs font-body
          bg-card/90 backdrop-blur-sm border border-border/50
          opacity-0 hover:opacity-100 pointer-events-none
          transition-opacity duration-300
          whitespace-nowrap
        `}
      >
        {isDark ? '💡 Turn on light' : '🌙 Turn off light'}
      </div>
    </div>
  );
}
