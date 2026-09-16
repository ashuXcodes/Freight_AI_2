import pandas as pd


# --------------------------------------------------
# 1. Load the original dataset
# --------------------------------------------------

df = pd.read_csv("./data/freight_market_levels.csv")


# --------------------------------------------------
# 2. Convert Date column to datetime
# --------------------------------------------------

df["Date"] = pd.to_datetime(df["Date"])

# Sort by date just to make sure the data is chronological
df = df.sort_values("Date").reset_index(drop=True)


# --------------------------------------------------
# 3. Create BDI lag features
# --------------------------------------------------

df["BDI_lag_1"] = df["BDI"].shift(1)
df["BDI_lag_2"] = df["BDI"].shift(2)
df["BDI_lag_3"] = df["BDI"].shift(3)
df["BDI_lag_7"] = df["BDI"].shift(7)
df["BDI_lag_14"] = df["BDI"].shift(14)
df["BDI_lag_30"] = df["BDI"].shift(30)


# --------------------------------------------------
# 4. Create lag features for other vessel indices
# --------------------------------------------------

df["Panamax_lag_1"] = df["Panamax"].shift(1)
df["Supramax_lag_1"] = df["Supramax"].shift(1)
df["Handysize_lag_1"] = df["Handysize"].shift(1)


# --------------------------------------------------
# 5. Display the result
# --------------------------------------------------

print("\nFirst 10 rows with lag features:\n")

print(
    df[
        [
            "Date",
            "BDI",
            "BDI_lag_1",
            "BDI_lag_2",
            "BDI_lag_3",
            "BDI_lag_7",
            "BDI_lag_14",
            "BDI_lag_30",
        ]
    ].head(10)
)


# --------------------------------------------------
# 6. Display column names
# --------------------------------------------------

print("\nColumns after creating lag features:\n")

print(df.columns.tolist())

# --------------------------------------------------
# 7. Save the dataset with lag features
# --------------------------------------------------

output_path = "./data/freight_market_with_lags.csv"

df.to_csv(output_path, index=False)

print(f"\nLag-feature dataset saved to: {output_path}")