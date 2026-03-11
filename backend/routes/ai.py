"""
AI endpoints for interacting with the Groq API.
"""
import os
import json
from flask import Blueprint, request, jsonify
from groq import Groq

# Create Blueprint for AI routes
ai_bp = Blueprint('ai', __name__, url_prefix='/api/ai')

# Initialize Groq client
# The SDK automatically uses the GROQ_API_KEY environment variable.
client = Groq()

# In claude.md we defined the model as llama-3.1-8b-instant
MODEL = 'llama-3.1-8b-instant'

@ai_bp.route('/clarify', methods=['POST'])
def clarify_idea():
    """
    Given a vague product idea, generates exactly 5 clarifying questions.
    Returns a JSON array of question strings.
    """
    data = request.get_json()
    if not data or 'idea' not in data:
        return jsonify({"error": "Missing 'idea' in request body."}), 400
        
    idea = data['idea']
    
    system_prompt = (
        "You are a senior product manager. Given a vague product idea, "
        "generate exactly 5 clarifying questions that would help turn it into a buildable spec. "
        "Return ONLY a JSON array of question strings, nothing else."
    )
    
    try:
        completion = client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Product Idea: {idea}"}
            ],
            response_format={"type": "json_object"},
            temperature=0.7,
        )
        
        response_content = completion.choices[0].message.content
        
        # We asked for a JSON array, but json_object format returns an object.
        # So we might get {"questions": ["q1", "q2", ...]} back.
        parsed_content = json.loads(response_content)
        
        # Extract the list of questions from whatever JSON object structure Groq returned
        if isinstance(parsed_content, list):
            questions = parsed_content
        elif isinstance(parsed_content, dict):
            # Find the first list value in the dict
            questions = next((v for v in parsed_content.values() if isinstance(v, list)), [])
            if not questions and len(parsed_content) > 0:
                # Fallback if no list was found (e.g. { "1": "Question?", "2": ... })
                questions = list(parsed_content.values())
        else:
            questions = [response_content]
            
        # Ensure it's exactly what the frontend expects
        return jsonify({"questions": questions}), 200
        
    except json.JSONDecodeError:
        # Fallback if the model didn't return perfect JSON
        return jsonify({"error": "Failed to parse AI response into JSON.", "raw_response": response_content}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@ai_bp.route('/generate-spec', methods=['POST'])
def generate_spec():
    """
    Given a product idea and answered clarifying questions, generates a complete markdown spec.
    """
    data = request.get_json()
    if not data or not all(k in data for k in ('idea', 'questions', 'answers')):
        return jsonify({"error": "Missing required fields: 'idea', 'questions', or 'answers'."}), 400
        
    idea = data['idea']
    questions = data['questions']
    answers = data['answers']
    
    system_prompt = (
        "You are a senior product manager and software architect. Given a product idea "
        "and answered clarifying questions, generate a complete product spec in markdown "
        "with these sections:\n"
        "## Overview\n"
        "## User Stories (as 'As a [user], I want to [action] so that [outcome]')\n"
        "## Edge Cases\n"
        "## Task Breakdown (numbered list, grouped by frontend/backend/database)\n"
        "## Suggested Tech Stack\n"
        "Be concrete and specific. Output only the markdown, nothing else."
    )
    
    # Format the QA pairs
    qa_context = "\n".join([f"Q: {q}\nA: {a}" for q, a in zip(questions, answers)])
    user_prompt = f"Product Idea: {idea}\n\nClarifying Q&A:\n{qa_context}"
    
    try:
        completion = client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.7,
        )
        
        spec_content = completion.choices[0].message.content
        
        return jsonify({"spec": spec_content}), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
