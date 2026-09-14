#!/usr/bin/env python
import sys as _sys, pathlib as _pl; _ROOT = _pl.Path(__file__).resolve().parent.parent.parent  # scripts/evaluation/ -> repo root
"""Fix package_status default to the actual training value."""
import pandas as pd

df = pd.read_excel(str(_ROOT / 'data' / 'raw' / 'CHEESE_100_EXTERNAL_LITERATURE_TEST_CASES.xlsx'), sheet_name='External_Test_Cases')
print(f"Before: package_status unique = {df['package_status'].unique()}")

df['package_status'] = 'unopened'

df.to_excel(str(_ROOT / 'data' / 'raw' / 'CHEESE_100_EXTERNAL_LITERATURE_TEST_CASES.xlsx'), sheet_name='External_Test_Cases', index=False)
print("Fixed: package_status = 'unopened' for all rows")
