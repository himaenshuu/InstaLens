# Use the below instruction-

## Using GPT-4.1 in Copilot Mode

When invoking GPT-4.1 as an agent:

Prompt style: Give it the error message + relevant file snippet. Example:

“Here is the error from console: TypeError: posts.map is not a function. Here is the component code from PostsList.jsx. Please debug.”

Ask for step-by-step plan: Request a fix explanation before applying code changes.
Apply patch incrementally: Copy suggested code changes into your repo, rerun app, confirm fix.