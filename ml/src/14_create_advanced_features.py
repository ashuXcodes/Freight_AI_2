import pandas as pd
import numpy as np

# ========================================
# LOAD DATA
# ========================================

df = pd.read_csv("./data/freight_market_training_base.csv")

df["Date"] = pd.to_datetime(df["Date"])

df = df.sort_values("Date").reset_index(drop=True)


# ========================================
# 1. BDI MOMENTUM FEATURES
# ========================================

df["BDI_change_1"] = df["BDI"].diff(1)
df["BDI_change_3"] = df["BDI"].diff(3)
df["BDI_change_7"] = df["BDI"].diff(7)
df["BDI_change_14"] = df["BDI"].diff(14)


# ========================================
# 2. BDI PERCENTAGE CHANGE
# ========================================

df["BDI_pct_change_1"] = df["BDI"].pct_change(1)
df["BDI_pct_change_3"] = df["BDI"].pct_change(3)
df["BDI_pct_change_7"] = df["BDI"].pct_change(7)
df["BDI_pct_change_14"] = df["BDI"].pct_change(14)


# ========================================
# 3. TREND FEATURES
# ========================================

df["BDI_vs_mean_7"] = (
    df["BDI"] - df["BDI_mean_7"]
)

df["BDI_vs_mean_20"] = (
    df["BDI"] - df["BDI_mean_20"]
)

df["BDI_vs_mean_60"] = (
    df["BDI"] - df["BDI_mean_60"]
)


# Percentage distance from moving averages

df["BDI_vs_mean_20_pct"] = (
    (df["BDI"] - df["BDI_mean_20"])
    / df["BDI_mean_20"]
)

df["BDI_vs_mean_60_pct"] = (
    (df["BDI"] - df["BDI_mean_60"])
    / df["BDI_mean_60"]
)


# ========================================
# 4. VOLATILITY FEATURES
# ========================================

df["BDI_volatility_ratio"] = (
    df["BDI_std_20"] / df["BDI_mean_20"]
)

df["BDI_long_volatility_ratio"] = (
    df["BDI_std_60"] / df["BDI_mean_60"]
)


# ========================================
# 5. VESSEL CLASS MOMENTUM
# ========================================

df["Panamax_change_1"] = df["Panamax_lag_1"].diff()

df["Supramax_change_1"] = df["Supramax_lag_1"].diff()

df["Handysize_change_1"] = df["Handysize_lag_1"].diff()


# ========================================
# 6. RELATIVE VESSEL MARKET FEATURES
# ========================================

df["Panamax_vs_BDI"] = (
    df["Panamax_lag_1"] / df["BDI"]
)

df["Supramax_vs_BDI"] = (
    df["Supramax_lag_1"] / df["BDI"]
)

df["Handysize_vs_BDI"] = (
    df["Handysize_lag_1"] / df["BDI"]
)


# ========================================
# 7. VESSEL MARKET SPREADS
# ========================================

df["Panamax_Supramax_spread"] = (
    df["Panamax_lag_1"] - df["Supramax_lag_1"]
)

df["Supramax_Handysize_spread"] = (
    df["Supramax_lag_1"] - df["Handysize_lag_1"]
)

df["Panamax_Handysize_spread"] = (
    df["Panamax_lag_1"] - df["Handysize_lag_1"]
)


# ========================================
# 8. TIME FEATURES
# ========================================

df["month"] = df["Date"].dt.month

df["quarter"] = df["Date"].dt.quarter

df["day_of_week"] = df["Date"].dt.dayofweek


# ========================================
# 9. CYCLICAL TIME FEATURES
# ========================================

df["month_sin"] = np.sin(
    2 * np.pi * df["month"] / 12
)

df["month_cos"] = np.cos(
    2 * np.pi * df["month"] / 12
)


# ========================================
# 10. SAVE
# ========================================

output_path = "./data/freight_market_advanced_features.csv"

df.to_csv(output_path, index=False)


# ========================================
# SUMMARY
# ========================================

print("========================================")
print("ADVANCED FEATURE ENGINEERING")
print("========================================")

print("Rows:", len(df))

print("Original columns:", 21)

print("New columns:", len(df.columns))

print("\nNew features:")

new_features = [
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
    "month_cos",
]

for feature in new_features:
    print(feature)

print("\nSaved to:")
print(output_path)