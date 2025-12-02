import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
from datetime import datetime, timedelta
import json
import os

st.set_page_config(
    page_title="VoiceLink Analytics",
    layout="wide",
    initial_sidebar_state="collapsed"
)

st.markdown("""
    <style>
    /* Import Google Fonts */
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
    
    * {
        font-family: 'Inter', sans-serif;
    }
    
    /* Dark animated gradient background */
    .main {
        background: linear-gradient(-45deg, #121212, #1a1a1a, #0d0d0d, #121212);
        background-size: 400% 400%;
        animation: gradientShift 15s ease infinite;
    }
    
    @keyframes gradientShift {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
    }
    
    /* Reduce padding */
    .block-container {
        padding-top: 1rem;
        padding-bottom: 1rem;
        max-width: 1400px;
    }
    
    /* Dark glassmorphism for metrics with top line */
    .stMetric {
        background: rgba(18, 18, 18, 0.95);
        backdrop-filter: blur(10px);
        padding: 20px;
        border-radius: 15px;
        border: 1px solid rgba(187, 134, 252, 0.3);
        box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.4);
        transition: all 0.3s ease;
        animation: fadeInUp 0.6s ease-out;
        position: relative;
        overflow: hidden;
    }
    
    /* Gradient line on top of metric cards */
    .stMetric::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: linear-gradient(90deg, #BB86FC 0%, #3700B3 50%, #03DAC6 100%);
    }
    
    .stMetric:hover {
        transform: translateY(-5px);
        box-shadow: 0 12px 40px 0 rgba(187, 134, 252, 0.3);
        background: rgba(18, 18, 18, 1);
        border-color: rgba(187, 134, 252, 0.5);
    }
    
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    /* Animated title with gradient */
    h1 {
        background: #FFFFFF;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        font-size: 3rem !important;
        font-weight: 700 !important;
        margin-bottom: 0.5rem !important;
        animation: slideInLeft 0.8s ease-out;
    }
    
    @keyframes slideInLeft {
        from {
            opacity: 0;
            transform: translateX(-50px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    .subtitle {
        color: #FFFFFF;
        font-size: 1.1rem;
        margin-bottom: 2rem !important;
        animation: slideInLeft 0.8s ease-out 0.2s both;
    }
    
    /* Subheaders */
    h3 {
        color: #FFFFFF;
        font-weight: 600;
        margin-top: 2rem;
        margin-bottom: 1rem;
        animation: fadeIn 0.6s ease-out;
    }
    
    h4 {
        color: #FFFFFF;
        font-weight: 600;
    }
    
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    /* Dark chart containers with glassmorphism and top line */
    .element-container div[data-testid="stPlotlyChart"] {
        background: rgba(18, 18, 18, 0.95);
        backdrop-filter: blur(10px);
        border-radius: 15px;
        padding: 15px;
        border: 1px solid rgba(187, 134, 252, 0.3);
        box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.4);
        animation: fadeInScale 0.8s ease-out;
        position: relative;
        overflow: hidden;
    }
    
    /* Gradient line on top of chart cards */
    .element-container div[data-testid="stPlotlyChart"]::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: linear-gradient(90deg, #BB86FC 0%, #3700B3 50%, #03DAC6 100%);
        z-index: 1;
    }
    
    @keyframes fadeInScale {
        from {
            opacity: 0;
            transform: scale(0.95);
        }
        to {
            opacity: 1;
            transform: scale(1);
        }
    }
    
    /* Map container with top line */
    .stMap {
        border-radius: 15px;
        overflow: hidden;
        box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.5);
        animation: fadeInUp 1s ease-out;
        border: 1px solid rgba(187, 134, 252, 0.3);
        position: relative;
    }
    
    .stMap::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: linear-gradient(90deg, #BB86FC 0%, #3700B3 50%, #03DAC6 100%);
        z-index: 1000;
    }
    
    /* Table styling - dark theme with top line */
    .stDataFrame {
        background: rgba(18, 18, 18, 0.95);
        backdrop-filter: blur(10px);
        border-radius: 15px;
        border: 1px solid rgba(187, 134, 252, 0.3);
        animation: fadeInUp 1.2s ease-out;
        position: relative;
        overflow: hidden;
    }
    
    .stDataFrame::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: linear-gradient(90deg, #BB86FC 0%, #3700B3 50%, #03DAC6 100%);
        z-index: 1;
    }
    
    /* Button styling with gradient */
    .stDownloadButton button {
        background: linear-gradient(135deg, #BB86FC 0%, #3700B3 100%);
        color: white;
        border: none;
        border-radius: 10px;
        padding: 10px 24px;
        font-weight: 600;
        transition: all 0.3s ease;
        box-shadow: 0 4px 15px 0 rgba(187, 134, 252, 0.5);
    }
    
    .stDownloadButton button:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px 0 rgba(187, 134, 252, 0.7);
        background: linear-gradient(135deg, #3700B3 0%, #03DAC6 100%);
    }
    
    /* Info message styling - dark theme */
    .stInfo {
        background: rgba(187, 134, 252, 0.15);
        border-left: 4px solid #BB86FC;
        border-radius: 10px;
        animation: fadeIn 0.6s ease-out;
        color: #FFFFFF;
    }
    
    /* Metric labels - light text */
    [data-testid="stMetricLabel"] {
        color: #FFFFFF !important;
        font-weight: 600 !important;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        font-size: 0.85rem !important;
    }
    
    /* Metric values - light text with gradient */
    [data-testid="stMetricValue"] {
        background: linear-gradient(135deg, #BB86FC 0%, #03DAC6 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        font-weight: 700 !important;
        font-size: 2rem !important;
    }
    
    /* Metric delta */
    [data-testid="stMetricDelta"] {
        color: #FFFFFF !important;
    }
    
    /* Dataframe styling */
    table {
        color: #FFFFFF !important;
    }
    
    thead tr th {
        background: rgba(187, 134, 252, 0.2) !important;
        color: #FFFFFF !important;
    }
    
    tbody tr {
        background: rgba(18, 18, 18, 0.5) !important;
    }
    
    tbody tr:hover {
        background: rgba(187, 134, 252, 0.15) !important;
    }
    
    /* Scrollbar styling */
    ::-webkit-scrollbar {
        width: 10px;
        height: 10px;
    }
    
    ::-webkit-scrollbar-track {
        background: rgba(18, 18, 18, 0.5);
    }
    
    ::-webkit-scrollbar-thumb {
        background: rgba(187, 134, 252, 0.5);
        border-radius: 5px;
    }
    
    ::-webkit-scrollbar-thumb:hover {
        background: rgba(187, 134, 252, 0.7);
    }
    </style>
""", unsafe_allow_html=True)

