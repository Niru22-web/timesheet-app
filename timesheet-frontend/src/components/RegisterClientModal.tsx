import React, { useState, useCallback, useEffect } from 'react';
import Modal from './ui/Modal';
import Input from './ui/Input';
import Button from './ui/Button';
import API from '../api';

interface RegisterClientModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    editData?: any;
    isEditMode?: boolean;
}

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

const RegisterClientModal: React.FC<RegisterClientModalProps> = ({ isOpen, onClose, onSuccess, editData, isEditMode = false }) => {
    // Test: This should only log once when modal opens/closes, not on every keystroke
    console.log("Modal Rendered:", isOpen, "Edit Mode:", isEditMode);
    
    // Form state moved inside modal component
    const [formData, setFormData] = useState({
        name: '',
        alias: '',
        address: '',
        pin: '',
        state: '',
        country: '',
        gstStatus: '',
        gstin: '',
        pan: ''
    });

    // Initialize form with edit data when in edit mode
    useEffect(() => {
        if (isEditMode && editData) {
            setFormData({
                name: editData.name || '',
                alias: editData.alias || '',
                address: editData.address || '',
                pin: editData.pin || '',
                state: editData.state || '',
                country: editData.country || '',
                gstStatus: editData.gstStatus || '',
                gstin: editData.gstin || '',
                pan: editData.pan || ''
            });
        } else if (!isEditMode) {
            // Reset form for create mode
            setFormData({
                name: '',
                alias: '',
                address: '',
                pin: '',
                state: '',
                country: '',
                gstStatus: '',
                gstin: '',
                pan: ''
            });
        }
    }, [isEditMode, editData, isOpen]);

    // Helper functions for country/state handling
    const getAvailableStates = useCallback(() => {
        if (formData.country === 'India') {
            return INDIAN_STATES;
        }
        return [];
    }, [formData.country]);

    // Stable form change handler - optimized to prevent re-renders
    const handleFormChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        
        // Single state update to prevent re-renders
        setFormData(prev => {
            const newState = { ...prev, [name]: value };
            
            // Reset state when country changes
            if (name === 'country') {
                newState.state = '';
            }
            
            return newState;
        });
    }, []);

    // Memoized GST status handler to prevent re-renders
    const handleGstStatusChange = useCallback((status: string) => {
        setFormData(prev => ({ ...prev, gstStatus: status }));
    }, []);

    const resetForm = useCallback(() => {
        setFormData({
            name: '',
            alias: '',
            address: '',
            pin: '',
            state: '',
            country: '',
            gstStatus: '',
            gstin: '',
            pan: ''
        });
    }, []);

    const handleCreateClient = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.name) {
            alert('Client Name is mandatory.');
            return;
        }

        if (!formData.country) {
            alert('Country is mandatory.');
            return;
        }

        try {
            if (isEditMode && editData) {
                // Update existing client
                console.log('Updating client:', formData);
                const response = await API.put(`/clients/${editData.id}`, formData);
                
                if (response.data.success) {
                    const result = response.data;
                    alert('Client updated successfully!');
                    resetForm();
                    onClose();
                    onSuccess();
                } else {
                    throw new Error(response.data.message || 'Failed to update client');
                }
            } else {
                // Create new client
                console.log('Creating client:', formData);
                const response = await API.post('/clients', formData);
                
                if (response.data.success) {
                    const result = response.data;
                    alert('Client created successfully!');
                    resetForm();
                    onClose();
                    onSuccess();
                } else {
                    throw new Error(response.data.message || 'Failed to create client');
                }
            }
        } catch (err: any) {
            console.error('Failed to save client:', err);
            const errorMessage = err.response?.data?.message || err.message || 'Unknown error';
            alert(`Failed to ${isEditMode ? 'update' : 'create'} client: ${errorMessage}`);
        }
    };

    if (!isOpen) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={() => {
                onClose();
                resetForm();
            }}
            title={isEditMode ? "Edit Client" : "Register New Client"}
            size="lg"
        >
            <form onSubmit={handleCreateClient} className="space-y-3 pt-4">
                <div className="grid grid-cols-2 gap-3">
                    <Input
                        label="Legal Client Name *"
                        placeholder="e.g. Reliance Industries"
                        value={formData.name}
                        onChange={handleFormChange}
                        name="name"
                        required
                    />
                    <Input
                        label="Alias "
                        placeholder="e.g. RI"
                        value={formData.alias}
                        onChange={handleFormChange}
                        name="alias"
                    />
                </div>

                <Input
                    label="Registered Address"
                    placeholder="Street address..."
                    multiline
                    rows={2}
                    value={formData.address}
                    onChange={handleFormChange}
                    name="address"
                />

                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                        <label className="text-sm font-bold text-secondary-700 block ml-0.5">Country *</label>
                        <select
                            className="block w-full rounded-xl border-secondary-200 shadow-sm focus:border-primary-500 focus:ring-primary-500/20 sm:text-sm h-9 border px-3 transition-all outline-none bg-secondary-50/50 focus:bg-white"
                            value={formData.country}
                            onChange={handleFormChange}
                            name="country"
                            required
                        >
                            <option value="">Select Country</option>
                            {COUNTRIES.map(country => (
                                <option key={country} value={country}>{country}</option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-bold text-secondary-700 block ml-0.5">State</label>
                        <select
                            className="block w-full rounded-xl border-secondary-200 shadow-sm focus:border-primary-500 focus:ring-primary-500/20 sm:text-sm h-9 border px-3 transition-all outline-none bg-secondary-50/50 focus:bg-white"
                            value={formData.state}
                            onChange={handleFormChange}
                            name="state"
                            disabled={!formData.country || formData.country !== "India"}
                        >
                            <option value="">Select Country First</option>
                            {getAvailableStates().map(state => (
                                <option key={state} value={state}>{state}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <Input
                        label="PIN Code"
                        placeholder="400001"
                        value={formData.pin}
                        onChange={handleFormChange}
                        name="pin"
                    />
                    <div className="space-y-1.5">
                        <label className="text-sm font-bold text-secondary-700 block ml-0.5">GST Registered? *</label>
                        <div className="flex items-center gap-4 mt-2">
                            {['Yes', 'No'].map(opt => (
                                <button
                                    key={opt}
                                    type="button"
                                    onClick={() => handleGstStatusChange(opt)}
                                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all border ${formData.gstStatus === opt ? 'bg-primary-50 border-primary-500 text-primary-700' : 'bg-white border-secondary-200 text-secondary-400'}`}
                                    tabIndex={-1}
                                    onMouseDown={(e) => e.preventDefault()}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <Input
                        label="GSTIN Number (Mandatory if Yes)"
                        placeholder="27ABCDE1234F1Z0"
                        value={formData.gstin}
                        onChange={handleFormChange}
                        disabled={formData.gstStatus === 'No'}
                        name="gstin"
                    />
                    <Input
                        label="PAN "
                        placeholder="ABCDE1234F"
                        value={formData.pan}
                        onChange={handleFormChange}
                        name="pan"
                    />
                </div>

                <div className="pt-3 flex gap-3">
                    <Button
                        type="button"
                        variant="secondary"
                        fullWidth
                        onClick={() => {
                            onClose();
                            resetForm();
                        }}
                        className="h-9 border-secondary-200"
                    >
                        Cancel Setup
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                        fullWidth
                        className="h-9 font-extrabold shadow-md shadow-primary-500/10"
                    >
                        {isEditMode ? 'Update Client' : 'Register Client'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

// Custom comparison function to prevent unnecessary re-renders
const areEqual = (prevProps: RegisterClientModalProps, nextProps: RegisterClientModalProps) => {
    return prevProps.isOpen === nextProps.isOpen && 
           prevProps.onClose === nextProps.onClose && 
           prevProps.onSuccess === nextProps.onSuccess;
};

export default React.memo(RegisterClientModal, areEqual);
