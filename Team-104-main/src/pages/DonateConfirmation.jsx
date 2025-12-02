import { Check, Share2, Calendar } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

const DonateConfirmation = () => {
  const location = useLocation();
  const { amount, isRecurring } = location.state || { amount: 50, isRecurring: false };
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    setShowConfetti(true);
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-10px',
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            >
              <div
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor: ['#2563EB', '#F97316', '#10B981', '#8B5CF6', '#FCD34D'][
                    Math.floor(Math.random() * 5)
                  ]
                }}
              />
            </div>
          ))}
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-success rounded-full flex items-center justify-center mx-auto mb-6 animate-scale-in">
            <Check className="w-12 h-12 text-white" strokeWidth={3} />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Thank You! 🎉</h1>
          <p className="text-xl text-gray-600">Your impact starts now</p>
        </div>

        {/* Donation Summary */}
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
            <span className="text-gray-600">Donation Amount</span>
            <span className="text-3xl font-bold text-primary">${amount}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Type</span>
            <span className="font-semibold text-gray-900">
              {isRecurring ? 'Monthly Recurring' : 'One-time'}
            </span>
          </div>
        </div>

        {/* What Happens Next */}
        <div className="card mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">What Happens Next</h2>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-primary">1</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Within 48 hours</p>
                <p className="text-sm text-gray-600">
                  We'll email you about who your donation helped. You'll learn their story and how your contribution made a difference.
                </p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-primary">2</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Track their journey</p>
                <p className="text-sm text-gray-600">
                  You'll be connected to their journey through your dashboard. Follow their progress in real-time.
                </p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-primary">3</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Receive milestone updates</p>
                <p className="text-sm text-gray-600">
                  Get notified when they achieve major milestones like getting housed, employed, or paying it forward.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sample Allocation Preview */}
        <div className="card mb-6 bg-gradient-to-br from-primary/5 to-accent/5 border-2 border-primary/20">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-xl">📧</span>
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Example Allocation Email (in 24-48hrs)</h3>
              <p className="text-sm text-gray-600 mt-1">Here's what you'll receive soon:</p>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <p className="font-semibold text-gray-900 mb-2">Your ${amount} helped Tom Martinez</p>
            <p className="text-sm text-gray-700 mb-3">
              Tom is a 34-year-old who has been working hard to get back on his feet. He recently completed job training and has several interviews lined up.
            </p>
            <div className="bg-primary/10 rounded-lg p-3 mb-3">
              <p className="text-sm font-medium text-primary">
                Your contribution paid for: Interview clothing and 2 weeks of bus passes
              </p>
            </div>
            <button className="btn-primary w-full text-sm py-2">View Tom's Journey</button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link to="/donor/dashboard" className="btn-primary w-full text-center block">
            View My Dashboard
          </Link>
          
          {!isRecurring && (
            <Link 
              to="/donate" 
              className="w-full py-3 px-6 bg-white border-2 border-primary text-primary font-semibold rounded-lg hover:bg-primary/5 transition-colors text-center block flex items-center justify-center gap-2"
            >
              <Calendar className="w-5 h-5" />
              Set Up Monthly Donation
            </Link>
          )}
          
          <button className="w-full py-3 px-6 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
            <Share2 className="w-5 h-5" />
            Share Your Impact
          </button>
        </div>

        {/* Tax Receipt Notice */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            A tax receipt has been sent to your email. RippleImpact is a registered 501(c)(3) nonprofit organization.
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes confetti {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        @keyframes scale-in {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-confetti {
          animation: confetti linear forwards;
        }
        .animate-scale-in {
          animation: scale-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default DonateConfirmation;