#Load JSONL Data
DATA_PATH = os.environ.get(
    "VOICELINK_DATA",
    os.path.join(os.path.dirname(__file__), "..", "data")
)
LOGS_FILE = os.path.join(DATA_PATH, "logs.jsonl")

@st.cache_data
def load_data():
    """Load data from logs.jsonl file"""
    rows = []
    if os.path.exists(LOGS_FILE):
        with open(LOGS_FILE, "r") as f:
            for line in f:
                try:
                    rows.append(json.loads(line))
                except:
                    pass
    
    if not rows:
        return pd.DataFrame()
    
    records = []
    for entry in rows:
        base_record = {
            'timestamp': pd.to_datetime(entry.get('ts', datetime.now())),
            'session_id': entry.get('session_id', 'N/A'),
            'lat': entry.get('lat', 0.0),
            'lon': entry.get('lon', 0.0),
            'need_raw': entry.get('need_raw', 'N/A'),
            'need_category': entry.get('need_category', 'Unknown'),
            'returned': entry.get('returned', 0)
        }
        
        if entry.get('results') and len(entry['results']) > 0:
            top_result = entry['results'][0]
            base_record['top_recommendation'] = top_result.get('name', 'N/A')
            base_record['top_rec_distance'] = top_result.get('distance_miles')
            base_record['top_rec_phone'] = top_result.get('phone', 'N/A')
            base_record['top_rec_address'] = top_result.get('address', 'N/A')
        else:
            base_record['top_recommendation'] = 'No results'
            base_record['top_rec_distance'] = None
            
        records.append(base_record)
    
    return pd.DataFrame(records)

st.markdown('<h1>VoiceLink Analytics</h1>', unsafe_allow_html=True)
st.markdown('<p class="subtitle">Connecting people to help, hope, and resources because everyone deserves a safe place</p>', unsafe_allow_html=True)

df = load_data()

if df.empty:
    st.info("No data yet. Generate some calls via the API to see analytics come to life!")
    st.stop()

