import { Link } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
  return (
    <div className="home-page">
      <div className="home-container">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-content">

            <h1 className="hero-title">
              Smart Decisions<br />Better Loans
            </h1>
            <p className="hero-subtitle">
              Get instant loan eligibility predictions using advanced machine learning algorithms
            </p>
            <div className="hero-buttons">
              <Link to="/predictor" className="cta-button primary">
                <i className="fas fa-rocket"></i>
                Get Started
              </Link>
              <a href="https://github.com/AdhiNarayan206/loan_approval_predicter" 
                 target="_blank" 
                 rel="noopener noreferrer" 
                 className="cta-button secondary">
                <i className="fab fa-github"></i>
                View on GitHub
              </a>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="features-section">
          <h2 className="section-title">Why Choose Our Predictor?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-brain"></i>
              </div>
              <h3>AI-Powered</h3>
              <p>Advanced machine learning algorithms trained on real-world data for accurate predictions</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-bolt"></i>
              </div>
              <h3>Instant Results</h3>
              <p>Get loan approval predictions in seconds with confidence scores</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-shield-alt"></i>
              </div>
              <h3>Secure & Private</h3>
              <p>Your data is processed securely and never stored on our servers</p>
            </div>
     
          </div>
        </section>

        {/* How It Works Section */}
        <section className="how-it-works">
          <h2 className="section-title">How It Works</h2>
          <div className="steps-container">
            <div className="step">
              <div className="step-number">1</div>
              <h3>Fill the Form</h3>
              <p>Enter your personal, financial, and asset information</p>
            </div>
            <div className="step-arrow">
              <i className="fas fa-arrow-right"></i>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <h3>AI Analysis</h3>
              <p>Our ML model analyzes your data instantly</p>
            </div>
            <div className="step-arrow">
              <i className="fas fa-arrow-right"></i>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <h3>Get Results</h3>
              <p>View your loan approval prediction with confidence score</p>
            </div>
            <div className="step-arrow">
              <i className="fas fa-arrow-right"></i>
            </div>
            <div className="step">
              <div className="step-number">4</div>
              <h3>Explore Loans</h3>
              <p>AI finds your perfect match from thousands of loan options</p>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="stats-section">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">95%</div>
              <div className="stat-label">Accuracy Rate</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">&lt;2s</div>
              <div className="stat-label">Average Response Time</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">12</div>
              <div className="stat-label">Data Points Analyzed</div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section">
          <h2>Ready to Check Your Eligibility?</h2>
          <p>Start your loan approval prediction in just a few clicks</p>
          <Link to="/predictor" className="cta-button primary large">
            <i className="fas fa-calculator"></i>
            Try Now - It's Free
          </Link>
        </section>

        {/* Footer */}
        <footer className="home-footer">
          <p>&copy; 2025 Loan Approval Predictor. Built with Machine Learning & Flask API.</p>
        </footer>
      </div>
    </div>
  );
};

export default HomePage;
