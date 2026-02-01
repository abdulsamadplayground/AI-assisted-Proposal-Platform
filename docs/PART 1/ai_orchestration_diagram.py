"""
AI Orchestration Flow Diagram
Detailed visualization of the complete AI proposal generation flow
"""

from diagrams import Diagram, Cluster, Edge
from diagrams.onprem.client import User
from diagrams.programming.framework import React, Fastapi
from diagrams.onprem.compute import Server
from diagrams.onprem.database import PostgreSQL
from diagrams.programming.language import Python
from diagrams.generic.compute import Rack

# Diagram attributes
graph_attr = {
    "fontsize": "14",
    "bgcolor": "white",
    "pad": "0.5",
    "splines": "ortho",
    "nodesep": "0.8",
    "ranksep": "1.2",
}

with Diagram("AI Proposal Generation - Complete Orchestration Flow", 
             show=False, 
             direction="TB",
             graph_attr=graph_attr,
             filename="ai_orchestration_flow"):
    
    # User
    user = User("User")
    
    # Frontend
    with Cluster("Frontend Layer (Vercel)"):
        frontend = React("Next.js\nFrontend")
    
    # Backend
    with Cluster("Backend Layer (Railway)"):
        backend = Server("Node.js\nBackend API")
        database = PostgreSQL("PostgreSQL\nDatabase")
    
    # AI Service with internal components
    with Cluster("AI Service Layer (Vercel)"):
        ai_service = Fastapi("FastAPI\nAI Service")
        
        with Cluster("AI Components"):
            schema_mgr = Python("Schema\nManager")
            prompt_eng = Python("Prompt\nEngineer")
            llm_adapter = Python("LLM\nAdapter")
            rule_engine = Python("Rule\nEngine")
    
    # External LLM
    groq_llm = Rack("Groq LLM\nllama-3.3-70b")
    
    # Flow 1: User submits survey notes
    user >> Edge(label="1. Submit survey notes\n+ schema selection", color="blue") >> frontend
    
    # Flow 2: Frontend to Backend
    frontend >> Edge(label="2. POST /api/proposals\n(JWT + survey notes)", color="blue") >> backend
    
    # Flow 3: Backend creates proposal record
    backend >> Edge(label="3. INSERT proposals\n(status=draft, sections=[])", color="purple") >> database
    database >> Edge(label="Proposal ID", color="purple", style="dashed") >> backend
    
    # Flow 4: Backend calls AI Service
    backend >> Edge(label="4. POST /api/ai/generate-draft\n(proposal_id, schema_id,\nsurvey_notes)", color="orange") >> ai_service
    
    # Flow 5: AI Service loads schema
    ai_service >> Edge(label="5. Load schema\n+ rules", color="green") >> schema_mgr
    schema_mgr >> Edge(label="Schema data", color="green", style="dashed") >> ai_service
    
    # Flow 6a-f: For each section (loop)
    ai_service >> Edge(label="6a. Build prompt\nfrom survey notes", color="red") >> prompt_eng
    prompt_eng >> Edge(label="6b. Generate content\nrequest", color="red") >> llm_adapter
    llm_adapter >> Edge(label="6c. API call\n(prompt + context)", color="red") >> groq_llm
    groq_llm >> Edge(label="6d. Generated text", color="red", style="dashed") >> llm_adapter
    llm_adapter >> Edge(label="Content", color="red", style="dashed") >> ai_service
    ai_service >> Edge(label="6e. Enforce rules\n(validation, format)", color="darkred") >> rule_engine
    rule_engine >> Edge(label="6f. Validation results\n(passed/violations)", color="darkred", style="dashed") >> ai_service
    
    # Flow 7: AI Service returns to Backend
    ai_service >> Edge(label="7. Return sections\n+ metadata + rule_enforcement", color="orange", style="dashed") >> backend
    
    # Flow 8: Backend updates proposal
    backend >> Edge(label="8. UPDATE proposals\nSET sections=<AI output>", color="purple") >> database
    
    # Flow 9: Backend creates version record
    backend >> Edge(label="9. INSERT proposal_versions\n(version=1, sections)", color="purple") >> database
    database >> Edge(label="Success", color="purple", style="dashed") >> backend
    
    # Flow 10: Backend returns to Frontend
    backend >> Edge(label="10. Return complete proposal\n(with sections)", color="blue", style="dashed") >> frontend
    
    # Flow 11: Frontend displays to user
    frontend >> Edge(label="11. Display generated\nproposal", color="blue", style="dashed") >> user

print("✓ AI orchestration flow diagram generated: ai_orchestration_flow.png")
