import { Heart, MessageSquare, Share2, Bookmark, Sparkles, TrendingUp } from 'lucide-react';
import { communityFeed, communityGoals } from '../data/mockData';
import { useState } from 'react';

const PostCard = ({ post }) => {
  const [celebrated, setCelebrated] = useState(false);
  
  return (
    <div className="card">
      {post.isMilestone && (
        <div className="mb-4 bg-gradient-to-r from-celebration/20 to-success/20 -mx-6 -mt-6 px-6 py-3 rounded-t-xl border-b-2 border-celebration">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-success" />
            <span className="font-bold text-success uppercase text-sm">
              Milestone: {post.milestoneType}
            </span>
          </div>
        </div>
      )}
      
      <div className="flex gap-4">
        <img 
          src={post.author.avatar} 
          alt={post.author.name}
          className="w-12 h-12 rounded-full flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <h3 className="font-semibold text-gray-900">{post.author.name}</h3>
              <p className="text-sm text-gray-500">{post.timestamp}</p>
            </div>
          </div>
          
          <p className="text-gray-700 mb-3">{post.content}</p>
          
          {post.tags && (
            <div className="flex flex-wrap gap-2 mb-3">
              {post.tags.map((tag) => (
                <span 
                  key={tag}
                  className="badge bg-primary/10 text-primary text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {post.image && (
            <div className="mb-3 rounded-lg overflow-hidden bg-gray-200 h-48 flex items-center justify-center">
              <span className="text-gray-500">📸 Image attached</span>
            </div>
          )}
          
          <div className="flex items-center gap-4 pt-3 border-t border-gray-200">
            <button 
              onClick={() => setCelebrated(!celebrated)}
              className={`flex items-center gap-2 ${celebrated ? 'text-secondary' : 'text-gray-600 hover:text-secondary'} transition-colors`}
            >
              <Heart className={`w-5 h-5 ${celebrated ? 'fill-current' : ''}`} />
              <span className="text-sm font-medium">{post.celebrations + (celebrated ? 1 : 0)}</span>
            </button>
            <button className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors">
              <MessageSquare className="w-5 h-5" />
              <span className="text-sm font-medium">{post.comments}</span>
            </button>
            <button className="flex items-center gap-2 text-gray-600 hover:text-accent transition-colors">
              <Share2 className="w-5 h-5" />
            </button>
            <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors ml-auto">
              <Bookmark className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const CommunityGoalCard = ({ goal }) => {
  const percentage = (goal.current / goal.target) * 100;
  
  return (
    <div className="card">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-900">{goal.title}</h3>
          <p className="text-sm text-gray-600">
            {goal.current} of {goal.target} {goal.unit}
          </p>
        </div>
        <div className="text-2xl">{percentage >= 100 ? '🎉' : '🎯'}</div>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
        <div 
          className="bg-success h-3 rounded-full transition-all duration-500"
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      <p className="text-right text-sm font-semibold text-success">{Math.round(percentage)}%</p>
    </div>
  );
};

const CommunityHub = () => {
  const [filter, setFilter] = useState('all');

  const filters = [
    { id: 'all', label: 'All Posts' },
    { id: 'milestones', label: 'Milestones' },
    { id: 'resources', label: 'Resources' },
    { id: 'opportunities', label: 'Jobs' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Community Hub</h1>
          <p className="text-gray-600">Connect, share, and celebrate together</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Feed */}
          <div className="lg:col-span-2 space-y-6">
            {/* Post Composer */}
            <div className="card">
              <div className="flex gap-3">
                <img 
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=Tom"
                  alt="You"
                  className="w-10 h-10 rounded-full"
                />
                <button className="flex-1 text-left px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 transition-colors">
                  Share an update with the community...
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {filters.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
                    filter === f.id
                      ? 'bg-primary text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Feed */}
            <div className="space-y-4">
              {communityFeed.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Community Stats */}
            <div className="card">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-success" />
                Our Collective Impact
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600">Active Members</span>
                    <span className="font-bold text-gray-900">247</span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600">This Week</span>
                  </div>
                  <div className="text-xs text-gray-600 space-y-1">
                    <div>• 3 people housed</div>
                    <div>• 5 jobs secured</div>
                    <div>• $450 paid forward</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Community Goals */}
            <div>
              <h3 className="font-bold text-gray-900 mb-4">Community Goals</h3>
              <div className="space-y-3">
                {communityGoals.map((goal) => (
                  <CommunityGoalCard key={goal.id} goal={goal} />
                ))}
              </div>
            </div>

            {/* Featured Members */}
            <div className="card">
              <h3 className="font-bold text-gray-900 mb-4">Recently Celebrated</h3>
              <div className="space-y-3">
                {[
                  { name: 'Sarah Chen', achievement: 'Started new job', avatar: 'Sarah' },
                  { name: 'Maria Garcia', achievement: 'Secured housing', avatar: 'Maria' },
                  { name: 'James Wilson', achievement: 'Completed training', avatar: 'James' },
                ].map((member) => (
                  <div key={member.name} className="flex items-center gap-3">
                    <img 
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.avatar}`}
                      alt={member.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-900">{member.name}</p>
                      <p className="text-xs text-gray-600">{member.achievement}</p>
                    </div>
                    <button className="text-primary hover:text-primary-dark text-sm font-medium">
                      View
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityHub;

