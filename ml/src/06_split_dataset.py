import pandas as pd


# ---------------------------------------------------
# Load clean training dataset
# ---------------------------------------------------

df = pd.read_csv("./data/freight_market_training.csv")

df["Date"] = pd.to_datetime(df["Date"])

df = df.sort_values("Date").reset_index(drop=True)


# ---------------------------------------------------
# Calculate split sizes
# ---------------------------------------------------

n = len(df)

train_end = int(n * 0.70)
validation_end = int(n * 0.85)


# ---------------------------------------------------
# Chronological split
# ---------------------------------------------------

train_df = df.iloc[:train_end].copy()

validation_df = df.iloc[train_end:validation_end].copy()

test_df = df.iloc[validation_end:].copy()


# ---------------------------------------------------
# Display information
# ---------------------------------------------------

print("\nDataset split:\n")

print("Total observations:", len(df))

print("\nTraining set:")
print("Rows:", len(train_df))
print("Date:", train_df["Date"].min(), "to", train_df["Date"].max())

print("\nValidation set:")
print("Rows:", len(validation_df))
print(
    "Date:",
    validation_df["Date"].min(),
    "to",
    validation_df["Date"].max()
)

print("\nTest set:")
print("Rows:", len(test_df))
print("Date:", test_df["Date"].min(), "to", test_df["Date"].max())


# ---------------------------------------------------
# Save datasets
# ---------------------------------------------------

train_df.to_csv("./data/train.csv", index=False)

validation_df.to_csv("./data/validation.csv", index=False)

test_df.to_csv("./data/test.csv", index=False)


print("\nDatasets saved successfully:")
print("  ./data/train.csv")
print("  ./data/validation.csv")
print("  ./data/test.csv")