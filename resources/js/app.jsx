import '../css/app.css';
import './bootstrap';

import { createInertiaApp, router } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import React, { useState, useEffect } from 'react';
import LoadingScreen from './Components/LoadingScreen';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob('./Pages/**/*.jsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        const AppWrapper = () => {
            const [loading, setLoading] = useState(false);

            useEffect(() => {
                let timeout = null;

                const start = () => {
                    // Slight delay to avoid flashing on very fast loads
                    timeout = setTimeout(() => setLoading(true), 250);
                };

                const end = () => {
                    if (timeout) clearTimeout(timeout);
                    setLoading(false);
                };

                router.on('start', start);
                router.on('finish', end);
                router.on('error', end); // Handle errors too

                return () => {
                    router.off('start', start);
                    router.off('finish', end);
                    router.off('error', end);
                };
            }, []);

            return (
                <>
                    {loading && <LoadingScreen />}
                    <App {...props} />
                </>
            );
        };

        root.render(<AppWrapper />);
    },
    progress: {
        color: '#4B5563',
    },
});
