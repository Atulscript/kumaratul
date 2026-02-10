import { useState, useEffect } from 'react';
import { insforge } from '../lib/insforge';

export default function QuotationGenerator() {
    const [quotations, setQuotations] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        customer_id: '',
        quotation_number: `QT-${Date.now()}`,
        valid_until: '',
        notes: '',
        tax: 0
    });
    const [items, setItems] = useState([
        { description: '', quantity: 1, unit_price: 0 }
    ]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);

        const { data: quotationsData } = await insforge.db
            .from('quotations')
            .select('*, customers(company_name)')
            .order('created_at', { ascending: false });

        const { data: customersData } = await insforge.db
            .from('customers')
            .select('id, company_name')
            .order('company_name');

        setQuotations(quotationsData || []);
        setCustomers(customersData || []);
        setLoading(false);
    };

    const addItem = () => {
        setItems([...items, { description: '', quantity: 1, unit_price: 0 }]);
    };

    const removeItem = (index) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const updateItem = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;
        setItems(newItems);
    };

    const calculateSubtotal = () => {
        return items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
    };

    const calculateTotal = () => {
        const subtotal = calculateSubtotal();
        const tax = parseFloat(formData.tax) || 0;
        return subtotal + tax;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const subtotal = calculateSubtotal();
        const total = calculateTotal();

        const { data, error } = await insforge.db
            .from('quotations')
            .insert([{
                ...formData,
                items: JSON.stringify(items),
                subtotal,
                tax: parseFloat(formData.tax) || 0,
                total,
                status: 'draft'
            }])
            .select();

        if (error) {
            alert('Error creating quotation: ' + error.message);
        } else {
            alert('Quotation created successfully!');
            setShowForm(false);
            setFormData({
                customer_id: '',
                quotation_number: `QT-${Date.now()}`,
                valid_until: '',
                notes: '',
                tax: 0
            });
            setItems([{ description: '', quantity: 1, unit_price: 0 }]);
            fetchData();
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            draft: 'bg-gray-500',
            sent: 'bg-blue-500',
            approved: 'bg-discord-green',
            rejected: 'bg-discord-red',
            expired: 'bg-orange-500'
        };
        return colors[status] || 'bg-gray-500';
    };

    return (
        <div className="p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-discord-text">Quotation Generator</h1>
                        <p className="text-discord-muted mt-1">Create and manage quotations</p>
                    </div>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="bg-discord-blurple hover:bg-discord-blurple-dark text-white px-6 py-3 rounded-lg font-medium transition-all shadow-lg"
                    >
                        {showForm ? 'Cancel' : '+ New Quotation'}
                    </button>
                </div>

                {/* Create Quotation Form */}
                {showForm && (
                    <div className="bg-discord-sidebar border border-discord-divider rounded-lg p-6">
                        <h2 className="text-xl font-bold text-discord-text mb-4">Create Quotation</h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Basic Info */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                                    <label className="block text-discord-muted text-sm mb-2">Quotation Number *</label>
                                    <input
                                        type="text"
                                        value={formData.quotation_number}
                                        onChange={(e) => setFormData({ ...formData, quotation_number: e.target.value })}
                                        required
                                        className="w-full bg-discord-element border border-discord-divider rounded px-4 py-2 text-discord-text focus:outline-none focus:border-discord-blurple"
                                    />
                                </div>

                                <div>
                                    <label className="block text-discord-muted text-sm mb-2">Valid Until</label>
                                    <input
                                        type="date"
                                        value={formData.valid_until}
                                        onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                                        className="w-full bg-discord-element border border-discord-divider rounded px-4 py-2 text-discord-text focus:outline-none focus:border-discord-blurple"
                                    />
                                </div>
                            </div>

                            {/* Line Items */}
                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-bold text-discord-text">Line Items</h3>
                                    <button
                                        type="button"
                                        onClick={addItem}
                                        className="bg-discord-green hover:bg-green-600 text-white px-4 py-2 rounded text-sm font-medium"
                                    >
                                        + Add Item
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {items.map((item, index) => (
                                        <div key={index} className="grid grid-cols-12 gap-3 items-end bg-discord-element p-4 rounded">
                                            <div className="col-span-6">
                                                <label className="block text-discord-muted text-xs mb-1">Description</label>
                                                <input
                                                    type="text"
                                                    value={item.description}
                                                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                                                    placeholder="Service or product description"
                                                    className="w-full bg-discord-bg border border-discord-divider rounded px-3 py-2 text-discord-text text-sm focus:outline-none focus:border-discord-blurple"
                                                />
                                            </div>
                                            <div className="col-span-2">
                                                <label className="block text-discord-muted text-xs mb-1">Qty</label>
                                                <input
                                                    type="number"
                                                    value={item.quantity}
                                                    onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value))}
                                                    min="1"
                                                    className="w-full bg-discord-bg border border-discord-divider rounded px-3 py-2 text-discord-text text-sm focus:outline-none focus:border-discord-blurple"
                                                />
                                            </div>
                                            <div className="col-span-2">
                                                <label className="block text-discord-muted text-xs mb-1">Unit Price</label>
                                                <input
                                                    type="number"
                                                    value={item.unit_price}
                                                    onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value))}
                                                    step="0.01"
                                                    min="0"
                                                    className="w-full bg-discord-bg border border-discord-divider rounded px-3 py-2 text-discord-text text-sm focus:outline-none focus:border-discord-blurple"
                                                />
                                            </div>
                                            <div className="col-span-1">
                                                <label className="block text-discord-muted text-xs mb-1">Total</label>
                                                <div className="text-discord-text font-medium text-sm py-2">
                                                    ${(item.quantity * item.unit_price).toFixed(2)}
                                                </div>
                                            </div>
                                            <div className="col-span-1">
                                                {items.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeItem(index)}
                                                        className="w-full bg-discord-red hover:bg-red-600 text-white px-2 py-2 rounded text-sm"
                                                    >
                                                        ✕
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Totals */}
                            <div className="bg-discord-element p-6 rounded-lg">
                                <div className="max-w-md ml-auto space-y-3">
                                    <div className="flex justify-between text-discord-text">
                                        <span>Subtotal:</span>
                                        <span className="font-medium">${calculateSubtotal().toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-discord-text">Tax:</span>
                                        <input
                                            type="number"
                                            value={formData.tax}
                                            onChange={(e) => setFormData({ ...formData, tax: e.target.value })}
                                            step="0.01"
                                            min="0"
                                            placeholder="0.00"
                                            className="w-32 bg-discord-bg border border-discord-divider rounded px-3 py-1 text-discord-text text-right focus:outline-none focus:border-discord-blurple"
                                        />
                                    </div>
                                    <div className="border-t border-discord-divider pt-3 flex justify-between text-lg font-bold text-discord-text">
                                        <span>Total:</span>
                                        <span>${calculateTotal().toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="block text-discord-muted text-sm mb-2">Notes</label>
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    rows="3"
                                    placeholder="Terms, conditions, or additional notes..."
                                    className="w-full bg-discord-element border border-discord-divider rounded px-4 py-2 text-discord-text focus:outline-none focus:border-discord-blurple"
                                />
                            </div>

                            <button
                                type="submit"
                                className="bg-discord-green hover:bg-green-600 text-white px-8 py-3 rounded-lg font-medium transition-all shadow-lg"
                            >
                                Create Quotation
                            </button>
                        </form>
                    </div>
                )}

                {/* Quotations List */}
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-discord-blurple"></div>
                    </div>
                ) : quotations.length === 0 ? (
                    <div className="bg-discord-sidebar border border-discord-divider rounded-lg p-12 text-center">
                        <p className="text-discord-muted">No quotations yet. Click "New Quotation" to create one!</p>
                    </div>
                ) : (
                    <div className="bg-discord-sidebar border border-discord-divider rounded-lg overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-discord-element">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-discord-muted uppercase">Quote #</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-discord-muted uppercase">Customer</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-discord-muted uppercase">Total</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-discord-muted uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-discord-muted uppercase">Valid Until</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-discord-muted uppercase">Created</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-discord-divider">
                                {quotations.map((quote) => (
                                    <tr key={quote.id} className="hover:bg-discord-hover transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-discord-text">{quote.quotation_number}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-discord-text">{quote.customers?.company_name}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-discord-text">${parseFloat(quote.total).toLocaleString()}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(quote.status)} text-white`}>
                                                {quote.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-discord-muted">
                                            {quote.valid_until ? new Date(quote.valid_until).toLocaleDateString() : '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-discord-muted">
                                            {new Date(quote.created_at).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
