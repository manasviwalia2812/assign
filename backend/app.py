"""
Application entry point and factory.
"""
import os
from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv

from db import db
import models  # Ensure models are registered

# Load environment variables
load_dotenv()

def create_app() -> Flask:
    """
    Create and configure the Flask application.
    
    Returns:
        Flask: The configured Flask app.
    """
    app = Flask(__name__)
    
    # Enable CORS for localhost:5173
    CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173"}})
    
    # Configure the SQLite database
    app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL", "sqlite:///specs.db")
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    
    # Initialize plugins
    db.init_app(app)
    
    # Register blueprints
    from routes.ai import ai_bp
    from routes.specs import specs_bp
    app.register_blueprint(ai_bp)
    app.register_blueprint(specs_bp)
    
    # Create database structure if it doesn't exist
    with app.app_context():
        db.create_all()

    @app.route('/api/health', methods=['GET'])
    def health_check():
        """
        Simple health check endpoint to verify backend is running.
        """
        return {"status": "success", "message": "Backend is running!"}, 200
        
    return app

if __name__ == "__main__":
    app = create_app()
    app.run(debug=True, port=5000)
