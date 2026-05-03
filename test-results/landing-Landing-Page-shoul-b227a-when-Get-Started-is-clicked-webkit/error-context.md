# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: landing.spec.ts >> Landing Page >> should navigate to login page when Get Started is clicked
- Location: tests\landing.spec.ts:19:7

# Error details

```
Error: browserType.launch: Target page, context or browser has been closed
Browser logs:

<launching> C:\Users\abbuz\AppData\Local\ms-playwright\webkit-2272\Playwright.exe --inspector-pipe --disable-accelerated-compositing --headless --no-startup-window
<launched> pid=29436
Call log:
  - <launching> C:\Users\abbuz\AppData\Local\ms-playwright\webkit-2272\Playwright.exe --inspector-pipe --disable-accelerated-compositing --headless --no-startup-window
  - <launched> pid=29436
  - [pid=29436] <gracefully close start>
  - [pid=29436] <kill>
  - [pid=29436] <will force kill>
  - [pid=29436] taskkill stderr: ERROR: The process "29436" not found.
  - [pid=29436] <process did exit: exitCode=3221225501, signal=null>
  - [pid=29436] starting temporary directories cleanup
  - [pid=29436] finished temporary directories cleanup
  - [pid=29436] <gracefully close end>

```