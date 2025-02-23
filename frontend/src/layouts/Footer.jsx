import React from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Icon } from 'leaflet';

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-shadow.png',
});

const Footer = () => {
  const position = [26.1044, 87.9496];

  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:py-16 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="mb-8 md:mb-0">
            <h3 className="text-xl font-bold mb-4">Amayra Ethnic Collection</h3>
            <p className="text-gray-400">Your destination for authentic ethnic wear and traditional fashion.</p>
            <img src='/logo.svg'></img>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="/shop" className="hover:text-white transition-colors">Shop</a></li>
              <li><a href="/men" className="hover:text-white transition-colors">Men</a></li>
              <li><a href="/women" className="hover:text-white transition-colors">Women</a></li>
              <li><a href="/kids" className="hover:text-white transition-colors">Kids</a></li>
              <li><a href="/contact" className="hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Information</h4>
            <ul className="space-y-2 text-gray-400 mb-4">
              <li className="flex items-center">
                <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                </svg>
                <span>aecethnic@gmail.com</span>
              </li>
              <li className="flex items-center">
                <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                </svg>
                <span>+91 88024 86365</span>
              </li>
              <li className="flex items-center">
                <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                </svg>
                <span>Churipatti Rd, Kishanganj, Bihar, India</span>
              </li>
            </ul>
            <div className="z-10 mt-4" style={{ height: '200px' }}>
              <MapContainer 
                center={position} 
                zoom={13} 
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <Marker position={position} />
              </MapContainer>
            </div>
          </div>
        </div>
        
        <div className="mt-8 border-t border-gray-700 pt-8">
          <p className="text-gray-400 text-sm text-center">
            © {new Date().getFullYear()} Amayra Ethnic Collection. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;