import { TrendingUp, Users, Sparkles, Heart, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { communityStats } from '../data/mockData';

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-accent/5">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-primary">Your impact multiplies</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            See Your Impact
            <span className="block text-primary mt-2">Create Real Change</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8">
            Connect with homeless individuals in San Diego. Donate without choosing. 
            Watch your generosity create ripples of transformation.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/donate" className="btn-primary text-lg py-4 px-8 inline-flex items-center justify-center gap-2">
              Start Donating
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/donor/dashboard" className="bg-white border-2 border-primary text-primary font-semibold py-4 px-8 rounded-lg hover:bg-primary/5 transition-all inline-flex items-center justify-center gap-2">
              View Demo Dashboard
            </Link>
          </div>
        </div>

        {/* Live Impact Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-20">
          <div className="card text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-primary" />
            </div>
            <p className="text-4xl font-bold text-gray-900 mb-2">{communityStats.peopleHoused}</p>
            <p className="text-gray-600">People Housed This Month</p>
          </div>
          
          <div className="card text-center">
            <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-success" />
            </div>
            <p className="text-4xl font-bold text-gray-900 mb-2">{communityStats.peopleEmployed}</p>
            <p className="text-gray-600">Jobs Secured This Month</p>
          </div>
          
          <div className="card text-center">
            <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-secondary" />
            </div>
            <p className="text-4xl font-bold text-gray-900 mb-2">${communityStats.amountPaidForward}</p>
            <p className="text-gray-600">Paid Forward This Month</p>
          </div>
        </div>

        {/* How It Works */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">No choosing. No judgment. Just impact.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl font-bold text-primary">1</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">You Donate</h3>
              <p className="text-gray-600">
                Contribute any amount to RippleImpact. Your donation goes into our allocation pool.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl font-bold text-primary">2</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">We Allocate</h3>
              <p className="text-gray-600">
                Our team allocates funds based on urgency and need to verified recipients.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl font-bold text-primary">3</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Track Impact</h3>
              <p className="text-gray-600">
                See exactly who you helped and follow their journey to stability.
              </p>
            </div>
          </div>
        </div>

        {/* Ripple Effect Feature */}
        <div className="card bg-gradient-to-br from-secondary/10 to-celebration/10 border-2 border-secondary/20 mb-20">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-32 h-32 bg-secondary/20 rounded-full flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-16 h-16 text-secondary" />
            </div>
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">The Ripple Effect</h2>
              <p className="text-lg text-gray-700 mb-4">
                When recipients achieve stability, many choose to pay it forward. Your $50 donation 
                could help someone who then helps someone else. Watch your impact multiply across 
                generations of giving.
              </p>
              <div className="flex items-center gap-2 text-secondary font-semibold">
                <span>Track your ripples in your dashboard</span>
                <ArrowRight className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>

        {/* Success Stories Preview */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Real Stories, Real Impact</h2>
            <p className="text-xl text-gray-600">Meet some of the people community donations have helped</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: "Tom Martinez",
                outcome: "Now employed at Harbor Coffee Shop",
                avatar: "Tom",
                story: "With support for interview clothes and transportation, Tom landed his dream job and hasn't looked back."
              },
              {
                name: "Maria Garcia",
                outcome: "Secured stable housing",
                avatar: "Maria",
                story: "After 3 years, Maria now has her own apartment and is rebuilding her life one day at a time."
              },
              {
                name: "Sarah Chen",
                outcome: "Paid forward $30 to help Marcus",
                avatar: "Sarah",
                story: "90 days into her new job, Sarah is now helping others on their journey to stability."
              }
            ].map((story) => (
              <div key={story.name} className="card hover:shadow-xl transition-shadow">
                <img 
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${story.avatar}`}
                  alt={story.name}
                  className="w-24 h-24 rounded-full mx-auto mb-4"
                />
                <h3 className="font-bold text-xl text-gray-900 text-center mb-2">{story.name}</h3>
                <p className="text-success font-semibold text-center mb-3">{story.outcome}</p>
                <p className="text-gray-600 text-center text-sm">{story.story}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="card bg-gradient-to-br from-primary to-accent text-white text-center py-16">
          <Heart className="w-16 h-16 mx-auto mb-6" />
          <h2 className="text-4xl font-bold mb-4">Ready to Make a Difference?</h2>
          <p className="text-xl mb-8 opacity-90">
            Every donation creates a ripple of change. Start yours today.
          </p>
          <Link to="/donate" className="btn-secondary text-lg py-4 px-8 inline-flex items-center gap-2">
            Donate Now
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">RippleImpact</h3>
              <p className="text-gray-400 text-sm">Your impact multiplies</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Donors</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link to="/donate" className="hover:text-white">Make a Donation</Link></li>
                <li><Link to="/donor/dashboard" className="hover:text-white">Dashboard</Link></li>
                <li><Link to="/donor/impact" className="hover:text-white">Impact Network</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Recipients</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link to="/recipient/dashboard" className="hover:text-white">Dashboard</Link></li>
                <li><Link to="/recipient/community" className="hover:text-white">Community Hub</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">About</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white">Our Mission</a></li>
                <li><a href="#" className="hover:text-white">How We Verify</a></li>
                <li><a href="#" className="hover:text-white">Contact Us</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; 2024 RippleImpact. 501(c)(3) Nonprofit Organization. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;

