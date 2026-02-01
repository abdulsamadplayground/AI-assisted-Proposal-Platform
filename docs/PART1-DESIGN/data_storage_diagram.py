"""
Data Storage Strategy Diagram
Shows the complete data storage architecture and patterns
"""

from diagrams import Diagram, Cluster, Edge
from diagrams.onprem.database import PostgreSQL
from diagrams.programming.language import Python, TypeScript
from diagrams.onprem.compute import Server
from diagrams.generic.storage import Storage
from diagrams.generic.database import SQL

# Diagram attributes
graph_attr = {
    "fontsize": "14",
    "bgcolor": "white",
    "pad": "0.5",
    "splines": "ortho",
    "nodesep": "0.8",
    "ranksep": "1.2",
}

with Diagram("Data Storage Strategy - PostgreSQL Architecture", 
             show=False, 
             direction="TB",
             graph_attr=graph_attr,
             filename="data_storage_strategy"):
    
    # Application Layer
    with Cluster("Application Layer"):
        backend = Server("Backend Service\n(Node.js + Knex.js)")
    
    # Database Layer
    with Cluster("Database Layer (Neon PostgreSQL)"):
        database = PostgreSQL("PostgreSQL\nDatabase")
        
        # Core Tables
        with Cluster("Core Tables"):
            users_table = SQL("users\n- id (PK)\n- email\n- role\n- password_hash")
            
            proposals_table = SQL("proposals\n- id (PK)\n- title\n- user_id (FK)\n- schema_id (FK)\n- status\n- sections (JSON)\n- current_version")
            
            versions_table = SQL("proposal_versions\n- id (PK)\n- proposal_id (FK)\n- version_number\n- sections (JSON)\n- created_by (FK)")
            
            schemas_table = SQL("schemas\n- id (PK)\n- name\n- schema_data (JSON)\n- is_active")
            
            schema_versions_table = SQL("schema_versions\n- id (PK)\n- schema_id (FK)\n- version_number\n- schema_data (JSON)")
    
    # Storage Patterns
    with Cluster("Storage Patterns"):
        pattern1 = Storage("Immutable\nVersion History\n(Append-Only)")
        pattern2 = Storage("JSON in TEXT\n(Flexible Schema)")
        pattern3 = Storage("Status-Based\nAccess Control")
        pattern4 = Storage("ACID\nTransactions")
    
    # Relationships
    backend >> Edge(label="SQL Queries\n(Knex.js ORM)", color="blue") >> database
    
    database >> Edge(label="manages", color="gray", style="dashed") >> users_table
    database >> Edge(label="manages", color="gray", style="dashed") >> proposals_table
    database >> Edge(label="manages", color="gray", style="dashed") >> versions_table
    database >> Edge(label="manages", color="gray", style="dashed") >> schemas_table
    database >> Edge(label="manages", color="gray", style="dashed") >> schema_versions_table
    
    # Foreign Key Relationships
    proposals_table >> Edge(label="user_id FK", color="purple") >> users_table
    proposals_table >> Edge(label="schema_id FK", color="purple") >> schemas_table
    versions_table >> Edge(label="proposal_id FK\n(CASCADE)", color="red") >> proposals_table
    versions_table >> Edge(label="created_by FK", color="purple") >> users_table
    schema_versions_table >> Edge(label="schema_id FK\n(CASCADE)", color="red") >> schemas_table
    
    # Pattern Applications
    pattern1 >> Edge(label="applied to", color="green", style="dotted") >> versions_table
    pattern1 >> Edge(label="applied to", color="green", style="dotted") >> schema_versions_table
    pattern2 >> Edge(label="applied to", color="green", style="dotted") >> proposals_table
    pattern2 >> Edge(label="applied to", color="green", style="dotted") >> schemas_table
    pattern3 >> Edge(label="applied to", color="green", style="dotted") >> proposals_table
    pattern4 >> Edge(label="applied to", color="green", style="dotted") >> database

print("✓ Data storage strategy diagram generated: data_storage_strategy.png")
