import pandas as pd
import numpy as np

from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error

from xgboost import XGBRegressor
import lightgbm as lgb


# ========================================
# LOAD DATA
# ========================================

df = pd.read_csv("./data/freight_market_training.csv")

df["Date"] = pd.to_datetime(df["Date"])
df = df.sort_values("Date").reset_index(drop=True)


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


# ========================================
# WALK-FORWARD SETTINGS
# ========================================

# We use approximately 60% of the data
# for the initial training window.

initial_train_size = int(len(df) * 0.60)

# Each fold will predict the next block of observations.
# 7 observations correspond to our forecasting horizon.

validation_size = 7


# ========================================
# RESULTS STORAGE
# ========================================

results = []


# ========================================
# WALK-FORWARD VALIDATION
# ========================================

print("========================================")
print("WALK-FORWARD TIME-SERIES VALIDATION")
print("========================================")
print()

print(f"Total observations: {len(df)}")
print(f"Initial training observations: {initial_train_size}")
print(f"Validation window: {validation_size} observations")
print()


fold = 1
train_end = initial_train_size


while train_end + validation_size <= len(df):

    # ------------------------------------
    # TRAIN / VALIDATION DATA
    # ------------------------------------

    train_df = df.iloc[:train_end].copy()

    validation_df = df.iloc[
        train_end:train_end + validation_size
    ].copy()


    X_train = train_df[features]
    y_train = train_df[target]

    X_validation = validation_df[features]
    y_validation = validation_df[target]


    # ------------------------------------
    # NAIVE BASELINE
    # ------------------------------------

    naive_predictions = validation_df["BDI"].values

    naive_mae = mean_absolute_error(
        y_validation,
        naive_predictions
    )

    naive_rmse = np.sqrt(
        mean_squared_error(
            y_validation,
            naive_predictions
        )
    )


    # ------------------------------------
    # LINEAR REGRESSION
    # ------------------------------------

    linear_model = LinearRegression()

    linear_model.fit(
        X_train,
        y_train
    )

    linear_predictions = linear_model.predict(
        X_validation
    )

    linear_mae = mean_absolute_error(
        y_validation,
        linear_predictions
    )

    linear_rmse = np.sqrt(
        mean_squared_error(
            y_validation,
            linear_predictions
        )
    )


    # ------------------------------------
    # XGBOOST
    # ------------------------------------

    xgb_model = XGBRegressor(
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

    xgb_model.fit(
        X_train,
        y_train
    )

    xgb_predictions = xgb_model.predict(
        X_validation
    )

    xgb_mae = mean_absolute_error(
        y_validation,
        xgb_predictions
    )

    xgb_rmse = np.sqrt(
        mean_squared_error(
            y_validation,
            xgb_predictions
        )
    )


    # ------------------------------------
    # LIGHTGBM
    # ------------------------------------

    lgb_model = lgb.LGBMRegressor(
        n_estimators=300,
        learning_rate=0.03,
        max_depth=3,
        num_leaves=15,
        min_child_samples=20,
        subsample=0.8,
        colsample_bytree=0.8,
        objective="regression",
        random_state=42,
        n_jobs=-1,
        verbosity=-1
    )

    lgb_model.fit(
        X_train,
        y_train
    )

    lgb_predictions = lgb_model.predict(
        X_validation
    )

    lgb_mae = mean_absolute_error(
        y_validation,
        lgb_predictions
    )

    lgb_rmse = np.sqrt(
        mean_squared_error(
            y_validation,
            lgb_predictions
        )
    )


    # ------------------------------------
    # SAVE FOLD RESULTS
    # ------------------------------------

    results.append({
        "Fold": fold,

        "Train_Start": train_df["Date"].iloc[0],
        "Train_End": train_df["Date"].iloc[-1],

        "Validation_Start": validation_df["Date"].iloc[0],
        "Validation_End": validation_df["Date"].iloc[-1],

        "Naive_MAE": naive_mae,
        "Naive_RMSE": naive_rmse,

        "Linear_MAE": linear_mae,
        "Linear_RMSE": linear_rmse,

        "XGBoost_MAE": xgb_mae,
        "XGBoost_RMSE": xgb_rmse,

        "LightGBM_MAE": lgb_mae,
        "LightGBM_RMSE": lgb_rmse
    })


    # ------------------------------------
    # DISPLAY FOLD RESULTS
    # ------------------------------------

    print(f"FOLD {fold}")
    print("----------------------------------------")

    print(
        f"Training:   "
        f"{train_df['Date'].iloc[0].date()} "
        f"→ "
        f"{train_df['Date'].iloc[-1].date()}"
    )

    print(
        f"Validation: "
        f"{validation_df['Date'].iloc[0].date()} "
        f"→ "
        f"{validation_df['Date'].iloc[-1].date()}"
    )

    print()

    print(
        f"Naive       MAE: {naive_mae:.2f} "
        f"| RMSE: {naive_rmse:.2f}"
    )

    print(
        f"Linear      MAE: {linear_mae:.2f} "
        f"| RMSE: {linear_rmse:.2f}"
    )

    print(
        f"XGBoost     MAE: {xgb_mae:.2f} "
        f"| RMSE: {xgb_rmse:.2f}"
    )

    print(
        f"LightGBM    MAE: {lgb_mae:.2f} "
        f"| RMSE: {lgb_rmse:.2f}"
    )

    print()


    # ------------------------------------
    # MOVE FORWARD
    # ------------------------------------

    train_end += validation_size
    fold += 1


# ========================================
# RESULTS DATAFRAME
# ========================================

results_df = pd.DataFrame(results)


# ========================================
# AVERAGE PERFORMANCE
# ========================================

print("========================================")
print("AVERAGE WALK-FORWARD PERFORMANCE")
print("========================================")
print()

average_results = pd.DataFrame({
    "Model": [
        "Naive Baseline",
        "Linear Regression",
        "XGBoost",
        "LightGBM"
    ],

    "Average MAE": [
        results_df["Naive_MAE"].mean(),
        results_df["Linear_MAE"].mean(),
        results_df["XGBoost_MAE"].mean(),
        results_df["LightGBM_MAE"].mean()
    ],

    "Average RMSE": [
        results_df["Naive_RMSE"].mean(),
        results_df["Linear_RMSE"].mean(),
        results_df["XGBoost_RMSE"].mean(),
        results_df["LightGBM_RMSE"].mean()
    ]
})


print(
    average_results.to_string(
        index=False,
        formatters={
            "Average MAE": "{:.2f}".format,
            "Average RMSE": "{:.2f}".format
        }
    )
)

print()


# ========================================
# STANDARD DEVIATION
# ========================================

print("MODEL STABILITY")
print("----------------------------------------")

for model_name in ["Naive", "Linear", "XGBoost", "LightGBM"]:

    mae_column = f"{model_name}_MAE"
    rmse_column = f"{model_name}_RMSE"

    mae_std = results_df[mae_column].std()
    rmse_std = results_df[rmse_column].std()

    display_name = {
        "Naive": "Naive Baseline",
        "Linear": "Linear Regression",
        "XGBoost": "XGBoost",
        "LightGBM": "LightGBM"
    }[model_name]

    print(
        f"{display_name:<20}"
        f"MAE Std: {mae_std:.2f}   "
        f"RMSE Std: {rmse_std:.2f}"
    )

print()


# ========================================
# SAVE RESULTS
# ========================================

output_path = "./data/walk_forward_results.csv"

results_df.to_csv(
    output_path,
    index=False
)

print("Detailed fold results saved to:")
print(output_path)