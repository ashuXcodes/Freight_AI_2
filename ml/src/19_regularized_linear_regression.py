import pandas as pd

from sklearn.linear_model import Ridge, Lasso, ElasticNet
from sklearn.metrics import mean_absolute_error, mean_squared_error


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

    "Panamax_change_1",
    "Supramax_change_1",
    "Handysize_change_1",

    "Panamax_vs_BDI",
    "Supramax_vs_BDI",
    "Handysize_vs_BDI",

    "Panamax_Supramax_spread",
    "Supramax_Handysize_spread",
    "Panamax_Handysize_spread",

    "month",
    "quarter",
    "day_of_week",
    "month_sin",
    "month_cos"
]

target = "BDI_target_7"


# ========================================
# PREPARE DATA
# ========================================

X_train = train_df[features]
y_train = train_df[target]

X_validation = validation_df[features]
y_validation = validation_df[target]

X_test = test_df[features]
y_test = test_df[target]


# ========================================
# EVALUATION FUNCTION
# ========================================

def evaluate_model(model, model_name):

    model.fit(X_train, y_train)

    validation_predictions = model.predict(X_validation)
    test_predictions = model.predict(X_test)

    validation_mae = mean_absolute_error(
        y_validation,
        validation_predictions
    )

    validation_rmse = mean_squared_error(
        y_validation,
        validation_predictions
    ) ** 0.5

    test_mae = mean_absolute_error(
        y_test,
        test_predictions
    )

    test_rmse = mean_squared_error(
        y_test,
        test_predictions
    ) ** 0.5

    print()
    print(model_name)
    print("-" * 40)

    print("Validation MAE: ", round(validation_mae, 2))
    print("Validation RMSE:", round(validation_rmse, 2))

    print("Test MAE:       ", round(test_mae, 2))
    print("Test RMSE:      ", round(test_rmse, 2))

    return {
        "Model": model_name,
        "Validation_MAE": validation_mae,
        "Validation_RMSE": validation_rmse,
        "Test_MAE": test_mae,
        "Test_RMSE": test_rmse
    }


# ========================================
# MODELS
# ========================================

models = [

    (
        Ridge(alpha=1.0),
        "Ridge Regression (alpha=1)"
    ),

    (
        Ridge(alpha=10.0),
        "Ridge Regression (alpha=10)"
    ),

    (
        Ridge(alpha=100.0),
        "Ridge Regression (alpha=100)"
    ),

    (
        Lasso(alpha=0.1, max_iter=10000),
        "Lasso Regression (alpha=0.1)"
    ),

    (
        Lasso(alpha=1.0, max_iter=10000),
        "Lasso Regression (alpha=1)"
    ),

    (
        ElasticNet(alpha=0.1, l1_ratio=0.5, max_iter=10000),
        "Elastic Net (alpha=0.1, l1_ratio=0.5)"
    ),

    (
        ElasticNet(alpha=1.0, l1_ratio=0.5, max_iter=10000),
        "Elastic Net (alpha=1, l1_ratio=0.5)"
    )
]


# ========================================
# RUN EXPERIMENTS
# ========================================

print("=" * 50)
print("REGULARIZED LINEAR REGRESSION")
print("=" * 50)

print()
print("Training observations:", len(train_df))
print("Validation observations:", len(validation_df))
print("Test observations:", len(test_df))
print("Number of features:", len(features))


results = []

for model, model_name in models:

    result = evaluate_model(model, model_name)

    results.append(result)


# ========================================
# RESULTS TABLE
# ========================================

results_df = pd.DataFrame(results)

print()
print("=" * 50)
print("MODEL COMPARISON")
print("=" * 50)

print(
    results_df[
        [
            "Model",
            "Validation_MAE",
            "Validation_RMSE",
            "Test_MAE",
            "Test_RMSE"
        ]
    ].round(2).to_string(index=False)
)


# ========================================
# BEST MODEL
# ========================================

best_model = results_df.loc[
    results_df["Test_MAE"].idxmin()
]

print()
print("=" * 50)
print("BEST REGULARIZED MODEL")
print("=" * 50)

print("Model:", best_model["Model"])
print("Test MAE:", round(best_model["Test_MAE"], 2))
print("Test RMSE:", round(best_model["Test_RMSE"], 2))


# ========================================
# SAVE RESULTS
# ========================================

results_df.to_csv(
    "./data/regularized_linear_results.csv",
    index=False
)

print()
print("Results saved to:")
print("./data/regularized_linear_results.csv")