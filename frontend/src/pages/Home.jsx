import React from 'react'
import Shop from '../components/buttons/Shop'
import ProductCard from '../components/cards/productCard'

const Home = () => {
    return (
        <div className='flex flex-col items-center w-full'>
            <div className="w-full max-w-[1200px] px-4 sm:px-6 md:px-8">
                <div
                    className="w-full h-[230px] sm:h-[400px] md:h-[500px] lg:h-[600px] 
                    mt-10 sm:mt-20 lg:mt-12 mb-8 lg:mb-14 rounded-lg bg-cover bg-center bg-no-repeat relative"
                    style={{
                        backgroundImage: "url('/src/assets/images/hero-image.png')"
                    }}
                >
                    <div className="absolute bottom-6 left-6 sm:bottom-12 sm:left-12 md:bottom-16 md:left-16 lg:bottom-20 lg:left-24">
                        <Shop />
                    </div>
                    <span className="absolute bottom-2 right-4 text-[10px] sm:text-xs text-gray-900 opacity-70">
                        @www.candidshutters.com
                    </span>
                </div>
            </div>
            
            <div className='w-full max-w-[1200px] mb-8 h-auto sm:h-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0 px-4 sm:px-6 md:px-8 py-4 sm:py-0'>
                <h2 className='heading text-2xl sm:text-4xl font-bold'>Our collection:</h2>
                <div className='w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0'>
                    <div className='flex w-max sm:w-auto'>
                        {['Kurta', 'Pajama', 'Indo-western', 'Sherwani', 'Lehenga'].map((item) => (
                            <button 
                                key={item} 
                                className='px-4 border-x border-gray-500 h-10 font-semibold whitespace-nowrap transition-colors duration-300 hover:bg-tertiary/80'
                            >
                                {item}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>        
    )
}

export default Home