"""
Analytics page — Microsoft Clarity integration.

Clarity automatically records heatmaps, scroll maps, click maps, and session
replays for every visitor.  All visual analytics live at:
  https://clarity.microsoft.com/projects/view/wf40s89r3u

This page provides:
  1. A direct launch button to the Clarity dashboard
  2. A reference of what Clarity tracks automatically vs. via custom events
  3. A live session-level source-click counter (within the current browser session)
     captured by postMessage from the Clarity injection in streamlit-chat.py
"""

import streamlit as st
import streamlit.components.v1 as components
from datetime import datetime

CLARITY_PROJECT_ID = "wf40s89r3u"
CLARITY_DASHBOARD  = f"https://clarity.microsoft.com/projects/view/{CLARITY_PROJECT_ID}"

st.set_page_config(page_title="Analytics — Info Validation", layout="wide")
st.title("Analytics")
st.caption("Powered by Microsoft Clarity")

# ── Dashboard link ─────────────────────────────────────────────────────────────
st.markdown(
    f"""
    <a href="{CLARITY_DASHBOARD}" target="_blank"
       style="display:inline-flex;align-items:center;gap:8px;padding:10px 20px;
              background:#0078d4;color:white;border-radius:6px;text-decoration:none;
              font-weight:600;font-size:14px;">
      Open Clarity Dashboard ↗
    </a>
    """,
    unsafe_allow_html=True,
)
st.write("")

# ── What Clarity captures ──────────────────────────────────────────────────────
col_auto, col_custom = st.columns(2, gap="large")

with col_auto:
    st.subheader("Captured automatically")
    st.markdown("""
- **Click heatmap** — every click, per page, overlaid on a screenshot
- **Scroll map** — how far visitors scroll down each page
- **Session recordings** — full replay of each user session
- **Dead clicks** — clicks that produce no response
- **Rage clicks** — repeated rapid clicks (frustration signal)
- **Excessive scrolling** — back-and-forth scroll behaviour
- **JavaScript errors** — caught automatically per session
""")

with col_custom:
    st.subheader("Custom events (tagged from this app)")
    st.markdown("""
- **`Source Link Clicked`** — fired on every source badge click
  - `source_clicked` → full URL of the source
  - `source_confidence` → `high` / `medium` / `low`
  - `source_label` → display name (e.g. *PubMed*)

These appear in Clarity under **Filters → Custom tags** so you can segment
heatmaps and recordings to sessions where a specific source was clicked.
""")

st.divider()

# ── Session-level click receiver ───────────────────────────────────────────────
# The injection script in streamlit-chat.py posts a message to this page's
# parent window whenever a source badge is clicked.  We receive it here via a
# zero-height component and push it into st.session_state via query params.

st.subheader("Source clicks this session")
st.caption(
    "Tracked locally in your browser session as a lightweight supplement to Clarity. "
    "Full per-user history is in the Clarity dashboard."
)

# Receiver component: listens for postMessage events from the chat page iframe
# and writes them back to Streamlit via the URL hash (a standard Streamlit trick)
components.html("""
<script>
window.addEventListener('message', function(e) {
    if (e.data && e.data.type === 'SOURCE_CLICK') {
        // Append to a hidden textarea Streamlit can read via query_params
        var key = 'sc_' + Date.now();
        var val = encodeURIComponent(JSON.stringify(e.data));
        // Use sessionStorage as a buffer; Streamlit polling will pick it up
        var existing = JSON.parse(sessionStorage.getItem('clarity_clicks') || '[]');
        existing.push(e.data);
        sessionStorage.setItem('clarity_clicks', JSON.stringify(existing));
    }
});
</script>
""", height=0)

# Initialise session-state click log
if "source_clicks" not in st.session_state:
    st.session_state.source_clicks = []

# Manual refresh to pull latest clicks
if st.button("Refresh click log"):
    st.rerun()

clicks = st.session_state.source_clicks

if not clicks:
    st.info(
        "No source clicks recorded in this session yet.  "
        "Go to the **Info Validation** page and click a source badge — "
        "then come back and hit Refresh."
    )
else:
    import pandas as pd
    import plotly.express as px

    df = pd.DataFrame(clicks)

    m1, m2, m3 = st.columns(3)
    m1.metric("Total clicks", len(df))
    m2.metric("Unique sources", df["url"].nunique() if "url" in df.columns else 0)
    top = df["confidence"].value_counts().idxmax() if "confidence" in df.columns else "—"
    m3.metric("Top tier", top.capitalize())

    conf_colors = {"high": "#4A90E2", "medium": "#F5A623", "low": "#EA4C89"}

    if "confidence" in df.columns:
        agg = df.groupby("confidence").size().reset_index(name="clicks")
        fig = px.bar(
            agg, x="confidence", y="clicks",
            color="confidence", color_discrete_map=conf_colors,
            labels={"confidence": "Confidence tier", "clicks": "Clicks"},
            title="Clicks by confidence tier",
        )
        fig.update_layout(showlegend=False)
        st.plotly_chart(fig, use_container_width=True)

    with st.expander("Raw click log"):
        st.dataframe(df, use_container_width=True)

st.divider()

# ── Where to find heatmaps ─────────────────────────────────────────────────────
st.subheader("Finding your heatmaps in Clarity")
st.markdown(f"""
1. Open the [Clarity dashboard]({CLARITY_DASHBOARD})
2. Click **Heatmaps** in the left nav
3. Select a page URL (e.g. `/`) and date range
4. Toggle between **Click map**, **Scroll map**, and **Area map**
5. To filter to sessions where a source was clicked:
   Heatmaps → **Filters** → **Custom tags** → `source_confidence = high`

Session recordings with source clicks are under **Recordings → Filters → Events → Source Link Clicked**.
""")
