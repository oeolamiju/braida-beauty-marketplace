import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import backend from "~backend/client";
import type { ContentPage } from "~backend/content/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react";

export default function ContentManagement() {
  const navigate = useNavigate();
  const [pages, setPages] = useState<ContentPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  const loadPages = async () => {
    try {
      setLoading(true);
      const response = await backend.content.listPages({ publishedOnly: false });
      setPages(response.pages);
    } catch (error) {
      console.error("Failed to load pages:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPages();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this page?")) return;

    try {
      await backend.content.deletePage({ id });
      await loadPages();
    } catch (error) {
      console.error("Failed to delete page:", error);
    }
  };

  const handleTogglePublish = async (page: ContentPage) => {
    try {
      await backend.content.updatePage({ 
        id: page.id, 
        isPublished: !page.isPublished 
      });
      await loadPages();
    } catch (error) {
      console.error("Failed to update page:", error);
    }
  };

  const filteredPages = filter === "all" 
    ? pages 
    : pages.filter(p => p.category === filter);

  const categories = Array.from(new Set(pages.map(p => p.category)));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Content Management</h1>
          <p className="text-muted-foreground">
            Manage pages, policies, and static content
          </p>
        </div>
        <Button onClick={() => navigate("/admin/content/new")}>
          <Plus className="h-4 w-4 mr-2" />
          New Page
        </Button>
      </div>

      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList>
          <TabsTrigger value="all">All Pages</TabsTrigger>
          {categories.map(cat => (
            <TabsTrigger key={cat} value={cat} className="capitalize">
              {cat}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={filter} className="space-y-4 mt-6">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading pages...</p>
            </div>
          ) : filteredPages.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No pages found</p>
                <Button 
                  className="mt-4"
                  onClick={() => navigate("/admin/content/new")}
                >
                  Create First Page
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredPages.map(page => (
                <Card key={page.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <CardTitle>{page.title}</CardTitle>
                          <Badge variant={page.isPublished ? "default" : "secondary"}>
                            {page.isPublished ? "Published" : "Draft"}
                          </Badge>
                          <Badge variant="outline" className="capitalize">
                            {page.category}
                          </Badge>
                        </div>
                        <CardDescription className="mt-1">
                          Slug: /{page.slug}
                        </CardDescription>
                        {page.metaDescription && (
                          <p className="text-sm text-muted-foreground mt-2">
                            {page.metaDescription}
                          </p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span>Version {page.version}</span>
                          <span>Updated {new Date(page.updatedAt).toLocaleDateString()}</span>
                          {page.publishedAt && (
                            <span>Published {new Date(page.publishedAt).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleTogglePublish(page)}
                        >
                          {page.isPublished ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/admin/content/${page.id}/edit`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(page.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
