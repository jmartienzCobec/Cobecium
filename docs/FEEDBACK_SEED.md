# Feedback feature – seed data

To load dummy feedback data so you can review list/detail, voting, comments, and filters:

## Run the seed

**From the Convex dashboard** (e.g. http://localhost:6791 for local self-hosted):

1. Open **Functions**.
2. Select the **seedFeedback** module.
3. Choose the **run** function (internal mutation).
4. Click **Run** (no arguments).
5. Check the result: `seeded: true` and `feedbackCount: 8` means 8 feedback items were inserted.

**From the CLI** (with Convex configured for your environment):

```bash
npx convex run seedFeedback:run
```

If feedback data already exists, the seed returns `seeded: false` and does not insert anything (to avoid duplicates).

## What gets seeded

- **8 feedback items**: mix of feature requests and bug reports, with varied statuses (Gathering Interest, Planned, In Progress, Complete, Closed), vote scores, and comment counts.
- **3 seed users** (Alice Chen, Bob Martinez, Carol Williams) as authors and voters.
- **Votes** on feedback items so list/detail show non-zero scores.
- **Importance ratings** on the first 5 items (for the “How important is this to you?” poll).
- **Comments** on several items, including **replies** (threaded), with like/dislike counts.
- **Subscriptions** for two items so the “Get notified” toggle shows subscribed state for seed users.

After seeding, open **Feedback** in the app to see the list, sort (Trending / Top / New), filter by board/status, open a detail page, and try voting, importance, and comments.
