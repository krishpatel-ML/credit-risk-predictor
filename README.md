# RiskLens: Credit Risk Predictor

A full-stack machine learning app that estimates the probability a loan applicant will default. A calibrated XGBoost model is served through a FastAPI backend and used by a clean web front-end.

<!-- Add a screenshot after saving it in the repo, e.g. screenshot.png -->
<!-- ![App screenshot](screenshot.png) -->

## Features

- Calibrated default probability, so scores can be read as real percentages
- Tuned decision threshold for a clear Low Risk or High Risk result
- REST API with automatic Swagger docs at `/docs`
- Responsive front-end with an animated risk gauge and one-click example applicants
- Input validation with Pydantic

## Tech stack

| Layer | Tools |
|---|---|
| Model | Python, scikit-learn, XGBoost, SHAP |
| Backend | FastAPI, Uvicorn, Pydantic, joblib |
| Frontend | HTML, CSS, JavaScript (no framework) |

## Dataset

Credit Risk Dataset (Kaggle), included as `credit_risk_dataset.csv`. The target is whether the applicant defaulted on the loan.

## Project structure

```
credit_loan_prediction/
├── main.py                            # FastAPI app, serves the API and the front-end
├── requirements.txt
├── credit_risk_dataset.csv            # dataset
├── credit_risk_model.pkl              # trained, calibrated model
├── best_threshold.pkl                 # tuned decision threshold
├── credit_loan_classification.ipynb   # data analysis, training and evaluation
├── .gitignore
├── README.md
└── static/
    ├── index.html
    ├── style.css
    └── script.js
```

## Getting started

**1. Clone the repository**

```bash
git clone https://github.com/krishpatel-ML/<repo-name>.git
cd <repo-name>
```

**2. Create and activate a virtual environment**

```bash
python -m venv .venv
# Windows
.venv\Scripts\activate
# macOS / Linux
source .venv/bin/activate
```

**3. Install dependencies**

```bash
python -m pip install -r requirements.txt
```

**4. Run the app**

```bash
uvicorn main:app --reload
```

Open http://127.0.0.1:8000 for the app and http://127.0.0.1:8000/docs for the API docs.

## API

`POST /predict`

Request:

```json
{
  "person_age": 28,
  "person_income": 40000,
  "person_home_ownership": "RENT",
  "person_emp_length": 3,
  "loan_intent": "PERSONAL",
  "loan_grade": "C",
  "loan_amnt": 12000,
  "loan_int_rate": 13.5,
  "loan_percent_income": 0.30,
  "cb_person_default_on_file": "N",
  "cb_person_cred_hist_length": 4
}
```

Response:

```json
{
  "default_probability": 0.0275,
  "default_prediction": 0,
  "threshold": 0.5,
  "Result": "Low Risk"
}
```

Allowed values for the text fields:

- `person_home_ownership`: `RENT`, `OWN`, `MORTGAGE`, `OTHER`
- `loan_intent`: `EDUCATION`, `MEDICAL`, `VENTURE`, `PERSONAL`, `DEBTCONSOLIDATION`, `HOMEIMPROVEMENT`
- `loan_grade`: `A` to `G`
- `cb_person_default_on_file`: `Y` or `N`

`loan_percent_income` is `loan_amnt / person_income`.

## How the model works

1. Numeric features are scaled and categorical features are one-hot encoded in a scikit-learn pipeline.
2. XGBoost is tuned with randomized cross-validation, with class weighting for the imbalanced target.
3. Probabilities are calibrated with sigmoid calibration (`CalibratedClassifierCV`).
4. The decision threshold is chosen on the precision-recall curve to maximize F1, using the calibrated model's probabilities.

Model results (replace with the values from your notebook):

| Metric | Value |
|---|---|
| ROC-AUC | _add value_ |
| Precision | _add value_ |
| Recall | _add value_ |
| F1 | _add value_ |

## Troubleshooting

**`XGBoostError: input stream corrupted` when loading the model**
The model was saved with a different XGBoost version, or the `.pkl` file is damaged. Train and serve in the same virtual environment, and keep `scikit-learn` and `xgboost` versions the same in both places.

**`Object of type float32 is not JSON serializable` or a 500 error on `/predict`**
Convert numpy values with `float()` before returning them. The included `main.py` already does this.

**404 at `/`**
Check that the `static` folder exists next to `main.py` and that the `app.mount(...)` line is the last line in the file.

## Deployment

Any host that runs Python web apps works (Render, Railway, Fly.io). Use the start command `uvicorn main:app --host 0.0.0.0 --port $PORT`, and make sure both `.pkl` files are included.

## Possible improvements

- SHAP explanation of each prediction
- Dark and light theme toggle
- Docker image
- Model monitoring and automated tests

## Author

Krish Patel · [GitHub](https://github.com/krishpatel-ML) · [LinkedIn](https://www.linkedin.com/in/krish-patel-102024374)
