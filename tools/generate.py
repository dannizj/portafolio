#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
generate.py - Generador de datos del portafolio (Python, solo stdlib)
--------------------------------------------------------------------
Lee los .txt editables en /data y genera:
  - data/site-data.js   (window.SITE_DATA; carga en file:// y GitHub Pages)
  - llms.txt            (resumen plano para IAs / filtro reclutador)
  - sitemap.xml
  - robots.txt

Uso:  python tools/generate.py
Edita tus .txt -> corre esto -> abre index.html (local) o sube a GitHub.
"""

import os
import re
import json
from datetime import datetime, timezone

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "data")
PROJECTS_DIR = os.path.join(DATA, "projects")

# >>> EDITA ESTO al publicar en GitHub (ej: https://tuusuario.github.io/portafolio)
SITE_URL = "https://dannizj.github.io/portafolio"

# Claves que se interpretan como listas (coma-separadas)
LIST_KEYS = {"tools", "features", "skills", "tags"}


def parse_txt(content):
    obj = {}
    for raw in content.splitlines():
        line = raw.strip()
        if not line or line.startswith("#"):
            continue
        if ":" not in line:
            continue
        key, value = line.split(":", 1)
        key = key.strip()
        value = value.strip()
        base_key = re.sub(r"_(es|en)$", "", key, flags=re.I)
        is_list = base_key in LIST_KEYS
        m = re.search(r"_(es|en)$", key, flags=re.I)
        if is_list:
            arr = [s.strip() for s in value.split(",") if s.strip()]
            if m:
                lang = m.group(1).lower()
                obj.setdefault(base_key, {})[lang] = arr
            else:
                obj[base_key] = arr
        else:
            if m:
                lang = m.group(1).lower()
                obj.setdefault(base_key, {})[lang] = value
            else:
                obj[key] = value
    return obj


def lang(obj, lg, fallback=""):
    if isinstance(obj, dict) and ("es" in obj or "en" in obj):
        return obj.get(lg) or obj.get("es") or obj.get("en") or fallback
    return obj if obj else fallback


def read_txt(rel_path):
    p = os.path.join(ROOT, rel_path)
    if not os.path.exists(p):
        return None
    with open(p, "r", encoding="utf-8") as f:
        return f.read()


# ---- Profile ----
profile_raw = parse_txt(read_txt("data/profile.txt") or "")
profile = {
    "name": profile_raw.get("name", "Tu Nombre"),
    "role": profile_raw.get("role", {"es": "Desarrollador", "en": "Developer"}),
    "tagline": profile_raw.get("tagline", {"es": "", "en": ""}),
    "email": profile_raw.get("email", ""),
    "linkedin": profile_raw.get("linkedin", ""),
    "cv": profile_raw.get("cv", ""),
    "bio": profile_raw.get("bio", {"es": "", "en": ""}),
    "experience": profile_raw.get("experience", ""),
    "available": profile_raw.get("available", {"es": "", "en": ""}),
    "location": profile_raw.get("location", ""),
    "avatar": profile_raw.get("avatar", ""),
    "skills": profile_raw.get("skills", []),
}

# ---- Projects ----
manifest_raw = read_txt("data/projects/manifest.txt") or ""
slugs = [s.strip() for s in manifest_raw.splitlines() if s.strip()]

projects = []
for slug in slugs:
    d = os.path.join(PROJECTS_DIR, slug)
    if not os.path.isdir(d):
        print(f"[warn] carpeta de proyecto no encontrada: {slug}")
        continue
    raw = parse_txt(read_txt(f"data/projects/{slug}/info.txt") or "")
    thumbnail = f"data/projects/{slug}/{raw['thumbnail']}" if raw.get("thumbnail") else None
    video = raw.get("video", "").strip()
    # Normalizar: extraer solo el ID si es una URL completa
    m = re.match(r"^youtube:(?:https?://(?:www\.)?youtu(?:be\.com/watch\?v=|\.be/))?([a-zA-Z0-9_-]+)", video)
    if m:
        video = f"youtube:{m.group(1)}"
    else:
        video = video or None
    download = raw.get("download", "").strip() or None
    repo = raw.get("repo", "").strip() or None
    # Si no hay thumbnail local pero hay video YouTube, usar miniatura de YouTube
    if thumbnail and not os.path.exists(os.path.join(ROOT, thumbnail)):
        m = re.match(r"^youtube:(.+)$", video or "")
        if m:
            thumbnail = f"https://img.youtube.com/vi/{m.group(1).strip()}/mqdefault.jpg"
    projects.append({
        "slug": slug,
        "title": raw.get("title", {"es": slug, "en": slug}),
        "engine": raw.get("engine", ""),
        "language": raw.get("language", ""),
        "status": raw.get("status", {"es": "", "en": ""}),
        "year": raw.get("year", ""),
        "thumbnail": thumbnail,
        "video": video,
        "download": download,
        "repo": repo,
        "short": raw.get("short", {"es": "", "en": ""}),
        "tools": raw.get("tools", []),
        "tags": raw.get("tags", []),
        "features": raw.get("features", {"es": [], "en": []}),
        "mediaPaths": {
            "images": f"data/projects/{slug}/images/",
            "videos": f"data/projects/{slug}/videos/",
        },
    })

SITE_DATA = {
    "profile": profile,
    "projects": projects,
    "generatedAt": datetime.now(timezone.utc).isoformat(),
}

# ---- site-data.js ----
site_data_js = (
    "/* Generado automaticamente por tools/generate.py - NO editar a mano */\n"
    "window.SITE_DATA = " + json.dumps(SITE_DATA, ensure_ascii=False, indent=2) + ";\n"
)
with open(os.path.join(DATA, "site-data.js"), "w", encoding="utf-8-sig") as f:
    f.write(site_data_js)

# ---- llms.txt ----
role_es = lang(profile['role'], 'es')
role_en = lang(profile['role'], 'en')
avail_es = lang(profile['available'], 'es')
avail_en = lang(profile['available'], 'en')

lines = []
lines.append(f"# {profile['name']} — {role_es} / {role_en}")
lines.append(f"\n> {lang(profile['tagline'], 'es')}")
lines.append(f"> {lang(profile['tagline'], 'en')}")
lines.append(f"\n## Links")
lines.append(f"- Portfolio: {SITE_URL}")
if profile["linkedin"]:
    lines.append(f"- LinkedIn: {profile['linkedin']}")
if profile["cv"]:
    lines.append(f"- CV: {profile['cv']}")
if profile["email"]:
    lines.append(f"- Email: {profile['email']}")
lines.append(f"\n## About")
lines.append(f"- Experience: {profile['experience'] or '?'} years")
if profile["location"]:
    lines.append(f"- Location: {profile['location']}")
if avail_en:
    lines.append(f"- Availability: {avail_en}")
lines.append(f"\n### Bio (EN)")
lines.append(lang(profile['bio'], 'en'))
lines.append(f"\n### Bio (ES)")
lines.append(lang(profile['bio'], 'es'))
lines.append(f"\n## Skills")
lines.append(", ".join(profile['skills']))
lines.append(f"\n## Projects ({len(projects)})")
for p in projects:
    title_en = lang(p['title'], 'en')
    title_es = lang(p['title'], 'es')
    lines.append(f"\n### {title_en} / {title_es}")
    if p["engine"]:
        lines.append(f"- Engine: {p['engine']}")
    if p["language"]:
        lines.append(f"- Language: {p['language']}")
    if p["year"]:
        lines.append(f"- Year: {p['year']}")
    if p["tags"]:
        lines.append(f"- Tags: {', '.join(p['tags'])}")
    lines.append(f"- Description (EN): {lang(p['short'], 'en')}")
    lines.append(f"- Description (ES): {lang(p['short'], 'es')}")
    if p["tools"]:
        lines.append(f"- Tools: {', '.join(p['tools'])}")
    if p["repo"]:
        lines.append(f"- Source: {p['repo']}")
    if p["download"]:
        lines.append(f"- Download: {p['download']}")
    if p["video"]:
        vid_raw = p['video']
        if vid_raw.startswith('youtube:'):
            vid_id = vid_raw[8:].strip()
            if vid_id:
                lines.append(f"- Video: https://youtu.be/{vid_id}")
with open(os.path.join(ROOT, "llms.txt"), "w", encoding="utf-8") as f:
    f.write("\n".join(lines) + "\n")

# ---- sitemap.xml ----
url_blocks = [
    f'  <url>\n    <loc>{SITE_URL}/</loc>\n    <changefreq>weekly</changefreq>\n  </url>'
]
for p in projects:
    url_blocks.append(
        f'  <url>\n    <loc>{SITE_URL}/#{p["slug"]}</loc>\n    <changefreq>monthly</changefreq>\n  </url>'
    )
sitemap = (
    '<?xml version="1.0" encoding="UTF-8"?>\n'
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    + "\n".join(url_blocks) + "\n</urlset>\n"
)
with open(os.path.join(ROOT, "sitemap.xml"), "w", encoding="utf-8") as f:
    f.write(sitemap)

# ---- robots.txt ----
robots = f"User-agent: *\nAllow: /\nSitemap: {SITE_URL}/sitemap.xml\n"
with open(os.path.join(ROOT, "robots.txt"), "w", encoding="utf-8") as f:
    f.write(robots)

print(
    f"OK: {len(projects)} proyectos generados. "
    "site-data.js, llms.txt, sitemap.xml, robots.txt listos."
)
