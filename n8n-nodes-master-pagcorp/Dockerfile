FROM docker.n8n.io/n8nio/n8n:latest

USER root

RUN mkdir -p /opt/n8n-custom/nodes /opt/n8n-custom/credentials \
 && chown -R node:node /opt/n8n-custom

COPY --chown=node:node dist/nodes /opt/n8n-custom/nodes
COPY --chown=node:node dist/credentials /opt/n8n-custom/credentials

USER node
