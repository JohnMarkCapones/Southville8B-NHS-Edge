@echo off
echo Starting accessibility tests...
echo.
echo Make sure the dev server is running first!
echo If not, open another terminal and run: npm run dev
echo.
pause
echo Running tests...
npx playwright test e2e/accessibility.spec.ts --reporter=line --workers=1 --timeout=60000
echo.
echo Tests completed!
pause
