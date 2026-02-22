# Loan Approval Prediction System

A complete machine learning system for predicting loan approval decisions using logistic regression and random forest models, with AI-powered loan recommendations.

## 🎯 Project Overview

This project implements an end-to-end loan approval prediction system that helps financial institutions make data-driven lending decisions. The system includes data preprocessing, model training, a REST API for real-time predictions, and AI-powered loan recommendations using a fine-tuned LLM model.

## 🏗️ Project Structure

```
loan_approval_predicter/
├── BACKEND/                    # Flask API for predictions
├── DATA PREPROCESSING AND MODEL TRAINING/  # Jupyter notebooks for ML pipeline
├── DATASET/                    # Raw data files and bank loans database
├── FRONTEND/                   # React frontend application
├── MODEL FILE/                 # Trained models and scalers
└── README.md                   # This file
```

## ✨ Features

- **Machine Learning Models**: Logistic Regression and Random Forest classifiers
- **AI-Powered Loan Recommendations**: Fine-tuned LLM model (loanexplorerV2) via Ollama
- **Data Preprocessing**: Feature scaling, encoding, and cleaning
- **REST API**: Flask-based API for real-time loan approval predictions
- **React Frontend**: Modern UI for loan prediction and exploration
- **Cross-platform Deployment**: Compatible with cloud platforms like Render, Heroku
- **CORS Support**: Frontend integration ready

## 🚀 Quick Start

### Prerequisites

- Python 3.11+
- pip
- Git

### Local Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/AdhiNarayan206/loan_approval_predicter.git
   cd loan_approval_predicter
   ```

2. **Set up the backend**
   ```bash
   cd BACKEND
   pip install -r requirements.txt
   python app.py
   ```

3. **Access the API**
   - API will be running at `http://localhost:5000`
   - Test endpoint: `GET http://localhost:5000/`
   - Prediction endpoint: `POST http://localhost:5000/predict`

## 📊 Model Performance

The system uses two trained models:
- **Logistic Regression**: Primary model for loan approval predictions
- **Random Forest**: Alternative model with ensemble learning
- **Feature Scaling**: StandardScaler for data normalization

## 🔌 API Usage

### Health Check

**GET** `/`

**Response:** `"Congratulations! Your LoanSense API is running."`

### Prediction Endpoint

**POST** `/predict`

**Request Body:**
```json
{
  "no_of_dependents": 2,
  "education": 1,
  "self_employed": 0,
  "income_annum": 9600000,
  "loan_amount": 29900000,
  "loan_term": 12,
  "cibil_score": 778,
  "residential_assets_value": 2400000,
  "commercial_assets_value": 17600000,
  "luxury_assets_value": 22700000,
  "bank_asset_value": 8000000,
  "loan_type": "Home Loan"
}
```

**Response:**
```json
{
  "prediction": "Approved",
  "confidence": 0.85
}
```

### AI Loan Recommendations 🤖

**POST** `/explore_loans`

Get personalized loan recommendations using a fine-tuned LLM model through Ollama.

**Prerequisites:**
- Ollama running (default: `http://localhost:11434`, configurable via `OLLAMA_URL`)
- Fine-tuned model `loanexplorerV2` loaded in Ollama

**Request Body:** Same as `/predict` endpoint

**Response:**
```json
{
  "loans": [
    {
      "bank_name": "State Bank of India",
      "loan_type": "Home Loan",
      "max_amount": "Up to Rs. 5 Crore",
      "repayment_time": "Up to 30 years",
      "interest_rate": "8.50% - 9.65%",
      "rating": 9.5,
      "reason": "Best match for your income level and CIBIL score.",
      "link": "https://www.sbi.co.in/home-loans"
    }
  ]
}
```

## 🌐 Deployment

### Render Deployment

1. Push your code to GitHub
2. Connect your GitHub repo to Render
3. Set environment variables:
   - `PYTHON_VERSION`: `3.11.0`
4. Deploy using the provided `Procfile`

### Environment Variables

- `PORT`: Server port (default: 5000, automatically set by hosting platforms)
- `OLLAMA_URL`: Ollama API URL (default: `http://localhost:11434`)
- `PYTHON_VERSION`: For specifying Python version on deployment

## 📁 Directory Details

- **[BACKEND/](./BACKEND/)**: Flask API server and deployment files
- **[DATA PREPROCESSING AND MODEL TRAINING/](./DATA%20PREPROCESSING%20AND%20MODEL%20TRAINING/)**: Jupyter notebooks for data analysis and model training
- **[DATASET/](./DATASET/)**: Raw loan approval dataset and bank loans database
- **[FRONTEND/](./FRONTEND/)**: React frontend application with Vite
- **[MODEL FILE/](./MODEL%20FILE/)**: Trained model files and preprocessing objects

## 🛠️ Technology Stack

- **Backend**: Flask, Gunicorn
- **Machine Learning**: scikit-learn, joblib
- **AI/LLM**: Ollama with fine-tuned loanexplorerV2 model
- **Data Processing**: pandas, numpy
- **Frontend**: React (Vite)
- **Frontend Integration**: Flask-CORS
- **Deployment**: Render, Heroku compatible

## 📈 Model Features

The model uses the following features for prediction:

1. **Personal Information**
   - Number of dependents
   - Education level
   - Employment status (self-employed or not)

2. **Financial Information**
   - Annual income
   - Loan amount requested
   - Loan term
   - CIBIL score

3. **Asset Values**
   - Residential assets value
   - Commercial assets value
   - Luxury assets value
   - Bank asset value

4. **Loan Preferences** (for AI recommendations)
   - Loan type (Home Loan, Car Loan, Personal Loan, etc.)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**AdhiNarayan206**
- GitHub: [@AdhiNarayan206](https://github.com/AdhiNarayan206)

## 🙏 Acknowledgments

- Dataset source and preprocessing techniques
- scikit-learn community for excellent ML tools
- Flask community for web framework support
- Ollama team for local LLM runtime

---

**Note**: This is a demonstration project for educational purposes. For production use in financial institutions, additional validation, security measures, and compliance checks would be required. The AI-powered loan recommendations (`/explore_loans` endpoint) require Ollama running locally with the fine-tuned model.