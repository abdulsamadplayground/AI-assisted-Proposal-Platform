"""
AI Orchestration Flow - Detailed Version
Shows the complete flow including the section generation loop
"""

from diagrams import Diagram, Cluster, Edge
from diagrams.onprem.client import User
from diagrams.programming.framework import React, Fastapi
from diagrams.onprem.compute import Server
from diagrams.onprem.database import PostgreSQL
from diagrams.programming.language import Python
from diagrams.generic.compute import Rack
from diagrams.generic.blank import Blank

# Diagram attributes
graph_attr = {
    "fontsize": "13",
    "bgcolor": "white",
    "pad": "0.5",
    "splines": "polyline",
    "nodesep": "0.6",
    "ranksep": "1.0",
}

with Diagram("AI Orchestration - Detailed Section Generation Loop", 
             show=False, 
             direction="TB",
             graph_attr=graph_attr,
             filename="ai_orchestration_detailed"):
    
    # Phase 1: User Input
    with Cluster("Phase 1: User Input", graph_attr={"style": "dashed", "color": "blue"}):
        user = User("User")
        frontend1 = React("Frontend")
        user >> Edge(label="Submit survey notes", color="blue") >> frontend1
    
    # Phase 2: Backend Processing
    with Cluster("Phase 2: Backend Processing", graph_attr={"style": "dashed", "color": "green"}):
        backend1 = Server("Backend")
        db1 = PostgreSQL("Database")
        
        frontend1 >> Edge(label="POST /api/proposals", color="blue") >> backend1
        backend1 >> Edge(label="CREATE proposal\n(draft, [])", color="purple") >> db1
    
    # Phase 3: AI Service Initialization
    with Cluster("Phase 3: AI Service Init", graph_attr={"style": "dashed", "color": "orange"}):
        ai_main = Fastapi("AI Service\nMain")
        schema_mgr = Python("Schema\nManager")
        
        backend1 >> Edge(label="POST /api/ai/generate-draft", color="orange") >> ai_main
        ai_main >> Edge(label="Load schema", color="green") >> schema_mgr
    
    # Phase 4: Section Generation Loop
    with Cluster("Phase 4: For Each Section (Loop)", graph_attr={"style": "dashed", "color": "red"}):
        loop_start = Blank("Start Loop")
        
        with Cluster("Step A: Build Prompt"):
            prompt_eng = Python("Prompt\nEngineer")
            loop_start >> Edge(label="Survey notes\n+ section schema", color="red") >> prompt_eng
        
        with Cluster("Step B-D: LLM Generation"):
            llm_adapter = Python("LLM\nAdapter")
            groq = Rack("Groq LLM")
            prompt_eng >> Edge(label="Prompt", color="red") >> llm_adapter
            llm_adapter >> Edge(label="API call", color="red") >> groq
            groq >> Edge(label="Generated text", color="red", style="dashed") >> llm_adapter
        
        with Cluster("Step E-F: Rule Enforcement"):
            rule_engine = Python("Rule\nEngine")
            llm_adapter >> Edge(label="Content", color="darkred") >> rule_engine
            rule_engine >> Edge(label="Validation\nresults", color="darkred", style="dashed") >> loop_start
        
        loop_end = Blank("Next Section\nor End Loop")
        loop_start >> Edge(label="Continue", color="gray", style="dotted") >> loop_end
    
    # Phase 5: Return to Backend
    with Cluster("Phase 5: Save & Version", graph_attr={"style": "dashed", "color": "purple"}):
        backend2 = Server("Backend")
        db2 = PostgreSQL("Database")
        
        loop_end >> Edge(label="All sections\n+ metadata", color="orange", style="dashed") >> backend2
        backend2 >> Edge(label="UPDATE proposal", color="purple") >> db2
        backend2 >> Edge(label="INSERT version 1", color="purple") >> db2
    
    # Phase 6: Display to User
    with Cluster("Phase 6: Display Result", graph_attr={"style": "dashed", "color": "blue"}):
        frontend2 = React("Frontend")
        user2 = User("User")
        
        backend2 >> Edge(label="Complete proposal", color="blue", style="dashed") >> frontend2
        frontend2 >> Edge(label="Display", color="blue", style="dashed") >> user2

print("✓ Detailed AI orchestration diagram generated: ai_orchestration_detailed.png")
