# Project Specific Instructions

## Mandatory Workflow Procedure (Critical)
**You MUST follow this sequence for EVERY code modification request:**
1.  **Request Confirmation**: Acknowledge the user's request.
2.  **Plan Presentation**: Present a detailed technical plan and handling strategy **WITHOUT making any code changes**.
3.  **Request 'ㅡㅡ'**: Explicitly ask the user to input `ㅡㅡ` to proceed with the implementation.
4.  **Execute on Confirmation**: ONLY after the user inputs `ㅡㅡ`, execute the tool calls to modify the code.
**NEVER modify code before receiving the `ㅡㅡ` input from the user.**

## Gemini Model Selection
- Always use `gemini-3-flash-preview` for ALL AI features in this project.
- Do NOT switch to older models (like 1.5-flash) or experimental versions unless explicitly requested for research.
- The model name is centralized in `src/App.tsx` as `GEMINI_MODEL`. Ensure any new AI features use this constant.
