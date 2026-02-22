import { useState } from 'react';
import './LoanPredictorPage.css';

const LoanPredictorPage = () => {
  // Helper: normalize LLM loan objects to consistent keys and trimmed values
  const normalizeLoan = (raw) => {
    const pick = (...keys) => {
      for (const k of keys) {
        const v = raw?.[k];
        if (v !== undefined && v !== null) {
          const s = typeof v === 'string' ? v.trim() : v;
          if (typeof s === 'string') {
            if (s.length > 0) return s; // non-empty after trim
          } else {
            return s;
          }
        }
      }
      return undefined;
    };

    const ratingVal = pick('rating', 'score', 'rank');
    let rating = typeof ratingVal === 'number' ? ratingVal : parseFloat(ratingVal);
    if (!Number.isFinite(rating)) rating = undefined;
    if (Number.isFinite(rating)) rating = Math.max(0, Math.min(10, rating));

    const loan = {
      bank_name: pick('bank_name', 'bank', 'bankName', 'name') || 'Bank',
      loan_type: pick('loan_type', 'type', 'loanType'),
      max_amount: pick('max_amount', 'maximum_amount', 'amount', 'maxAmount'),
      repayment_time: pick('repayment_time', 'repayment', 'tenure', 'duration', 'repaymentTime'),
      interest_rate: pick('interest_rate', 'interest', 'interestRate'),
      reason: pick('reason', 'why', 'notes', 'rationale'),
      link: pick('link', 'url', 'website'),
      rating,
    };

    // If interest_rate says See website and we have no link text, keep it as-is; renderer handles link
    return loan;
  };
  const [formData, setFormData] = useState({
    no_of_dependents: '',
    education: '',
    self_employed: '',
    loan_type: 'Home Loan',
    income_annum: '',
    loan_amount: '',
    loan_term: '',
    cibil_score: '',
    residential_assets_value: '',
    commercial_assets_value: '',
    luxury_assets_value: '',
    bank_asset_value: ''
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [lastPayload, setLastPayload] = useState(null);

  // Explore loans state
  const [exploreLoading, setExploreLoading] = useState(false);
  const [exploreError, setExploreError] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [showRecommendations, setShowRecommendations] = useState(false);

  const API_BASE_URL = 'http://localhost:5000';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setShowResult(false);
    setShowRecommendations(false);
    setRecommendations(null);

    try {
      const dataToSend = {
        ...formData,
        education: parseInt(formData.education),
        self_employed: parseInt(formData.self_employed),
        no_of_dependents: parseInt(formData.no_of_dependents),
        loan_term: parseInt(formData.loan_term),
        cibil_score: parseInt(formData.cibil_score),
        income_annum: parseFloat(formData.income_annum),
        loan_amount: parseFloat(formData.loan_amount),
        residential_assets_value: parseFloat(formData.residential_assets_value),
        commercial_assets_value: parseFloat(formData.commercial_assets_value),
        luxury_assets_value: parseFloat(formData.luxury_assets_value),
        bank_asset_value: parseFloat(formData.bank_asset_value)
      };

      // Validate numeric fields are finite numbers (avoid NaN -> null in JSON)
      const numericKeys = [
        'education',
        'self_employed',
        'no_of_dependents',
        'loan_term',
        'cibil_score',
        'income_annum',
        'loan_amount',
        'residential_assets_value',
        'commercial_assets_value',
        'luxury_assets_value',
        'bank_asset_value'
      ];
      const invalidFields = numericKeys.filter(
        (k) => typeof dataToSend[k] !== 'number' || !Number.isFinite(dataToSend[k])
      );

      if (invalidFields.length > 0) {
        setError(`Please fill all fields with valid numbers. Invalid: ${invalidFields.join(', ')}`);
        setLoading(false);
        return;
      }

      // Debug logs to help troubleshoot
      console.log('Submitting to API:', `${API_BASE_URL}/predict`);
      console.log('Payload:', dataToSend);

      // Cache payload for explore loans use
      setLastPayload(dataToSend);

      const response = await fetch(`${API_BASE_URL}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(dataToSend)
      });

      if (!response.ok) {
        // Try to parse error from backend
        let errMsg = 'Failed to get prediction';
        try {
          const errData = await response.json();
          if (errData?.message) errMsg = errData.message;
        } catch (_) {
          // ignore JSON parse errors
        }
        console.error('API error status:', response.status, errMsg);
        throw new Error(errMsg);
      }

      const data = await response.json();
      console.log('API success:', data);
      setResult(data);
      setShowResult(true);
    } catch (err) {
      setError(err.message || 'An error occurred while processing your request');
    } finally {
      setLoading(false);
    }
  };

  const handleExploreLoans = async () => {
    setExploreLoading(true);
    setExploreError(null);
    setShowRecommendations(false);
    setRecommendations(null);

    try {
      // Use last successful payload; fall back to building from formData
      const base = lastPayload ?? {
        ...formData,
        education: parseInt(formData.education),
        self_employed: parseInt(formData.self_employed),
        no_of_dependents: parseInt(formData.no_of_dependents),
        loan_term: parseInt(formData.loan_term),
        cibil_score: parseInt(formData.cibil_score),
        income_annum: parseFloat(formData.income_annum),
        loan_amount: parseFloat(formData.loan_amount),
        residential_assets_value: parseFloat(formData.residential_assets_value),
        commercial_assets_value: parseFloat(formData.commercial_assets_value),
        luxury_assets_value: parseFloat(formData.luxury_assets_value),
        bank_asset_value: parseFloat(formData.bank_asset_value)
      };

      // Include optional loan_type if user selected it
      const payload = { ...base };
      if (formData.loan_type) {
        payload.loan_type = formData.loan_type;
      }

      console.log('Exploring loans via:', `${API_BASE_URL}/explore_loans`);
      console.log('Explore payload:', payload);

      const response = await fetch(`${API_BASE_URL}/explore_loans`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        let errMsg = 'Failed to explore loans';
        try {
          const errData = await response.json();
          if (errData?.message) errMsg = errData.message;
        } catch (_) {}
        console.error('Explore API error:', response.status, errMsg);
        throw new Error(errMsg);
      }

      const data = await response.json();
      console.log('Explore API success:', data);

      // Data could be {loans: [...]} or {raw_response: '...'}
      if (data?.loans && Array.isArray(data.loans)) {
        const normalized = data.loans.map(normalizeLoan);
        setRecommendations(normalized);
      } else if (data?.raw_response) {
        // Try to parse raw_response if it's JSON-like; otherwise wrap
        try {
          const parsed = JSON.parse(data.raw_response);
          const normalized = (parsed.loans ?? []).map(normalizeLoan);
          setRecommendations(normalized);
        } catch {
          setRecommendations([]);
          setExploreError('Received unstructured response from AI. Please try again.');
        }
      } else {
        setRecommendations([]);
      }

      setShowRecommendations(true);
    } catch (err) {
      setExploreError(err.message || 'Failed to get loan recommendations');
    } finally {
      setExploreLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      no_of_dependents: '',
      education: '',
      self_employed: '',
      loan_type: 'Home Loan',
      income_annum: '',
      loan_amount: '',
      loan_term: '',
      cibil_score: '',
      residential_assets_value: '',
      commercial_assets_value: '',
      luxury_assets_value: '',
      bank_asset_value: ''
    });
    setResult(null);
    setShowResult(false);
    setError(null);
  };

  if (loading) {
    return (
      <div className="predictor-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Processing your application...</p>
        </div>
      </div>
    );
  }

  if (showResult && result) {
    const isApproved = result.prediction === 'Approved';
    const confidence = Math.round(result.confidence * 100);

    return (
      <div className="predictor-page">
        <div className="result-container">
          <div className={`result-icon ${isApproved ? 'approved' : 'rejected'}`}>
            <i className={isApproved ? 'fas fa-check-circle' : 'fas fa-times-circle'}></i>
          </div>
          <h2 className={`result-title ${isApproved ? 'approved' : 'rejected'}`}>
            {result.prediction}
          </h2>
          <p className="result-message">
            {isApproved 
              ? 'Congratulations! Your loan application has been approved based on the provided information.'
              : 'Unfortunately, your loan application does not meet the approval criteria at this time.'}
          </p>
          {formData.loan_type && (
            <div className="selected-loan-type" style={{ marginTop: 8 }}>
              <span className="badge" style={{ background: '#e3f2fd', color: '#1976d2', padding: '4px 10px', borderRadius: 12 }}>
                Selected Loan Type: {formData.loan_type}
              </span>
            </div>
          )}
          <div className="confidence-container">
            <span className="confidence-label">Confidence:</span>
            <div className="confidence-bar">
              <div className="confidence-fill" style={{ width: `${confidence}%` }}></div>
            </div>
            <span className="confidence-text">{confidence}%</span>
          </div>

          <div className="result-actions" style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '32px' }}>
            {isApproved && (
              <button 
                onClick={handleExploreLoans} 
                className="btn btn-primary" 
                disabled={exploreLoading}
                style={{ fontSize: '1.1rem', padding: '18px 36px', minWidth: '220px' }}
              >
                <i className="fas fa-search"></i> {exploreLoading ? 'Exploring...' : 'EXPLORE LOAN OPTIONS'}
              </button>
            )}
            <button 
              onClick={() => setShowResult(false)} 
              className="btn btn-secondary"
              style={{ minWidth: '180px' }}
            >
              <i className="fas fa-plus"></i> New Application
            </button>
          </div>

          {isApproved && showRecommendations && (
            <div className="explore-results" style={{ marginTop: '24px' }}>
              <h3>
                <i className="fas fa-list"></i> Recommended Loans
                {formData.loan_type && (
                  <span style={{ marginLeft: 8, fontSize: 14, color: '#555' }}>
                    for {formData.loan_type}
                  </span>
                )}
              </h3>
              {exploreError && (
                <div className="error-container" style={{ marginTop: '12px' }}>
                  <i className="fas fa-exclamation-triangle"></i>
                  <p>{exploreError}</p>
                </div>
              )}
              {!exploreError && (
                <div className="loan-cards" style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(2, 1fr)', 
                  gap: '24px', 
                  marginTop: '20px' 
                }}>
                  {(recommendations ?? []).map((loan, idx) => (
                    <div key={idx} className="loan-card" style={{ 
                      border: '2px solid rgba(255, 255, 255, 0.2)', 
                      borderRadius: 16, 
                      padding: 24, 
                      background: 'rgba(255, 255, 255, 0.05)',
                      backdropFilter: 'blur(10px)',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 12px 48px rgba(0, 0, 0, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.3)';
                    }}>
                      <div className="loan-card-header" style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        marginBottom: 16,
                        paddingBottom: 12,
                        borderBottom: '2px solid rgba(255, 255, 255, 0.1)'
                      }}>
                        <h4 style={{ 
                          margin: 0, 
                          fontSize: '1.3rem', 
                          fontWeight: 700,
                          color: '#fff',
                          textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
                        }}>
                          {loan.bank_name || 'Bank'}
                        </h4>
                        {typeof loan.rating === 'number' && (
                          <span className="loan-rating" style={{ 
                            background: 'linear-gradient(135deg, #ffffff 0%, #cccccc 100%)', 
                            color: '#08090A', 
                            borderRadius: 20, 
                            padding: '6px 14px', 
                            fontSize: 14,
                            fontWeight: 700,
                            boxShadow: '0 4px 12px rgba(255, 255, 255, 0.3)'
                          }}>
                            ⭐ {loan.rating}/10
                          </span>
                        )}
                      </div>
                      <div className="loan-card-body" style={{ 
                        marginTop: 12, 
                        fontSize: 15, 
                        lineHeight: 1.8,
                        color: 'rgba(255, 255, 255, 0.9)',
                        flex: 1
                      }}>
                        {loan.max_amount && (
                          <div style={{ marginBottom: 10 }}>
                            <strong style={{ color: '#fff', display: 'inline-block', minWidth: 120 }}>
                              💰 Max Amount:
                            </strong> 
                            <span style={{ color: '#4fc3f7', fontWeight: 600 }}>{loan.max_amount}</span>
                          </div>
                        )}
                        {loan.interest_rate && (
                          <div style={{ marginBottom: 10 }}>
                            <strong style={{ color: '#fff', display: 'inline-block', minWidth: 120 }}>
                              📊 Interest Rate:
                            </strong> 
                            {loan.interest_rate === 'See website' && loan.link ? (
                              <a href={loan.link} target="_blank" rel="noreferrer" style={{ 
                                color: '#4fc3f7', 
                                textDecoration: 'underline',
                                fontWeight: 600
                              }}>
                                See website →
                              </a>
                            ) : (
                              <span style={{ color: '#4fc3f7', fontWeight: 600 }}>{loan.interest_rate}</span>
                            )}
                          </div>
                        )}
                        {loan.repayment_time && (
                          <div style={{ marginBottom: 10 }}>
                            <strong style={{ color: '#fff', display: 'inline-block', minWidth: 120 }}>
                              ⏱️ Loan Period:
                            </strong> 
                            <span style={{ color: '#4fc3f7', fontWeight: 600 }}>{loan.repayment_time}</span>
                          </div>
                        )}
                        {loan.loan_type && (
                          <div style={{ marginBottom: 10 }}>
                            <strong style={{ color: '#fff', display: 'inline-block', minWidth: 120 }}>
                              🏷️ Loan Type:
                            </strong> 
                            <span style={{ color: 'rgba(255, 255, 255, 0.8)' }}>{loan.loan_type}</span>
                          </div>
                        )}
                        {loan.reason && (
                          <div style={{ 
                            marginTop: 16, 
                            paddingTop: 16,
                            borderTop: '1px solid rgba(255, 255, 255, 0.1)'
                          }}>
                            <strong style={{ color: '#fff', display: 'block', marginBottom: 6 }}>
                              💡 Why this loan:
                            </strong> 
                            <span style={{ 
                              color: 'rgba(255, 255, 255, 0.8)', 
                              fontStyle: 'italic',
                              fontSize: 14,
                              lineHeight: 1.6
                            }}>
                              {loan.reason}
                            </span>
                          </div>
                        )}
                      </div>
                      {loan.link && (
                        <div className="loan-card-actions" style={{ marginTop: 'auto', paddingTop: 20 }}>
                          <a 
                            className="btn btn-primary" 
                            href={loan.link} 
                            target="_blank" 
                            rel="noreferrer"
                            style={{ 
                              width: '100%', 
                              textAlign: 'center',
                              padding: '14px',
                              fontSize: '1rem',
                              fontWeight: 600,
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px'
                            }}
                          >
                            Visit Bank Website <i className="fas fa-external-link-alt"></i>
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                  {(!recommendations || recommendations.length === 0) && (
                    <p>No recommendations available. Please try again.</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="predictor-page">
        <div className="error-container">
          <i className="fas fa-exclamation-triangle"></i>
          <h3>Error Processing Request</h3>
          <p>{error}</p>
          <button onClick={() => setError(null)} className="btn btn-primary">
            <i className="fas fa-redo"></i> Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="predictor-page">
      <div className="predictor-container">
        <header className="predictor-header">
          <div className="header-icon">
            <i className="fas fa-calculator"></i>
          </div>
          <h1>LoanSense</h1>
          <p>Get instant loan eligibility predictions using advanced machine learning</p>
        </header>

        <main className="predictor-main">
          <form onSubmit={handleSubmit} className="loan-form">
            {/* Personal Information Section */}
            <div className="form-section">
              <h2><i className="fas fa-user"></i> Personal Information</h2>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="dependents">Number of Dependents</label>
                  <input
                    type="number"
                    id="dependents"
                    name="no_of_dependents"
                    value={formData.no_of_dependents}
                    onChange={handleChange}
                    min="0"
                    max="10"
                    required
                  />
                  <small>Number of family members dependent on you</small>
                </div>

                <div className="form-group">
                  <label htmlFor="education">Education Level</label>
                  <select
                    id="education"
                    name="education"
                    value={formData.education}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Education Level</option>
                    <option value="0">Not Graduate</option>
                    <option value="1">Graduate</option>
                  </select>
                  <small>Your highest education qualification</small>
                </div>

                <div className="form-group">
                  <label htmlFor="employment">Employment Type</label>
                  <select
                    id="employment"
                    name="self_employed"
                    value={formData.self_employed}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Employment Type</option>
                    <option value="0">Salaried</option>
                    <option value="1">Self Employed</option>
                  </select>
                  <small>Your current employment status</small>
                </div>

                <div className="form-group">
                  <label htmlFor="loanType">Loan Type (optional)</label>
                  <select
                    id="loanType"
                    name="loan_type"
                    value={formData.loan_type}
                    onChange={handleChange}
                  >
                    <option value="">Select Loan Type</option>
                    <option value="Home Loan">Home Loan</option>
                    <option value="Personal Loan">Personal Loan</option>
                    <option value="Education Loan">Education Loan</option>
                    <option value="Auto Loan">Auto Loan</option>
                    <option value="Business Loan">Business Loan</option>
                  </select>
                  <small>This helps tailor recommendations to your needs</small>
                </div>
              </div>
            </div>

            {/* Financial Information Section */}
            <div className="form-section">
              <h2><i className="fas fa-rupee-sign"></i> Financial Information</h2>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="income">Annual Income (₹)</label>
                  <input
                    type="number"
                    id="income"
                    name="income_annum"
                    value={formData.income_annum}
                    onChange={handleChange}
                    min="0"
                    step="1000"
                    required
                  />
                  <small>Your total annual income in rupees</small>
                </div>

                <div className="form-group">
                  <label htmlFor="loanAmount">Loan Amount (₹)</label>
                  <input
                    type="number"
                    id="loanAmount"
                    name="loan_amount"
                    value={formData.loan_amount}
                    onChange={handleChange}
                    min="0"
                    step="1000"
                    required
                  />
                  <small>The loan amount you are requesting</small>
                </div>

                <div className="form-group">
                  <label htmlFor="loanTerm">Loan Term (months)</label>
                  <input
                    type="number"
                    id="loanTerm"
                    name="loan_term"
                    value={formData.loan_term}
                    onChange={handleChange}
                    min="1"
                    max="480"
                    required
                  />
                  <small>Duration for loan repayment in months</small>
                </div>

                <div className="form-group">
                  <label htmlFor="cibilScore">CIBIL Score</label>
                  <input
                    type="number"
                    id="cibilScore"
                    name="cibil_score"
                    value={formData.cibil_score}
                    onChange={handleChange}
                    min="300"
                    max="900"
                    required
                  />
                  <small>Your credit score (300-900)</small>
                </div>
              </div>
            </div>

            {/* Asset Information Section */}
            <div className="form-section">
              <h2><i className="fas fa-home"></i> Asset Information</h2>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="residentialAssets">Residential Assets Value (₹)</label>
                  <input
                    type="number"
                    id="residentialAssets"
                    name="residential_assets_value"
                    value={formData.residential_assets_value}
                    onChange={handleChange}
                    min="0"
                    step="1000"
                    required
                  />
                  <small>Total value of your residential properties</small>
                </div>

                <div className="form-group">
                  <label htmlFor="commercialAssets">Commercial Assets Value (₹)</label>
                  <input
                    type="number"
                    id="commercialAssets"
                    name="commercial_assets_value"
                    value={formData.commercial_assets_value}
                    onChange={handleChange}
                    min="0"
                    step="1000"
                    required
                  />
                  <small>Total value of your commercial properties</small>
                </div>

                <div className="form-group">
                  <label htmlFor="luxuryAssets">Luxury Assets Value (₹)</label>
                  <input
                    type="number"
                    id="luxuryAssets"
                    name="luxury_assets_value"
                    value={formData.luxury_assets_value}
                    onChange={handleChange}
                    min="0"
                    step="1000"
                    required
                  />
                  <small>Value of luxury items (cars, jewelry, etc.)</small>
                </div>

                <div className="form-group">
                  <label htmlFor="bankAssets">Bank Assets Value (₹)</label>
                  <input
                    type="number"
                    id="bankAssets"
                    name="bank_asset_value"
                    value={formData.bank_asset_value}
                    onChange={handleChange}
                    min="0"
                    step="1000"
                    required
                  />
                  <small>Total value of your bank deposits and investments</small>
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button type="button" onClick={handleReset} className="btn btn-secondary">
                <i className="fas fa-undo"></i> Reset Form
              </button>
              <button type="submit" className="btn btn-primary">
                <i className="fas fa-calculator"></i> Check Eligibility
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
};

export default LoanPredictorPage;
