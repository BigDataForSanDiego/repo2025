// Mock data for RippleImpact prototype

export const donorStats = {
  totalDonated: 850,
  peopleHelped: 7,
  rippleEffect: 3,
  activeStories: 5,
  monthOverMonth: 12.5
};

export const impactUpdates = [
  {
    id: 1,
    name: "Tom Martinez",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Tom",
    timestamp: "2 hours ago",
    update: "Started new job at Harbor Coffee Shop! First paycheck this Friday. Thank you for believing in me.",
    status: "Employed",
    contribution: "Your $75 paid for: Interview clothes and 2 weeks of bus passes",
    isRipple: false
  },
  {
    id: 2,
    name: "Maria Garcia",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maria",
    timestamp: "1 day ago",
    update: "Signed the lease today! Moving into my apartment next week. This is the first place I can call my own in 3 years.",
    status: "Housing Secured",
    contribution: "Your $150 helped with: First month's rent deposit",
    isRipple: false
  },
  {
    id: 3,
    name: "James Wilson",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=James",
    timestamp: "3 days ago",
    update: "Completed my forklift certification! Already got 2 job interviews lined up for next week.",
    status: "In Training",
    contribution: "Your $100 paid for: Certification course and safety equipment",
    isRipple: false
  },
  {
    id: 4,
    name: "Sarah Chen",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    timestamp: "5 days ago",
    update: "Hit my 90-day work anniversary today! Also helped someone else get interview clothes. Paying it forward feels amazing.",
    status: "Employed",
    contribution: "Your $50 helped with: Bus pass and work supplies",
    isRipple: true,
    rippleDetails: "Sarah donated $30 to help Marcus Johnson"
  }
];

export const peopleHelped = [
  {
    id: 1,
    name: "Tom Martinez",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Tom",
    status: "Employed",
    amount: 75,
    date: "2024-10-15",
    recentMilestone: "Started new job",
    progress: 85
  },
  {
    id: 2,
    name: "Maria Garcia",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maria",
    status: "Housing Secured",
    amount: 150,
    date: "2024-10-08",
    recentMilestone: "Signed lease agreement",
    progress: 92
  },
  {
    id: 3,
    name: "James Wilson",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=James",
    status: "In Training",
    amount: 100,
    date: "2024-10-01",
    recentMilestone: "Completed certification",
    progress: 65
  },
  {
    id: 4,
    name: "Sarah Chen",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    status: "Employed",
    amount: 50,
    date: "2024-09-20",
    recentMilestone: "90-day work anniversary",
    progress: 95
  },
  {
    id: 5,
    name: "David Thompson",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
    status: "Job Seeking",
    amount: 85,
    date: "2024-09-15",
    recentMilestone: "Completed resume workshop",
    progress: 45
  },
  {
    id: 6,
    name: "Lisa Anderson",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa",
    status: "Housing Secured",
    amount: 200,
    date: "2024-09-05",
    recentMilestone: "30 days housed",
    progress: 88
  },
  {
    id: 7,
    name: "Marcus Johnson",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus",
    status: "In Training",
    amount: 120,
    date: "2024-08-28",
    recentMilestone: "Started HVAC training",
    progress: 55
  }
];

export const impactTree = {
  donor: { name: "You", amount: 850 },
  connections: [
    {
      id: 1,
      recipient: { name: "Tom Martinez", amount: 75 },
      ripples: []
    },
    {
      id: 2,
      recipient: { name: "Maria Garcia", amount: 150 },
      ripples: []
    },
    {
      id: 3,
      recipient: { name: "Sarah Chen", amount: 50 },
      ripples: [
        {
          id: 31,
          recipient: { name: "Marcus Johnson", amount: 30 },
          ripples: []
        }
      ]
    },
    {
      id: 4,
      recipient: { name: "James Wilson", amount: 100 },
      ripples: []
    },
    {
      id: 5,
      recipient: { name: "David Thompson", amount: 85 },
      ripples: [
        {
          id: 51,
          recipient: { name: "Emily Rodriguez", amount: 25 },
          ripples: []
        },
        {
          id: 52,
          recipient: { name: "Kevin Park", amount: 40 },
          ripples: []
        }
      ]
    }
  ]
};

