import { useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function BlogPage() {
  const navigate = useNavigate();

  const posts = [
    {
      title: "5 Tips for Choosing the Perfect Braiding Style",
      excerpt: "Discover how to select the ideal braid style for your face shape, lifestyle, and personal aesthetic.",
      author: "Amara Johnson",
      date: "December 10, 2025",
      category: "Hair Care",
    },
    {
      title: "The Art of Traditional Gele Tying",
      excerpt: "Explore the cultural significance and techniques behind this beautiful Nigerian head wrap tradition.",
      author: "Zainab Hassan",
      date: "December 5, 2025",
      category: "Culture",
    },
    {
      title: "Building Your Beauty Business: A Guide for Freelancers",
      excerpt: "Essential tips for beauty professionals looking to grow their client base and build a successful independent business.",
      author: "Keisha Williams",
      date: "November 28, 2025",
      category: "Business",
    },
    {
      title: "Protective Styling: Benefits and Best Practices",
      excerpt: "Learn about protective hairstyles that promote hair health while looking stunning.",
      author: "Nia Campbell",
      date: "November 20, 2025",
      category: "Hair Care",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Braida Blog</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="space-y-8">
          <section className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Stories, Tips & Inspiration</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Expert advice, cultural insights, and the latest trends in beauty and style.
            </p>
          </section>

          <div className="grid gap-6">
            {posts.map((post, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-start justify-between mb-3">
                  <span className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">
                    {post.category}
                  </span>
                </div>
                <h3 className="text-2xl font-bold mb-3">{post.title}</h3>
                <p className="text-muted-foreground mb-4">{post.excerpt}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>{post.author}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{post.date}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="text-center pt-8">
            <p className="text-muted-foreground mb-4">More articles coming soon!</p>
            <Button variant="outline" onClick={() => navigate("/")}>
              Back to Home
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
