import pandas as pd
from flask import Flask, render_template, request
import joblib

app = Flask(__name__)

# Load model and expected column order
model, expected_columns = joblib.load('random_forest_model.pkl')

# List of all symptoms used as features in the model
all_symptoms_list = [
    "itching", "skin_rash", "nodal_skin_eruptions", "continuous_sneezing", "shivering", "chills", 
    "joint_pain", "stomach_pain", "acidity", "ulcers_on_tongue", "muscle_wasting", "vomiting", 
    "burning_micturition", "spotting_urination", "fatigue", "weight_gain", "anxiety", "cold_hands_and_feets",
    "mood_swings", "weight_loss", "restlessness", "lethargy", "patches_in_throat", "irregular_sugar_level",
    "cough", "high_fever", "sunken_eyes", "breathlessness", "sweating", "dehydration", "indigestion",
    "headache", "yellowish_skin", "dark_urine", "nausea", "loss_of_appetite", "pain_behind_the_eyes",
    "back_pain", "constipation", "abdominal_pain", "diarrhoea", "mild_fever", "yellow_urine", 
    "yellowing_of_eyes", "acute_liver_failure", "fluid_overload", "swelling_of_stomach", "swelled_lymph_nodes",
    "malaise", "blurred_and_distorted_vision", "phlegm", "throat_irritation", "redness_of_eyes", 
    "sinus_pressure", "runny_nose", "congestion", "chest_pain", "weakness_in_limbs", "fast_heart_rate",
    "pain_during_bowel_movements", "pain_in_anal_region", "bloody_stool", "irritation_in_anus", "neck_pain",
    "dizziness", "cramps", "bruising", "obesity", "swollen_legs", "swollen_blood_vessels", "puffy_face_and_eyes",
    "enlarged_thyroid", "brittle_nails", "swollen_extremeties", "excessive_hunger", "extra_marital_contacts",
    "drying_and_tingling_lips", "slurred_speech", "knee_pain", "hip_joint_pain", "muscle_weakness", 
    "stiff_neck", "swelling_joints", "movement_stiffness", "spinning_movements", "loss_of_balance",
    "unsteadiness", "weakness_of_one_body_side", "loss_of_smell", "bladder_discomfort", 
    "foul_smell_of_urine", "continuous_feel_of_urine", "passage_of_gases", "internal_itching", 
    "toxic_look_(typhos)", "depression", "irritability", "muscle_pain", "altered_sensorium", "red_spots_over_body", 
    "belly_pain", "abnormal_menstruation", "dischromic_patches", "watering_from_eyes", "increased_appetite",
    "polyuria", "family_history", "mucoid_sputum", "rusty_sputum", "lack_of_concentration", 
    "visual_disturbances", "receiving_blood_transfusion", "receiving_unsterile_injections", "coma", 
    "stomach_bleeding", "distention_of_abdomen", "history_of_alcohol_consumption", "fluid_overload", 
    "blood_in_sputum", "prominent_veins_on_calf", "palpitations", "painful_walking", "pus_filled_pimples",
    "blackheads", "scurring", "skin_peeling", "silver_like_dusting", "small_dents_in_nails", "inflammatory_nails",
    "blister", "red_sore_around_nose", "yellow_crust_ooze", "prognosis"
]

# Mapping for categorical BP ranges to numeric
bp_mapping = {
    'low': 0,
    'normal': 1,
    'prehypertension': 2,
    'stage1': 3,
    'stage2': 4
}

# Prediction logic
def make_prediction(model, data):
    symptoms = data.get('symptoms', [])
    symptoms_vector = [1 if symptom in symptoms else 0 for symptom in all_symptoms_list]

    input_data = {
        'age': data['age'],
        'gender': 1 if data['gender'] == 'male' else 0,
        'alcohol': 1 if data['alcohol'] == 'yes' else 0,
        'smoker': 1 if data['smoker'] == 'yes' else 0,
        'blood_sugar': data['blood_sugar'],
        'bp_range': bp_mapping.get(data['bp_range'].lower(), 1),
        'symptoms': [s.strip().lower().replace(" ", "_") for s in request.form.getlist('symptoms')] # Ensure proper formatting

    }

    input_data.update(dict(zip(all_symptoms_list, symptoms_vector)))
    df = pd.DataFrame([input_data])
    df = df.reindex(columns=expected_columns)
    prediction = model.predict(df)[0]

    return prediction

# Flask routes
@app.route('/', methods=['GET'])
def home():
    return render_template('perumale.html')

@app.route('/form', methods=['GET'])
def form():
    return render_template('questions.html')

@app.route('/predict', methods=['POST'])
def predict():
    form = request.form.to_dict()

    # Handling blood sugar conversion
    blood_sugar_raw = form.get('blood_sugar', '')
    if blood_sugar_raw == '<70':
        blood_sugar = 65
    elif blood_sugar_raw == '70-99':
        blood_sugar = 85
    elif blood_sugar_raw == '100-125':
        blood_sugar = 112
    elif blood_sugar_raw == '>126':
        blood_sugar = 140
    else:
        blood_sugar = 0

    data = {
        'age': int(form.get('age', 0)),
        'gender': form.get('gender', '').lower(),
        'alcohol': form.get('alcohol', '').lower(),
        'smoker': form.get('smoker', '').lower(),
        'blood_sugar': blood_sugar,
        'bp_range': form.get('bp_range', ''),
        'symptoms': [s.strip().lower().replace(" ", "_") for s in request.form.getlist('symptoms')]
    }

    prediction = make_prediction(model, data)

    # Generate health impression
    risk_factors = []
    if data['smoker'] == 'yes':
        risk_factors.append("Smoking")
    if data['alcohol'] == 'yes':
        risk_factors.append("Alcohol")
    if data['blood_sugar'] > 140:
        risk_factors.append("High Blood Sugar")
    if data['bp_range'].lower() in ['stage1', 'stage2']:
        risk_factors.append("High Blood Pressure")

    if risk_factors:
        impression = "Potential risk factors include: " + ", ".join(risk_factors)
    else:
        impression = "No major lifestyle risks detected."

    return render_template('dashboard.html', prediction=prediction, symptoms=data['symptoms'], impression=impression)

if __name__ == '__main__':
    app.run(debug=True)








