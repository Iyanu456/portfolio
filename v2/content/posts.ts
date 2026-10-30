export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
  featured?: boolean;
  body: { type: "p" | "h2" | "quote"; text: string }[];
};

export const posts: Post[] = [
  {
    slug: "making-room-for-curiosity",
    title: "Making room for curiosity",
    excerpt:
      "A note on following questions across disciplines, and why not every interest needs to become a label.",
    category: "Ideas & observations",
    date: "October 28, 2026",
    readTime: "3 min read",
    featured: true,
    body: [
      { type: "p", text: "Curiosity rarely respects the boundaries we create for it. One question leads to another, and before long, an interest in how a building feels can become an interest in how people move through it, how they use technology, or how an idea is communicated visually." },
      { type: "p", text: "It can be tempting to turn every interest into a neat category. We want a title that explains what we do, a niche that makes us easy to understand, and a plan that makes the next step obvious. There is value in clarity, but there is also value in leaving a little room for discovery." },
      { type: "h2", text: "A thread through the different things" },
      { type: "p", text: "The answer may not be choosing one thing and abandoning the rest. Sometimes the connection is the way we approach problems: noticing patterns, asking better questions, making sense of complexity, and turning what we learn into something useful." },
      { type: "quote", text: "You do not have to know exactly where an interest will lead before you give it room to grow." },
      { type: "p", text: "This website is a small experiment in that spirit. A place to write down ideas, share what I am exploring, and let the connections reveal themselves over time. Not everything needs to be a finished thesis. Sometimes a useful starting point is simply paying attention." }
    ]
  },
  {
    slug: "the-value-of-noticing",
    title: "The value of noticing",
    excerpt:
      "Before we can make something meaningful, we have to pay attention to what is already there.",
    category: "Creativity",
    date: "Coming soon",
    readTime: "Draft",
    body: []
  },
  {
    slug: "technology-and-the-human-scale",
    title: "Technology and the human scale",
    excerpt:
      "A few questions about building useful technology without losing sight of the people who use it.",
    category: "Technology",
    date: "Coming soon",
    readTime: "Draft",
    body: []
  }
];

export function getPublishedPosts() {
  return posts.filter((post) => post.body.length > 0);
}

export function getPost(slug: string) {
  return posts.find((post) => post.slug === slug && post.body.length > 0);
}
