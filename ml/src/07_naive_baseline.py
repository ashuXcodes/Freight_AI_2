import pandas as pd
import numpy as np
from sklearn.metrics import mean_absolute_error, mean_squared_error


# ---------------------------------------------------
# Load test dataset
# ---------------------------------------------------

test_df = pd.read_csv("./data/test.csv")

test_df["Date"] = pd.to_datetime(test_df["Date"])


# ---------------------------------------------------
# Naive prediction
# ---------------------------------------------------

# For a 7-observation-ahead forecast,
# assume future BDI = current BDI.

test_df["naive_prediction"] = test_df["BDI"]


# ---------------------------------------------------
# Actual values
# ---------------------------------------------------

y_actual = test_df["BDI_target_7"]

y_pred = test_df["naive_prediction"]


# ---------------------------------------------------
# Calculate MAE
# ---------------------------------------------------

mae = mean_absolute_error(y_actual, y_pred)


# ---------------------------------------------------
# Calculate RMSE
# ---------------------------------------------------

rmse = np.sqrt(
    mean_squared_error(y_actual, y_pred)
)


# ---------------------------------------------------
# Directional accuracy
# ---------------------------------------------------

# Current BDI
current_bdi = test_df["BDI_lag_1"]

# Actual future BDI
actual_future = test_df["BDI_target_7"]

# Predicted direction:
# Naive forecast assumes no change,
# so directional accuracy is not meaningful.
directional_accuracy = None


# ---------------------------------------------------
# Display results
# ---------------------------------------------------

print("\n========================================")
print("NAIVE BASELINE RESULTS")
print("========================================")

print(f"Test observations: {len(test_df)}")

print(f"MAE:  {mae:.2f}")

print(f"RMSE: {rmse:.2f}")


# ---------------------------------------------------
# Show examples
# ---------------------------------------------------

print("\nSample predictions:\n")

print(
    test_df[
        [
            "Date",
            "BDI_lag_1",
            "BDI_target_7",
            "naive_prediction"
        ]
    ].head(10)
)