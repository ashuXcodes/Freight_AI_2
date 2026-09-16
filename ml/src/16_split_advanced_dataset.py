import pandas as pd

# ========================================
# LOAD DATA
# ========================================

df = pd.read_csv("./data/freight_market_advanced_training.csv")

df["Date"] = pd.to_datetime(df["Date"])

df = df.sort_values("Date").reset_index(drop=True)


# ========================================
# CHRONOLOGICAL SPLIT
# ========================================

n = len(df)

train_end = int(n * 0.70)

validation_end = int(n * 0.85)


train_df = df.iloc[:train_end].copy()

validation_df = df.iloc[train_end:validation_end].copy()

test_df = df.iloc[validation_end:].copy()


# ========================================
# DISPLAY RESULTS
# ========================================

print("========================================")
print("ADVANCED DATASET SPLIT")
print("========================================")

print("\nTotal observations:", n)

print("\nTraining:")
print("Rows:", len(train_df))
print(
    "Period:",
    train_df["Date"].min().date(),
    "to",
    train_df["Date"].max().date()
)

print("\nValidation:")
print("Rows:", len(validation_df))
print(
    "Period:",
    validation_df["Date"].min().date(),
    "to",
    validation_df["Date"].max().date()
)

print("\nTest:")
print("Rows:", len(test_df))
print(
    "Period:",
    test_df["Date"].min().date(),
    "to",
    test_df["Date"].max().date()
)


# ========================================
# SAVE
# ========================================

train_df.to_csv(
    "./data/advanced_train.csv",
    index=False
)

validation_df.to_csv(
    "./data/advanced_validation.csv",
    index=False
)

test_df.to_csv(
    "./data/advanced_test.csv",
    index=False
)


print("\n========================================")
print("FILES SAVED")
print("========================================")

print("./data/advanced_train.csv")
print("./data/advanced_validation.csv")
print("./data/advanced_test.csv")