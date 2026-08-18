FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
COPY claude-plan-provisioning/package.json ./claude-plan-provisioning/
COPY gcp-iam/package.json ./gcp-iam/
COPY google-workspace-iam/package.json ./google-workspace-iam/
COPY jira-access/package.json ./jira-access/

RUN npm ci

COPY claude-plan-provisioning ./claude-plan-provisioning
RUN npm run build --workspace=claude-plan-provisioning

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001
ENV HOSTNAME="0.0.0.0"
EXPOSE 3001

COPY --from=builder /app/claude-plan-provisioning/.next/standalone ./
COPY --from=builder /app/claude-plan-provisioning/.next/static ./claude-plan-provisioning/.next/static

WORKDIR /app/claude-plan-provisioning
CMD ["node", "server.js"]
