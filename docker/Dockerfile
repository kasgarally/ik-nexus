# Author: Karmil Asgarally - INTELLEKTRA © 2026
# Meteor production image
#
# Meteor 3.5.2 app; meteor-base is tagged through 3.5.1 and will
# download the project's exact release from .meteor/release.
ARG METEOR_BASE_TAG=3.5.1
FROM geoffreybooth/meteor-base:${METEOR_BASE_TAG} AS builder

ARG APP_NAME
RUN test -n "${APP_NAME}"

# Give meteor build more heap; raise Docker Desktop memory if this still OOMs.
ENV TOOL_NODE_FLAGS="--max-old-space-size=4096"

# Shared packages resolve at /packages (file:../../packages/ui from /opt/src).
COPY packages /packages

# Cache npm install unless package files change.
COPY apps/${APP_NAME}/package.json apps/${APP_NAME}/package-lock.json $APP_SOURCE_FOLDER/
RUN bash $SCRIPTS_FOLDER/build-app-npm-dependencies.sh

COPY apps/${APP_NAME} $APP_SOURCE_FOLDER/

# Full client + server bundle (do not use --server-only; Vue assets must ship).
RUN mkdir -p "$APP_BUNDLE_FOLDER" \
  && cd "$APP_SOURCE_FOLDER" \
  && meteor build --directory "$APP_BUNDLE_FOLDER"

FROM node:24.15.0-alpine

ENV APP_BUNDLE_FOLDER=/opt/bundle \
    SCRIPTS_FOLDER=/docker \
    PORT=3000

RUN apk --no-cache add bash ca-certificates wget

COPY --from=builder $SCRIPTS_FOLDER $SCRIPTS_FOLDER/
COPY --from=builder $APP_BUNDLE_FOLDER/bundle $APP_BUNDLE_FOLDER/bundle/

RUN bash $SCRIPTS_FOLDER/build-meteor-npm-dependencies.sh

EXPOSE 3000

ENTRYPOINT ["/docker/entrypoint.sh"]
CMD ["node", "main.js"]
