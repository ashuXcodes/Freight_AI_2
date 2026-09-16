import pandas as pd
import numpy as np

from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error


print("=" * 60)
print("BDI-ONLY WALK-FORWARD VALIDATION")
print("=" * 60)


# ============================================================
# 1. LOAD DATA
# ============================================================

df = pd.read_csv("./data/bdi_only_training.csv")

df["Date"] = pd.to_datetime(df["Date"])

df = df.sort_values("Date").reset_index(drop=True)


# ============================================================
# 2. FEATURES
# ============================================================

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


# ============================================================
# 3. WALK-FORWARD SETTINGS
# ============================================================

initial_train_size = int(len(df) * 0.60)

validation_size = 7

print()
print("DATA")
print("-" * 60)

print(f"Total observations: {len(df)}")
print(f"Initial training size: {initial_train_size}")
print(f"Validation block size: {validation_size}")
print(f"Number of features: {len(features)}")


# ============================================================
# 4. STORAGE
# ============================================================

results = []


# ============================================================
# 5. WALK-FORWARD VALIDATION
# ============================================================

train_end = initial_train_size

fold = 1


while train_end + validation_size <= len(df):

    validation_start = train_end
    validation_end = train_end + validation_size

    # -----------------------------
    # Training data
    # -----------------------------

    X_train = X.iloc[:train_end]
    y_train = y.iloc[:train_end]

    # -----------------------------
    # Validation data
    # -----------------------------

    X_validation = X.iloc[validation_start:validation_end]
    y_validation = y.iloc[validation_start:validation_end]

    # ========================================================
    # NAIVE BASELINE
    # ========================================================

    naive_predictions = df.iloc[
        validation_start:validation_end
    ]["BDI"].values

    # ========================================================
    # LINEAR REGRESSION
    # ========================================================

    model = LinearRegression()

    model.fit(X_train, y_train)

    linear_predictions = model.predict(X_validation)

    # ========================================================
    # METRICS
    # ========================================================

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

    # ========================================================
    # STORE RESULTS
    # ========================================================

    results.append({
        "fold": fold,

        "train_start": df.iloc[0]["Date"],
        "train_end": df.iloc[train_end - 1]["Date"],

        "validation_start": df.iloc[validation_start]["Date"],
        "validation_end": df.iloc[validation_end - 1]["Date"],

        "naive_mae": naive_mae,
        "naive_rmse": naive_rmse,

        "linear_mae": linear_mae,
        "linear_rmse": linear_rmse
    })

    # Move forward
    train_end += validation_size

    fold += 1


# ============================================================
# 6. RESULTS DATAFRAME
# ============================================================

results_df = pd.DataFrame(results)


# ============================================================
# 7. SUMMARY
# ============================================================

print()
print("=" * 60)
print("WALK-FORWARD SUMMARY")
print("=" * 60)

print()

print(
    f"Number of folds: {len(results_df)}"
)

print()

print("NAIVE BASELINE")
print("-" * 60)

print(
    f"Average MAE:  "
    f"{results_df['naive_mae'].mean():.2f}"
)

print(
    f"Average RMSE: "
    f"{results_df['naive_rmse'].mean():.2f}"
)

print()

print("BDI-ONLY LINEAR REGRESSION")
print("-" * 60)

print(
    f"Average MAE:  "
    f"{results_df['linear_mae'].mean():.2f}"
)

print(
    f"Average RMSE: "
    f"{results_df['linear_rmse'].mean():.2f}"
)


# ============================================================
# 8. IMPROVEMENT
# ============================================================

naive_mae_avg = results_df["naive_mae"].mean()
linear_mae_avg = results_df["linear_mae"].mean()

naive_rmse_avg = results_df["naive_rmse"].mean()
linear_rmse_avg = results_df["linear_rmse"].mean()


mae_improvement = (
    (naive_mae_avg - linear_mae_avg)
    / naive_mae_avg
) * 100


rmse_improvement = (
    (naive_rmse_avg - linear_rmse_avg)
    / naive_rmse_avg
) * 100


print()
print("=" * 60)
print("IMPROVEMENT OVER NAIVE")
print("=" * 60)

print(
    f"MAE improvement:  "
    f"{mae_improvement:.2f}%"
)

print(
    f"RMSE improvement: "
    f"{rmse_improvement:.2f}%"
)


# ============================================================
# 9. STABILITY
# ============================================================

print()
print("=" * 60)
print("MODEL STABILITY")
print("=" * 60)

print()

print("Naive MAE std:",
      f"{results_df['naive_mae'].std():.2f}")

print("Linear MAE std:",
      f"{results_df['linear_mae'].std():.2f}")

print()

print("Naive RMSE std:",
      f"{results_df['naive_rmse'].std():.2f}")

print("Linear RMSE std:",
      f"{results_df['linear_rmse'].std():.2f}")


# ============================================================
# 10. WIN COUNT
# ============================================================

linear_mae_wins = (
    results_df["linear_mae"]
    < results_df["naive_mae"]
).sum()

linear_rmse_wins = (
    results_df["linear_rmse"]
    < results_df["naive_rmse"]
).sum()


print()
print("=" * 60)
print("FOLD WIN COUNT")
print("=" * 60)

print()

print(
    f"Linear better MAE:  "
    f"{linear_mae_wins}/{len(results_df)} folds"
)

print(
    f"Linear better RMSE: "
    f"{linear_rmse_wins}/{len(results_df)} folds"
)


# ============================================================
# 11. SAVE RESULTS
# ============================================================

output_path = "./data/bdi_only_walk_forward_results.csv"

results_df.to_csv(
    output_path,
    index=False
)

print()
print("=" * 60)
print("RESULTS SAVED")
print("=" * 60)

print(output_path)