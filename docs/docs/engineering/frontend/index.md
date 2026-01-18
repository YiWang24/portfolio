---
id: index
title: Frontend Development
sidebar_label: ⚛️ Frontend
description: React, Next.js, and modern web development
---

# ⚛️ Frontend Development

> **"The best interfaces feel invisible - they just work."**

Building modern, responsive, and performant web applications with React and Next.js.

---

## ⚛️ React Fundamentals

### Component Patterns

```jsx
// Functional Component (preferred)
export function UserCard({ user, onSelect }) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div 
      className="user-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onSelect(user.id)}
    >
      <Avatar src={user.avatar} />
      <h3>{user.name}</h3>
      {isHovered && <UserDetails user={user} />}
    </div>
  );
}
```

### Essential Hooks

| Hook | Purpose | Example Use |
|------|---------|-------------|
| `useState` | Local state | Form inputs, toggles |
| `useEffect` | Side effects | API calls, subscriptions |
| `useContext` | Consume context | Theme, auth state |
| `useReducer` | Complex state | Form with many fields |
| `useMemo` | Memoize values | Expensive computations |
| `useCallback` | Memoize functions | Event handlers to children |
| `useRef` | Mutable reference | DOM access, previous value |

### Custom Hooks

```jsx
// useDebounce - delay value updates
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => clearTimeout(timer);
  }, [value, delay]);
  
  return debouncedValue;
}

// Usage
function SearchInput() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);
  
  useEffect(() => {
    if (debouncedQuery) {
      searchAPI(debouncedQuery);
    }
  }, [debouncedQuery]);
  
  return <input value={query} onChange={e => setQuery(e.target.value)} />;
}
```

---

## 🔲 Next.js

### App Router (Next.js 14+)

```
app/
├── layout.tsx          # Root layout
├── page.tsx            # Home page (/)
├── loading.tsx         # Loading UI
├── error.tsx           # Error UI
├── blog/
│   ├── page.tsx        # /blog
│   └── [slug]/
│       └── page.tsx    # /blog/:slug
└── api/
    └── users/
        └── route.ts    # API route
```

### Server Components vs Client Components

```jsx
// Server Component (default) - runs on server
// No "use client" directive
export default async function UserPage({ params }) {
  // Can use async/await directly
  const user = await fetchUser(params.id);
  
  return <UserProfile user={user} />;
}

// Client Component - runs in browser
"use client";

import { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}
```

### Data Fetching Patterns

```jsx
// Server Component - Direct fetch
async function BlogPosts() {
  const posts = await fetch('https://api.example.com/posts', {
    cache: 'no-store',  // or 'force-cache', revalidate: 3600
  }).then(res => res.json());
  
  return (
    <ul>
      {posts.map(post => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  );
}

// Client Component - SWR or React Query
"use client";
import useSWR from 'swr';

function UserProfile({ userId }) {
  const { data, error, isLoading } = useSWR(
    `/api/users/${userId}`,
    fetcher
  );
  
  if (error) return <div>Failed to load</div>;
  if (isLoading) return <div>Loading...</div>;
  
  return <div>{data.name}</div>;
}
```

### API Routes

```typescript
// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const users = await prisma.user.findMany();
  return NextResponse.json(users);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const user = await prisma.user.create({ data: body });
  return NextResponse.json(user, { status: 201 });
}
```

---

## 🎨 Tailwind CSS

### Utility-First Approach

```jsx
// Traditional CSS
<div className="card">...</div>
// .card { padding: 1rem; border-radius: 0.5rem; ... }

// Tailwind CSS
<div className="p-4 rounded-lg bg-white shadow-md hover:shadow-lg transition-shadow">
  ...
</div>
```

### Common Patterns

```jsx
// Responsive design
<div className="w-full md:w-1/2 lg:w-1/3">
  {/* Full width on mobile, half on tablet, third on desktop */}
</div>

// Dark mode
<div className="bg-white dark:bg-gray-800 text-black dark:text-white">
  {/* Adapts to system preference or theme toggle */}
</div>

// Hover and focus states
<button className="bg-blue-500 hover:bg-blue-600 focus:ring-2 focus:ring-blue-300">
  Click me
</button>

// Flexbox centering
<div className="flex items-center justify-center h-screen">
  <Content />
</div>
```

### Component Composition with clsx

```jsx
import { clsx } from 'clsx';

function Button({ variant = 'primary', size = 'md', className, children }) {
  return (
    <button
      className={clsx(
        'rounded font-medium transition-colors',
        {
          'bg-blue-500 text-white hover:bg-blue-600': variant === 'primary',
          'bg-gray-200 text-gray-800 hover:bg-gray-300': variant === 'secondary',
          'px-2 py-1 text-sm': size === 'sm',
          'px-4 py-2': size === 'md',
          'px-6 py-3 text-lg': size === 'lg',
        },
        className
      )}
    >
      {children}
    </button>
  );
}
```

---

## 🔄 State Management

| Solution | Complexity | Best For |
|----------|-----------|----------|
| `useState` | Low | Component-local state |
| `useContext` | Low | Simple global (theme, auth) |
| `useReducer` | Medium | Complex component state |
| **Zustand** | Low | Simple global state |
| **Jotai** | Low | Atomic state model |
| **Redux Toolkit** | High | Large enterprise apps |

### Zustand Example

```jsx
import { create } from 'zustand';

const useStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
}));

function Counter() {
  const { count, increment, decrement } = useStore();
  
  return (
    <div>
      <span>{count}</span>
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
    </div>
  );
}
```

---

## 📝 Detailed Topics

- [React Performance Optimization](/documentation/docs/engineering/frontend/performance)
- [Form Handling](/documentation/docs/engineering/frontend/forms)
- [Authentication Patterns](/documentation/docs/engineering/frontend/auth)
- [Animation with Framer Motion](/documentation/docs/engineering/frontend/animation)
- [Testing (Jest, Testing Library)](/documentation/docs/engineering/frontend/testing)

---

:::tip Frontend Best Practices
1. **Component composition** - Prefer small, reusable components
2. **Lift state up** - Share state at the right level
3. **Memoize wisely** - Don't over-optimize
4. **Accessibility** - Use semantic HTML and ARIA
5. **Progressive enhancement** - Work without JS first
:::
