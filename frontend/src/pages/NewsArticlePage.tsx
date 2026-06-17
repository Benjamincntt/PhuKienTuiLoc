import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { ArrowLeft, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { api } from "@/services/api"
import type { NewsArticle } from "@/types"

export function NewsArticlePage() {
  const { id } = useParams<{ id: string }>()
  const [article, setArticle] = useState<NewsArticle | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setError(false)
    api
      .getNewsById(Number(id))
      .then(setArticle)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <div className="space-y-4 animate-pulse">
          <div className="h-8 w-3/4 rounded bg-muted" />
          <div className="aspect-video w-full rounded-xl bg-muted" />
          <div className="space-y-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-4 rounded bg-muted" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error || !article) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <p className="text-muted-foreground">Không tìm thấy bài viết.</p>
        <Button asChild variant="outline" className="mt-4 rounded-full">
          <Link to="/">Quay lại trang chủ</Link>
        </Button>
      </div>
    )
  }

  const body = article.content || article.excerpt

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
      <Button asChild variant="ghost" size="sm" className="mb-6 -ml-2 gap-1.5 rounded-full">
        <Link to="/">
          <ArrowLeft className="h-4 w-4" />
          Quay lại trang chủ
        </Link>
      </Button>

      <article className="space-y-6">
        <header className="space-y-3">
          <h1 className="text-2xl font-bold leading-tight sm:text-3xl">{article.title}</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            {new Date(article.publishedAt).toLocaleDateString("vi-VN", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </div>
        </header>

        {article.imageUrl && (
          <img
            src={article.imageUrl}
            alt={article.title}
            className="aspect-video w-full rounded-xl object-cover"
          />
        )}

        {body.includes("<") ? (
          <div
            className="space-y-4 text-base leading-relaxed text-muted-foreground [&_h1]:text-xl [&_h1]:font-bold [&_h1]:text-foreground [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-foreground [&_h3]:font-semibold [&_h3]:text-foreground [&_a]:text-primary [&_a]:underline [&_strong]:font-semibold [&_strong]:text-foreground [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5"
            dangerouslySetInnerHTML={{ __html: body }}
          />
        ) : (
          <p className="whitespace-pre-wrap text-base leading-relaxed text-muted-foreground">{body}</p>
        )}
      </article>
    </div>
  )
}
