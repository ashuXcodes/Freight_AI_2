import pandas as pd

# ---------------------------------------------------
# Load dataset
# ---------------------------------------------------

df = pd.read_csv("./data/freight_market_training_base.csv")

df["Date"] = pd.to_datetime(df["Date"])

df = df.sort_values("Date").reset_index(drop=True)


# ---------------------------------------------------
# Select features
# ---------------------------------------------------

features = [
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
    "BDI_std_60"
]

target = "BDI_target_7"


# ---------------------------------------------------
# Create training dataset
# ---------------------------------------------------

training_df = df[
    ["Date", "BDI"] + features + [target]
].copy()


# ---------------------------------------------------
# Check missing values
# ---------------------------------------------------

print("\nMissing values before cleaning:\n")

print(training_df.isna().sum())


# ---------------------------------------------------
# Remove rows where features or target are missing
# ---------------------------------------------------

training_df = training_df.dropna().reset_index(drop=True)


# ---------------------------------------------------
# Display final dataset information
# ---------------------------------------------------

print("\nFinal training dataset:\n")

print(training_df.head())

print("\nLast rows:\n")

print(training_df.tail())

print("\nDataset shape:")

print(training_df.shape)

print("\nDate range:")

print(training_df["Date"].min(), "to", training_df["Date"].max())


# ---------------------------------------------------
# Save
# ---------------------------------------------------

output_path = "./data/freight_market_training.csv"

training_df.to_csv(output_path, index=False)

print("\nClean training dataset saved to:", output_path)