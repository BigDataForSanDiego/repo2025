# Vapi Voice Agent System Prompt for HomeBase

**IMPORTANT: Copy the text below into your Vapi Assistant's "System Prompt" field. This is what the agent says - the structured data extraction (intent, resourceType, requires911) should be configured separately in Vapi's Function Calling or Structured Output settings.**

**[Initial Message]
When the user first connects, greet them with this exact message:
"Hey. I'm here to help. Are you in an emergency right now... or do you need help finding something like shelter, food, or medical care?"**

---

[Identity]
You are a friendly voice assistant named HomeBase, dedicated to helping people who are homeless or in need.

[Style]
- Emphasize patience, calmness, and a slow pace in every interaction.
- Speak naturally, with warmth and genuine care, as if talking to a friend in need.
- Use simple, reassuring language without any jargon or complex terms.
- Be warm but not overly formal, showing genuine empathy and understanding.

[Response Guidelines]
- Speak very slowly and calmly, with natural pauses between each thought.
- Allow each message to sink in before moving on to the next.
- Maintain a relaxed and unhurried tone, especially when addressing serious matters.
- Confirm understanding and be specific about your actions.
- Keep responses short and prioritize listening over speaking.
- Never judge or rush the user, and handle silence with patience and calm reassurances.

[Task & Goals]
1. Start every conversation with the Initial Message shown above.
2. Listen attentively to their response, with appropriate follow-up:
   - If emergency-related words are detected, respond calmly and assist in calling 911.
   - For resource-related requests, identify their specific needs (shelter, food, medical care, or other) and convey your actions clearly.
3. Wait for their answer and provide information or assistance relevant to their needs.
4. If silence persists, gently prompt them to ensure they feel heard and supported.
5. Always confirm understanding before proceeding to avoid miscommunication.

[Important Context]
- You have access to the user's live GPS location automatically - NEVER ask for their location.
- The GIS system will automatically find nearby resources based on their current location.
- Simply identify what they need (shelter, food, medical care), then confirm you're finding it for them.
- Don't ask "where are you?" or "what's your location?" - you already have it.

[Error Handling / Fallback]
- If the user's input is unclear, ask for clarification with understanding and patience.
- Handle extended silence by reassuring them of your presence and willingness to help.
- Close the call gently if there's no response after multiple prompts, encouraging them to reach out again if needed.

---

## VAPI CONFIGURATION NOTES (For You - Not Part of System Prompt)

After pasting the system prompt above, you need to configure Vapi to extract structured data from the conversation. Here's what you need to set up in Vapi's dashboard:

### Voice Settings (IMPORTANT for Natural Pacing)

In Vapi's voice configuration, set these parameters:

- **Speed/Rate:** 0.85 - 0.9 (slightly slower than default for clarity)
- **Stability:** 0.5 - 0.6 (allows natural variation)
- **Similarity Boost:** 0.7 - 0.8 (more natural sounding)
- **Style:** Conversational (not professional/corporate)

This ensures the voice agent speaks at a comfortable, patient pace that gives listeners time to process what's being said.

### Structured Output Configuration (CRITICAL - Copy this into Vapi)

In Vapi's "Functions" or "Structured Output" settings, configure this JSON schema:

```json
{
  "name": "extract_user_intent",
  "description": "Analyzes the conversation to determine if the user needs emergency services or resources, and what type of resources they need",
  "strict": true,
  "parameters": {
    "type": "object",
    "properties": {
      "intent": {
        "type": "string",
        "enum": ["emergency", "get_resources", "waiting", "timeout", "unclear"],
        "description": "The primary intent detected from the user's request"
      },
      "resourceType": {
        "type": "string",
        "enum": ["shelter", "food", "medical", "other"],
        "description": "The specific type of resource needed (only applicable when intent is 'get_resources')"
      },
      "requires911": {
        "type": "boolean",
        "description": "Whether the situation requires immediate 911 emergency services"
      },
      "confidence": {
        "type": "string",
        "enum": ["high", "medium", "low"],
        "description": "Confidence level in the detected intent and resource type"
      },
      "userMessage": {
        "type": "string",
        "description": "The actual words the user said (for transcript)"
      }
    },
    "required": ["intent", "requires911", "confidence", "userMessage"]
  }
}
```

---

### DETAILED EXTRACTION RULES

#### **1. Intent Detection (HIGHEST PRIORITY)**

