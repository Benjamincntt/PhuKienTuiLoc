import { Link } from "react-router-dom"
import { Card, CardContent } from "@/components/ui/card"
import type { NewsArticle } from "@/types"

interface NewsSectionProps {
  articles: NewsArticle[]
}

export function NewsSection({ articles }: NewsSectionProps) {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-bold">Tin tức túi lọc trà</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {articles.map((article) => (
          <Link key={article.id} to={`/news/${article.id}`} className="group block">
            <Card className="overflow-hidden transition-shadow hover:shadow-md">
              <div className="grid sm:grid-cols-[140px_1fr]">
                <img
                  src={article.imageUrl}
                  alt={article.title}
                  className="h-full min-h-[120px] w-full object-cover"
                />
                <CardContent className="space-y-2 p-4">
                  <h3 className="line-clamp-2 font-semibold group-hover:text-primary transition-colors">
                    {article.title}
                  </h3>
                  <p className="line-clamp-3 text-sm text-muted-foreground">{article.excerpt}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(article.publishedAt).toLocaleDateString("vi-VN")}
                  </p>
                </CardContent>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  )
}
