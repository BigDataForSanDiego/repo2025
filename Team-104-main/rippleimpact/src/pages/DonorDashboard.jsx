import { TrendingUp, Users, Sparkles, BookOpen } from 'lucide-react';
import { donorStats, impactUpdates } from '../data/mockData';

const StatCard = ({ icon: Icon, label, value, change }) => (
  <div className="card">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-gray-600 mb-1">{label}</p>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        {change && (
          <div className="flex items-center gap-1 mt-2">
            <TrendingUp className="w-4 h-4 text-success" />
            <span className="text-sm text-success font-medium">+{change}%</span>
            <span className="text-sm text-gray-500">vs last month</span>
          </div>
        )}
      </div>
      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
        <Icon className="w-6 h-6 text-primary" />
      </div>
    </div>
  </div>
);

const UpdateCard = ({ update }) => (
  <div className={`card ${update.isRipple ? 'ring-2 ring-secondary' : ''}`}>
    {update.isRipple && (
      <div className="mb-4 bg-gradient-to-r from-secondary/20 to-celebration/20 -mx-6 -mt-6 px-6 py-3 rounded-t-xl border-b-2 border-secondary">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-secondary" />
          <span className="font-bold text-secondary uppercase text-sm">Ripple Effect</span>
        </div>
        <p className="text-sm text-gray-700 mt-1">{update.rippleDetails}</p>
      </div>
    )}
    
    <div className="flex gap-4">
      <img 
        src={update.avatar} 
        alt={update.name}
        className="w-12 h-12 rounded-full flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <h3 className="font-semibold text-gray-900">{update.name}</h3>
            <p className="text-sm text-gray-500">{update.timestamp}</p>
          </div>
          <span className={`badge ${
            update.status === 'Employed' ? 'bg-success/10 text-success' :
            update.status === 'Housing Secured' ? 'bg-primary/10 text-primary' :
            'bg-accent/10 text-accent'
          }`}>
            {update.status}
          </span>
        </div>
        
        <p className="text-gray-700 mb-3">{update.update}</p>
        
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
          <p className="text-sm text-gray-600">
            <span className="font-medium text-gray-900">Your impact: </span>
            {update.contribution}
          </p>
        </div>
      </div>
    </div>
  </div>
);

const DonorDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={TrendingUp}
            label="Total Donated"
            value={`$${donorStats.totalDonated}`}
            change={donorStats.monthOverMonth}
          />
          <StatCard
            icon={Users}
            label="People Helped"
            value={donorStats.peopleHelped}
          />
          <StatCard
            icon={Sparkles}
            label="Ripple Effect"
            value={donorStats.rippleEffect}
          />
          <StatCard
            icon={BookOpen}
            label="Active Stories"
            value={donorStats.activeStories}
          />
        </div>

        {/* Impact Feed */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Recent Updates</h2>
            <button className="text-sm text-primary hover:text-primary-dark font-medium">
              View All
            </button>
          </div>

          <div className="space-y-4">
            {impactUpdates.map((update) => (
              <UpdateCard key={update.id} update={update} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonorDashboard;

