import React, { useState, useEffect, useCallback } from 'react';
import API from '../api';
import { useAuth } from '../contexts/AuthContext';
import RegisterClientModal from '../components/RegisterClientModal';
import {
    UsersIcon,
    PlusIcon,
    MagnifyingGlassIcon,
    PencilSquareIcon,
    TrashIcon,
    IdentificationIcon,
    CheckBadgeIcon,
    ShieldCheckIcon,
    ClipboardDocumentCheckIcon,
    DocumentArrowUpIcon,
    DocumentArrowDownIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    EyeIcon
} from '@heroicons/react/24/outline';

// Constants for Country and State dropdowns
const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa",
  "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala",
  "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland",
  "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi", "Puducherry", "Chandigarh"
];

const COUNTRIES = [
  "India", "United States", "United Kingdom", "Canada", "Australia", "Germany",
  "France", "Japan", "China", "Singapore", "UAE", "Saudi Arabia", "Others"
];

// UI Components
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import StatusBadge from '../components/ui/StatusBadge';
import StatusToggle from '../components/ui/StatusToggle';
import Modal from '../components/ui/Modal';
import Select from '../components/ui/Select';
import { TableSkeleton, Skeleton } from '../components/ui/Skeleton';

interface Client {
    id: string;
    clientId: string;
    name: string;
    alias?: string;
    gstStatus?: string;
    gstin?: string;
    pan?: string;
    address?: string;
    pin?: string;
    state?: string;
    country?: string;
    phone?: string;
    status?: string;
    _count?: {
        projects: number;
    };
}

interface BulkUploadResult {
    success: Array<{ row: number; clientId: string; name: string }>;
    errors: Array<{ row: number; data: any; error: string }>;
}

