import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, LogOut, Settings, Menu, X, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/hooks/useCart';
import { useState, useEffect } from 'react';

export function Navbar() {
  const { user, isAdmin, signOut } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
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
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="font-display text-2xl text-primary">Luxury</span>
            <span className="font-elegant text-xl text-foreground">Perfumes</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/select-gender" className="text-muted-foreground hover:text-primary transition-colors font-body text-sm uppercase tracking-wider">
              Shop
            </Link>
            <Link to="/products/men" className="text-muted-foreground hover:text-primary transition-colors font-body text-sm uppercase tracking-wider">
              Men
            </Link>
            <Link to="/products/women" className="text-muted-foreground hover:text-primary transition-colors font-body text-sm uppercase tracking-wider">
              Women
            </Link>
          </div>

          {/* Right Side */}
          <div className="hidden md:flex items-center gap-2">
            {/* Theme Toggle Button */}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleTheme}
              className="relative text-foreground hover:text-primary overflow-hidden group"
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              <div className={`absolute inset-0 bg-primary/10 rounded-full scale-0 group-hover:scale-100 transition-transform duration-300`} />
              {isDark ? (
                <Sun className="h-5 w-5 transition-all duration-300 rotate-0 group-hover:rotate-90" />
              ) : (
                <Moon className="h-5 w-5 transition-all duration-300 rotate-0 group-hover:-rotate-12" />
              )}
            </Button>

            {user ? (
              <>
                <Link to="/cart" className="relative">
                  <Button variant="ghost" size="icon" className="text-foreground hover:text-primary">
                    <ShoppingCart className="h-5 w-5" />
                    {totalItems > 0 && (
                      <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                        {totalItems}
                      </span>
                    )}
                  </Button>
                </Link>
                <Link to="/profile">
                  <Button variant="ghost" size="icon" className="text-foreground hover:text-primary">
                    <User className="h-5 w-5" />
                  </Button>
                </Link>
                {isAdmin && (
                  <Link to="/admin">
                    <Button variant="ghost" size="icon" className="text-foreground hover:text-primary">
                      <Settings className="h-5 w-5" />
                    </Button>
                  </Link>
                )}
                <Button variant="ghost" size="icon" onClick={handleSignOut} className="text-foreground hover:text-primary">
                  <LogOut className="h-5 w-5" />
                </Button>
              </>
            ) : (
              <Link to="/auth">
                <Button variant="elegant" size="sm">
                  Sign In
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border/50 animate-fade-in">
            <div className="flex flex-col gap-4">
              <Link
                to="/select-gender"
                className="text-foreground hover:text-primary transition-colors font-body text-sm uppercase tracking-wider py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Shop
              </Link>
              <Link
                to="/products/men"
                className="text-foreground hover:text-primary transition-colors font-body text-sm uppercase tracking-wider py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Men
              </Link>
              <Link
                to="/products/women"
                className="text-foreground hover:text-primary transition-colors font-body text-sm uppercase tracking-wider py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Women
              </Link>
              {user ? (
                <>
                  <Link
                    to="/cart"
                    className="text-foreground hover:text-primary transition-colors font-body text-sm uppercase tracking-wider py-2 flex items-center gap-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <ShoppingCart className="h-4 w-4" />
                    Cart ({totalItems})
                  </Link>
                  <Link
                    to="/profile"
                    className="text-foreground hover:text-primary transition-colors font-body text-sm uppercase tracking-wider py-2 flex items-center gap-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <User className="h-4 w-4" />
                    Profile
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="text-foreground hover:text-primary transition-colors font-body text-sm uppercase tracking-wider py-2 flex items-center gap-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Settings className="h-4 w-4" />
                      Admin
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      handleSignOut();
                      setMobileMenuOpen(false);
                    }}
                    className="text-foreground hover:text-primary transition-colors font-body text-sm uppercase tracking-wider py-2 flex items-center gap-2 text-left"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  to="/auth"
                  className="text-primary font-body text-sm uppercase tracking-wider py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
              )}
              
              {/* Mobile Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="text-foreground hover:text-primary transition-colors font-body text-sm uppercase tracking-wider py-2 flex items-center gap-2 text-left"
              >
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                {isDark ? 'Light Mode' : 'Dark Mode'}
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
