# 


## Tech Stack

1. Frontend
   1. React
2. Backend
   1. Golang
3. Datab

# Project Rules

1. JUST DO AS YOU WERE TOLD TO DO, NO MORE, NO LESS
2. KEEP YOUR CODE SIMPLE, ONLY ADD MORE FEATURE AND COMPLEXITY IF YOU ARE TOLD TO DO SO
3. ONLY USING PROTOBUF FOR COMMUNICATION BETWEEN SERVICES, OBJECTS ARE DTOs, NOT MODELS IN BACKEND
   1. For DTOs, only expose the fields that are needed for the client
4. Log your changes in a log file in `docs/logs/`, name it as `YYYY-MM-DD.log`

## Do

- Follow user instructions exactly, no extra scope
- Keep solutions simple and minimal
- Use protobuf for service-to-service communication
- Use DTOs in backend and expose only needed client fields
- Log every change in `docs/logs/YYYY-MM-DD.log`
  - Append the log file, do not overwrite it
  - Use the prompt as the title of the log file and then list out all the changes made in the log file as number list

## Don't

- Add features or complexity that were not requested
- Use backend models as API response objects
- Expose unnecessary fields in DTOs
- Skip changelog updates in `docs/logs/`

## Permissions

### Allowed without prompting
- Read files, list directories
- Single file linting, type checking, formatting
- Unit tests on specific files
- Web scape for information

### Require approval first
- Package installations (`uv add`, `npm install`)
- Git operations (`git push`, `git commit`)
- File deletion