import pandas as pd
import numpy as np

from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error


# ========================================
# 1. LOAD DATA
# ========================================

train_df = pd.read_csv("./data/train.csv")
validation_df = pd.read_csv("./data/validation.csv")
test_df = pd.read_csv("./data/test.csv")


# ========================================
# 2. DEFINE FEATURES AND TARGET
# ========================================

features = [
    "BDI",

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


# ========================================
# 3. CREATE X AND y
# ========================================

X_train = train_df[features]
y_train = train_df[target]

X_validation = validation_df[features]
y_validation = validation_df[target]

X_test = test_df[features]
y_test = test_df[target]


print("========================================")
print("LINEAR REGRESSION")
print("========================================")

print()
print("Training observations:", len(X_train))
print("Validation observations:", len(X_validation))
print("Test observations:", len(X_test))

print()
print("Number of features:", len(features))


# ========================================
# 4. CREATE MODEL
# ========================================

model = LinearRegression()


# ========================================
# 5. TRAIN MODEL
# ========================================

model.fit(X_train, y_train)


# ========================================
# 6. VALIDATION PREDICTIONS
# ========================================

validation_prediction = model.predict(X_validation)

validation_mae = mean_absolute_error(
    y_validation,
    validation_prediction
)

validation_rmse = np.sqrt(
    mean_squared_error(
        y_validation,
        validation_prediction
    )
)


print()
print("VALIDATION RESULTS")
print("----------------------------------------")
print(f"MAE:  {validation_mae:.2f}")
print(f"RMSE: {validation_rmse:.2f}")


# ========================================
# 7. FINAL TEST PREDICTIONS
# ========================================

test_prediction = model.predict(X_test)

test_mae = mean_absolute_error(
    y_test,
    test_prediction
)

test_rmse = np.sqrt(
    mean_squared_error(
        y_test,
        test_prediction
    )
)


print()
print("TEST RESULTS")
print("----------------------------------------")
print(f"MAE:  {test_mae:.2f}")
print(f"RMSE: {test_rmse:.2f}")


# ========================================
# 8. COMPARE WITH NAIVE BASELINE
# ========================================

naive_prediction = test_df["BDI"]

naive_mae = mean_absolute_error(
    y_test,
    naive_prediction
)

naive_rmse = np.sqrt(
    mean_squared_error(
        y_test,
        naive_prediction
    )
)


print()
print("MODEL COMPARISON")
print("----------------------------------------")

print(f"Naive MAE:       {naive_mae:.2f}")
print(f"Linear MAE:      {test_mae:.2f}")

print()

print(f"Naive RMSE:      {naive_rmse:.2f}")
print(f"Linear RMSE:     {test_rmse:.2f}")


# ========================================
# 9. IMPROVEMENT
# ========================================

mae_improvement = (
    (naive_mae - test_mae)
    / naive_mae
) * 100

rmse_improvement = (
    (naive_rmse - test_rmse)
    / naive_rmse
) * 100


print()
print("IMPROVEMENT OVER NAIVE BASELINE")
print("----------------------------------------")

print(f"MAE improvement:  {mae_improvement:.2f}%")
print(f"RMSE improvement: {rmse_improvement:.2f}%")


# ========================================
# 10. SAMPLE PREDICTIONS
# ========================================

results = test_df[
    ["Date", "BDI", "BDI_target_7"]
].copy()

results["linear_prediction"] = test_prediction

print()
print("SAMPLE PREDICTIONS")
print("----------------------------------------")
print(results.head(10))