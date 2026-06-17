import { useEffect } from "react"
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_OG_IMAGE,
  SITE_NAME,
  SITE_URL,
  absoluteUrl,
} from "@/lib/seo"

interface SeoProps {
  /** Tiêu đề trang (sẽ tự thêm hậu tố tên thương hiệu trừ khi isHome). */
  title?: string
  description?: string
  /** Đường dẫn tương đối, vd "/products/abc". Mặc định lấy theo URL hiện tại. */
  canonicalPath?: string
  image?: string
  /** og:type: website | product | article */
  type?: string
  /** Dữ liệu có cấu trúc JSON-LD (1 object hoặc mảng). */
  jsonLd?: object | object[]
  /** true nếu là trang chủ (không thêm hậu tố thương hiệu). */
  isHome?: boolean
}

function upsertMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement("meta")
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute("content", content)
}

function upsertLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`)
  if (!el) {
    el = document.createElement("link")
    el.setAttribute("rel", rel)
    document.head.appendChild(el)
  }
  el.setAttribute("href", href)
}

const JSON_LD_ID = "seo-jsonld"

export function Seo({
  title,
  description = DEFAULT_DESCRIPTION,
  canonicalPath,
  image,
  type = "website",
  jsonLd,
  isHome = false,
}: SeoProps) {
  useEffect(() => {
    const fullTitle = !title || isHome ? title ?? SITE_NAME : `${title} | ${SITE_NAME}`
    document.title = fullTitle

    const canonical = canonicalPath
      ? absoluteUrl(canonicalPath)
      : SITE_URL + window.location.pathname

    const ogImage = absoluteUrl(image || DEFAULT_OG_IMAGE)

    upsertMeta("name", "description", description)
    upsertLink("canonical", canonical)

    upsertMeta("property", "og:site_name", SITE_NAME)
    upsertMeta("property", "og:title", fullTitle)
    upsertMeta("property", "og:description", description)
    upsertMeta("property", "og:type", type)
    upsertMeta("property", "og:url", canonical)
    upsertMeta("property", "og:image", ogImage)
    upsertMeta("property", "og:locale", "vi_VN")

    upsertMeta("name", "twitter:card", "summary_large_image")
    upsertMeta("name", "twitter:title", fullTitle)
    upsertMeta("name", "twitter:description", description)
    upsertMeta("name", "twitter:image", ogImage)

    const prev = document.getElementById(JSON_LD_ID)
    if (prev) prev.remove()
    if (jsonLd) {
      const script = document.createElement("script")
      script.type = "application/ld+json"
      script.id = JSON_LD_ID
      script.textContent = JSON.stringify(jsonLd)
      document.head.appendChild(script)
    }

    return () => {
      const node = document.getElementById(JSON_LD_ID)
      if (node) node.remove()
    }
  }, [title, description, canonicalPath, image, type, jsonLd, isHome])

  return null
}
