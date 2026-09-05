# Pakatlah

A lightweight group decision tool for finding the option that works best for everyone.

**Live app:** [pakatlah.ridzu.one](https://pakatlah.ridzu.one)

## About

Pakatlah helps groups move from “mana-mana” to a clear decision.

Instead of choosing an option based only on the highest number of votes, participants respond to every option. Pakatlah then compares overall agreement and highlights options that fewer people reject.

No account is required.

## Features

- Create a decision with 2 to 6 options
- Share a public participation link
- Collect one response for every option
- Use four simple response levels:
  - Suka
  - Boleh
  - Ikut saja
  - Tak boleh
- View live organizer results
- Rank options using consensus score
- Track rejection count and rejection rate
- Review individual participant responses
- Close new responses
- Finalize a selected option
- Show the final decision to participants
- Light and dark themes
- Responsive mobile and desktop interface
- Installable Progressive Web App
- Dedicated organizer management link

## How It Works

1. The organizer creates a question and adds the available options.
2. Pakatlah generates a public participant link and a private organizer link.
3. Participants enter their names and respond to every option.
4. The organizer dashboard ranks the options using the collected responses.
5. The organizer closes responses and finalizes the decision.
6. Participants can open the original link to view the final result.

## Scoring

Each response is converted into a score:

```text
Suka       = 3
Boleh      = 2
Ikut saja  = 1
Tak boleh  = 0
```

The consensus score is calculated as:

```text
Consensus score = total response score / maximum possible score × 100
```

The rejection rate is calculated as:

```text
Rejection rate = number of “Tak boleh” responses / total responses × 100
```

Options are ranked by:

1. Highest consensus score
2. Lowest rejection rate
3. Original option order

The highest-ranked option is suggested automatically, but the organizer still chooses the final decision.

## Tech Stack

- Next.js App Router
- React
- JavaScript
- Tailwind CSS
- Supabase
- PostgreSQL
- Vercel
- Cloudflare DNS

## Project Structure

```text
src/
├── app/
│   ├── manage/[manageToken]/
│   ├── new/
│   ├── p/[publicToken]/
│   ├── preview/
│   ├── setup/
│   ├── share/
│   ├── globals.css
│   ├── layout.js
│   ├── manifest.js
│   └── page.js
├── components/
│   ├── app-header.js
│   └── theme-toggle.js
└── lib/
    └── supabase/
        └── client.js
```

## Local Development

### Prerequisites

- Node.js 20 or later
- npm
- A Supabase project

### Installation

Clone the repository:

```bash
git clone https://github.com/ameeridz/pakatlah.git
cd pakatlah
```

Install dependencies:

```bash
npm install
```

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

Do not add a Supabase secret key, service role key, or database password to frontend environment variables.

Start the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

To test from another device on the same network, open the computer's local network address, for example:

```text
http://192.168.x.x:3000
```

Some browser capabilities, including the Clipboard API, may require HTTPS and may not work through a local HTTP network address.

## Validation

Run ESLint:

```bash
npm run lint
```

Create a production build:

```bash
npm run build
```

## Supabase

Pakatlah uses PostgreSQL tables and controlled RPC functions for its public workflows.

Main tables:

```text
decisions
decision_options
participants
participant_responses
```

Main RPC functions:

```text
create_decision
get_public_decision
submit_participant_response
get_manage_dashboard
close_decision_responses
finalize_decision
```

Direct anonymous table access is restricted. Public operations are handled through validated database functions.

Database SQL should be maintained as versioned migrations before the project is opened to external contributors.

## PWA

Pakatlah includes:

- Web App Manifest
- 192 × 192 app icon
- 512 × 512 app icon
- Maskable app icon
- Apple Touch Icon
- Standalone display mode
- iOS safe-area support
- Light and dark browser theme colors

Install the production app from:

```text
https://pakatlah.ridzu.one
```

## Security Notes

- Participant links use public tokens.
- Organizer dashboards use private management tokens.
- Anyone with a management link can access its organizer dashboard.
- Management links should not be shared publicly.
- Supabase Row Level Security is enabled on exposed tables.
- Browser clients use the Supabase publishable key only.
- Elevated Supabase keys must never be committed or exposed to the browser.

## Current Status

Pakatlah is a working MVP and has been tested across desktop, mobile browser, and iOS standalone PWA flows.

Current core flow:

```text
Create
→ Preview
→ Organizer setup
→ Publish
→ Participate
→ Review results
→ Close responses
→ Finalize
→ View final decision
```

Planned improvements include:

- Native mobile share sheet
- Optional response closing date
- Participant response editing
- Custom confirmation dialogs
- Organizer decision history
- Bahasa Melayu and English language switching
- Offline strategy and service worker caching
- Automated tests
- Versioned Supabase migrations

## Author

Built by [Ameer Ridzuan](https://github.com/ameeridz).

## License

No license has been added yet. All rights are reserved unless a license is added to this repository.
