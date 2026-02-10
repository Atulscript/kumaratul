import { useState } from 'react';
import Dashboard from './components/Dashboard';
import CustomerManagement from './components/CustomerManagement';
import ProjectManagement from './components/ProjectManagement';
import QuotationGenerator from './components/QuotationGenerator';
import ContactManagement from './components/ContactManagement';
import './index.css';

function App() {
  const [activeModule, setActiveModule] = useState('dashboard');

  const navigation = [
    { id: 'dashboard', name: 'Dashboard', icon: '📊' },
    { id: 'customers', name: 'Customers', icon: '👥' },
    { id: 'projects', name: 'Projects', icon: '📁' },
    { id: 'quotations', name: 'Quotations', icon: '📄' },
    { id: 'contacts', name: 'Activities', icon: '📞' },
  ];

  const renderModule = () => {
    switch (activeModule) {
      case 'dashboard':
        return <Dashboard setActiveModule={setActiveModule} />;
      case 'customers':
        return <CustomerManagement />;
      case 'projects':
        return <ProjectManagement />;
      case 'quotations':
        return <QuotationGenerator />;
      case 'contacts':
        return <ContactManagement />;
      default:
        return <Dashboard setActiveModule={setActiveModule} />;
    }
  };

  return (
    <div className="flex h-screen bg-discord-bg">
      {/* Sidebar */}
      <div className="w-64 bg-discord-sidebar border-r border-discord-divider flex flex-col">
        {/* Logo/Header */}
        <div className="p-6 border-b border-discord-divider">
          <h1 className="text-2xl font-bold text-discord-text">Sleek CRM</h1>
          <p className="text-sm text-discord-muted mt-1">Business Management</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navigation.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveModule(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeModule === item.id
                  ? 'bg-discord-blurple text-white'
                  : 'text-discord-muted hover:bg-discord-hover hover:text-discord-text'
                }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.name}</span>
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-discord-divider">
          <div className="flex items-center gap-3 px-4 py-3 bg-discord-element rounded-lg">
            <div className="w-10 h-10 rounded-full bg-discord-blurple flex items-center justify-center text-white font-bold">
              A
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-discord-text">Atul Kumar</p>
              <p className="text-xs text-discord-muted">Admin</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {renderModule()}
      </div>
    </div>
  );
}

export default App;
