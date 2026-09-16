import pandas as pd


# ========================================
# LOAD ADVANCED FEATURES
# ========================================

df = pd.read_csv("./data/freight_market_advanced_features.csv")

df["Date"] = pd.to_datetime(df["Date"])

df = df.sort_values("Date").reset_index(drop=True)


# ========================================
# BDI-ONLY FEATURES
# ========================================

features = [
    "BDI",

    "BDI_lag_1",
    "BDI_lag_2",
    "BDI_lag_3",
    "BDI_lag_7",
    "BDI_lag_14",
    "BDI_lag_30",

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

print("=" * 50)
print("BDI-ONLY TRAINING DATA PREPARATION")
print("=" * 50)

print()

print("Total rows:", len(df))

print()
print("Missing values:")
print(
    df[features + [target]]
    .isna()
    .sum()
)


# ========================================
# CREATE TRAINING DATA
# ========================================

training_df = df[
    ["Date"] + features + [target]
].copy()


training_df = training_df.dropna().reset_index(drop=True)


# ========================================
# SUMMARY
# ========================================

print()
print("=" * 50)
print("TRAINING DATA SUMMARY")
print("=" * 50)

print()

print(
    "Rows before cleaning:",
    len(df)
)

print(
    "Rows after cleaning:",
    len(training_df)
)

print(
    "Rows removed:",
    len(df) - len(training_df)
)

print()

print(
    "Number of features:",
    len(features)
)

print()

print("Date range:")

print(
    "Start:",
    training_df["Date"].min().strftime("%Y-%m-%d")
)

print(
    "End:",
    training_df["Date"].max().strftime("%Y-%m-%d")
)

print()

print("Final shape:")
print(training_df.shape)


# ========================================
# SAVE
# ========================================

output_path = "./data/bdi_only_training.csv"

training_df.to_csv(
    output_path,
    index=False
)

print()
print("Saved to:")
print(output_path)