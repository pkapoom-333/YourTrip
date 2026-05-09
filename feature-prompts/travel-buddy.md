# Feature Prompt: Travel Buddy

> Copy นี้ต่อท้าย Morning Prompt เมื่อจะ build Travel Buddy matching

```
## Feature: Travel Buddy

### BuddyRequest model (Prisma)
id, userId, destination, startDate DateTime, endDate DateTime
description String, budget Decimal?
status (OPEN|MATCHED|CLOSED), createdAt

### BuddyMatch model
id, requestId, requesterId, status (PENDING|ACCEPTED|DECLINED)
createdAt

### Pages
- /buddy — browse open buddy requests
  - Filter: destination, date range, budget
  - Card: avatar, destination, dates, short description
- /buddy/new — post a buddy request form
- /buddy/[id] — view request detail + "Send Request" button
- /buddy/matches — your matches (sent + received)

### Matching flow
1. User sees request → clicks "Send Request"
2. Creates BuddyMatch (PENDING)
3. Request owner gets notification → Accept / Decline
4. ACCEPTED → both users see each other's profile + can message

### Notification (basic)
- In-app notification bell (no push yet)
- Badge count on Bell icon in AppShell

Start with: Browse page /buddy + request card + mock data
```
