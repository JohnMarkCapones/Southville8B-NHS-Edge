#!/usr/bin/env python3
"""
Convert PostgreSQL schema from supabase_public_tables.md to dbdiagram (dbml) format.
"""

import re
from typing import Dict, List, Tuple, Optional

# Type mapping from PostgreSQL to dbdiagram
TYPE_MAP = {
    'uuid': 'uuid',
    'character varying': 'varchar',
    'varchar': 'varchar',
    'text': 'text',
    'integer': 'int',
    'bigint': 'bigint',
    'boolean': 'boolean',
    'date': 'date',
    'timestamp with time zone': 'timestamp',
    'timestamp without time zone': 'timestamp',
    'jsonb': 'json',
    'json': 'json',
    'numeric': 'decimal',
    'inet': 'varchar',  # dbdiagram doesn't have inet type
    'time without time zone': 'time',
    'ARRAY': 'array',
    'USER-DEFINED': 'varchar',  # Handle custom types
}

class Column:
    def __init__(self, name: str, col_type: str, nullable: bool = True, default: Optional[str] = None, 
                 is_pk: bool = False, is_unique: bool = False, check_constraint: Optional[str] = None):
        self.name = name
        self.col_type = col_type
        self.nullable = nullable
        self.default = default
        self.is_pk = is_pk
        self.is_unique = is_unique
        self.check_constraint = check_constraint
    
    def to_dbml(self) -> str:
        """Convert column to dbml format"""
        attrs = []
        
        if self.is_pk:
            attrs.append('pk')
        
        # Note: dbdiagram doesn't require 'not null' - columns are nullable by default
        # Only include essential attributes: pk, default, unique, note
        
        if self.is_unique:
            attrs.append('unique')
        
        if self.default:
            # Clean up default values for dbml
            default_val = self.default
            # Handle function calls
            if 'gen_random_uuid()' in default_val or 'uuid_generate_v4()' in default_val:
                default_val = '`gen_random_uuid()`'
            elif 'now()' in default_val:
                default_val = '`now()`'
            elif 'CURRENT_DATE' in default_val:
                default_val = '`CURRENT_DATE`'
            elif isinstance(default_val, str) and default_val.replace('.', '').replace('-', '').isdigit():
                # Numeric (already a string)
                default_val = default_val
            elif isinstance(default_val, str) and default_val.lower() in ('true', 'false'):
                # Boolean
                default_val = default_val.lower()
            elif isinstance(default_val, str):
                # String literal - wrap in quotes
                default_val = f"'{default_val}'"
            else:
                default_val = f'`{default_val}`'
            
            attrs.append(f'default: {default_val}')
        
        if self.check_constraint:
            attrs.append(f'note: "{self.check_constraint}"')
        
        attr_str = ', '.join(attrs) if attrs else ''
        return f'  {self.name} {self.col_type}' + (f' [{attr_str}]' if attr_str else '')

class Table:
    def __init__(self, name: str):
        self.name = name
        self.columns: List[Column] = []
        self.foreign_keys: List[Tuple[str, str, str]] = []  # (column, ref_table, ref_column)
        self.composite_pk: List[str] = []  # For composite primary keys
    
    def add_column(self, column: Column):
        self.columns.append(column)
    
    def add_foreign_key(self, column: str, ref_table: str, ref_column: str):
        self.foreign_keys.append((column, ref_table, ref_column))
    
    def to_dbml(self) -> str:
        """Convert table to dbml format"""
        lines = [f'Table {self.name} {{']
        for col in self.columns:
            lines.append(col.to_dbml())
        lines.append('}')
        return '\n'.join(lines)

def parse_type(col_def: str) -> Tuple[str, bool]:
    """Parse column type from column definition"""
    col_def = col_def.strip()
    
    # Handle ARRAY type
    if 'ARRAY' in col_def.upper():
        return 'array', True
    
    # Handle various timestamp types
    if 'timestamp with time zone' in col_def.lower():
        return 'timestamp', True
    if 'timestamp without time zone' in col_def.lower():
        return 'timestamp', True
    
    # Handle time without time zone
    if 'time without time zone' in col_def.lower():
        return 'time', True
    
    # Handle character varying
    if 'character varying' in col_def.lower():
        return 'varchar', True
    
    # Handle other types
    for pg_type, dbml_type in TYPE_MAP.items():
        if pg_type.lower() in col_def.lower():
            return dbml_type, True
    
    # Default to varchar if unknown
    return 'varchar', True

