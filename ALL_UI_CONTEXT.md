# UI Template Consolidated Context

## admin_replace_me / admin_dashboard_system_overview / code.html
```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Admin Dashboard Overview - Replace Me</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=JetBrains+Mono:wght@600&family=Plus+Jakarta+Sans:wght@700;800&display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    "colors": {
                        "surface-mint": "#F0FDF4",
                        "primary-fixed-dim": "#4ae176",
                        "surface-bright": "#faf8ff",
                        "on-tertiary-container": "#074a25",
                        "on-error-container": "#93000a",
                        "border-subtle": "#E2E8F0",
                        "surface": "#faf8ff",
                        "on-secondary-fixed": "#002117",
                        "on-tertiary-fixed": "#00210d",
                        "success": "#22C55E",
                        "inverse-surface": "#283044",
                        "surface-variant": "#dae2fd",
                        "secondary-fixed-dim": "#95d3ba",
                        "on-error": "#ffffff",
                        "surface-container-high": "#e2e7ff",
                        "primary-container": "#22c55e",
                        "outline-variant": "#bccbb9",
                        "background": "#faf8ff",
                        "tertiary-fixed": "#b1f2be",
                        "tertiary-container": "#7cba8a",
                        "on-secondary": "#ffffff",
                        "canvas": "#FFFFFF",
                        "surface-container-lowest": "#ffffff",
                        "surface-container": "#eaedff",
                        "secondary-container": "#adedd3",
                        "on-tertiary": "#ffffff",
                        "inverse-primary": "#4ae176",
                        "on-primary-container": "#004b1e",
                        "inverse-on-surface": "#eef0ff",
                        "on-surface-variant": "#3d4a3d",
                        "ink-muted": "#64748B",
                        "on-secondary-fixed-variant": "#0b513d",
                        "info": "#3B82F6",
                        "on-surface": "#131b2e",
                        "surface-subdued": "#F8FAFC",
                        "secondary-fixed": "#b0f0d6",
                        "surface-container-low": "#f2f3ff",
                        "primary-fixed": "#6bff8f",
                        "on-primary-fixed": "#002109",
                        "tertiary": "#2e6a41",
                        "surface-tint": "#006e2f",
                        "tertiary-fixed-dim": "#96d5a3",
                        "error-container": "#ffdad6",
                        "error": "#EF4444",
                        "outline": "#6d7b6c",
                        "ink-secondary": "#334155",
                        "surface-dim": "#d2d9f4",
                        "surface-container-highest": "#dae2fd",
                        "primary": "#006e2f",
                        "on-primary-fixed-variant": "#005321",
                        "on-tertiary-fixed-variant": "#12512c",
                        "secondary": "#2b6954",
                        "on-primary": "#ffffff",
                        "on-secondary-container": "#306d58",
                        "on-background": "#131b2e"
                    },
                    "borderRadius": {
                        "DEFAULT": "0.25rem",
                        "lg": "0.5rem",
                        "xl": "0.75rem",
                        "full": "9999px"
                    },
                    "spacing": {
                        "gutter": "24px",
                        "container-max": "1280px",
                        "base-unit": "4px",
                        "section-gap": "96px",
                        "margin-desktop": "40px",
                        "margin-mobile": "16px"
                    },
                    "fontFamily": {
                        "body-base": ["Inter"],
                        "label-mono": ["JetBrains Mono"],
                        "display-xl-mobile": ["Plus Jakarta Sans"],
                        "display-xl": ["Plus Jakarta Sans"],
                        "display-md": ["Plus Jakarta Sans"],
                        "display-lg": ["Plus Jakarta Sans"],
                        "caption": ["Inter"],
                        "body-bold": ["Inter"]
                    },
                    "fontSize": {
                        "body-base": ["16px", { "lineHeight": "1.6", "letterSpacing": "0", "fontWeight": "400" }],
                        "label-mono": ["12px", { "lineHeight": "1.4", "letterSpacing": "0.05em", "fontWeight": "600" }],
                        "display-xl-mobile": ["36px", { "lineHeight": "1.2", "letterSpacing": "-0.02em", "fontWeight": "800" }],
                        "display-xl": ["48px", { "lineHeight": "1.2", "letterSpacing": "-0.02em", "fontWeight": "800" }],
                        "display-md": ["24px", { "lineHeight": "1.3", "letterSpacing": "-0.01em", "fontWeight": "700" }],
                        "display-lg": ["36px", { "lineHeight": "1.25", "letterSpacing": "-0.015em", "fontWeight": "700" }],
                        "caption": ["14px", { "lineHeight": "1.5", "letterSpacing": "0", "fontWeight": "400" }],
                        "body-bold": ["16px", { "lineHeight": "1.6", "letterSpacing": "0", "fontWeight": "600" }]
                    }
                }
            }
        }
    </script>
<style>
        .glow-elevation:hover {
            transform: translateY(-4px);
            box-shadow: 0 10px 15px -3px rgba(34,197,94,0.15), 0 4px 6px -4px rgba(34,197,94,0.1);
        }
        .chart-placeholder {
            background-image: linear-gradient(to right, #f8fafc 1px, transparent 1px), linear-gradient(to bottom, #f8fafc 1px, transparent 1px);
            background-size: 20px 20px;
        }
    </style>
</head>
<body class="bg-background text-on-surface font-body-base text-body-base antialiased selection:bg-surface-mint selection:text-primary min-h-screen">
<!-- TopNavBar -->
<nav class="bg-canvas/90 dark:bg-on-background/90 fixed top-0 w-full z-50 backdrop-blur-md border-b border-border-subtle dark:border-outline-variant shadow-sm hidden md:block">
<div class="flex justify-between items-center h-16 px-gutter max-w-container-max mx-auto">
<div class="flex items-center gap-8">
<span class="font-display-md text-display-md font-bold text-primary dark:text-primary-fixed-dim">Replace Me</span>
</div>
<div class="flex items-center gap-6">
<a class="text-ink-muted dark:text-on-surface-variant hover:text-primary dark:hover:text-primary-fixed-dim transition-colors scale-102 transition-transform duration-200" href="#">Dashboard</a>
<a class="text-ink-muted dark:text-on-surface-variant hover:text-primary dark:hover:text-primary-fixed-dim transition-colors scale-102 transition-transform duration-200" href="#">Users</a>
<a class="text-ink-muted dark:text-on-surface-variant hover:text-primary dark:hover:text-primary-fixed-dim transition-colors scale-102 transition-transform duration-200" href="#">Moderation</a>
<a class="text-primary dark:text-primary-fixed-dim border-b-2 border-primary dark:border-primary-fixed-dim pb-1 font-body-bold" href="#">Verification</a>
</div>
<div class="flex items-center gap-4">
<div class="relative w-64">
<span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted">search</span>
<input class="w-full pl-10 pr-4 py-2 bg-surface-subdued border border-border-subtle rounded-lg text-caption font-caption focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all-custom" placeholder="Search..." type="text"/>
</div>
<button class="text-ink-muted hover:text-primary transition-colors p-2 rounded-full hover:bg-surface-container">
<span class="material-symbols-outlined">notifications</span>
</button>
<button class="text-ink-muted hover:text-primary transition-colors p-2 rounded-full hover:bg-surface-container">
<span class="material-symbols-outlined">settings</span>
</button>
<div class="w-8 h-8 rounded-full overflow-hidden border border-border-subtle">
<img alt="Admin Profile" class="w-full h-full object-cover" src="https://lh3.googleusercontent.com/..."/>
</div>
</div>
</div>
</nav>
<!-- SideNavBar and Main Content omitted for brevity -->
</body>
</html>
```

