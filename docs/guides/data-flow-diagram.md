# Data Flow Diagram (DFD) Guide

**Last Updated:** January 2025  
**Project:** Southville 8B NHS Edge - System Documentation

## What is DFD (Data Flow Diagram)?

A Data Flow Diagram is a visual representation of the flow of data within a system. It helps to understand the flow of data throughout the system, from input to output, and how it gets transformed along the way. The models enable software engineers, customers, and users to work together effectively during the analysis and specification of requirements.

## Table of Contents

1. [What is Data Flow Diagram (DFD)?](#what-is-data-flow-diagram-dfd)
2. [Levels in Data Flow Diagram (DFD)](#levels-in-data-flow-diagram-dfd)
3. [Types of Data Flow Diagram (DFD)](#types-of-data-flow-diagram-dfd)
4. [Components of Data Flow Diagrams (DFD)](#components-of-data-flow-diagrams-dfd)
5. [Rules for Data Flow Diagram (DFD)](#rules-for-data-flow-diagram-dfd)
6. [Example of Levels of Data Flow Diagram (DFD)](#example-of-levels-of-data-flow-diagram-dfd)
7. [Advantages of Data Flow Diagram (DFD)](#advantages-of-data-flow-diagram-dfd)
8. [Disadvantages of Data Flow Diagram (DFD)](#disadvantages-of-data-flow-diagram-dfd)
9. [Application to Southville 8B NHS Edge](#application-to-southville-8b-nhs-edge)

---

## What is Data Flow Diagram (DFD)?

Data Flow Diagram (DFD) is a graphical representation of data flow in any system. It is capable of illustrating incoming data flow, outgoing data flow and store data. The DFD depicts both incoming and outgoing data flows and provides a high-level overview of system functionality. It is a relatively simple technique to learn and use, making it accessible for both technical and non-technical stakeholders.

Data Flow Diagrams can be represented in several ways. The Data Flow Diagram (DFD) belongs to structured-analysis tools. Data Flow diagrams are very popular because they help us to visualize the major steps and data involved in software-system processes.

### Basic Structure of DFD

A typical DFD consists of:

- **Processes** (circles/rounded rectangles) - Transform data
- **Data Stores** (open rectangles) - Store data
- **External Entities** (rectangles) - Interact with the system
- **Data Flows** (arrows) - Show data movement

### Characteristics of Data Flow Diagram (DFD)

Below are some characteristics of Data Flow Diagram (DFD):

1. **Graphical Representation**: Data Flow Diagrams (DFD) use different symbols and notation to represent data flow within a system. This simplifies the complex system into understandable visual elements, making them easier to interpret by both technical and non-technical stakeholders.

2. **Problem Analysis**: DFDs are very useful in understanding a system and can be effectively used during analysis. DFDs are quite general and are not limited to problem analysis for software requirements specification.

3. **Abstraction**: DFDs abstract away the implementation details and focus on the data flow and processes within a system. They provide a high-level overview and omit unnecessary technical information.

4. **Hierarchy**: DFDs provide a hierarchy of a system. High-level diagrams (i.e., 0-level diagram) provide an overview of the entire system, while lower-level diagrams like 1-level DFD and beyond provide detailed data flow of individual processes.

## Levels in Data Flow Diagram (DFD)

DFDs are categorized into various levels, with each level providing different degrees of detail. The levels are numbered from 0 and onward. The higher the level number, the more detailed the diagram becomes. The following are the four levels of DFDs:

### 0-Level Data Flow Diagram (DFD)

Level 0 DFD is the highest-level diagram, representing the system as a single process with its interactions with external entities. It shows the major processes, data flows, and data stores in the system, without providing any details about the internal workings of these processes. It is also known as the **Context Diagram**, which abstracts the system's operations and shows how data enters and leaves the system.

### 1-Level Data Flow Diagram (DFD)

Level 1 DFD provides a more detailed view of the system by breaking down the major processes identified in the level 0 DFD into sub-processes. Each sub-process is depicted as a separate process on the level 1 DFD. The data flows and data stores associated with each sub-process are also shown. The Context Diagram from Level 0 is expanded into multiple bubbles/processes.

### 2-Level Data Flow Diagram (DFD)

Level 2 DFD further breaks down the sub-processes from Level 1 DFD into additional sub-processes, providing an even more detailed view. This level is useful when dealing with specific requirements or parts of the system that need a closer examination of their processes and interactions.

### 3-Level Data Flow Diagram (DFD)

Level 3 is the most detailed level of DFDs, which provides a detailed view of the processes, data flows, and data stores in the system. This level is typically used for complex systems, where a high level of detail is required to understand the system. It includes detailed descriptions of each process, data flow, and data store, and is usually used when there is a need for a comprehensive understanding of the system.

## Types of Data Flow Diagram (DFD)

DFDs can be classified into two main types, each focusing on a different perspective of system design:

### 1. Logical Data Flow Diagram (DFD)

The Logical Data Flow Diagram mainly focuses on the system process. It illustrates how data flows in the system. Logical DFDs focus on high-level processes and data flow without diving deep into technical implementation details.

**Use Cases:**

- Business process analysis
- Requirements gathering
- System understanding for stakeholders
- Example: In a banking software system, it describes how data is moved from one entity to another

**Note:** Logical DFDs are used in various organizations for the smooth running of systems.

### 2. Physical Data Flow Diagram

Physical data flow diagrams show how the data flow is actually implemented in the system. In Physical DFDs, we include additional details such as:

- Data storage mechanisms
- Data transmission protocols
- Specific technology or system components
- Hardware and software details

Physical DFDs are more detailed and provide a closer look at the actual implementation of the system, including the hardware, software, and physical aspects of data processing.

## Components of Data Flow Diagrams (DFD)

A DFD consists of four main components that work together to represent the flow of data within the system:

### 1. Process

**Symbol:** Rectangular with rounded corners, oval, rectangle, or circle

**Description:** Input to output transformation in a system takes place because of process functions. The process is named with a short sentence, one word, or a phrase to express its essence.

**Example:** "Validate User Credentials", "Calculate Grade", "Generate Report"

### 2. Data Flow

**Symbol:** Arrow

**Description:** Data flow describes the information transferring between different parts of the systems. A relatable name should be given to the flow to determine the information being moved.

**Characteristics:**

- Can represent both information and material being moved
- A given flow should only transfer a single type of information
- The direction of flow is represented by the arrow (can be bi-directional)

**Example:** "Student Information", "Quiz Results", "Authentication Token"

### 3. Data Store (Warehouse)

**Symbol:** Two horizontal lines (open rectangle)

**Description:** The data is stored in the data store for later use. The data store is not restricted to being a data file; it can be anything like a folder with documents, an optical disc, a filing cabinet, or a database.

**Operations:**

- **Reading:** When data flows from the data store
- **Writing/Updating:** When data flows to the data store

**Example:** "Student Database", "Quiz Repository", "User Sessions"

### 4. External Entity (Terminator)

**Symbol:** Rectangle

**Description:** An external entity that stands outside of the system and communicates with the system. It can be organizations like banks, groups of people like customers, or different departments of the same organization that are not part of the modeled system.

**Example:** "Student", "Teacher", "Parent", "Admin", "External API"

## Rules for Data Flow Diagram (DFD)

Following are the rules of DFD:

### 1. Data CAN Flow From:

- ✅ **External Entity → Process**
- ✅ **Process → External Entity**
- ✅ **Process → Data Store** (writing/updating)
- ✅ **Data Store → Process** (reading)
- ✅ **Process → Process**

### 2. Data CANNOT Flow From:

- ❌ **External Entity → External Entity** (must go through a process)
- ❌ **External Entity → Data Store** (must go through a process)
- ❌ **Data Store → External Entity** (must go through a process)
- ❌ **Data Store → Data Store** (must go through a process)

**Key Principle:** All data flows must involve at least one process. External entities and data stores cannot directly communicate with each other.

## Example of Levels of Data Flow Diagram (DFD)

DFDs use hierarchy to maintain transparency; thus, multilevel DFDs can be created. Levels of DFD are as follows:

### 0-Level DFD (Context Diagram)

It is also known as a **context diagram**. It's designed to be an abstraction view, showing the system as a single process with its relationship to external entities. It represents the entire system as a single bubble with input and output data indicated by incoming/outgoing arrows.

**Example:** A Railway Reservation System at Level 0 would show:

- External Entities: Customer, Railway Admin
- Single Process: Railway Reservation System
- Data Flows: Reservation Request, Ticket Details, Payment Information, etc.

### 1-Level DFD

This level provides a more detailed view by breaking down the major processes identified in the level 0 DFD into sub-processes. Each sub-process is depicted as a separate process. The data flows and data stores associated with each sub-process are also shown.

**Example:** Railway Reservation System at Level 1 might include:

- Process 1: Validate User
- Process 2: Check Seat Availability
- Process 3: Process Payment
- Process 4: Generate Ticket
- Data Stores: User Database, Seat Database, Payment Records

### 2-Level DFD

This level provides an even more detailed view by breaking down the sub-processes identified in the Level 1 DFD into further sub-processes. Each sub-process is depicted as a separate process. The data flows and data stores associated with each sub-process are also shown.

**Example:** "Process Payment" from Level 1 might be broken down into:

- 2.1: Validate Payment Method
- 2.2: Process Credit Card
- 2.3: Update Account Balance
- 2.4: Generate Receipt

## Advantages of Data Flow Diagram (DFD)

1. **Understanding the System**: DFDs help in understanding how information flows through the system, revealing important functional components.

2. **Graphical Representation**: DFDs provide a simple, visual representation that is easy to understand, making them useful for both technical and non-technical stakeholders.

3. **Detailed System Breakdown**: DFDs can break down systems into individual processes, allowing for clearer documentation and a better understanding of the workflow.

4. **System Documentation**: DFDs are useful in documenting systems, ensuring that processes are well-defined for both current and future development needs.

5. **Communication Tool**: Facilitates communication between developers, stakeholders, and users during system design and analysis.

## Disadvantages of Data Flow Diagram (DFD)

1. **Time-Consuming**: Creating DFDs, especially for complex systems, can be time-consuming and may require extensive effort.

2. **Limited Scope**: DFDs focus only on data flow and may not capture other aspects like system security, performance, or user interfaces.

3. **Updating Challenges**: DFDs may become outdated if the system undergoes frequent changes. Keeping them up to date can require significant maintenance.

4. **Requires Expertise**: Although simple to understand, creating accurate DFDs requires technical expertise in analyzing the system and defining the data flows.

5. **No Control Flow**: DFDs don't show control flow or decision logic, which may be important for understanding system behavior.

## Application to Southville 8B NHS Edge

### Recommended DFD Structure for This System

Given the complexity of the Southville 8B NHS Edge system with **111 database tables** and multiple modules, the following DFD approach is recommended:

#### Level 0 (Context Diagram) - External Entities:

- **Students** - Access learning materials, take quizzes, view grades
- **Teachers** - Create content, manage classes, grade assignments
- **Administrators** - Manage users, generate reports, configure system
- **Parents** - View student progress, receive notifications
- **External Systems** - Supabase (database), Cloudflare R2 (storage), Chat Service

#### Level 1 - Major Processes:

1. **User Authentication & Authorization**
2. **Academic Management** (schedules, calendar, periods)
3. **Quiz System** (creation, taking, grading)
4. **Learning Management** (modules, materials, assignments)
5. **Communication** (messaging, announcements, notifications)
6. **Student Information Management** (profiles, grades, rankings)
7. **Club Management** (memberships, events, forms)
8. **Content Management** (news, events, gallery)
9. **Analytics & Reporting**

#### Level 2 - Detailed Processes (Example: Quiz System):

- 2.1: Create Quiz
- 2.2: Assign Quiz to Sections
- 2.3: Student Takes Quiz
- 2.4: Monitor Quiz Session
- 2.5: Grade Quiz
- 2.6: Generate Analytics

### Data Stores for Southville 8B NHS Edge:

- **User Data Store** (users, profiles, students, teachers, admins)
- **Academic Data Store** (schedules, subjects, sections, academic_years)
- **Quiz Data Store** (quizzes, quiz_attempts, quiz_questions, quiz_analytics)
- **Content Data Store** (modules, news, announcements, gallery)
- **Communication Data Store** (messages, conversations, alerts)
- **Club Data Store** (clubs, memberships, events)
- **File Storage** (Cloudflare R2 for images, documents)

### Next Steps:

1. **Create Level 0 DFD** - Context diagram showing all external entities
2. **Create Level 1 DFD** - Break down into major functional modules
3. **Create Level 2 DFDs** - Detail critical processes (Quiz System, User Management, etc.)
4. **Use Tools**: Consider using Mermaid diagrams, Draw.io, or Lucidchart for visualization

## Conclusion

A Data Flow Diagram (DFD) is an essential tool for understanding and designing systems by illustrating how data flows between different processes and components. By analyzing different levels of DFDs, one can identify system scope, data transformations, and potential inefficiencies, aiding in improving system architecture and decision-making. DFDs, along with other design tools, provide a comprehensive approach to system analysis and design.

For the Southville 8B NHS Edge system, creating DFDs will help document the complex interactions between 111 database entities and multiple system modules, making it easier for developers, stakeholders, and future maintainers to understand the system architecture.