def parse_default(default_str: str) -> Optional[str]:
    """Parse and clean default value"""
    if not default_str:
        return None
    
    default_str = default_str.strip()
    
    # Remove ::type casts (but preserve the value before the cast)
    if '::' in default_str:
        # Extract value before the cast
        parts = default_str.split('::')
        default_str = parts[0].strip()
    
    # Handle function calls
    if 'gen_random_uuid()' in default_str or 'uuid_generate_v4()' in default_str:
        return 'gen_random_uuid()'
    if 'now()' in default_str:
        return 'now()'
    if 'CURRENT_DATE' in default_str:
        return 'CURRENT_DATE'
    if 'nextval' in default_str:
        return None  # Skip sequence defaults
    
    # Handle string literals - extract the actual string value
    if default_str.startswith("'") and default_str.endswith("'"):
        # Remove quotes and return the string
        return default_str.strip("'")
    # Handle string literals with varying suffix
    if "'" in default_str:
        # Extract string between quotes
        match = re.search(r"'([^']*)'", default_str)
        if match:
            return match.group(1)
    
    # Handle numeric defaults
    cleaned = default_str.replace('.', '').replace('-', '').replace('+', '')
    if cleaned.isdigit():
        return default_str
    
    # Handle boolean defaults
    if default_str.lower() in ('true', 'false'):
        return default_str.lower()
    
    # Handle interval defaults
    if 'interval' in default_str.lower():
        return None  # Skip complex interval defaults
    
    return default_str

def extract_check_constraint(check_str: str) -> Optional[str]:
    """Extract CHECK constraint description"""
    if not check_str:
        return None
    
    # Simplify CHECK constraints for notes
    check_str = check_str.strip()
    
    # Extract meaningful parts
    if 'ARRAY' in check_str:
        # Extract allowed values
        match = re.search(r"ARRAY\[(.*?)\]", check_str)
        if match:
            return f"Allowed values: {match.group(1)[:100]}"
    
    if '>=' in check_str and '<=' in check_str:
        # Range constraint
        match = re.search(r'>= (.*?) AND .*? <= (.*?)', check_str)
        if match:
            return f"Range: {match.group(1)} to {match.group(2)}"
    
    if '~' in check_str or '~*' in check_str:
        return "Pattern validation"
    
    # Truncate long constraints
    if len(check_str) > 100:
        return check_str[:100] + "..."
    
    return check_str

