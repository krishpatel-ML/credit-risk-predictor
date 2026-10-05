// Use "" when served by FastAPI. If you open index.html directly, set to "http://127.0.0.1:8000".
const API_BASE = "";

const $ = (id) => document.getElementById(id);
const FIELDS = ["person_age", "person_income", "person_home_ownership", "person_emp_length", "loan_intent",
  "loan_grade", "loan_amnt", "loan_int_rate", "loan_percent_income", "cb_person_default_on_file", "cb_person_cred_hist_length"];
const NUMBERS = ["person_age", "person_income", "person_emp_length", "loan_amnt", "loan_int_rate", "loan_percent_income", "cb_person_cred_hist_length"];

const SAMPLES = {
  low: { person_age: 35, person_income: 85000, person_home_ownership: "MORTGAGE", person_emp_length: 8, loan_intent: "EDUCATION", loan_grade: "A", loan_amnt: 8000, loan_int_rate: 7.5, cb_person_default_on_file: "N", cb_person_cred_hist_length: 10 },
  high: { person_age: 23, person_income: 22000, person_home_ownership: "RENT", person_emp_length: 1, loan_intent: "MEDICAL", loan_grade: "E", loan_amnt: 15000, loan_int_rate: 18.5, cb_person_default_on_file: "Y", cb_person_cred_hist_length: 2 },
};

function updateShare() {
  const income = parseFloat($("person_income").value), loan = parseFloat($("loan_amnt").value);
  $("loan_percent_income").value = income > 0 && loan >= 0 ? (loan / income).toFixed(2) : "";
}

function fillSample(name) {
  Object.entries(SAMPLES[name]).forEach(([k, v]) => ($(k).value = v));
  updateShare();
  $("result").hidden = true; $("error").hidden = true;
}

function showResult(data) {
  const pct = data.default_probability * 100, high = data.default_prediction === 1;
  const circ = 2 * Math.PI * 52;
  $("result").hidden = false;
  $("pct").textContent = pct.toFixed(1) + "%";
  const arc = $("arc");
  arc.style.stroke = high ? "var(--high)" : "var(--low)";
  arc.style.strokeDashoffset = circ;
  requestAnimationFrame(() => requestAnimationFrame(() => (arc.style.strokeDashoffset = circ * (1 - Math.min(data.default_probability, 1)))));
  $("badge").textContent = data.Result;
  $("badge").classList.toggle("high", high);
  $("note").textContent = high
    ? `Estimated default probability is above the ${(data.threshold * 100).toFixed(1)}% decision threshold. Review this application carefully.`
    : `Estimated default probability is below the ${(data.threshold * 100).toFixed(1)}% decision threshold.`;
  $("result").scrollIntoView({ behavior: "smooth", block: "nearest" });
}

async function onSubmit(e) {
  e.preventDefault();
  $("error").hidden = true;
  updateShare();
  if (!$("form").checkValidity()) { $("form").reportValidity(); return; }

  const payload = {};
  FIELDS.forEach((k) => (payload[k] = NUMBERS.includes(k) ? Number($(k).value) : $(k).value));
  payload.person_age = Math.round(payload.person_age);
  payload.cb_person_cred_hist_length = Math.round(payload.cb_person_cred_hist_length);

  const btn = $("submit"); btn.disabled = true; btn.textContent = "Checking...";
  try {
    const res = await fetch(`${API_BASE}/predict`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (!res.ok) throw new Error(`The server returned ${res.status}. Check the values and try again.`);
    showResult(await res.json());
  } catch (err) {
    $("result").hidden = true;
    $("error").textContent = err instanceof TypeError ? "Cannot reach the API. Start the server with: uvicorn main:app --reload" : err.message;
    $("error").hidden = false;
  } finally {
    btn.disabled = false; btn.textContent = "Check risk";
  }
}

["person_income", "loan_amnt"].forEach((id) => $(id).addEventListener("input", updateShare));
document.querySelectorAll("[data-sample]").forEach((b) => b.addEventListener("click", () => fillSample(b.dataset.sample)));
$("form").addEventListener("submit", onSubmit);
fillSample("low");