**intent = "emergency"**
Trigger words/phrases:
- Direct emergency: "help", "emergency", "911", "call police", "danger"
- Violence: "attack", "following me", "threatened", "hit me", "scared", "unsafe"
- Medical crisis: "overdose", "bleeding", "can't breathe", "chest pain", "passed out", "unconscious"
- Injury: "hurt bad", "broken bone", "bleeding out", "severe pain"
- Mental health crisis: "want to die", "hurt myself", "end it all"

**Confidence Levels:**
- HIGH: Clear emergency words + urgency in tone
- MEDIUM: Concerning words but unclear severity
- LOW: Vague mention of problems

---

**intent = "get_resources"**
Trigger words/phrases:
- Shelter: "bed", "sleep", "place to stay", "roof", "cold", "nowhere to go", "homeless shelter"
- Food: "hungry", "starving", "eat", "food", "meal", "food bank", "soup kitchen"
- Medical: "sick", "doctor", "clinic", "medicine", "pharmacy", "health", "not feeling well"
- Other: "shower", "bathroom", "clothes", "water", "phone", "help" (non-emergency)

**Confidence Levels:**
- HIGH: Specific resource type mentioned explicitly
- MEDIUM: General help request, type inferable from context
- LOW: Vague "I need help" with no specifics

---

**intent = "waiting"**
Conditions:
- User hasn't responded for 30+ seconds
- No speech detected but connection still active
- Set confidence to "high" (this is a system state, not user input)

---

**intent = "timeout"**
Conditions:
- User hasn't responded for 90+ seconds total (after 2 waiting prompts)
- Agent has attempted to re-engage twice with no response
- Set confidence to "high" (this is a system state)

---

**intent = "unclear"**
Conditions:
- User spoke but intent cannot be determined
- Contradictory information (e.g., "emergency but not really")
- Mumbling, incoherent speech, or background noise
- Set confidence to "low"

---

#### **2. Resource Type Detection (ONLY when intent = "get_resources")**

**resourceType = "shelter"**
Keywords:
- Primary: "shelter", "bed", "sleep", "place to stay", "roof", "housing"
- Secondary: "cold", "outside", "nowhere to go", "need to rest"
- Context: "tonight", "right now", "have nowhere"

Examples:
- "I need somewhere to sleep" → shelter (HIGH confidence)
- "It's cold, I need help" → shelter (MEDIUM confidence, could also be other)
- "Do you have beds?" → shelter (HIGH confidence)

---

**resourceType = "food"**
Keywords:
- Primary: "food", "eat", "hungry", "starving", "meal", "food bank"
- Secondary: "haven't eaten", "need groceries", "soup kitchen"
- Context: "breakfast", "lunch", "dinner", "today", "now"

Examples:
- "I'm starving" → food (HIGH confidence)
- "Haven't eaten in two days" → food (HIGH confidence)
- "Where can I get a meal?" → food (HIGH confidence)

---

**resourceType = "medical"**
Keywords:
- Primary: "sick", "doctor", "clinic", "hospital", "medicine", "pharmacy", "health"
- Secondary: "not feeling well", "pain", "injured", "need medication"
- Context: "see a doctor", "get checked", "prescription"

Examples:
- "I'm sick and need a doctor" → medical (HIGH confidence)
- "Where's the nearest clinic?" → medical (HIGH confidence)
- "I'm in pain" → medical (MEDIUM confidence, could be emergency if severe)

---

**resourceType = "other"**
Use when:
- User needs help but not shelter/food/medical
- Multiple types mentioned (e.g., "shower and clothes")
- Unclear specific need but definitely not emergency
- Examples: water, bathroom, shower, clothing, phone, transportation

Examples:
- "I need to clean up" → other (hygiene services)
- "Where can I charge my phone?" → other
- "I just need help" → other (unclear specifics)

---

#### **3. requires911 Detection (CRITICAL FOR SAFETY)**

**requires911 = true**
ONLY when BOTH conditions met:
1. Intent is "emergency" AND
2. Situation is life-threatening or actively dangerous

Specific scenarios:
- Active violence: "Someone is following me", "Being attacked", "In danger right now"
- Medical emergency: "Can't breathe", "Chest pain", "Bleeding badly", "Overdosed"
- Suicide risk: "Want to die", "Hurt myself", "End it all"
- Severe injury: "Broken bone", "Can't move", "Hit by car"
- Unconscious person: "Someone passed out", "Not waking up"

**Confidence Levels:**
- HIGH: Clear, immediate danger requiring 911
- MEDIUM: Serious but unclear if 911 needed (ask for clarification)
- LOW: User said "emergency" but details suggest otherwise

---

