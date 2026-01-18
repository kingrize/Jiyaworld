export const profile = {
  name: "Alex",
  username: "alex",
  bio: "Just a person who loves to code and design.",
  location: "San Francisco, CA",
  website: "alex.dev",
  avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=60",
}

export type Post = {
  id: string
  content: string
  time: string
  mood?: "happy" | "sad" | "excited" | "chill" | "neutral"
  likes: number
  comments: number
}

export const posts: Post[] = [
  {
    id: "p1",
    content: "System update completed. 42 packages upgraded.",
    time: "00:01",
    mood: "neutral",
    likes: 0,
    comments: 0,
  },
  {
    id: "p2",
    content: "Deploying new config to production...",
    time: "02:14",
    mood: "chill",
    likes: 1,
    comments: 0,
  },
  {
    id: "p3",
    content: "Runtime error: sleep module not found.",
    time: "04:20",
    mood: "sad",
    likes: 404,
    comments: 0,
  },
]

export const likes = [
  "vim",
  "arch linux",
  "coffee",
  "bash",
  "dark mode",
  "mechanical keyboards",
]

export const photos = Array.from({ length: 6 }).map((_, i) => ({
  id: `img_${i + 1}`,
  url: `https://picsum.photos/seed/linux-${i + 1}/400/400`,
}))
