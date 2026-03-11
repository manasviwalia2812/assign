"""
REST endpoints for managing specifications.
"""
from flask import Blueprint, request, jsonify
from db import db
from models import Spec

specs_bp = Blueprint('specs', __name__, url_prefix='/api/specs')

@specs_bp.route('', methods=['GET'])
def get_specs():
    """
    List all specs (id, title, status, created_at only).
    """
    specs = Spec.query.order_by(Spec.created_at.desc()).all()
    return jsonify([{
        "id": spec.id,
        "title": spec.title,
        "status": spec.status,
        "created_at": spec.created_at.isoformat() if spec.created_at else None
    } for spec in specs]), 200

@specs_bp.route('', methods=['POST'])
def create_spec():
    """
    Create a new spec.
    """
    data = request.get_json() or {}
    
    if 'raw_idea' not in data:
        return jsonify({"error": "Missing 'raw_idea' in request body."}), 400
        
    new_spec = Spec(
        title=data.get('title'),
        raw_idea=data.get('raw_idea'),
        clarifying_questions=data.get('clarifying_questions'),
        answers=data.get('answers'),
        generated_spec=data.get('generated_spec'),
        status=data.get('status', 'draft')
    )
    
    db.session.add(new_spec)
    db.session.commit()
    
    return jsonify({
        "id": new_spec.id,
        "title": new_spec.title,
        "raw_idea": new_spec.raw_idea,
        "clarifying_questions": new_spec.clarifying_questions,
        "answers": new_spec.answers,
        "generated_spec": new_spec.generated_spec,
        "status": new_spec.status,
        "created_at": new_spec.created_at.isoformat() if new_spec.created_at else None,
        "updated_at": new_spec.updated_at.isoformat() if new_spec.updated_at else None
    }), 201

@specs_bp.route('/<int:spec_id>', methods=['GET'])
def get_spec(spec_id):
    """
    Get full spec by id.
    """
    spec = db.session.get(Spec, spec_id)
    if not spec:
        return jsonify({"error": "Spec not found"}), 404
        
    return jsonify({
        "id": spec.id,
        "title": spec.title,
        "raw_idea": spec.raw_idea,
        "clarifying_questions": spec.clarifying_questions,
        "answers": spec.answers,
        "generated_spec": spec.generated_spec,
        "status": spec.status,
        "created_at": spec.created_at.isoformat() if spec.created_at else None,
        "updated_at": spec.updated_at.isoformat() if spec.updated_at else None
    }), 200

@specs_bp.route('/<int:spec_id>', methods=['PUT'])
def update_spec(spec_id):
    """
    Update spec fields (any subset of fields).
    """
    spec = db.session.get(Spec, spec_id)
    if not spec:
        return jsonify({"error": "Spec not found"}), 404
        
    data = request.get_json() or {}
    
    if 'title' in data:
        spec.title = data['title']
    if 'raw_idea' in data:
        spec.raw_idea = data['raw_idea']
    if 'clarifying_questions' in data:
        spec.clarifying_questions = data['clarifying_questions']
    if 'answers' in data:
        spec.answers = data['answers']
    if 'generated_spec' in data:
        spec.generated_spec = data['generated_spec']
    if 'status' in data:
        spec.status = data['status']
        
    db.session.commit()
    
    return jsonify({
        "id": spec.id,
        "title": spec.title,
        "raw_idea": spec.raw_idea,
        "clarifying_questions": spec.clarifying_questions,
        "answers": spec.answers,
        "generated_spec": spec.generated_spec,
        "status": spec.status,
        "created_at": spec.created_at.isoformat() if spec.created_at else None,
        "updated_at": spec.updated_at.isoformat() if spec.updated_at else None
    }), 200

@specs_bp.route('/<int:spec_id>', methods=['DELETE'])
def delete_spec(spec_id):
    """
    Delete spec by id.
    """
    spec = db.session.get(Spec, spec_id)
    if not spec:
        return jsonify({"error": "Spec not found"}), 404
        
    db.session.delete(spec)
    db.session.commit()
    
    return jsonify({"message": "Spec deleted successfully"}), 200
