import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import StandardScaler


# ========================================
# LOAD DATA
# ========================================

train_df = pd.read_csv("./data/advanced_train.csv")


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
# PREPARE DATA
# ========================================

X = train_df[features]
y = train_df[target]


# ========================================
# STANDARDIZE FEATURES
# ========================================

scaler = StandardScaler()

X_scaled = scaler.fit_transform(X)


# ========================================
# TRAIN LINEAR REGRESSION
# ========================================

model = LinearRegression()

model.fit(X_scaled, y)


# ========================================
# CREATE COEFFICIENT TABLE
# ========================================

coefficients = pd.DataFrame({
    "Feature": features,
    "Coefficient": model.coef_
})


# Absolute coefficient magnitude

coefficients["Absolute_Importance"] = (
    coefficients["Coefficient"].abs()
)


# Sort by importance

coefficients = coefficients.sort_values(
    "Absolute_Importance",
    ascending=False
).reset_index(drop=True)


# ========================================
# DISPLAY RESULTS
# ========================================

print("========================================")
print("LINEAR REGRESSION FEATURE IMPORTANCE")
print("========================================")

print("\nFeatures ranked by standardized coefficient:")
print("----------------------------------------")

print(
    coefficients.to_string(index=False)
)


# ========================================
# TOP FEATURES
# ========================================

print("\n========================================")
print("TOP 15 FEATURES")
print("========================================")

print(
    coefficients.head(15).to_string(index=False)
)


# ========================================
# POSITIVE / NEGATIVE FEATURES
# ========================================

print("\n========================================")
print("STRONG POSITIVE FEATURES")
print("========================================")

positive = coefficients[
    coefficients["Coefficient"] > 0
].head(10)

print(
    positive.to_string(index=False)
)


print("\n========================================")
print("STRONG NEGATIVE FEATURES")
print("========================================")

negative = coefficients[
    coefficients["Coefficient"] < 0
].head(10)

print(
    negative.to_string(index=False)
)


# ========================================
# SAVE RESULTS
# ========================================

output_path = "./data/linear_feature_importance.csv"

coefficients.to_csv(
    output_path,
    index=False
)

print("\n========================================")
print("RESULT SAVED")
print("========================================")

print(output_path)