import { Calendar, Award, DollarSign, Heart, Plus, Target } from 'lucide-react';
import { recipientProfile, recipientMilestones } from '../data/mockData';
import { Link } from 'react-router-dom';

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="card">
    <div className="flex items-center gap-3">
      <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-sm text-gray-600">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  </div>
);

const MilestoneCard = ({ milestone }) => (
  <div className="card hover:shadow-lg transition-shadow">
    <div className="flex items-start gap-4">
      <div className="text-4xl">{milestone.icon}</div>
      <div className="flex-1">
        <h3 className="font-semibold text-gray-900 mb-1">{milestone.title}</h3>
        <p className="text-sm text-gray-600 mb-2">{milestone.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">{milestone.date}</span>
          {milestone.celebrated && (
            <div className="flex items-center gap-1 text-secondary">
              <Heart className="w-4 h-4 fill-current" />
              <span className="text-sm font-medium">{milestone.celebrationCount}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
);

const GoalTracker = ({ goal, current, target }) => {
  const percentage = (current / target) * 100;
  return (
    <div className="card">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-900">{goal}</h3>
          <p className="text-sm text-gray-600">${current} of ${target}</p>
        </div>
        <div className="text-2xl">{percentage >= 100 ? '🎉' : '🎯'}</div>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div 
          className="bg-primary h-3 rounded-full transition-all duration-500"
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      <p className="text-right text-sm font-semibold text-primary mt-2">{Math.round(percentage)}%</p>
    </div>
  );
};

const RecipientDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {recipientProfile.name.split(' ')[0]}! 👋
          </h1>
          <p className="text-gray-600">Keep up the amazing progress</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={Calendar}
            label="Days on Platform"
            value={recipientProfile.daysOnPlatform}
            color="bg-primary"
          />
          <StatCard
            icon={Award}
            label="Milestones"
            value={recipientProfile.milestonesAchieved}
            color="bg-success"
          />
          <StatCard
            icon={DollarSign}
            label="Support Received"
            value={`$${recipientProfile.supportReceived}`}
            color="bg-accent"
          />
          <StatCard
            icon={Heart}
            label="Times Helped"
            value={recipientProfile.timesHelpedOthers}
            color="bg-secondary"
          />
        </div>

        {/* Quick Actions */}
        <div className="card mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button className="flex flex-col items-center gap-2 p-4 bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors">
              <Plus className="w-6 h-6 text-primary" />
              <span className="text-sm font-medium text-gray-900">Post Update</span>
            </button>
            <Link 
              to="/recipient/community"
              className="flex flex-col items-center gap-2 p-4 bg-accent/10 hover:bg-accent/20 rounded-lg transition-colors"
            >
              <Heart className="w-6 h-6 text-accent" />
              <span className="text-sm font-medium text-gray-900">Community</span>
            </Link>
            <button className="flex flex-col items-center gap-2 p-4 bg-success/10 hover:bg-success/20 rounded-lg transition-colors">
              <Target className="w-6 h-6 text-success" />
              <span className="text-sm font-medium text-gray-900">Set Goal</span>
            </button>
            <button className="flex flex-col items-center gap-2 p-4 bg-secondary/10 hover:bg-secondary/20 rounded-lg transition-colors">
              <DollarSign className="w-6 h-6 text-secondary" />
              <span className="text-sm font-medium text-gray-900">Pay Forward</span>
            </button>
          </div>
        </div>

        {/* Current Goals */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Current Goals</h2>
            <button className="text-sm text-primary hover:text-primary-dark font-medium">
              Add Goal
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <GoalTracker goal="Save for housing deposit" current={300} target={500} />
            <GoalTracker goal="Complete 90 days employed" current={45} target={90} />
          </div>
        </div>

        {/* Recent Milestones */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Recent Milestones</h2>
            <Link to="/recipient/milestones" className="text-sm text-primary hover:text-primary-dark font-medium">
              View All
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recipientMilestones.slice(0, 4).map((milestone) => (
              <MilestoneCard key={milestone.id} milestone={milestone} />
            ))}
          </div>
        </div>

        {/* Community Encouragement */}
        <div className="mt-8 card bg-gradient-to-br from-primary/5 to-accent/5 border-2 border-primary/20">
          <div className="flex items-start gap-4">
            <div className="text-4xl">💪</div>
            <div>
              <h3 className="font-bold text-gray-900 mb-2">Community Support</h3>
              <p className="text-gray-700 mb-3">
                You received 12 celebration messages this week! Your progress is inspiring others.
              </p>
              <Link 
                to="/recipient/community"
                className="inline-flex items-center gap-2 text-primary hover:text-primary-dark font-medium"
              >
                See messages
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipientDashboard;

