import { Outlet, Navigate } from 'react-router-dom';
import DashboardSidebar from '../components/DashboardSidebar';

export default function Dashboard() {
    const token = localStorage.getItem('aegis_token');

    // Protect the dashboard
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="flex min-h-screen bg-aegis-bg text-white">
            <DashboardSidebar />
            <main className="flex-1 p-8 lg:p-12 overflow-y-auto relative">
                {/* Background Decor */}
                <div className="absolute top-[-10%] right-[-10%] w-[30%] h-[50%] bg-aegis-accent/5 rounded-full blur-[150px] pointer-events-none" />
                <div className="max-w-6xl mx-auto relative z-10 w-full">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