filtered_df = df

total_interactions = len(filtered_df)
active_categories = filtered_df['need_category'].nunique()
success_rate = (filtered_df['returned'] > 0).sum() / len(filtered_df) * 100 if len(filtered_df) > 0 else 0
avg_distance = filtered_df['top_rec_distance'].mean() if filtered_df['top_rec_distance'].notna().any() else 0

col1, col2, col3, col4 = st.columns(4)

with col1:
    st.metric(
        label="Total Interactions",
        value=f"{total_interactions:,}",
        delta="All time"
    )

with col2:
    st.metric(
        label="Active Categories",
        value=active_categories,
        delta=f"{active_categories} unique"
    )

with col3:
    st.metric(
        label="Success Rate",
        value=f"{success_rate:.1f}%",
        delta="With results"
    )

with col4:
    st.metric(
        label="Avg Distance",
        value=f"{avg_distance:.1f} mi",
        delta="To top result"
    )

st.markdown("<br>", unsafe_allow_html=True)

st.markdown("### Insights")

colors = ['#BB86FC', '#03DAC6', '#CF6679', '#6200EE', '#3700B3', 
          '#018786', '#00E5FF', '#B388FF', '#80D8FF', '#EA80FC']

category_counts = filtered_df['need_category'].value_counts().head(8)

category_counts.index = [cat.title() for cat in category_counts.index]

category_color_map = {cat: colors[i % len(colors)] for i, cat in enumerate(category_counts.index)}

col1, col2 = st.columns([1, 1])

with col1:
    fig1 = go.Figure()
    
    for i, (category, count) in enumerate(category_counts.items()):
        fig1.add_trace(go.Bar(
            x=[category],
            y=[count],
            name=category,
            marker=dict(
                color=colors[i % len(colors)],
                line=dict(color='rgba(255,255,255,0.2)', width=2),
            ),
            hovertemplate='<b>%{x}</b><br>Interactions: %{y}<br><extra></extra>',
            showlegend=False
        ))
    
    fig1.update_layout(
        showlegend=False,
        xaxis=dict(
            tickangle=-45,
            showgrid=False,
            title=None,
            color='#FFFFFF'
        ),
        yaxis=dict(
            showgrid=True,
            gridcolor='rgba(187, 134, 252, 0.2)',
            title='Interactions',
            color='#FFFFFF'
        ),
        plot_bgcolor='rgba(0,0,0,0)',
        paper_bgcolor='rgba(0,0,0,0)',
        margin=dict(t=10, b=80, l=50, r=10),
        height=350,
        bargap=0.25,
        font=dict(family='Inter', color='#FFFFFF')
    )
    
    fig1.update_traces(marker=dict(cornerradius=10))
    
    st.plotly_chart(fig1, use_container_width=True, key="bar_chart")

with col2:
    fig2 = go.Figure()
    
    percentages = (category_counts.values / category_counts.sum() * 100).round(1)
    
    fig2.add_trace(go.Pie(
        labels=category_counts.index,
        values=category_counts.values,
        hole=0.75,
        marker=dict(
            colors=colors[:len(category_counts)],
            line=dict(color='rgba(18, 18, 18, 0.8)', width=3)
        ),
        text=category_counts.index,  # Show capitalized category names
        textposition='outside',
        textfont=dict(size=12, color='#FFFFFF', family='Inter', weight='bold'),
        hovertemplate='<b>%{label}</b><br>Count: %{value}<br>Percentage: %{percent}<extra></extra>',
        showlegend=False,
        pull=[0.08 if i == category_counts.idxmax() else 0.02 for i in range(len(category_counts))],
        rotation=90,
        insidetextorientation='radial'
    ))
    
    fig2.add_annotation(
        text=f"<b>{total_interactions}</b><br><span style='font-size:12px;'>Total</span>",
        x=0.5, y=0.5,
        font=dict(size=32, color='#BB86FC', family='Inter'),
        showarrow=False,
        align='center'
    )
    
    fig2.update_layout(
        showlegend=False,
        margin=dict(t=30, b=30, l=80, r=80),
        height=400,
        paper_bgcolor='rgba(0,0,0,0)',
        font=dict(family='Inter'),
        hoverlabel=dict(
            bgcolor='rgba(18, 18, 18, 0.95)',
            font_size=13,
            font_family='Inter',
            bordercolor='rgba(187, 134, 252, 0.5)'
        )
    )
    
    fig2.update_traces(
        marker=dict(
            line=dict(color='rgba(18, 18, 18, 0.8)', width=3)
        ),
        hoverinfo='label+percent+value'
    )
    
    st.plotly_chart(fig2, use_container_width=True, key="donut_chart", config={
        'displayModeBar': False,
        'displaylogo': False
    })


