#!/usr/bin/env python
"""
Database reset/initialization script

Usage:
    python db_reset.py --init     # Only initialize tables if they don't exist (safe)
    python db_reset.py            # Reset database in order-sensitive manner (removes data)
    python db_reset.py --cascade  # Reset database using CASCADE option (forceful)
    python db_reset.py --help     # Show this help message

This script provides database management options for the application.
"""

import sys
from src.core.db_init import reset_database, initialize_database
from src.core.db_reset_cascade import reset_database_cascade

def print_help():
    """Print help information"""
    print(__doc__)

if __name__ == "__main__":
    if len(sys.argv) > 1:
        if sys.argv[1] == "--init":
            # Just initialize if tables don't exist
            print("Initializing database...")
            initialize_database()
        elif sys.argv[1] == "--cascade":
            # Reset using CASCADE approach
            print("WARNING: This will DELETE ALL DATA in the database and RECREATE all tables using CASCADE.")
            confirm = input("Are you sure you want to proceed? (y/n): ").lower()
            if confirm == 'y':
                print("Resetting database with CASCADE...")
                reset_database_cascade()
            else:
                print("Operation canceled.")
        elif sys.argv[1] == "--help" or sys.argv[1] == "-h":
            print_help()
        else:
            print(f"Unknown option: {sys.argv[1]}")
            print_help()
    else:
        # Order-sensitive reset
        print("WARNING: This will DELETE ALL DATA in the database and RECREATE all tables.")
        confirm = input("Are you sure you want to proceed? (y/n): ").lower()
        if confirm == 'y':
            print("Resetting database...")
            reset_database()
        else:
            print("Operation canceled.") 