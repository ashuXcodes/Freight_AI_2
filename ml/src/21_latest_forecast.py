import pandas as pd
from sklearn.linear_model import LinearRegression


# ========================================
# LOAD ADVANCED FEATURE DATA
# ========================================

df = pd.read_csv("./data/freight_market_advanced_features.csv")

df["Date"] = pd.to_datetime(df["Date"])

df = df.sort_values("Date").reset_index(drop=True)


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
# CREATE HISTORICAL TRAINING DATA
# ========================================

training_df = df.dropna(
    subset=features + [target]
).copy()

X_train = training_df[features]
y_train = training_df[target]


print("=" * 50)
print("FREIGHTAI LATEST BDI FORECAST")
print("=" * 50)

print()
print("Historical training observations:", len(training_df))
print("Number of features:", len(features))


# ========================================
# TRAIN FINAL MODEL
# ========================================

model = LinearRegression()

model.fit(X_train, y_train)


# ========================================
# FIND LATEST AVAILABLE FEATURE ROW
# ========================================

latest_available_df = df.dropna(
    subset=features
).copy()

latest_row = latest_available_df.iloc[-1]


latest_date = latest_row["Date"]

current_bdi = latest_row["BDI"]


# ========================================
# GENERATE FORECAST
# ========================================

X_latest = latest_row[features].to_frame().T

forecast_bdi = model.predict(X_latest)[0]


# ========================================
# FORECAST MOVEMENT
# ========================================

forecast_change = forecast_bdi - current_bdi

forecast_change_pct = (
    forecast_change / current_bdi
) * 100


# ========================================
# DETERMINE MARKET DIRECTION
# ========================================

if forecast_change_pct > 2:

    direction = "RISING"

elif forecast_change_pct < -2:

    direction = "FALLING"

else:

    direction = "STABLE"


# ========================================
# DISPLAY RESULTS
# ========================================

print()
print("LATEST MARKET OBSERVATION")
print("-" * 40)

print(
    "Date:",
    latest_date.strftime("%Y-%m-%d")
)

print(
    "Current BDI:",
    round(current_bdi, 2)
)


print()
print("FORECAST")
print("-" * 40)

print(
    "Forecast horizon:",
    "7 market observations"
)

print(
    "Forecast BDI:",
    round(forecast_bdi, 2)
)


print()
print("FORECAST MOVEMENT")
print("-" * 40)

print(
    "Change:",
    round(forecast_change, 2)
)

print(
    "Change %:",
    round(forecast_change_pct, 2),
    "%"
)

print(
    "Direction:",
    direction
)


print()
print("MODEL")
print("-" * 40)

print("Model: Linear Regression")

print(
    "Training observations:",
    len(training_df)
)

print(
    "Features:",
    len(features)
)

print(
    "Target:",
    target
)


print()
print("DATA CLASSIFICATION")
print("-" * 40)

print("DEMO / HISTORICAL-DATA MODEL")

print(
    "Forecast is generated from historical "
    "dry-bulk market index data."
)

print(
    "It is not a live market prediction."
)


# ========================================
# SAVE FORECAST
# ========================================

forecast_output = pd.DataFrame([
    {
        "forecast_generated_from": latest_date,
        "current_bdi": current_bdi,
        "forecast_horizon_observations": 7,
        "forecast_bdi": forecast_bdi,
        "forecast_change": forecast_change,
        "forecast_change_pct": forecast_change_pct,
        "direction": direction,
        "model": "Linear Regression",
        "feature_count": len(features),
        "training_observations": len(training_df),
        "data_classification": "DEMO / HISTORICAL-DATA MODEL"
    }
])


forecast_output.to_csv(
    "./data/latest_bdi_forecast.csv",
    index=False
)


print()
print("Forecast saved to:")
print("./data/latest_bdi_forecast.csv")