**requires911 = false**
When:
- Intent is "get_resources" (not an emergency)
- Intent is "waiting" or "timeout" (system states)
- Intent is "unclear" (need more info first)
- Intent is "emergency" but situation is past tense ("I was attacked yesterday")
- Intent is "emergency" but user is asking about services ("What if there's an emergency?")

---

#### **4. Edge Cases and Special Handling**

**Multiple Needs:**
```json
User: "I'm sick and hungry"
Output: {
  "intent": "get_resources",
  "resourceType": "medical",  // Prioritize health over food
  "requires911": false,
  "confidence": "high"
}
```

**Ambiguous Emergency:**
```json
User: "I was attacked last night"
Output: {
  "intent": "get_resources",  // Past tense, not active emergency
  "resourceType": "other",     // May need police report, counseling, etc.
  "requires911": false,
  "confidence": "medium"
}
```

**Vague Request:**
```json
User: "I need help"
Output: {
  "intent": "unclear",
  "resourceType": "other",  // Default to other when unclear
  "requires911": false,
  "confidence": "low"
}
// Agent should ask: "What kind of help? Are you in an emergency, or do you need shelter, food, or something else?"
```

**False Emergency:**
```json
User: "What do I do if there's an emergency?"
Output: {
  "intent": "unclear",  // Hypothetical, not actual emergency
  "requires911": false,
  "confidence": "medium"
}
// Agent should clarify: "Are you in an emergency right now, or are you asking what to do if one happens?"
```

**Medical Emergency vs Medical Resource:**
```json
User: "I can't breathe" → emergency, requires911 = true
User: "I have a cough" → get_resources, resourceType = medical, requires911 = false
User: "Chest pain" → emergency, requires911 = true
User: "Need a checkup" → get_resources, resourceType = medical, requires911 = false
```

---

### PRIORITY ORDER (When multiple intents detected)

1. **Emergency** (always highest priority)
2. **Medical** (health issues)
3. **Food** (basic survival need)
4. **Shelter** (basic survival need)
5. **Other** (everything else)

---

### RESPONSE FORMAT TO HOMEBASE APP

Vapi should return this JSON structure to the HomeBase app:

```json
{
  "transcript": [
    {
      "text": "I'm starving and need food",
      "timestamp": 1699564789123,
      "speaker": "user"
    },
    {
      "text": "Okay. I'm finding food banks and soup kitchens close to you right now.",
      "timestamp": 1699564791456,
      "speaker": "agent"
    }
  ],
  "intent": "get_resources",
  "resourceType": "food",
  "requires911": false,
  "error": null,
  "resources": []
}
```

**Field Descriptions:**
- **transcript**: Array of all conversation messages (user + agent)
- **intent**: Must be one of: "emergency", "get_resources", "waiting", "timeout", "unclear"
- **resourceType**: Only included when intent = "get_resources". One of: "shelter", "food", "medical", "other"
- **requires911**: Boolean, true only for life-threatening emergencies
- **error**: null if successful, error message string if failed
- **resources**: Empty array (HomeBase app will call GIS service to populate this)

---

### TESTING YOUR CONFIGURATION

Test these scenarios to ensure proper extraction:

✅ **Test 1: Clear Emergency**
- User: "Help! Someone's attacking me!"
- Expected: `{ intent: "emergency", requires911: true, confidence: "high" }`

✅ **Test 2: Food Resource**
- User: "I'm hungry, where can I eat?"
- Expected: `{ intent: "get_resources", resourceType: "food", requires911: false, confidence: "high" }`

✅ **Test 3: Shelter Resource**
- User: "I need a place to sleep tonight"
- Expected: `{ intent: "get_resources", resourceType: "shelter", requires911: false, confidence: "high" }`

✅ **Test 4: Medical Resource**
- User: "I'm sick, need to see a doctor"
- Expected: `{ intent: "get_resources", resourceType: "medical", requires911: false, confidence: "medium" }`

✅ **Test 5: Unclear Intent**
- User: "I need help"
- Expected: `{ intent: "unclear", resourceType: "other", requires911: false, confidence: "low" }`

✅ **Test 6: Past Emergency**
- User: "I was robbed yesterday"
- Expected: `{ intent: "get_resources", resourceType: "other", requires911: false, confidence: "medium" }`

✅ **Test 7: Silence**
- User: [30 seconds of silence]
- Expected: `{ intent: "waiting", requires911: false, confidence: "high" }`

---

This structured output configuration ensures your HomeBase app receives clean, reliable data to trigger the correct actions (GIS lookup or 911 call).
