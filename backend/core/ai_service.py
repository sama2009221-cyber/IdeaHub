import os
import json
from groq import Groq

# Initialize Groq client
_client = None


def get_client() -> Groq:
    global _client
    if _client is None:
        api_key = os.environ.get("GROQ_API_KEY", "")
        _client = Groq(api_key=api_key)
    return _client


# ═══════════════════════════════════════════════════════════════════════
# SYSTEM PROMPT — AI EVALUATOR (Groq / llama-3.3-70b-versatile)
# ═══════════════════════════════════════════════════════════════════════
EVALUATOR_SYSTEM_PROMPT = """You are an elite Enterprise Innovation Strategist and Senior Technical Evaluator working for a leading corporation. Your role is to rigorously assess employee-submitted project ideas to help leadership make informed investment decisions.

You evaluate every idea across THREE critical dimensions:

1. **CONCEPT** (Originality & Strategic Business Value, 1–10)
   - Is this idea genuinely novel or an improvement on existing solutions?
   - Does it address a real business pain point or market gap?
   - What is its potential ROI and strategic alignment with company goals?

2. **FEASIBILITY** (Technical & Operational Realism, 1–10)
   - Can this be built with typical company tech stacks and resources?
   - What are the main technical, regulatory, or operational risks?
   - Is the scope realistic for a project team to deliver?

3. **APPLICATION** (Implementation Clarity & UX Impact, 1–10)
   - How clearly is the implementation path defined?
   - What is the projected user experience or customer impact?
   - Are there measurable success KPIs or outcomes described?

**Output Rules:**
- Return ONLY a raw JSON object — NO markdown code fences, NO text outside the JSON.
- Be honest and constructive in overall_notes. Avoid generic praise.
- You MUST write the `overall_notes` strictly in Arabic (اللغة العربية), regardless of the language the idea was submitted in.
- Include specific, actionable recommendations and highlight the top risk factor.
- overall_notes should be 3–5 sentences minimum.

**Required JSON Schema (strict, no extra fields):**
{
  "concept_score": <integer 1-10>,
  "feasibility_score": <integer 1-10>,
  "application_score": <integer 1-10>,
  "overall_notes": "<detailed professional evaluation with specific recommendations>"
}"""


# ═══════════════════════════════════════════════════════════════════════
# SYSTEM PROMPT — RAG CHATBOT (Groq / llama-3.3-70b-versatile)
# ═══════════════════════════════════════════════════════════════════════
RAG_SYSTEM_PROMPT = """You are an intelligent AI Assistant integrated into IdeaHub — the company's internal idea management platform.

Your primary function is to help evaluators, managers, and team members understand submitted project ideas by answering their questions accurately and helpfully.

**Strict Rules:**
1. Answer ONLY based on the provided context (the submitted ideas). Do NOT invent information not present in the context.
2. If the answer cannot be found in the context, say exactly: "لا يمكنني إيجاد هذه المعلومات في الأفكار المقدمة حالياً." (Arabic) or "I cannot find this information in the currently submitted ideas." (English).
3. When referencing specific ideas, always cite them by their exact title.
4. Be concise but thorough — use bullet points for multi-part answers.
5. Match the language of the user's question (Arabic → respond in Arabic, English → respond in English).
6. You may offer brief analytical commentary IF you clearly label it as your own analysis (not from the documents).
7. For comparison questions across multiple ideas, create a clear structured response.

**Context Format:** Each idea block is delimited by "=== Idea: <Title> ===" and "==="."""


