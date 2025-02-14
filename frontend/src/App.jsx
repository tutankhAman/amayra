import { useState } from 'react'
import Navbar from './layouts/Navbar'
import Footer from './layouts/Footer'

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {/* Your routes/content here */}
      </main>
      <Footer />
    </div>
  );
}

export default App
