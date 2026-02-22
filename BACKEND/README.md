# Backend API

Flask-based REST API for loan approval predictions using trained machine learning models and AI-powered loan recommendations.

## 🚀 Overview

This backend service provides a RESTful API for:
- **Loan Approval Predictions**: Real-time loan approval predictions using trained ML models
- **AI-Powered Loan Recommendations**: Personalized loan suggestions using a fine-tuned LLM model through Ollama

The service integrates a **fine-tuned LLM model (loanexplorerV2)** running through **Ollama** to provide intelligent loan recommendations based on user financial profiles and available bank loans.

## 📁 Files Structure

```
BACKEND/
├── app.py              # Main Flask application
├── requirements.txt    # Python dependencies
├── Procfile           # Deployment configuration for cloud platforms
└── README.md          # This documentation
```

## 🔧 Installation & Setup

### Local Development

1. **Navigate to the backend directory**
   ```bash
   cd BACKEND
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the application**
   ```bash
   python app.py
   ```

4. **Access the API**
   - Local URL: `http://localhost:5000`
   - Health check: `GET http://localhost:5000/`

### Dependencies

- **Flask 2.3.3**: Web framework
- **joblib 1.3.2**: Model loading and serialization
- **numpy 1.24.3**: Numerical computations
- **scikit-learn 1.5.1**: Machine learning library (compatible with trained models)
- **flask-cors 4.0.0**: Cross-Origin Resource Sharing support
- **gunicorn 21.2.0**: WSGI HTTP Server for production
- **setuptools 69.0.3**: Package setup utilities
- **pandas**: Data manipulation for loan dataset processing
- **requests**: HTTP library for Ollama API communication

### AI/LLM Requirements

- **Ollama**: Local LLM runtime (must be running on `http://localhost:11434`)
- **Fine-tuned Model**: Custom fine-tuned model `loanexplorerV2` for loan recommendations
  - The model is specifically trained to understand financial profiles and recommend suitable bank loans
  - Provides ratings and reasoning for each loan recommendation

## 🛠️ API Endpoints

### 1. Health Check

**GET** `/`

**Description**: Check if the API is running

**Response**:
```json
"Congratulations! Your LoanSense API is running."
```

### 2. Loan Approval Prediction

**POST** `/predict`

**Description**: Predict loan approval based on applicant data using machine learning model

**Request Headers**:
```
Content-Type: application/json
```

**Request Body**:
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

**Response** (Success):
```json
{
  "prediction": "Approved",
  "confidence": 0.8543
}
```

**Response** (Error):
```json
{
  "error": "Invalid input format",
  "message": "Detailed error description"
}
```

**Status Codes**:
- `200`: Successful prediction
- `400`: Invalid input format or missing data

### 3. AI-Powered Loan Exploration 🤖

**POST** `/explore_loans`

**Description**: Get personalized loan recommendations using a fine-tuned LLM model through Ollama. This endpoint analyzes the user's financial profile and matches it with available bank loans from the dataset, providing intelligent recommendations with ratings and reasoning.

**⚠️ Prerequisites**:
- Ollama must be running (default: `http://localhost:11434`, configurable via `OLLAMA_URL` env var)
- Fine-tuned model `loanexplorerV2` must be loaded in Ollama
- Bank loans dataset (`bank_loans_rs_format.csv`) must be present in `../DATASET/` directory

**Request Headers**:
```
Content-Type: application/json
```

**Request Body**:
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

