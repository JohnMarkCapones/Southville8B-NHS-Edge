Commit Message Format:
<type>(<scope>): <description>

[optional body]

[optional footer]
•	type: The type of the change (e.g., feat, fix, docs, chore, refactor, etc.)
•	scope (optional): The part of the project the change is related to (e.g., frontend, backend, auth, ui, api, etc.)
•	description: A short summary of the change, written in the imperative mood.
•	body (optional): More detailed explanation of the change.
•	footer (optional): Any breaking changes or references to issues.
________________________________________
Common Commit Types and Examples:
1. feat – Feature:
Indicates that a new feature has been added to the codebase.
•	feat(auth): add user login functionality
•	feat(profile): enable users to update their profile picture
•	feat(api): implement new endpoints for user registration
•	feat(ui): add dark mode toggle to the settings page
2. fix – Bug Fix:
Indicates that a bug or issue has been fixed.
•	fix(auth): correct password hashing algorithm
•	fix(login): resolve issue with login form submission
•	fix(api): fix broken endpoint for fetching user details
•	fix(ui): resolve UI glitch when resizing the page
3. docs – Documentation:
Indicates changes to the documentation.
•	docs(readme): update project setup instructions
•	docs(api): add documentation for new user registration endpoints
•	docs(contributing): add guidelines for submitting pull requests
•	docs(security): update password security recommendations
4. chore – Chores:
Indicates changes that don’t modify code or functionality, such as updates to dependencies or build configurations.
•	chore(deps): update react and tailwindcss dependencies
•	chore(ci): update GitHub Actions workflow for linting
•	chore(docker): update Dockerfile for multi-stage build
•	chore(config): clean up unused environment variables
5. refactor – Code Refactor:
Indicates changes made to improve the codebase without altering the functionality.
•	refactor(auth): refactor user authentication service for readability
•	refactor(api): simplify database query logic
•	refactor(ui): clean up redundant styles in the header component
•	refactor(profile): move profile logic into separate module
6. test – Tests:
Indicates changes related to tests, such as adding, updating, or removing tests.
•	test(auth): add unit tests for login functionality
•	test(api): add integration tests for new user endpoints
•	test(ui): write e2e tests for the homepage
•	test(profile): add unit tests for profile update form
7. style – Style:
Indicates changes related to formatting, style, or appearance (e.g., fixing whitespace, formatting code, etc.), but not code logic.
•	style(ui): fix indentation in navbar component
•	style(footer): standardize footer link styles
•	style(auth): update button styles on the login page
8. perf – Performance Improvements:
Indicates changes made to improve performance, such as optimizing algorithms or database queries.
•	perf(api): optimize database query for fetching user data
•	perf(auth): reduce authentication time by caching results
•	perf(ui): improve rendering speed of the user profile page
9. build – Build System/CI:
Indicates changes related to the build system or CI configuration files.
•	build(ci): add code coverage reporting to GitHub Actions
•	build(docker): modify Dockerfile to improve image size
•	build(config): add Webpack optimizations for production builds
10. ci – Continuous Integration:
Indicates changes to the CI pipeline (e.g., GitHub Actions, CircleCI).
•	ci(github-actions): fix build step in CI pipeline
•	ci(cypress): add Cypress for end-to-end testing in CI
•	ci(sonarcloud): integrate SonarCloud for static analysis
11. revert – Revert:
Indicates that a previous commit has been reverted.
•	revert: revert "feat(auth): add user login functionality"
•	revert: revert commit 1234abcd due to breaking change
________________________________________
Commit Message Examples with Body & Footer:
Example 1: Adding a New Feature
feat(auth): add user login functionality

- Implemented login endpoint with JWT token generation.
- Added login form to frontend with email/password validation.
- Redirect to dashboard on successful login.

Closes #42
Example 2: Bug Fix
fix(auth): correct password hashing algorithm

- Fixed issue where passwords were not being properly hashed on registration.
- Updated bcrypt version to ensure compatibility with newer Node.js versions.

Fixes #78
Example 3: Refactoring Code
refactor(api): refactor user registration endpoint

- Simplified user registration logic by removing redundant validation checks.
- Moved password validation to a separate service for better modularity.
- Improved error handling for duplicate email addresses.

No functional changes.
Example 4: Documentation Update
docs(readme): update project setup instructions

- Added instructions for setting up the project on Windows.
- Updated dependencies section with the latest versions.

Related to #22
Example 5: Performance Optimization
perf(api): optimize database query for user list

- Improved query performance by adding indexing on the `email` column.
- Reduced query execution time by 40%.

Closes #51
________________________________________
General Commit Best Practices:
•	Write in the imperative mood (e.g., "Add", "Fix", "Refactor") as if giving commands for code to be applied.
•	Be concise but descriptive in your messages. Focus on what was changed and why.
•	Use a body for more complex changes to explain the reasoning or any side effects.
•	Include references to issue numbers or relevant links (e.g., Closes #123, Fixes #456).
•	Keep messages short: Aim for no more than 72 characters per line for the subject. If needed, use the body to explain further.
________________________________________

