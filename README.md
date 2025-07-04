# JobPilot – Serverless Job Tracking System

JobPilot is a cloud-native, event-driven job tracking platform built entirely on AWS using a modular infrastructure-as-code approach. It enables users to track job applications, upload resumes, receive automated follow-up reminders, and securely manage application statuses. The entire system is deployed using Terraform and integrates several AWS services like Lambda, API Gateway, Cognito, S3, DynamoDB, EventBridge, SNS, and Elastic Beanstalk.

---

## 📦 Architecture Overview

<img width="761" alt="jobtracker" src="https://github.com/user-attachments/assets/35a6f6dd-b0c7-48b5-9749-1bbdb0550d17" />


- **Backend**: Node.js Lambda functions for API logic and notifications
- **Frontend**: React app served via Dockerized Express server on AWS Elastic Beanstalk
- **Authentication**: Amazon Cognito with JWT-based access
- **Storage**: Amazon S3 (resumes), Amazon DynamoDB (application metadata)
- **Notification System**: Amazon EventBridge + Amazon SNS
- **Infrastructure Management**: Terraform (modular structure)

---

## 🚀 Deployment Changes (Milestone II)

- **Frontend Hosting**: Migrated from ECS Fargate to **AWS Elastic Beanstalk** with Dockerized Node.js for simplified runtime environment management and environment variable injection.

---

## 🧩 Services and Configuration

### 🟨 AWS Lambda
- **Runtime**: Node.js 18.x
- **Deployment**: Managed via Terraform with role-based execution
- **Features**:
  - JWT validation using Cognito
  - Scoped operations using `userId` from claims
  - Integrated with CloudWatch for monitoring

**Functions:**
- `add-jobs-function`: Store job entries and trigger EventBridge
- `get-jobs-function`: Retrieve all jobs for user
- `change-status-function`: Update job status and move S3 resume
- `generate-presigned-url`: Generate PUT URLs for S3 uploads
- `get-resume`: Generate GET URLs for resume download
- `subscribe-user-function`: Subscribes user to SNS topic
- `send-followup`: Sends follow-up reminder emails

---

### 🟦 Amazon S3 – Resume Storage
- **Path Format**: `<status>/<userId>/<jobId>.pdf`
- **Security**: Pre-signed URLs for all access, SSE-S3 encryption
- **Lifecycle Rule**: Auto-delete resumes under `rejected/` after 10 days
- **Versioning**: Enabled for recovery/rollback

---

### 🟥 Amazon DynamoDB – Job Metadata
- **Table**: `jobpilot-applications`
- **Schema**: `userId` (PK) + `jobId` (SK)
- **Mode**: On-Demand (no manual provisioning)
- **Reason**: Fast, scalable, low-latency job metadata store

---

### 🟩 Amazon API Gateway – REST Endpoints
- **Endpoints**:
  - `POST /add-jobs`
  - `POST /change-status`
  - `GET /generate-presigned-url`
  - `GET /get-resume`
  - `GET /jobs`
  - `POST /subscribe-user`
- **Auth**: Cognito Authorizer with JWT
- **CORS**: Configured for all routes

---

### 🟪 Amazon EventBridge – Event-Driven Reminders
- **Rule**: `job-applied-followup`
- **Trigger**: Job marked as `applied`
- **Flow**: Emits custom event → triggers Lambda → sends email via SNS

---

### 🟧 Amazon SNS – Email Reminders
- **Topic**: `job-followup-reminders`
- **Flow**:
  - Lambda → SNS (Email) → User
- **Security**: Lambda-only publishing, opt-in subscription

---

### 🟫 AWS Elastic Beanstalk – Frontend Deployment
- **Platform**: 64bit Amazon Linux 2 + Docker
- **Container**: React build + Express server (`server.js`)
- **Runtime Config**: `/config` endpoint serves env vars to frontend
- **Deployment**: Zipped Docker bundle via Terraform

---

### 🔐 Amazon Cognito – Auth & Identity
- **User Pool**: `job-tracker-user-pool`
- **App Client**: `job-tracker-client`
- **Security**:
  - JWT used for backend API auth
  - User-level isolation using `sub` claim

---

## 📊 Monitoring & Logging

### 🔍 CloudWatch Dashboards
- **Lambda**: Invocation count, duration, error rates
- **API Gateway**: Integration latency
- **DynamoDB**: RCU/WCU usage, throttling
- **Elastic Beanstalk**: Health status
- **SNS**: Message publish count

### 📝 CloudWatch Logs
- Lambda logs include metadata and execution flow
- API Gateway logs capture user IP, status codes, latency

---

## ✅ Requirements Demonstration

### Functional
- ✅ Add, view, and update job applications
- ✅ Upload/download resumes via pre-signed URLs
- ✅ Follow-up reminder via EventBridge + SNS
- ✅ Secure user authentication with Cognito

### Non-Functional
- 🔒 Secure – Auth, signed requests, scoped access
- ⚙️ Scalable – Serverless components
- ♻️ Cost-efficient – Free tier optimized, lifecycle rules
- 📈 Observable – Full CloudWatch integration

---

## 🧱 Terraform Infrastructure

- **Modular Structure**: `services/` folder for each AWS service
- **Shared Root Files**: `main.tf`, `provider.tf`, `outputs.tf`
- **Deployment**: Run via `terraform apply` (single pass or targeted)
