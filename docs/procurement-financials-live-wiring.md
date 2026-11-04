# Procurement Financials live data

The Procurement Financials page reads the shared backend API; it no longer
uses the page's former hard-coded sample totals or vendor list.

## Data sources

- `GET /api/procurement/procurement-transactions/` supplies the amount,
  category, settlement status, and vendor ID for each transaction.
- `GET /api/procurement/vendors/` supplies vendor names and primary categories.
- Both lists are refreshed every 30 seconds. Amounts are treated as UGX and
  shown in millions, matching the page's existing display.

The frontend sums transaction amounts by category and status and joins
transactions to vendors by vendor ID. A transaction whose vendor is missing
from the vendor list is still included in financial totals and shown as
`Vendor #<id>` so it is not silently discarded.

## Backend requirement not covered by the current API

The current procurement transaction and vendor models do not expose a campus
field. The page therefore shows all returned transactions and does not offer a
campus filter. Add a campus field and filtering support to the backend API
before restoring campus-specific figures.

Configure the frontend API base URL as described in the README's API
configuration section. The backend must expose both list endpoints to the
authenticated user and return decimal amounts in UGX.
