import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center">
            <h1 className="text-4xl font-bold mb-4">404</h1>
            <p className="text-xl mb-8">Page not found</p>
            <Link 
                to="/" 
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
                Go Home
            </Link>
        </div>
    );
};

export default NotFound;