# Feature Prompt: Posts & Feed

> Copy นี้ต่อท้าย Morning Prompt เมื่อจะ build Posts/Feed

```
## Feature: Posts & Feed

### Post model (Prisma)
id, content (max 500 chars), images String[], location String?
userId, createdAt
relations: likes Like[], comments Comment[], saves Save[]

### Create Post
- Modal (not new page) — triggered from FAB / PlusSquare button
- Textarea: max 500 chars with live counter
- Image upload: up to 4 images (Cloudinary)
- Location tag: text input (autocomplete Phase 2)
- Submit → optimistic update → POST /api/posts (or Server Action)

### Feed (/feed)
- Posts from followed users, newest first
- Infinite scroll (Intersection Observer, page size 10)
- Each post card: avatar, name, location, content, images carousel, like/comment/save counts
- Like: toggle with optimistic update (no page reload)
- Save: toggle bookmark

### Explore (/explore)
- Public posts from everyone (not just followed)
- Same card component, different data source

### API / Server Actions
- POST /api/posts — create post (auth required)
- PATCH /api/posts/[id]/like — toggle like
- GET /api/feed — paginated feed (cursor-based)

### Use mock data for feed until real posts exist

Start with: Post card component + mock feed → then create post modal → then real API
```
