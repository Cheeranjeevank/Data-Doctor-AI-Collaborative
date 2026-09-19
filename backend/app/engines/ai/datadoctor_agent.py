"""
DataDoctor AI Engine — Custom Gemini-powered data reliability agent.
"""
import os
import pandas as pd
from google import genai
from google.genai import types
from ...database.models import Dataset, DataProfile
from sqlalchemy.orm import Session

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "./data/raw")

DATADOCTOR_SYSTEM_PROMPT = """You are DataDoctor AI, an expert AI agent specialized in data reliability, data quality diagnostics, and data engineering.

Your capabilities:
1. Analyze datasets uploaded by the user and answer natural-language questions about them.
2. Detect patterns, trends, correlations, and anomalies in data.
3. Explain data quality issues clearly to both technical and non-technical users.
4. Generate Python/Pandas code to compute specific metrics when needed, and execute it.
5. Provide root-cause hypotheses for data anomalies.

Personality: You are confident, precise, and data-driven. You always ground your answers in the actual data provided. If you are unsure, you say so and ask for clarification.

When answering questions about data:
- Always refer to actual column names and statistics from the dataset context provided.
- If you need to compute something, write a Python snippet using `df` (already available) and show the result.
- Format numbers clearly (e.g., "1,234 rows", "23.5%").
- Keep answers concise but complete.
"""


def _load_df(filename: str) -> pd.DataFrame:
    path = os.path.join(UPLOAD_DIR, filename)
    if filename.endswith(".csv"):
        return pd.read_csv(path)
    elif filename.endswith(".json"):
        return pd.read_json(path)
    elif filename.endswith(".xlsx"):
        return pd.read_excel(path)
    raise ValueError(f"Unsupported file type: {filename}")


def _build_dataset_context(dataset: Dataset, profiles: list[DataProfile], df: pd.DataFrame) -> str:
    """Build a rich context string for the AI agent."""
    lines = [
        f"## Dataset: {dataset.name}",
        f"- Total rows: {dataset.row_count:,}",
        f"- Total columns: {dataset.column_count}",
        f"- Status: {dataset.status}",
        "",
        "## Column Profiles:",
    ]
    for p in profiles:
        line = f"  - **{p.column_name}** (type: {p.data_type}) | missing: {p.missing_percentage:.1f}% | unique: {p.unique_count}"
        if p.mean_val is not None:
            line += f" | mean: {p.mean_val:.2f} | min: {p.min_val:.2f} | max: {p.max_val:.2f}"
        lines.append(line)

    lines += [
        "",
        f"## Sample Data (first 5 rows):",
        df.head(5).to_markdown(index=False),
    ]
    return "\n".join(lines)


def _safe_exec_pandas(code: str, df: pd.DataFrame) -> str:
    """Safely execute a pandas code snippet and return the result as string."""
    local_vars = {"df": df.copy(), "pd": pd}
    try:
        exec(code, {}, local_vars)
        result = local_vars.get("result", None)
        if result is not None:
            return str(result)
        # Try to capture last expression
        output = io.StringIO()
        exec(f"import sys\nsys.stdout.write(str({code.strip().splitlines()[-1]}))", {"df": df.copy(), "pd": pd}, {})
        return output.getvalue()
    except Exception as e:
        return f"Code execution error: {e}"


def ask_datadoctor(dataset_id: int, question: str, db: Session) -> str:
    """
    Main entry point: given a dataset_id and a natural language question,
    returns the DataDoctor AI's answer.
    """
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY is not set in the environment.")

    client = genai.Client(api_key=api_key)

    dataset: Dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
    if not dataset:
        raise ValueError(f"Dataset {dataset_id} not found.")

    profiles = db.query(DataProfile).filter(DataProfile.dataset_id == dataset_id).all()
    df = _load_df(dataset.filename)

    dataset_context = _build_dataset_context(dataset, profiles, df)

    prompt = f"""
{DATADOCTOR_SYSTEM_PROMPT}

---

{dataset_context}

---

User question: {question}

Please answer the question based on the dataset above. If precise computation is needed, compute it using the provided data and show the result.
"""

    response = client.models.generate_content(
        model="gemini-3.6-flash",
        contents=prompt,
    )
    return response.text
