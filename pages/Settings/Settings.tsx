import React, { useState } from 'react';
import Layout from '../../components/layout/Layout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { 
  Settings as SettingsIcon, 
  Bell, 
  Shield, 
  CreditCard, 
  Users, 
  Download, 
  Upload,
  Save,
  Palette,
  Globe,
  Database
} from 'lucide-react';

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');

  const generalSettings = {
    language: 'English',
    timezone: 'UTC-5 (Eastern Time)',
    dateFormat: 'MM/DD/YYYY',
    currency: 'USD - US Dollar',
    theme: 'Light'
  };

  const notificationSettings = {
    emailNotifications: true,
    pushNotifications: false,
    expenseApprovals: true,
    weeklyReports: true,
    budgetAlerts: true,
    teamUpdates: false,
    systemMaintenance: true
  };

  const securitySettings = {
    twoFactorAuth: true,
    loginAlerts: true,
    sessionTimeout: 30,
    passwordLastChanged: '2024-11-15',
    autoLogout: true
  };

  const tabs = [
    { id: 'general', label: 'General', icon: SettingsIcon },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'billing', label: 'Billing & Plans', icon: CreditCard },
    { id: 'team', label: 'Team Settings', icon: Users }
  ];

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
          <p className="text-gray-600 mt-1">Manage your application preferences and system configuration</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <Card className="lg:w-64 h-fit">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-gray-100 text-gray-900 border-l-2 border-l-gray-900'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </Card>

          {/* Main Content */}
          <div className="flex-1">
            {/* General Settings Tab */}
            {activeTab === 'general' && (
              <Card padding="lg">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <SettingsIcon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">General Settings</h2>
                    <p className="text-gray-600">Configure your application preferences</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400">
                        <option>English</option>
                        <option>Spanish</option>
                        <option>French</option>
                        <option>German</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400">
                        <option>UTC-5 (Eastern Time)</option>
                        <option>UTC-8 (Pacific Time)</option>
                        <option>UTC+0 (GMT)</option>
                        <option>UTC+5:30 (IST)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Date Format</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400">
                        <option>MM/DD/YYYY</option>
                        <option>DD/MM/YYYY</option>
                        <option>YYYY-MM-DD</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400">
                        <option>USD - US Dollar</option>
                        <option>EUR - Euro</option>
                        <option>GBP - British Pound</option>
                        <option>INR - Indian Rupee</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end pt-6 border-t border-gray-200">
                    <Button>
                      <Save className="w-4 h-4 mr-2" />
                      Save Preferences
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <Card padding="lg">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Bell className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Notification Preferences</h2>
                    <p className="text-gray-600">Choose how you want to be notified</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {Object.entries(notificationSettings).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {key.split(/(?=[A-Z])/).join(' ')}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Receive notifications for {key.toLowerCase().replace(/([A-Z])/g, ' $1')}
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked={value} />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end mt-6 pt-6 border-t border-gray-200">
                  <Button>
                    <Save className="w-4 h-4 mr-2" />
                    Save Preferences
                  </Button>
                </div>
              </Card>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <Card padding="lg">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Shield className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Security Settings</h2>
                    <p className="text-gray-600">Manage your account security and privacy</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">Two-Factor Authentication</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge status={securitySettings.twoFactorAuth ? 'Approved' : 'Pending'}>
                        {securitySettings.twoFactorAuth ? 'Enabled' : 'Disabled'}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        {securitySettings.twoFactorAuth ? 'Disable' : 'Enable'}
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">Login Alerts</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Get notified of new sign-ins from unknown devices
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked={securitySettings.loginAlerts} />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">Session Timeout</h4>
                    <div className="flex items-center gap-3">
                      <select className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400">
                        <option>15 minutes</option>
                        <option selected>30 minutes</option>
                        <option>1 hour</option>
                        <option>4 hours</option>
                      </select>
                      <span className="text-sm text-gray-600">Automatically log out after inactivity</span>
                    </div>
                  </div>

                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">Auto Logout</h4>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600">Automatically log out when browser closes</p>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked={securitySettings.autoLogout} />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Appearance Tab */}
            {activeTab === 'appearance' && (
              <Card padding="lg">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Palette className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Appearance</h2>
                    <p className="text-gray-600">Customize the look and feel of the application</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">Theme</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <button className="p-4 border-2 border-gray-300 rounded-lg text-center hover:border-gray-400 transition-colors">
                        <div className="w-full h-20 bg-white border border-gray-200 rounded mb-2"></div>
                        <span className="text-sm font-medium">Light</span>
                      </button>
                      <button className="p-4 border-2 border-blue-500 rounded-lg text-center">
                        <div className="w-full h-20 bg-gray-900 border border-gray-700 rounded mb-2"></div>
                        <span className="text-sm font-medium">Dark</span>
                      </button>
                      <button className="p-4 border-2 border-gray-300 rounded-lg text-center hover:border-gray-400 transition-colors">
                        <div className="w-full h-20 bg-white border border-gray-200 rounded mb-2 flex">
                          <div className="w-1/4 bg-gray-900 rounded-l"></div>
                          <div className="flex-1"></div>
                        </div>
                        <span className="text-sm font-medium">Auto</span>
                      </button>
                    </div>
                  </div>

                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">Density</h4>
                    <div className="flex gap-4">
                      <button className="px-4 py-2 border border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
                        Compact
                      </button>
                      <button className="px-4 py-2 border-2 border-blue-500 rounded-lg bg-blue-50">
                        Comfortable
                      </button>
                      <button className="px-4 py-2 border border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
                        Spacious
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end mt-6 pt-6 border-t border-gray-200">
                  <Button>
                    <Save className="w-4 h-4 mr-2" />
                    Save Appearance
                  </Button>
                </div>
              </Card>
            )}

            {/* Billing Tab */}
            {activeTab === 'billing' && (
              <Card padding="lg">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Billing & Plans</h2>
                    <p className="text-gray-600">Manage your subscription and billing information</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card padding="lg" hover={true}>
                    <div className="text-center">
                      <Badge status="Approved" className="mb-3">Current Plan</Badge>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Business Pro</h3>
                      <p className="text-3xl font-bold text-gray-900 mb-4">$49<span className="text-lg text-gray-600">/month</span></p>
                      <p className="text-gray-600 mb-4">Perfect for growing teams and businesses</p>
                      <Button variant="secondary" className="w-full">
                        Upgrade Plan
                      </Button>
                    </div>
                  </Card>

                  <Card padding="lg">
                    <h4 className="font-semibold text-gray-900 mb-4">Billing History</h4>
                    <div className="space-y-3">
                      {[1, 2, 3].map((item) => (
                        <div key={item} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">Invoice #{1000 + item}</p>
                            <p className="text-sm text-gray-500">Dec {item}, 2024</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">$49.00</p>
                            <Badge status="Approved" size="sm">Paid</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-3 mt-4">
                      <Button variant="ghost" size="sm" className="flex-1">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                      </Button>
                      <Button variant="ghost" size="sm" className="flex-1">
                        View All
                      </Button>
                    </div>
                  </Card>
                </div>
              </Card>
            )}

            {/* Team Settings Tab */}
            {activeTab === 'team' && (
              <Card padding="lg">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Team Settings</h2>
                    <p className="text-gray-600">Manage your team members and permissions</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">Team Members</h4>
                    <p className="text-sm text-gray-600 mb-4">Manage who has access to your team workspace</p>
                    <Button>
                      <Users className="w-4 h-4 mr-2" />
                      Manage Team
                    </Button>
                  </div>

                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">Export Team Data</h4>
                    <p className="text-sm text-gray-600 mb-4">Download your team's expense data and reports</p>
                    <div className="flex gap-3">
                      <Button variant="secondary">
                        <Download className="w-4 h-4 mr-2" />
                        Export Data
                      </Button>
                      <Button variant="ghost">
                        <Upload className="w-4 h-4 mr-2" />
                        Import Data
                      </Button>
                    </div>
                  </div>

                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">Data Management</h4>
                    <p className="text-sm text-gray-600 mb-4">Manage your team's data and storage</p>
                    <div className="flex gap-3">
                      <Button variant="secondary">
                        <Database className="w-4 h-4 mr-2" />
                        Backup Data
                      </Button>
                      <Button variant="ghost">
                        <Download className="w-4 h-4 mr-2" />
                        Download Reports
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;