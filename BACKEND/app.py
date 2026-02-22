from flask import Flask, request, jsonify
import joblib
import numpy as np
import os
from flask_cors import CORS
import requests

app = Flask(__name__)
CORS(app)

# Build cross-platform paths relative to the current file
current_dir = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(current_dir, '..', 'MODEL FILE', 'loan_approval_model.joblib')
scaler_path = os.path.join(current_dir, '..', 'MODEL FILE', 'scaler.joblib')

# Load the saved model and scaler
model = joblib.load(model_path)
scaler = joblib.load(scaler_path)

# Ollama configuration (override via env var if running remotely)
OLLAMA_URL = os.environ.get('OLLAMA_URL', 'http://localhost:11434')

def _ollama_available() -> bool:
    try:
        r = requests.get(f"{OLLAMA_URL}/api/tags", timeout=3)
        return r.status_code == 200
    except Exception:
        return False

@app.route('/')
def hello():
    return "Congratulations! Your LoanSense API is running."

@app.route('/predict', methods=['POST'])
def check_eligibility():
    try:
        data= request.get_json(force=True)
        features = [
            data['no_of_dependents'],
            data['education'],
            data['self_employed'],
            data['income_annum'],
            data['loan_amount'],
            data['loan_term'],
            data['cibil_score'],
            data['residential_assets_value'],
            data['commercial_assets_value'],
            data['luxury_assets_value'],
            data['bank_asset_value']
        ]
        # Optional: loan_type is not required for prediction; use .get to avoid 400s when omitted
        loan_type = data.get('loan_type')
        final_features = np.array(features).reshape(1, -1)
        scaled_features = scaler.transform(final_features)
        prediction = model.predict(scaled_features)
        prediction_proba = model.predict_proba(scaled_features)
        output='Approved' if prediction[0]==1 else 'Rejected'
        confidence=prediction_proba[0][prediction[0]]
        return jsonify({'prediction': output, 'confidence': float(confidence)})
    except Exception as e:
        # Return error details to help debug bad inputs (e.g., missing/invalid fields)
        return jsonify({'error': 'Invalid input format', 'message': str(e)}), 400

