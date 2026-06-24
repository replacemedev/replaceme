# Legal Pages QA Report

## Scope

Static legal routes `/terms-of-service` and `/privacy-policy` with empty bodies, global chrome, and layout-matched skeletons.

## Routes

| Route | Page | Loading |
|-------|------|---------|
| `/terms-of-service` | `app/terms-of-service/page.tsx` | `loading.tsx` |
| `/privacy-policy` | `app/privacy-policy/page.tsx` | `loading.tsx` |

## Empty body policy

- [x] No lorem ipsum or generated legal copy
- [x] `LegalContentPlaceholder` shows only: "Legal text pending."
- [x] White prose container ready for future legal HTML/markdown insertion

## Shared components (DRY)

| Component | Role |
|-----------|------|
| `LegalPageLayout` | Header + main + bold title + content section + Footer |
| `LegalContentPlaceholder` | Minimal pending state |
| `LegalPageSkeleton` | Layout twin with `animate-pulse` placeholders |

## Skeleton vs page fidelity

| Element | Page | Skeleton | Match |
|---------|------|----------|-------|
| Header | `Header` | `Header` | Yes |
| Footer | `Footer` | `Footer` | Yes |
| Main padding | `pt-24 sm:pt-28 pb-16` | Same | Yes |
| Max width | `max-w-3xl` | Same | Yes |
| Title block | `h1` extrabold 3xl–5xl | `h-10–14` gray bar | Visual twin |
| Content card | `min-h-[320px]` white card | Same dimensions + pulse lines | Yes |
| Background | `#f8fafe` | Same | Yes |

Zero layout shift: skeleton and page share identical outer structure and spacing.

## DOM flatness (ponytail)

```
LegalPageLayout
  Header
  main
    article
      h1
      section → placeholder or future prose
  Footer
```

No nested wrapper divs beyond semantic `main` / `article` / `section`.

## Responsiveness

- Mobile-first padding: `px-4 sm:px-6 lg:px-8`
- Title scales: `text-3xl sm:text-4xl lg:text-5xl`
- Content card padding: `p-6 sm:p-8 lg:p-10`

## Navigation link updates

Footer, AuthFooter, and signup links updated to `/terms-of-service` and `/privacy-policy`.

## Manual test checklist

1. Visit `/terms-of-service` → title visible, placeholder only, header/footer present
2. Visit `/privacy-policy` → same structure, different title
3. Footer legal links route correctly
4. Signup form Terms/Privacy links route correctly
5. Resize mobile → desktop: no horizontal scroll, title scales
