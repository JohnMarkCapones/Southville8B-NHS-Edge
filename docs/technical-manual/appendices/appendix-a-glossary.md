# Appendix A: Glossary

A comprehensive glossary of technical terms used throughout the Southville 8B NHS Edge technical documentation.

---

## A

### Access Control
A security mechanism that determines who or what can view or use resources in a computing environment. The system implements Role-Based Access Control (RBAC) and Permission-Based Access Control (PBAC).

### Accessibility
The practice of making web applications usable by people with disabilities. The system follows WCAG 2.1 Level AA standards for accessibility compliance.

### Admin Portal
The administrative interface accessible at `/admin/*` routes, providing school administrators with tools to manage users, content, and system settings.

### API (Application Programming Interface)
A set of protocols and tools for building software applications. The system uses a RESTful API built with NestJS, documented via Swagger/OpenAPI.

### API Endpoint
A specific URL path in the API that handles requests for a particular resource or action. All endpoints are prefixed with `/api/v1`.

### API Versioning
The practice of managing changes to an API over time. The system uses URI-based versioning (e.g., `/api/v1`).

### App Router
Next.js 15's file-system based routing mechanism located in the `app/` directory. Replaces the older Pages Router with improved features like layouts, loading states, and server components.

### Asynchronous Operation
An operation that runs independently of the main program flow, allowing other operations to continue before it finishes. Common in API calls and file operations.

### Authentication
The process of verifying a user's identity, typically through credentials. The system uses Supabase Auth with JWT tokens.

### Authorization
The process of determining what an authenticated user is allowed to do. Implemented through guards, roles, and policies.

---

## B

### Backend
The server-side application built with NestJS that handles data processing, business logic, and database operations. Located in the root directory.

### Bearer Token
A security token included in the HTTP Authorization header (`Authorization: Bearer <token>`). Used for authenticating API requests.

### Breakpoint
A specific screen width at which the layout changes to accommodate different device sizes. The system uses: xs (475px), sm (640px), md (768px), lg (1024px), xl (1280px), 2xl (1536px), 3xl (1920px).

### Build
The process of compiling and optimizing the application for production deployment. Run with `npm run build`.

### Bundle
The compiled JavaScript files that make up the application. Bundle analysis helps identify optimization opportunities.

### Bundle Analysis
The process of examining the size and composition of JavaScript bundles to identify optimization opportunities. Run with `npm run analyze`.

---

## C

### Cache
Temporary storage of frequently accessed data to improve performance. Used for role lookups, static assets, and API responses.

### Callback
A function passed as an argument to another function, to be executed later. Common in asynchronous operations and event handlers.

### CDN (Content Delivery Network)
A distributed network of servers that deliver web content based on geographic location. Used for static assets and improved performance.

### Client Component
A React component that runs in the browser and can use hooks and browser APIs. Marked with `"use client"` directive in Next.js 15.

### Client-Side
Code that executes in the user's web browser rather than on the server.

### Cloudflare R2
Object storage service compatible with Amazon S3 API, used for file uploads and storage in the system.

### Component
A reusable piece of UI in React. The system organizes components by feature in the `components/` directory.

### Component Library
A collection of reusable UI components. The system uses shadcn/ui components built on Radix UI primitives.

### Composability
The ability to combine simple components to create complex functionality. Core principle in the system's component architecture.

### Configuration
Settings that control application behavior. Managed through environment variables and config files.

### CORS (Cross-Origin Resource Sharing)
A security mechanism that allows or restricts resources requested from another domain. Configured in `main.ts`.

### CSS (Cascading Style Sheets)
The language used to style web pages. The system uses Tailwind CSS utility classes.

### CSP (Content Security Policy)
A security standard that helps prevent cross-site scripting attacks. Implemented via Helmet middleware.

---

## D

### Dashboard
The main overview page for each user role (student, teacher, admin, superadmin) showing key information and quick access to features.

### Data Transfer Object (DTO)
A class that defines the shape and validation rules for data transferred between layers. All DTOs use class-validator decorators.

### Database
The persistent storage system for application data. The system uses Supabase PostgreSQL with Row-Level Security.

### Database Migration
A version-controlled change to the database schema. Managed through Supabase migrations.

### Dependency
A package or library that the application requires to function. Managed via npm and listed in package.json.

### Dependency Injection
A design pattern where dependencies are provided to a class rather than created by it. Core feature of NestJS framework.

### Deployment
The process of making the application available to users, typically on a production server.

### Dev Server
A local development server that provides hot reloading and debugging features. Started with `npm run dev`.

### Development Environment
The local setup where developers write and test code before deploying to production.

### Domain-Driven Design
An approach to software development that focuses on modeling the business domain. Influences the modular architecture.

### DTO Validation
The process of checking that incoming data matches expected formats and rules using class-validator.

### Dynamic Import
Loading JavaScript modules on demand rather than at initial page load. Used for code splitting and performance optimization.

---

## E

### E2E Testing (End-to-End Testing)
Testing that simulates real user scenarios from start to finish. Run with `npm run test:e2e`.

### Environment Variable
Configuration values stored outside the codebase, typically in `.env` files. Used for secrets and environment-specific settings.

### Entity
A class or interface representing a data model from the database. Uses TypeScript interfaces (not TypeORM classes).

### Error Boundary
A React component that catches JavaScript errors in its child component tree and displays a fallback UI.

### ESLint
A tool for identifying and fixing problems in JavaScript/TypeScript code. Run with `npm run lint`.

### Event
An action or occurrence that the system can respond to, such as user clicks or data changes.

### Event Handler
A function that executes in response to a specific event.

---

## F

### Fastify
A fast and low-overhead web framework for Node.js, used as the HTTP adapter in NestJS instead of Express.

### File Upload
The process of transferring files from client to server. Handled via Fastify multipart (not Express multer).

### Foreign Key
A database column that references the primary key of another table, establishing relationships between tables.

### Form
A user interface for collecting and submitting data. Implemented with React Hook Form and Zod validation.

### Form Validation
The process of checking user input against defined rules before submission.

### Frontend
The client-side Next.js 15 application located in `frontend-nextjs/` directory.

---

## G

### Guard
A NestJS component that determines whether a request should be handled based on certain conditions (authentication, authorization, etc.).

### Global Prefix
A URL prefix applied to all routes. The system uses `/api` as the global prefix for all API endpoints.

### Global Validation Pipe
A NestJS pipe that automatically validates incoming requests against DTOs. Configured in `main.ts`.

### GWA (Grade-Weighted Average)
The weighted average of a student's grades, calculated based on unit values of subjects.

---

## H

### Helmet
A middleware that helps secure Express/Fastify apps by setting various HTTP headers. Includes CSP configuration.

### Hook
A React function that lets you use state and other React features in functional components (e.g., useState, useEffect).

### Hot Reload
A development feature that automatically updates the application when code changes are detected, without losing state.

### HTTP (Hypertext Transfer Protocol)
The protocol used for transmitting web pages and data over the internet.

### HTTP Method
The type of request being made (GET, POST, PUT, PATCH, DELETE, etc.).

### HTTP Status Code
A three-digit code indicating the result of an HTTP request (200 OK, 404 Not Found, 500 Internal Server Error, etc.).

---

## I

### Incremental Static Regeneration (ISR)
A Next.js feature that allows updating static pages after build time without rebuilding the entire site.

### Index
A database structure that improves query performance by creating a sorted reference to data.

### Interface
A TypeScript construct that defines the shape of an object. Used for type checking and documentation.

### Internationalization (i18n)
The process of designing an application to support multiple languages and regions.

---

## J

### JWT (JSON Web Token)
A compact, URL-safe means of representing claims between two parties. Used for authentication in the system.

### JWT Verification
The process of validating a JWT token's signature and claims to ensure authenticity.

---

## K

### Key-Value Store
A type of database that stores data as key-value pairs. Used in caching mechanisms.

---

## L

### Layout
A Next.js component that wraps multiple pages, providing consistent UI elements like headers and sidebars.

### Lazy Loading
Deferring the loading of resources until they're needed. Used for code splitting and image optimization.

### Library
A collection of pre-written code that provides specific functionality. Examples: React, Zustand, Zod.

### Lint
The process of analyzing code for potential errors, style issues, and anti-patterns.

### Loading State
A UI indicator shown while data is being fetched or processed. Implemented via `loading.tsx` files.

### Localhost
The local computer being used for development, typically accessed at `http://localhost:3000`.

---

## M

### Metadata
Data that provides information about other data. In Next.js, used for SEO (title, description, Open Graph tags).

### Middleware
Software that sits between the client and server, processing requests and responses. Used for authentication, logging, etc.

### Migration
A version-controlled change to the database schema or data structure.

### Module
A self-contained unit of code that can be imported and used in other parts of the application. In NestJS, modules organize related functionality.

### Multipart Form Data
An encoding type used for forms that upload files. Handled via Fastify multipart.

### Mutation
An operation that modifies data (create, update, delete). Opposite of a query.

---

## N

### NestJS
A progressive Node.js framework for building efficient, scalable server-side applications. Used for the backend API.

### Next.js
A React framework for building full-stack web applications with server-side rendering and static site generation.

### Node.js
A JavaScript runtime built on Chrome's V8 engine that allows JavaScript to run on the server.

### npm (Node Package Manager)
A package manager for JavaScript that manages project dependencies.

---

## O

### OAuth
An open standard for access delegation, commonly used for token-based authentication.

### Object Storage
A storage architecture that manages data as objects rather than files or blocks. Cloudflare R2 is used for this purpose.

### ORM (Object-Relational Mapping)
A technique for converting data between incompatible systems. Note: The system uses Supabase client directly, not TypeORM.

### Open Graph
A protocol that enables web pages to become rich objects in social networks. Used for Facebook/social media previews.

---

## P

### Package
A reusable module of code that can be installed via npm. Listed in package.json.

### Package.json
A file that contains metadata about the project and lists its dependencies.

### PBAC (Permission-Based Access Control)
A fine-grained access control system based on specific permissions rather than just roles.

### Permission
A specific action that a user is allowed to perform. More granular than roles.

### Pipe
A NestJS component that transforms or validates input data before it reaches the route handler.

### Policy
A rule that defines who can access or modify specific resources. Implemented at the database level via RLS and application level via guards.

### PostgreSQL
An open-source relational database system. Used via Supabase.

### Presigned URL
A temporary URL that grants time-limited access to a private resource. Used for R2 file downloads.

### Production
The live environment where the application is accessible to end users.

### Production Build
An optimized version of the application created for deployment. Built with `npm run build`.

### Promise
A JavaScript object representing the eventual completion or failure of an asynchronous operation.

---

## Q

### Query
A request for data from a database or API. In databases, typically refers to SELECT statements.

### Query Parameter
Data passed in the URL after a question mark (e.g., `?page=1&limit=10`).

---

## R

### Radix UI
A library of unstyled, accessible UI components. Foundation for shadcn/ui components.

### Rate Limiting
Controlling the rate at which users can make requests to prevent abuse. Implemented via @nestjs/throttler.

### RBAC (Role-Based Access Control)
An access control system where permissions are assigned to roles, and users are assigned roles.

### React
A JavaScript library for building user interfaces using components.

### React Hook Form
A library for managing form state and validation in React applications.

### Recharts
A composable charting library built on React components.

### Responsive Design
An approach to web design that makes pages render well on various devices and screen sizes.

### REST (Representational State Transfer)
An architectural style for designing networked applications, used in the API design.

### RLS (Row-Level Security)
A PostgreSQL feature that restricts database access based on user identity. Extensively used in Supabase tables.

### Role
A category of user with specific permissions (Student, Teacher, Admin, SuperAdmin).

### Route
A URL path that maps to specific functionality or page in the application.

### Route Handler
A function that processes requests for a specific route. In Next.js 15, typically defined in `route.ts` files.

### Route Parameter
Dynamic segments in a URL path (e.g., `/api/students/[id]`).

### Routing
The process of determining which code should handle a specific URL request.

---

## S

### Schema
The structure and organization of data in a database, defining tables, columns, and relationships.

### Scope
The context in which variables and functions are accessible in code.

### SDK (Software Development Kit)
A collection of tools, libraries, and documentation for developing applications.

### SEO (Search Engine Optimization)
Practices to improve visibility in search engine results.

### Server Component
A React component that renders on the server and doesn't include client-side JavaScript. Default in Next.js 15 App Router.

### Server-Side
Code that executes on the server rather than in the user's browser.

### Server-Side Rendering (SSR)
Generating HTML on the server for each request. Supported by Next.js.

### Service
A NestJS class that contains business logic and can be injected into other components.

### Service Role Key
A Supabase key with elevated privileges that bypasses RLS. Used only on the backend.

### Session
A temporary interactive information interchange between a user and the application.

### shadcn/ui
A collection of re-usable components built with Radix UI and Tailwind CSS. Forms the UI component library.

### Sidebar
A navigation panel typically on the left side of the interface. State managed via Zustand stores.

### Slug
A URL-friendly version of a string, typically used in route parameters.

### Soft Delete
Marking records as deleted without physically removing them from the database. Implemented via `is_deleted` flags.

### SQL (Structured Query Language)
A language for managing and querying relational databases.

### SSG (Static Site Generation)
Pre-rendering pages at build time. Supported by Next.js.

### State
Data that can change over time and affects how components render.

### State Management
The practice of managing application state in a predictable way. Implemented via Zustand.

### Static Assets
Files that don't change, like images, fonts, and CSS files. Stored in the `public/` directory.

### Store
A centralized location for managing application state. Implemented with Zustand.

### Streaming
Sending HTML in chunks as it's generated, improving perceived performance. Supported by Next.js 15.

### Supabase
An open-source Firebase alternative providing authentication, database, and storage services.

### Swagger
A tool for generating interactive API documentation. Accessible at `/api/docs`.

### Synchronous Operation
An operation that blocks execution until it completes. Opposite of asynchronous.

---

## T

### Tailwind CSS
A utility-first CSS framework for rapidly building custom user interfaces.

### Test Coverage
The percentage of code executed during tests. Run with `npm run test:cov`.

### Throttling
Limiting the rate of operations, such as API requests per time period.

### Tiptap
A headless, framework-agnostic rich text editor library. Used for content editing.

### Token
A piece of data representing authentication credentials or authorization.

### Type
A TypeScript construct defining the kind of data a variable can hold.

### TypeScript
A typed superset of JavaScript that compiles to plain JavaScript. Used throughout the application.

### Type Safety
The guarantee that variables hold values of the correct type, caught at compile time.

---

## U

### UI (User Interface)
The visual elements through which users interact with the application.

### Unit Test
A test that verifies a single unit of code in isolation. Run with `npm run test`.

### URI (Uniform Resource Identifier)
A string that identifies a resource. URLs are a type of URI.

### URL (Uniform Resource Locator)
The address used to access resources on the web.

### useEffect
A React hook for performing side effects in functional components.

### useState
A React hook for adding state to functional components.

### Utility Class
A Tailwind CSS class that applies a single CSS property (e.g., `flex`, `text-center`).

### UUID (Universally Unique Identifier)
A 128-bit number used to identify information. Used for database primary keys.

---

## V

### Validation
The process of checking that data meets specified criteria.

### Validator
A function or library that performs validation. The system uses class-validator and Zod.

### Variable
A named storage location in code that holds a value.

### Version Control
A system for tracking changes to code over time. The project uses Git.

### View
A database object representing a stored query. Can simplify complex queries.

### Virtual DOM
An in-memory representation of the real DOM. React uses this for efficient updates.

---

## W

### WCAG (Web Content Accessibility Guidelines)
International standards for making web content accessible to people with disabilities.

### Web API
An API accessed via HTTP/HTTPS protocols.

### Webhook
An HTTP callback that occurs when a specific event happens. Used for real-time integrations.

### WebSocket
A protocol for two-way communication between client and server. Used by Supabase Realtime.

### Whitelist
A list of allowed items. In validation, properties explicitly allowed in DTOs.

---

## Z

### Zod
A TypeScript-first schema validation library. Used for form validation alongside React Hook Form.

### Zustand
A small, fast state management library. Used for global client state management.

---

## Cross-References

For related terms and concepts, see:

- **Authentication & Authorization**: See also JWT, Bearer Token, Guard, Role, Permission, RBAC, PBAC, RLS
- **Database Concepts**: See also Schema, Migration, Foreign Key, Index, View, RLS, UUID
- **Frontend Technologies**: See also Next.js, React, Component, Hook, State, Tailwind CSS
- **Backend Technologies**: See also NestJS, Fastify, Guard, Pipe, Service, Module
- **Storage & Files**: See also Cloudflare R2, Object Storage, File Upload, Presigned URL
- **Development Tools**: See also npm, ESLint, TypeScript, Hot Reload, Dev Server
- **Testing**: See also Unit Test, E2E Testing, Test Coverage
- **Performance**: See also Cache, Lazy Loading, Bundle Analysis, SSR, SSG

---

**Navigation:**
- [← Back to Appendices](./README.md)
- [Next: Appendix B - Acronyms →](./appendix-b-acronyms.md)

---

**Last Updated:** January 2026
**Version:** 1.0.0
**Word Count:** ~4,100 words
