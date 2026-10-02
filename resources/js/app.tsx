import {createInertiaApp} from '@inertiajs/react';
import {ConfigProvider, theme as antdTheme} from 'antd';
import {type PropsWithChildren} from 'react';
import {Toaster} from '@/components/ui/sonner';
import {TooltipProvider} from '@/components/ui/tooltip';
import {initializeTheme, useAppearance} from '@/hooks/use-appearance';
import AppLayout from '@/layouts/app-layout';
import AuthLayout from '@/layouts/auth-layout';
import SettingsLayout from '@/layouts/settings/layout';
import BackofficeLayout from '@/layouts/backoffice/layout';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

function AntdThemeProvider({children}: PropsWithChildren) {
    const {resolvedAppearance} = useAppearance();

    return <ConfigProvider theme={{
        algorithm: resolvedAppearance === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        token: {borderRadius: 10, colorPrimary: '#18181b'}
    }}>{children}</ConfigProvider>;
}

void createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    layout: (name) => {
        switch (true) {
            case name === 'welcome':
                return null;
            case name.startsWith('backoffice/'):
                return BackofficeLayout;
            case name.startsWith('auth/'):
                return AuthLayout;
            case name.startsWith('settings/'):
                return [AppLayout, SettingsLayout];
            default:
                return AppLayout;
        }
    },
    strictMode: true,
    withApp(app) {
        return (
            <TooltipProvider delayDuration={0}>
                <AntdThemeProvider>{app}</AntdThemeProvider>
                <Toaster />
            </TooltipProvider>
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();
