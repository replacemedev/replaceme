# Cloudflare WAF / DDoS configuration (Terraform)
#
# Apply only if the public hostname sits behind Cloudflare (DNS proxy orange-cloud).
# If traffic terminates on Vercel only, prefer Vercel Firewall (see vercel-firewall-rules.json).
# Dual-proxy (Cloudflare → Vercel) needs careful TLS + caching setup — enable intentionally.

terraform {
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.0"
    }
  }
}

variable "zone_id" {
  type        = string
  description = "Cloudflare zone ID for replaceme.ph"
}

variable "account_id" {
  type        = string
  description = "Cloudflare account ID"
}

# Managed OWASP CRS — start in log mode, flip to block after tuning false positives
resource "cloudflare_ruleset" "owasp_managed" {
  zone_id     = var.zone_id
  name        = "replaceme-owasp-managed"
  description = "OWASP Core Ruleset (paranoia level 1)"
  kind        = "zone"
  phase       = "http_request_firewall_managed"

  rules {
    action = "execute"
    action_parameters {
      id = "efb7b8c949ac4650a09736fc376e15a7" # Cloudflare OWASP CRS managed ruleset
      overrides {
        # PL1 — lowest false-positive rate for SaaS apps
        enabled = true
      }
    }
    expression  = "true"
    description = "Execute OWASP CRS"
    enabled     = true
  }
}

# Rate limit authentication paths at the edge
resource "cloudflare_ruleset" "auth_rate_limit" {
  zone_id     = var.zone_id
  name        = "replaceme-auth-rate-limit"
  description = "Edge rate limit for auth endpoints"
  kind        = "zone"
  phase       = "http_ratelimit"

  rules {
    action = "block"
    ratelimit {
      characteristics     = ["ip.src"]
      period              = 60
      requests_per_period = 10
      mitigation_timeout  = 600
    }
    expression  = "(http.request.uri.path contains \"/signin\") or (http.request.uri.path contains \"/signup\") or (http.request.uri.path contains \"/forgot-password\")"
    description = "Auth path rate limit 10/min/IP"
    enabled     = true
  }
}

# Under Attack Mode toggle is dashboard-only — document in ops runbook.
# Recommended WAF dashboard settings (manual):
# - Security Level: Medium (or High during incidents)
# - Bot Fight Mode / Super Bot Fight Mode: On
# - Challenge Passage: 30 minutes
# - Browser Integrity Check: On
# - Always Use HTTPS: On
# - Minimum TLS: 1.2