**Response** (Success):
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
      "reason": "Best match for your income level and CIBIL score. Competitive interest rates and flexible repayment options.",
      "link": "https://www.sbi.co.in/web/personal-banking/loans/home-loans"
    },
    {
      "bank_name": "HDFC Bank",
      "loan_type": "Home Loan",
      "max_amount": "Up to Rs. 10 Crore",
      "repayment_time": "Up to 30 years",
      "interest_rate": "See website",
      "rating": 9.0,
      "reason": "Higher loan amount available with excellent reputation and customer service.",
      "link": "https://www.hdfcbank.com/personal/borrow/home-loan"
    }
  ]
}
```

**Response** (Error - Ollama unavailable):
```json
{
  "error": "Ollama is not available",
  "message": "Cannot reach Ollama at http://localhost:11434. Start it with 'ollama serve' or set OLLAMA_URL."
}
```

**Response** (Error - Ollama connection failure):
```json
{
  "error": "Failed to connect to Ollama",
  "message": "Connection refused"
}
```

**Response** (Error - LLM service issue):
```json
{
  "error": "LLM service unavailable",
  "status": 503
}
```

**Status Codes**:
- `200`: Successful recommendations
- `500`: Internal server error or Ollama connection failure
- `503`: LLM service unavailable

**How It Works**:
1. Receives user financial profile and loan type preference
2. Loads and filters bank loans dataset based on loan type
3. Constructs a detailed prompt with user details and available loans
4. Sends prompt to fine-tuned LLM model (`loanexplorerV2`) via Ollama API
5. LLM analyzes the data and returns top 5 most suitable loan recommendations
6. Each recommendation includes:
   - Bank name and loan type
   - Maximum loan amount and repayment time
   - Interest rate information
   - Rating (1-10) based on suitability
   - Personalized reason for recommendation
   - Direct link to the bank's loan page (if interest rate is "See website")

## 📊 Input Features

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `no_of_dependents` | Integer | Number of dependents | 2 |
| `education` | Integer | Education level (0: Graduate, 1: Not Graduate) | 1 |
| `self_employed` | Integer | Employment status (0: No, 1: Yes) | 0 |
| `income_annum` | Integer | Annual income in currency units | 9600000 |
| `loan_amount` | Integer | Requested loan amount | 29900000 |
| `loan_term` | Integer | Loan term in months | 12 |
| `cibil_score` | Integer | Credit score (300-850) | 778 |
| `residential_assets_value` | Integer | Value of residential assets | 2400000 |
| `commercial_assets_value` | Integer | Value of commercial assets | 17600000 |
| `luxury_assets_value` | Integer | Value of luxury assets | 22700000 |
| `bank_asset_value` | Integer | Value of bank assets | 8000000 |
| `loan_type` | String | Type of loan needed (e.g., "Home Loan", "Car Loan") | "Home Loan" |

## 🌐 Deployment

### ⚠️ Important Note for AI Features

The `/explore_loans` endpoint requires **Ollama running locally** with the fine-tuned `loanexplorerV2` model. This feature will **NOT work** in cloud deployments (Render, Heroku, etc.) without additional setup for remote Ollama access.

**Options for AI Features in Production**:
1. Host Ollama on a separate server and set `OLLAMA_URL` environment variable
2. Use a cloud-based LLM API (e.g., OpenAI, Anthropic) as an alternative
3. Keep AI features for local/development use only

### Render Deployment

1. **Prepare for deployment** (already configured):
   - `Procfile` specifies the start command
   - `requirements.txt` lists all dependencies
   - Cross-platform path handling in `app.py`

2. **Environment Configuration**:
   - Set `PYTHON_VERSION` to `3.11.0` in Render dashboard
   - The app uses `PORT` environment variable automatically

3. **Build Command**: `pip install -r requirements.txt`
4. **Start Command**: `gunicorn app:app`

**Note**: The basic `/predict` endpoint will work on Render. The `/explore_loans` endpoint requires local Ollama setup.

### Heroku Deployment

1. **Install Heroku CLI**
2. **Deploy commands**:
   ```bash
   heroku create your-app-name
   git push heroku main
   ```

### Local Testing with Gunicorn

```bash
gunicorn app:app
```

## 🔧 Configuration

### Environment Variables

- `PORT`: Port number (default: 5000)
- `OLLAMA_URL`: Ollama API URL (default: `http://localhost:11434`) - useful for remote Ollama servers
- `PYTHON_VERSION`: Python version for deployment platforms

### CORS Configuration

The API is configured to accept requests from any origin (`CORS(app)`) for development. For production, configure specific origins:

```python
CORS(app, origins=['https://your-frontend-domain.com'])
```

## 🧪 Testing

### Using curl

**Health Check**:
```bash
curl http://localhost:5000/
```

**Loan Approval Prediction**:
```bash
curl -X POST http://localhost:5000/predict \
  -H "Content-Type: application/json" \
  -d '{
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
  }'
```

**AI Loan Recommendations** (requires Ollama running):
```bash
curl -X POST http://localhost:5000/explore_loans \
  -H "Content-Type: application/json" \
  -d '{
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
  }'
```

### Using Python requests

**Loan Approval Prediction**:
```python
import requests

url = "http://localhost:5000/predict"
data = {
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

response = requests.post(url, json=data)
print(response.json())
```

