# University Electoral Commission — Secure Electronic Ballot User Guide

Welcome to the **University Electoral Commission (UEC) Secure Electronic Ballot System**. This web application combines modern cryptography, role-based access control, real-time analytics, and blockchain ledger technologies to deliver a unified, tamper-evident electoral platform. This guide explains the system's core capabilities, layout, administrative options, and step-by-step workflows for Voters, Officers, and Administrators.

---

## 📖 Table of Contents
1. [System Architecture Overview](#1-system-architecture-overview)
2. [Electoral Portal Navigation](#2-electoral-portal-navigation)
3. [Voter Voting Guide (Voter Portal)](#3-voter-voting-guide-voter-portal)
4. [Electoral Officer Guide (Officer Portal)](#4-electoral-officer-guide-electoral-officer-portal)
5. [System Administrator Guide (Admin Portal)](#5-system-administrator-guide-system-administrator-portal)
6. [Live Analytics & Blockchain Explorer](#6-live-analytics--blockchain-explorer)
7. [Cryptographic Security Details](#7-cryptographic-security-details)

---

## 1. System Architecture Overview

The UEC Secure Electronic Ballot application is built around the fundamental principles of **voter anonymity, ballot security, and end-to-end verifiability**. It leverages client-side cryptographic structures to prevent tampering, while ensuring a intuitive interface:

- **Immutable Ledger (Blockchain)**: Every ballot cast is converted into a structured block containing a timestamp, candidate choice, position, election indicators, and the cryptographic hash of the previous block (forming a sequence).
- **Consensus & Hardening**: Simple mathematical difficulty structures (Nonce) secure each link inside the public chain.
- **Role-Based Clearance**: Distinct security profiles restrict dashboard layouts for **Voters**, **Electoral Officers**, and **System Administrators**.
- **Audit Trails**: Non-repudiation logging maps user sessions and interactions into a system-wide public log, facilitating downstream audits.

---

## 2. Electoral Portal Navigation

The application navigation features a unified header and navigation structure with the following key components:

- **Navigation Header**: Contains the **University Electoral Commission logo** and main portal toggle links:
  - **Portal Launchpad**: The main access gate where users authorize their credentials, view currently active/upcoming polls, check real-time deadlines, and navigate to specialized panels.
  - **Live Analytics Results**: The public-facing transparency dashboard summarizing voting turnout, real-time candidate numbers, and the live block explorer.
- **Theme Switcher**: An eye-safe toggler (top right) to alternate seamlessly between high-contrast light mode and cosmic dark mode aesthetics.
- **User Session Card**: Reflects the currently authenticated identity, active clearance level, and a one-click session logout.

---

## 3. Voter Voting Guide (Voter Portal)

As a student, your voting process is streamlined and highly secure.

### Step 3.1: Log in to the Ballot System
1. Go to the **Portal Launchpad**.
2. Click **Voter Portal Access** (or log in automatically if configured).
3. Type your **Student ID** (e.g., `ST-001`) and standard registration **PIN** or **Secret Password**.
4. To verify eligibility, enter the **One-Time Passcode (OTP)** generated for your account. *(Note: During active campaigns, request your current OTP from any certified Electoral Officer in your department).*

### Step 3.2: Select the Active Election
1. Once authenticated, review the **Election Countdown Card**. This displays the active election title, counting countdown down to the seconds, and the exact clock deadline.
2. Select your targeted election to enter the secure ballot room.

### Step 3.3: Cast Your Ballots
1. **Interactive Ballot Interface**: Candidates are listed side-by-side grouped by their contested **Positions** (e.g., President, General Secretary).
2. Read more on candidates by clicking their **Manifesto** cards to view background departments and policy platforms.
3. Select your preferred candidate for each position by clicking their vote buttons. Selected choices are highlighted immediately.
4. Once selections are made, click **Review Selections** to check your choices in an overlay summary card.

### Step 3.4: Crypto Sign & Seal
1. To finalize, click **Seal & Submit Ballot**.
2. The application automatically bundles your selection, calculates the SHA-256 cryptographic chain hash linked to the previous vote block, and inserts the block onto the live ledger.
3. A confirmation receipt will display. Tap **Return** to go back to the Portal Launchpad safely.

---

## 4. Electoral Officer Guide (Electoral Officer Portal)

Electoral Officers are tasked with auditing voter eligibility, processing on-site registration requests, and issuing OTP safety passcodes.

### Step 4.1: Access the Staff Hub
1. From the **Portal Launchpad**, click **EC Staff Hub**.
2. Authenticate using your certified officer credentials.

### Step 4.2: Manage and Verify Voters
* Use the **Voter verification tools** to view registered voters matching your sub-department.
* Locate a student ID and verify:
  - **Registration Dates & Personal info**.
  - **Voted Status**: Safely confirm whether they have already cast ballots.
  - **Generate Secret OTP**: Use the unique token-maker tool to generate individual custom OTPs. Copy and hand these securely to checking students in physical voting lines.

---

## 5. System Administrator Guide (System Administrator Portal)

The System Administrator has overall control of the electoral environment, system logs, metadata constants, and visual styles.

### Step 5.1: Create & Edit Elections
1. Navigate to the **Admin Dashboard** (available to administrators inside the EC Staff Hub).
2. Click **Add New Election** or edit existing entries:
   - Configure **Electoral Title**.
   - Pick the **Start Date** and **End Date** values using absolute local time settings.
   - Activate, pause, or archive campaigns.

### Step 5.2: Populate Candidates and Contested Positions
* Add contested positions and assign them to specific elections.
* Add candidates, input their bios or platforms, assign their contested departments, and toggle their approval status inside the master database.

### Step 5.3: Security Logs & Audit Trail Tracking
* Access the **Comprehensive Security Audit Log** at the footer.
* Track individual logins, OTP authorizations, registration additions, and status warnings.
* Highlight potential risks flagged by **Warning** or **Danger** indicators (e.g., unregistered student lookup attempts or multi-vote attempt alerts).

### Step 5.4: Custom Branding Styles
* Upload custom background image assets or alternate key visual graphics across the dashboard portals to reflect currently updated campaigns or seasonal varsity themes.

---

## 6. Live Analytics & Blockchain Explorer

Designed for public transparency, the **Live Analytics Results** page is accessible to everyone:

### 📊 Statistical KPI Counters
* **Total Turnout Gauge**: Displays total percentage participation compared to the master voter registry count.
* **Turnout by Core Departments**: Compares engagement levels across Computer Science, Business Administration, Engineering, and Info Technology departments with real-time responsive bars.
* **Contested Leaderboards**: Live Recharts bars showing raw, real-time vote metrics for each approved candidate in descending order.

### ⛓️ Immutable Ledger Explorer
* Scroll down to view the **Secure Ballot Public Blockchain Ledger**.
* Each card represents an verified block submitted directly by the client’s browser:
  - **Index Node Number**: Unique coordinate inside the chain list.
  - **Current Block Hash**: SHA-256 identifier starting with sequential validation digits.
  - **Previous Block Hash**: Linked reference to verify the absolute chain correlation.
  - **Block Cryptographic Nonce**: Solved difficulty key proving ledger authority.
* Ensure chain consistency by verifying the green indicator seals reflecting complete data continuity.

---

## 7. Cryptographic Security Details

To maintain zero trust and prevent database-level fraud, the system executes real-time cryptography logic:

1. **SHA-256 Core Hash**: Every block compiles its fields (index, timestamp, choices, and previous signature) into a unified string before applying standard `crypto.subtle` hash functions.
2. **Deterministic Sequence (Linkages)**: If a malicious entity alters any record in the database, the corresponding signature fails to resolve against the subsequent block's `previousHash`. This triggers deep chain inconsistencies immediately flagged in red on public tracking screens.
3. **Data Anonymity**: Voter identities are decoupled from candidate choices within the public blockchain blocks, protecting individual voting confidentiality.

---

*Thank you for trusting the University Electoral Commission Secure Electronic Ballot System. Cast your inputs confidently!*
