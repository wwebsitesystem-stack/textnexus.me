# TextNexus — static site image.
#
# Build from the repository root so the site files are in the build context:
#   docker build -f "Self hosting/Dockerfile" -t textnexus-site .
# or simply:
#   docker compose -f "Self hosting/docker-compose.yml" up -d --build
FROM nginx:1.27-alpine

LABEL org.opencontainers.image.title="TextNexus" \
      org.opencontainers.image.description="Static front end for the TextNexus site" \
      org.opencontainers.image.source="https://github.com/wwebsitesystem-stack/textnexus.me"

WORKDIR /usr/share/nginx/html

# Copy only the files the site actually serves, so build output, docs and this
# folder never end up in the image.
COPY \
    index.html \
    404.html \
    home.html \
    updates.html \
    ghostlink.html \
    TextNexus.html \
    countdown_timer.html \
    admin.html \
    owner.html \
    creator.html \
    settings.html \
    notifications.html \
    suggestions.html \
    signup.html \
    email-manager.html \
    jeoweb.html \
    secret1.html \
    nexus_maintenance.html \
    system_analytics_health.html \
    nexus_admin_control_center.html \
    Style.css \
    logo.svg \
    sw.js \
    app.js \
    bareworker.js \
    database.rules.json \
    ./

COPY adminpanel ./adminpanel

COPY ["Self hosting/nginx.conf", "/etc/nginx/conf.d/default.conf"]

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget -q --spider http://127.0.0.1/ || exit 1