st.markdown("<br>", unsafe_allow_html=True)

st.markdown("### Geographic Distribution")

# Prepare map data with capitalized categories
map_data = filtered_df[['lat', 'lon', 'need_category']].copy()
map_data['need_category'] = map_data['need_category'].str.title()

category_to_color_rgb = {}
for i, category in enumerate(category_counts.index):
    color_hex = category_color_map[category]
    rgb = [int(color_hex[i:i+2], 16) for i in (1, 3, 5)]
    category_to_color_rgb[category] = rgb

map_data['color'] = map_data['need_category'].map(category_to_color_rgb)
default_rgb = [187, 134, 252]  # Default purple color
map_data['color'] = map_data['color'].fillna(pd.Series([default_rgb] * len(map_data)))

map_data['size'] = 150

st.map(
    map_data,
    latitude='lat',
    longitude='lon',
    color='color',
    size='size'
)

st.markdown("<br>", unsafe_allow_html=True)

st.markdown("### Interaction Timeline")

timeline_data = filtered_df.copy()
timeline_data['date'] = timeline_data['timestamp'].dt.date
daily_counts = timeline_data.groupby('date').size().reset_index(name='count')
daily_counts = daily_counts.sort_values('date')

fig_timeline = go.Figure()

fig_timeline.add_trace(go.Scatter(
    x=daily_counts['date'],
    y=daily_counts['count'],
    mode='lines+markers',
    line=dict(color='#BB86FC', width=3, shape='spline'),
    marker=dict(size=8, color='#03DAC6', line=dict(color='#121212', width=2)),
    fill='tozeroy',
    fillcolor='rgba(187, 134, 252, 0.2)',
    hovertemplate='<b>%{x}</b><br>Interactions: %{y}<extra></extra>'
))

fig_timeline.update_layout(
    xaxis=dict(
        showgrid=False,
        color='#FFFFFF',
        title='Date'
    ),
    yaxis=dict(
        showgrid=True,
        gridcolor='rgba(187, 134, 252, 0.2)',
        color='#FFFFFF',
        title='Daily Interactions'
    ),
    plot_bgcolor='rgba(0,0,0,0)',
    paper_bgcolor='rgba(0,0,0,0)',
    margin=dict(t=20, b=50, l=50, r=20),
    height=300,
    font=dict(family='Inter', color='#FFFFFF'),
    hovermode='x unified'
)

st.plotly_chart(fig_timeline, use_container_width=True, key="timeline_chart")

st.markdown("### Interactions")

display_df = filtered_df[['timestamp', 'need_raw', 'need_category', 'top_recommendation', 'top_rec_distance', 'returned']].copy()
display_df = display_df.sort_values('timestamp', ascending=False).head(15)
display_df['timestamp'] = display_df['timestamp'].dt.strftime('%Y-%m-%d %H:%M')
display_df['need_category'] = display_df['need_category'].str.title()  # Capitalize categories in table
display_df.columns = ['Time', 'User Need', 'Category', 'Top Recommendation', 'Distance (mi)', 'Results']

st.dataframe(
    display_df,
    use_container_width=True,
    height=350,
    hide_index=True
)

col1, col2, col3 = st.columns([1, 1, 1])
with col2:
    csv = filtered_df.to_csv(index=False)
    st.download_button(
        label="Download Full Dataset (CSV)",
        data=csv,
        file_name=f"voicelink_analytics_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv",
        mime="text/csv",
        use_container_width=True
    )

st.markdown("<br><br>", unsafe_allow_html=True)
st.markdown(
    f"<div style='text-align: center; color: #FFFFFF; font-size: 0.9rem; padding: 20px;'>"
    f"VoiceLink Analytics Dashboard | Last updated: {datetime.now().strftime('%B %d, %Y at %H:%M:%S')}<br>"
    f"<span style='font-size: 0.85rem; color: #E0E0E0;'>Empowered by data, driven by compassion</span>"
    f"</div>",
    unsafe_allow_html=True
)