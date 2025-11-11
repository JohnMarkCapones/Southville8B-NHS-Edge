# Entity Relationship Diagrams (ERD) Documentation

This directory contains Entity Relationship Diagrams for the Southville 8B NHS Edge database schema.

## Files

### `erd.mmd` - Physical ERD (Complete Schema)

- **Type**: Physical/Implementation ERD
- **Scope**: All tables and columns in the public schema
- **Purpose**: Complete database documentation with all attributes
- **Use Case**: Database maintenance, development reference, schema documentation

### `erd-logical.mmd` - Logical ERD (Conceptual Model)

- **Type**: Logical/Conceptual ERD
- **Scope**: Key entities organized by domain with essential attributes
- **Purpose**: High-level understanding of system structure
- **Use Case**: System design, stakeholder communication, architecture documentation

### `erd-logical.html` - Interactive HTML Visualization

- **Type**: Standalone HTML file with embedded Mermaid diagram
- **Scope**: Same as `erd-logical.mmd` but in interactive HTML format
- **Purpose**: Easy visualization in any web browser
- **Use Case**: Presentations, documentation, quick reference
- **Usage**: Simply open `erd-logical.html` in any modern web browser

## Logical ERD Structure

The logical ERD (`erd-logical.mmd`) is organized into the following domains:

### 1. **Core User & Authentication Domain**

- `users`, `roles`, `profiles`
- `admins`, `teachers`, `students`
- User authentication and authorization

### 2. **Academic Structure Domain**

- `academic_years`, `academic_periods`
- `departments`, `subjects`, `sections`
- `schedules` (class schedules)

### 3. **Quiz & Assessment Domain**

- `quizzes`, `quiz_questions`, `quiz_choices`
- `quiz_attempts`, `quiz_student_answers`
- `question_bank`

### 4. **Clubs & Activities Domain**

- `clubs`, `student_club_memberships`
- `club_positions`

### 5. **Events & News Domain**

- `events`, `news`, `news_categories`
- `tags`

### 6. **Announcements & Alerts Domain**

- `announcements`, `alerts`

### 7. **Gallery & Media Domain**

- `gallery_albums`, `gallery_items`, `gallery_tags`

### 8. **Modules & Resources Domain**

- `modules`, `section_modules`

### 9. **Campus Infrastructure Domain**

- `buildings`, `floors`, `rooms`

### 10. **Grading & Rankings Domain**

- `students_gwa`, `student_rankings`

### 11. **Messaging & Communication Domain**

- `conversations`, `conversation_participants`, `messages`

## ERD Notation

### Cardinality Symbols (Crow's Foot Notation)

- `||--o{` = One-to-Many (one or more)
- `||--||` = One-to-One
- `}o--o{` = Many-to-Many

### Relationship Labels

Following Gliffy ERD principles, relationships use verb-based labels:

- "Has", "Contains", "Belongs to"
- "Creates", "Owns", "Manages"
- "Participates in", "Joins", "Takes"

## Traditional ERD Shapes (Conceptual)

In traditional Chen notation ERDs, the shapes represent:

### Rectangles (Entities)

- Represent tables/entities in the database
- Each rectangle contains the entity name
- In Mermaid, attributes are listed inside the rectangle

### Ovals (Attributes)

- In traditional ERDs, attributes are shown as ovals connected to entities
- In Mermaid, attributes are listed inside entity rectangles
- Primary keys are marked with "PK"
- Foreign keys are marked with "FK"
- Unique keys are marked with "UK"

### Diamonds (Relationships)

- In traditional ERDs, relationships are shown as diamonds between entities
- In Mermaid, relationships are shown as labeled lines
- Relationship labels describe the action/verb (e.g., "Has", "Creates")

### Lines (Connections)

- Connect entities to relationships (in Chen notation)
- Show cardinality with symbols (one, many, optional, required)

## Viewing the Diagrams

### Quick View (Recommended)

- **HTML File**: Simply open `erd-logical.html` in any web browser for an interactive, styled visualization
- No installation or setup required - works offline after initial load

### Using Mermaid

1. **Online**: Copy the `.mmd` file content to [Mermaid Live Editor](https://mermaid.live)
2. **VS Code**: Install the "Markdown Preview Mermaid Support" extension
3. **GitHub**: Mermaid diagrams render automatically in markdown files

### Exporting to Other Formats

- Use Mermaid CLI: `mmdc -i erd.mmd -o erd.png`
- Use online tools to convert to PNG, SVG, or PDF
- For HTML: The `erd-logical.html` file is ready to use and can be shared directly

## Best Practices

### When to Use Physical ERD (`erd.mmd`)

- Database schema documentation
- Migration planning
- Query optimization
- Complete attribute reference

### When to Use Logical ERD (`erd-logical.mmd`)

- System design discussions
- Stakeholder presentations
- Architecture documentation
- Understanding system structure

## References

- [Gliffy ERD Guide](https://www.gliffy.com/blog/how-to-draw-an-entity-relationship-diagram)
- [Mermaid ER Diagram Documentation](https://mermaid.js.org/syntax/entityRelationshipDiagram.html)
- [Chen Notation](https://en.wikipedia.org/wiki/Entity%E2%80%93relationship_model)
