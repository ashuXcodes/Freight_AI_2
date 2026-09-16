import pandas as pd

# ========================================
# LOAD ADVANCED FEATURES
# ========================================

df = pd.read_csv("./data/freight_market_advanced_features.csv")

df["Date"] = pd.to_datetime(df["Date"])

df = df.sort_values("Date").reset_index(drop=True)


# ========================================
# FEATURES
# ========================================

features = [
    # Current BDI
    "BDI",

    # BDI lag features
    "BDI_lag_1",
    "BDI_lag_2",
    "BDI_lag_3",
    "BDI_lag_7",
    "BDI_lag_14",
    "BDI_lag_30",

    # Vessel market
    "Panamax_lag_1",
    "Supramax_lag_1",
    "Handysize_lag_1",

    # Moving averages
    "BDI_mean_7",
    "BDI_mean_20",
    "BDI_mean_60",

    # Volatility
    "BDI_std_7",
    "BDI_std_20",
    "BDI_std_60",

    # Momentum
    "BDI_change_1",
    "BDI_change_3",
    "BDI_change_7",
    "BDI_change_14",

    # Percentage momentum
    "BDI_pct_change_1",
    "BDI_pct_change_3",
    "BDI_pct_change_7",
    "BDI_pct_change_14",

    # Trend
    "BDI_vs_mean_7",
    "BDI_vs_mean_20",
    "BDI_vs_mean_60",
    "BDI_vs_mean_20_pct",
    "BDI_vs_mean_60_pct",

    # Volatility ratios
    "BDI_volatility_ratio",
    "BDI_long_volatility_ratio",

    # Vessel momentum
    "Panamax_change_1",
    "Supramax_change_1",
    "Handysize_change_1",

    # Relative vessel strength
    "Panamax_vs_BDI",
    "Supramax_vs_BDI",
    "Handysize_vs_BDI",

    # Vessel spreads
    "Panamax_Supramax_spread",
    "Supramax_Handysize_spread",
    "Panamax_Handysize_spread",

    # Time features
    "month",
    "quarter",
    "day_of_week",
    "month_sin",
    "month_cos"
]

target = "BDI_target_7"


# ========================================
# CHECK MISSING VALUES
# ========================================

print("========================================")
print("ADVANCED TRAINING DATA PREPARATION")
print("========================================")

print("\nTotal rows before cleaning:", len(df))

print("\nMissing values:")
print(df[features + [target]].isna().sum())


# ========================================
# SELECT DATA
# ========================================

training_df = df[
    ["Date"] + features + [target]
].copy()


# ========================================
# REMOVE ROWS WITH MISSING VALUES
# ========================================

before = len(training_df)

training_df = training_df.dropna().reset_index(drop=True)

after = len(training_df)

removed = before - after


# ========================================
# SAVE
# ========================================

output_path = "./data/freight_market_advanced_training.csv"

training_df.to_csv(
    output_path,
    index=False
)


# ========================================
# SUMMARY
# ========================================

print("\n========================================")
print("TRAINING DATA SUMMARY")
print("========================================")

print("Rows before cleaning:", before)
print("Rows after cleaning: ", after)
print("Rows removed:        ", removed)

print("\nNumber of features:", len(features))

print("\nDate range:")
print("Start:", training_df["Date"].min().date())
print("End:  ", training_df["Date"].max().date())

print("\nTarget:", target)

print("\nFinal shape:")
print(training_df.shape)

print("\nSaved to:")
print(output_path)