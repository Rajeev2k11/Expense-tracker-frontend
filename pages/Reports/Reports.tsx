import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import { Download, Filter, Calendar, TrendingUp, PieChart, BarChart3, Users, DollarSign, Search, Share2, Eye } from 'lucide-react';

interface Report {
  id: string;
  name: string;
  date: string;
  type: string;
  size: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any;
}

const Reports: React.FC = () => {
  const [dateRange, setDateRange] = useState('last-30-days');
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showAllReports, setShowAllReports] = useState(false);
  const [previewedReport, setPreviewedReport] = useState<Report | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [filterType, setFilterType] = useState('All');
  const [customDateRange, setCustomDateRange] = useState({
    start: '',
    end: ''
  });

  // Load reports from localStorage
  useEffect(() => {
    const storedReports = localStorage.getItem('generatedReports');
    if (storedReports) {
      try {
        const parsed = JSON.parse(storedReports) as Report[];
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setReports(parsed);
      } catch (error) {
        console.error('Failed to load reports:', error);
      }
    }
  }, []);

  const reportTypes = [
    {
      id: 'monthly',
      title: 'Monthly Expense Report',
      description: 'Detailed breakdown of monthly expenses by category',
      icon: BarChart3,
      color: 'blue'
    },
    {
      id: 'trends',
      title: 'Expense Trends',
      description: 'Analyze spending patterns over time',
      icon: TrendingUp,
      color: 'green'
    },
    {
      id: 'categories',
      title: 'Category Analysis',
      description: 'Expense distribution across categories',
      icon: PieChart,
      color: 'purple'
    },
    {
      id: 'team',
      title: 'Team Spending',
      description: 'Department-wise expense breakdown',
      icon: Users,
      color: 'orange'
    }
  ];

  const quickStats = [
    { label: 'Total Spent', value: '$12,458', change: '+12%', trend: 'up' },
    { label: 'Avg. per Employee', value: '$1,245', change: '+5%', trend: 'up' },
    { label: 'Top Category', value: 'Marketing', change: '18%', trend: 'neutral' },
    { label: 'Pending Approvals', value: '8', change: '-2', trend: 'down' }
  ];

  // Sample recent reports
  const sampleReports: Report[] = [
    { id: '1', name: 'Q4 2024 Financial Report', date: 'Dec 15, 2024', type: 'Quarterly', size: '2.4 MB' },
    { id: '2', name: 'November Expense Analysis', date: 'Dec 1, 2024', type: 'Monthly', size: '1.8 MB' },
    { id: '3', name: 'Team Performance Q3', date: 'Oct 10, 2024', type: 'Quarterly', size: '3.1 MB' },
    { id: '4', name: 'Annual Expense Summary 2024', date: 'Jan 5, 2024', type: 'Annual', size: '4.2 MB' },
    { id: '5', name: 'Marketing Budget Analysis', date: 'Nov 20, 2024', type: 'Department', size: '1.5 MB' }
  ];

  const allReports = [...reports, ...sampleReports];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
      purple: 'bg-purple-100 text-purple-600',
      orange: 'bg-orange-100 text-orange-600'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  // Filter reports based on search and filters
  const filteredReports = allReports.filter(report => {
    const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'All' || report.type === filterType;
    return matchesSearch && matchesType;
  });

  const displayedReports = showAllReports ? filteredReports : filteredReports.slice(0, 3);

  const generateReport = (reportId: string) => {
    setSelectedReport(reportId);
    
    // Simulate report generation
    setTimeout(() => {
      const reportType = reportTypes.find(r => r.id === reportId);
      if (reportType) {
        const newReport: Report = {
          id: Date.now().toString(),
          name: `${reportType.title} - ${new Date().toLocaleDateString()}`,
          date: new Date().toLocaleDateString(),
          type: reportType.title.split(' ')[0],
          size: `${(Math.random() * 2 + 1).toFixed(1)} MB`,
          data: {
            categories: ['Marketing', 'Travel', 'Software', 'Office', 'Meals'],
            amounts: [4250, 3120, 1980, 1560, 980],
            total: 12500
          }
        };

        const updatedReports = [newReport, ...reports];
        setReports(updatedReports);
        localStorage.setItem('generatedReports', JSON.stringify(updatedReports));
        
        // Auto download the report
        downloadReport(newReport, 'pdf');
      }
      
      setSelectedReport(null);
    }, 2000);
  };

  const downloadReport = (report: Report, format: 'pdf' | 'csv') => {
    const content = format === 'pdf' 
      ? generatePDFContent(report)
      : generateCSVContent(report);
    
    const blob = new Blob([content], { 
      type: format === 'pdf' ? 'application/pdf' : 'text/csv' 
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${report.name.replace(/\s+/g, '_')}_${new Date().getTime()}.${format}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const generatePDFContent = (report: Report) => {
    return `
      EXPENSE REPORT
      ==============
      
      Report: ${report.name}
      Generated: ${report.date}
      Type: ${report.type}
      
      SUMMARY:
      Total Expenses: $12,458
      Average per Employee: $1,245
      Top Category: Marketing (18%)
      
      CATEGORY BREAKDOWN:
      ${report.data?.categories?.map((category: string, index: number) => 
        `${category}: $${report.data?.amounts?.[index]?.toLocaleString()}`
      ).join('\n')}
      
      This is a simulated PDF export.
      In a real application, use libraries like jsPDF or pdfkit.
    `;
  };

  const generateCSVContent = (report: Report) => {
    const headers = ['Category', 'Amount', 'Percentage'];
    const data: string[][] = report.data?.categories?.map((category: string, index: number) => [
      category,
      `$${report.data?.amounts?.[index]?.toLocaleString()}`,
      `${Math.round((report.data?.amounts?.[index] / report.data?.total) * 100)}%`
    ]) || [];

    return [
      headers.join(','),
      ...data.map((row: string[]) => row.join(','))
    ].join('\n');
  };

  const exportAllReports = () => {
    const allData = filteredReports.map(report => ({
      'Report Name': report.name,
      'Date': report.date,
      'Type': report.type,
      'Size': report.size
    }));

    const headers = ['Report Name', 'Date', 'Type', 'Size'];
    const csvContent = [
      headers.join(','),
      ...allData.map(row => 
        headers.map(header => `"${row[header as keyof typeof row]}"`).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `all_reports_export_${new Date().getTime()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const previewReport = (report: Report) => {
    setPreviewedReport(report);
    setShowPreviewModal(true);
  };

  const shareReport = (report: Report) => {
    alert(`Sharing feature for "${report.name}" will be available soon! This would integrate with email and messaging services.`);
  };

  const applyFilters = () => {
    setShowFilters(false);
    // Filter logic is handled in the filteredReports computation
  };

  const clearFilters = () => {
    setFilterType('All');
    setCustomDateRange({ start: '', end: '' });
    setDateRange('last-30-days');
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
            <p className="text-gray-600 mt-1">Generate and analyze expense reports</p>
          </div>
          <div className="flex items-center gap-3 mt-4 lg:mt-0">
            <select 
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-sm"
            >
              <option value="last-7-days">Last 7 days</option>
              <option value="last-30-days">Last 30 days</option>
              <option value="last-90-days">Last 90 days</option>
              <option value="ytd">Year to Date</option>
              <option value="custom">Custom Range</option>
            </select>
            <Button 
              variant="secondary" 
              size="sm"
              onClick={() => setShowFilters(true)}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
            <div className="relative group">
              <Button variant="secondary" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export All
              </Button>
              <div className="absolute top-full left-0 mt-1 w-32 bg-white rounded-lg shadow-lg border border-gray-200 py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                <button 
                  onClick={exportAllReports}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Export as CSV
                </button>
                <button 
                  onClick={() => alert('PDF export for all reports would be implemented here')}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Export as PDF
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <Card className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-3 flex-1">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search reports..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 w-full text-sm"
                />
              </div>
            </div>
            <div className="text-sm text-gray-600">
              {filteredReports.length} reports found
            </div>
          </div>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickStats.map((stat, index) => (
            <Card key={index} padding="lg" hover={true}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  <p className={`text-xs mt-1 ${
                    stat.trend === 'up' ? 'text-green-600' : 
                    stat.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {stat.change} from last period
                  </p>
                </div>
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-gray-600" />
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Report Types */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Generate Reports</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reportTypes.map((report) => {
              const IconComponent = report.icon;
              return (
                <Card key={report.id} padding="lg" hover={true}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getColorClasses(report.color)}`}>
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{report.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{report.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-4">
                        <Button
                          size="sm"
                          loading={selectedReport === report.id}
                          onClick={() => generateReport(report.id)}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Generate Report
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            const sampleReport: Report = {
                              id: 'preview',
                              name: report.title,
                              date: new Date().toLocaleDateString(),
                              type: 'Preview',
                              size: '1.2 MB',
                              data: {
                                categories: ['Marketing', 'Travel', 'Software', 'Office', 'Meals'],
                                amounts: [4250, 3120, 1980, 1560, 980],
                                total: 12500
                              }
                            };
                            previewReport(sampleReport);
                          }}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Preview
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Recent Reports */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              {showAllReports ? 'All Reports' : 'Recently Generated Reports'}
            </h2>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowAllReports(!showAllReports)}
            >
              {showAllReports ? 'Show Less' : 'View All'}
            </Button>
          </div>
          
          <div className="space-y-4">
            {displayedReports.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No reports found matching your criteria.</p>
              </div>
            ) : (
              displayedReports.map((report) => (
                <div key={report.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <BarChart3 className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{report.name}</h4>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-sm text-gray-500 flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {report.date}
                        </span>
                        <Badge status="default" size="sm">{report.type}</Badge>
                        <span className="text-sm text-gray-500">{report.size}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative group">
                      <Button variant="ghost" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                      <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded-lg shadow-lg border border-gray-200 py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                        <button 
                          onClick={() => downloadReport(report, 'csv')}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          Download CSV
                        </button>
                        <button 
                          onClick={() => downloadReport(report, 'pdf')}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          Download PDF
                        </button>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => previewReport(report)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => shareReport(report)}
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Quick Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <Card padding="lg">
            <h3 className="font-semibold text-gray-900 mb-4">Top Spending Categories</h3>
            <div className="space-y-3">
              {[
                { category: 'Marketing', amount: 4250, percentage: 34 },
                { category: 'Travel', amount: 3120, percentage: 25 },
                { category: 'Software', amount: 1980, percentage: 16 },
                { category: 'Office', amount: 1560, percentage: 12 },
                { category: 'Meals', amount: 980, percentage: 8 }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{item.category}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-16 text-right">
                      ${item.amount.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card padding="lg">
            <h3 className="font-semibold text-gray-900 mb-4">Report Generation History</h3>
            <div className="space-y-4">
              {[
                { type: 'Monthly Report', status: 'Completed', date: '2 hours ago' },
                { type: 'Team Analysis', status: 'Completed', date: '1 day ago' },
                { type: 'Category Breakdown', status: 'In Progress', date: 'Processing' },
                { type: 'Export Data', status: 'Failed', date: '2 days ago' }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{item.type}</p>
                    <p className="text-sm text-gray-500">{item.date}</p>
                  </div>
                  <Badge 
                    status={
                      item.status === 'Completed' ? 'Approved' :
                      item.status === 'In Progress' ? 'Pending' : 'Rejected'
                    }
                    size="sm"
                  >
                    {item.status}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Filters Modal */}
        <Modal
          open={showFilters}
          onClose={() => setShowFilters(false)}
          title="Filter Reports"
          size="md"
        >
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400"
              >
                <option value="All">All Types</option>
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
                <option value="Annual">Annual</option>
                <option value="Department">Department</option>
              </select>
            </div>

            {dateRange === 'custom' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={customDateRange.start}
                    onChange={(e) => setCustomDateRange(prev => ({ ...prev, start: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                  <input
                    type="date"
                    value={customDateRange.end}
                    onChange={(e) => setCustomDateRange(prev => ({ ...prev, end: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-between gap-3 pt-4">
              <Button variant="secondary" onClick={clearFilters}>
                Clear Filters
              </Button>
              <div className="flex gap-3">
                <Button variant="secondary" onClick={() => setShowFilters(false)}>
                  Cancel
                </Button>
                <Button onClick={applyFilters}>
                  Apply Filters
                </Button>
              </div>
            </div>
          </div>
        </Modal>

        {/* Preview Modal */}
        <Modal
          open={showPreviewModal}
          onClose={() => setShowPreviewModal(false)}
          title={previewedReport?.name || 'Report Preview'}
          size="lg"
        >
          {previewedReport && (
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3">Report Summary</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Generated:</span>
                    <p className="font-medium">{previewedReport.date}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Type:</span>
                    <p className="font-medium">{previewedReport.type}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Total Expenses:</span>
                    <p className="font-medium">$12,458</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Records:</span>
                    <p className="font-medium">24 entries</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Category Breakdown</h4>
                <div className="space-y-3">
                  {previewedReport.data?.categories?.map((category: string, index: number) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{category}</span>
                      <div className="flex items-center gap-3">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ 
                              width: `${(previewedReport.data.amounts[index] / previewedReport.data.total) * 100}%` 
                            }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900 w-16 text-right">
                          ${previewedReport.data.amounts[index]?.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <Button variant="secondary" onClick={() => setShowPreviewModal(false)}>
                  Close
                </Button>
                <Button onClick={() => downloadReport(previewedReport, 'pdf')}>
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </Layout>
  );
};

export default Reports;