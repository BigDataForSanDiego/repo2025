import { User, Bell, CreditCard, Shield, HelpCircle } from 'lucide-react';

const SettingSection = ({ icon: Icon, title, description, children }) => (
  <div className="card mb-4">
    <div className="flex items-start gap-4 mb-4">
      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <div>
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
    {children}
  </div>
);

const Settings = ({ userType = 'donor' }) => {
  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>

        <SettingSection
          icon={User}
          title="Profile Information"
          description="Manage your account details"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
              <input
                type="text"
                defaultValue="John Doe"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                defaultValue="john@example.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <button className="btn-primary">Save Changes</button>
          </div>
        </SettingSection>

        <SettingSection
          icon={Bell}
          title="Notifications"
          description="Customize how you receive updates"
        >
          <div className="space-y-3">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-gray-700">Milestone achievements</span>
              <input type="checkbox" defaultChecked className="w-5 h-5 text-primary rounded" />
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-gray-700">Weekly impact digest</span>
              <input type="checkbox" defaultChecked className="w-5 h-5 text-primary rounded" />
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-gray-700">Ripple effect notifications</span>
              <input type="checkbox" defaultChecked className="w-5 h-5 text-primary rounded" />
            </label>
            {userType === 'recipient' && (
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm text-gray-700">Community celebrations</span>
                <input type="checkbox" defaultChecked className="w-5 h-5 text-primary rounded" />
              </label>
            )}
          </div>
        </SettingSection>

        {userType === 'donor' && (
          <SettingSection
            icon={CreditCard}
            title="Payment Methods"
            description="Manage your donation payment methods"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-6 bg-gray-300 rounded flex items-center justify-center text-xs font-bold">
                    VISA
                  </div>
                  <span className="text-sm text-gray-700">•••• 4242</span>
                </div>
                <button className="text-sm text-primary hover:text-primary-dark font-medium">
                  Remove
                </button>
              </div>
              <button className="text-sm text-primary hover:text-primary-dark font-medium">
                + Add Payment Method
              </button>
            </div>
          </SettingSection>
        )}

        <SettingSection
          icon={Shield}
          title="Privacy"
          description="Control your privacy settings"
        >
          <div className="space-y-3">
            {userType === 'donor' && (
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm text-gray-700">Stay anonymous to recipients</span>
                <input type="checkbox" className="w-5 h-5 text-primary rounded" />
              </label>
            )}
            {userType === 'recipient' && (
              <>
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm text-gray-700">Public profile</span>
                  <input type="checkbox" defaultChecked className="w-5 h-5 text-primary rounded" />
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm text-gray-700">Share journey with donors</span>
                  <input type="checkbox" defaultChecked className="w-5 h-5 text-primary rounded" />
                </label>
              </>
            )}
          </div>
        </SettingSection>

        <SettingSection
          icon={HelpCircle}
          title="Support"
          description="Get help and learn more"
        >
          <div className="space-y-2">
            <a href="#" className="block text-sm text-primary hover:text-primary-dark">
              Help Center
            </a>
            <a href="#" className="block text-sm text-primary hover:text-primary-dark">
              Contact Support
            </a>
            <a href="#" className="block text-sm text-primary hover:text-primary-dark">
              Terms of Service
            </a>
            <a href="#" className="block text-sm text-primary hover:text-primary-dark">
              Privacy Policy
            </a>
          </div>
        </SettingSection>
      </div>
    </div>
  );
};

export default Settings;

