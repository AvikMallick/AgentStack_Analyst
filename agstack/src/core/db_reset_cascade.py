"""
Alternative implementation of database reset using CASCADE option.
This is simpler but more dangerous as it will forcefully drop all dependent objects.
"""

from sqlalchemy import MetaData

from src.core.database import engine, Base


def reset_database_cascade():
    """
    Drop all tables using CASCADE option and recreate them.
    This is a simpler but more forceful approach.
    """
    # Create a new metadata object
    metadata = MetaData()

    # Reflect all tables from the database into the metadata
    metadata.reflect(bind=engine)

    # Print tables to be dropped
    print(f"Found {len(metadata.tables)} tables to drop:")
    for table_name in metadata.tables:
        print(f"  - {table_name}")

    # Drop all tables with CASCADE option
    print("\nDropping all tables with CASCADE...")
    metadata.drop_all(engine, checkfirst=True)

    # Recreate all tables
    print("\nCreating all tables...")
    Base.metadata.create_all(bind=engine)

    print("Database reset complete!")


if __name__ == "__main__":
    # WARNING: This will delete all data and all dependent objects
    print("WARNING: This will DELETE ALL DATA in the database and RECREATE all tables.")
    confirm = input("Are you sure you want to proceed? (y/n): ").lower()
    if confirm == 'y':
        reset_database_cascade()
    else:
        print("Operation canceled.")
