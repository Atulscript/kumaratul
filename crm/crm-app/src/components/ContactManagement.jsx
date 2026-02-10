import { useState, useEffect } from 'react';
import { insforge } from '../lib/insforge';

export default function ContactManagement() {
    const [contacts, setContacts] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [filterType, setFilterType] = useState('all');
    const [formData, setFormData] = useState({
        customer_id: '',
        type: 'note',
        subject: '',
        notes: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);

        const { data: contactsData } = await insforge.db
            .from('contacts')
            .select('*, customers(company_name)')
            .order('contact_date', { ascending: false });

        const { data: customersData } = await insforge.db
            .from('customers')
            .select('id, company_name')
            .order('company_name');

        setContacts(contactsData || []);
        setCustomers(customersData || []);
        setLoading(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const { data, error } = await insforge.db
            .from('contacts')
            .insert([formData])
            .select();

        if (error) {
            alert('Error logging activity: ' + error.message);
        } else {
            alert('Activity logged successfully!');
            setShowForm(false);
            setFormData({
                customer_id: '',
                type: 'note',
                subject: '',
                notes: ''
            });
            fetchData();
        }
    };

    const getTypeIcon = (type) => {
        const icons = {
            call: '📞',
            email: '📧',
            meeting: '🤝',
            note: '📝',
            task: '✅'
        };
        return icons[type] || '📝';
    };

    const getTypeColor = (type) => {
        const colors = {
            call: 'bg-blue-500',
            email: 'bg-purple-500',
            meeting: 'bg-discord-green',
            note: 'bg-gray-500',
            task: 'bg-orange-500'
        };
        return colors[type] || 'bg-gray-500';
    };

    const filteredContacts = filterType === 'all'
        ? contacts
        : contacts.filter(c => c.type === filterType);

    return (
        <div className="p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-discord-text">Contact & Activity Log</h1>
                        <p className="text-discord-muted mt-1">Track all customer interactions</p>
                    </div>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="bg-discord-blurple hover:bg-discord-blurple-dark text-white px-6 py-3 rounded-lg font-medium transition-all shadow-lg"
                    >
                        {showForm ? 'Cancel' : '+ Log Activity'}
                    </button>
                </div>

                {/* Add Activity Form */}
                {showForm && (
                    <div className="bg-discord-sidebar border border-discord-divider rounded-lg p-6">
                        <h2 className="text-xl font-bold text-discord-text mb-4">Log New Activity</h2>
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-discord-muted text-sm mb-2">Customer *</label>
                                <select
                                    value={formData.customer_id}
                                    onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                                    required
                                    className="w-full bg-discord-element border border-discord-divider rounded px-4 py-2 text-discord-text focus:outline-none focus:border-discord-blurple"
                                >
                                    <option value="">Select Customer</option>
                                    {customers.map((customer) => (
                                        <option key={customer.id} value={customer.id}>
                                            {customer.company_name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-discord-muted text-sm mb-2">Activity Type *</label>
                                <select
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    required
                                    className="w-full bg-discord-element border border-discord-divider rounded px-4 py-2 text-discord-text focus:outline-none focus:border-discord-blurple"
                                >
                                    <option value="call">Phone Call</option>
                                    <option value="email">Email</option>
                                    <option value="meeting">Meeting</option>
                                    <option value="note">Note</option>
                                    <option value="task">Task</option>
                                </select>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-discord-muted text-sm mb-2">Subject *</label>
                                <input
                                    type="text"
                                    value={formData.subject}
                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                    required
                                    placeholder="e.g., Discussed Q1 campaign strategy"
                                    className="w-full bg-discord-element border border-discord-divider rounded px-4 py-2 text-discord-text focus:outline-none focus:border-discord-blurple"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-discord-muted text-sm mb-2">Notes</label>
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    rows="4"
                                    placeholder="Detailed notes about this interaction..."
                                    className="w-full bg-discord-element border border-discord-divider rounded px-4 py-2 text-discord-text focus:outline-none focus:border-discord-blurple"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <button
                                    type="submit"
                                    className="bg-discord-green hover:bg-green-600 text-white px-8 py-3 rounded-lg font-medium transition-all shadow-lg"
                                >
                                    Log Activity
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Filter Buttons */}
                <div className="flex gap-2 flex-wrap">
                    <button
                        onClick={() => setFilterType('all')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${filterType === 'all'
                                ? 'bg-discord-blurple text-white'
                                : 'bg-discord-element text-discord-muted hover:bg-discord-hover'
                            }`}
                    >
                        All ({contacts.length})
                    </button>
                    {['call', 'email', 'meeting', 'note', 'task'].map((type) => (
                        <button
                            key={type}
                            onClick={() => setFilterType(type)}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${filterType === type
                                    ? 'bg-discord-blurple text-white'
                                    : 'bg-discord-element text-discord-muted hover:bg-discord-hover'
                                }`}
                        >
                            {getTypeIcon(type)} {type.charAt(0).toUpperCase() + type.slice(1)} ({contacts.filter(c => c.type === type).length})
                        </button>
                    ))}
                </div>

                {/* Activities Timeline */}
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-discord-blurple"></div>
                    </div>
                ) : filteredContacts.length === 0 ? (
                    <div className="bg-discord-sidebar border border-discord-divider rounded-lg p-12 text-center">
                        <p className="text-discord-muted">No activities logged yet. Click "Log Activity" to get started!</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredContacts.map((contact) => (
                            <div key={contact.id} className="bg-discord-sidebar border border-discord-divider rounded-lg p-6 hover:border-discord-blurple transition-all">
                                <div className="flex items-start gap-4">
                                    <div className={`w-12 h-12 ${getTypeColor(contact.type)} rounded-lg flex items-center justify-center text-2xl flex-shrink-0`}>
                                        {getTypeIcon(contact.type)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <h3 className="text-lg font-bold text-discord-text">{contact.subject}</h3>
                                                <p className="text-sm text-discord-muted">{contact.customers?.company_name}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm text-discord-muted">{new Date(contact.contact_date).toLocaleDateString()}</p>
                                                <p className="text-xs text-discord-muted">{new Date(contact.contact_date).toLocaleTimeString()}</p>
                                            </div>
                                        </div>
                                        {contact.notes && (
                                            <p className="text-discord-text mt-2">{contact.notes}</p>
                                        )}
                                        <div className="mt-3">
                                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getTypeColor(contact.type)} text-white`}>
                                                {contact.type.toUpperCase()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
