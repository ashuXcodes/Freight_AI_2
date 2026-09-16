import pandas as pd
from sklearn.linear_model import LinearRegression


print("=" * 60)
print("CURRENT BDI FORECAST")
print("=" * 60)


# ============================================================
# 1. FEATURES
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


# ============================================================
# 2. LOAD TRAINING DATA
# ============================================================

training_df = pd.read_csv(
    "./data/bdi_only_training.csv"
)

training_df["Date"] = pd.to_datetime(
    training_df["Date"]
)

training_df = training_df.sort_values(
    "Date"
).reset_index(drop=True)


print()
print("TRAINING DATA")
print("-" * 60)

print(
    f"Training observations: {len(training_df)}"
)

print(
    f"Training period: "
    f"{training_df['Date'].min().date()} "
    f"to "
    f"{training_df['Date'].max().date()}"
)

print(
    f"Number of features: {len(features)}"
)


# ============================================================
# 3. TRAIN FINAL MODEL
# ============================================================

X_train = training_df[features]
y_train = training_df[target]

model = LinearRegression()

model.fit(
    X_train,
    y_train
)


print()
print("FINAL MODEL TRAINED")
print("-" * 60)

print("Model: Linear Regression")


# ============================================================
# 4. LOAD FULL MARKET DATA
# ============================================================

market_df = pd.read_csv(
    "./data/freight_market_advanced_features.csv"
)

market_df["Date"] = pd.to_datetime(
    market_df["Date"]
)

market_df = market_df.sort_values(
    "Date"
).reset_index(drop=True)


# ============================================================
# 5. FIND LATEST COMPLETE BDI FEATURE ROW
# ============================================================

latest_available = market_df.dropna(
    subset=features
).iloc[-1]


latest_date = latest_available["Date"]
current_bdi = latest_available["BDI"]


print()
print("LATEST MARKET OBSERVATION")
print("-" * 60)

print(
    f"Date: {latest_date.date()}"
)

print(
    f"Current BDI: {current_bdi:.2f}"
)


# ============================================================
# 6. GENERATE FORECAST
# ============================================================

latest_features = latest_available[
    features
].values.reshape(1, -1)

forecast = model.predict(
    latest_features
)[0]


# ============================================================
# 7. CALCULATE CHANGE
# ============================================================

absolute_change = forecast - current_bdi

percentage_change = (
    absolute_change / current_bdi
) * 100


if percentage_change > 2:
    direction = "RISING"
elif percentage_change < -2:
    direction = "FALLING"
else:
    direction = "STABLE"


# ============================================================
# 8. DISPLAY RESULT
# ============================================================

print()
print("=" * 60)
print("FORECAST RESULT")
print("=" * 60)

print()

print(
    f"Forecast horizon: 7 observations ahead"
)

print(
    f"Current BDI:       {current_bdi:.2f}"
)

print(
    f"Forecast BDI:      {forecast:.2f}"
)

print(
    f"Expected change:   {absolute_change:+.2f}"
)

print(
    f"Expected change %: {percentage_change:+.2f}%"
)

print(
    f"Direction:         {direction}"
)


# ============================================================
# 9. DATA CLASSIFICATION
# ============================================================

print()
print("=" * 60)
print("MODEL / DATA CLASSIFICATION")
print("=" * 60)

print()

print("Model: Linear Regression")
print("Features: BDI historical behavior only")
print("Training data: Historical BDI observations")
print("Data classification: DEMO / HISTORICAL-DATA MODEL")

print()
print(
    "Important: This is a prototype forecast based on "
    "historical BDI behavior. It is not a live freight-rate "
    "prediction and should not be treated as a commercial "
    "market quote."
)


# ============================================================
# 10. SAVE FORECAST
# ============================================================

forecast_result = pd.DataFrame([{
    "forecast_date": latest_date,
    "current_bdi": current_bdi,
    "forecast_horizon_observations": 7,
    "forecast_bdi": forecast,
    "absolute_change": absolute_change,
    "percentage_change": percentage_change,
    "direction": direction,
    "model": "Linear Regression",
    "feature_count": len(features),
    "data_classification": "DEMO / HISTORICAL-DATA MODEL"
}])


output_path = "./data/current_bdi_forecast.csv"

try:
    forecast_result.to_csv(
        output_path,
        index=False
    )

    print()
    print("Forecast saved to:")
    print(output_path)

except PermissionError:
    print()
    print("WARNING: Could not save forecast.")
    print(
        "Close current_bdi_forecast.csv if it is open "
        "in Excel or another program and run again."
    )