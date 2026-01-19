import React from 'react';
import AIChatWidget from '@site/src/components/AIChatWidget';

// Root component to wrap all pages with global components
export default function Root({ children }) {
    return (
        <>
            {children}
            <AIChatWidget />
        </>
    );
}
