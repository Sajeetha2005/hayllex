from flask import Flask, render_template, request
import joblib
import pandas as pd
from model import all_symptoms_list  # Import symptom list

app = Flask(__name__)

# ✅ Load model and expected column names
model, expected_columns = joblib.load('random_forest_model.pkl')

# ✅ Function to handle blood sugar parsing
def parse_blood_sugar(value):
    try:
        if '-' in value:
            low, high = map(int, value.split('-'))
            return (low + high) / 2
        elif value.startswith('<'):
            return float(value[1:]) - 1
        elif value.startswith('>'):
            return float(value[1:]) + 1
        return float(value)
    except Exception:
        return 0.0

# ✅ Preprocess user input into model-ready DataFrame
def preprocess_input(raw_input, expected_columns):
    df = pd.DataFrame([raw_input])
    df = pd.get_dummies(df)

    # Ensure all expected columns exist
    for col in expected_columns:
        if col not in df.columns:
            df[col] = 0

    df = df[expected_columns]
    return df

@app.route('/')
def welcome():
    return render_template('perumale.html')

@app.route('/questions')
def questions():
    return render_template('questions.html')

@app.route('/predict', methods=['POST'])
def predict():
    print("✅ Received POST /predict")

    try:
        form_data = request.form.to_dict()
        print("Form data:", form_data)

        # ✅ Get selected symptoms
        symptoms_selected = request.form.getlist('symptoms[]')
        print("Symptoms selected:", symptoms_selected)

        # ✅ Create binary symptom vector
        symptom_vector = {symptom: 1 if symptom in symptoms_selected else 0 for symptom in all_symptoms_list}

        # ✅ Core features
        input_data = {
            'age': int(form_data.get('age', 0)),
            'gender': form_data.get('gender', ''),
            'alcohol': form_data.get('alcohol', ''),
            'smoker': form_data.get('smoker', ''),
            'blood_sugar': parse_blood_sugar(form_data.get('blood_sugar', '0')),
            'bp_range': form_data.get('bp_range', '')
        }

        # ✅ Merge symptoms
        input_data.update(symptom_vector)

        # ✅ Preprocess and predict
        input_df = preprocess_input(input_data, expected_columns)

        print("✅ Final input to model:\n", input_df.head())

        prediction = model.predict(input_df)[0]
        print("✅ Prediction result:", prediction)

        return render_template('dashboard.html', prediction=prediction)

    except Exception as e:
        print("❌ ERROR:", e)
        return "Something went wrong while processing your request.", 500

if __name__ == '__main__':
    app.run(debug=True)

