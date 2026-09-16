import pandas as pd


# ========================================
# LOAD DATA
# ========================================

df = pd.read_csv("./data/freight_market_advanced_features.csv")

df["Date"] = pd.to_datetime(df["Date"])

df = df.sort_values("Date").reset_index(drop=True)


# ========================================
# FEATURES
# ========================================

features = [
    "BDI",
    "BDI_lag_1",
    "BDI_lag_2",
    "BDI_lag_3",
    "BDI_lag_7",
    "BDI_lag_14",
    "BDI_lag_30",

    "Panamax_lag_1",
    "Supramax_lag_1",
    "Handysize_lag_1",

    "BDI_mean_7",
    "BDI_mean_20",
    "BDI_mean_60",

    "BDI_std_7",
    "BDI_std_20",
    "BDI_std_60",

    "BDI_change_1",
    "BDI_change_3",
    "BDI_change_7",
    "BDI_change_14",

    "BDI_pct_change_1",
    "BDI_pct_change_3",
    "BDI_pct_change_7",
    "BDI_pct_change_14",

    "BDI_vs_mean_7",
    "BDI_vs_mean_20",
    "BDI_vs_mean_60",

    "BDI_vs_mean_20_pct",
    "BDI_vs_mean_60_pct",

    "BDI_volatility_ratio",
    "BDI_long_volatility_ratio",

    "Panamax_change_1",
    "Supramax_change_1",
    "Handysize_change_1",

    "Panamax_vs_BDI",
    "Supramax_vs_BDI",
    "Handysize_vs_BDI",

    "Panamax_Supramax_spread",
    "Supramax_Handysize_spread",
    "Panamax_Handysize_spread",

    "month",
    "quarter",
    "day_of_week",
    "month_sin",
    "month_cos"
]


# ========================================
# LATEST ROW
# ========================================

latest_row = df.iloc[-1]

print("=" * 50)
print("LATEST FEATURE AVAILABILITY")
print("=" * 50)

print()

print("Latest date:", latest_row["Date"].strftime("%Y-%m-%d"))
print("Latest BDI:", latest_row["BDI"])

print()

print("FEATURE STATUS")
print("-" * 50)

for feature in features:

    value = latest_row[feature]

    if pd.isna(value):
        status = "MISSING"
    else:
        status = "AVAILABLE"

    print(f"{feature:35} {status}")


# ========================================
# FIND LAST COMPLETE ROW
# ========================================

complete_rows = df.dropna(subset=features)

print()
print("=" * 50)
print("LAST COMPLETE FEATURE ROW")
print("=" * 50)

print()

print(
    "Date:",
    complete_rows.iloc[-1]["Date"].strftime("%Y-%m-%d")
)

print(
    "BDI:",
    complete_rows.iloc[-1]["BDI"]
)

print(
    "Complete rows:",
    len(complete_rows)
)