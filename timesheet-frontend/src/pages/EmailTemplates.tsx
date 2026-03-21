import React, { useState, useEffect } from 'react';
import API from '../api';
import { useAuth } from '../contexts/AuthContext';
import {
  DocumentTextIcon,
  PencilSquareIcon,
  EyeIcon,
  ArrowPathIcon,
  PlusIcon,
  TrashIcon,
  EnvelopeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

// UI Components
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import StatusBadge from '../components/ui/StatusBadge';
import Modal from '../components/ui/Modal';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  category: string;
  variables: string[];
  status: string; // 'active' or 'inactive'
  createdAt: string;
  updatedAt: string;
}

const EmailTemplates: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showEditorModal, setShowEditorModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [previewData, setPreviewData] = useState<{ subject: string; body: string } | null>(null);
  const [saving, setSaving] = useState(false);

  // Editor state
  const [editorData, setEditorData] = useState({
    subject: '',
    body: '',
    status: 'active' as 'active' | 'inactive'
  });

  // Check if user is admin, if not redirect to dashboard
  useEffect(() => {
    if (user && user.role !== 'admin' && user.role !== 'Admin') {
      window.location.href = '/dashboard';
    }
  }, [user]);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching email templates...');
      const response = await API.get('/email/templates');
      console.log('📊 Email templates response:', response.data);
      
      // Handle the new API response format
      if (response.data?.success && response.data?.templates) {
        const templatesData = Array.isArray(response.data.templates) ? response.data.templates : [];
        console.log('✅ Templates received from backend:', templatesData);
        
        if (templatesData.length === 0) {
          console.log('🔄 No templates returned from backend, using default templates');
          setTemplates(getDefaultTemplates());
        } else {
          setTemplates(templatesData);
        }
      } else {
        // Handle case where templates might be in res.data directly or nested differently
        const potentialArray = Array.isArray(response.data) ? response.data : 
                             (response.data?.data?.templates ? response.data.data.templates : []);
        console.log('🔄 Extracted fallback templates:', potentialArray);
        
        if (potentialArray.length === 0) {
          setTemplates(getDefaultTemplates());
        } else {
          setTemplates(potentialArray);
        }
      }
    } catch (err) {
      console.error('❌ Failed to fetch email templates:', err);
      console.log('🔄 Using default templates as fallback');
      setTemplates(getDefaultTemplates());
    } finally {
      setLoading(false);
    }
  };

  const getDefaultTemplates = (): EmailTemplate[] => [
    {
      id: '1',
      name: 'Employee Registration',
      subject: 'Welcome to {{CompanyName}} - Complete Your Registration',
      body: `Hi {{EmployeeName}},

Welcome to {{CompanyName}}! We're excited to have you join our team.

Please click the link below to complete your registration and set up your account:
{{RegistrationLink}}

This link will expire in 24 hours.

Best regards,
{{CompanyName}} Team`,
      category: 'Registration',
      variables: ['EmployeeName', 'CompanyName', 'RegistrationLink'],
      status: "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Leave Approval',
      subject: 'Your Leave Request Has Been Approved',
      body: `Hi {{EmployeeName}},

Your leave request from {{StartDate}} to {{EndDate}} has been approved.

Leave Details:
Type: {{LeaveType}}
Duration: {{NumberOfDays}} days
Approver: {{ApproverName}}

Please ensure all your work is handed over before your leave.

Best regards,
HR Team`,
      category: 'Leave',
      variables: ['EmployeeName', 'StartDate', 'EndDate', 'LeaveType', 'NumberOfDays', 'ApproverName'],
      status: "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '3',
      name: 'Leave Rejection',
      subject: 'Your Leave Request Has Been Rejected',
      body: `Hi {{EmployeeName}},

Your leave request from {{StartDate}} to {{EndDate}} has been rejected.

Reason: {{RejectionReason}}

If you have any questions or would like to discuss this further, please contact HR.

Best regards,
HR Team`,
      category: 'Leave',
      variables: ['EmployeeName', 'StartDate', 'EndDate', 'RejectionReason'],
      status: "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '4',
      name: 'Timesheet Reminder',
      subject: 'Reminder: Submit Your Timesheet for {{WeekPeriod}}',
      body: `Hi {{EmployeeName}},

This is a friendly reminder to submit your timesheet for the period {{WeekPeriod}}.

Please log in to your dashboard and submit your timesheet by the deadline: {{Deadline}}.

Log in here: {{DashboardLink}}

If you have already submitted your timesheet, please disregard this email.

Best regards,
Management Team`,
      category: 'Timesheet',
      variables: ['EmployeeName', 'WeekPeriod', 'Deadline', 'DashboardLink'],
      status: "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '5',
      name: 'Reimbursement Status',
      subject: 'Your Reimbursement Request Has Been {{Status}}',
      body: `Hi {{EmployeeName}},

Your reimbursement request for {{Amount}} ({{Description}}) has been {{Status}}.

Request Details:
Amount: {{Amount}}
Description: {{Description}}
Submission Date: {{SubmissionDate}}

Best regards,
Finance Team`,
      category: 'Reimbursement',
      variables: ['EmployeeName', 'Amount', 'Description', 'Status', 'SubmissionDate', 'ApprovedAmount', 'StatusMessage'],
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '6',
      name: 'Password Reset',
      subject: 'Reset Your Password - {{CompanyName}}',
      body: `Hi {{EmployeeName}},

We received a request to reset your password for your {{CompanyName}} account.

Click the link below to reset your password:
{{ResetLink}}

This link will expire soon for security reasons.

If you didn't request this password reset, please ignore this email.

Best regards,
{{CompanyName}} IT Team`,
      category: 'Security',
      variables: ['EmployeeName', 'CompanyName', 'ResetLink'],
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  const categories = ['All', 'Registration', 'Leave', 'Timesheet', 'Reimbursement', 'Security'];

  const filteredTemplates = (templates || []).filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleEditTemplate = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setEditorData({
      subject: template.subject,
      body: template.body,
      status: template.status as 'active' | 'inactive'
    });
    setShowEditorModal(true);
  };

  const handlePreviewTemplate = (template: EmailTemplate) => {
    // Replace placeholders with sample data for preview
    let previewSubject = template.subject;
    let previewBody = template.body;

    const sampleData = {
      EmployeeName: 'John Doe',
      CompanyName: 'Tech Corp',
      RegistrationLink: '#',
      StartDate: '2024-01-15',
      EndDate: '2024-01-17',
      LeaveType: 'Annual Leave',
      NumberOfDays: '3',
      ApproverName: 'Jane Smith',
      RejectionReason: 'Insufficient leave balance',
      WeekPeriod: 'Jan 8-14, 2024',
      Deadline: 'Jan 15, 2024',
      DashboardLink: '#',
      Amount: '$150.00',
      Description: 'Business travel expenses',
      Status: 'Approved',
      SubmissionDate: '2024-01-10',
      ApprovedAmount: '$150.00',
      StatusMessage: 'Processed successfully',
      ResetLink: '#'
    };

    Object.entries(sampleData).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      previewSubject = previewSubject.replace(regex, value);
      previewBody = previewBody.replace(regex, value);
    });

    setPreviewData({ subject: previewSubject, body: previewBody });
    setShowPreviewModal(true);
  };

  const handleSaveTemplate = async () => {
    if (!selectedTemplate) return;

    try {
      setSaving(true);
      console.log('💾 Saving template:', selectedTemplate.id);
      console.log('📝 Template data:', {
        subject: editorData.subject,
        body: editorData.body,
        status: editorData.status
      });

      const updatedTemplate = {
        name: selectedTemplate.name,
        category: selectedTemplate.category,
        subject: editorData.subject,
        body: editorData.body,
        status: editorData.status
      };

      const response = await API.put(`/email/templates/${selectedTemplate.id}`, updatedTemplate);
      
      console.log('✅ Template saved successfully:', response.data);
      
      // Show success message
      alert('Template updated successfully!');
      
      // Refresh templates from server
      await fetchTemplates();
      
      // Close modal and reset state
      setShowEditorModal(false);
      setSelectedTemplate(null);
    } catch (err) {
      console.error('❌ Failed to save template:', err);
      alert('Failed to save template. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleResetToDefault = async () => {
    if (!selectedTemplate) return;

    const defaultTemplate = getDefaultTemplates().find(t => t.id === selectedTemplate.id);
    if (defaultTemplate) {
      setEditorData({
        subject: defaultTemplate.subject,
        body: defaultTemplate.body,
        status: 'active'
      });
    }
  };

  return (
    <div className="h-full flex flex-col space-y-6 animate-fade-in max-h-[calc(100vh-120px)] overflow-hidden">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 flex-none">
        <div>
          <h1 className="text-3xl font-extrabold text-secondary-900 tracking-tight">Email Templates</h1>
          <p className="text-sm font-medium text-secondary-500 mt-1 italic">Manage email templates for automated notifications.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" className="h-10 border-secondary-200" onClick={fetchTemplates} leftIcon={<ArrowPathIcon className="w-4 h-4" />}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 flex-none">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<DocumentTextIcon className="w-4 h-4" />}
            className="w-full"
          />
        </div>
        <div className="flex gap-2">
          {categories.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="whitespace-nowrap"
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Templates Table */}
      <Card className="flex-1 overflow-hidden border-none shadow-xl">
        <div className="px-6 py-4 border-b border-secondary-100 flex items-center justify-between bg-white bg-opacity-90 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-6 bg-primary-600 rounded-full" />
            <h3 className="text-lg font-black text-secondary-900 uppercase tracking-tighter">Template Library</h3>
          </div>
          <span className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest">
            {filteredTemplates.length} Templates
          </span>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <table className="w-full text-left">
            <thead className="bg-secondary-50/50 sticky top-0">
              <tr>
                <th className="px-6 py-4 text-[10px] font-bold text-secondary-500 uppercase tracking-widest">Template</th>
                <th className="px-6 py-4 text-[10px] font-bold text-secondary-500 uppercase tracking-widest">Category</th>
                <th className="px-6 py-4 text-[10px] font-bold text-secondary-500 uppercase tracking-widest">Subject</th>
                <th className="px-6 py-4 text-[10px] font-bold text-secondary-500 uppercase tracking-widest">Variables</th>
                <th className="px-6 py-4 text-[10px] font-bold text-secondary-500 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-secondary-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-50">
              {loading ? (
                <tr><td colSpan={6} className="py-20 text-center text-xs font-bold text-secondary-400">Loading templates...</td></tr>
              ) : filteredTemplates.map(template => (
                <tr key={template.id} className="hover:bg-primary-50/20 transition-all border-l-2 border-transparent hover:border-primary-500">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                        <EnvelopeIcon className="w-4 h-4 text-primary-600" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-secondary-800">{template.name}</p>
                        <p className="text-xs text-secondary-500">Updated {new Date(template.updatedAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                      {template.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-secondary-600 truncate max-w-xs" title={template.subject}>
                      {template.subject}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {template.variables.slice(0, 2).map(variable => (
                        <span key={variable} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-secondary-100 text-secondary-600">
                          {variable}
                        </span>
                      ))}
                      {template.variables.length > 2 && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-secondary-100 text-secondary-600">
                          +{template.variables.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={template.status} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePreviewTemplate(template)}
                        leftIcon={<EyeIcon className="w-4 h-4" />}
                        className="text-secondary-600 hover:text-primary-600"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditTemplate(template)}
                        leftIcon={<PencilSquareIcon className="w-4 h-4" />}
                        className="text-secondary-600 hover:text-primary-600"
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Template Editor Modal */}
      <Modal
        isOpen={showEditorModal}
        onClose={() => setShowEditorModal(false)}
        title={`Edit Template: ${selectedTemplate?.name}`}
        size="lg"
      >
        {selectedTemplate && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-secondary-700 mb-2">Email Subject</label>
              <Input
                type="text"
                value={editorData.subject}
                onChange={(e) => setEditorData(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Email subject"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-secondary-700 mb-2">Email Body (Plain Text)</label>
              <textarea
                value={editorData.body}
                onChange={(e) => setEditorData(prev => ({ ...prev, body: e.target.value }))}
                rows={12}
                className="w-full px-4 py-3 border border-secondary-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-sm font-medium font-sans"
                placeholder="Write your email in plain text..."
              />
            </div>

            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editorData.status === 'active'}
                  onChange={(e) => setEditorData(prev => ({ ...prev, status: e.target.checked ? 'active' : 'inactive' }))}
                  className="w-4 h-4 text-primary-600 focus:ring-primary-500 rounded"
                />
                <span className="text-sm font-medium text-secondary-700">Template Active</span>
              </label>
            </div>

            <div className="p-3 bg-secondary-50 rounded-lg">
              <p className="text-xs font-bold text-secondary-700 mb-2">Available Variables:</p>
              <div className="flex flex-wrap gap-2">
                {selectedTemplate.variables.map(variable => (
                  <span key={variable} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-white text-secondary-600 border border-secondary-200">
                    {`{{${variable}}}`}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-secondary-100">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleResetToDefault}
              >
                Reset to Default
              </Button>
              <div className="flex items-center gap-3">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowEditorModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSaveTemplate}
                  isLoading={saving}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Template'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Preview Modal */}
      <Modal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        title="Email Preview"
        size="lg"
      >
        {previewData && (
          <div className="space-y-4">
            <div className="p-4 bg-secondary-50 rounded-lg">
              <p className="text-sm font-bold text-secondary-700 mb-2">Subject:</p>
              <p className="text-sm text-secondary-900">{previewData.subject}</p>
            </div>
            <div className="p-4 bg-white border border-secondary-200 rounded-lg">
              <p className="text-sm font-bold text-secondary-700 mb-2">Body:</p>
              <pre 
                className="text-sm text-secondary-900 whitespace-pre-wrap font-sans bg-secondary-50 p-4 rounded-xl border border-secondary-100"
              >
                {previewData.body}
              </pre>
            </div>
            <div className="flex justify-end">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowPreviewModal(false)}
              >
                Close Preview
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default EmailTemplates;