def parse_schema(sql_content: str) -> Tuple[Dict[str, Table], List[Tuple[str, str, str, str]]]:
    """Parse SQL schema and return tables and foreign key relationships"""
    tables: Dict[str, Table] = {}
    relationships: List[Tuple[str, str, str, str]] = []  # (table, column, ref_table, ref_column)
    
    # Split by CREATE TABLE statements
    table_blocks = re.split(r'CREATE TABLE public\.(\w+)', sql_content)
    
    for i in range(1, len(table_blocks), 2):
        if i + 1 >= len(table_blocks):
            break
        
        table_name = table_blocks[i]
        table_body = table_blocks[i + 1]
        
        table = Table(table_name)
        
        # Extract primary key constraint
        pk_match = re.search(r'CONSTRAINT (\w+_pkey) PRIMARY KEY \((.*?)\)', table_body)
        pk_columns = []
        if pk_match:
            pk_cols_str = pk_match.group(2)
            pk_columns = [col.strip() for col in pk_cols_str.split(',')]
            if len(pk_columns) > 1:
                table.composite_pk = pk_columns
        
        # Extract all column definitions
        # Remove CONSTRAINT statements first to avoid confusion
        table_body_clean = re.sub(r'CONSTRAINT\s+\w+\s+(?:PRIMARY\s+KEY|FOREIGN\s+KEY|UNIQUE|CHECK).*?(?:,|$)', '', table_body, flags=re.IGNORECASE | re.MULTILINE)
        
        # Split by commas, but be careful with nested parentheses
        # Pattern: column_name type [constraints] followed by comma or end
        # Match columns that are not CONSTRAINT statements
        col_pattern = r'^\s*(\w+)\s+([^,\n]+?)(?:,\s*$|,\s*(?=\w+\s)|$)'
        
        # Process line by line, handling multi-line column definitions
        lines = table_body.split('\n')
        current_col_def = []
        
        for line in lines:
            line = line.strip()
            if not line or line.startswith('--'):
                continue
            
            # Skip CONSTRAINT lines
            if line.upper().startswith('CONSTRAINT'):
                if current_col_def:
                    # Process accumulated column definition
                    col_full = ' '.join(current_col_def)
                    col_match = re.match(r'^(\w+)\s+(.+)$', col_full)
                    if col_match:
                        col_name = col_match.group(1)
                        col_def = col_match.group(2).rstrip(',').strip()
                        
                        if col_name.upper() != 'CONSTRAINT':
                            # Parse this column
                            col_type, _ = parse_type(col_def)
                            nullable = 'NOT NULL' not in col_def.upper()
                            is_unique = 'UNIQUE' in col_def.upper()
                            
                            default_match = re.search(r'DEFAULT\s+([^,\n]+?)(?:\s|$|,|CONSTRAINT)', col_def, re.IGNORECASE)
                            default_val = None
                            if default_match:
                                default_val = parse_default(default_match.group(1))
                            
                            is_pk = col_name in pk_columns and len(pk_columns) == 1
                            
                            check_match = re.search(r'CHECK\s*\((.*?)\)', col_def, re.IGNORECASE)
                            check_constraint = None
                            if check_match:
                                check_constraint = extract_check_constraint(check_match.group(1))
                            
                            column = Column(col_name, col_type, nullable, default_val, is_pk, is_unique, check_constraint)
                            table.add_column(column)
                
                current_col_def = []
                continue
            
            # Check if this line starts a new column (word followed by type-like text)
            if re.match(r'^\w+\s+[a-z]', line, re.IGNORECASE):
                if current_col_def:
                    # Process previous column
                    col_full = ' '.join(current_col_def)
                    col_match = re.match(r'^(\w+)\s+(.+)$', col_full)
                    if col_match:
                        col_name = col_match.group(1)
                        col_def = col_match.group(2).rstrip(',').strip()
                        
                        if col_name.upper() != 'CONSTRAINT':
                            col_type, _ = parse_type(col_def)
                            nullable = 'NOT NULL' not in col_def.upper()
                            is_unique = 'UNIQUE' in col_def.upper()
                            
                            default_match = re.search(r'DEFAULT\s+([^,\n]+?)(?:\s|$|,|CONSTRAINT)', col_def, re.IGNORECASE)
                            default_val = None
                            if default_match:
                                default_val = parse_default(default_match.group(1))
                            
                            is_pk = col_name in pk_columns and len(pk_columns) == 1
                            
                            check_match = re.search(r'CHECK\s*\((.*?)\)', col_def, re.IGNORECASE)
                            check_constraint = None
                            if check_match:
                                check_constraint = extract_check_constraint(check_match.group(1))
                            
                            column = Column(col_name, col_type, nullable, default_val, is_pk, is_unique, check_constraint)
                            table.add_column(column)
                
                current_col_def = [line]
            else:
                # Continuation of previous column
                if current_col_def:
                    current_col_def.append(line)
                else:
                    # Might be a standalone column
                    col_match = re.match(r'^\s*(\w+)\s+([^,\n]+?)(?:,|$)', line)
                    if col_match and col_match.group(1).upper() != 'CONSTRAINT':
                        current_col_def = [line]
        
        # Process last column if any
        if current_col_def:
            col_full = ' '.join(current_col_def)
            col_match = re.match(r'^(\w+)\s+(.+)$', col_full)
            if col_match:
                col_name = col_match.group(1)
                col_def = col_match.group(2).rstrip(',').strip()
                
                if col_name.upper() != 'CONSTRAINT':
                    col_type, _ = parse_type(col_def)
                    nullable = 'NOT NULL' not in col_def.upper()
                    is_unique = 'UNIQUE' in col_def.upper()
                    
                    default_match = re.search(r'DEFAULT\s+([^,\n]+?)(?:\s|$|,|CONSTRAINT)', col_def, re.IGNORECASE)
                    default_val = None
                    if default_match:
                        default_val = parse_default(default_match.group(1))
                    
                    is_pk = col_name in pk_columns and len(pk_columns) == 1
                    
                    check_match = re.search(r'CHECK\s*\((.*?)\)', col_def, re.IGNORECASE)
                    check_constraint = None
                    if check_match:
                        check_constraint = extract_check_constraint(check_match.group(1))
                    
                    column = Column(col_name, col_type, nullable, default_val, is_pk, is_unique, check_constraint)
                    table.add_column(column)
        
        # Extract foreign key constraints
        fk_pattern = r'CONSTRAINT\s+(\w+)\s+FOREIGN\s+KEY\s+\((\w+)\)\s+REFERENCES\s+public\.(\w+)\((\w+)\)'
        fk_matches = re.finditer(fk_pattern, table_body)
        
        for fk_match in fk_matches:
            fk_name = fk_match.group(1)
            fk_column = fk_match.group(2)
            ref_table = fk_match.group(3)
            ref_column = fk_match.group(4)
            
            table.add_foreign_key(fk_column, ref_table, ref_column)
            relationships.append((table_name, fk_column, ref_table, ref_column))
        
        # Handle composite primary keys
        if len(pk_columns) > 1:
            # Mark all composite PK columns
            for col in table.columns:
                if col.name in pk_columns:
                    col.is_pk = True
        
        tables[table_name] = table
    
    return tables, relationships

