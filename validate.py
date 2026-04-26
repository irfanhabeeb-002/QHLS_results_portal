import pandas as pd
import json

# =========================
# LOAD EXCEL
# =========================
df = pd.read_excel("RESULT_QHLS.xlsx")

# =========================
# CLEAN COLUMN NAMES
# =========================
df.columns = df.columns.str.strip()

df = df.rename(columns={
    "Registration Number": "reg_no",
    "Zone": "zone",
    "Unit": "centre",
    "Name": "name",
    "Mobile": "phone",
    "Mark": "marks"
})

# =========================
# CLEAN reg_no FIRST
# =========================
df["reg_no"] = df["reg_no"].astype(str).str.strip().str.upper()

# =========================
# MANUAL FIXES (IMPORTANT)
# =========================

# Fix specific phone numbers
df.loc[df["reg_no"].str.contains("Q1286"), "phone"] = "9809180001"
df.loc[df["reg_no"].str.contains("Q1222"), "phone"] = "9995379212"

# Fix wrong centre
df.loc[df["reg_no"].str.contains("Q1290"), "centre"] = "KAKKANAD"

# =========================
# FIX ZONE NAMES
# =========================
zone_map = {
    "ALUVA": "ALUVA ZONE",
    "ERNAKULAM": "ERNAKULAM ZONE",
    "KAKKANADU": "KAKKANAD ZONE",
    "KOCHI": "KOCHI ZONE",
    "KOTHAMANGALAM": "KOTHAMANGALAM ZONE",
    "PERUMBAVOOR": "PERUMBAVOOR ZONE",
    "MUVATTUPUZHA": "MUVATTUPUZHA ZONE",
    "PALLURUTHI": "PALLURUTHY ZONE",
    "PARAVOOR": "PARAVOOR ZONE",
    "VYPIN": "VYPIN ZONE",
    "VYTTILA": "VYTILLA ZONE"
}

df["zone"] = df["zone"].astype(str).str.strip().str.upper()
df["zone"] = df["zone"].map(zone_map)

# =========================
# CLEAN NAMES
# =========================
df["name"] = df["name"].astype(str).str.strip().str.title()

# =========================
# CLEAN CENTRE
# =========================
df["centre"] = df["centre"].astype(str).str.strip().str.upper()

# =========================
# CLEAN PHONE NUMBERS
# =========================
df["phone"] = df["phone"].astype(str).str.replace(r"\D", "", regex=True)

# Handle invalid phones (DO NOT REMOVE)
def fix_phone(p):
    if len(p) == 10:
        return p
    else:
        return "1111111111"  # fallback

df["phone"] = df["phone"].apply(fix_phone)

# =========================
# FIX MARKS
# =========================
df["marks"] = pd.to_numeric(df["marks"], errors="coerce")
df["marks"] = df["marks"].fillna(0).astype(int)

# =========================
# GENERATE STUDENT IDs
# =========================
df = df.reset_index(drop=True)
df["id"] = ["ST" + str(i).zfill(4) for i in range(1, len(df) + 1)]

# =========================
# BUILD DATA STRUCTURES
# =========================
students = {}
phone_map = {}

for _, row in df.iterrows():
    students[row["id"]] = {
        "name": row["name"],
        "marks": int(row["marks"]),
        "zone": row["zone"],
        "centre": row["centre"],
        "reg_no": row["reg_no"]
    }

    phone_map.setdefault(row["phone"], []).append(row["id"])

# =========================
# TOP SCORERS
# =========================
top_df = df.sort_values(
    by=["marks", "name"],
    ascending=[False, True]
).head(3)

top_scorers = []
for i, (_, row) in enumerate(top_df.iterrows(), start=1):
    top_scorers.append({
        "id": row["id"],
        "name": row["name"],
        "marks": int(row["marks"]),
        "zone": row["zone"],
        "rank": i
    })

# =========================
# FINAL JSON
# =========================
data = {
    "total_participants": len(df),
    "metadata": {
        "exam_date": "April 5, 2026",
        "total_zones": 11
    },
    "contacts": [],  # add your convenors manually
    "phone_map": phone_map,
    "top_scorers": top_scorers,
    "students": students
}

# =========================
# SAVE JSON
# =========================
with open("data.json", "w") as f:
    json.dump(data, f, indent=2)

# =========================
# OPTIONAL: SAVE CLEANED EXCEL
# =========================
df.to_excel("CLEANED_RESULT.xlsx", index=False)

print("\n✅ data.json generated successfully!")
print(f"Total students: {len(df)}")
print("⚠️ Invalid phones replaced with 1111111111")