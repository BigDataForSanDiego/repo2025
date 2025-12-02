import { impactTree } from '../data/mockData';
import { Sparkles, TrendingUp, Users } from 'lucide-react';

const ImpactNode = ({ person, amount, isRipple = false, level = 0 }) => {
  return (
    <div className={`flex items-center gap-3 ${level > 0 ? 'ml-8' : ''}`}>
      <div className={`w-4 h-4 rounded-full ${isRipple ? 'bg-secondary' : 'bg-primary'}`} />
      <div className="card flex-1 !py-3">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-gray-900">{person}</span>
          <span className={`font-bold ${isRipple ? 'text-secondary' : 'text-primary'}`}>
            ${amount}
          </span>
        </div>
      </div>
    </div>
  );
};

const ConnectionLine = ({ level = 0 }) => {
  return (
    <div className={`flex items-center ${level > 0 ? 'ml-8' : ''}`}>
      <div className="w-4 h-8 border-l-2 border-gray-300 ml-2" />
    </div>
  );
};

const ImpactNetwork = () => {
  const totalReach = 1 + impactTree.connections.length + 
    impactTree.connections.reduce((sum, conn) => sum + conn.ripples.length, 0);
  
  const generations = 3;
  
  const rippleCount = impactTree.connections.reduce((sum, conn) => sum + conn.ripples.length, 0);

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Impact Network</h1>
          <p className="text-gray-600">Visualize how your generosity creates ripples of change</p>
        </div>

        {/* Network Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="card">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Reach</p>
                <p className="text-2xl font-bold text-gray-900">{totalReach} people</p>
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Ripple Effects</p>
                <p className="text-2xl font-bold text-gray-900">{rippleCount}</p>
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Generations</p>
                <p className="text-2xl font-bold text-gray-900">{generations} levels</p>
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="card mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">Legend</h3>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-primary" />
              <span className="text-sm text-gray-700">Direct donation (you → recipient)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-secondary" />
              <span className="text-sm text-gray-700">Ripple effect (recipient → new recipient)</span>
            </div>
          </div>
        </div>

        {/* Network Tree */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Your Impact Tree</h2>
          
          <div className="space-y-2">
            {/* Root - Donor */}
            <ImpactNode 
              person={impactTree.donor.name} 
              amount={impactTree.donor.amount} 
            />
            
            {/* Direct Connections */}
            {impactTree.connections.map((connection) => (
              <div key={connection.id}>
                <ConnectionLine />
                <ImpactNode 
                  person={connection.recipient.name} 
                  amount={connection.recipient.amount}
                  level={1}
                />
                
                {/* Ripples */}
                {connection.ripples.map((ripple) => (
                  <div key={ripple.id}>
                    <ConnectionLine level={1} />
                    <ImpactNode 
                      person={ripple.recipient.name} 
                      amount={ripple.recipient.amount}
                      isRipple={true}
                      level={2}
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Recent Ripple Activity */}
        <div className="mt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Ripple Activity</h2>
          <div className="space-y-3">
            <div className="card">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-secondary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-secondary" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Sarah Chen paid it forward!</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Donated $30 to help Marcus Johnson with interview preparation
                  </p>
                  <p className="text-xs text-gray-500 mt-1">2 days ago</p>
                </div>
              </div>
            </div>
            
            <div className="card">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-secondary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-secondary" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">David Thompson created a ripple!</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Donated $25 to Emily Rodriguez for transportation costs
                  </p>
                  <p className="text-xs text-gray-500 mt-1">5 days ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImpactNetwork;

