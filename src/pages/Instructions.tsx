import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Languages, ArrowRight } from 'lucide-react';

const Instructions = () => {
  const [language, setLanguage] = useState<'hindi' | 'english'>('hindi');
  const navigate = useNavigate();

  const handleContinue = () => {
    // Mark instructions as viewed in sessionStorage
    sessionStorage.setItem('instructionsViewed', 'true');
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <a href="/" className="inline-block">
            <span className="font-display text-3xl text-primary">BrijSeller</span>
            <span className="font-elegant text-xl text-foreground ml-2">Luxury Perfumes</span>
          </a>
        </div>

        {/* Instructions Card */}
        <div className="glass-card rounded-xl p-6 md:p-8 animate-fade-in-up">
          {language === 'hindi' ? (
            <div className="space-y-6">
              <h1 className="font-display text-2xl md:text-3xl text-foreground text-center">
                🙏 स्वागत है BrijSeller - Luxury Perfume Shop में
              </h1>
              
              <div className="space-y-4">
                <h2 className="font-display text-xl text-primary">
                  Website उपयोग करने के निर्देश:
                </h2>
                
                <ul className="space-y-3 font-body text-foreground/90 leading-relaxed">
                  <li className="flex gap-3">
                    <span className="text-primary font-semibold">1.</span>
                    <span>सबसे बेहतरीन और सस्ते दामों पर उपलब्ध perfumes के लिए आपका स्वागत है।</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-primary font-semibold">2.</span>
                    <span>यहाँ सभी products सबसे कम कीमत पर उपलब्ध हैं।</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-primary font-semibold">3.</span>
                    <span>सबसे पहले अपना पसंदीदा perfume चुनकर <strong className="text-primary">Add to Cart</strong> करें।</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-primary font-semibold">4.</span>
                    <span>उसके बाद Cart में जाकर <strong className="text-primary">Proceed to Checkout</strong> बटन पर क्लिक करें।</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-primary font-semibold">5.</span>
                    <span>आपका order successfully placed हो जाएगा — <em>Thank you for placing your order!</em></span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-primary font-semibold">6.</span>
                    <span>इसके बाद आपको केवल हमारी confirmation call का इंतजार करना है।</span>
                  </li>
                </ul>
              </div>

              {/* Important Notice - Highlighted */}
              <div className="bg-destructive/10 border-2 border-destructive rounded-lg p-4 mt-6">
                <h3 className="font-display text-lg text-destructive flex items-center gap-2 mb-2">
                  ⚠️ महत्वपूर्ण सूचना:
                </h3>
                <p className="font-body text-destructive font-semibold">
                  कृपया अपना फोन नंबर सही भरें — क्योंकि order confirmation call इसी नंबर पर आएगी।
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <h1 className="font-display text-2xl md:text-3xl text-foreground text-center">
                🙏 Welcome to BrijSeller - Luxury Perfume Shop
              </h1>
              
              <div className="space-y-4">
                <h2 className="font-display text-xl text-primary">
                  Instructions to use this website:
                </h2>
                
                <ul className="space-y-3 font-body text-foreground/90 leading-relaxed">
                  <li className="flex gap-3">
                    <span className="text-primary font-semibold">1.</span>
                    <span>Welcome to the best perfume shop with the cheapest prices.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-primary font-semibold">2.</span>
                    <span>All products here are available at the lowest possible rates.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-primary font-semibold">3.</span>
                    <span>First choose your favorite perfume and click <strong className="text-primary">Add to Cart</strong>.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-primary font-semibold">4.</span>
                    <span>Then go to Cart and click <strong className="text-primary">Proceed to Checkout</strong>.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-primary font-semibold">5.</span>
                    <span>Your order will be successfully placed — <em>Thank you for placing your order!</em></span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-primary font-semibold">6.</span>
                    <span>After this, simply wait for our confirmation call.</span>
                  </li>
                </ul>
              </div>

              {/* Important Notice - Highlighted */}
              <div className="bg-destructive/10 border-2 border-destructive rounded-lg p-4 mt-6">
                <h3 className="font-display text-lg text-destructive flex items-center gap-2 mb-2">
                  ⚠️ Important Notice:
                </h3>
                <p className="font-body text-destructive font-semibold">
                  Please enter your phone number correctly — because the confirmation call will come on this number.
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <Button
              variant="outline"
              size="lg"
              className="flex-1"
              onClick={() => setLanguage(language === 'hindi' ? 'english' : 'hindi')}
            >
              <Languages className="mr-2 h-5 w-5" />
              {language === 'hindi' ? 'View in English' : 'हिंदी में देखें'}
            </Button>
            
            <Button
              variant="gold"
              size="lg"
              className="flex-1"
              onClick={handleContinue}
            >
              Continue to Sign In
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Instructions;
