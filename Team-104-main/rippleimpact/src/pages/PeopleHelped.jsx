import { ArrowRight, TrendingUp } from 'lucide-react';
import { peopleHelped } from '../data/mockData';
import { Link } from 'react-router-dom';

const PersonCard = ({ person }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'Employed':
        return 'bg-success/10 text-success border-success/20';
      case 'Housing Secured':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'In Training':
        return 'bg-accent/10 text-accent border-accent/20';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  return (
    <div className="card hover:scale-[1.02] transition-transform cursor-pointer">
      <div className="flex items-start gap-4">
        <img 
          src={person.avatar} 
          alt={person.name}
          className="w-16 h-16 rounded-full flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg text-gray-900 mb-1">{person.name}</h3>
          <span className={`badge border ${getStatusColor(person.status)} mb-2`}>
            {person.status}
          </span>
          
          <div className="space-y-2 mt-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Progress</span>
              <span className="font-semibold text-gray-900">{person.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-500"
                style={{ width: `${person.progress}%` }}
              />
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between items-center">
            <div>
              <p className="text-xs text-gray-500">Your contribution</p>
              <p className="font-bold text-primary">${person.amount}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Recent milestone</p>
              <p className="text-sm font-medium text-gray-900">{person.recentMilestone}</p>
            </div>
          </div>

          <Link 
            to={`/donor/people/${person.id}`}
            className="mt-4 flex items-center justify-center gap-2 w-full py-2 px-4 bg-primary/10 hover:bg-primary/20 text-primary font-medium rounded-lg transition-colors"
          >
            View Journey
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

const PeopleHelped = () => {
  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">People I've Helped</h1>
          <p className="text-gray-600">Track the journey of everyone your donations have supported</p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="card">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Average Progress</p>
                <p className="text-2xl font-bold text-gray-900">76%</p>
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600">Major Milestones</p>
                <p className="text-2xl font-bold text-gray-900">15</p>
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600">Paid Forward</p>
                <p className="text-2xl font-bold text-gray-900">3</p>
              </div>
            </div>
          </div>
        </div>

        {/* People Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {peopleHelped.map((person) => (
            <PersonCard key={person.id} person={person} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PeopleHelped;

