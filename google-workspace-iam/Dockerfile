FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
COPY claude-plan-provisioning/package.json ./claude-plan-provisioning/
COPY gcp-iam/package.json ./gcp-iam/
COPY google-workspace-iam/package.json ./google-workspace-iam/
COPY jira-access/package.json ./jira-access/

RUN npm ci

COPY google-workspace-iam ./google-workspace-iam
RUN npm run build --workspace=google-workspace-iam

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3002
ENV HOSTNAME="0.0.0.0"
EXPOSE 3002

COPY --from=builder /app/google-workspace-iam/.next/standalone ./
COPY --from=builder /app/google-workspace-iam/.next/static ./google-workspace-iam/.next/static

WORKDIR /app/google-workspace-iam
CMD ["node", "server.js"]
