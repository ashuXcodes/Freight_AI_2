import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error
import numpy as np

print("=" * 50)
print("BDI-ONLY LINEAR REGRESSION")
print("=" * 50)

# Load dataset
df = pd.read_csv("./data/bdi_only_training.csv")
df["Date"] = pd.to_datetime(df["Date"])

df = df.sort_values("Date").reset_index(drop=True)

# Features
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

X = df[features]
y = df[target]

# Chronological split
n = len(df)

train_end = int(n * 0.70)
validation_end = int(n * 0.85)

X_train = X.iloc[:train_end]
y_train = y.iloc[:train_end]

X_validation = X.iloc[train_end:validation_end]
y_validation = y.iloc[train_end:validation_end]

X_test = X.iloc[validation_end:]
y_test = y.iloc[validation_end:]

print()
print("DATA SPLIT")
print("-" * 50)

print(f"Training:   {len(X_train)} rows")
print(f"Validation: {len(X_validation)} rows")
print(f"Test:       {len(X_test)} rows")

print()
print("Date ranges:")
print(
    f"Training:   {df.iloc[0]['Date'].date()} "
    f"to {df.iloc[train_end - 1]['Date'].date()}"
)

print(
    f"Validation: {df.iloc[train_end]['Date'].date()} "
    f"to {df.iloc[validation_end - 1]['Date'].date()}"
)

print(
    f"Test:       {df.iloc[validation_end]['Date'].date()} "
    f"to {df.iloc[-1]['Date'].date()}"
)

# Train model
model = LinearRegression()

model.fit(X_train, y_train)

# Predictions
validation_predictions = model.predict(X_validation)
test_predictions = model.predict(X_test)

# Metrics
validation_mae = mean_absolute_error(
    y_validation,
    validation_predictions
)

validation_rmse = np.sqrt(
    mean_squared_error(
        y_validation,
        validation_predictions
    )
)

test_mae = mean_absolute_error(
    y_test,
    test_predictions
)

test_rmse = np.sqrt(
    mean_squared_error(
        y_test,
        test_predictions
    )
)

print()
print("=" * 50)
print("VALIDATION RESULTS")
print("=" * 50)

print(f"MAE:  {validation_mae:.2f}")
print(f"RMSE: {validation_rmse:.2f}")

print()
print("=" * 50)
print("TEST RESULTS")
print("=" * 50)

print(f"MAE:  {test_mae:.2f}")
print(f"RMSE: {test_rmse:.2f}")

# Sample predictions
results = pd.DataFrame({
    "Date": df.iloc[validation_end:]["Date"].values,
    "Actual": y_test.values,
    "Predicted": test_predictions
})

print()
print("=" * 50)
print("SAMPLE TEST PREDICTIONS")
print("=" * 50)

print(results.head(10).to_string(index=False))

# Save predictions
results.to_csv(
    "./data/bdi_only_test_predictions.csv",
    index=False
)

print()
print("Saved test predictions to:")
print("./data/bdi_only_test_predictions.csv")