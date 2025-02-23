import { motion } from 'framer-motion';

const OrderSkeleton = () => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="h-6 w-32 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 w-24 bg-gray-200 rounded"></div>
          </div>
          <div className="h-6 w-24 bg-gray-200 rounded"></div>
        </div>
        
        <div className="space-y-4">
          {[1, 2].map((item) => (
            <div key={item} className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-gray-200 rounded"></div>
              <div className="flex-1">
                <div className="h-5 w-3/4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 w-1/2 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 w-1/4 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
              <div className="h-6 w-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSkeleton;
