# Feature Prompt: My Trip

> Copy นี้ต่อท้าย Morning Prompt เมื่อจะ build Trip Planning

```
## Feature: My Trip

### Trip model (Prisma)
id, title, destination, startDate DateTime, endDate DateTime
budget Decimal?, description String?, coverImage String?
visibility (PUBLIC|PRIVATE), status (PLANNING|ONGOING|COMPLETED)
userId, createdAt
relations: itinerary ItineraryItem[]

### ItineraryItem model
id, tripId, day Int, title, time String?, location String?
notes String?, order Int

### Pages
- /trips — list all user trips (grid: 2 col mobile / 3 col desktop)
- /trips/new — create trip form (title, destination, dates, budget)
- /trips/[id] — trip detail + itinerary view
- /trips/[id]/edit — edit trip + add/remove itinerary items

### Itinerary UX
- Day-by-day structure (Day 1, Day 2...)
- Each day: add activity (title, time, location, notes)
- Drag to reorder → use @dnd-kit/core
- "Add place from Explore" — link to /explore then back

### Server Actions
- createTrip(data) — create new trip
- updateTrip(id, data) — update trip
- addItineraryItem(tripId, day, data)
- reorderItems(tripId, day, items[])

Start with: Trip list page + create trip form + mock data
```