@app.route('/explore_loans', methods=['POST'])
def explore_loans():
    try:
        import pandas as pd
        import json

        print("Received explore_loans request")  # Debug

        data = request.get_json(force=True)
        print(f"Request data: {data}")  # Debug

        # Load bank loans dataset
        csv_path = os.path.join(current_dir, '..', 'DATASET', 'bank_loans_rs_format.csv')
        print(f"CSV path: {csv_path}")  # Debug
        loans_df = pd.read_csv(csv_path)
        print(f"Loaded {len(loans_df)} loans")  # Debug

        # Filter loans by loan type if specified
        loan_type = data.get('loan_type', '')
        if loan_type:
            # Filter for matching loan types (case-insensitive partial match)
            filtered_loans = loans_df[loans_df['Type of Loan'].str.contains(loan_type, case=False, na=False)]
            if len(filtered_loans) > 0:
                loans_df = filtered_loans

        # Prepare user details for the LLM
        user_details = f"""
        Number of Dependents: {data['no_of_dependents']}
        Education: {'Graduate' if data['education'] == 1 else 'Not Graduate'}
        Self Employed: {'Yes' if data['self_employed'] == 1 else 'No'}
        Annual Income: Rs. {data['income_annum']:,}
        Loan Amount: Rs. {data['loan_amount']:,}
        Loan Term: {data['loan_term']} months
        CIBIL Score: {data['cibil_score']}
        Residential Assets Value: Rs. {data['residential_assets_value']:,}
        Commercial Assets Value: Rs. {data['commercial_assets_value']:,}
        Luxury Assets Value: Rs. {data['luxury_assets_value']:,}
        Bank Asset Value: Rs. {data['bank_asset_value']:,}
        Loan Type Needed: {loan_type}
        """

        # Convert loans dataframe to a list of dicts for easier processing
        loans_list = loans_df.to_dict(orient='records')

        # Prepare prompt for Ollama
        # Pass the loans as JSON so the LLM can use all fields
        loans_json = json.dumps(loans_list, ensure_ascii=False)
        prompt = f"""You are a financial advisor AI. Based on the user's financial profile and the available bank loans, recommend EXACTLY 5 most suitable loans with a rating out of 10 for each.

USER FINANCIAL PROFILE:
{user_details}

AVAILABLE BANK LOANS (JSON):
{loans_json}

CRITICAL INSTRUCTIONS:
1. You MUST return EXACTLY 5 loans - no more, no less
2. The user specifically needs: "{loan_type}" - ONLY recommend loans matching this type
3. Analyze the user's income ({data['income_annum']:,}), CIBIL score ({data['cibil_score']}), and assets
4. Select the 5 most suitable "{loan_type}" loans from the available options
5. Rate each loan from 1-10 based on:
     - How well it matches the user's loan type requirement (MOST IMPORTANT)
     - Interest rates and repayment terms suitability
     - User's eligibility based on CIBIL score and income
     - Loan amount compatibility with user's request ({data['loan_amount']:,})
5. Provide a brief, specific reason for each recommendation
6. If the interest_rate field is 'See website', include a 'link' field in the output with the value from the corresponding 'Direct Link 1' field in the loan data. This allows the frontend to render 'See website' as a hyperlink.

IMPORTANT: Return ONLY a valid JSON object with this exact structure (no markdown, no code blocks, no extra text):
{{
    "loans": [
        {{
            "bank_name": "Bank Name",
            "loan_type": "Type of Loan",
            "max_amount": "Max Amount",
            "repayment_time": "Repayment Time",
            "interest_rate": "Interest Rate Info",
            "rating": 9.5,
            "reason": "Why this loan is suitable for the user",
            "link": "https://example.com"
        }}
    ]
}}"""

        # Call Ollama API
        # Check Ollama availability first for clearer error
        if not _ollama_available():
            return jsonify({'error': 'Ollama is not available', 'message': f'Cannot reach Ollama at {OLLAMA_URL}. Start it with "ollama serve" or set OLLAMA_URL.'}), 503

        print("Calling Ollama API...")  # Debug
        try:
            ollama_response = requests.post(
                f'{OLLAMA_URL}/api/generate',
                json={
                    'model': 'loanexplorerV2',
                    'prompt': prompt,
                    'stream': False,
                    'options': {
                        'temperature': 0.0,
                        'num_predict': 3072  # Increased further to ensure all 5 loans fit
                    }
                },
                timeout=150  # Increased timeout for longer generation
            )
            print(f"Ollama response status: {ollama_response.status_code}")  # Debug
            print(f"Ollama raw response: {ollama_response.text}")  # Debug
        except Exception as ollama_exc:
            print(f"Error calling Ollama: {ollama_exc}")
            import traceback
            traceback.print_exc()
            return jsonify({'error': 'Failed to connect to Ollama', 'message': str(ollama_exc)}), 500

        if ollama_response.status_code == 200:
            result = ollama_response.json()
            llm_response = result['response']

            # Try to parse the JSON response
            try:
                # Clean up the response (remove markdown code blocks if present)
                llm_response = llm_response.strip()
                if llm_response.startswith('```'):
                    llm_response = llm_response.split('```')[1]
                    if llm_response.startswith('json'):
                        llm_response = llm_response[4:]
                    llm_response = llm_response.strip()

                recommendations = json.loads(llm_response)
                return jsonify(recommendations)
            except json.JSONDecodeError:
                # If JSON parsing fails, return the raw response
                return jsonify({
                    'raw_response': llm_response,
                    'note': 'LLM response was not in valid JSON format'
                })
        else:
            return jsonify({'error': 'LLM service unavailable', 'status': ollama_response.status_code}), 503

    except Exception as e:
        print(f"Error in explore_loans: {str(e)}")  # Debug
        import traceback
        traceback.print_exc()  # Debug - print full stack trace
        return jsonify({'error': 'Failed to process request', 'message': str(e)}), 500

if __name__ == '__main__':
    
    port = int(os.environ.get('PORT', 5000))  # Use Render's PORT or default to 5000
    app.run(host='0.0.0.0', port=port, debug=False)