**AI Loan Recommendations**:
```python
import requests

url = "http://localhost:5000/explore_loans"
data = {
    "no_of_dependents": 2,
    "education": 1,
    "self_employed": 0,
    "income_annum": 5000000,
    "loan_amount": 3000000,
    "loan_term": 240,
    "cibil_score": 750,
    "residential_assets_value": 1000000,
    "commercial_assets_value": 500000,
    "luxury_assets_value": 200000,
    "bank_asset_value": 300000,
    "loan_type": "Home Loan"
}

response = requests.post(url, json=data)
recommendations = response.json()

# Display recommendations
for loan in recommendations.get('loans', []):
    print(f"\n{loan['bank_name']} - {loan['loan_type']}")
    print(f"Rating: {loan['rating']}/10")
    print(f"Reason: {loan['reason']}")
```

## ⚠️ Important Notes

1. **Model Dependencies**: The API requires model files from `../MODEL FILE/` directory
2. **Dataset Dependencies**: The `/explore_loans` endpoint requires `bank_loans_rs_format.csv` in `../DATASET/` directory
3. **Ollama Setup**: The AI recommendation feature requires:
   - Ollama installed and running (default: `http://localhost:11434`, configurable via `OLLAMA_URL` env var)
   - Fine-tuned model `loanexplorerV2` loaded in Ollama
   - This is a **fine-tuned LLM model** specifically trained for loan recommendations
4. **scikit-learn Version**: Must match the version used for training (1.5.1)
5. **Error Handling**: All API endpoints include proper error handling and validation
6. **Security**: For production use, implement authentication and input validation
7. **Cloud Deployment**: AI features work only with local Ollama or remote Ollama server setup

## 🔍 Troubleshooting

### Common Issues

1. **FileNotFoundError for model files**:
   - Ensure `MODEL FILE` directory exists in parent directory
   - Check that `loan_approval_model.joblib` and `scaler.joblib` are present

2. **FileNotFoundError for dataset**:
   - Ensure `DATASET` directory exists with `bank_loans_rs_format.csv`
   - Required for `/explore_loans` endpoint

3. **Ollama connection errors**:
   - Verify Ollama is running: `curl http://localhost:11434/api/tags`
   - Check if `loanexplorerV2` model is loaded: `ollama list`
   - Start Ollama if not running: `ollama serve`
   - Load the model if needed: `ollama pull loanexplorerV2` (or load your fine-tuned model)
   - For remote Ollama: set `OLLAMA_URL` environment variable

4. **Import errors**:
   - Verify all requirements are installed: `pip install -r requirements.txt`
   - Check Python version compatibility
   - Install pandas and requests: `pip install pandas requests`

5. **CORS errors**:
   - Frontend requests might be blocked - verify CORS configuration
   - For specific domains, update CORS settings in `app.py`

6. **Port conflicts**:
   - Change the default port in `app.py` if 5000 is occupied
   - Use `PORT` environment variable

7. **AI recommendations not working**:
   - Check Ollama service status
   - Verify the fine-tuned model `loanexplorerV2` is loaded
   - Review Flask console for detailed error messages
   - Check if dataset CSV file is accessible

### Logs and Debugging

- Enable debug mode locally: Change `debug=False` to `debug=True` in `app.py`
- Check deployment logs on hosting platform
- Use print statements or logging for debugging predictions

## 📝 Development Notes

- The application automatically detects the PORT from environment variables
- Cross-platform file paths ensure compatibility with Windows and Linux
- Model loading happens at startup for better performance
- All routes include proper error handling and JSON responses
- **Fine-tuned LLM Integration**: The `loanexplorerV2` model is a custom fine-tuned language model running through Ollama, specifically trained to understand financial data and provide intelligent loan recommendations
- AI recommendations use temperature=0.0 for consistent, deterministic outputs
- The LLM is prompted with structured data to ensure JSON-formatted responses
- Timeout set to 150 seconds for LLM API calls to handle processing time
- `num_predict` set to 3072 tokens to ensure complete 5-loan recommendations

## 🤖 About the Fine-Tuned LLM Model

The `/explore_loans` endpoint uses **loanexplorerV2**, a fine-tuned language model that:
- Understands financial terminology and loan products
- Analyzes user financial profiles (income, CIBIL score, assets)
- Matches users with suitable loans from a curated bank dataset
- Provides ratings (1-10) and personalized reasoning for each recommendation
- Considers loan type preferences, interest rates, and eligibility criteria

**Model Features**:
- Trained on financial and loan-specific data
- Optimized for structured JSON output
- Provides consistent, reliable recommendations
- Runs locally via Ollama for privacy and control