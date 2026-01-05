'use client';

export default function DashboardTemplate({ children }: { children: React.ReactNode }) {
    return (
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
            {children}
        </div>
    );
}
