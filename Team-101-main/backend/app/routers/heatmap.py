from fastapi import APIRouter
from fastapi.responses import JSONResponse
import pandas as pd
import json
import os

router = APIRouter(prefix="/heatmap", tags=["heatmap"])

@router.get("/data")
def get_heatmap_data():
    """Get homeless population data and geojson for heatmap"""
    try:
        # Load homeless data
        df = pd.read_csv("heatmap_data/SD_homeless_data.csv")
        df['geoid'] = df['geoid'].astype(str).str.zfill(11)
        
        # Load GeoJSON
        with open("heatmap_data/tl_2024_06_tract.json", "r") as f:
            geojson_data = json.load(f)
        
        # Convert dataframe to dict
        homeless_data = df.to_dict('records')
        
        return {
            "homeless_data": homeless_data,
            "geojson": geojson_data,
            "summary": {
                "total_tracts": len(df),
                "tracts_with_homeless": int((df['homeless_d'] > 0).sum()),
                "total_homeless": float(df['homeless_d'].sum()),
                "average_per_tract": float(df['homeless_d'].mean()),
                "max_in_tract": float(df['homeless_d'].max())
            }
        }
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": str(e)}
        )
