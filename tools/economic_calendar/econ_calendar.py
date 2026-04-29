#!/usr/bin/env python3
"""
Economic Calendar CLI for US and Indonesia only.
Fetches from ForexFactory RSS.
"""
import argparse
import datetime
import sys
from urllib.request import urlopen
from xml.etree import ElementTree as ET
from rich.console import Console
from rich.table import Table
from rich import box
# import zoneinfo  # unused

console = Console()

US_COUNTRIES = ["United States", "US"]
ID_COUNTRIES = ["Indonesia", "ID"]

def parse_econ_calendar(days=7):
    url = "https://nfs.faireconomy.media/ff_calendar_thisweek.xml"
    try:
        import requests
        from bs4 import BeautifulSoup
        headers = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'}
        resp = requests.get(url, headers=headers)
        resp.raise_for_status()
        root = ET.fromstring(resp.content)
        
        events = []
        now = datetime.datetime.now(datetime.timezone.utc)
        target_date = now.date() + datetime.timedelta(days=days)
        
        for event in root.findall('.//event'):
            country = event.find('country').text
            if country not in US_COUNTRIES + ID_COUNTRIES:
                continue
                
            date_str = event.find('date').text
            event_date = datetime.datetime.strptime(date_str.split('T')[0], '%Y-%m-%d').date()
            if event_date > target_date:
                continue
                
            time = event.find('time').text or "N/A"
            currency = event.find('currency').text or ""
            impact = event.find('impact').text or ""
            event_name = event.find('event').text or ""
            actual = event.find('actual').text or ""
            forecast = event.find('forecast').text or ""
            previous = event.find('previous').text or ""
            
            # Impact icons
            impact_icon = {'1': '●', '2': '○', '3': '─'}[impact] if impact in '123' else impact
            
            events.append({
                'date': date_str.split('T')[0],
                'time': time,
                'currency': currency,
                'impact': impact_icon,
                'event': event_name[:40],  # truncate long names
                'actual': actual,
                'forecast': forecast,
                'previous': previous,
                'country': country
            })
        
        # Sort by date/time
        events.sort(key=lambda x: datetime.datetime.strptime(x['date'] + ' ' + x['time'], '%Y-%m-%d %H:%M'))
        return events
        
    except Exception as e:
        console.print(f"[red]Error fetching data: {e}[/red]")
        sys.exit(1)

def main():
    parser = argparse.ArgumentParser(description='Economic Calendar (US/ID only)')
    parser.add_argument('--days', type=int, default=7, help='Days ahead (default: 7)')
    parser.add_argument('--importance', default='high,medium', help='Filter: high,medium,all (default: high,medium)')
    args = parser.parse_args()
    
    events = parse_econ_calendar(args.days)
    
    if not events:
        console.print("[yellow]No US/ID events found.[/yellow]")
        return
    
    # Filter importance (rough: high=1, med=2)
    if args.importance != 'all':
        imp_map = {'high': '1', 'medium': '2'}
        allowed = set()
        for i in args.importance.split(','):
            if i in imp_map:
                allowed.add(imp_map[i])
        events = [e for e in events if e['impact'] in allowed]
    
    table = Table(box=box.ROUNDED)
    table.add_column("Date", style="cyan")
    table.add_column("Time", style="magenta")
    table.add_column("Country", style="green")
    table.add_column("Curr", style="yellow")
    table.add_column("Impact", style="red")
    table.add_column("Event", style="white", no_wrap=True)
    table.add_column("Actual")
    table.add_column("Forecast")
    table.add_column("Previous")
    
    for event in events:
        table.add_row(
            event['date'],
            event['time'],
            event['country'][-2:].upper(),  # US/ID
            event['currency'],
            event['impact'],
            event['event'],
            event['actual'] or "",
            event['forecast'] or "",
            event['previous'] or ""
        )
    
    console.print("\n[bold blue]Economic Calendar (US + Indonesia)[/bold blue]")
    console.print(table)

if __name__ == "__main__":
    main()

