import streamlit as st
import time
import random
import re
from urllib.parse import urlparse

st.set_page_config(page_title="Info Validation", layout="centered")

st.markdown("""
<style>
.confidence-legend {
    display: flex;
    gap: 24px;
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid #e5e7eb;
    flex-wrap: wrap;
}
.legend-item { display: flex; align-items: center; gap: 8px; }
.legend-line { height: 2px; width: 48px; display: inline-block; }
.legend-text { font-size: 12px; color: #4b5563; }
.source-badge {
    display: inline-flex;
    align-items: center;
    border-radius: 9999px;
    border: 1px solid;
    padding: 2px 10px;
    font-size: 12px;
    font-weight: 500;
    text-decoration: none !important;
    vertical-align: middle;
    margin: 0 2px;
}
.source-high  { color: #1F5EA8; border-color: rgba(74,144,226,.45); background: rgba(74,144,226,.15); }
.source-medium{ color: #A96B11; border-color: rgba(245,166,35,.45); background: rgba(245,166,35,.15); }
.source-low   { color: #A61E57; border-color: rgba(234,76,137,.40); background: rgba(234,76,137,.15); }
.ul-high   { text-decoration: underline; text-decoration-color: #4A90E2; text-decoration-thickness: 2px; }
.ul-medium { text-decoration: underline; text-decoration-color: #F5A623; text-decoration-thickness: 2px; }
.ul-low    { text-decoration: underline; text-decoration-color: #EA4C89; text-decoration-thickness: 2px; }
</style>
""", unsafe_allow_html=True)

LEGEND_HTML = """
<div class="confidence-legend">
  <div class="legend-item">
    <span class="legend-line" style="background:#EA4C89"></span>
    <span class="legend-text">Low Confidence</span>
  </div>
  <div class="legend-item">
    <span class="legend-line" style="background:#F5A623"></span>
    <span class="legend-text">Medium Confidence</span>
  </div>
  <div class="legend-item">
    <span class="legend-line" style="background:#4A90E2"></span>
    <span class="legend-text">High Confidence</span>
  </div>
</div>
"""


def format_assistant(content: str) -> str:
    content = re.sub(r'\*\*(.*?)\*\*', r'<strong>\1</strong>', content)
    content = re.sub(r'\[high\](.*?)\[/high\]',     r'<span class="ul-high">\1</span>',   content)
    content = re.sub(r'\[medium\](.*?)\[/medium\]', r'<span class="ul-medium">\1</span>', content)
    content = re.sub(r'\[low\](.*?)\[/low\]',       r'<span class="ul-low">\1</span>',    content)

    def source_badge(m):
        url, confidence = m.group(1), m.group(2)
        try:
            hostname = urlparse(url).hostname or "Source"
            hostname = re.sub(r'^www\.', '', hostname)
            label = "PubMed" if "pubmed.ncbi.nlm.nih.gov" in hostname else ("DOI" if "doi.org" in hostname else hostname)
        except Exception:
            label = "Source"
        return f'<a href="{url}" target="_blank" class="source-badge source-{confidence}">{label}</a>'

    content = re.sub(r'\[source:(.*?):(low|medium|high)\]', source_badge, content)
    content = content.replace('\n', '<br>')
    return content + LEGEND_HTML


DEMO_MESSAGES = [
    {
        "role": "user",
        "content": "I have been on a keto diet for the past 8 months and I suddenly noticed this rash on my upper arm. What could it be?"
    },
    {
        "role": "assistant",
        "content": (
            "Here are several **possible reasons** you might notice a new rash on your right upper arm after following a "
            "ketogenic (keto) diet for 8 months, based on medical sources:\n\n"
            "**1. Keto-associated inflammatory rash (Prurigo pigmentosa)**\n\n"
            "[medium]A rare inflammatory dermatosis sometimes linked to being in a state of ketosis[/medium]. It typically "
            "presents with [medium]small, itchy bumps or raised patches that can form a net-like pattern[/medium] on the skin. "
            "It most often appears on the trunk and upper body but [low]can vary between individuals[/low]. Researchers aren't "
            "certain why [low]only some people on a strict low-carbohydrate intake develop this rash[/low]. "
            "[source:https://pubmed.ncbi.nlm.nih.gov/example1:medium]\n\n"
            "**2. Ketosis-related metabolic or inflammatory effects**\n\n"
            "Elevated ketones in the bloodstream—especially during [medium]prolonged or deep ketosis[/medium]—may provoke "
            "[low]inflammatory responses in the skin or alter immune activity[/low], which can manifest as irritation or rash. "
            "[low]Changes in the gut microbiome induced by a ketogenic diet also may influence systemic inflammation[/low] "
            "and skin reactivity. [source:https://pubmed.ncbi.nlm.nih.gov/example2:low]\n\n"
            "**3. Keto-induced peripheral lymphatic congestion**\n\n"
            "[low]Sustained ketosis has been speculated to transiently impair peripheral lymphatic flow[/low], leading to "
            "localized inflammatory skin changes in dependent or frequently used limbs. "
            "[source:https://pubmed.ncbi.nlm.nih.gov/example3:low]"
        )
    }
]

SAMPLE_RESPONSES = [
    (
        "Based on your symptoms, I'd recommend [high]consulting with a dermatologist[/high]. "
        "They can perform a proper examination and may suggest:\n\n"
        "**Possible next steps:**\n"
        "- [high]Clinical examination of the affected area[/high]\n"
        "- [medium]Possibly adjusting your macronutrient ratios[/medium]\n"
        "- [medium]Topical treatments if it's prurigo pigmentosa[/medium]\n\n"
        "The rash might resolve on its own, but [high]professional evaluation is advisable[/high] to rule out other causes. "
        "[source:https://pubmed.ncbi.nlm.nih.gov/example4:high]"
    ),
    (
        "That's a great question. **Skin changes** on restrictive diets can happen for various reasons:\n\n"
        "- **Nutrient deficiencies** [low](biotin, vitamin A, essential fatty acids)[/low]\n"
        "- **Histamine reactions** [low]to certain keto foods[/low]\n"
        "- **Contact dermatitis** [low]from new products[/low]\n\n"
        "I'd suggest [medium]keeping a food diary to track any correlations[/medium] with the rash appearance. "
        "[source:https://pubmed.ncbi.nlm.nih.gov/example5:medium]"
    ),
]

if "messages" not in st.session_state:
    st.session_state.messages = DEMO_MESSAGES.copy()

st.title("Info Validation")

for message in st.session_state.messages:
    with st.chat_message(message["role"]):
        if message["role"] == "assistant":
            st.markdown(format_assistant(message["content"]), unsafe_allow_html=True)
        else:
            st.markdown(message["content"])

if prompt := st.chat_input("Message..."):
    st.session_state.messages.append({"role": "user", "content": prompt})
    with st.chat_message("user"):
        st.markdown(prompt)

    with st.chat_message("assistant"):
        with st.spinner(""):
            time.sleep(2)
        response = random.choice(SAMPLE_RESPONSES)
        st.markdown(format_assistant(response), unsafe_allow_html=True)

    st.session_state.messages.append({"role": "assistant", "content": response})
