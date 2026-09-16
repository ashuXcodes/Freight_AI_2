import pandas as pd

# Load rolling-feature dataset
df = pd.read_csv("./data/freight_market_with_lags_and_rolling.csv")

# Convert Date column
df["Date"] = pd.to_datetime(df["Date"])

# Sort chronologically
df = df.sort_values("Date").reset_index(drop=True)


# ---------------------------------------------------
# Create forecasting target
# ---------------------------------------------------

# Predict BDI 7 observations into the future
df["BDI_target_7"] = df["BDI"].shift(-7)


# ---------------------------------------------------
# Display sample
# ---------------------------------------------------

print("\nTarget examples:\n")

print(
    df[
        [
            "Date",
            "BDI",
            "BDI_lag_1",
            "BDI_mean_7",
            "BDI_target_7"
        ]
    ].tail(15)
)


# ---------------------------------------------------
# Save dataset
# ---------------------------------------------------

output_path = "./data/freight_market_training_base.csv"

df.to_csv(output_path, index=False)

print("\nTraining-base dataset saved to:", output_path)