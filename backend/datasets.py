import os
import PyPDF2
import io

DATASETS_FOLDER = "./datasets"

# ── Map filenames to their sector ──
DATASET_MAP = {
    "5T_": "economy_gdp",
    "9T_": "economy_percapita",
    "15T_": "agriculture_production",
    "17T_": "agriculture_commercial",
    "27T_": "infrastructure_industry",
    "UDISE_": "education_udise",
    "RBI_health_MPI": "health_mpi_all_states",
    "NFHS5_": "health_nfhs_partial",
    "NFHS_": "health_nfhs_partial",
    "NITI_Aayog_Health": "health_niti_index",
}

def get_dataset_sector(filename: str) -> str:
    # Use startswith, not "in" — "5T_" is a substring of "15T_", so substring
    # matching was silently misclassifying the agriculture_production file
    # (15T_...) as economy_gdp, overwriting the real economy_gdp data. This
    # broke both sectors at once without any visible error.
    for prefix, sector in DATASET_MAP.items():
        if filename.startswith(prefix):
            return sector
    return "general"

# ── Extract text from a single PDF ──
def extract_pdf_text(filepath: str) -> str:
    with open(filepath, "rb") as f:
        reader = PyPDF2.PdfReader(f)
        text = " ".join(page.extract_text() for page in reader.pages if page.extract_text())
    return text

# ── Load all datasets from the datasets folder ──
def load_all_datasets() -> dict:
    datasets = {}
    
    if not os.path.exists(DATASETS_FOLDER):
        print("⚠️ datasets folder not found!")
        return datasets

    for filename in os.listdir(DATASETS_FOLDER):
        filepath = os.path.join(DATASETS_FOLDER, filename)
        sector = get_dataset_sector(filename)

        if filename.endswith(".pdf"):
            print(f"📂 Loading {sector} dataset from {filename}...")
            text = extract_pdf_text(filepath)
            datasets[sector] = text
            print(f"✅ Loaded {sector} — {len(text)} characters")
        elif filename.endswith(".txt"):
            print(f"📂 Loading {sector} dataset from {filename}...")
            with open(filepath, "r", encoding="utf-8") as f:
                text = f.read()
            datasets[sector] = text
            print(f"✅ Loaded {sector} — {len(text)} characters")

    return datasets

# ── Format datasets into context string for RAG ──
# education now has a real dataset (UDISE+ 2023-24, all states) — fully data_grounded.
# healthcare has a REAL but PARTIAL dataset (NFHS-5, only 5 of 36 states/UTs covered so
# far) — grounded only stays True here at the sector level; if you want per-state
# accuracy on this, cross-check against the state list inside NFHS5_health_partial.txt
# before trusting a specific state's healthcare number.
def format_dataset_context(datasets: dict, query_sectors: list) -> tuple[str, dict]:
    context_parts = []
    grounded = {}

    sector_map = {
        "agriculture": ["agriculture_production", "agriculture_commercial"],
        "economy": ["economy_gdp", "economy_percapita"],
        "infrastructure": ["infrastructure_industry"],
        "healthcare": ["health_mpi_all_states", "health_niti_index", "health_nfhs_partial"],
        "education": ["education_udise"],
    }

    for query_sector in query_sectors:
        matched_keys = sector_map.get(query_sector.lower(), [])
        found_any = False
        for key in matched_keys:
            if key in datasets:
                source_label = "RBI" if key.startswith(("economy", "agriculture", "infrastructure")) else \
                                "UDISE+" if key.startswith("education") else \
                                "RBI/NITI Aayog MPI" if key == "health_mpi_all_states" else \
                                "NITI Aayog Health Index" if key == "health_niti_index" else "NFHS-5"
                context_parts.append(f"\n=== INDIA {query_sector.upper()} DATA ({source_label}) ===\n{datasets[key][:900]}")
                found_any = True
                break  # one real source per sector is enough — stacking multiple just burns tokens
        grounded[query_sector.lower()] = found_any

    return "\n".join(context_parts), grounded


# ── Single function to call from main.py ──
def get_sector_context(sectors: list) -> tuple[str, dict]:
    """Returns (context_string, {sector_name: is_data_grounded})."""
    datasets = load_all_datasets()
    if not datasets:
        return "No reference datasets available.", {s.lower(): False for s in sectors}
    return format_dataset_context(datasets, sectors)