# @see https://hub.docker.com/_/ghost/
FROM ghost:1.22

COPY .lib/override/spec.js /var/lib/ghost/current/node_modules/gscan/lib/
COPY .lib/override/i18n.js /var/lib/ghost/server/lib/common/
COPY .lib/override/zh.json /var/lib/ghost/server/transiations/
COPY .lib/apps/navigation/ /var/lib/ghost/content/apps/navigation/

ARG PROJECT
ARG DOMAIN

COPY projects/${PROJECT}/data/ghost-local.db /var/lib/ghost/content/data/ghost.db
COPY projects/${PROJECT}/data/redirects.json /var/lib/ghost/content/data/
COPY projects/${PROJECT}/images/             /var/lib/ghost/content/images/
COPY projects/${PROJECT}/themes/default/     /var/lib/ghost/content/themes/default/

# RUN gosu node ghost setup migrate
RUN gosu node ghost config url "http://${DOMAIN}"

CMD ["node", "/var/lib/ghost/current/index.js"]
