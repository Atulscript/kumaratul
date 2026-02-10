import { useState, useEffect } from 'react';
import { insforge } from '../lib/insforge';

export default function CustomerManagement() {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        company_name: '',
        contact_person: '',
        email: '',
        phone: '',
        address: '',
        status: 'lead',
        notes: ''
    });

    // Fetch customers from InsForge
    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        setLoading(true);
        const { data, error } = await insforge.db
            .from('customers')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching customers:', error);
        } else {
            setCustomers(data || []);
        }
        setLoading(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const { data, error } = await insforge.db
            .from('customers')
            .insert([formData])
            .select();

        if (error) {
            console.error('Error creating customer:', error);
            alert('Error creating customer: ' + error.message);
        } else {
            alert('Customer created successfully!');
            setShowForm(false);
            setFormData({
                company_name: '',
                contact_person: '',
                email: '',
                phone: '',
                address: '',
                status: 'lead',
                notes: ''
            });
            fetchCustomers();
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'bg-discord-green';
            case 'inactive': return 'bg-discord-muted';
            case 'lead': return 'bg-discord-blurple';
            default: return 'bg-gray-500';
        }
    };

    return (
        <div className="p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-discord-text">Customer Management</h1>
                        <p className="text-discord-muted mt-1">Manage your customer database</p>
                    </div>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="bg-discord-blurple hover:bg-discord-blurple-dark text-white px-6 py-3 rounded-lg font-medium transition-all shadow-lg"
                    >
                        {showForm ? 'Cancel' : '+ Add Customer'}
                    </button>
                </div>

                {/* Add Customer Form */}
                {showForm && (
                    <div className="bg-discord-sidebar border border-discord-divider rounded-lg p-6 mb-6">
                        <h2 className="text-xl font-bold text-discord-text mb-4">New Customer</h2>
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-discord-muted text-sm mb-2">Company Name *</label>
                                <input
                                    type="text"
                                    name="company_name"
                                    value={formData.company_name}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-discord-element border border-discord-divider rounded px-4 py-2 text-discord-text focus:outline-none focus:border-discord-blurple"
                                />
                            </div>

                            <div>
                                <label className="block text-discord-muted text-sm mb-2">Contact Person *</label>
                                <input
                                    type="text"
                                    name="contact_person"
                                    value={formData.contact_person}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-discord-element border border-discord-divider rounded px-4 py-2 text-discord-text focus:outline-none focus:border-discord-blurple"
                                />
                            </div>

                            <div>
                                <label className="block text-discord-muted text-sm mb-2">Email *</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-discord-element border border-discord-divider rounded px-4 py-2 text-discord-text focus:outline-none focus:border-discord-blurple"
                                />
                            </div>

                            <div>
                                <label className="block text-discord-muted text-sm mb-2">Phone</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full bg-discord-element border border-discord-divider rounded px-4 py-2 text-discord-text focus:outline-none focus:border-discord-blurple"
                                />
                            </div>

                            <div>
                                <label className="block text-discord-muted text-sm mb-2">Status</label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="w-full bg-discord-element border border-discord-divider rounded px-4 py-2 text-discord-text focus:outline-none focus:border-discord-blurple"
                                >
                                    <option value="lead">Lead</option>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-discord-muted text-sm mb-2">Address</label>
                                <input
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    className="w-full bg-discord-element border border-discord-divider rounded px-4 py-2 text-discord-text focus:outline-none focus:border-discord-blurple"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-discord-muted text-sm mb-2">Notes</label>
                                <textarea
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleChange}
                                    rows="3"
                                    className="w-full bg-discord-element border border-discord-divider rounded px-4 py-2 text-discord-text focus:outline-none focus:border-discord-blurple"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <button
                                    type="submit"
                                    className="bg-discord-green hover:bg-green-600 text-white px-8 py-3 rounded-lg font-medium transition-all shadow-lg"
                                >
                                    Create Customer
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Customers List */}
                <div className="bg-discord-sidebar border border-discord-divider rounded-lg overflow-hidden">
                    <div className="px-6 py-4 border-b border-discord-divider">
                        <h2 className="text-xl font-bold text-discord-text">All Customers ({customers.length})</h2>
                    </div>

                    {loading ? (
                        <div className="p-12 text-center text-discord-muted">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-discord-blurple mx-auto"></div>
                            <p className="mt-4">Loading customers...</p>
                        </div>
                    ) : customers.length === 0 ? (
                        <div className="p-12 text-center text-discord-muted">
                            <p>No customers yet. Click "Add Customer" to get started!</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-discord-element">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-discord-muted uppercase tracking-wider">Company</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-discord-muted uppercase tracking-wider">Contact</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-discord-muted uppercase tracking-wider">Email</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-discord-muted uppercase tracking-wider">Phone</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-discord-muted uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-discord-muted uppercase tracking-wider">Created</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-discord-divider">
                                    {customers.map((customer) => (
                                        <tr key={customer.id} className="hover:bg-discord-hover transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-discord-text">{customer.company_name}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-discord-text">{customer.contact_person}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-discord-muted">{customer.email}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-discord-muted">{customer.phone || '-'}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(customer.status)} text-white`}>
                                                    {customer.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-discord-muted">
                                                {new Date(customer.created_at).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
