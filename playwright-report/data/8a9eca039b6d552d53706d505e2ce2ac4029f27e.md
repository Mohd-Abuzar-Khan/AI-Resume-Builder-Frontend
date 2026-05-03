# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: landing.spec.ts >> Landing Page >> should have a hero section with Get Started button
- Location: tests\landing.spec.ts:14:7

# Error details

```
Error: browserType.launch: Target page, context or browser has been closed
Browser logs:

<launching> C:\Users\abbuz\AppData\Local\ms-playwright\webkit-2272\Playwright.exe --inspector-pipe --disable-accelerated-compositing --headless --no-startup-window
<launched> pid=26184
Call log:
  - <launching> C:\Users\abbuz\AppData\Local\ms-playwright\webkit-2272\Playwright.exe --inspector-pipe --disable-accelerated-compositing --headless --no-startup-window
  - <launched> pid=26184
  - [pid=26184] <gracefully close start>
  - [pid=26184] <kill>
  - [pid=26184] <will force kill>
  - [pid=26184] taskkill stderr: ERROR: The process "26184" not found.
  - [pid=26184] <process did exit: exitCode=3221225501, signal=null>
  - [pid=26184] starting temporary directories cleanup
  - [pid=26184] finished temporary directories cleanup
  - [pid=26184] <gracefully close end>

```