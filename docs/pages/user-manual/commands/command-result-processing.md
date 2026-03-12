---
title: "Command result processing"
parent: Commands
grand_parent: User manual
---

Reconmap can parse the output of many security tools, and incorporate their results in one of your projects. The instructions below show how to do so step by step.

### Step 1 - Setting up the command

The first step is making sure there is a command registered for the one we want to automate. If one is not already created, add it to the system making sure the output parser dropdown points to the parser for that command. The executor options determine how the command runs, while the output parser determines what the do with the output.

![Create command](/images/screenshots/command-parser-executor.png)

### Step 2 - Creating a task and linking it to the command

Once the command is created, you need to create a task under an existing project and link it to the desired command as follows.

![Create task screenshot](/images/screenshots/link-task-command.png)

### Step 3 - Running the command and uploading the results

Lastly, copy the command to the native terminal or the integrated web terminal if it's available on your Reconmap instance. Reconmap will run the command, capture the output and upload the results to the server for processing.

![Run command](/images/screenshots/command-run-instructions.png)

![Run command](/images/screenshots/run-command-native-terminal.png)

### Step 4 - Waiting for results

The file is now on the system and will be processed in the background within the next minute after upload. Vulnerabilities and target hosts found on the scan file are going to be created automatically on Reconmap.

![Create task screenshot](/images/tutorials/howto-process-burp-step4.png)
