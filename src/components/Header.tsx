
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="py-6 mb-8">
      <div className="container px-4 mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-600">
          Anonymous Comment Hub
        </h1>
        <p className="text-center text-anonymous-text/80 mt-2 max-w-2xl mx-auto">
          Share your thoughts freely without revealing your identity. Be respectful and kind to others.
        </p>
      </div>
    </header>
  );
};

export default Header;
