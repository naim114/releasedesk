# ReleaseDesk v2.0 — Deployment Document Generator

ReleaseDesk generates IT Change Requests, Deployment Checklists and Software Release Notes from configurable bank/application information and document templates.

## How to open

Open `index.html` in Edge or Chrome. The application is also suitable for serving as a static website on an internal office web server in a future deployment. Hosting, user authentication, role permissions and shared storage have **not yet been implemented**.

## Main workflow

1. **Select documents** on the welcome screen: ITCR, Deployment Checklist, Software Release Note, or any combination.
2. Enter bank, ticket, date/time, change impact, SQL/XML details and explanations.
3. Choose one or more applications and deployment objects.
4. Choose requester/preparer signature style if required. Options: blank (default), typed italic with selectable font/style, or upload an image for the current session.
5. Review deployment steps and generate only the selected documents.

## Signatures and approval controls

- Requestor signature settings apply only to the requestor fields in the ITCR.
- Prepared-by signature settings apply only to the prepared-by cell in the Software Release Note.
- Approvals, reviewer signatures and bank sign-off remain blank.
- Uploaded images are handled in the browser and **are not saved to configuration JSON or persistent browser storage**. Re-upload after reloading the page.
- A typed signature is a styled name, not a verified electronic/digital signature. It should only be used where the organization authorizes it.

## Document rules retained from v1.7

- BMMB remains the default bank, with editable application nodes and paths.
- The ITCR and deployment checklist have pre-deployment, deployment, post-deployment, and fallback sections.
- SQL steps precede application changes, with CTC/Mantis-based default filenames when blank.
- New XML needs no backup; existing XML is backed up and has restoration steps.
- JAR/WAR procedures are prepared per node, with verification before moving to the next node.
- All generated commands require operator review and approvals; the application does not execute deployments or database changes.

## Sharing or migrating configuration

Use **Export data** and **Import data**. Earlier v1.x backup files can be imported. Data is stored in the browser where supported; a shared central database is not yet included. Hosting the static files on an office server will **not** automatically provide shared storage or access control.

## Contents

`index.html`, `style.css`, `app.js`, `assets/`, `vendor/`, and `templates/`. Keep the files together. JSZip is included with its license. The Cardzone logo displayed in the app was sourced from the user-supplied BONUM release-note reference.

## Release note procedure pattern (v1.9)

- Backup and rollback procedures use paired, numbered groups per component and node. JAR/WAR files use `mv filename backup/filename.YYYYMMDD`; existing XML files use `mv filename filename.YYYYMMDD` in the configured XML directory.
- Rollback removes the newly deployed file and restores the date-stamped backup. New XML has a removal-only fallback that requires authorization.
- Binary file movement occurs after stopping the node. SQL is executed before application deployment.
- Deployment instructions are grouped by node, with XML subgroups and verification before moving to the next node.
- Review generated commands, paths, filenames, permissions, downtime, and rollback approvals before executing.

## Reusable notes for each application (v2.0)

Each bank application (Switch, Batch, Webservice, ACS/3DS, 3DSS, etc.) has an editable **Application Notes** field in **Bank configuration**. Notes may include operational reminders, dependencies, validation considerations and deployment precautions.

- These notes appear under each application on the **Applications & files** screen when filled in.
- Notes are stored per bank and application in the browser alongside other configuration and included in full JSON **Export data** backups.
- Application notes are not automatically inserted into ITCR, Deployment Checklist or Release Note documents.
- Avoid putting credentials, passwords, API keys, or other secrets in notes. GitHub-hosted static builds store browser configuration on the user's own browser, not in GitHub.
