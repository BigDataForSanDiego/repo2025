import { useState } from 'react';
import { Check, CreditCard, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { communityStats } from '../data/mockData';

const Donate = () => {
  const navigate = useNavigate();
  const [selectedAmount, setSelectedAmount] = useState(50);
  const [customAmount, setCustomAmount] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [coverFees, setCoverFees] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const suggestedAmounts = [
    { amount: 25, description: "Week of transportation or meal support" },
    { amount: 50, description: "Interview preparation or job training materials" },
    { amount: 100, description: "First month utilities or essential documents" },
    { amount: 250, description: "Partial housing deposit or extended training" }
  ];

  const handleDonate = (e) => {
    e.preventDefault();
    const finalAmount = customAmount || selectedAmount;
    navigate('/donate/confirmation', { state: { amount: finalAmount, isRecurring } });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Make an Impact in San Diego</h1>
          <p className="text-xl text-gray-600 mb-6">
            Donate today. We'll show you exactly who you helped.
          </p>
          
          {/* Community Impact Stats */}
          <div className="inline-flex items-center gap-6 bg-white rounded-lg px-6 py-4 shadow-md">
            <div>
              <p className="text-2xl font-bold text-primary">{communityStats.peopleHoused}</p>
              <p className="text-sm text-gray-600">People housed</p>
            </div>
            <div className="w-px h-12 bg-gray-300" />
            <div>
              <p className="text-2xl font-bold text-success">{communityStats.peopleEmployed}</p>
              <p className="text-sm text-gray-600">People employed</p>
            </div>
            <div className="w-px h-12 bg-gray-300" />
            <div>
              <p className="text-2xl font-bold text-secondary">${communityStats.amountPaidForward}</p>
              <p className="text-sm text-gray-600">Paid forward</p>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="card mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">You Donate</h3>
              <p className="text-sm text-gray-600">Contribute to RippleImpact</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl font-bold text-primary">2</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">We Allocate</h3>
              <p className="text-sm text-gray-600">Funds go to urgent needs</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">You Track Impact</h3>
              <p className="text-sm text-gray-600">See who you helped & their progress</p>
            </div>
          </div>
          <p className="text-center text-sm text-gray-600 mt-6 italic">
            No choosing. No judgment. Just impact.
          </p>
        </div>

        {/* Donation Form */}
        <form onSubmit={handleDonate} className="card">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Donation</h2>
          
          {/* Amount Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Amount
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              {suggestedAmounts.map(({ amount, description }) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => {
                    setSelectedAmount(amount);
                    setCustomAmount('');
                  }}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedAmount === amount && !customAmount
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className="text-2xl font-bold text-gray-900">${amount}</p>
                  <p className="text-xs text-gray-600 mt-1">{description}</p>
                </button>
              ))}
            </div>
            
            {/* Custom Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom Amount
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Recurring Donation */}
          <div className="mb-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="w-5 h-5 text-primary rounded focus:ring-primary"
              />
              <div>
                <span className="font-medium text-gray-900">Make this a monthly donation</span>
                <p className="text-sm text-gray-600">Create ongoing impact</p>
              </div>
            </label>
          </div>

          {/* Where Money Goes */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-3">Where Your Money Goes</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Direct assistance to recipients</span>
                <span className="font-semibold text-gray-900">85%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Program operations & support</span>
                <span className="font-semibold text-gray-900">10%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Platform maintenance</span>
                <span className="font-semibold text-gray-900">5%</span>
              </div>
            </div>
          </div>

          {/* Donor Information */}
          <div className="mb-6 space-y-4">
            <h3 className="font-semibold text-gray-900">Your Information</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="john@example.com"
              />
            </div>
          </div>

          {/* Cover Fees */}
          <div className="mb-6">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={coverFees}
                onChange={(e) => setCoverFees(e.target.checked)}
                className="w-5 h-5 text-primary rounded focus:ring-primary mt-0.5"
              />
              <div>
                <span className="font-medium text-gray-900">Cover processing fees (+$2)</span>
                <p className="text-sm text-gray-600">So 100% of your donation reaches those in need</p>
              </div>
            </label>
          </div>

          {/* Communication Preferences */}
          <div className="mb-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-3">Stay Connected</h3>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-4 h-4 text-primary rounded" />
                <span className="text-sm text-gray-700">Email me when my donation is allocated</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-4 h-4 text-primary rounded" />
                <span className="text-sm text-gray-700">Send milestone updates from people I've helped</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 text-primary rounded" />
                <span className="text-sm text-gray-700">Weekly impact digest from the community</span>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full btn-primary text-lg py-4 flex items-center justify-center gap-2"
          >
            <CreditCard className="w-5 h-5" />
            Complete Donation ${customAmount || selectedAmount}
            {coverFees && ' + $2'}
          </button>

          <p className="text-xs text-gray-500 text-center mt-4">
            Your donation is tax-deductible. You'll receive a receipt via email.
          </p>
        </form>
      </div>
    </div>
  );
};

export default Donate;

