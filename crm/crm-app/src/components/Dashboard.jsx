import { useState, useEffect } from 'react';
import { insforge } from '../lib/insforge';

export default function Dashboard({ setActiveModule }) {
    const [stats, setStats] = useState({
        totalCustomers: 0,
        activeProjects: 0,
        pendingQuotations: 0,
        recentActivities: 0
    });
    const [recentCustomers, setRecentCustomers] = useState([]);
    const [recentProjects, setRecentProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);

        // Fetch customers
        const { data: customers } = await insforge.db
            .from('customers')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(5);

        // Fetch projects
        const { data: projects } = await insforge.db
            .from('projects')
            .select('*, customers(company_name)')
            .order('created_at', { ascending: false })
            .limit(5);

        // Fetch quotations
        const { data: quotations } = await insforge.db
            .from('quotations')
            .select('*', { count: 'exact' })
            .eq('status', 'draft');

        // Fetch contacts
        const { data: contacts } = await insforge.db
            .from('contacts')
            .select('*', { count: 'exact' });

        setStats({
            totalCustomers: customers?.length || 0,
            activeProjects: projects?.filter(p => p.status === 'in_progress').length || 0,
            pendingQuotations: quotations?.length || 0,
            recentActivities: contacts?.length || 0
        });

        setRecentCustomers(customers || []);
        setRecentProjects(projects || []);
        setLoading(false);
    };

    const statCards = [
        { label: 'Total Customers', value: stats.totalCustomers, icon: '👥', color: 'bg-discord-blurple', link: 'customers' },
        { label: 'Active Projects', value: stats.activeProjects, icon: '📁', color: 'bg-discord-green', link: 'projects' },
        { label: 'Pending Quotes', value: stats.pendingQuotations, icon: '📄', color: 'bg-yellow-500', link: 'quotations' },
        { label: 'Activities', value: stats.recentActivities, icon: '📞', color: 'bg-purple-500', link: 'contacts' },
    ];

    const getStatusColor = (status) => {
        const colors = {
            active: 'bg-discord-green',
            inactive: 'bg-discord-muted',
            lead: 'bg-discord-blurple',
            planning: 'bg-blue-500',
            in_progress: 'bg-discord-green',
            review: 'bg-yellow-500',
            completed: 'bg-gray-500',
            on_hold: 'bg-orange-500',
            cancelled: 'bg-discord-red'
        };
        return colors[status] || 'bg-gray-500';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-discord-blurple"></div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-discord-text">Dashboard</h1>
                <p className="text-discord-muted mt-1">Welcome back! Here's what's happening.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat) => (
                    <button
                        key={stat.label}
                        onClick={() => setActiveModule(stat.link)}
                        className="bg-discord-sidebar border border-discord-divider rounded-lg p-6 hover:border-discord-blurple transition-all text-left"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-discord-muted text-sm">{stat.label}</p>
                                <p className="text-3xl font-bold text-discord-text mt-2">{stat.value}</p>
                            </div>
                            <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center text-2xl`}>
                                {stat.icon}
                            </div>
                        </div>
                    </button>
                ))}
            </div>

            {/* Recent Activity Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Customers */}
                <div className="bg-discord-sidebar border border-discord-divider rounded-lg overflow-hidden">
                    <div className="px-6 py-4 border-b border-discord-divider flex justify-between items-center">
                        <h2 className="text-xl font-bold text-discord-text">Recent Customers</h2>
                        <button
                            onClick={() => setActiveModule('customers')}
                            className="text-discord-blurple hover:underline text-sm"
                        >
                            View All →
                        </button>
                    </div>
                    <div className="p-6 space-y-4">
                        {recentCustomers.length === 0 ? (
                            <p className="text-discord-muted text-center py-8">No customers yet</p>
                        ) : (
                            recentCustomers.map((customer) => (
                                <div key={customer.id} className="flex items-center justify-between p-4 bg-discord-element rounded-lg hover:bg-discord-hover transition-colors">
                                    <div>
                                        <p className="font-medium text-discord-text">{customer.company_name}</p>
                                        <p className="text-sm text-discord-muted">{customer.contact_person}</p>
                                    </div>
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(customer.status)} text-white`}>
                                        {customer.status}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Recent Projects */}
                <div className="bg-discord-sidebar border border-discord-divider rounded-lg overflow-hidden">
                    <div className="px-6 py-4 border-b border-discord-divider flex justify-between items-center">
                        <h2 className="text-xl font-bold text-discord-text">Recent Projects</h2>
                        <button
                            onClick={() => setActiveModule('projects')}
                            className="text-discord-blurple hover:underline text-sm"
                        >
                            View All →
                        </button>
                    </div>
                    <div className="p-6 space-y-4">
                        {recentProjects.length === 0 ? (
                            <p className="text-discord-muted text-center py-8">No projects yet</p>
                        ) : (
                            recentProjects.map((project) => (
                                <div key={project.id} className="flex items-center justify-between p-4 bg-discord-element rounded-lg hover:bg-discord-hover transition-colors">
                                    <div>
                                        <p className="font-medium text-discord-text">{project.name}</p>
                                        <p className="text-sm text-discord-muted">{project.customers?.company_name || 'No customer'}</p>
                                    </div>
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(project.status)} text-white`}>
                                        {project.status?.replace('_', ' ')}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-discord-sidebar border border-discord-divider rounded-lg p-6">
                <h2 className="text-xl font-bold text-discord-text mb-4">Quick Actions</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <button
                        onClick={() => setActiveModule('customers')}
                        className="bg-discord-element hover:bg-discord-hover border border-discord-divider rounded-lg p-4 text-center transition-all"
                    >
                        <div className="text-3xl mb-2">➕</div>
                        <p className="text-sm font-medium text-discord-text">Add Customer</p>
                    </button>
                    <button
                        onClick={() => setActiveModule('projects')}
                        className="bg-discord-element hover:bg-discord-hover border border-discord-divider rounded-lg p-4 text-center transition-all"
                    >
                        <div className="text-3xl mb-2">📁</div>
                        <p className="text-sm font-medium text-discord-text">New Project</p>
                    </button>
                    <button
                        onClick={() => setActiveModule('quotations')}
                        className="bg-discord-element hover:bg-discord-hover border border-discord-divider rounded-lg p-4 text-center transition-all"
                    >
                        <div className="text-3xl mb-2">📝</div>
                        <p className="text-sm font-medium text-discord-text">Create Quote</p>
                    </button>
                    <button
                        onClick={() => setActiveModule('contacts')}
                        className="bg-discord-element hover:bg-discord-hover border border-discord-divider rounded-lg p-4 text-center transition-all"
                    >
                        <div className="text-3xl mb-2">📞</div>
                        <p className="text-sm font-medium text-discord-text">Log Activity</p>
                    </button>
                </div>
            </div>
        </div>
    );
}
