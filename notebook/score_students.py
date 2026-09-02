#!/usr/bin/env python
# coding: utf-8

import os
import sys
import json
import joblib
import sqlite3
from datetime import datetime
from pathlib import Path
import numpy as np
import pandas as pd

try:
    import shap
    HAVE_SHAP = True
except ImportError:
    HAVE_SHAP = False


def score_students(students_df, attendance_df, assessments_df, fees_df,
                   model_path="student_risk_model_previous.pkl",
                   threshold_path="threshold.pkl",
                   expected_columns_path="expected_columns.pkl",
                   scores_path="scores.pkl",
                   obj_col_path="obj_col.pkl"):

    df = (students_df
          .merge(attendance_df, on="student_id", how="left")
          .merge(assessments_df, on="student_id", how="left")
          .merge(fees_df, on="student_id", how="left"))

    final_model = joblib.load(model_path)
    threshold = joblib.load(threshold_path)
    expected_columns = joblib.load(expected_columns_path)
    scores = joblib.load(scores_path)
    obj_col = joblib.load(obj_col_path)

    preprocessor = final_model.named_steps["preprocessor"]
    model = final_model.named_steps["model"]

    current_attendance = ['attendance_pct_Feb_2026', 'attendance_pct_Mar_2026', 'attendance_pct_Apr_2026',
                          'attendance_pct_May_2026', 'attendance_pct_Jun_2026', 'attendance_pct_Jul_2026']
    monthly_attendance = ['attendance_pct_Feb_2025', 'attendance_pct_Mar_2025', 'attendance_pct_Apr_2025',
                          'attendance_pct_May_2025', 'attendance_pct_Jun_2025', 'attendance_pct_Jul_2025']
    attendance_mapping = dict(zip(monthly_attendance, current_attendance[:len(monthly_attendance)]))

    X_current = df.copy()
    for old_col, current_col in attendance_mapping.items():
        if current_col in df.columns:
            X_current[old_col] = df[current_col]

    x_current = X_current[expected_columns].copy()

    y_prob = final_model.predict_proba(x_current)[:, 1]
    y_pred = (y_prob >= threshold).astype(int)

    x_transformed = preprocessor.transform(x_current)
    feature_names = preprocessor.get_feature_names_out()

    if HAVE_SHAP:
        try:
            explainer = shap.TreeExplainer(model)
            shap_values = explainer.shap_values(x_transformed)
            if isinstance(shap_values, list) and len(shap_values) > 1:
                shap_values = shap_values[1]
            elif isinstance(shap_values, np.ndarray) and len(shap_values.shape) == 3:
                shap_values = shap_values[:, :, 1]
        except Exception:
            importances = getattr(model, "feature_importances_", np.ones(x_transformed.shape[1]))
            shap_values = (x_transformed - np.mean(x_transformed, axis=0)) * importances
    else:
        importances = getattr(model, "feature_importances_", np.ones(x_transformed.shape[1]))
        shap_values = (x_transformed - np.mean(x_transformed, axis=0)) * importances

    def get_original_feature(name):
        name = name.split("__")[-1]
        for col in obj_col:
            if name.startswith(col + "_"):
                return col
        for col in scores:
            if name.startswith(col + "_missing"):
                return col
        return name

    shap_result = []
    for i in range(len(x_current)):
        student_shap = pd.DataFrame({"Feature": feature_names, "shap values": shap_values[i]})
        student_shap["Original Feature"] = student_shap["Feature"].apply(get_original_feature)
        agg = student_shap.groupby("Original Feature")["shap values"].sum().reset_index()

        increasing = agg[agg["shap values"] > 0].sort_values("shap values", ascending=False).head(5)
        decreasing = agg[agg["shap values"] < 0].sort_values("shap values", ascending=True).head(5)

        shap_result.append({
            "student_id": df.iloc[i]["student_id"],
            "risk_factors": increasing.to_dict("records"),
            "protective_factors": decreasing.to_dict("records"),
        })

    result_df = pd.DataFrame({
        "student_id": df["student_id"],
        "dropout_probability": y_prob,
        "dropout_prediction": y_pred,
    })
    result_df = result_df.merge(df[[
        "student_id", "student_name", "class_section", "mentor_name", "stream",
        "latest_attendance_pct", "avg_attendance_pct", "attendance_trend",
        "avg_score_previous", "avg_score_latest", "score_trend",
        "subjects_failing_now", "max_attempts_any_subject", "max_days_overdue",
    ]], on="student_id", how="left")

    shap_df = pd.DataFrame(shap_result)
    final_student_data = result_df.merge(shap_df, on="student_id", how="left")

    def apply_rule_thresholds(d):
        rules = pd.DataFrame(index=d.index)
        rules["low_attendance"] = d["avg_attendance_pct"] < 75
        rules["multiple_fails"] = d["subjects_failing_now"] >= 2
        rules["repeated_attempts"] = d["max_attempts_any_subject"] >= 3
        rules["fee_overdue"] = d["max_days_overdue"] > 30
        rules["declining_scores"] = d["score_trend"] < 0

        rules["rule_flag_count"] = rules.sum(axis=1)
        rules["triggered_rules"] = rules.drop(columns="rule_flag_count").apply(
            lambda row: [c for c in row.index if row[c]], axis=1
        )
        return rules[["rule_flag_count", "triggered_rules"]]

    def assign_risk_band(row):
        if row["dropout_prediction"] == 1 or row["rule_flag_count"] >= 2:
            return "red"
        elif row["dropout_probability"] >= 0.3 or row["rule_flag_count"] == 1:
            return "amber"
        return "green"

    rule_results = apply_rule_thresholds(final_student_data)
    final_student_data = pd.concat([final_student_data, rule_results], axis=1)
    final_student_data["risk_band"] = final_student_data.apply(assign_risk_band, axis=1)
    final_student_data["triggered_rules"] = final_student_data["triggered_rules"].apply(json.dumps)

    final_student_data["risk_factors"] = final_student_data["risk_factors"].apply(json.dumps)
    final_student_data["protective_factors"] = final_student_data["protective_factors"].apply(json.dumps)
    final_student_data["scored_at"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    return final_student_data


if __name__ == "__main__":
    current_dir = Path(r"C:\Users\01\problem\dataset\data\current")
    db_path = Path(r"C:\Users\01\problem\database\project_current.db")

    stu = pd.read_excel(current_dir / "student_master.xlsx")
    att = pd.read_excel(current_dir / "attendance_data.xlsx")
    ass = pd.read_excel(current_dir / "assessment_data.xlsx")
    fee = pd.read_excel(current_dir / "fee_payment_data.xlsx")

    conn = sqlite3.connect(db_path)
    stu.to_sql("students", conn, if_exists="replace", index=False)
    att.to_sql("attendance", conn, if_exists="replace", index=False)
    ass.to_sql("assessments", conn, if_exists="replace", index=False)
    fee.to_sql("fees", conn, if_exists="replace", index=False)

    scored = score_students(stu, att, ass, fee)
    scored.to_sql("student_risk_scores", conn, if_exists="replace", index=False)
    conn.execute("CREATE UNIQUE INDEX IF NOT EXISTS idx_student_risk_scores_id ON student_risk_scores(student_id);")
    conn.commit()
    conn.close()

    print(f"Scored {len(scored)} active students.")
    print("Risk Band Breakdown:")
    print(scored['risk_band'].value_counts())
