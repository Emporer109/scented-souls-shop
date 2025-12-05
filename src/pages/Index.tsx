import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/Navbar';
import { ArrowRight } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url(/images/hero-bg.png)' }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/50 to-background" />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl text-foreground mb-6 animate-fade-in-up">
            Welcome to
            <span className="block text-gold-gradient mt-2">Ecommerce</span>
          </h1>
          
          <p className="font-elegant text-xl md:text-2xl text-muted-foreground mb-10 animate-fade-in-up animation-delay-200">
            Discover the essence of luxury fragrances
          </p>

          <div className="animate-fade-in-up animation-delay-300">
            <Link to="/select-gender">
              <Button variant="hero" size="xl" className="group">
                Shop Now
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>

          {/* Decorative Elements */}
          <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-px h-40 bg-gradient-to-b from-primary/50 to-transparent animate-fade-in animation-delay-500" />
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-float">
          <div className="w-6 h-10 rounded-full border-2 border-primary/50 flex items-start justify-center p-2">
            <div className="w-1 h-2 bg-primary rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="font-display text-3xl md:text-4xl text-center text-foreground mb-16 animate-fade-in-up">
            Why Choose <span className="text-primary">Luxe Parfum</span>
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Premium Quality',
                description: 'Only the finest ingredients from around the world',
                icon: '✦',
              },
              {
                title: 'Exclusive Scents',
                description: 'Unique fragrances crafted by master perfumers',
                icon: '❖',
              },
              {
                title: 'Fast Delivery',
                description: 'Worldwide shipping with elegant packaging',
                icon: '◈',
              },
            ].map((feature, index) => (
              <div
                key={feature.title}
                className={`glass-card rounded-lg p-8 text-center hover:border-primary/50 transition-all duration-500 animate-fade-in-up animation-delay-${(index + 1) * 100}`}
              >
                <span className="text-4xl text-primary mb-4 block">{feature.icon}</span>
                <h3 className="font-display text-xl text-foreground mb-3">{feature.title}</h3>
                <p className="font-body text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 bg-gradient-to-b from-transparent via-secondary/30 to-transparent">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="font-display text-3xl md:text-4xl text-foreground mb-6">
            Ready to Find Your Signature Scent?
          </h2>
          <p className="font-elegant text-lg text-muted-foreground mb-10">
            Explore our curated collection of perfumes and body sprays for men and women
          </p>
          <Link to="/select-gender">
            <Button variant="elegant" size="lg">
              Browse Collection
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-border/30">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-display text-xl text-primary">Luxe</span>
              <span className="font-elegant text-lg text-foreground">Parfum</span>
            </div>
            <p className="font-body text-sm text-muted-foreground">
              © 2024 Luxe Parfum. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
