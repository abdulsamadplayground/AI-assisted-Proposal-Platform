"""
Human-in-the-Loop Checkpoints Diagram
Shows all critical human decision points in the workflow
"""

from diagrams import Diagram, Cluster, Edge
from diagrams.onprem.client import Users, User
from diagrams.programming.framework import React
from diagrams.onprem.compute import Server
from diagrams.onprem.database import PostgreSQL
from diagrams.generic.blank import Blank

# Diagram attributes
graph_attr = {
    "fontsize": "13",
    "bgcolor": "white",
    "pad": "0.5",
    "splines": "polyline",
    "nodesep": "0.7",
    "ranksep": "1.0",
}

with Diagram("Human-in-the-Loop Checkpoints", 
             show=False, 
             direction="TB",
             graph_attr=graph_attr,
             filename="human_checkpoints"):
    
    # Checkpoint 1: Schema Definition
    with Cluster("Checkpoint 1: Schema Definition (Admin Only)", 
                 graph_attr={"style": "filled", "color": "lightblue"}):
        admin1 = Users("Admin")
        schema_ui = React("Schema Editor")
        schema_backend = Server("Backend")
        
        admin1 >> Edge(label="Define sections\n+ rules", color="darkblue", style="bold") >> schema_ui
        schema_ui >> Edge(label="Validate & Save", color="blue") >> schema_backend
        
        decision1 = Blank("Decision:\nWhat rules to enforce?")
        admin1 >> Edge(color="red", style="dashed") >> decision1
    
    # Checkpoint 2: Proposal Submission
    with Cluster("Checkpoint 2: Proposal Submission (User Action)", 
                 graph_attr={"style": "filled", "color": "lightgreen"}):
        user1 = User("User")
        proposal_ui = React("Proposal UI")
        submit_backend = Server("Backend")
        
        user1 >> Edge(label="Review AI output\n& submit", color="darkgreen", style="bold") >> proposal_ui
        proposal_ui >> Edge(label="Change status to\npending_approval", color="green") >> submit_backend
        
        decision2 = Blank("Decision:\nReady for review?")
        user1 >> Edge(color="red", style="dashed") >> decision2
    
    # Checkpoint 3: Proposal Approval
    with Cluster("Checkpoint 3: Proposal Approval (Admin Only)", 
                 graph_attr={"style": "filled", "color": "lightyellow"}):
        admin2 = Users("Admin")
        review_ui = React("Review UI")
        approval_backend = Server("Backend")
        approval_db = PostgreSQL("Database")
        
        admin2 >> Edge(label="Review & decide", color="darkorange", style="bold") >> review_ui
        review_ui >> Edge(label="Approve OR Reject\n(with comments)", color="orange") >> approval_backend
        approval_backend >> Edge(label="Update status\n+ reviewed_by", color="purple") >> approval_db
        
        decision3 = Blank("Decision:\nMeets standards?")
        admin2 >> Edge(color="red", style="dashed") >> decision3
    
    # Checkpoint 4: Content Editing
    with Cluster("Checkpoint 4: Content Editing (User/Admin)", 
                 graph_attr={"style": "filled", "color": "lightcoral"}):
        user2 = User("User/Admin")
        edit_ui = React("Editor UI")
        edit_backend = Server("Backend")
        edit_db = PostgreSQL("Database")
        
        user2 >> Edge(label="Modify AI content", color="darkred", style="bold") >> edit_ui
        edit_ui >> Edge(label="Save changes", color="red") >> edit_backend
        edit_backend >> Edge(label="Create new version", color="purple") >> edit_db
        
        decision4 = Blank("Decision:\nWhat to change?")
        user2 >> Edge(color="red", style="dashed") >> decision4
    
    # Checkpoint 5: Export Control
    with Cluster("Checkpoint 5: Export Control (Approved Only)", 
                 graph_attr={"style": "filled", "color": "lavender"}):
        user3 = User("User/Admin")
        export_ui = React("Export UI")
        export_backend = Server("Backend")
        
        user3 >> Edge(label="Request export", color="darkviolet", style="bold") >> export_ui
        export_ui >> Edge(label="Verify approved\nstatus", color="violet") >> export_backend
        export_backend >> Edge(label="Generate .docx", color="violet", style="dashed") >> user3
        
        decision5 = Blank("Decision:\nReady for distribution?")
        user3 >> Edge(color="red", style="dashed") >> decision5
    
    # Summary Box
    with Cluster("Safeguards Summary", graph_attr={"style": "dashed", "color": "gray"}):
        safeguard1 = Blank("✓ Role-based access control")
        safeguard2 = Blank("✓ Status-based restrictions")
        safeguard3 = Blank("✓ Immutable audit trail")
        safeguard4 = Blank("✓ Version tracking")
        safeguard5 = Blank("✓ Approval required for export")

print("✓ Human-in-the-loop checkpoints diagram generated: human_checkpoints.png")
