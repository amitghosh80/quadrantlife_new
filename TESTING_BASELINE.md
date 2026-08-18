# Manual Testing Baseline - Before Encryption

## Core Functionality to Test After Encryption

### Authentication
- [ ] User can sign up with email/password
- [ ] User can log in with email/password
- [ ] User can log out
- [ ] Session persists on page refresh

### Tasks (Eisenhower Matrix)
- [ ] User can create a new task with title, description, urgency, importance
- [ ] User can view all their tasks in the matrix
- [ ] User can edit an existing task
- [ ] User can mark task as complete/incomplete
- [ ] User can delete a task
- [ ] Tasks filter by role and goal
- [ ] Task due dates work correctly
- [ ] Completed tasks show completion date

### Roles
- [ ] User can create a new role with name and color
- [ ] User can view all their roles
- [ ] User can edit role name and color
- [ ] User can activate/deactivate roles
- [ ] User can delete a role

### Goals
- [ ] User can create a goal with title, description, role, target date
- [ ] User can view all their goals
- [ ] User can edit goal details
- [ ] User can update goal progress (0-100%)
- [ ] User can delete a goal
- [ ] Goals linked to roles display correctly

### Balance Indicator
- [ ] Balance indicator shows role distribution
- [ ] Percentages calculate correctly
- [ ] Visual representation is accurate

### Weekly Planning
- [ ] Planning modal appears as needed
- [ ] User can complete planning
- [ ] Planning status tracked correctly

## Expected Behavior After Encryption

All of the above functionality should work EXACTLY the same from the user's perspective.

The ONLY difference should be that when viewing the database directly, sensitive fields (task titles, descriptions, goal titles, etc.) should appear as encrypted strings rather than plain text.
