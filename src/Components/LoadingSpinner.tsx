import React from 'react';
import '../Styles/Spinner.css'

const LoadingSpinner: React.FC = () => {
    return (
        <div className="spinner-container">
            <div className="spinner"></div>
        </div>
    );
};

export default LoadingSpinner;
