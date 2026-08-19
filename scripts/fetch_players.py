"""
Downloads the eFootball player database from Kaggle and converts it into
public/players.json, the format src/App.jsx expects.

Usage (from the scripts/ folder):
    pip install kagglehub pandas
    python fetch_players.py

The very first run will PRINT the dataset's real column names — Kaggle
dataset schemas vary and change over time, so open this file afterwards
and fix the COLUMN_MAP below if any field lands wrong. That's expected
and takes ~2 minutes.
"""

import json
import glob
import os
import kagglehub
import pandas as pd

DATASET = "bishoyhany/efootball-database"

# ---- 1. our app's fields, and the CSV column(s) that might map to them ----
# Edit the right-hand list after you see the printed columns below.
COLUMN_MAP = {
    "name": ["Name", "player_name", "PlayerName"],
    "position": ["Position", "Pos", "position"],
    "ovr": ["Overall", "OVR", "Rating", "overall_rating"],
    "offensiveAwareness": ["Offensive Awareness", "OffensiveAwareness", "OFF_AWR"],
    "ballControl": ["Ball Control", "BallControl", "BAL_CTRL"],
    "dribbling": ["Dribbling", "DRI"],
    "tightPossession": ["Tight Possession", "TightPossession", "TGH_POS"],
    "lowPass": ["Low Pass", "LowPass", "LOW_PAS"],
    "loftedPass": ["Lofted Pass", "LoftedPass", "LFT_PAS"],
    "finishing": ["Finishing", "FIN"],
    "heading": ["Heading", "HEA"],
    "placeKicking": ["Place Kicking", "PlaceKicking", "PLA_KIC"],
    "curl": ["Curl", "CUR"],
}

ATT_KEYS = [
    "offensiveAwareness", "ballControl", "dribbling", "tightPossession",
    "lowPass", "loftedPass", "finishing", "heading", "placeKicking", "curl",
]


def find_column(df, candidates):
    for c in candidates:
        if c in df.columns:
            return c
    return None


def main():
    print(f"Downloading dataset: {DATASET} ...")
    path = kagglehub.dataset_download(DATASET)
    print("Downloaded to:", path)

    csvs = glob.glob(os.path.join(path, "**", "*.csv"), recursive=True)
    if not csvs:
        raise SystemExit("No CSV found in the dataset — check the download path above.")

    csv_path = csvs[0]
    print("Using file:", csv_path)
    df = pd.read_csv(csv_path)

    print("\nColumns found in the dataset:")
    print(list(df.columns))
    print("\nIf any field below looks wrong once players.json is generated,")
    print("add the exact column name to COLUMN_MAP in this script and re-run.\n")

    resolved = {field: find_column(df, cands) for field, cands in COLUMN_MAP.items()}

    players = []
    for _, row in df.iterrows():
        name_col = resolved["name"]
        if not name_col or pd.isna(row.get(name_col)):
            continue

        def num(field, default):
            col = resolved[field]
            if col and col in row and not pd.isna(row[col]):
                try:
                    return float(row[col])
                except (TypeError, ValueError):
                    return default
            return default

        players.append({
            "id": str(row.get(resolved["name"], "")) + "-" + str(_),
            "name": str(row[name_col]),
            "position": str(row.get(resolved["position"], "CF")) if resolved["position"] else "CF",
            "ovr": round(num("ovr", 75), 2),
            "playStyles": [],
            "attacking": {k: int(num(k, 70)) for k in ATT_KEYS},
            "boosted": [],
            "skills": [],
        })

    out_dir = os.path.join(os.path.dirname(__file__), "..", "public")
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, "players.json")
    with open(out_path, "w") as f:
        json.dump(players, f, indent=2)

    print(f"Wrote {len(players)} players to {out_path}")


if __name__ == "__main__":
    main()