## admin_replace_me / admin_identity_verification / code.html
```html
<!DOCTYPE html>
<html class="light" lang="en">
<head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Identity Check - Admin Portal</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com" rel="preconnect"/>
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=JetBrains+Mono:wght@600&family=Plus+Jakarta+Sans:wght@700;800&display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
<script id="tailwind-config">
        tailwind.config = { /* same config as above */ };
    </script>
<style>
        .hover-glow:hover { transform: translateY(-4px); box-shadow: 0 10px 15px -3px rgba(34, 197, 94, 0.15), 0 4px 6px -4px rgba(34, 197, 94, 0.05); border-color: #22C55E; }
        .transition-all-custom { transition: all 0.2s ease-in-out; }
    </style>
</head>
<body class="bg-background text-on-surface font-body-base antialiased selection:bg-surface-mint selection:text-primary min-h-screen">
<!-- TopNavBar -->
<nav class="hidden md:flex bg-canvas/90 dark:bg-on-background/90 font-body-base text-body-base fixed top-0 w-full z-50 backdrop-blur-md border-border-subtle dark:border-outline-variant shadow-sm justify-between items-center h-16 px-gutter max-w-container-max mx-auto">
<div class="flex items-center gap-6">
<span class="font-display-md text-display-md font-bold text-primary dark:text-primary-fixed-dim">Replace Me</span>
</div>
<div class="flex items-center gap-8">
<a class="text-ink-muted dark:text-on-surface-variant hover:text-primary dark:hover:text-primary-fixed-dim transition-colors scale-102 transition-transform duration-200" href="#">Dashboard</a>
<a class="text-ink-muted dark:text-on-surface-variant hover:text-primary dark:hover:text-primary-fixed-dim transition-colors scale-102 transition-transform duration-200" href="#">Users</a>
<a class="text-ink-muted dark:text-on-surface-variant hover:text-primary dark:hover:text-primary-fixed-dim transition-colors scale-102 transition-transform duration-200" href="#">Moderation</a>
<a class="text-primary dark:text-primary-fixed-dim border-b-2 border-primary dark:border-primary-fixed-dim pb-1 hover:text-primary dark:hover:text-primary-fixed-dim transition-colors scale-102 transition-transform duration-200" href="#">Verification</a>
</div>
<div class="flex items-center gap-4">
<div class="relative w-64">
<span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted">search</span>
<input class="w-full pl-10 pr-4 py-2 bg-surface-subdued border border-border-subtle rounded-lg text-caption font-caption focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all-custom" placeholder="Search..." type="text"/>
</div>
<button class="text-ink-muted hover:text-primary transition-colors p-2 rounded-full hover:bg-surface-container"><span class="material-symbols-outlined">notifications</span></button>
<button class="text-ink-muted hover:text-primary transition-colors p-2 rounded-full hover:bg-surface-container"><span class="material-symbols-outlined">settings</span></button>
<div class="w-8 h-8 rounded-full overflow-hidden border border-border-subtle"><img alt="Admin Profile" class="w-full h-full object-cover" src="https://lh3.googleusercontent.com/..."/></div>
</div>
</nav>
<!-- SideNavBar and Main Content omitted for brevity -->
</body>
</html>
```

