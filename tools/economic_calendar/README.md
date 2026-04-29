# Economic Calendar CLI (US + Indonesia)

## Setup
1. cd tools/economic_calendar
2. python3 -m venv venv
3. source venv/bin/activate  (macOS/Linux)
4. pip install -r requirements.txt

## Usage
```
python econ_calendar.py [--days 7] [--importance all]
```

- `--days N`: Fetch next N days (default 7)
- `--importance high|medium|all`: Filter impact (default: high,medium)

## Example Output
```
Date       Time  Currency Impact Event                    Actual  Forecast Previous
───────── ────── ──────── ────── ─────────────────────── ─────── ──────── ────────
2024-10-01 20:30 USD     High   US Non-Farm Payrolls     254k    150k     142k
2024-10-02 13:00 IDR     Medium BI 7-Day Reverse Repo Rt 6.00%   6.00%    6.00%
```

Data from ForexFactory. Run daily for updates.

