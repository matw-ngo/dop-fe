import type { Meta, StoryObj } from "@storybook/react";
import Blog from "./blog";
import { BlogConfig } from "@/configs/homepage-config";

const meta: Meta<typeof Blog> = {
  title: "Organisms/Homepage/Blog",
  component: Blog,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
  argTypes: {
    config: {
      control: "object",
      description: "The configuration object for the blog section.",
    },
    company: {
      control: "text",
      description: "The company identifier (not used in this component).",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Blog>;

export const Default: Story = {
  name: "Default Config",
  args: {},
  parameters: {
    docs: {
      storyDescription:
        "Displays the component with the default hardcoded configuration.",
    },
  },
};

const customBlogConfig: BlogConfig = {
  id: "custom-blog",
  title: "From Our Tech Desk",
  subtitle: "The latest news, updates, and stories from our team.",
  posts: [
    {
      id: "post-1",
      title: "The Future of AI in Software Development",
      description:
        "Explore how artificial intelligence is revolutionizing the way we build, test, and deploy software.",
      image: "/placeholder.svg",
      imageAlt: "AI and code",
      href: "#",
    },
    {
      id: "post-2",
      title: "A Deep Dive into Quantum Computing",
      description:
        "Quantum computing promises to solve problems that are currently intractable. What is it and how does it work?",
      image: "/placeholder.svg",
      imageAlt: "Quantum computer",
      href: "#",
    },
  ],
  viewAllText: "Read More Articles →",
  viewAllHref: "#",
  background: {
    className: "bg-background",
  },
};

export const CustomConfig: Story = {
  name: "Custom Config (2 Posts)",
  args: {
    config: customBlogConfig,
  },
  parameters: {
    docs: {
      storyDescription:
        "Displays the component with a custom configuration passed via props, showing only two posts.",
    },
  },
};

const singlePostConfig: BlogConfig = {
  ...customBlogConfig,
  title: "Featured Article",
  subtitle: "Check out our latest featured post.",
  posts: customBlogConfig.posts.slice(0, 1),
};

export const SinglePost: Story = {
  name: "Single Post",
  args: {
    config: singlePostConfig,
  },
  parameters: {
    docs: {
      storyDescription:
        "A variation of the component displaying only a single blog post.",
    },
  },
};
