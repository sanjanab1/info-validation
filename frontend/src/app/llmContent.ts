export type LlmContentVersion = 'plain' | 'annotated';
export type LlmContentPackId = keyof typeof CONVERSATION_CONTENT_PACKS;

export const AVAILABLE_CONTENT_PACK_IDS = ['keto-rash', 'anti-inflammation'] as const satisfies readonly LlmContentPackId[];

export const CONTENT_PACK_LABELS: Record<LlmContentPackId, string> = {
  'keto-rash': 'Keto rash case',
  'anti-inflammation': 'Anti-inflammation options',
};

interface ContentVariant {
  plain: string;
  annotated: string;
}

interface ConversationContentPack {
  initialUserPrompt: string;
  initialAssistantResponse: ContentVariant;
  followUpAssistantResponses: ContentVariant[];
}

const CONVERSATION_CONTENT_PACKS: Record<string, ConversationContentPack> = {
  'keto-rash': {
    initialUserPrompt: 'I have been on a keto diet for the past 8 months and I suddenly noticed this rash on my upper arm. What could it be?',
    initialAssistantResponse: {
      plain: `Here are several **possible reasons** you might notice a new rash on your right upper arm after following a ketogenic (keto) diet for 8 months, based on medical sources:

**1. Keto-associated inflammatory rash (Prurigo pigmentosa)**

A rare inflammatory dermatosis sometimes linked to being in a state of ketosis. It typically presents with small, itchy bumps or raised patches that can form a net-like pattern on the skin. It most often appears on the trunk and upper body but can vary between individuals. Researchers aren't certain why only some people on a strict low-carbohydrate intake with the onset of this rash. [source:https://pubmed.ncbi.nlm.nih.gov/example1:medium]

**2. Ketosis-related metabolic or inflammatory effects**

Elevated ketones in the bloodstream-especially during prolonged or deep ketosis-may provoke inflammatory responses in the skin or alter immune activity, which can manifest as irritation or rash. Changes in the gut microbiome induced by a ketogenic diet also may influence systemic inflammation and skin reactivity. [source:https://pubmed.ncbi.nlm.nih.gov/example2:low]

**3. Keto-induced peripheral lymphatic congestion**

Sustained ketosis has been speculated to transiently impair peripheral lymphatic flow, leading to localized inflammatory skin changes in dependent or frequently used limbs. [source:https://pubmed.ncbi.nlm.nih.gov/example3:low]`,
      annotated: `Here are several **possible reasons** you might notice a new rash on your right upper arm after following a ketogenic (keto) diet for 8 months, based on medical sources:

**1. Keto-associated inflammatory rash (Prurigo pigmentosa)**

[medium]A rare inflammatory dermatosis sometimes linked to being in a state of ketosis[/medium]. It typically presents with [medium]small, itchy bumps or raised patches that can form a net-like pattern[/medium] on the skin. It most often appears on the trunk and upper body but [low]can vary between individuals[/low]. Researchers aren't certain why [low]only some people on a strict low-carbohydrate intake with the onset of this rash[/low]. [source:https://pubmed.ncbi.nlm.nih.gov/example1:medium]

**2. Ketosis-related metabolic or inflammatory effects**

Elevated ketones in the bloodstream-especially during [medium]prolonged or deep ketosis[/medium]-may provoke [low]inflammatory responses in the skin or alter immune activity[/low], which can manifest as irritation or rash. [low]Changes in the gut microbiome induced by a ketogenic diet also may influence systemic inflammation[/low] and skin reactivity. [source:https://pubmed.ncbi.nlm.nih.gov/example2:low]

**3. Keto-induced peripheral lymphatic congestion**

[low]Sustained ketosis has been speculated to transiently impair peripheral lymphatic flow[/low], leading to localized inflammatory skin changes in dependent or frequently used limbs. [source:https://pubmed.ncbi.nlm.nih.gov/example3:low]`
    },
    followUpAssistantResponses: [
      {
        plain: `Based on your symptoms, I'd recommend consulting with a dermatologist. They can perform a proper examination and may suggest:

**Possible next steps:**
- Clinical examination of the affected area
- Possibly adjusting your macronutrient ratios
- Topical treatments if it's prurigo pigmentosa

The rash might resolve on its own, but professional evaluation is advisable to rule out other causes. [source:https://pubmed.ncbi.nlm.nih.gov/example4:high]`,
        annotated: `Based on your symptoms, I'd recommend [high]consulting with a dermatologist[/high]. They can perform a proper examination and may suggest:

**Possible next steps:**
- [high]Clinical examination of the affected area[/high]
- [medium]Possibly adjusting your macronutrient ratios[/medium]
- [medium]Topical treatments if it's prurigo pigmentosa[/medium]

The rash might resolve on its own, but [high]professional evaluation is advisable[/high] to rule out other causes. [source:https://pubmed.ncbi.nlm.nih.gov/example4:high]`
      },
      {
        plain: `That's a great question. **Skin changes** on restrictive diets can happen for various reasons:

- **Nutrient deficiencies** (biotin, vitamin A, essential fatty acids)
- **Histamine reactions** to certain keto foods
- **Contact dermatitis** from new products

I'd suggest keeping a food diary to track any correlations with the rash appearance. [source:https://pubmed.ncbi.nlm.nih.gov/example5:medium]`,
        annotated: `That's a great question. **Skin changes** on restrictive diets can happen for various reasons:

- **Nutrient deficiencies** [low](biotin, vitamin A, essential fatty acids)[/low]
- **Histamine reactions** [low]to certain keto foods[/low]
- **Contact dermatitis** [low]from new products[/low]

I'd suggest [medium]keeping a food diary to track any correlations[/medium] with the rash appearance. [source:https://pubmed.ncbi.nlm.nih.gov/example5:medium]`
      }
    ]
  },

  'anti-inflammation': {
    initialUserPrompt: 'I have been trying to find anti-inflammation medicine. What are some options out there?',
    initialAssistantResponse: {
      plain: `
**1. Omega-3 fatty acids and inflammatory mediators**

Dietary omega-3 fatty acids (e.g., EPA and DHA) can influence inflammatory pathways by altering eicosanoid production and reducing pro-inflammatory signaling. They may also give rise to specialized pro-resolving mediators that help terminate inflammatory responses rather than simply suppress them. The magnitude of these effects varies with dose, baseline diet, and underlying health status. [source:https://pubmed.ncbi.nlm.nih.gov/example1:medium]

**2. Dietary patterns rich in plant foods**

 Patterns such as the Mediterranean diet are associated with lower levels of inflammatory biomarkers, likely due to combined effects of fiber, polyphenols, and unsaturated fats. These benefits appear to emerge from overall dietary patterns rather than single nutrients in isolation. However, adherence and lifestyle confounders (e.g., physical activity) complicate causal interpretation. [source:https://pubmed.ncbi.nlm.nih.gov/example1:medium]

**3. Alkaline blood buffering through anti-inflammatory foods**

It is often suggested that “alkaline” foods neutralize blood acidity, thereby directly suppressing systemic inflammation. This claim is frequently extended to imply that routine dietary choices can meaningfully shift systemic pH and reduce disease risk. [source:https://pubmed.ncbi.nlm.nih.gov/example1:medium]`,
      annotated: `
**1. Omega-3 fatty acids and inflammatory mediators**

Dietary omega-3 fatty acids (e.g., EPA and DHA) can influence inflammatory pathways by altering eicosanoid production and reducing pro-inflammatory signaling. [high]They may also give rise to specialized pro-resolving mediators that help terminate inflammatory responses rather than simply suppress them.[/high] The magnitude of these effects varies with dose, baseline diet, and underlying health status. [source:https://pubmed.ncbi.nlm.nih.gov/example1:medium]

**2. Dietary patterns rich in plant foods**

  [medium]Patterns such as the Mediterranean diet are associated with lower levels of inflammatory biomarkers[/medium], likely due to combined effects of fiber, polyphenols, and unsaturated fats. These benefits appear to emerge from overall dietary patterns rather than single nutrients in isolation. However, adherence and lifestyle confounders (e.g., physical activity) complicate causal interpretation. [source:https://pubmed.ncbi.nlm.nih.gov/example1:medium]

**3. Alkaline blood buffering through anti-inflammatory foods**

  [low]It is often suggested that “alkaline” foods neutralize blood acidity[/low], thereby directly suppressing systemic inflammation. This claim is frequently extended to imply that routine dietary choices can meaningfully shift systemic pH and reduce disease risk. [source:https://pubmed.ncbi.nlm.nih.gov/example1:medium]`
    },
    followUpAssistantResponses: [
      {
        plain: `Based on your symptoms, I'd recommend consulting with a dermatologist. They can perform a proper examination and may suggest:

**Possible next steps:**
- Clinical examination of the affected area
- Possibly adjusting your macronutrient ratios
- Topical treatments if it's prurigo pigmentosa

The rash might resolve on its own, but professional evaluation is advisable to rule out other causes. [source:https://pubmed.ncbi.nlm.nih.gov/example4:high]`,
        annotated: `Based on your symptoms, I'd recommend [high]consulting with a dermatologist[/high]. They can perform a proper examination and may suggest:

**Possible next steps:**
- [high]Clinical examination of the affected area[/high]
- [medium]Possibly adjusting your macronutrient ratios[/medium]
- [medium]Topical treatments if it's prurigo pigmentosa[/medium]

The rash might resolve on its own, but [high]professional evaluation is advisable[/high] to rule out other causes. [source:https://pubmed.ncbi.nlm.nih.gov/example4:high]`
      },
      {
        plain: `That's a great question. **Skin changes** on restrictive diets can happen for various reasons:

- **Nutrient deficiencies** (biotin, vitamin A, essential fatty acids)
- **Histamine reactions** to certain keto foods
- **Contact dermatitis** from new products

I'd suggest keeping a food diary to track any correlations with the rash appearance. [source:https://pubmed.ncbi.nlm.nih.gov/example5:medium]`,
        annotated: `That's a great question. **Skin changes** on restrictive diets can happen for various reasons:

- **Nutrient deficiencies** [low](biotin, vitamin A, essential fatty acids)[/low]
- **Histamine reactions** [low]to certain keto foods[/low]
- **Contact dermatitis** [low]from new products[/low]

I'd suggest [medium]keeping a food diary to track any correlations[/medium] with the rash appearance. [source:https://pubmed.ncbi.nlm.nih.gov/example5:medium]`
      }
    ]
  }
};

export const DEFAULT_CONTENT_PACK_ID: LlmContentPackId = 'anti-inflammation';

export function resolveContentPackId(packId?: string | null): LlmContentPackId {
  if (packId && packId in CONVERSATION_CONTENT_PACKS) {
    return packId as LlmContentPackId;
  }

  return DEFAULT_CONTENT_PACK_ID;
}

function getPack(packId: string) {
  return CONVERSATION_CONTENT_PACKS[packId] ?? CONVERSATION_CONTENT_PACKS[DEFAULT_CONTENT_PACK_ID];
}

function pickVariant(content: ContentVariant, version: LlmContentVersion) {
  return content[version];
}

export function getInitialConversation(version: LlmContentVersion, packId = DEFAULT_CONTENT_PACK_ID) {
  const pack = getPack(packId);

  return {
    user: pack.initialUserPrompt,
    assistant: pickVariant(pack.initialAssistantResponse, version)
  };
}

export function getRandomAssistantResponse(version: LlmContentVersion, packId = DEFAULT_CONTENT_PACK_ID) {
  const pack = getPack(packId);
  const variant = pack.followUpAssistantResponses[Math.floor(Math.random() * pack.followUpAssistantResponses.length)];

  return pickVariant(variant, version);
}
