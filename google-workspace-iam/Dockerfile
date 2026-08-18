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
EXPOSE 3002

COPY --from=builder /app/package.json /app/package-lock.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/google-workspace-iam ./google-workspace-iam

WORKDIR /app/google-workspace-iam
CMD ["npm", "run", "start"]