def generate_dbml(tables: Dict[str, Table], relationships: List[Tuple[str, str, str, str]]) -> str:
    """Generate dbml file content"""
    lines = ['// Supabase Database Schema - Converted to dbdiagram format', '']
    
    # Group tables by category for better organization
    table_categories = {
        'Core': ['users', 'roles', 'profiles', 'user_preferences', 'user_positions', 'user_domain_roles', 'permissions', 'domain_roles', 'domains', 'domain_role_permissions'],
        'Students': ['students', 'student_activities', 'student_club_memberships', 'student_rankings', 'student_schedule', 'students_gwa', 'emergency_contacts'],
        'Teachers': ['teachers'],
        'Admins': ['admins'],
        'Academic': ['academic_years', 'academic_periods', 'academic_year_settings', 'academic_year_templates', 'academic_calendar', 'academic_calendar_days', 'academic_calendar_markers'],
        'Subjects & Departments': ['subjects', 'departments', 'departments_information'],
        'Sections & Schedules': ['sections', 'schedules', 'schedule_audit', 'schedule_templates', 'schedules_audit_log'],
        'Buildings & Rooms': ['buildings', 'floors', 'rooms', 'campus_facilities', 'locations', 'hotspots'],
        'Clubs': ['clubs', 'club_announcements', 'club_benefits', 'club_faqs', 'club_forms', 'club_form_questions', 'club_form_question_options', 'club_form_answers', 'club_form_responses', 'club_goals', 'club_positions'],
        'Events': ['events', 'event_additional_info', 'event_highlights', 'event_schedule', 'event_tags', 'events_faq'],
        'Announcements': ['announcements', 'announcement_sections', 'announcement_tags', 'announcement_targets'],
        'News': ['news', 'news_approval', 'news_categories', 'news_co_authors', 'news_review_comments', 'news_tags'],
        'Gallery': ['gallery_albums', 'gallery_items', 'gallery_tags', 'gallery_item_tags', 'gallery_views', 'gallery_downloads'],
        'Quiz System': ['quizzes', 'quiz_questions', 'quiz_choices', 'quiz_attempts', 'quiz_student_answers', 'quiz_student_summary', 'quiz_settings', 'quiz_sections', 'quiz_section_settings', 'quiz_active_sessions', 'quiz_participants', 'quiz_session_answers', 'quiz_analytics', 'quiz_question_stats', 'quiz_question_metadata', 'quiz_access_links', 'quiz_access_logs', 'quiz_activity_logs', 'quiz_flags', 'quiz_device_sessions', 'question_bank'],
        'Modules & Resources': ['modules', 'module_download_logs', 'section_modules', 'teacher_files', 'teacher_folders', 'teacher_file_downloads'],
        'Chat': ['conversations', 'conversation_participants', 'messages'],
        'Alerts & Notifications': ['alerts', 'alert_reads', 'banner_notifications', 'daily_logins'],
        'Tags & Misc': ['tags', 'faq', 'user_push_tokens'],
    }
    
    # Add tables in organized groups
    added_tables = set()
    for category, table_list in table_categories.items():
        category_tables = [t for t in table_list if t in tables and t not in added_tables]
        if category_tables:
            lines.append(f'// {category}')
            for table_name in category_tables:
                lines.append(tables[table_name].to_dbml())
                lines.append('')
                added_tables.add(table_name)
    
    # Add any remaining tables not in categories
    remaining_tables = [t for t in tables.keys() if t not in added_tables]
    if remaining_tables:
        lines.append('// Other Tables')
        for table_name in sorted(remaining_tables):
            lines.append(tables[table_name].to_dbml())
            lines.append('')
    
    # Add relationships
    lines.append('// Relationships')
    for table, column, ref_table, ref_column in relationships:
        # Skip if ref_table doesn't exist (might be auth.users or other external tables)
        if ref_table in tables:
            lines.append(f'Ref: {table}.{column} > {ref_table}.{ref_column}')
    
    return '\n'.join(lines)

def main():
    # Read the SQL schema file
    with open('supabase_public_tables.md', 'r', encoding='utf-8') as f:
        sql_content = f.read()
    
    # Parse the schema
    print("Parsing SQL schema...")
    tables, relationships = parse_schema(sql_content)
    print(f"Found {len(tables)} tables and {len(relationships)} relationships")
    
    # Generate dbml
    print("Generating dbml file...")
    dbml_content = generate_dbml(tables, relationships)
    
    # Write to file
    output_file = 'supabase-schema.dbml'
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(dbml_content)
    
    print(f"Successfully generated {output_file}")
    print(f"Total tables: {len(tables)}")
    print(f"Total relationships: {len(relationships)}")

if __name__ == '__main__':
    main()

