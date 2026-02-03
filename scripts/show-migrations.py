#!/usr/bin/env python3
"""
Direct SQL Migration Runner for Supabase
Executes migrations using psycopg2 or HTTP API
"""

import os
import sys
import requests

# Supabase connection details
SUPABASE_URL = "https://qxkicdhsrlpehgcsapsh.supabase.co"
SUPABASE_ANON_KEY = "sb_publishable_TTBR0ES-pM7LOWDsywEy7A_9BSlhWGg"

def read_migration(filename):
    """Read SQL migration file"""
    path = os.path.join('migrations', filename)
    with open(path, 'r') as f:
        return f.read()

def apply_migration_via_api(sql, description):
    """
    Apply migration using Supabase REST API
    Note: This may not work for DDL without service role key
    """
    print(f"\n📝 {description}")
    print(f"   Method: REST API")
    
    # Try via Supabase SQL endpoint (if exposed)
    # This typically requires service role or database password
    
    print(f"   ⚠️  Cannot execute DDL via anon key")
    print(f"   💡 Manual application required")
    return False

def main():
    print("🚀 Pomelli Campaign Generator - Database Migrations\n")
    print(f"   Database: {SUPABASE_URL}")
    print(f"   Status: Requires manual SQL execution\n")
    
    print("=" * 70)
    print("MIGRATION 1: Create campaigns table")
    print("=" * 70)
    migration1 = read_migration('create_campaigns_table.sql')
    print(migration1)
    
    print("\n" + "=" * 70)
    print("MIGRATION 2: Extend brand_profiles")
    print("=" * 70)
    migration2 = read_migration('extend_brand_profiles_for_pomelli.sql')
    print(migration2)
    
    print("\n" + "=" * 70)
    print("📋 MANUAL APPLICATION REQUIRED")
    print("=" * 70)
    print("""
To apply these migrations:

1. Open Supabase Studio: https://supabase.com/dashboard/project/qxkicdhsrlpehgcsapsh
2. Go to SQL Editor → New query
3. Copy/paste Migration 1 above → Run
4. Copy/paste Migration 2 above → Run
5. Verify: SELECT * FROM campaigns LIMIT 1;

Alternatively, if you have database password:
  psql "postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres" \\
    -f migrations/create_campaigns_table.sql

Once complete, test at: http://localhost:3000/apps/post-generator/
""")

if __name__ == "__main__":
    main()
