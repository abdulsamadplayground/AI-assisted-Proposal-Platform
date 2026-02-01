"""
AI Proposal Platform - High-Level Architecture Diagram
Generates a visual representation of the system architecture
"""

from diagrams import Diagram, Cluster, Edge
from diagrams.onprem.client import Users, Client
from diagrams.onprem.compute import Server
from diagrams.onprem.database import PostgreSQL
from diagrams.programming.framework import React, Fastapi
from diagrams.programming.language import Python, TypeScript
from diagrams.generic.compute import Rack
from diagrams.saas.analytics import Snowflake

# Diagram attributes
graph_attr = {
    "fontsize": "16",
    "bgcolor": "white",
    "pad": "0.5",
}

with Diagram("AI Proposal Platform Architecture", 
             show=False, 
             direction="TB",
             graph_attr=graph_attr,
             filename="ai_proposal_architecture"):
    
    # Users
    with Cluster("Users"):
        admin = Users("Admin Users")
        regular_users = Users("Regular Users")
    
    # Frontend Layer
    with Cluster("Frontend (Vercel)"):
        frontend = React("Next.js App\n(TypeScript)")
        frontend_features = [
            "- User Portal",
            "- Admin Dashboard", 
            "- Proposal Management",
            "- Schema Editor"
        ]
    
    # Backend Layer
    with Cluster("Backend (Railway)"):
        backend = Server("Node.js API\n(Express + TypeScript)")
        backend_services = [
            "- Auth Service",
            "- Proposal Service",
            "- AI Service Client"
        ]
    
    # AI Service Layer
    with Cluster("AI Service (Vercel)"):
        ai_service = Fastapi("FastAPI Service\n(Python)")
        
        with Cluster("AI Components"):
            llm_adapter = Python("LLM Adapter\n(Groq)")
            prompt_eng = Python("Prompt Engineer")
            rule_engine = Python("Rule Engine")
            schema_mgr = Python("Schema Manager")
        
        ai_service >> Edge(label="uses") >> llm_adapter
        ai_service >> Edge(label="uses") >> prompt_eng
        ai_service >> Edge(label="uses") >> rule_engine
        ai_service >> Edge(label="uses") >> schema_mgr
    
    # Database Layer
    with Cluster("Data Layer (Neon)"):
        database = PostgreSQL("PostgreSQL\nDatabase")
        db_tables = [
            "- users",
            "- proposals",
            "- proposal_versions",
            "- schemas",
            "- schema_versions"
        ]
    
    # External Services
    with Cluster("External Services"):
        groq_llm = Rack("Groq LLM API\n(llama-3.3-70b)")
    
    # User interactions
    admin >> Edge(label="manages schemas\napproves proposals", color="darkblue") >> frontend
    regular_users >> Edge(label="creates proposals\nsubmits for approval", color="blue") >> frontend
    
    # Frontend to Backend
    frontend >> Edge(label="REST API\n(JWT Auth)", color="green") >> backend
    
    # Backend to Database
    backend >> Edge(label="SQL queries\n(Knex.js)", color="purple") >> database
    
    # Backend to AI Service
    backend >> Edge(label="HTTP POST\n/api/ai/generate-draft", color="orange") >> ai_service
    
    # AI Service to LLM
    llm_adapter >> Edge(label="API calls\n(survey notes + rules)", color="red") >> groq_llm
    
    # Key workflows
    with Cluster("Key Workflows", graph_attr={"style": "dashed"}):
        workflow_1 = Client("1. User submits\nsurvey notes")
        workflow_2 = Client("2. AI generates\nproposal sections")
        workflow_3 = Client("3. Rules enforced\non content")
        workflow_4 = Client("4. Saved to DB\nwith versions")
        workflow_5 = Client("5. Admin reviews\n& approves")
        
        workflow_1 >> workflow_2 >> workflow_3 >> workflow_4 >> workflow_5

print("Architecture diagram generated: ai_proposal_architecture.png")
