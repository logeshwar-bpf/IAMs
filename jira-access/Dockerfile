FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
COPY claude-plan-provisioning/package.json ./claude-plan-provisioning/
COPY gcp-iam/package.json ./gcp-iam/
COPY google-workspace-iam/package.json ./google-workspace-iam/
COPY jira-access/package.json ./jira-access/

RUN npm ci

COPY jira-access ./jira-access
RUN npm run build --workspace=jira-access

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3004
ENV HOSTNAME="0.0.0.0"
EXPOSE 3004

COPY --from=builder /app/jira-access/.next/standalone ./
COPY --from=builder /app/jira-access/.next/static ./jira-access/.next/static

WORKDIR /app/jira-access
CMD ["node", "server.js"]
