import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { mockCourtCases } from '../../data/mockData';
import Breadcrumb from '../../components/layout/Breadcrumb';
import { Link } from 'react-router-dom';
import { Scale, Users, FileText, Calendar, Bell, ChevronRight, Clock, AlertCircle } from 'lucide-react';

const CourtDashboard = () => {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [upcomingHearings] = useState([
    { ...mockCourtCases[0], hearingDate: 'Sept 10, 2026', time: '10:30 AM' },
    { ...mockCourtCases[1], hearingDate: 'Sept 12, 2026', time: '11:00 AM' },
    { ...mockCourtCases[2], hearingDate: 'Sept 15, 2026', time: '02:00 PM' }
  ]);

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: t('courtDashboard') || 'Court Dashboard', path: '/court' }]} />
      
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-navy mb-1">
            Welcome back, Honorable {user?.name || 'Judge'}
          </h1>
          <p className="text-charcoal/70">
            {t('overviewText') || 'Here is the overview of your court docket today.'}
          </p>
        </div>
        <div className="hidden sm:block text-right">
          <p className="text-sm text-charcoal/60">Current Date</p>
          <p className="font-semibold text-charcoal">September 4, 2026</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-navy hover:-translate-y-1 transition-all duration-300">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-charcoal/60">Cases on Docket</p>
              <h3 className="text-2xl font-bold text-navy mt-1">3</h3>
            </div>
            <div className="bg-navy-50 p-2 rounded-lg text-navy">
              <Scale size={20} />
            </div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-saffron hover:-translate-y-1 transition-all duration-300">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-charcoal/60">Next Hearing</p>
              <h3 className="text-xl font-bold text-saffron mt-1">Sept 10</h3>
            </div>
            <div className="bg-saffron-50 p-2 rounded-lg text-saffron">
              <Calendar size={20} />
            </div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-alert hover:-translate-y-1 transition-all duration-300">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-charcoal/60">Pending Orders</p>
              <h3 className="text-2xl font-bold text-alert mt-1">2</h3>
            </div>
            <div className="bg-red-50 p-2 rounded-lg text-alert">
              <AlertCircle size={20} />
            </div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-forest hover:-translate-y-1 transition-all duration-300">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-charcoal/60">Active Cases</p>
              <h3 className="text-2xl font-bold text-forest mt-1">2</h3>
            </div>
            <div className="bg-green-50 p-2 rounded-lg text-forest">
              <FileText size={20} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-navy">Upcoming Hearings</h2>
            <Link to="/court/proceedings" className="text-sm font-medium text-navy hover:text-navy-700 flex items-center">
              View Calendar <ChevronRight size={16} />
            </Link>
          </div>
          
          <div className="space-y-4">
            {upcomingHearings.map((hearing, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-cream rounded-lg border border-gray-100 hover:border-gray-300 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="bg-white border border-gray-200 p-2 rounded-lg flex flex-col items-center justify-center min-w-[70px]">
                    <span className="text-xs text-charcoal/60 font-semibold">{hearing.hearingDate?.split(' ')[0] || 'Sept'}</span>
                    <span className="text-lg font-bold text-navy">{hearing.hearingDate?.split(' ')[1]?.replace(',', '') || '10'}</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-charcoal">{hearing.title}</h4>
                    <p className="text-sm text-charcoal/70 flex items-center gap-1 mt-1">
                      <Clock size={14} /> {hearing.time} • {hearing.type || hearing.category}
                    </p>
                  </div>
                </div>
                <div className="mt-3 sm:mt-0 flex items-center gap-3">
                  <span className="inline-block px-3 py-1 bg-navy-50 text-navy text-xs font-medium rounded-full">
                    {hearing.id}
                  </span>
                  <Link 
                    to={`/court/cases/${hearing.id || hearing.caseId}`} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-navy hover:text-navy-700 bg-white border border-navy-100 px-3 py-1.5 rounded-lg hover:bg-navy-50 transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-navy mb-6">Quick Links</h2>
          
          <div className="space-y-3">
            <Link to="/court/documents" className="flex items-center gap-3 p-4 rounded-lg bg-cream hover:bg-navy-50 text-charcoal hover:text-navy transition-colors group">
              <div className="bg-white p-2 rounded-md shadow-sm group-hover:bg-navy group-hover:text-white transition-colors">
                <FileText size={18} />
              </div>
              <span className="font-medium">View Documents</span>
            </Link>
            
            <Link to="/court/proceedings" className="flex items-center gap-3 p-4 rounded-lg bg-cream hover:bg-navy-50 text-charcoal hover:text-navy transition-colors group">
              <div className="bg-white p-2 rounded-md shadow-sm group-hover:bg-navy group-hover:text-white transition-colors">
                <Calendar size={18} />
              </div>
              <span className="font-medium">Proceedings & Calendar</span>
            </Link>
            
            <Link to="/court/alerts" className="flex items-center gap-3 p-4 rounded-lg bg-cream hover:bg-navy-50 text-charcoal hover:text-navy transition-colors group">
              <div className="bg-white p-2 rounded-md shadow-sm group-hover:bg-navy group-hover:text-white transition-colors">
                <Bell size={18} />
              </div>
              <span className="font-medium">Alert Settings</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourtDashboard;
