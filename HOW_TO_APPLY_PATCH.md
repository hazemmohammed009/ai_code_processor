# How to Apply the Patch File

Since the automatic pull request system is not working, I have created a `changes.patch` file. This file contains all the code modifications, new files, and deletions needed to update your project.

You can apply these changes using `git`. Follow these steps in your terminal from the root of your project directory.

### Step 1: Ensure you have a clean working directory

Before applying the patch, make sure you don't have any uncommitted changes. You can check this by running:

```bash
git status
```

If you have any changes, please commit them or stash them first.

### Step 2: Apply the patch

Use the `git apply` command to apply all the changes contained in the patch file.

```bash
git apply changes.patch
```

This command will:
-   Delete the old `ai_code_processor.html` file.
-   Create all the new project files (`package.json`, `vite.config.ts`, etc.).
-   Create the new directory structure (`src/`).
-   Update the content of `ai_code_processor_enhanced.tsx`.

### Step 3: Verify the changes

After the command completes, you can run `git status` again. You will see a list of all the new and modified files.

You are now ready to proceed with the instructions in `PROJECT_GUIDE.md` to install the dependencies and run the new application.

If you encounter any issues with the patch, please let me know.
