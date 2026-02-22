import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoanPredictorPage from './pages/LoanPredictorPage';
import Silk from './components/Silk';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        {/* Silk animated background */}
        <div className="silk-background">
          <Silk 
            speed={8} 
            scale={1.2} 
            color="#323333ff" 
            noiseIntensity={0.1} 
            rotation={50} 
          />
        </div>

        <nav className="navbar">
          <div className="nav-container">
            <Link to="/" className="nav-logo">
              <img src="/logo.jpeg" alt="LoanSense Logo" className="nav-logo-img" />
              <h5 className='logoname'>LOANSENSE</h5>
            </Link>
            <ul className="nav-menu">
              <li className="nav-item">
                <Link to="/" className="nav-link">
                  <i className="fas fa-home"></i> HOME
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/predictor" className="nav-link">
                  <i className="fas fa-calculator"></i> LOAN PREDICTOR
                </Link>
              </li>
            </ul>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/predictor" element={<LoanPredictorPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
