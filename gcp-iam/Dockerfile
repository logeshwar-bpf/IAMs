FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
COPY claude-plan-provisioning/package.json ./claude-plan-provisioning/
COPY gcp-iam/package.json ./gcp-iam/
COPY google-workspace-iam/package.json ./google-workspace-iam/
COPY jira-access/package.json ./jira-access/

RUN npm ci

COPY gcp-iam ./gcp-iam
RUN npm run build --workspace=gcp-iam

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3003
EXPOSE 3003

COPY --from=builder /app/package.json /app/package-lock.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/gcp-iam ./gcp-iam

WORKDIR /app/gcp-iam
CMD ["npm", "run", "start"]
