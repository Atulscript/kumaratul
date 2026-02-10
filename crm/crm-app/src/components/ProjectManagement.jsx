import { useState, useEffect } from 'react';
import { insforge } from '../lib/insforge';

export default function ProjectManagement() {
    const [projects, setProjects] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        customer_id: '',
        name: '',
        description: '',
        status: 'planning',
        start_date: '',
        end_date: '',
        budget: '',
        progress: 0
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);

        // Fetch projects with customer info
        const { data: projectsData } = await insforge.db
            .from('projects')
            .select('*, customers(company_name, contact_person)')
            .order('created_at', { ascending: false });

        // Fetch customers for dropdown
        const { data: customersData } = await insforge.db
            .from('customers')
            .select('id, company_name')
            .order('company_name');

        setProjects(projectsData || []);
        setCustomers(customersData || []);
        setLoading(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const { data, error } = await insforge.db
            .from('projects')
            .insert([{
                ...formData,
                budget: parseFloat(formData.budget) || 0,
                progress: parseInt(formData.progress) || 0
            }])
            .select();

        if (error) {
            alert('Error creating project: ' + error.message);
        } else {
            alert('Project created successfully!');
            setShowForm(false);
            setFormData({
                customer_id: '',
                name: '',
                description: '',
                status: 'planning',
                start_date: '',
                end_date: '',
                budget: '',
                progress: 0
            });
            fetchData();
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const getStatusColor = (status) => {
        const colors = {
            planning: 'bg-blue-500',
            in_progress: 'bg-discord-green',
            review: 'bg-yellow-500',
            completed: 'bg-gray-500',
            on_hold: 'bg-orange-500',
            cancelled: 'bg-discord-red'
        };
        return colors[status] || 'bg-gray-500';
    };

    const getProgressColor = (progress) => {
        if (progress >= 75) return 'bg-discord-green';
        if (progress >= 50) return 'bg-yellow-500';
        if (progress >= 25) return 'bg-orange-500';
        return 'bg-discord-red';
    };

    return (
        <div className="p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-discord-text">Project Management</h1>
                        <p className="text-discord-muted mt-1">Track and manage customer projects</p>
                    </div>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="bg-discord-blurple hover:bg-discord-blurple-dark text-white px-6 py-3 rounded-lg font-medium transition-all shadow-lg"
                    >
                        {showForm ? 'Cancel' : '+ New Project'}
                    </button>
                </div>

                {/* Add Project Form */}
                {showForm && (
                    <div className="bg-discord-sidebar border border-discord-divider rounded-lg p-6">
                        <h2 className="text-xl font-bold text-discord-text mb-4">Create New Project</h2>
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-discord-muted text-sm mb-2">Customer *</label>
                                <select
                                    name="customer_id"
                                    value={formData.customer_id}
                                    onChange={handleChange}
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
                                <label className="block text-discord-muted text-sm mb-2">Project Name *</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    placeholder="e.g., Google Ads Campaign Q1"
                                    className="w-full bg-discord-element border border-discord-divider rounded px-4 py-2 text-discord-text focus:outline-none focus:border-discord-blurple"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-discord-muted text-sm mb-2">Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows="3"
                                    placeholder="Project details and objectives..."
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
                                    <option value="planning">Planning</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="review">Review</option>
                                    <option value="completed">Completed</option>
                                    <option value="on_hold">On Hold</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-discord-muted text-sm mb-2">Budget ($)</label>
                                <input
                                    type="number"
                                    name="budget"
                                    value={formData.budget}
                                    onChange={handleChange}
                                    step="0.01"
                                    placeholder="10000.00"
                                    className="w-full bg-discord-element border border-discord-divider rounded px-4 py-2 text-discord-text focus:outline-none focus:border-discord-blurple"
                                />
                            </div>

                            <div>
                                <label className="block text-discord-muted text-sm mb-2">Start Date</label>
                                <input
                                    type="date"
                                    name="start_date"
                                    value={formData.start_date}
                                    onChange={handleChange}
                                    className="w-full bg-discord-element border border-discord-divider rounded px-4 py-2 text-discord-text focus:outline-none focus:border-discord-blurple"
                                />
                            </div>

                            <div>
                                <label className="block text-discord-muted text-sm mb-2">End Date</label>
                                <input
                                    type="date"
                                    name="end_date"
                                    value={formData.end_date}
                                    onChange={handleChange}
                                    className="w-full bg-discord-element border border-discord-divider rounded px-4 py-2 text-discord-text focus:outline-none focus:border-discord-blurple"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <button
                                    type="submit"
                                    className="bg-discord-green hover:bg-green-600 text-white px-8 py-3 rounded-lg font-medium transition-all shadow-lg"
                                >
                                    Create Project
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Projects Grid */}
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-discord-blurple"></div>
                    </div>
                ) : projects.length === 0 ? (
                    <div className="bg-discord-sidebar border border-discord-divider rounded-lg p-12 text-center">
                        <p className="text-discord-muted">No projects yet. Click "New Project" to get started!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects.map((project) => (
                            <div key={project.id} className="bg-discord-sidebar border border-discord-divider rounded-lg overflow-hidden hover:border-discord-blurple transition-all">
                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold text-discord-text mb-1">{project.name}</h3>
                                            <p className="text-sm text-discord-muted">{project.customers?.company_name}</p>
                                        </div>
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(project.status)} text-white`}>
                                            {project.status.replace('_', ' ')}
                                        </span>
                                    </div>

                                    {project.description && (
                                        <p className="text-sm text-discord-muted mb-4 line-clamp-2">{project.description}</p>
                                    )}

                                    {/* Progress Bar */}
                                    <div className="mb-4">
                                        <div className="flex justify-between text-xs text-discord-muted mb-1">
                                            <span>Progress</span>
                                            <span>{project.progress}%</span>
                                        </div>
                                        <div className="w-full bg-discord-element rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full ${getProgressColor(project.progress)} transition-all`}
                                                style={{ width: `${project.progress}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2 text-sm">
                                        {project.budget && (
                                            <div className="flex justify-between">
                                                <span className="text-discord-muted">Budget:</span>
                                                <span className="text-discord-text font-medium">${parseFloat(project.budget).toLocaleString()}</span>
                                            </div>
                                        )}
                                        {project.start_date && (
                                            <div className="flex justify-between">
                                                <span className="text-discord-muted">Start:</span>
                                                <span className="text-discord-text">{new Date(project.start_date).toLocaleDateString()}</span>
                                            </div>
                                        )}
                                        {project.end_date && (
                                            <div className="flex justify-between">
                                                <span className="text-discord-muted">End:</span>
                                                <span className="text-discord-text">{new Date(project.end_date).toLocaleDateString()}</span>
                                            </div>
                                        )}
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
