import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gradient-to-r from-gray-900 via-black to-gray-900 border-t border-gray-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="text-center">
          <div className="mb-2">
            <p className="text-gray-300 font-medium text-sm">
              Aatreyee Chatterjee
            </p>
          </div>
          <div className="text-gray-400 text-xs">
            © 2025 Aatreyee Chatterjee. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;