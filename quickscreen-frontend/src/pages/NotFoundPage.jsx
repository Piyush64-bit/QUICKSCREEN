import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';

const NotFoundPage = () => {
    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-6">
            <div className="relative mb-8">
                <h1 className="text-[10rem] font-bold text-white/5 select-none leading-none">404</h1>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl font-mono text-primary bg-primary/10 px-4 py-2 rounded-full border border-primary/20">
                        PAGE_NOT_FOUND
                    </span>
                </div>
            </div>
            
            <p className="text-gray-500 mb-10 max-w-md text-lg font-light">
                The page you are looking for somewhere in the void. <br />
                Let's get you back on track.
            </p>
            
            <Link to="/">
                <Button size="lg" className="min-w-[200px]">Return Home</Button>
            </Link>
        </div>
    );
};

export default NotFoundPage;