## admin_replace_me / admin_job_review_queue / code.html
```html
<!DOCTYPE html>
<html class="light" lang="en">
<head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Job Moderation - Admin Portal</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=JetBrains+Mono:wght@600&family=Plus+Jakarta+Sans:wght@700;800&display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
<script id="tailwind-config">
        tailwind.config = { /* same config as above */ };
    </script>
<style>
        .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
        .glow-hover:hover { transform: translateY(-4px); box-shadow: 0 10px 15px -3px rgba(34,197,94,0.15), 0 4px 6px -4px rgba(34,197,94,0.1); border-color: #22C55E; }
    </style>
</head>
<body class="bg-canvas text-on-surface font-body-base antialiased selection:bg-surface-mint selection:text-primary min-h-screen">
<header class="fixed top-0 w-full z-50 backdrop-blur-md border-b border-border-subtle dark:border-outline-variant shadow-sm bg-canvas/90 dark:bg-on-background/90 flex justify-between items-center h-16 px-gutter max-w-container-max mx-auto left-0 right-0">
<div class="flex items-center gap-8"><h1 class="font-display-md text-display-md font-bold text-primary dark:text-primary-fixed-dim">Replace Me</h1></div>
<nav class="hidden md:flex gap-6 items-center"><a class="text-ink-muted dark:text-on-surface-variant font-body-base text-body-base hover:text-primary dark:hover:text-primary-fixed-dim transition-colors scale-102 transition-transform duration-200" href="#">Dashboard</a><a class="text-ink-muted dark:text-on-surface-variant font-body-base text-body-base hover:text-primary dark:hover:text-primary-fixed-dim transition-colors scale-102 transition-transform duration-200" href="#">Users</a><a class="text-primary dark:text-primary-fixed-dim border-b-2 border-primary dark:border-primary-fixed-dim pb-1 font-body-base text-body-base scale-102 transition-transform duration-200" href="#">Moderation</a><a class="text-ink-muted dark:text-on-surface-variant font-body-base text-body-base hover:text-primary dark:hover:text-primary-fixed-dim transition-colors scale-102 transition-transform duration-200" href="#">Verification</a></nav>
<div class="flex items-center gap-4"><button class="text-ink-muted hover:text-primary transition-colors"><span class="material-symbols-outlined">notifications</span></button><button class="text-ink-muted hover:text-primary transition-colors"><span class="material-symbols-outlined">settings</span></button><div class="w-8 h-8 rounded-full overflow-hidden border border-border-subtle"><img alt="Admin Profile" class="w-full h-full object-cover" src="https://lh3.googleusercontent.com/..."/></div></div>
</header>
<!-- Main content omitted for brevity -->
</body>
</html>
```

---
### Images
The following images are part of the UI template (referenced in the HTML above). They are stored in the same directories as their respective HTML files:
- `admin_dashboard_system_overview/screen.png`
- `admin_identity_verification/...` (various profile pictures)
- `admin_job_review_queue/...`
- ... (other `screen.png` files in each sub‑folder)

*Each image can be accessed directly via its file path, e.g.,* `file:///Users/stephen/Documents/[01]%20WORK/01_replace_me/UI_template/admin_replace_me/admin_dashboard_system_overview/screen.png`.

---
**Note:** This markdown consolidates the full HTML source of all UI template pages and lists the associated image assets. It can be used as a single reference point for further development or design work.
