import pandas as pd
from xgboost import XGBRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error
import numpy as np


# ========================================
# LOAD DATA
# ========================================

train_df = pd.read_csv("./data/train.csv")
validation_df = pd.read_csv("./data/validation.csv")
test_df = pd.read_csv("./data/test.csv")


# ========================================
# FEATURES AND TARGET
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


X_train = train_df[features]
y_train = train_df[target]

X_validation = validation_df[features]
y_validation = validation_df[target]

X_test = test_df[features]
y_test = test_df[target]


# ========================================
# MODEL
# ========================================

model = XGBRegressor(
    n_estimators=300,
    learning_rate=0.03,
    max_depth=3,
    min_child_weight=2,
    subsample=0.8,
    colsample_bytree=0.8,
    objective="reg:squarederror",
    random_state=42,
    n_jobs=-1
)


# ========================================
# TRAINING
# ========================================

print("========================================")
print("XGBOOST REGRESSION")
print("========================================")
print()

print(f"Training observations: {len(train_df)}")
print(f"Validation observations: {len(validation_df)}")
print(f"Test observations: {len(test_df)}")
print()
print(f"Number of features: {len(features)}")
print()

print("Training XGBoost...")
model.fit(X_train, y_train)
print("Training complete.")
print()


# ========================================
# VALIDATION PREDICTIONS
# ========================================

validation_predictions = model.predict(X_validation)

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


# ========================================
# TEST PREDICTIONS
# ========================================

test_predictions = model.predict(X_test)

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

print("VALIDATION RESULTS")
print("----------------------------------------")
print(f"MAE:  {validation_mae:.2f}")
print(f"RMSE: {validation_rmse:.2f}")
print()

print("TEST RESULTS")
print("----------------------------------------")
print(f"MAE:  {test_mae:.2f}")
print(f"RMSE: {test_rmse:.2f}")
print()


# ========================================
# MODEL COMPARISON
# ========================================

naive_mae = 188.51
naive_rmse = 265.94

linear_mae = 179.71
linear_rmse = 259.50

rf_mae = 201.11
rf_rmse = 273.41

gb_mae = 200.36
gb_rmse = 260.98


print("MODEL COMPARISON")
print("----------------------------------------")
print(f"{'Model':<30}{'MAE':>10}{'RMSE':>12}")
print("-----------------------------------------------")
print(f"{'Naive Baseline':<30}{naive_mae:>10.2f}{naive_rmse:>12.2f}")
print(f"{'Linear Regression':<30}{linear_mae:>10.2f}{linear_rmse:>12.2f}")
print(f"{'Random Forest':<30}{rf_mae:>10.2f}{rf_rmse:>12.2f}")
print(f"{'Gradient Boosting':<30}{gb_mae:>10.2f}{gb_rmse:>12.2f}")
print(f"{'XGBoost':<30}{test_mae:>10.2f}{test_rmse:>12.2f}")
print()


# ========================================
# IMPROVEMENT OVER NAIVE
# ========================================

mae_improvement_naive = (
    (naive_mae - test_mae) / naive_mae
) * 100

rmse_improvement_naive = (
    (naive_rmse - test_rmse) / naive_rmse
) * 100


print("IMPROVEMENT OVER NAIVE BASELINE")
print("----------------------------------------")
print(f"MAE improvement:  {mae_improvement_naive:.2f}%")
print(f"RMSE improvement: {rmse_improvement_naive:.2f}%")
print()


# ========================================
# IMPROVEMENT OVER LINEAR REGRESSION
# ========================================

mae_improvement_linear = (
    (linear_mae - test_mae) / linear_mae
) * 100

rmse_improvement_linear = (
    (linear_rmse - test_rmse) / linear_rmse
) * 100


print("IMPROVEMENT OVER LINEAR REGRESSION")
print("----------------------------------------")
print(f"MAE improvement:  {mae_improvement_linear:.2f}%")
print(f"RMSE improvement: {rmse_improvement_linear:.2f}%")
print()


# ========================================
# FEATURE IMPORTANCE
# ========================================

importance_df = pd.DataFrame({
    "Feature": features,
    "Importance": model.feature_importances_
})

importance_df = importance_df.sort_values(
    "Importance",
    ascending=False
)

print("FEATURE IMPORTANCE")
print("----------------------------------------")
print(
    importance_df.to_string(
        index=False,
        formatters={
            "Importance": "{:.6f}".format
        }
    )
)
print()


# ========================================
# SAMPLE PREDICTIONS
# ========================================

sample_predictions = test_df[
    ["Date", "BDI", "BDI_target_7"]
].copy()

sample_predictions["xgboost_prediction"] = test_predictions

print("SAMPLE PREDICTIONS")
print("----------------------------------------")
print(sample_predictions.head(10).to_string(index=False))