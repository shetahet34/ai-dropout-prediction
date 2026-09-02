#!/usr/bin/env python
# coding: utf-8

# In[4]:


import sqlite3
import json
import pandas as pd
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


# In[5]:


app = FastAPI(title="Student Risk Dashboard API")


# In[6]:


app.add_middleware(CORSMiddleware,allow_origins=["*"],allow_methods=["*"],allow_headers=["*"])


# In[7]:


DB_PATH = r"C:\Users\01\problem\database\project_current.db"


# In[8]:


def _decode_json_columns(df:pd.DataFrame)->pd.DataFrame : 
    df["risk_factors"] = df["risk_factors"].apply(json.loads)
    df["protective_factors"] = df["protective_factors"].apply(json.loads)
    df["triggered_rules"] = df["triggered_rules"].apply(json.loads)
    return df


# In[11]:


@app.get("/students/at-risk")
def get_at_risk_students() : 
    conn = sqlite3.connect(DB_PATH)
    df = pd.read_sql("""SELECT * FROM student_risk_scores
        WHERE scored_at = (SELECT MAX(scored_at) FROM student_risk_scores)
        ORDER BY dropout_probability DESC""",conn,)
    conn.close()
    df = _decode_json_columns(df)
    return df.to_dict("records")



# In[12]:


@app.get("/students/{student_id}")
def get_student(student_id: str) : 
    conn = sqlite3.connect(DB_PATH)
    df = pd.read_sql("""SELECT * FROM student_risk_scores
        WHERE student_id = ?
        ORDER BY scored_at DESC LIMIT 1""",conn,params=(student_id,),)
    conn.close()
    if df.empty:
        return {"error": "student not found"}

    df = _decode_json_columns(df)
    return df.iloc[0].to_dict()


# In[ ]:




