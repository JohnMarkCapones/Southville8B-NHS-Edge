# Appendix B: Acronyms and Abbreviations

A comprehensive list of acronyms and abbreviations used in the Southville 8B NHS Edge system documentation.

---

## A

### API
**Application Programming Interface**

A set of protocols, tools, and definitions for building and integrating application software. The system exposes a RESTful API at `/api/v1` for communication between frontend and backend.

### ARIA
**Accessible Rich Internet Applications**

A set of attributes that define ways to make web content and applications more accessible to people with disabilities. Used throughout the UI components.

### ASCII
**American Standard Code for Information Interchange**

A character encoding standard used in computers and communication equipment. Relevant for file name sanitization.

### AWS
**Amazon Web Services**

A cloud computing platform. Cloudflare R2 is S3-compatible, making it an alternative to AWS S3.

---

## B

### BCRYPT
**Blowfish Crypt**

A password hashing function designed to be computationally expensive. Used by Supabase Auth for password security.

---

## C

### CDN
**Content Delivery Network**

A geographically distributed network of proxy servers and data centers that deliver content to users based on their location. Used for static assets.

### CORS
**Cross-Origin Resource Sharing**

A mechanism that allows restricted resources on a web page to be requested from another domain. Configured in the NestJS backend.

### CRUD
**Create, Read, Update, Delete**

The four basic operations of persistent storage. All API endpoints support these operations where applicable.

### CSS
**Cascading Style Sheets**

A stylesheet language used to describe the presentation of HTML documents. The system uses Tailwind CSS.

### CSP
**Content Security Policy**

A security standard that helps prevent cross-site scripting (XSS) attacks by specifying which dynamic resources are allowed to load. Implemented via Helmet.

### CSV
**Comma-Separated Values**

A file format for storing tabular data. Used for data import/export features.

---

## D

### DB
**Database**

An organized collection of structured data. The system uses Supabase PostgreSQL.

### DNS
**Domain Name System**

The system that translates domain names to IP addresses. Relevant for production deployment.

### DOM
**Document Object Model**

A programming interface for HTML and XML documents. React uses a Virtual DOM for efficient updates.

### DTO
**Data Transfer Object**

An object that carries data between processes. Used in NestJS for defining API request/response shapes and validation.

---

## E

### E2E
**End-to-End**

Testing methodology that simulates real user scenarios from start to finish. Run with `npm run test:e2e`.

### ENV
**Environment**

Short for environment variables or environment configuration. Stored in `.env` files.

### ESLint
**ECMAScript Lint**

A static code analysis tool for identifying problematic patterns in JavaScript/TypeScript code.

---

## F

### FAQ
**Frequently Asked Questions**

A section of the application providing answers to common questions. Managed through the FAQ module.

### FK
**Foreign Key**

A database constraint that establishes a relationship between two tables by referencing the primary key of another table.

### FPS
**Frames Per Second**

A measure of animation smoothness. Relevant for performance optimization of UI animations.

---

## G

### GET
**HTTP GET Method**

An HTTP method used to retrieve data from a server. The most common HTTP method for read operations.

### GIT
**Global Information Tracker**

A distributed version control system for tracking changes in source code during development.

### GWA
**Grade-Weighted Average**

The weighted average of a student's grades based on subject unit values. A core academic metric in the system.

### GUI
**Graphical User Interface**

A visual interface that allows users to interact with electronic devices through graphical icons and visual indicators.

---

## H

### HTML
**HyperText Markup Language**

The standard markup language for creating web pages. React components render to HTML.

### HTTP
**HyperText Transfer Protocol**

The foundation of data communication on the web. Used for client-server communication.

### HTTPS
**HyperText Transfer Protocol Secure**

An extension of HTTP that uses encryption for secure communication over networks.

---

## I

### i18n
**Internationalization**

The process of designing software so it can be adapted to various languages and regions without engineering changes. Currently the system is English-only but designed for future i18n support.

### ID
**Identifier**

A unique reference for an entity. The system uses UUIDs as identifiers.

### IDE
**Integrated Development Environment**

A software application providing comprehensive facilities for software development. Examples: VS Code, WebStorm.

### IP
**Internet Protocol**

A protocol for routing and addressing packets of data across networks. Relevant for rate limiting by IP address.

### ISR
**Incremental Static Regeneration**

A Next.js feature allowing static pages to be updated after build time without rebuilding the entire site.

---

## J

### JS
**JavaScript**

A programming language that enables interactive web pages. TypeScript is a typed superset of JavaScript.

### JSON
**JavaScript Object Notation**

A lightweight data interchange format that is easy for humans to read and write. Used for API requests/responses.

### JSX
**JavaScript XML**

A syntax extension for JavaScript that allows writing HTML-like code in JavaScript files. Used in React components.

### JWT
**JSON Web Token**

A compact, URL-safe means of representing claims between two parties. Used for authentication in the system via Supabase Auth.

---

## K

### KB
**Kilobyte**

A unit of digital information storage equal to 1,024 bytes. Relevant for file size limits.

---

## L

### LTS
**Long-Term Support**

A version of software that receives extended support and maintenance. Node.js LTS versions are recommended.

---

## M

### MB
**Megabyte**

A unit of digital information storage equal to 1,024 kilobytes. Default R2 max file size is 10MB.

### MFA
**Multi-Factor Authentication**

An authentication method requiring two or more verification factors. Supported by Supabase Auth.

### MIME
**Multipurpose Internet Mail Extensions**

A standard for indicating the nature and format of a file. Used for file upload validation (e.g., `application/pdf`).

### MVC
**Model-View-Controller**

A software design pattern separating application logic into three interconnected components. Influences the NestJS architecture.

---

## N

### NHS
**National High School**

Part of the school's official name: Southville 8B National High School.

### npm
**Node Package Manager**

The default package manager for Node.js, used to install and manage project dependencies.

---

## O

### OAuth
**Open Authorization**

An open standard for access delegation, commonly used for token-based authentication and authorization.

### OG
**Open Graph**

A protocol enabling web pages to become rich objects in social networks. Used for Facebook/social media link previews.

### OOP
**Object-Oriented Programming**

A programming paradigm based on objects containing data and code. TypeScript supports OOP concepts.

### OpenAPI
**Open Application Programming Interface**

A specification for building APIs. Swagger implements the OpenAPI specification for API documentation.

### ORM
**Object-Relational Mapping**

A technique for converting data between incompatible type systems. Note: The system uses Supabase client directly, not an ORM like TypeORM.

### OS
**Operating System**

System software managing computer hardware and software resources. Development supports Windows, macOS, and Linux.

---

## P

### PBAC
**Permission-Based Access Control**

A fine-grained access control system based on specific permissions rather than just roles. Implemented via policies guard.

### PDF
**Portable Document Format**

A file format for presenting documents independently of software, hardware, or OS. Commonly uploaded as educational modules.

### PK
**Primary Key**

A unique identifier for a database record. The system uses UUIDs as primary keys.

### PNG
**Portable Network Graphics**

A raster graphics file format supporting lossless data compression. Used for images and logos.

### POST
**HTTP POST Method**

An HTTP method used to send data to create or update resources on the server.

### PPTX
**PowerPoint Presentation (XML)**

Microsoft PowerPoint file format. Supported for educational module uploads.

### PR
**Pull Request**

A method of submitting contributions to a project. Developers create PRs for code review before merging.

---

## Q

### QA
**Quality Assurance**

The process of ensuring software quality through systematic testing and review.

---

## R

### R2
**Cloudflare R2**

Cloudflare's object storage service compatible with Amazon S3 API. Used for all file uploads in the system.

### RBAC
**Role-Based Access Control**

An access control system where permissions are assigned to roles (Student, Teacher, Admin, SuperAdmin), and users are assigned roles.

### REST
**Representational State Transfer**

An architectural style for designing networked applications. The API follows RESTful principles.

### RGB
**Red, Green, Blue**

A color model representing colors as combinations of red, green, and blue light. Used in CSS color values.

### RLS
**Row-Level Security**

A PostgreSQL feature restricting database access based on user identity. Extensively used in all Supabase tables.

---

## S

### S3
**Simple Storage Service**

Amazon's object storage service. Cloudflare R2 is S3-compatible.

### SaaS
**Software as a Service**

A software licensing model where applications are hosted centrally and accessed via the internet. Supabase is a SaaS platform.

### SDK
**Software Development Kit**

A collection of tools, libraries, and documentation for developing applications. Supabase provides JavaScript/TypeScript SDKs.

### SEO
**Search Engine Optimization**

Practices to improve visibility in search engine results. Implemented via Next.js metadata.

### SQL
**Structured Query Language**

A language for managing and querying relational databases. Supabase uses PostgreSQL SQL dialect.

### SPA
**Single-Page Application**

A web application that loads a single HTML page and dynamically updates content. While Next.js supports SPAs, this system uses server-side rendering.

### SSG
**Static Site Generation**

Pre-rendering pages at build time. Supported by Next.js for public pages.

### SSH
**Secure Shell**

A cryptographic network protocol for secure remote login and command execution. Used for server deployment.

### SSL
**Secure Sockets Layer**

A standard security technology for establishing encrypted links. Superseded by TLS but term still commonly used.

### SSR
**Server-Side Rendering**

Generating HTML on the server for each request. Default behavior in Next.js 15 App Router.

### SVG
**Scalable Vector Graphics**

An XML-based vector image format. Used for icons and logos that need to scale cleanly.

---

## T

### TLS
**Transport Layer Security**

A cryptographic protocol providing communications security over networks. Required for HTTPS.

### TS
**TypeScript**

A typed superset of JavaScript that compiles to plain JavaScript. Used throughout the entire application.

### TTL
**Time To Live**

The lifespan of data in a cache or the duration for which a presigned URL remains valid.

### TXT
**Text File**

Plain text file format. Used for documentation and configuration.

---

## U

### UI
**User Interface**

The visual elements through which users interact with the application.

### URI
**Uniform Resource Identifier**

A string of characters that identifies a resource. URLs are a type of URI.

### URL
**Uniform Resource Locator**

The address used to access resources on the web.

### UTC
**Coordinated Universal Time**

The primary time standard by which the world regulates clocks and time. Used for timestamps in the database.

### UUID
**Universally Unique Identifier**

A 128-bit number used to uniquely identify information. Used as primary keys throughout the database.

### UX
**User Experience**

The overall experience of a person using a product, especially in terms of ease of use and satisfaction.

---

## V

### VCS
**Version Control System**

A system for tracking and managing changes to code. The project uses Git.

### VM
**Virtual Machine**

A software emulation of a computer system. May be used for deployment environments.

---

## W

### W3C
**World Wide Web Consortium**

An international community developing web standards. WCAG is a W3C standard.

### WCAG
**Web Content Accessibility Guidelines**

International standards for making web content accessible. The system targets WCAG 2.1 Level AA compliance.

### WebP
**Web Picture Format**

A modern image format providing superior compression. Supported for image uploads.

### WSL
**Windows Subsystem for Linux**

A compatibility layer for running Linux on Windows. Useful for development on Windows machines.

---

## X

### XHR
**XMLHttpRequest**

An API in the form of an object for transferring data between a web browser and a web server. Modern applications use Fetch API instead.

### XML
**eXtensible Markup Language**

A markup language that defines rules for encoding documents. Used in SVG files and some configuration formats.

### XSS
**Cross-Site Scripting**

A security vulnerability allowing attackers to inject malicious scripts into web pages. Prevented via CSP and input validation.

---

## Z

### ZIP
**Zone Information Protocol / ZIP Archive**

A file format supporting lossless data compression. May be used for bulk file downloads.

---

## Framework & Library Specific

### Next.js-Specific
- **ISR**: Incremental Static Regeneration
- **SSG**: Static Site Generation
- **SSR**: Server-Side Rendering

### NestJS-Specific
- **DTO**: Data Transfer Object
- **MVC**: Model-View-Controller (architectural influence)

### React-Specific
- **JSX**: JavaScript XML
- **DOM**: Document Object Model (Virtual DOM)

### Database-Specific
- **FK**: Foreign Key
- **PK**: Primary Key
- **RLS**: Row-Level Security
- **SQL**: Structured Query Language
- **UUID**: Universally Unique Identifier

### Authentication-Specific
- **JWT**: JSON Web Token
- **MFA**: Multi-Factor Authentication
- **OAuth**: Open Authorization
- **RBAC**: Role-Based Access Control
- **PBAC**: Permission-Based Access Control

### File & Storage
- **CDN**: Content Delivery Network
- **MIME**: Multipurpose Internet Mail Extensions
- **R2**: Cloudflare R2 (object storage)
- **S3**: Simple Storage Service (Amazon)

### Security
- **CORS**: Cross-Origin Resource Sharing
- **CSP**: Content Security Policy
- **SSL**: Secure Sockets Layer
- **TLS**: Transport Layer Security
- **XSS**: Cross-Site Scripting

### Development Tools
- **ESLint**: ECMAScript Lint
- **Git**: Global Information Tracker
- **IDE**: Integrated Development Environment
- **npm**: Node Package Manager
- **VCS**: Version Control System

---

## Quick Reference by Category

### Web Technologies
HTML, CSS, JS, TS, JSX, XML, JSON, HTTP, HTTPS, REST, API, URL, URI

### Frameworks & Libraries
Next.js, NestJS, React

### Database
SQL, DB, PK, FK, UUID, RLS, ORM

### Authentication & Security
JWT, OAuth, RBAC, PBAC, MFA, CORS, CSP, SSL, TLS, XSS, ARIA

### File Formats
PDF, PNG, JPG, SVG, WebP, CSV, ZIP, PPTX, TXT

### Cloud & Storage
CDN, R2, S3, AWS, SaaS

### Development
Git, npm, IDE, VCS, ESLint, E2E, QA, PR

### Performance
CDN, ISR, SSG, SSR, FPS, TTL

### Measurements
KB, MB, GB, UTC

---

**Navigation:**
- [← Back: Appendix A - Glossary](./appendix-a-glossary.md)
- [Next: Appendix C - Code Examples →](./appendix-c-code-examples.md)
- [Back to Appendices](./README.md)

---

**Last Updated:** January 2026
**Version:** 1.0.0
**Word Count:** ~2,100 words
