#!/usr/bin/env python
import sys as _sys, pathlib as _pl; _ROOT = _pl.Path(__file__).resolve().parent.parent.parent  # scripts/evaluation/ -> repo root
"""Add missing columns to external test dataset"""
import pandas as pd

df = pd.read_excel(str(_ROOT / 'data' / 'raw' / 'CHEESE_100_EXTERNAL_LITERATURE_TEST_CASES.xlsx'), sheet_name='External_Test_Cases')

print(f"Original: {len(df)} rows × {len(df.columns)} columns")

if 'product_form' not in df.columns:
    df['product_form'] = 'intact_unspecified'
    print("Added product_form = 'intact_unspecified'")

if 'package_status' not in df.columns:
    df['package_status'] = 'intact'
    print("Added package_status = 'intact'")

df.to_excel(str(_ROOT / 'data' / 'raw' / 'CHEESE_100_EXTERNAL_LITERATURE_TEST_CASES.xlsx'), sheet_name='External_Test_Cases', index=False)

print(f"Updated: {len(df)} rows × {len(df.columns)} columns")
print("File saved successfully!")
