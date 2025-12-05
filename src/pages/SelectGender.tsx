import { Link } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';

const SelectGender = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="font-display text-4xl md:text-5xl text-foreground mb-4 animate-fade-in-up">
              Choose Your <span className="text-primary">Collection</span>
            </h1>
            <p className="font-elegant text-lg text-muted-foreground animate-fade-in-up animation-delay-100">
              Select a category to explore our exclusive fragrances
            </p>
          </div>

          {/* Gender Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Men Card */}
            <Link
              to="/products/men"
              className="group relative aspect-[3/4] rounded-xl overflow-hidden glass-card hover:border-primary/50 transition-all duration-500 animate-fade-in-up animation-delay-200"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
                <span className="font-display text-7xl md:text-8xl text-primary/20 mb-4 group-hover:text-primary/40 transition-colors duration-500">
                  ♂
                </span>
                <h2 className="font-display text-4xl md:text-5xl text-foreground mb-3 group-hover:text-primary transition-colors duration-300">
                  Men
                </h2>
                <p className="font-body text-muted-foreground text-center">
                  Bold & sophisticated scents
                </p>
                <div className="mt-6 w-12 h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
              </div>
            </Link>

            {/* Women Card */}
            <Link
              to="/products/women"
              className="group relative aspect-[3/4] rounded-xl overflow-hidden glass-card hover:border-primary/50 transition-all duration-500 animate-fade-in-up animation-delay-300"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
                <span className="font-display text-7xl md:text-8xl text-primary/20 mb-4 group-hover:text-primary/40 transition-colors duration-500">
                  ♀
                </span>
                <h2 className="font-display text-4xl md:text-5xl text-foreground mb-3 group-hover:text-primary transition-colors duration-300">
                  Women
                </h2>
                <p className="font-body text-muted-foreground text-center">
                  Elegant & enchanting aromas
                </p>
                <div className="mt-6 w-12 h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
              </div>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SelectGender;
