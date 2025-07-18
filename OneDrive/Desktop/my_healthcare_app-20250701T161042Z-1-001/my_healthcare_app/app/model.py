import pandas as pd

# All possible symptoms list (this should match your model's feature names)
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

def load_model():
    import joblib
    return joblib.load('random_forest_model.pkl')  # Load your trained model

def make_prediction(model, data):
    # Extract the form data
    symptoms = data.get('symptoms', [])
    
    # Convert the symptoms list into a vector of 1s (present) and 0s (not present)
    symptoms_vector = [1 if symptom in symptoms else 0 for symptom in all_symptoms_list]
    
    # Map the form data to the model input format
    input_data = {
        'age': data['age'],
        'gender': 1 if data['gender'] == 'male' else 0,  # Convert gender to numeric (male = 1, female = 0)
        'alcohol': 1 if data['alcohol'] == 'yes' else 0,  # Example of encoding categorical values
        'smoker': 1 if data['smoker'] == 'yes' else 0,
        'blood_sugar': data['blood_sugar'],
        'bp_range': data['bp_range'],
        'allergies': data['allergies'],  # Include any additional form data here
        'medications': data['medications'],
        'surgical_history': data['surgical_history'],
        'family_history': data['family_history'],
        'menstrual': data.get('menstrual', ''),  # Optional field
        'diet': data.get('diet', ''),  # Optional field
        'exercise': data.get('exercise', ''),  # Optional field
        'sleep': data.get('sleep', ''),  # Optional field
        'stress': data.get('stress', '')  # Optional field
    }

    # Merge the numerical and symptom data
    input_data.update(dict(zip(all_symptoms_list, symptoms_vector)))
    
    # Convert to DataFrame for model prediction
    df = pd.DataFrame([input_data])
    
    # Make prediction
    prediction = model.predict(df)[0]  # Return the prediction (assuming single prediction)
    return prediction