const Clients: React.FC = () => {
    const { user } = useAuth();
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingClient, setEditingClient] = useState<Client | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingClient, setDeletingClient] = useState<Client | null>(null);
    const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadResult, setUploadResult] = useState<BulkUploadResult | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
    const [showViewModal, setShowViewModal] = useState(false);
    const [viewingClient, setViewingClient] = useState<Client | null>(null);

    const isManager = user?.role === 'Manager' || user?.role === 'Admin' || user?.role === 'Partner' || user?.role === 'manager' || user?.role === 'admin' || user?.role === 'partner';

    const showMessage = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 5000);
    };

    const fetchClients = useCallback(async () => {
        try {
            setLoading(true);
            const response = await API.get('/clients');
            const clientData = response.data?.success ? response.data.data : response.data;
            setClients(Array.isArray(clientData) ? clientData : []);
        } catch (err) {
            console.error('Failed to fetch clients:', err);
            showMessage('Failed to fetch clients', 'error');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchClients();
    }, [fetchClients]);

    const handleEditClient = async (client: Client) => {
        try {
            setLoading(true);
            const response = await API.get(`/clients/${client.id}`);
            const result = response.data;
            const fullClient = result.success ? result.data : result;
            
            setEditingClient(fullClient);
            setShowEditModal(true);
        } catch (err: any) {
            console.error('Failed to fetch client details:', err);
            showMessage('Error fetching client details.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateClient = async (clientData: any) => {
        try {
            const response = await API.put(`/clients/${editingClient?.id}`, clientData);
            if (response.data.success) {
                showMessage(response.data.message || 'Client updated successfully');
                setShowEditModal(false);
                setEditingClient(null);
                fetchClients();
            }
        } catch (err: any) {
            console.error('Failed to update client:', err);
            const errorMsg = err.response?.data?.message || 'Error updating client.';
            showMessage(errorMsg, 'error');
        }
    };

    const handleViewClient = async (client: Client) => {
        try {
            setLoading(true);
            const response = await API.get(`/clients/${client.id}`);
            const result = response.data;
            const fullClient = result.success ? result.data : result;
            setViewingClient(fullClient);
            setShowViewModal(true);
        } catch (err) {
            console.error('Failed to fetch client details:', err);
            showMessage('Error fetching client details.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClient = (client: Client) => {
        setDeletingClient(client);
        setShowDeleteModal(true);
    };

    const confirmDeleteClient = async () => {
        if (!isManager || !deletingClient) return;

        try {
            const response = await API.delete(`/clients/${deletingClient.id}`);
            if (response.data.success) {
                showMessage(response.data.message || 'Client deleted successfully');
                setShowDeleteModal(false);
                setDeletingClient(null);
                fetchClients();
            }
        } catch (err: any) {
            console.error('Failed to delete client:', err);
            const errorMsg = err.response?.data?.message || 'Error deleting client.';
            showMessage(errorMsg, 'error');
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file type
            const validTypes = [
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'application/vnd.ms-excel'
            ];
            
            if (!validTypes.includes(file.type)) {
                showMessage('Please select a valid Excel file (.xlsx or .xls)', 'error');
                return;
            }
            
            // Validate file size (5MB limit)
            if (file.size > 5 * 1024 * 1024) {
                showMessage('File size should not exceed 5MB', 'error');
                return;
            }
            
            setSelectedFile(file);
        }
    };

    const handleBulkUpload = async () => {
        if (!selectedFile || !isManager) return;

        setUploading(true);
        setUploadResult(null);

        try {
            const uploadFormData = new FormData();
            uploadFormData.append('file', selectedFile);

            const response = await API.post('/clients/bulk-upload', uploadFormData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.success) {
                setUploadResult(response.data.data.results);
                showMessage(response.data.message || 'Bulk upload completed successfully');
                fetchClients(); // Refresh client list
            }
        } catch (err: any) {
            console.error('Bulk upload failed:', err);
            const errorMsg = err.response?.data?.message || 'Error during bulk upload.';
            showMessage(errorMsg, 'error');
        } finally {
            setUploading(false);
        }
    };

    const downloadTemplate = async () => {
        try {
            const response = await API.get('/clients/template/download', {
                responseType: 'blob',
            });

            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'client_upload_template.xlsx');
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Failed to download template:', err);
            alert('Failed to download template. Please try again.');
        }
    };

    const resetBulkUpload = () => {
        setSelectedFile(null);
        setUploadResult(null);
        setShowBulkUploadModal(false);
    };

    const toggleClientStatus = async (clientId: string) => {
        try {
            const response = await API.patch(`/clients/${clientId}/toggle-status`);
            if (response.data.success) {
                showMessage(response.data.message || 'Client status updated successfully');
                fetchClients();
            }
        } catch (err: any) {
            console.error('Failed to toggle client status:', err);
            const errorMsg = err.response?.data?.message || 'Error updating client status.';
            showMessage(errorMsg, 'error');
        }
    };

    const filteredClients = clients.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.clientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.alias?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Memoized callbacks to prevent modal re-renders
    const handleModalClose = useCallback(() => {
        setShowAddModal(false);
    }, []);

    const handleModalSuccess = useCallback(() => {
        fetchClients();
    }, [fetchClients]);

    return (
        <div className="h-full flex flex-col space-y-6 animate-fade-in max-h-[calc(100vh-120px)] overflow-hidden">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 flex-none">
                <div>
                    <h1 className="text-3xl font-extrabold text-secondary-900 tracking-tight">Client Directory</h1>
                    <p className="text-sm font-medium text-secondary-500 mt-1">Manage global enterprise clients and fiscal registrations.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="secondary"
                        size="sm"
                        className="h-10 border-secondary-200"
                        onClick={fetchClients}
                    >
                        Refresh List
                    </Button>
                    {isManager && (
                        <>
                            <Button
                                variant="secondary"
                                size="sm"
                                className="h-10 border-secondary-200"
                                onClick={downloadTemplate}
                                leftIcon={<DocumentArrowDownIcon className="w-4 h-4" />}
                            >
                                Download Template
                            </Button>
                            <Button
                                variant="secondary"
                                size="sm"
                                className="h-10 border-secondary-200"
                                onClick={() => setShowBulkUploadModal(true)}
                                leftIcon={<DocumentArrowUpIcon className="w-4 h-4" />}
                            >
                                Bulk Upload
                            </Button>
                            <Button
                                variant="primary"
                                size="sm"
                                className="h-10 px-6 font-bold"
                                onClick={() => setShowAddModal(true)}
                                leftIcon={<PlusIcon className="w-4 h-4" />}
                            >
                                Add New Client
                            </Button>
                        </>
                    )}
                </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-none">
                {loading && clients.length === 0 ? (
                    [1, 2, 3].map((i) => (
                        <Card key={i} className="p-4 flex items-center gap-4 border-l-4 border-secondary-200">
                             <Skeleton variant="circular" width={48} height={48} />
                             <div className="flex-1">
                                <Skeleton variant="text" width="40%" />
                                <Skeleton variant="text" width="60%" />
                             </div>
                        </Card>
                    ))
                ) : (
                    <>
                        <Card className="p-4 flex items-center gap-4 border-l-4 border-primary-500">
                            <div className="p-3 bg-primary-50 text-primary-600 rounded-xl">
                                <UsersIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest">Total Active Clients</p>
                                <p className="text-2xl font-bold text-secondary-900">{clients.length}</p>
                            </div>
                        </Card>
                        <Card className="p-4 flex items-center gap-4 border-l-4 border-indigo-500">
                            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                                <ShieldCheckIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest">GST Registered</p>
                                <p className="text-2xl font-bold text-secondary-900">{clients.filter(c => c.gstStatus === 'Yes').length}</p>
                            </div>
                        </Card>
                        <Card className="p-4 flex items-center gap-4 border-l-4 border-emerald-500">
                            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                                <ClipboardDocumentCheckIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-secondary-400 uppercase tracking-wider">Active Projects</p>
                                <p className="text-2xl font-bold text-secondary-900">12</p>
                            </div>
                        </Card>
                    </>
                )}
            </div>

            {/* Search and Table */}
            <Card className="flex-1 flex flex-col overflow-hidden min-h-0 shadow-lg">
                <div className="p-4 border-b border-secondary-100 flex items-center gap-4">
                    <div className="flex-1 relative group">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400 group-focus-within:text-primary-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Filter by name, ID or alias..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-secondary-50/50 border border-secondary-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 bg-secondary-50/80 backdrop-blur-sm z-10 border-b border-secondary-100">
                            <tr>
                                <th className="px-6 py-4 text-[10px] font-bold text-secondary-500 uppercase tracking-widest">Client Identity</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-secondary-500 uppercase tracking-widest">Contact Details</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-secondary-500 uppercase tracking-widest">Tax Status</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-secondary-500 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-secondary-500 uppercase tracking-widest">Projects</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-secondary-500 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-secondary-50 px-2">
                            {loading && clients.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-0">
                                        <TableSkeleton rows={10} columns={6} />
                                    </td>
                                </tr>
                            ) : filteredClients.length > 0 ? (
                                filteredClients.map((client) => (
                                    <tr key={client.id} className="hover:bg-primary-50/20 group transition-colors">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 bg-secondary-100 text-secondary-400 rounded-lg flex items-center justify-center font-bold text-xs uppercase group-hover:bg-primary-100 group-hover:text-primary-600 transition-colors">
                                                    {client.name.substring(0, 2)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-secondary-900 leading-tight">{client.name}</p>
                                                    <p className="text-[10px] font-bold text-secondary-400 uppercase tracking-wider">{client.clientId}</p>
                                                    {client.address && <p className="text-xs text-secondary-600 mt-1">{client.address}</p>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="space-y-1">
                                                {client.alias && <span className="text-xs font-bold text-secondary-600 bg-secondary-100 px-3 py-1 rounded-lg">{client.alias}</span>}
                                                {client.state && <p className="text-xs text-secondary-600">{client.state}, {client.country}</p>}
                                                {client.pin && <p className="text-[10px] text-secondary-400">PIN: {client.pin}</p>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-xs font-bold px-2 py-1 rounded ${client.gstin ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                                        {client.gstin ? 'Registered' : 'Not Registered'}
                                                    </span>
                                                </div>
                                                {client.gstin && <span className="text-[10px] font-bold text-secondary-400 tracking-wider">GST: {client.gstin}</span>}
                                                {client.pan && <span className="text-[10px] font-bold text-secondary-400">PAN: {client.pan}</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <StatusBadge status={client.status === 'Active' ? 'active' : 'inactive'} />
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-bold text-secondary-900">{client._count?.projects || 0}</span>
                                                <span className="text-xs text-secondary-400">projects</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button 
                                                    onClick={() => handleViewClient(client)}
                                                    className="p-2 text-secondary-400 hover:text-blue-600 hover:bg-white rounded-lg transition-all border border-transparent hover:border-secondary-100"
                                                    title="View Client Details"
                                                >
                                                    <EyeIcon className="w-4 h-4" />
                                                </button>
                                                {isManager && (
                                                    <button 
                                                        onClick={() => handleEditClient(client)}
                                                        className="p-2 text-secondary-400 hover:text-primary-600 hover:bg-white rounded-lg transition-all border border-transparent hover:border-secondary-100"
                                                        title="Edit Client"
                                                    >
                                                        <PencilSquareIcon className="w-4 h-4" />
                                                    </button>
                                                )}
                                                {isManager && (
                                                    <StatusToggle
                                                        id={client.id}
                                                        status={client.status || 'Active'}
                                                        onUpdate={fetchClients}
                                                        type="client"
                                                    />
                                                )}
                                                {isManager && (
                                                    <button 
                                                        onClick={() => handleDeleteClient(client)}
                                                        className="p-2 text-secondary-400 hover:text-danger-600 hover:bg-white rounded-lg transition-all border border-transparent hover:border-secondary-100"
                                                        title="Delete Client"
                                                    >
                                                        <TrashIcon className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="py-20 text-center opacity-40 italic font-bold text-secondary-400">
                                        No clients discovered matching your query parameters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Register Client Modal - State is now isolated inside modal */}
            <RegisterClientModal 
                isOpen={showAddModal}
                onClose={handleModalClose}
                onSuccess={handleModalSuccess}
            />

            {/* Edit Client Modal */}
            <RegisterClientModal 
                isOpen={showEditModal}
                onClose={() => {
                    setShowEditModal(false);
                    setEditingClient(null);
                }}
                onSuccess={() => {
                    setShowEditModal(false);
                    setEditingClient(null);
                    fetchClients();
                }}
                editData={editingClient}
                isEditMode={true}
            />

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={showDeleteModal}
                onClose={() => {
                    setShowDeleteModal(false);
                    setDeletingClient(null);
                }}
                title="Confirm Client Deletion"
                size="md"
            >
                <div className="space-y-4 pt-4">
                    <div className="flex items-center gap-3 p-4 bg-danger-50 rounded-lg border border-danger-200">
                        <TrashIcon className="w-6 h-6 text-danger-600" />
                        <div>
                            <p className="text-sm font-bold text-danger-900">Are you sure you want to delete this client?</p>
                            <p className="text-xs text-danger-700 mt-1">This action cannot be undone and will permanently remove all client data.</p>
                        </div>
                    </div>
                    
                    {deletingClient && (
                        <div className="bg-secondary-50 rounded-lg p-3 border border-secondary-200">
                            <p className="text-xs font-bold text-secondary-500 uppercase tracking-wider mb-2">Client to be deleted:</p>
                            <div className="space-y-1">
                                <p className="text-sm font-bold text-secondary-900">{deletingClient.name}</p>
                                <p className="text-xs text-secondary-600">ID: {deletingClient.clientId} • Alias: {deletingClient.alias}</p>
                            </div>
                        </div>
                    )}

                    <div className="pt-4 flex gap-4">
                        <Button
                            type="button"
                            variant="secondary"
                            fullWidth
                            onClick={() => {
                                setShowDeleteModal(false);
                                setDeletingClient(null);
                            }}
                            className="h-12 border-secondary-200"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            variant="danger"
                            fullWidth
                            onClick={() => {
                                confirmDeleteClient();
                                setShowDeleteModal(false);
                                setDeletingClient(null);
                            }}
                            className="h-12 font-extrabold shadow-md shadow-danger-500/10"
                        >
                            Delete Client
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Bulk Upload Modal */}
            <Modal
                isOpen={showBulkUploadModal}
                onClose={resetBulkUpload}
                title="Bulk Upload Clients"
                size="lg"
            >
                <div className="space-y-6 pt-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <DocumentArrowUpIcon className="w-5 h-5 text-blue-600 mt-0.5" />
                            <div>
                                <h4 className="text-sm font-bold text-blue-900 mb-2">Upload Instructions</h4>
                                <ul className="text-xs text-blue-700 space-y-1">
                                    <li>• Download the template to understand the required format</li>
                                    <li>• Required fields: <strong>name</strong></li>
                                    <li>• Optional fields: alias, phone, address, pin, state, country, gstStatus, gstin, pan</li>
                                    <li>• GSTIN is mandatory if gstStatus is 'Yes'</li>
                                    <li>• File format: Excel (.xlsx or .xls) - Max 5MB</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <Button
                            variant="secondary"
                            onClick={downloadTemplate}
                            leftIcon={<DocumentArrowDownIcon className="w-4 h-4" />}
                        >
                            Download Template
                        </Button>
                    </div>

                    {!uploadResult ? (
                        <div className="space-y-4">
                            <div className={`relative border-2 border-dashed rounded-xl p-8 transition-all ${
                                selectedFile ? 'border-primary-500 bg-primary-50/30' : 'border-secondary-200 hover:border-primary-400 bg-secondary-50/50'
                            }`}>
                                <input
                                    type="file"
                                    aria-label="Upload Client Excel File"
                                    title="Upload Client Excel File"
                                    onChange={handleFileSelect}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    accept=".xlsx,.xls"
                                />
                                <div className="flex flex-col items-center text-center gap-3">
                                    <DocumentArrowUpIcon className={`w-12 h-12 ${selectedFile ? 'text-primary-600' : 'text-secondary-400'}`} />
                                    <div>
                                        <p className="text-sm font-bold text-secondary-700">
                                            {selectedFile ? selectedFile.name : 'Click to upload Excel file'}
                                        </p>
                                        <p className="text-xs text-secondary-400 mt-1">
                                            {selectedFile ? `Size: ${(selectedFile.size / 1024 / 1024).toFixed(2)} MB` : 'or drag and drop'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    fullWidth
                                    onClick={resetBulkUpload}
                                    className="h-12 border-secondary-200"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="button"
                                    variant="primary"
                                    fullWidth
                                    onClick={handleBulkUpload}
                                    disabled={!selectedFile || uploading}
                                    className="h-12 font-extrabold shadow-md shadow-primary-500/10"
                                >
                                    {uploading ? (
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Uploading...
                                        </div>
                                    ) : (
                                        'Upload Clients'
                                    )}
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <CheckCircleIcon className="w-5 h-5 text-emerald-600" />
                                        <h4 className="text-sm font-bold text-emerald-900">Successfully Imported</h4>
                                    </div>
                                    <p className="text-2xl font-bold text-emerald-700">{uploadResult.success.length}</p>
                                    <p className="text-xs text-emerald-600">clients added</p>
                                </div>
                                
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
                                        <h4 className="text-sm font-bold text-red-900">Failed to Import</h4>
                                    </div>
                                    <p className="text-2xl font-bold text-red-700">{uploadResult.errors.length}</p>
                                    <p className="text-xs text-red-600">records with errors</p>
                                </div>
                            </div>

                            {uploadResult.errors.length > 0 && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-h-40 overflow-y-auto">
                                    <h4 className="text-sm font-bold text-red-900 mb-3">Error Details</h4>
                                    <div className="space-y-2">
                                        {uploadResult.errors.map((error, index) => (
                                            <div key={index} className="text-xs text-red-700">
                                                <span className="font-bold">Row {error.row}:</span> {error.error}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-4 pt-4">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    fullWidth
                                    onClick={resetBulkUpload}
                                    className="h-12 border-secondary-200"
                                >
                                    Close
                                </Button>
                                <Button
                                    type="button"
                                    variant="primary"
                                    fullWidth
                                    onClick={() => {
                                        resetBulkUpload();
                                        setShowBulkUploadModal(true);
                                    }}
                                    className="h-12 font-extrabold shadow-md shadow-primary-500/10"
                                >
                                    Upload Another File
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </Modal>

            {/* View Modal */}
            <Modal
                isOpen={showViewModal}
                onClose={() => {
                    setShowViewModal(false);
                    setViewingClient(null);
                }}
                title="Client Details"
                size="xl"
            >
                {viewingClient && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="text-sm font-medium text-gray-500">Legal Name</h4>
                                <p className="mt-1 text-base text-gray-900 font-semibold">{viewingClient.name}</p>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-gray-500">Alias</h4>
                                <p className="mt-1 text-base text-gray-900">{viewingClient.alias || '-'}</p>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-gray-500">Phone</h4>
                                <p className="mt-1 text-base text-gray-900">{viewingClient.phone || '-'}</p>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-gray-500">Address</h4>
                                <p className="mt-1 text-base text-gray-900">{viewingClient.address || '-'}</p>
                            </div>
                        </div>

                        <div className="border-t border-gray-200 pt-4">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Tax & Location Info</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500">GST Status</h4>
                                    <p className="mt-1 text-base text-gray-900">{viewingClient.gstStatus}</p>
                                </div>
                                {viewingClient.gstStatus === 'Yes' && (
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-500">GSTIN</h4>
                                        <p className="mt-1 text-base text-gray-900 font-mono">{viewingClient.gstin}</p>
                                    </div>
                                )}
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500">PAN</h4>
                                    <p className="mt-1 text-base text-gray-900 font-mono uppercase">{viewingClient.pan || '-'}</p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500">Address</h4>
                                    <p className="mt-1 text-base text-gray-900">{viewingClient.address || '-'}</p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500">Location</h4>
                                    <p className="mt-1 text-base text-gray-900">
                                        {[viewingClient.state, viewingClient.country].filter(Boolean).join(', ')} 
                                        {viewingClient.pin && ` - ${viewingClient.pin}`}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                <div className="mt-8 flex justify-end">
                    <Button onClick={() => setShowViewModal(false)}>Close</Button>
                </div>
            </Modal>

            {/* Notification Toast */}
            {notification && (
                <div className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-2xl z-[100] flex items-center space-x-3 transition-all transform animate-slide-in ${
                    notification.type === 'error' ? 'bg-red-600' : 
                    notification.type === 'info' ? 'bg-blue-600' : 'bg-green-600'
                } text-white`}>
                    {notification.type === 'error' ? (
                        <ExclamationTriangleIcon className="h-6 w-6" />
                    ) : (
                        <CheckCircleIcon className="h-6 w-6" />
                    )}
                    <span className="font-medium">{notification.message}</span>
                </div>
            )}
        </div>
    );
};

export default Clients;
