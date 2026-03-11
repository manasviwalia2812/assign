"""
Database models for the AI-Powered Requirement Clarifier.
"""
from datetime import datetime, timezone
from db import db

class Spec(db.Model):
    """
    Spec model to store raw ideas and generated specifications.
    """
    __tablename__ = 'specs'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String, nullable=True)
    raw_idea = db.Column(db.Text, nullable=False)
    clarifying_questions = db.Column(db.Text, nullable=True)
    answers = db.Column(db.Text, nullable=True)
    generated_spec = db.Column(db.Text, nullable=True)
    status = db.Column(db.String, nullable=False, default="draft")
    
    # We use timezone-aware UTC datetimes as per modern Python best practices
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
