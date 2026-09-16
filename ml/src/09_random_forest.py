import pandas as pd
import numpy as np

from sklearn.ensemble import RandomForestRegressor
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
print("RANDOM FOREST REGRESSION")
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

model = RandomForestRegressor(
    n_estimators=300,
    max_depth=12,
    min_samples_split=5,
    min_samples_leaf=2,
    random_state=42,
    n_jobs=-1
)


# ========================================
# 5. TRAIN MODEL
# ========================================

print()
print("Training Random Forest...")

model.fit(X_train, y_train)

print("Training complete.")


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
# 7. TEST PREDICTIONS
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
# 8. NAIVE BASELINE
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


# ========================================
# 9. LINEAR REGRESSION BENCHMARK
# ========================================

# These are the results obtained earlier.
linear_mae = 179.71
linear_rmse = 259.50


# ========================================
# 10. MODEL COMPARISON
# ========================================

print()
print("MODEL COMPARISON")
print("----------------------------------------")

print(f"{'Model':<25}{'MAE':>10}{'RMSE':>12}")
print("-" * 47)

print(
    f"{'Naive Baseline':<25}"
    f"{naive_mae:>10.2f}"
    f"{naive_rmse:>12.2f}"
)

print(
    f"{'Linear Regression':<25}"
    f"{linear_mae:>10.2f}"
    f"{linear_rmse:>12.2f}"
)

print(
    f"{'Random Forest':<25}"
    f"{test_mae:>10.2f}"
    f"{test_rmse:>12.2f}"
)


# ========================================
# 11. IMPROVEMENT OVER NAIVE
# ========================================

mae_improvement_naive = (
    (naive_mae - test_mae)
    / naive_mae
) * 100

rmse_improvement_naive = (
    (naive_rmse - test_rmse)
    / naive_rmse
) * 100


print()
print("IMPROVEMENT OVER NAIVE BASELINE")
print("----------------------------------------")

print(f"MAE improvement:  {mae_improvement_naive:.2f}%")
print(f"RMSE improvement: {rmse_improvement_naive:.2f}%")


# ========================================
# 12. FEATURE IMPORTANCE
# ========================================

importance_df = pd.DataFrame({
    "Feature": features,
    "Importance": model.feature_importances_
})

importance_df = importance_df.sort_values(
    "Importance",
    ascending=False
)


print()
print("FEATURE IMPORTANCE")
print("----------------------------------------")

print(importance_df.to_string(index=False))


# ========================================
# 13. SAMPLE PREDICTIONS
# ========================================

results = test_df[
    ["Date", "BDI", "BDI_target_7"]
].copy()

results["random_forest_prediction"] = test_prediction

print()
print("SAMPLE PREDICTIONS")
print("----------------------------------------")

print(results.head(10).to_string(index=False))