import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Services from './components/Services';
import Team from './components/Team';
import Gallery from './components/Gallery';
import Feedback from './components/Feedback';
import Offers from './components/Offers';
import Footer from './components/Footer';

function App() {
  return (
    <div className="app-wrapper">
      <Navbar />
      <main>
        <Hero />
        <About />
        <Services />
        <Team />
        <Gallery />
        <Feedback />
        <Offers />
      </main>
      <Footer />
    </div>
  );
}

export default App;