def evaluate_idea(title: str, description: str, problem: str = "", approach: str = "",
                  impact: str = "", file_paths: list = None) -> dict:
    """
    Calls Groq API (llama-3.3-70b-versatile) to evaluate an idea across three dimensions.

    Args:
        title: The idea title.
        description: The main idea description.
        problem: The problem being solved (optional).
        approach: The proposed solution/approach (optional).
        impact: The expected impact/benefits (optional).
        file_paths: Unused (kept for API compatibility with earlier file-upload logic).

    Returns:
        dict with keys: concept_score, feasibility_score, application_score, overall_notes.
    """
    api_key = os.environ.get("GROQ_API_KEY", "")
    if not api_key or len(api_key) < 10:
        return _offline_evaluation()

    # Build a rich user message from all available idea details
    user_content = f"""Please evaluate the following project idea submitted by a company employee:

**Title:** {title}

**Description:**
{description or 'No description provided.'}

**Problem Being Solved:**
{problem or 'Not specified by the submitter.'}

**Proposed Approach / Solution:**
{approach or 'Not specified by the submitter.'}

**Expected Impact / Business Benefits:**
{impact or 'Not specified by the submitter.'}

---
Evaluate this idea across the three dimensions and return ONLY the required JSON object."""

    try:
        client = get_client()
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": EVALUATOR_SYSTEM_PROMPT},
                {"role": "user", "content": user_content},
            ],
            temperature=0.3,        # Low temperature for consistent, structured output
            max_tokens=900,
            response_format={"type": "json_object"},  # Enforce JSON output mode
        )
        raw = response.choices[0].message.content.strip()
        result = json.loads(raw)

        # Validate all required fields are present
        required_fields = ["concept_score", "feasibility_score", "application_score", "overall_notes"]
        for field in required_fields:
            if field not in result:
                raise ValueError(f"AI response missing required field: {field}")

        # Clamp scores to valid 1–10 range
        for score_field in ["concept_score", "feasibility_score", "application_score"]:
            result[score_field] = max(1, min(10, int(result[score_field])))

        safe_title = title.encode('ascii', 'replace').decode('ascii')
        print(f"[IdeaHub AI] Evaluation successful for: '{safe_title}' | "
              f"C:{result['concept_score']} F:{result['feasibility_score']} A:{result['application_score']}")
        return result

    except Exception as e:
        print(f"[IdeaHub AI] Groq Evaluation Error for '{title}': {e}")
        return _offline_evaluation(error=str(e))


def chat_with_ideas(question: str, context: str) -> str:
    """
    RAG chatbot: answers questions about submitted ideas using Groq.

    Args:
        question: The user's question.
        context: A formatted string of idea summaries the user has access to.

    Returns:
        A string answer from the AI, or an offline fallback message.
    """
    api_key = os.environ.get("GROQ_API_KEY", "")
    if not api_key or len(api_key) < 10:
        return ("🤖 المساعد الذكي في وضع عدم الاتصال. "
                "يرجى إضافة GROQ_API_KEY في إعدادات الخادم للحصول على إجابات حقيقية.")

    user_message = f"""Context (Submitted Ideas from the company's IdeaHub platform):

{context}

---

User Question: {question}"""

    try:
        client = get_client()
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": RAG_SYSTEM_PROMPT},
                {"role": "user", "content": user_message},
            ],
            temperature=0.5,        # Balanced for natural conversation
            max_tokens=1200,
        )
        answer = response.choices[0].message.content.strip()
        safe_q = question[:60].encode('ascii', 'replace').decode('ascii')
        print(f"[IdeaHub AI] RAG chat answered: '{safe_q}...'")
        return answer

    except Exception as e:
        print(f"[IdeaHub AI] Groq Chat Error: {e}")
        return f"🤖 حدث خطأ في الاتصال بالمساعد الذكي. تفاصيل الخطأ: {str(e)}"


def _offline_evaluation(error: str = None) -> dict:
    """Returns a mock evaluation when the Groq API is unavailable."""
    note = ("🤖 التقييم يعمل في وضع عدم الاتصال لأن مفتاح GROQ_API_KEY "
            "غير مُعيَّن أو غير صالح. يرجى تعيين المفتاح في متغيرات البيئة.")
    if error:
        note += f" تفاصيل الخطأ: {error[:200]}"
    return {
        "concept_score": 5,
        "feasibility_score": 5,
        "application_score": 5,
        "overall_notes": note,
    }
