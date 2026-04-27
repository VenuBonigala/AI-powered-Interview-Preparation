from fastapi import FastAPI
from pydantic import BaseModel
from rag import build_index, retrieve
from openai import OpenAI
import os
import json
import re
from dotenv import load_dotenv
from sentence_transformers import SentenceTransformer
import numpy as np

load_dotenv()

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.getenv("OPENAI_API_KEY")
)

embed_model = SentenceTransformer('all-MiniLM-L6-v2')

app = FastAPI()


class JDInput(BaseModel):
    text: str


class InterviewInput(BaseModel):
    level: str
    duration: str


class EvaluationInput(BaseModel):
    questions: list
    answers: list
    ideals: list


class IdealInput(BaseModel):
    question: str


class PrepInput(BaseModel):
    days: int
    hours: int
    weaknesses: list = []
    improvements: list = []


def _fallback_prep_plan():
    return {
        "days": [
            {
                "day": 1,
                "tasks": ["Revise fundamentals"],
                "assessment": "Do 5 practice questions"
            }
        ]
    }


def _extract_json_object(content: str):
    cleaned = (content or "").strip()
    cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r"\s*```$", "", cleaned)

    start = cleaned.find("{")
    end = cleaned.rfind("}")

    if start == -1 or end == -1 or end < start:
        raise ValueError("No JSON object found in prep plan response")

    return cleaned[start:end + 1]


# 🔥 FIXED PREP PLAN
@app.post("/prep-plan")
def prep_plan(data: PrepInput):
    days = data.days
    hours = data.hours
    weaknesses = data.weaknesses
    improvements = data.improvements

    context = retrieve("Extract key skills and topics from this job description")

    prompt = f"""
You are a career coach.

Job Description Context:
{context}

Candidate Weaknesses:
{weaknesses}

Improvement Areas:
{improvements}

Create EXACTLY {days} days of interview preparation plan.

Constraints:
- Daily study time: {hours} hours
- Focus more on weak areas
- Include revision + mock interviews
- Each day must have 2-4 tasks

IMPORTANT:
- Return EXACTLY {days} objects in "days" array
- DO NOT return less or more
- DO NOT include explanation

Return STRICT JSON ONLY:

{{
  "days": [
    {{
      "day": 1,
      "tasks": ["task1", "task2"],
      "assessment": "short test"
    }}
  ]
}}
"""

    try:
        response = client.chat.completions.create(
            model="openai/gpt-oss-120b:free",
            messages=[{"role": "user", "content": prompt}]
        )

        raw_content = response.choices[0].message.content
        json_content = _extract_json_object(raw_content)
        parsed_plan = json.loads(json_content)

        if not isinstance(parsed_plan, dict) or "days" not in parsed_plan:
            raise ValueError("Invalid structure")

        # 🔥 Ensure correct number of days
        if len(parsed_plan["days"]) != days:
            # Auto-fix by trimming or extending
            fixed_days = parsed_plan["days"][:days]

            while len(fixed_days) < days:
                fixed_days.append({
                    "day": len(fixed_days) + 1,
                    "tasks": ["Revise key topics"],
                    "assessment": "Practice questions"
                })

            parsed_plan["days"] = fixed_days

        return parsed_plan

    except Exception:
        return _fallback_prep_plan()


def similarity_score(answer, ideal):
    emb1 = embed_model.encode([answer])[0]
    emb2 = embed_model.encode([ideal])[0]

    score = np.dot(emb1, emb2) / (
        np.linalg.norm(emb1) * np.linalg.norm(emb2)
    )

    return float(score)


@app.post("/ideal-answer")
def ideal_answer(data: IdealInput):
    try:
        prompt = f"Give a strong, ideal interview answer for:\n{data.question}"

        response = client.chat.completions.create(
            model="openai/gpt-oss-120b:free",
            messages=[{"role": "user", "content": prompt}]
        )

        return {"ideal": response.choices[0].message.content}

    except:
        return {"ideal": ""}


@app.post("/evaluate")
def evaluate(data: EvaluationInput):
    questions = [q[:200] for q in data.questions]
    answers = [a[:500] for a in data.answers]
    ideals = data.ideals

    qa_pairs = ""
    semantic_scores = []

    for i in range(len(questions)):
        q = questions[i]
        a = answers[i]
        ideal = ideals[i] if i < len(ideals) else ""

        sim_score = similarity_score(a, ideal)
        sim_score_10 = round(sim_score * 10, 2)

        semantic_scores.append(sim_score_10)

        qa_pairs += f"""
Question {i+1}: {q}
Answer: {a}
"""

    prompt = f"""
You are an expert interviewer.

Evaluate the following responses briefly.

{qa_pairs}

Also consider these semantic similarity scores (out of 10):
{semantic_scores}

Return STRICT JSON only:
{{
  "overall_score": "x/10",
  "question_wise": [
    {{
      "score": "x/10",
      "feedback": "short feedback"
    }}
  ],
  "strengths": ["point1", "point2"],
  "weaknesses": ["point1", "point2"],
  "improvements": ["point1", "point2"],
  "skills": {{
    "Java": 6,
    "Python": 7,
    "DSA": 5,
    "React": 6,
    "LLM": 7
  }}
}}
"""

    try:
        response = client.chat.completions.create(
            model="openai/gpt-oss-120b:free",
            messages=[{"role": "user", "content": prompt}]
        )

        return {
            "evaluation": response.choices[0].message.content
        }

    except:
        return {
            "evaluation": '{"overall_score":"5/10","question_wise":[],"strengths":[],"weaknesses":[],"improvements":[]}'
        }


@app.post("/store-jd")
def store_jd(data: JDInput):
    build_index(data.text)
    return {"message": "JD stored in vector DB"}


@app.post("/generate-questions")
def generate_questions(data: InterviewInput):
    level = data.level
    duration = data.duration

    context = retrieve("Generate interview questions based on this job description")

    prompt = f"""
You are an expert interviewer.

Job Description Context:
{context}

Generate 5 interview questions based on:
- Level: {level}
- Duration: {duration} minutes

Return ONLY a JSON array like:
["Q1", "Q2", "Q3", "Q4", "Q5"]
"""

    response = client.chat.completions.create(
        model="openai/gpt-oss-120b:free",
        messages=[{"role": "user", "content": prompt}]
    )

    return {
        "questions": response.choices[0].message.content
    }
