import pandas as pd


# --------------------------------------------------
# 1. Load the dataset containing our lag features
# --------------------------------------------------

df = pd.read_csv("./data/freight_market_with_lags.csv")


# --------------------------------------------------
# 2. Convert Date to datetime and sort chronologically
# --------------------------------------------------

df["Date"] = pd.to_datetime(df["Date"])

df = df.sort_values("Date").reset_index(drop=True)


# --------------------------------------------------
# 3. Create BDI rolling mean features
# --------------------------------------------------

df["BDI_mean_7"] = df["BDI"].rolling(window=7).mean()

df["BDI_mean_20"] = df["BDI"].rolling(window=20).mean()

df["BDI_mean_60"] = df["BDI"].rolling(window=60).mean()


# --------------------------------------------------
# 4. Create BDI rolling standard deviation features
# --------------------------------------------------

df["BDI_std_7"] = df["BDI"].rolling(window=7).std()

df["BDI_std_20"] = df["BDI"].rolling(window=20).std()

df["BDI_std_60"] = df["BDI"].rolling(window=60).std()


# --------------------------------------------------
# 5. Display the new features
# --------------------------------------------------

print("\nBDI rolling features:\n")

print(
    df[
        [
            "Date",
            "BDI",
            "BDI_mean_7",
            "BDI_mean_20",
            "BDI_mean_60",
            "BDI_std_7",
            "BDI_std_20",
            "BDI_std_60",
        ]
    ].tail(10)
)


# --------------------------------------------------
# 6. Save the new dataset
# --------------------------------------------------

output_path = "./data/freight_market_with_lags_and_rolling.csv"

df.to_csv(output_path, index=False)

print(f"\nRolling-feature dataset saved to: {output_path}")