export const communityStats = {
  peopleHoused: 12,
  peopleEmployed: 18,
  amountPaidForward: 4500
};

// Recipient data
export const recipientProfile = {
  name: "Tom Martinez",
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Tom",
  daysOnPlatform: 45,
  milestonesAchieved: 5,
  supportReceived: 275,
  timesHelpedOthers: 1
};

export const recipientMilestones = [
  {
    id: 1,
    type: "employed",
    icon: "💼",
    title: "Started Employment",
    description: "Harbor Coffee Shop - Barista",
    date: "2024-11-10",
    celebrated: true,
    celebrationCount: 34
  },
  {
    id: 2,
    type: "training",
    icon: "🎓",
    title: "Completed Food Handler Certification",
    description: "San Diego County certification",
    date: "2024-10-28",
    celebrated: true,
    celebrationCount: 22
  },
  {
    id: 3,
    type: "documents",
    icon: "📄",
    title: "Secured Valid ID",
    description: "California ID card obtained",
    date: "2024-10-15",
    celebrated: true,
    celebrationCount: 18
  },
  {
    id: 4,
    type: "financial",
    icon: "💰",
    title: "Opened Bank Account",
    description: "First savings account in 5 years",
    date: "2024-10-08",
    celebrated: true,
    celebrationCount: 25
  }
];

export const communityFeed = [
  {
    id: 1,
    author: {
      name: "Sarah Chen",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah"
    },
    type: "milestone",
    content: "90 days at my job today! Never thought I'd make it this far. To anyone starting out - keep going, it gets better! 💪",
    timestamp: "2 hours ago",
    celebrations: 45,
    comments: 12,
    isMilestone: true,
    milestoneType: "90 Days Employed"
  },
  {
    id: 2,
    author: {
      name: "James Wilson",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=James"
    },
    type: "resource",
    content: "FYI - San Diego Workforce Partnership has free resume workshops every Tuesday. They helped me land 2 interviews!",
    timestamp: "5 hours ago",
    celebrations: 28,
    comments: 8,
    tags: ["Job Search", "Resources"]
  },
  {
    id: 3,
    author: {
      name: "Maria Garcia",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maria"
    },
    type: "milestone",
    content: "Got the keys to my apartment today! First time in 3 years I have my own place. Thank you to this amazing community for the support ❤️",
    timestamp: "1 day ago",
    celebrations: 89,
    comments: 23,
    isMilestone: true,
    milestoneType: "Housing Secured",
    image: true
  },
  {
    id: 4,
    author: {
      name: "David Thompson",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David"
    },
    type: "opportunity",
    content: "The construction company I work for is hiring! Looking for general laborers. DM me if interested - I can put in a good word.",
    timestamp: "1 day ago",
    celebrations: 34,
    comments: 15,
    tags: ["Job Opportunity", "Construction"]
  },
  {
    id: 5,
    author: {
      name: "Lisa Anderson",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa"
    },
    type: "encouragement",
    content: "Rough week but pushing through. Some days are harder than others but I'm not giving up. Thanks for being here, everyone.",
    timestamp: "2 days ago",
    celebrations: 52,
    comments: 19
  },
  {
    id: 6,
    author: {
      name: "Marcus Johnson",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus"
    },
    type: "milestone",
    content: "Started my HVAC training program today! 8 weeks and I'll be certified. Dreams do come true! 🔧",
    timestamp: "3 days ago",
    celebrations: 67,
    comments: 16,
    isMilestone: true,
    milestoneType: "Training Started"
  }
];

export const communityGoals = [
  {
    id: 1,
    title: "People Housed This Month",
    current: 7,
    target: 10,
    unit: "people"
  },
  {
    id: 2,
    title: "Jobs Secured This Quarter",
    current: 13,
    target: 20,
    unit: "jobs"
  },
  {
    id: 3,
    title: "Amount Paid Forward",
    current: 650,
    target: 1000,
    unit: "$"
  }
];

