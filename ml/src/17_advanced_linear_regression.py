import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error
import numpy as np


# ========================================
# LOAD DATA
# ========================================

train_df = pd.read_csv("./data/advanced_train.csv")
validation_df = pd.read_csv("./data/advanced_validation.csv")
test_df = pd.read_csv("./data/advanced_test.csv")


# ========================================
# FEATURES
# ========================================

features = [
    # Current BDI
    "BDI",

    # BDI lags
    "BDI_lag_1",
    "BDI_lag_2",
    "BDI_lag_3",
    "BDI_lag_7",
    "BDI_lag_14",
    "BDI_lag_30",

    # Vessel markets
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
# PREPARE X AND Y
# ========================================

X_train = train_df[features]
y_train = train_df[target]

X_validation = validation_df[features]
y_validation = validation_df[target]

X_test = test_df[features]
y_test = test_df[target]


# ========================================
# TRAIN MODEL
# ========================================

model = LinearRegression()

model.fit(X_train, y_train)


# ========================================
# PREDICTIONS
# ========================================

validation_predictions = model.predict(X_validation)

test_predictions = model.predict(X_test)


# ========================================
# EVALUATION
# ========================================

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


# ========================================
# RESULTS
# ========================================

print("========================================")
print("ADVANCED LINEAR REGRESSION")
print("========================================")

print("Training observations:", len(train_df))
print("Validation observations:", len(validation_df))
print("Test observations:", len(test_df))
print("Number of features:", len(features))


print("\nVALIDATION RESULTS")
print("----------------------------------------")
print(f"MAE:  {validation_mae:.2f}")
print(f"RMSE: {validation_rmse:.2f}")


print("\nTEST RESULTS")
print("----------------------------------------")
print(f"MAE:  {test_mae:.2f}")
print(f"RMSE: {test_rmse:.2f}")


# ========================================
# ORIGINAL LINEAR BASELINE
# ========================================

original_mae = 179.71
original_rmse = 259.50


mae_change = (
    (original_mae - test_mae)
    / original_mae
) * 100

rmse_change = (
    (original_rmse - test_rmse)
    / original_rmse
) * 100


print("\nCOMPARISON WITH ORIGINAL LINEAR REGRESSION")
print("----------------------------------------")

print(f"Original Linear MAE:  {original_mae:.2f}")
print(f"Advanced Linear MAE:  {test_mae:.2f}")

print(f"\nOriginal Linear RMSE: {original_rmse:.2f}")
print(f"Advanced Linear RMSE: {test_rmse:.2f}")


print("\nCHANGE")
print("----------------------------------------")
print(f"MAE change:  {mae_change:.2f}%")
print(f"RMSE change: {rmse_change:.2f}%")


# ========================================
# SAMPLE PREDICTIONS
# ========================================

print("\nSAMPLE PREDICTIONS")
print("----------------------------------------")

sample = test_df[
    ["Date", "BDI", target]
].copy()

sample["prediction"] = test_predictions

print(sample.head(10).to_string(index=False))